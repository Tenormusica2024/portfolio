#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const checkerName = 'check_analytics_self_access_wiring.js';
// Keep B2B mutation fixtures representative and small for runtime. The real
// checker still scans all b2b/**/*.html when run from the repo root.
const B2B_REPRESENTATIVE_FIXTURE_HTML = [
  'index.html',
  'privacy.html',
  path.join('blog', 'fde-ai-adoption-pain-map.html'),
];

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyFixture() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'analytics-wiring-fixture-'));
  fs.mkdirSync(path.join(tmpRoot, 'scripts'), { recursive: true });
  copyFile(path.join(repoRoot, 'scripts', checkerName), path.join(tmpRoot, 'scripts', checkerName));
  copyFile(path.join(repoRoot, 'analytics-self-access-status.js'), path.join(tmpRoot, 'analytics-self-access-status.js'));

  for (const entry of fs.readdirSync(repoRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.html')) {
      copyFile(path.join(repoRoot, entry.name), path.join(tmpRoot, entry.name));
    }
  }

  for (const htmlName of B2B_REPRESENTATIVE_FIXTURE_HTML) {
    copyFile(path.join(repoRoot, 'b2b', htmlName), path.join(tmpRoot, 'b2b', htmlName));
  }
  copyFile(
    path.join(repoRoot, 'b2b', 'analytics-self-access-status.js'),
    path.join(tmpRoot, 'b2b', 'analytics-self-access-status.js'),
  );
  return tmpRoot;
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function replaceOnce(filePath, needle, replacement) {
  const current = read(filePath);
  if (needle.length === 0) {
    throw new Error('Mutation needle must not be empty');
  }
  const count = current.split(needle).length - 1;
  if (count !== 1) {
    throw new Error(`Mutation needle expected exactly once in ${path.relative(repoRoot, filePath)}, found ${count}: ${needle.slice(0, 80)}`);
  }
  write(filePath, current.replace(needle, replacement));
}

function runChecker(tmpRoot) {
  return childProcess.spawnSync(process.execPath, [path.join(tmpRoot, 'scripts', checkerName)], {
    cwd: tmpRoot,
    encoding: 'utf8',
  });
}

function assertIncludes(output, expected, label) {
  if (!output.includes(expected)) {
    throw new Error(`${label}: expected output to include "${expected}"\n--- output ---\n${output}`);
  }
}

function assertNotIncludes(output, unexpected, label) {
  if (output.includes(unexpected)) {
    throw new Error(`${label}: output unexpectedly included "${unexpected}"\n--- output ---\n${output}`);
  }
}

function runCase(name, mutate, expect) {
  const tmpRoot = copyFixture();
  try {
    mutate(tmpRoot);
    const result = runChecker(tmpRoot);
    const output = `${result.stdout || ''}${result.stderr || ''}`;
    if (result.error) {
      throw new Error(`Checker did not start: ${result.error.message}\n${output}`);
    }
    if (result.status === null) {
      throw new Error(`Checker did not exit normally; signal=${result.signal || 'unknown'}\n${output}`);
    }
    expect(result.status, output);
    console.log(`OK ${name}`);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

const B2B_SUPPRESSION_NEEDLE = `      var isLocalPreviewReferrer = /^https?:\\/\\/(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(:\\d+)?\\//.test(referrer) || referrer.indexOf('file://') === 0;

      if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {`;

function runB2bBootstrapBeforeSuppressionCase(name, insertedCode) {
  runCase(
    name,
    (tmpRoot) => {
      replaceOnce(
        path.join(tmpRoot, 'b2b', 'index.html'),
        B2B_SUPPRESSION_NEEDLE,
        B2B_SUPPRESSION_NEEDLE.replace('\n\n      if', `\n      ${insertedCode}\n\n      if`),
      );
    },
    (status, output) => {
      if (status === 0) throw new Error(`Expected checker failure for ${name}`);
      assertIncludes(output, 'b2b/index.html: B2B suppression block must return before dynamic gtag bootstrap', name);
    },
  );
}

runCase(
  'accepts C2C GA script query parameter order',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ',
      'https://www.googletagmanager.com/gtag/js?l=dataLayer&id=G-YJ1WP1J2NQ',
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success, got ${status}\n${output}`);
  },
);

runCase(
  'accepts non-GA root page with string-only config text',
  (tmpRoot) => {
    write(
      path.join(tmpRoot, 'debug-note.html'),
      `<!doctype html><html><head><script>var note = "gtag('config', 'G-YJ1WP1J2NQ')";</script></head><body>debug</body></html>`,
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success for non-GA string-only root page, got ${status}\n${output}`);
    assertNotIncludes(output, 'debug-note.html', 'string-only root page must not be classified as C2C GA page');
  },
);

