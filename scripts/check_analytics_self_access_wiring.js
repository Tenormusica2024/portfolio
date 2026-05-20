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

function conditionHasExplicitOrChain(condition, requiredTerms) {
  const normalized = condition.replace(/\s+/gu, ' ').trim();
  const terms = normalized.split('||')
    .map((term) => term.trim())
    .filter(Boolean);
  return requiredTerms.every((term) => terms.includes(term));
}

function hasSuppressionCondition(html, requiredTerms) {
  const match = html.match(/if\s*\(([^(){};]*?)\)\s*\{\s*(?:window\[['"]ga-disable-|window\.ezlizeAnalyticsSuppressed)/u);
  if (!match) return false;
  return conditionHasExplicitOrChain(match[1], requiredTerms);
}

function countMatches(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function usesC2cMeasurement(html) {
  return html.includes(C2C_MEASUREMENT_ID)
    || html.includes(`googletagmanager.com/gtag/js?id=${C2C_MEASUREMENT_ID}`);
}

function hasC2cGuardBeforeGa(html) {
  const blockMatch = html.match(/if\s*\(([^(){};]*?)\)\s*\{\s*window\['ga-disable-' \+ measurementId\] = true;\s*window\.urayahaAnalyticsSuppressed = true;\s*\}/u);
  const gaScriptIndex = html.indexOf(`googletagmanager.com/gtag/js?id=${C2C_MEASUREMENT_ID}`);
  const gaConfigIndex = html.indexOf(`gtag('config', '${C2C_MEASUREMENT_ID}'`);

  return blockMatch !== null
    && conditionHasExplicitOrChain(blockMatch[1], ['!isProductionHost', 'shouldDisable', 'isOptedOut'])
    && gaScriptIndex !== -1
    && gaConfigIndex !== -1
    && blockMatch.index < gaScriptIndex
    && blockMatch.index < gaConfigIndex;
}

function hasB2bSuppressionReturnBeforeGtag(html) {
  const inlineScripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu)]
    .map((match) => match[1]);

  return inlineScripts.some((script) => {
    const blockMatch = script.match(/if\s*\(([^(){};]*?)\)\s*\{\s*window\.ezlizeAnalyticsSuppressed = true;\s*return;\s*\}/u);
    const scriptIndex = script.indexOf("var script = document.createElement('script')");
    const configIndex = script.indexOf(`gtag('config', '${B2B_MEASUREMENT_ID}'`);

    return blockMatch !== null
      && conditionHasExplicitOrChain(blockMatch[1], ['!isProductionHost', 'shouldDisable', 'isOptedOut'])
      && scriptIndex !== -1
      && configIndex !== -1
      && blockMatch.index < scriptIndex
      && blockMatch.index < configIndex;
  });
}

function checkC2cPage(filePath, html) {
  const errors = [];
  const rel = toRel(filePath);

  if (!hasOptOutKey(html, C2C_OPT_OUT_KEY)) {
    errors.push(`${rel}: C2C measurement page must define optOutKey as ${C2C_OPT_OUT_KEY}`);
  }
  if (!hasDisableKey(html, 'ga_status')) {
    errors.push(`${rel}: C2C guard disableKeys must include ga_status`);
  }
  if (!hasSuppressionCondition(html, ['!isProductionHost', 'shouldDisable', 'isOptedOut'])) {
    errors.push(`${rel}: C2C suppression condition must include !isProductionHost, shouldDisable, and isOptedOut`);
  }
  if (!html.includes("window['ga-disable-' + measurementId] = true")) {
    errors.push(`${rel}: C2C guard must set ga-disable measurement flag`);
  }
  if (!html.includes('window.urayahaAnalyticsSuppressed = true')) {
    errors.push(`${rel}: C2C guard must set urayahaAnalyticsSuppressed`);
  }
  if (!html.includes(`src="${C2C_STATUS_SCRIPT}"`)) {
    errors.push(`${rel}: C2C page must load ${C2C_STATUS_SCRIPT}`);
  }
  if (html.includes(`src="/${C2C_STATUS_SCRIPT}"`)) {
    errors.push(`${rel}: C2C status script must stay relative for GitHub Pages /portfolio/ deployment`);
  }
  if (!hasC2cGuardBeforeGa(html)) {
    errors.push(`${rel}: C2C opt-out guard must appear before the GA script/config block`);
  }

  return errors;
}

function checkB2bPage(filePath, html) {
  const errors = [];
  const rel = toRel(filePath);

  if (!hasDisableKey(html, 'ga_status')) {
    errors.push(`${rel}: B2B guard disableKeys must include ga_status`);
  }
  if (!hasOptOutKey(html, B2B_OPT_OUT_KEY)) {
    errors.push(`${rel}: B2B page must define optOutKey as ${B2B_OPT_OUT_KEY}`);
  }
  if (!html.includes('var isProductionHost = productionHosts.includes(window.location.hostname);')) {
    errors.push(`${rel}: B2B guard must compute isProductionHost before suppression decision`);
  }
  if (/if\s*\(\s*!productionHosts\.includes\(window\.location\.hostname\)\s*\)\s*return;/u.test(html)) {
    errors.push(`${rel}: B2B guard must not early-return before marking suppression`);
  }
  if (!hasSuppressionCondition(html, ['!isProductionHost', 'shouldDisable', 'isOptedOut'])) {
    errors.push(`${rel}: B2B suppression condition must include !isProductionHost, shouldDisable, and isOptedOut`);
  }
  if (!html.includes('window.ezlizeAnalyticsSuppressed = true')) {
    errors.push(`${rel}: B2B guard must set ezlizeAnalyticsSuppressed`);
  }
  if (!hasB2bSuppressionReturnBeforeGtag(html)) {
    errors.push(`${rel}: B2B suppression block must return before dynamic gtag script insertion`);
  }
  if (!html.includes(`src="${B2B_STATUS_SCRIPT}"`)) {
    errors.push(`${rel}: B2B page must load ${B2B_STATUS_SCRIPT}`);
  }
  if (/src="(?:\.\.\/)?analytics-self-access-status\.js"/u.test(html)) {
    errors.push(`${rel}: B2B status script must be root-absolute, not relative`);
  }

  return errors;
}

function checkStatusScript(filePath, html, expected) {
  const errors = [];
  const rel = toRel(filePath);

  for (const token of expected.tokens) {
    if (!html.includes(token)) {
      errors.push(`${rel}: status script missing ${token}`);
    }
  }
  if (!hasOptOutKey(html, expected.optOutKey)) {
    errors.push(`${rel}: status script must define optOutKey as ${expected.optOutKey}`);
  }
  if (!hasDisableKey(html, 'ga_status')) {
    errors.push(`${rel}: status script disableKeys must include ga_status`);
  }
  if (!html.includes('var urlOptOut = disableKeys.some')) {
    errors.push(`${rel}: status script must expose current-visit URL opt-out state`);
  }
  if (!html.includes('var statusOk = (optOut || urlOptOut)')) {
    errors.push(`${rel}: statusOk must accept persisted opt-out or URL opt-out`);
  }

  return errors;
}

const errors = [];

const rootPages = rootHtmlFiles()
  .map((filePath) => ({ filePath, html: read(filePath) }))
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
  .reduce((sum, html) => sum + countMatches(html, /analytics-self-access-status\.js/gu), 0);

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

console.log(`Analytics self-access wiring OK: c2c_pages=${c2cPages.length} b2b_pages=${b2bPages.length}`);
