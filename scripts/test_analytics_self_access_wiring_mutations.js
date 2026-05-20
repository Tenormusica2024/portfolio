#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const checkerName = 'check_analytics_self_access_wiring.js';

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

  fs.cpSync(path.join(repoRoot, 'b2b'), path.join(tmpRoot, 'b2b'), { recursive: true });
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