runCase(
  'rejects HTTP C2C GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ',
      'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for HTTP C2C GA script URL');
    assertIncludes(output, 'index.html: C2C GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'HTTP C2C GA script');
  },
);

runCase(
  'rejects duplicate invalid C2C GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      '<head>',
      '<head>\n    <script async src="http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate invalid C2C GA script URL');
    assertIncludes(output, 'index.html: C2C GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'duplicate invalid C2C GA script');
  },
);

runCase(
  'rejects duplicate valid C2C GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      '<script async src="https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ"></script>',
      '<script async src="https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ"></script>\n    <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate valid C2C GA script URL');
    assertIncludes(output, 'index.html: C2C GA script must be loaded exactly once for G-YJ1WP1J2NQ', 'duplicate valid C2C GA script');
  },
);

runCase(
  'rejects duplicate C2C status script',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      '<script src="analytics-self-access-status.js" defer></script>',
      '<script src="analytics-self-access-status.js" defer></script>\n    <script src="analytics-self-access-status.js?v=duplicate" defer></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate C2C status script');
    assertIncludes(output, 'index.html: C2C page must load analytics-self-access-status.js exactly once', 'duplicate C2C status script');
  },
);

runCase(
  'rejects duplicate C2C gtag config call',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      "      gtag('config', 'G-YJ1WP1J2NQ', {",
      "      gtag('config', 'G-YJ1WP1J2NQ');\n      gtag('config', 'G-YJ1WP1J2NQ', {",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate C2C gtag config call');
    assertIncludes(output, 'index.html: C2C GA config must be called exactly once for G-YJ1WP1J2NQ', 'duplicate C2C gtag config call');
  },
);

runCase(
  'rejects JS-commented C2C guard and status expression',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      `        if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
          window['ga-disable-' + measurementId] = true;
          window.urayahaAnalyticsSuppressed = true;
        }`,
      `        /* if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
          window['ga-disable-' + measurementId] = true;
          window.urayahaAnalyticsSuppressed = true;
        } */
        if (shouldDisable) {
          window['ga-disable-' + measurementId] = true;
        }`,
    );
    replaceOnce(
      path.join(tmpRoot, 'analytics-self-access-status.js'),
      'var statusOk = (optOut || urlOptOut)',
      '// var statusOk = (optOut || urlOptOut)',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for JS-commented guard/status code');
    assertIncludes(output, 'C2C suppression condition must include', 'commented C2C guard');
    assertIncludes(output, 'statusOk must accept persisted opt-out or URL opt-out', 'commented statusOk');
  },
);

