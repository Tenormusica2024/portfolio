#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const b2bDir = path.join(repoRoot, 'b2b');

const C2C_STATUS_SCRIPT = 'analytics-self-access-status.js';
const B2B_STATUS_SCRIPT = '/analytics-self-access-status.js';
const C2C_MEASUREMENT_ID = 'G-YJ1WP1J2NQ';
const B2B_MEASUREMENT_ID = 'G-YJ1WP1J2NQ';
const C2C_OPT_OUT_KEY = 'urayaha_ga_opt_out';
const B2B_OPT_OUT_KEY = 'ezlize_ga_opt_out';
const C2C_ROOT_SCOPE_NOTE = 'root C2C pages only; demo/subdirectory GA pages require a separate scope decision';
const REQUIRED_SUPPRESSION_TERMS = [
  '!isProductionHost',
  'shouldDisable',
  'isOptedOut',
  'isAutomation',
  'isLocalPreviewReferrer',
];
const EXPECTED_C2C_GA_PAGES = new Set([
  'archive.html',
  'code-reviewer-system.html',
  'contact.html',
  'creation.html',
  'index.html',
  'presentations.html',
  'privacy.html',
  'profile.html',
  'projects.html',
]);

function toRel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listHtmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(entryPath);
      if (entry.isFile() && entry.name.endsWith('.html')) return [entryPath];
      return [];
    })
    .sort();
}

function rootHtmlFiles() {
  return fs.readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(repoRoot, entry.name))
    .sort();
}

function hasDisableKey(html, key) {
  return new RegExp(`var\\s+disableKeys\\s*=\\s*\\[[\\s\\S]*?['"]${key}['"][\\s\\S]*?\\]`, 'u').test(html);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function hasOptOutKey(html, key) {
  return new RegExp(`var\\s+optOutKey\\s*=\\s*['"]${escapeRegExp(key)}['"]\\s*;`, 'u').test(html);
}

function maskHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/gu, (comment) => ' '.repeat(comment.length));
}

function maskJavaScriptComments(source) {
  let result = '';
  let index = 0;
  let stringQuote = null;
  let escaped = false;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (stringQuote !== null) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === stringQuote) {
        stringQuote = null;
      }
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      stringQuote = char;
      result += char;
      index += 1;
      continue;
    }

    if (char === '/' && next === '/') {
      result += '  ';
      index += 2;
      while (index < source.length && source[index] !== '\n') {
        result += ' ';
        index += 1;
      }
      continue;
    }

    if (char === '/' && next === '*') {
      result += '  ';
      index += 2;
      while (index < source.length) {
        if (source[index] === '*' && source[index + 1] === '/') {
          result += '  ';
          index += 2;
          break;
        }
        result += source[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      continue;
    }

    result += char;
    index += 1;
  }

  return result;
}

function getScriptAttribute(attrs, targetName) {
  let index = 0;
  while (index < attrs.length) {
    while (index < attrs.length && /\s/u.test(attrs[index])) index += 1;

    const nameStart = index;
    while (index < attrs.length && !/[\s=]/u.test(attrs[index])) index += 1;
    const name = attrs.slice(nameStart, index).toLowerCase();
    while (index < attrs.length && /\s/u.test(attrs[index])) index += 1;

    if (attrs[index] !== '=') continue;
    index += 1;
    while (index < attrs.length && /\s/u.test(attrs[index])) index += 1;

    const quote = attrs[index];
    let value = '';
    if (quote === '"' || quote === "'") {
      index += 1;
      const valueStart = index;
      while (index < attrs.length && attrs[index] !== quote) index += 1;
      value = attrs.slice(valueStart, index);
      if (index < attrs.length) index += 1;
    } else {
      const valueStart = index;
      while (index < attrs.length && !/\s/u.test(attrs[index])) index += 1;
      value = attrs.slice(valueStart, index);
    }

    if (name === targetName.toLowerCase()) return value;
  }

  return null;
}