runCase(
  'rejects C2C guard block inside string only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      `        if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
          window['ga-disable-' + measurementId] = true;
          window.urayahaAnalyticsSuppressed = true;
        }`,
      `        var fakeGuard = "if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) { window['ga-disable-' + measurementId] = true; window.urayahaAnalyticsSuppressed = true; }";`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when C2C guard block appears only inside a string');
    assertIncludes(output, 'index.html: C2C suppression condition must include', 'C2C string-only suppression condition');
    assertIncludes(output, 'index.html: C2C guard must set ga-disable measurement flag', 'C2C string-only ga-disable flag');
    assertIncludes(output, 'index.html: C2C guard must set urayahaAnalyticsSuppressed', 'C2C string-only suppressed flag');
    assertIncludes(output, 'index.html: C2C opt-out guard must appear before the GA script/config block', 'C2C string-only guard block');
  },
);

runCase(
  'rejects C2C guard block inside uncalled helper',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      `        if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
          window['ga-disable-' + measurementId] = true;
          window.urayahaAnalyticsSuppressed = true;
        }`,
      `        function maybeSuppressAnalytics() {
          if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
            window['ga-disable-' + measurementId] = true;
            window.urayahaAnalyticsSuppressed = true;
          }
        }`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when C2C guard block is inside an uncalled helper');
    assertIncludes(output, 'index.html: C2C opt-out guard must appear before the GA script/config block', 'C2C uncalled-helper guard block');
  },
);

runCase(
  'rejects C2C optOutKey and disableKeys inside strings only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      "        var optOutKey = 'urayaha_ga_opt_out';",
      `        var optOutKeyNote = "var optOutKey = 'urayaha_ga_opt_out';";`,
    );
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      "        var disableKeys = ['ga_off', 'analytics_off', 'internal_preview', 'preview', 'no_ga', 'ga_status'];",
      `        var disableKeysNote = "var disableKeys = ['ga_off', 'analytics_off', 'internal_preview', 'preview', 'no_ga', 'ga_status'];";`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when C2C required declarations appear only inside strings');
    assertIncludes(output, 'index.html: C2C measurement page must define optOutKey as urayaha_ga_opt_out', 'C2C string-only optOutKey');
    assertIncludes(output, 'index.html: C2C guard disableKeys must include ga_status', 'C2C string-only disableKeys');
  },
);

runCase(
  'rejects status urlOptOut and statusOk inside strings only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'analytics-self-access-status.js'),
      'var urlOptOut = disableKeys.some',
      'var urlOptOutNote = "var urlOptOut = disableKeys.some";\n  var brokenUrlOptOut = false && disableKeys.some',
    );
    replaceOnce(
      path.join(tmpRoot, 'analytics-self-access-status.js'),
      'var statusOk = (optOut || urlOptOut)',
      'var statusOkNote = "var statusOk = (optOut || urlOptOut)";\n  var brokenStatusOk = false && (optOut || urlOptOut)',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when status urlOptOut/statusOk appear only inside strings');
    assertIncludes(output, 'analytics-self-access-status.js: status script must expose current-visit URL opt-out state', 'string-only urlOptOut');
    assertIncludes(output, 'analytics-self-access-status.js: statusOk must accept persisted opt-out or URL opt-out', 'string-only statusOk');
  },
);

runCase(
  'rejects C2C guard moved to module script',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      '    <script>\n      (function()',
      '    <script type="module">\n      (function()',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for deferred module C2C guard');
    assertIncludes(output, 'index.html: C2C opt-out guard must appear before the GA script/config block', 'module C2C guard');
  },
);

runCase(
  'rejects non-script page optOutKey text',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      "        var optOutKey = 'urayaha_ga_opt_out';",
      "        // var optOutKey = 'urayaha_ga_opt_out';",
    );
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      '</body>',
      "<div hidden>var optOutKey = 'urayaha_ga_opt_out';</div>\n</body>",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when page optOutKey appears only in non-script text');
    assertIncludes(output, 'index.html: C2C measurement page must define optOutKey as urayaha_ga_opt_out', 'non-script C2C optOutKey');
  },
);

runCase(
  'rejects non-executable script page optOutKey text',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      "        var optOutKey = 'urayaha_ga_opt_out';",
      "        // var optOutKey = 'urayaha_ga_opt_out';",
    );
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      '</head>',
      "<script type=\"application/ld+json\">{\"fake\":\"var optOutKey = 'urayaha_ga_opt_out';\"}</script>\n</head>",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when page optOutKey appears only in a non-executable script');
    assertIncludes(output, 'index.html: C2C measurement page must define optOutKey as urayaha_ga_opt_out', 'non-executable script C2C optOutKey');
  },
);

runCase(
  'rejects JS-commented page optOutKey declarations',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      "        var optOutKey = 'urayaha_ga_opt_out';",
      "        // var optOutKey = 'urayaha_ga_opt_out';",
    );
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "      var optOutKey = 'ezlize_ga_opt_out';",
      "      // var optOutKey = 'ezlize_ga_opt_out';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for JS-commented page optOutKey declarations');
    assertIncludes(output, 'index.html: C2C measurement page must define optOutKey as urayaha_ga_opt_out', 'commented C2C optOutKey');
    assertIncludes(output, 'b2b/index.html: B2B page must define optOutKey as ezlize_ga_opt_out', 'commented B2B optOutKey');
  },
);

runCase(
  'rejects static B2B GA script with escaped reordered query parameters',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '<head>',
      '<head>\n  <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&amp;id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for static B2B GA script');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'static B2B GA');
  },
);

runCase(
  'rejects static B2B GA script with numeric escaped query separator',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '<head>',
      '<head>\n  <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&#38;id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for static B2B GA script with numeric escaped query separator');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'numeric escaped static B2B GA');
  },
);

runCase(
  'rejects static B2B GA script with leading-zero numeric escaped query separator',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '<head>',
      '<head>\n  <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&#038;id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for static B2B GA script with leading-zero numeric escaped query separator');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'leading-zero numeric escaped static B2B GA');
  },
);

runCase(
  'rejects static B2B GA script with leading-zero hex escaped query separator',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '<head>',
      '<head>\n  <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&#x026;id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for static B2B GA script with leading-zero hex escaped query separator');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'leading-zero hex escaped static B2B GA');
  },
);

runCase(
  'rejects static B2B GA script with semicolonless numeric escaped query separator',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '<head>',
      '<head>\n  <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&#38id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for static B2B GA script with semicolonless numeric escaped query separator');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'semicolonless numeric escaped static B2B GA');
  },
);

runCase(
  'rejects static B2B GA script with semicolonless hex escaped query separator',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '<head>',
      '<head>\n  <script async src="https://www.googletagmanager.com/gtag/js?l=dataLayer&#x026id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for static B2B GA script with semicolonless hex escaped query separator');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'semicolonless hex escaped static B2B GA');
  },
);

runCase(
  'rejects protocol-relative static B2B GA script',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'privacy.html'),
      '<head>',
      '<head>\n  <script async src="//www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for protocol-relative static B2B GA script');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'protocol-relative static B2B GA');
  },
);

runCase(
  'rejects static B2B GA script when script tag has quoted greater-than attribute',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'privacy.html'),
      '<head>',
      '<head>\n  <script data-note=">" async src="https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ"></script>',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for quoted greater-than static B2B GA script');
    assertIncludes(output, 'B2B GA script must be dynamically inserted', 'quoted greater-than static B2B GA');
  },
);

runCase(
  'rejects invalid B2B dynamic GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for invalid B2B dynamic GA script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'invalid B2B dynamic GA script');
  },
);

runCase(
  'rejects HTML-escaped B2B dynamic GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?l=dataLayer&amp;id=G-YJ1WP1J2NQ';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for HTML-escaped B2B dynamic GA script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'HTML-escaped B2B dynamic GA script');
  },
);

runCase(
  'rejects semicolonless numeric escaped B2B dynamic GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?l=dataLayer&#38id=G-YJ1WP1J2NQ';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for semicolonless numeric escaped B2B dynamic GA script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'semicolonless escaped B2B dynamic GA script');
  },
);

runCase(
  'rejects B2B dynamic GA script URL inside string only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      `var note = "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';";`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B dynamic GA script URL appears only inside a string');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'B2B string-only dynamic GA script');
  },
);

runCase(
  'rejects B2B gtag config inside string only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
      `      var note = "gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });";`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B gtag config appears only inside a string');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must call gtag config exactly once', 'B2B string-only gtag config exact-once');
    assertIncludes(output, 'b2b/index.html: B2B suppression block must return before dynamic gtag bootstrap', 'B2B string-only gtag config');
  },
);

runCase(
  'rejects B2B suppression block inside string only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
        window.ezlizeAnalyticsSuppressed = true;
        return;
      }`,
      `      var fakeSuppression = "if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) { window.ezlizeAnalyticsSuppressed = true; return; }";`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B suppression block appears only inside a string');
    assertIncludes(output, 'b2b/index.html: B2B suppression condition must include', 'B2B string-only suppression condition');
    assertIncludes(output, 'b2b/index.html: B2B guard must set ezlizeAnalyticsSuppressed', 'B2B string-only suppressed flag');
    assertIncludes(output, 'b2b/index.html: B2B suppression block must return before dynamic gtag bootstrap', 'B2B string-only suppression block');
  },
);

runCase(
  'rejects B2B suppression block inside uncalled helper',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
        window.ezlizeAnalyticsSuppressed = true;
        return;
      }`,
      `      function maybeSuppressAnalytics() {
        if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
          window.ezlizeAnalyticsSuppressed = true;
          return;
        }
      }`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B suppression block is inside an uncalled helper');
    assertIncludes(output, 'b2b/index.html: B2B suppression block must return before dynamic gtag bootstrap', 'B2B uncalled-helper suppression block');
  },
);

runCase(
  'rejects B2B production host assignment inside string only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var productionHostNote = "var isProductionHost = productionHosts.includes(window.location.hostname);";',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B production host assignment appears only inside a string');
    assertIncludes(output, 'b2b/index.html: B2B guard must compute isProductionHost before suppression decision', 'B2B string-only production host assignment');
  },
);

runCase(
  'accepts B2B forbidden early return text inside string only',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var shouldDisable = disableKeys.some(function(key) { return params.has(key); });',
      '      var shouldDisable = disableKeys.some(function(key) { return params.has(key); });\n      var earlyReturnNote = "if (!productionHosts.includes(window.location.hostname)) return; if (!isProductionHost) return;";',
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success when forbidden B2B early-return text appears only inside a string, got ${status}\n${output}`);
  },
);