function getScriptSrcAttribute(attrs) {
  return getScriptAttribute(attrs, 'src');
}

function getScriptTypeAttribute(attrs) {
  return getScriptAttribute(attrs, 'type');
}

function isExecutableScriptType(type) {
  if (type === null) return true;
  const normalized = type.split(';')[0].trim().toLowerCase();
  if (normalized === '' || normalized === 'module') return true;
  return [
    'text/javascript',
    'application/javascript',
    'application/ecmascript',
    'text/ecmascript',
    'application/x-javascript',
  ].includes(normalized);
}

function isClassicExecutableScriptType(type) {
  if (type === null) return true;
  const normalized = type.split(';')[0].trim().toLowerCase();
  return normalized === '' || [
    'text/javascript',
    'application/javascript',
    'application/ecmascript',
    'text/ecmascript',
    'application/x-javascript',
  ].includes(normalized);
}

function scriptTags(html) {
  const htmlWithoutComments = maskHtmlComments(html);
  return [...htmlWithoutComments.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)]
    .map((match) => ({
      index: match.index,
      src: getScriptSrcAttribute(match[1]),
      type: getScriptTypeAttribute(match[1]),
      content: match[2],
    }));
}

function scriptSrcEntries(html) {
  return scriptTags(html)
    .filter((tag) => tag.src && isExecutableScriptType(tag.type))
    .map(({ index, src }) => ({ index, src }));
}

function scriptSrcValues(html) {
  return scriptSrcEntries(html).map(({ src }) => src);
}

function scriptSrcMatches(actual, expected) {
  const normalizedActual = actual.replace(/&amp;/giu, '&');
  if (normalizedActual === expected) return true;
  if (expected.includes('?')) return normalizedActual.startsWith(`${expected}&`);
  return normalizedActual.startsWith(`${expected}?`);
}

function parseScriptUrl(actual) {
  const normalized = actual.replace(/&amp;/giu, '&');
  return normalized.startsWith('//')
    ? new URL(normalized, 'https://example.invalid')
    : new URL(normalized);
}

function isHttpsGtagScriptSrcForMeasurement(actual, measurementId) {
  try {
    const url = parseScriptUrl(actual);
    return !actual.replace(/&amp;/giu, '&').startsWith('//')
      && url.protocol === 'https:'
      && url.hostname === 'www.googletagmanager.com'
      && url.pathname === '/gtag/js'
      && url.searchParams.get('id') === measurementId;
  } catch (_) {
    return false;
  }
}

function isAnyGtagScriptSrcForMeasurement(actual, measurementId) {
  try {
    const url = parseScriptUrl(actual);
    return (url.protocol === 'https:' || url.protocol === 'http:')
      && url.hostname === 'www.googletagmanager.com'
      && url.pathname === '/gtag/js'
      && url.searchParams.get('id') === measurementId;
  } catch (_) {
    return false;
  }
}

function hasScriptTagSrc(html, src) {
  return scriptSrcValues(html).some((actual) => scriptSrcMatches(actual, src));
}

function countScriptTagSrc(html, src) {
  return scriptSrcValues(html).filter((actual) => scriptSrcMatches(actual, src)).length;
}

function inlineScriptEntries(html, options = {}) {
  const { classicOnly = false } = options;
  return scriptTags(html)
    .filter((tag) => !tag.src && (classicOnly ? isClassicExecutableScriptType(tag.type) : isExecutableScriptType(tag.type)))
    .map((tag) => ({
      index: tag.index,
      content: maskJavaScriptComments(tag.content),
    }));
}

function inlineScripts(html) {
  return inlineScriptEntries(html).map((tag) => tag.content);
}

function inlineExecutableScriptSource(html) {
  return inlineScripts(html).join('\n');
}

function conditionHasExplicitOrChain(condition, requiredTerms) {
  const normalized = condition.replace(/\s+/gu, ' ').trim();
  const terms = normalized.split('||')
    .map((term) => term.trim())
    .filter(Boolean);
  return requiredTerms.every((term) => terms.includes(term));
}