runCase(
  'rejects B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'B2B isProductionHost early return');
  },
);

runCase(
  'rejects spaced-not B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (! isProductionHost) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for spaced-not B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'spaced-not B2B isProductionHost early return');
  },
);

runCase(
  'rejects B2B shouldDisable early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var shouldDisable = disableKeys.some(function(key) { return params.has(key); });',
      '      var shouldDisable = disableKeys.some(function(key) { return params.has(key); });\n      if (shouldDisable) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B shouldDisable early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'B2B shouldDisable early return');
  },
);

runCase(
  'accepts unrelated early return in separate B2B inline script before guard',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `  <script>
    (function() {`,
      `  <script>
    (function() {
      if (!window.__optionalFeature) return;
    })();
  </script>
  <script>
    (function() {`,
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success for unrelated early return in separate B2B inline script before guard, got ${status}\n${output}`);
  },
);

runCase(
  'rejects B2B combined suppression early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost || shouldDisable) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B combined suppression early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'B2B combined suppression early return');
  },
);

runCase(
  'rejects B2B direct productionHosts early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!productionHosts.includes(window.location.hostname)) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B direct productionHosts early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'B2B direct productionHosts early return');
  },
);

runCase(
  'rejects braced B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) { return; }',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for braced B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'braced B2B isProductionHost early return');
  },
);

runCase(
  'rejects braced B2B direct productionHosts early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!productionHosts.includes(window.location.hostname)) { return; }',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for braced B2B direct productionHosts early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'braced B2B direct productionHosts early return');
  },
);

runCase(
  'rejects spaced B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) return ;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for spaced B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'spaced B2B isProductionHost early return');
  },
);

runCase(
  'rejects direct B2B return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for direct B2B return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'direct B2B return');
  },
);

runCase(
  'rejects return-expression B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) return false;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for return-expression B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'return-expression B2B isProductionHost early return');
  },
);

runCase(
  'rejects object-return B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      "      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) return { disabled: true };",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for object-return B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'object-return B2B isProductionHost early return');
  },
);

runCase(
  'rejects nested-block B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) { if (shouldDisable) { return; } }',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for nested-block B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'nested-block B2B isProductionHost early return');
  },
);

runCase(
  'rejects false-comparison B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (isProductionHost === false) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for false-comparison B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'false-comparison B2B isProductionHost early return');
  },
);

runCase(
  'rejects true-inequality B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (isProductionHost !== true) return;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for true-inequality B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'true-inequality B2B isProductionHost early return');
  },
);

runCase(
  'rejects commented B2B isProductionHost early return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) return /* preview */;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for commented B2B isProductionHost early return before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'commented B2B isProductionHost early return');
  },
);

runCase(
  'rejects braced B2B isProductionHost early return with preceding statement before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      "      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) { console.warn('preview'); return; }",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for braced B2B isProductionHost early return with preceding statement before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'braced B2B isProductionHost early return with preceding statement');
  },
);

runCase(
  'rejects braced B2B isProductionHost early return with object literal statement before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      "      var isProductionHost = productionHosts.includes(window.location.hostname);\n      if (!isProductionHost) { console.warn({ reason: 'preview' }); return; }",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for braced B2B isProductionHost early return with object literal statement before suppression marker');
    assertIncludes(output, 'b2b/index.html: B2B guard must not early-return before marking suppression', 'braced B2B isProductionHost early return with object literal statement');
  },
);

runCase(
  'accepts nested B2B production-host helper return before suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      '      var isProductionHost = productionHosts.includes(window.location.hostname);',
      '      var isProductionHost = productionHosts.includes(window.location.hostname);\n      function hostOkForPreview() { if (!isProductionHost) return false; return true; }\n      window.__hostOkForPreview = hostOkForPreview;',
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success when B2B production-host return appears only inside a nested helper, got ${status}\n${output}`);
  },
);

runCase(
  'accepts B2B production-host early return text after suppression marker',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
        window.ezlizeAnalyticsSuppressed = true;
        return;
      }`,
      `      if (!isProductionHost || shouldDisable || isOptedOut || isAutomation || isLocalPreviewReferrer) {
        window.ezlizeAnalyticsSuppressed = true;
        return;
      }
      if (!isProductionHost) { return; }`,
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success when B2B production-host early return appears after suppression marker, got ${status}\n${output}`);
  },
);

runCase(
  'rejects overwritten B2B dynamic GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script.src = 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for overwritten B2B dynamic GA script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'overwritten B2B dynamic GA script exact-once');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'overwritten B2B dynamic GA script');
  },
);

runCase(
  'rejects compound-assigned B2B dynamic GA script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script.src += '&debug=1';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for compound-assigned B2B dynamic GA script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'compound-assigned B2B dynamic GA script exact-once');
  },
);

runCase(
  'rejects B2B dynamic GA template-literal src overwrite',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      `${script.src = 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ'}`;",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B dynamic GA template-literal src overwrite');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must not use template literals', 'B2B template-literal src overwrite');
  },
);

runCase(
  'rejects B2B dynamic GA runtime-mutated script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ'.replace('https:', 'http:');",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B dynamic GA runtime-mutated script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'B2B runtime-mutated dynamic GA script');
  },
);

runCase(
  'rejects B2B dynamic GA reassigned URL variable',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "let url = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      url = 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script.src = url;",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B dynamic GA reassigned URL variable');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'B2B reassigned dynamic GA URL variable');
  },
);

runCase(
  'rejects B2B dynamic GA compound-mutated URL variable',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "let url = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      url += '&debug=1';\n      script.src = url;",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B dynamic GA compound-mutated URL variable');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'B2B compound-mutated dynamic GA URL variable');
  },
);

runCase(
  'rejects overwritten B2B dynamic GA script URL without semicolon',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script.src = 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ'\n      document.head.dataset.invalidGtagOverwrite = '1';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for overwritten B2B dynamic GA script URL without semicolon');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'overwritten B2B dynamic GA script without semicolon exact-once');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'overwritten B2B dynamic GA script without semicolon');
  },
);

runCase(
  'rejects overwritten B2B dynamic GA bracket script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script['src'] = 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for overwritten B2B dynamic GA bracket script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'overwritten B2B dynamic GA bracket script exact-once');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'overwritten B2B dynamic GA bracket script');
  },
);

runCase(
  'rejects overwritten B2B dynamic GA setAttribute script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script.setAttribute('src', 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ');",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for overwritten B2B dynamic GA setAttribute script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'overwritten B2B dynamic GA setAttribute script exact-once');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'overwritten B2B dynamic GA setAttribute script');
  },
);