function hasSuppressionCondition(jsSource, requiredTerms) {
  const match = jsSource.match(/if\s*\(([^(){};]*?)\)\s*\{\s*(?:window\[['"]ga-disable-|window\.ezlizeAnalyticsSuppressed)/u);
  if (!match) return false;
  return conditionHasExplicitOrChain(match[1], requiredTerms);
}

function usesC2cMeasurement(html) {
  return scriptSrcValues(html).some((src) => isAnyGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID))
    || new RegExp(`gtag\\(['"]config['"]\\s*,\\s*['"]${escapeRegExp(C2C_MEASUREMENT_ID)}['"]`, 'u').test(inlineExecutableScriptSource(html));
}

function findInlineScriptMatch(html, pattern, predicate = () => true, options = {}) {
  for (const tag of inlineScriptEntries(html, options)) {
    const match = tag.content.match(pattern);
    if (match && predicate(match)) {
      return {
        index: tag.index + match.index,
        match,
      };
    }
  }
  return null;
}

function hasC2cGuardBeforeGa(html) {
  const blockEntry = findInlineScriptMatch(
    html,
    /if\s*\(([^(){};]*?)\)\s*\{\s*window\['ga-disable-' \+ measurementId\] = true;\s*window\.urayahaAnalyticsSuppressed = true;\s*\}/u,
    (match) => conditionHasExplicitOrChain(match[1], REQUIRED_SUPPRESSION_TERMS),
    { classicOnly: true },
  );
  const gaScriptEntry = scriptSrcEntries(html)
    .find((entry) => isHttpsGtagScriptSrcForMeasurement(entry.src, C2C_MEASUREMENT_ID));
  const gaConfigEntry = findInlineScriptMatch(
    html,
    new RegExp(`gtag\\(['"]config['"]\\s*,\\s*['"]${escapeRegExp(C2C_MEASUREMENT_ID)}['"]`, 'u'),
  );

  return blockEntry !== null
    && gaScriptEntry !== undefined
    && gaConfigEntry !== null
    && blockEntry.index < gaScriptEntry.index
    && blockEntry.index < gaConfigEntry.index;
}

function scriptHasB2bSuppressionReturnBeforeGtag(script) {
  const blockMatch = script.match(/if\s*\(([^(){};]*?)\)\s*\{\s*window\.ezlizeAnalyticsSuppressed = true;\s*return;\s*\}/u);
  const scriptIndex = script.indexOf("var script = document.createElement('script')");
  const configIndex = script.indexOf(`gtag('config', '${B2B_MEASUREMENT_ID}'`);

  return blockMatch !== null
    && conditionHasExplicitOrChain(blockMatch[1], REQUIRED_SUPPRESSION_TERMS)
    && scriptIndex !== -1
    && configIndex !== -1
    && blockMatch.index < scriptIndex
    && blockMatch.index < configIndex;
}

function hasB2bSuppressionReturnBeforeGtag(html) {
  const b2bGaScripts = inlineScripts(html)
    .filter((script) => script.includes(`googletagmanager.com/gtag/js?id=${B2B_MEASUREMENT_ID}`)
      || script.includes(`gtag('config', '${B2B_MEASUREMENT_ID}'`));

  return b2bGaScripts.length > 0
    && b2bGaScripts.every((script) => scriptHasB2bSuppressionReturnBeforeGtag(script));
}

function checkC2cPage(filePath, html) {
  const errors = [];
  const rel = toRel(filePath);
  const scriptSource = inlineExecutableScriptSource(html);

  if (!hasOptOutKey(scriptSource, C2C_OPT_OUT_KEY)) {
    errors.push(`${rel}: C2C measurement page must define optOutKey as ${C2C_OPT_OUT_KEY}`);
  }
  if (!hasDisableKey(scriptSource, 'ga_status')) {
    errors.push(`${rel}: C2C guard disableKeys must include ga_status`);
  }
  if (!hasSuppressionCondition(scriptSource, REQUIRED_SUPPRESSION_TERMS)) {
    errors.push(`${rel}: C2C suppression condition must include ${REQUIRED_SUPPRESSION_TERMS.join(', ')}`);
  }
  if (!scriptSource.includes("window['ga-disable-' + measurementId] = true")) {
    errors.push(`${rel}: C2C guard must set ga-disable measurement flag`);
  }
  if (!scriptSource.includes('window.urayahaAnalyticsSuppressed = true')) {
    errors.push(`${rel}: C2C guard must set urayahaAnalyticsSuppressed`);
  }
  if (!hasScriptTagSrc(html, C2C_STATUS_SCRIPT)) {
    errors.push(`${rel}: C2C page must load ${C2C_STATUS_SCRIPT}`);
  }
  if (hasScriptTagSrc(html, `/${C2C_STATUS_SCRIPT}`)) {
    errors.push(`${rel}: C2C status script must stay relative for GitHub Pages /portfolio/ deployment`);
  }
  const invalidC2cGtagRefs = scriptSrcValues(html)
    .filter((src) => isAnyGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID)
      && !isHttpsGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID));
  if (invalidC2cGtagRefs.length > 0) {
    errors.push(`${rel}: C2C GA script must use HTTPS gtag URL for ${C2C_MEASUREMENT_ID}`);
  }
  if (!hasC2cGuardBeforeGa(html)) {
    errors.push(`${rel}: C2C opt-out guard must appear before the GA script/config block`);
  }

  return errors;
}

function checkB2bPage(filePath, html) {
  const errors = [];
  const rel = toRel(filePath);
  const scriptSource = inlineExecutableScriptSource(html);

  if (!hasDisableKey(scriptSource, 'ga_status')) {
    errors.push(`${rel}: B2B guard disableKeys must include ga_status`);
  }
  if (!hasOptOutKey(scriptSource, B2B_OPT_OUT_KEY)) {
    errors.push(`${rel}: B2B page must define optOutKey as ${B2B_OPT_OUT_KEY}`);
  }
  if (!scriptSource.includes('var isProductionHost = productionHosts.includes(window.location.hostname);')) {
    errors.push(`${rel}: B2B guard must compute isProductionHost before suppression decision`);
  }
  if (/if\s*\(\s*!productionHosts\.includes\(window\.location\.hostname\)\s*\)\s*return;/u.test(scriptSource)) {
    errors.push(`${rel}: B2B guard must not early-return before marking suppression`);
  }
  if (!hasSuppressionCondition(scriptSource, REQUIRED_SUPPRESSION_TERMS)) {
    errors.push(`${rel}: B2B suppression condition must include ${REQUIRED_SUPPRESSION_TERMS.join(', ')}`);
  }
  if (!scriptSource.includes('window.ezlizeAnalyticsSuppressed = true')) {
    errors.push(`${rel}: B2B guard must set ezlizeAnalyticsSuppressed`);
  }
  if (scriptSrcValues(html).some((src) => isAnyGtagScriptSrcForMeasurement(src, B2B_MEASUREMENT_ID))) {
    errors.push(`${rel}: B2B GA script must be dynamically inserted after the suppression return, not loaded by a static script tag`);
  }
  if (!hasB2bSuppressionReturnBeforeGtag(html)) {
    errors.push(`${rel}: B2B suppression block must return before dynamic gtag script insertion`);
  }
  if (!hasScriptTagSrc(html, B2B_STATUS_SCRIPT)) {
    errors.push(`${rel}: B2B page must load ${B2B_STATUS_SCRIPT}`);
  }
  const invalidB2bStatusRefs = scriptSrcValues(html)
    .filter((src) => src.includes('analytics-self-access-status.js')
      && !scriptSrcMatches(src, B2B_STATUS_SCRIPT));
  if (invalidB2bStatusRefs.length > 0) {
    errors.push(`${rel}: B2B status script must be root-absolute, not relative`);
  }

  return errors;
}

function checkStatusScript(filePath, html, expected) {
  const errors = [];
  const rel = toRel(filePath);
  const executableJs = maskJavaScriptComments(html);

  for (const token of expected.tokens) {
    if (!executableJs.includes(token)) {
      errors.push(`${rel}: status script missing ${token}`);
    }
  }
  if (!hasOptOutKey(executableJs, expected.optOutKey)) {
    errors.push(`${rel}: status script must define optOutKey as ${expected.optOutKey}`);
  }
  if (!hasDisableKey(executableJs, 'ga_status')) {
    errors.push(`${rel}: status script disableKeys must include ga_status`);
  }
  if (!executableJs.includes('var urlOptOut = disableKeys.some')) {
    errors.push(`${rel}: status script must expose current-visit URL opt-out state`);
  }
  if (!executableJs.includes('var statusOk = (optOut || urlOptOut)')) {
    errors.push(`${rel}: statusOk must accept persisted opt-out or URL opt-out`);
  }

  return errors;
}

const errors = [];

const rootPages = rootHtmlFiles()
  .map((filePath) => ({ filePath, html: read(filePath) }));
const c2cPages = rootPages
  .filter(({ html }) => usesC2cMeasurement(html));
const actualC2cNames = new Set(c2cPages.map(({ filePath }) => path.basename(filePath)));

for (const expected of EXPECTED_C2C_GA_PAGES) {
  if (!actualC2cNames.has(expected)) {
    errors.push(`C2C expected GA page is missing from measurement scan: ${expected}`);
  }
}

for (const actual of actualC2cNames) {
  if (!EXPECTED_C2C_GA_PAGES.has(actual)) {
    errors.push(`C2C measurement page is not in the expected guard list: ${actual}`);
  }
}

for (const { filePath, html } of c2cPages) {
  errors.push(...checkC2cPage(filePath, html));
}

const b2bPages = listHtmlFiles(b2bDir)
  .filter((filePath) => path.basename(filePath) !== 'analytics-self-access-status.js');

for (const filePath of b2bPages) {
  errors.push(...checkB2bPage(filePath, read(filePath)));
}

errors.push(...checkStatusScript(
  path.join(repoRoot, 'analytics-self-access-status.js'),
  read(path.join(repoRoot, 'analytics-self-access-status.js')),
  {
    optOutKey: C2C_OPT_OUT_KEY,
    tokens: [
      'URAYAHA_GA_STATUS',
      'C2C_URL_OPT_OUT',
      'C2C_SUPPRESSED',
      'C2C_GA_DISABLE',
    ],
  },
));

errors.push(...checkStatusScript(
  path.join(b2bDir, 'analytics-self-access-status.js'),
  read(path.join(b2bDir, 'analytics-self-access-status.js')),
  {
    optOutKey: B2B_OPT_OUT_KEY,
    tokens: [
      'EZLIZE_GA_STATUS',
      'B2B_URL_OPT_OUT',
      'B2B_SUPPRESSED',
      'B2B_GTAG_FUNCTION',
      'B2B_GTAG_SCRIPT_PRESENT',
    ],
  },
));

const b2bStatusRefs = b2bPages
  .map((filePath) => read(filePath))
  .reduce((sum, html) => sum + countScriptTagSrc(html, B2B_STATUS_SCRIPT), 0);

if (b2bStatusRefs !== b2bPages.length) {
  errors.push(`B2B status script reference count mismatch: expected ${b2bPages.length}, found ${b2bStatusRefs}`);
}

if (errors.length > 0) {
  console.error('Analytics self-access wiring check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Analytics self-access wiring OK: root_c2c_pages=${c2cPages.length} b2b_pages=${b2bPages.length} scope="${C2C_ROOT_SCOPE_NOTE}"`);