runCase(
  'rejects overwritten B2B dynamic GA uppercase setAttribute script URL',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      script.setAttribute('SRC', 'http://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ');",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for overwritten B2B dynamic GA uppercase setAttribute script URL');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'overwritten B2B dynamic GA uppercase setAttribute exact-once');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA script must use HTTPS gtag URL for G-YJ1WP1J2NQ', 'overwritten B2B dynamic GA uppercase setAttribute script');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA bootstrap block',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });`,
      `      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA bootstrap block');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'duplicate B2B dynamic GA bootstrap');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with uppercase createElement',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var s = document.createElement('SCRIPT');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(s);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with uppercase createElement');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B uppercase createElement dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag hidden in template expression',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      \`\${(() => {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
        document.head.appendChild(s);
        return '';
      })()}\`;
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag hidden in template expression');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B template-expression dynamic GA script tag');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must not use template literals', 'duplicate B2B template-expression dynamic GA template literal');
  },
);

runCase(
  'accepts unrelated dynamic script with GA sample string',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var sample = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://example.com/unrelated.js?note=' + encodeURIComponent(sample);
      document.head.appendChild(s);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success for unrelated dynamic script with GA sample string, got ${status}\n${output}`);
  },
);

runCase(
  'accepts unrelated dynamic script with GA sample template string',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var sample = \`debug-\${Date.now()} https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ\`;
      var label = 'unrelated';
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://example.com/unrelated.js?label=' + encodeURIComponent(label + sample.length);
      document.head.appendChild(s);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success for unrelated dynamic script with GA sample template string, got ${status}\n${output}`);
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with reordered query and double quotes',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?l=dataLayer&id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag("config", "G-YJ1WP1J2NQ", { "linker": { "domains": ["ezlize.com"] } });
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with reordered query and double quotes');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B reordered/double-quote dynamic GA script tag');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must assign script.src exactly once', 'duplicate B2B reordered/double-quote dynamic GA script exact-once');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with concatenated src',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?' + 'id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with concatenated src');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B concatenated dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with multiline concatenated src',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?' +
        'id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with multiline concatenated src');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B multiline concatenated dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with split path concatenated src',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/' + 'gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with split path concatenated src');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B split path concatenated dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with one-hop URL variable',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var url = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      var script = document.createElement('script');
      script.async = true;
      script.src = url;
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with one-hop URL variable');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B one-hop URL variable dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with src-named URL variable',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      var script = document.createElement('script');
      script.async = true;
      script.src = src;
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with src-named URL variable');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B src-named URL variable dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with split id constant',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var id = 'G-YJ1WP1J2NQ';
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with split id constant');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B split id constant dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with multi-identifier static concat',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var base = 'https://www.googletagmanager.com/';
      var path = 'gtag/js?id=G-YJ1WP1J2NQ';
      var script = document.createElement('script');
      script.async = true;
      script.src = base + path;
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with multi-identifier static concat');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B multi-identifier static concat dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B dynamic GA script tag with transitive static URL variable',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>`,
      `      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
    })();
  </script>
  <script>
    (function(){
      var base = 'https://www.googletagmanager.com/';
      var path = 'gtag/js?id=G-YJ1WP1J2NQ';
      var url = base + path;
      var script = document.createElement('script');
      script.async = true;
      script.src = url;
      document.head.appendChild(script);
    })();
  </script>`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B dynamic GA script tag with transitive static URL variable');
    assertIncludes(output, 'b2b/index.html: B2B page must contain exactly one inline dynamic GA script tag', 'duplicate B2B transitive static URL variable dynamic GA script tag');
  },
);

runCase(
  'rejects duplicate B2B gtag config call',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });\n      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B gtag config call');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must call gtag config exactly once', 'duplicate B2B gtag config call');
  },
);

runCase(
  'rejects duplicate B2B window gtag config call',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });\n      window.gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B window gtag config call');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must call gtag config exactly once', 'duplicate B2B window gtag config call');
  },
);

runCase(
  'rejects duplicate B2B bracket window gtag config call',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
      "      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });\n      window['gtag']('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for duplicate B2B bracket window gtag config call');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must call gtag config exactly once', 'duplicate B2B bracket window gtag config call');
  },
);

runCase(
  'rejects B2B dynamic GA src and append on different script identifiers',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      document.head.appendChild(script);`,
      `      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';
      var other = document.createElement('script');
      other.async = true;
      document.head.appendChild(other);`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B dynamic GA src and append use different script identifiers');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must create, async, src, and append the same script element exactly once', 'B2B split identifier dynamic GA bootstrap');
  },
);

runCase(
  'rejects B2B dynamic GA property-name src target',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
      "window.probe = { script: {} };\n      window.probe.script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';",
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B dynamic GA src target is an object property named script');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must create, async, src, and append the same script element exactly once', 'B2B property-name script src target');
  },
);

runCase(
  'rejects B2B dynamic GA async false',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      'script.async = true;',
      'script.async = false;',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure when B2B dynamic GA script async is false');
    assertIncludes(output, 'b2b/index.html: B2B dynamic GA bootstrap must create, async, src, and append the same script element exactly once', 'B2B dynamic GA async false');
  },
);

runCase(
  'rejects B2B gtag config before gtag function bootstrap',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'index.html'),
      `      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });`,
      `      window.dataLayer = window.dataLayer || [];
      gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());`,
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for B2B gtag config before gtag function bootstrap');
    assertIncludes(output, 'b2b/index.html: B2B suppression block must return before dynamic gtag bootstrap', 'B2B gtag config before function bootstrap');
  },
);

[
  ['rejects B2B script element creation before suppression return', "var script = document.createElement('script');"],
  ['rejects B2B alternate script element before suppression return', "var early = document.createElement('script');\n      early.async = true;\n      early.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';\n      document.head.appendChild(early);"],
  ['rejects B2B script.async before suppression return', 'script.async = true;'],
  ['rejects B2B script.src before suppression return', "script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YJ1WP1J2NQ';"],
  ['rejects B2B appendChild before suppression return', 'document.head.appendChild(script);'],
  ['rejects B2B gtag js before suppression return', "gtag('js', new Date());"],
  ['rejects B2B double-quote gtag js before suppression return', 'gtag("js", new Date());'],
  ['rejects B2B gtag config before suppression return', "gtag('config', 'G-YJ1WP1J2NQ', { 'linker': { 'domains': ['ezlize.com'] } });"],
  ['rejects B2B dataLayer bootstrap before suppression return', 'window.dataLayer = window.dataLayer || [];'],
  ['rejects B2B gtag bootstrap before suppression return', 'function gtag(){dataLayer.push(arguments);}\n      window.gtag = gtag;'],
].forEach(([name, insertedCode]) => runB2bBootstrapBeforeSuppressionCase(name, insertedCode));

runCase(
  'rejects fake src inside another attribute value',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'privacy.html'),
      'src="/analytics-self-access-status.js"',
      'data-note=" src=\'/analytics-self-access-status.js\'"',
    );
  },
  (status, output) => {
    if (status === 0) throw new Error('Expected checker failure for fake status src attribute');
    assertIncludes(output, 'b2b/privacy.html: B2B page must load /analytics-self-access-status.js', 'fake src');
  },
);

runCase(
  'accepts status script cachebuster and uppercase SRC',
  (tmpRoot) => {
    replaceOnce(
      path.join(tmpRoot, 'index.html'),
      'src="analytics-self-access-status.js"',
      "SRC = 'analytics-self-access-status.js?v=test'",
    );
    replaceOnce(
      path.join(tmpRoot, 'b2b', 'privacy.html'),
      'src="/analytics-self-access-status.js"',
      "SRC = '/analytics-self-access-status.js?v=test'",
    );
  },
  (status, output) => {
    if (status !== 0) throw new Error(`Expected success for cachebuster/uppercase SRC, got ${status}\n${output}`);
    assertNotIncludes(output, 'must load analytics-self-access-status.js', 'C2C cachebuster SRC');
    assertNotIncludes(output, 'must load /analytics-self-access-status.js', 'B2B cachebuster SRC');
  },
);

console.log('Analytics self-access wiring mutation tests OK');
