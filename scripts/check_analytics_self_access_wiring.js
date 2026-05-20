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
  return executableRegexIndex(
    html,
    new RegExp(`var\\s+disableKeys\\s*=\\s*\\[[\\s\\S]*?['"]${key}['"][\\s\\S]*?\\]`, 'u'),
  ) !== -1;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function hasOptOutKey(html, key) {
  return executableRegexIndex(
    html,
    new RegExp(`var\\s+optOutKey\\s*=\\s*['"]${escapeRegExp(key)}['"]\\s*;`, 'u'),
  ) !== -1;
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
  return [...htmlWithoutComments.matchAll(/<script\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)<\/script>/giu)]
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

function decodeHtmlScriptUrlEntities(actual) {
  return actual.replace(/&(?:amp;|#0*38;?(?!\d)|#x0*26;?(?![0-9a-f]))/giu, '&');
}

function scriptSrcMatches(actual, expected) {
  const normalizedActual = decodeHtmlScriptUrlEntities(actual);
  if (normalizedActual === expected) return true;
  if (expected.includes('?')) return normalizedActual.startsWith(`${expected}&`);
  return normalizedActual.startsWith(`${expected}?`);
}

function parseScriptUrl(actual, { decodeHtmlEntities = false } = {}) {
  const normalized = decodeHtmlEntities ? decodeHtmlScriptUrlEntities(actual) : actual;
  return normalized.startsWith('//')
    ? new URL(normalized, 'https://example.invalid')
    : new URL(normalized);
}

function isGtagScriptSrcForMeasurement(actual, measurementId, options = {}) {
  const {
    decodeHtmlEntities = false,
    requireHttps = false,
    rejectHtmlEntities = false,
  } = options;

  if (rejectHtmlEntities && /&(?:amp;|#0*38;?(?!\d)|#x0*26;?(?![0-9a-f]))/iu.test(actual)) return false;

  try {
    const normalizedActual = decodeHtmlEntities ? decodeHtmlScriptUrlEntities(actual) : actual;
    const url = parseScriptUrl(actual, { decodeHtmlEntities });
    return (!requireHttps || !normalizedActual.startsWith('//'))
      && (requireHttps ? url.protocol === 'https:' : (url.protocol === 'https:' || url.protocol === 'http:'))
      && url.hostname === 'www.googletagmanager.com'
      && url.pathname === '/gtag/js'
      && url.searchParams.get('id') === measurementId;
  } catch (_) {
    return false;
  }
}

function isHttpsHtmlGtagScriptSrcForMeasurement(actual, measurementId) {
  return isGtagScriptSrcForMeasurement(actual, measurementId, {
    decodeHtmlEntities: true,
    requireHttps: true,
  });
}

function isAnyHtmlGtagScriptSrcForMeasurement(actual, measurementId) {
  return isGtagScriptSrcForMeasurement(actual, measurementId, {
    decodeHtmlEntities: true,
  });
}

function isHttpsJsLiteralGtagScriptSrcForMeasurement(actual, measurementId) {
  return isGtagScriptSrcForMeasurement(actual, measurementId, {
    requireHttps: true,
    rejectHtmlEntities: true,
  });
}

function isAnyJsLiteralGtagScriptSrcForMeasurement(actual, measurementId) {
  return isGtagScriptSrcForMeasurement(actual, measurementId);
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
  const entry = executableRegexEntry(
    jsSource,
    /if\s*\(([^(){};]*?)\)\s*\{\s*(?:window\[['"]ga-disable-|window\.ezlizeAnalyticsSuppressed)/u,
  );
  if (!entry) return false;
  return conditionHasExplicitOrChain(entry.match[1], requiredTerms);
}

function usesC2cMeasurement(html) {
  return scriptSrcValues(html).some((src) => isAnyHtmlGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID))
    || executableRegexIndex(inlineExecutableScriptSource(html), gtagConfigPattern(C2C_MEASUREMENT_ID)) !== -1;
}

function findInlineScriptMatch(html, pattern, predicate = () => true, options = {}) {
  for (const tag of inlineScriptEntries(html, options)) {
    const entry = executableRegexEntry(tag.content, pattern);
    if (entry && predicate(entry.match, entry, tag.content)) {
      return {
        index: tag.index + entry.index,
        match: entry.match,
      };
    }
  }
  return null;
}

function hasC2cGuardBeforeGa(html) {
  const blockEntry = findInlineScriptMatch(
    html,
    /if\s*\(([^(){};]*?)\)\s*\{\s*window\['ga-disable-' \+ measurementId\] = true;\s*window\.urayahaAnalyticsSuppressed = true;\s*\}/u,
    (match, entry, script) => conditionHasExplicitOrChain(match[1], REQUIRED_SUPPRESSION_TERMS)
      && executableBraceDepthAt(script, entry.index) === executableBraceDepthAt(
        script,
        executableIndexOf(script, `var measurementId = '${C2C_MEASUREMENT_ID}'`),
      ),
    { classicOnly: true },
  );
  const gaScriptEntry = scriptSrcEntries(html)
    .find((entry) => isHttpsHtmlGtagScriptSrcForMeasurement(entry.src, C2C_MEASUREMENT_ID));
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
  const blockEntry = executableRegexEntry(
    script,
    /if\s*\(([^(){};]*?)\)\s*\{\s*window\.ezlizeAnalyticsSuppressed = true;\s*return;\s*\}/u,
  );
  const b2bScriptRecord = b2bGtagScriptLifecycleRecord(script);
  const scriptIndex = b2bScriptRecord ? b2bScriptRecord.createIndex : -1;
  const scriptAsyncIndex = b2bScriptRecord ? b2bScriptRecord.asyncIndex : -1;
  const scriptSrcIndex = b2bScriptRecord ? b2bScriptRecord.srcIndex : -1;
  const appendScriptIndex = b2bScriptRecord ? b2bScriptRecord.appendIndex : -1;
  const dataLayerIndex = executableIndexOf(script, 'window.dataLayer = window.dataLayer || []');
  const gtagFunctionIndex = executableRegexIndex(script, /function\s+gtag\s*\(/u);
  const windowGtagIndex = executableIndexOf(script, 'window.gtag = gtag');
  const gtagJsIndex = executableRegexIndex(script, gtagJsPattern());
  const configIndex = executableRegexIndex(script, gtagConfigPattern(B2B_MEASUREMENT_ID));
  const bootstrapIndexes = [
    scriptIndex,
    scriptAsyncIndex,
    scriptSrcIndex,
    appendScriptIndex,
    dataLayerIndex,
    gtagFunctionIndex,
    windowGtagIndex,
    gtagJsIndex,
    configIndex,
  ];

  return blockEntry !== null
    && conditionHasExplicitOrChain(blockEntry.match[1], REQUIRED_SUPPRESSION_TERMS)
    && bootstrapIndexes.every((index) => executableBraceDepthAt(script, index) === executableBraceDepthAt(script, blockEntry.index))
    && bootstrapIndexes.every((index) => index !== -1 && blockEntry.index < index)
    && indexesStrictlyIncreasing(bootstrapIndexes);
}

function b2bGaInlineScripts(html) {
  // Use executable code-aware checks here: URL/config text inside strings should
  // make the page suspicious only when the real bootstrap markers are missing.
  return inlineScripts(html)
    .filter((script) => assignedScriptSrcEntries(script)
      .some((entry) => (entry.value !== null && isAnyJsLiteralGtagScriptSrcForMeasurement(entry.value, B2B_MEASUREMENT_ID))
        || expressionReferencesB2bGtagSource(entry.expression))
      || executableRegexIndex(script, gtagConfigPattern(B2B_MEASUREMENT_ID)) !== -1
      || hasSuspiciousB2bDynamicGtagSource(script));
}

function isIdentifierChar(char) {
  return /[A-Za-z0-9_$]/u.test(char || '');
}

function isIdentifierStartChar(char) {
  return /[A-Za-z_$]/u.test(char || '');
}

function readIdentifier(source, index) {
  if (!isIdentifierStartChar(source[index]) || isIdentifierChar(source[index - 1])) return null;

  let previous = index - 1;
  while (previous >= 0 && /\s/u.test(source[previous])) previous -= 1;
  if (source[previous] === '.') return null;

  let current = index + 1;
  while (current < source.length && isIdentifierChar(source[current])) current += 1;

  return {
    name: source.slice(index, current),
    end: current,
  };
}

function skipWhitespace(source, index) {
  let current = index;
  while (current < source.length && /\s/u.test(source[current])) current += 1;
  return current;
}

function readStringLiteral(source, index) {
  const quote = source[index];
  if (quote !== '"' && quote !== "'" && quote !== '`') return null;

  let current = index + 1;
  let value = '';
  let escaped = false;
  while (current < source.length) {
    const char = source[current];
    if (escaped) {
      value += char;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === quote) {
      return { value, end: current + 1 };
    } else {
      value += char;
    }
    current += 1;
  }

  return { value, end: current };
}

function readAssignmentExpressionSource(source, index) {
  let current = index;
  let depth = 0;

  while (current < source.length) {
    const literal = readStringLiteral(source, current);
    if (literal) {
      current = literal.end;
      continue;
    }

    const char = source[current];
    if (char === '(' || char === '[' || char === '{') {
      depth += 1;
    } else if ((char === ')' || char === ']' || char === '}') && depth > 0) {
      depth -= 1;
    } else if (depth === 0 && char === ';') {
      break;
    }
    current += 1;
  }

  return {
    expression: source.slice(index, current).trim(),
    end: current,
  };
}

function expressionReferencesB2bGtagSource(expression) {
  if (typeof expression !== 'string') return false;

  const normalizedSimpleConcat = expression.replace(/['"`+\s]/gu, '');
  return normalizedSimpleConcat.includes('googletagmanager.com/gtag/js')
    && normalizedSimpleConcat.includes(B2B_MEASUREMENT_ID);
}

function assignmentOperatorAt(source, index) {
  const compoundOperators = ['>>>=', '<<=', '>>=', '**=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^='];
  for (const operator of compoundOperators) {
    if (source.startsWith(operator, index)) return operator;
  }
  if (source[index] === '=' && source[index + 1] !== '=' && source[index + 1] !== '>') return '=';
  return null;
}

function staticStringExpressionValue(expression, identifierValues = null) {
  if (typeof expression !== 'string') return null;

  let current = 0;
  let value = '';
  while (current < expression.length) {
    current = skipWhitespace(expression, current);
    const literal = readQuotedStringLiteral(expression, current);
    if (literal) {
      value += literal.value;
      current = skipWhitespace(expression, literal.end);
    } else {
      const identifier = readIdentifier(expression, current);
      if (!identifier || !identifierValues || !identifierValues.has(identifier.name)) return null;
      value += identifierValues.get(identifier.name);
      current = skipWhitespace(expression, identifier.end);
    }

    if (current === expression.length) return value;
    if (expression[current] !== '+') return null;
    current += 1;
  }

  return value;
}

function staticStringIdentifierValues(source) {
  const values = new Map();
  const assignmentCounts = new Map();

  let index = 0;
  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    const identifier = readIdentifier(source, index);
    if (identifier) {
      const operator = assignmentOperatorAt(source, skipWhitespace(source, identifier.end));
      if (operator) {
        assignmentCounts.set(identifier.name, (assignmentCounts.get(identifier.name) || 0) + 1);
      }
      index = identifier.end;
      continue;
    }

    index += 1;
  }

  for (const entry of executableRegexEntries(
    source,
    /\b(?:var|let|const)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/u,
  )) {
    const expression = readAssignmentExpressionSource(source, entry.index + entry.match[0].length);
    const value = staticStringExpressionValue(expression.expression, values);
    if (value !== null && assignmentCounts.get(entry.match[1]) === 1) values.set(entry.match[1], value);
  }
  return values;
}

function staticStringExpressionValueWithIdentifiers(expression, identifierValues) {
  return staticStringExpressionValue(expression, identifierValues);
}

// Lightweight executable scanners skip string/template bodies instead of fully
// parsing JavaScript. B2B GA bootstrap rejects template literals separately so
// `${...}` cannot hide dynamic gtag script writes there.
function readQuotedStringLiteral(source, index) {
  const quote = source[index];
  if (quote !== '"' && quote !== "'") return null;

  let current = index + 1;
  let value = '';
  let escaped = false;
  while (current < source.length) {
    const char = source[current];
    if (escaped) {
      value += char;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === quote) {
      return { value, end: current + 1 };
    } else {
      value += char;
    }
    current += 1;
  }

  return { value, end: current };
}

function executableTemplateLiteralIndex(source) {
  let index = 0;
  while (index < source.length) {
    const literal = readQuotedStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }
    if (source[index] === '`') return index;
    index += 1;
  }
  return -1;
}

function readTemplateLiteralSource(source, index) {
  if (source[index] !== '`') return null;

  let current = index + 1;
  let escaped = false;
  while (current < source.length) {
    const char = source[current];
    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '`') {
      return {
        body: source.slice(index + 1, current),
        end: current + 1,
      };
    }
    current += 1;
  }

  return {
    body: source.slice(index + 1),
    end: current,
  };
}

function executableTemplateLiteralEntries(source) {
  const entries = [];
  let index = 0;

  while (index < source.length) {
    const literal = readQuotedStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    const templateLiteral = readTemplateLiteralSource(source, index);
    if (templateLiteral) {
      entries.push({
        index,
        body: templateLiteral.body,
      });
      index = templateLiteral.end;
      continue;
    }

    index += 1;
  }

  return entries;
}

function templateExpressionBodies(body) {
  const expressions = [];
  let index = 0;

  while (index < body.length) {
    if (body[index] === '$' && body[index + 1] === '{') {
      const expressionEnd = findMatchingBrace(body, index + 1);
      if (expressionEnd === -1) return expressions;
      expressions.push(body.slice(index + 2, expressionEnd));
      index = expressionEnd + 1;
      continue;
    }

    index += 1;
  }

  return expressions;
}

function executableIndexOf(source, needle) {
  let index = 0;
  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }
    if (source.startsWith(needle, index)) return index;
    index += 1;
  }
  return -1;
}

function executableRegexEntry(source, pattern) {
  const [entry] = executableRegexEntries(source, pattern);
  return entry || null;
}

function executableRegexIndex(source, pattern) {
  const entry = executableRegexEntry(source, pattern);
  return entry === null ? -1 : entry.index;
}

function executableRegexCount(source, pattern) {
  return executableRegexEntries(source, pattern).length;
}

function executableRegexEntries(source, pattern) {
  const entries = [];
  let index = 0;
  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }
    const match = source.slice(index).match(pattern);
    if (match && match.index === 0) {
      entries.push({ index, match });
      index += Math.max(match[0].length, 1);
      continue;
    }
    index += 1;
  }
  return entries;
}

function singleEntryIndex(entries) {
  if (entries.length !== 1) return -1;
  return entries[0].index;
}

function indexesStrictlyIncreasing(indexes) {
  return indexes.every((index, position) => position === 0 || indexes[position - 1] < index);
}

function gtagJsPattern() {
  return /(?:window\.)?gtag\(['"]js['"]\s*,\s*new Date\(\)\)/u;
}

function gtagConfigPattern(measurementId) {
  return new RegExp(
    `(?:gtag|window\\.gtag|window\\[['"]gtag['"]\\])\\(['"]config['"]\\s*,\\s*['"]${escapeRegExp(measurementId)}['"]`,
    'u',
  );
}

function executableB2bConfigCount(scripts) {
  return scripts.reduce(
    (count, script) => count + executableRegexCount(script, gtagConfigPattern(B2B_MEASUREMENT_ID)),
    0,
  );
}

function scriptElementIdentifierEntries(script) {
  return executableRegexEntries(
    script,
    /\b(?:var|let|const)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*document\.createElement\(\s*(['"])script\2\s*\)/iu,
  ).map((entry) => ({
    index: entry.index,
    name: entry.match[1],
  }));
}

function scriptElementIdentifierSet(script) {
  return new Set(scriptElementIdentifierEntries(script).map(({ name }) => name));
}

function hasScriptElementLifecycle(script) {
  return scriptElementIdentifierEntries(script).length > 0
    && appendedScriptEntries(script).length > 0;
}

function hasSuspiciousB2bDynamicGtagSource(script) {
  return executableTemplateLiteralEntries(script)
    .some((entry) => templateExpressionBodies(entry.body)
      .some((expression) => expressionReferencesB2bGtagSource(expression)));
}

function assignedScriptAsyncEntries(script) {
  const scriptIdentifiers = scriptElementIdentifierSet(script);
  const entries = [];
  let index = 0;

  while (index < script.length) {
    const literal = readStringLiteral(script, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    const identifier = readIdentifier(script, index);
    if (identifier && scriptIdentifiers.has(identifier.name)) {
      let current = skipWhitespace(script, identifier.end);
      if (script[current] === '.') {
        current = skipWhitespace(script, current + 1);
        if (script.startsWith('async', current) && !isIdentifierChar(script[current + 'async'.length])) {
          current = skipWhitespace(script, current + 'async'.length);
          if (script[current] === '=' && script[current + 1] !== '=' && script[current + 1] !== '>') {
            current = skipWhitespace(script, current + 1);
            if (script.startsWith('true', current) && !isIdentifierChar(script[current + 'true'.length])) {
              entries.push({ index, name: identifier.name });
            }
          }
        }
      }
    }

    index += 1;
  }

  return entries;
}

function appendedScriptEntries(script) {
  const scriptIdentifiers = scriptElementIdentifierSet(script);
  return executableRegexEntries(
    script,
    /document\.head\.appendChild\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\)/u,
  )
    .filter((entry) => scriptIdentifiers.has(entry.match[1]))
    .map((entry) => ({ index: entry.index, name: entry.match[1] }));
}

function assignedScriptSrcEntries(script) {
  const scriptIdentifiers = scriptElementIdentifierSet(script);
  const identifierValues = staticStringIdentifierValues(script);
  const entries = [];
  let index = 0;

  while (index < script.length) {
    const literal = readStringLiteral(script, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    const identifier = readIdentifier(script, index);
    if (identifier && scriptIdentifiers.has(identifier.name)) {
      let current = skipWhitespace(script, identifier.end);
      if (script[current] === '.') {
        current = skipWhitespace(script, current + 1);
        if (script.startsWith('src', current) && !isIdentifierChar(script[current + 'src'.length])) {
          current = skipWhitespace(script, current + 'src'.length);
          const assignmentOperator = assignmentOperatorAt(script, current);
          if (assignmentOperator) {
            current = skipWhitespace(script, current + assignmentOperator.length);
            const expression = readAssignmentExpressionSource(script, current);
            const staticValue = assignmentOperator === '='
              ? staticStringExpressionValueWithIdentifiers(expression.expression, identifierValues)
              : null;
            entries.push({
              index,
              name: identifier.name,
              value: staticValue,
              expression: expression.expression,
            });
            index = expression.end > current ? expression.end : current + 1;
            continue;
          }
        }
        if (script.startsWith('setAttribute', current) && !isIdentifierChar(script[current + 'setAttribute'.length])) {
          current = skipWhitespace(script, current + 'setAttribute'.length);
          if (script[current] === '(') {
            current = skipWhitespace(script, current + 1);
            const attributeLiteral = readStringLiteral(script, current);
            current = attributeLiteral ? skipWhitespace(script, attributeLiteral.end) : current;
            if (attributeLiteral && attributeLiteral.value.toLowerCase() === 'src' && script[current] === ',') {
              current = skipWhitespace(script, current + 1);
              const expression = readAssignmentExpressionSource(script, current);
              const staticValue = staticStringExpressionValueWithIdentifiers(expression.expression, identifierValues);
              entries.push({
                index,
                name: identifier.name,
                value: staticValue,
                expression: expression.expression,
              });
              index = expression.end > current ? expression.end : current + 1;
              continue;
            }
          }
        }
      } else if (script[current] === '[') {
        current = skipWhitespace(script, current + 1);
        const propertyLiteral = readStringLiteral(script, current);
        current = propertyLiteral ? skipWhitespace(script, propertyLiteral.end) : current;
        if (propertyLiteral && propertyLiteral.value === 'src' && script[current] === ']') {
          current = skipWhitespace(script, current + 1);
          const assignmentOperator = assignmentOperatorAt(script, current);
          if (assignmentOperator) {
            current = skipWhitespace(script, current + assignmentOperator.length);
            const expression = readAssignmentExpressionSource(script, current);
            const staticValue = assignmentOperator === '='
              ? staticStringExpressionValueWithIdentifiers(expression.expression, identifierValues)
              : null;
            entries.push({
              index,
              name: identifier.name,
              value: staticValue,
              expression: expression.expression,
            });
            index = expression.end > current ? expression.end : current + 1;
            continue;
          }
        }
      }
    }

    index += 1;
  }

  return entries;
}

function b2bGtagScriptLifecycleRecord(script) {
  const createEntries = scriptElementIdentifierEntries(script);
  const asyncEntries = assignedScriptAsyncEntries(script);
  const srcEntries = assignedScriptSrcEntries(script)
    .filter((entry) => entry.value !== null && isHttpsJsLiteralGtagScriptSrcForMeasurement(entry.value, B2B_MEASUREMENT_ID));
  const appendEntries = appendedScriptEntries(script);
  const createdNames = createEntries.map(({ name }) => name);
  const candidateRecords = createdNames
    .map((name) => ({
      name,
      createIndex: singleEntryIndex(createEntries.filter((entry) => entry.name === name)),
      asyncIndex: singleEntryIndex(asyncEntries.filter((entry) => entry.name === name)),
      srcIndex: singleEntryIndex(srcEntries.filter((entry) => entry.name === name)),
      appendIndex: singleEntryIndex(appendEntries.filter((entry) => entry.name === name)),
    }))
    .filter((record) => [
      record.createIndex,
      record.asyncIndex,
      record.srcIndex,
      record.appendIndex,
    ].every((index) => index !== -1));

  if (candidateRecords.length !== 1) return null;
  return candidateRecords[0];
}

function b2bDynamicGtagErrors(html) {
  const errors = [];
  const b2bGaInlineScriptTags = b2bGaInlineScripts(html);
  const srcValues = b2bGaInlineScriptTags.flatMap((script) => assignedScriptSrcEntries(script).map((entry) => entry.value));
  const configCount = executableB2bConfigCount(b2bGaInlineScriptTags);

  if (b2bGaInlineScriptTags.length !== 1) {
    errors.push('B2B page must contain exactly one inline dynamic GA script tag');
  }
  if (srcValues.length !== 1) {
    errors.push('B2B dynamic GA bootstrap must assign script.src exactly once across created script elements in the GA block');
  }
  if (srcValues.some((src) => src === null
    || !isHttpsJsLiteralGtagScriptSrcForMeasurement(src, B2B_MEASUREMENT_ID))) {
    errors.push(`B2B dynamic GA script must use HTTPS gtag URL for ${B2B_MEASUREMENT_ID}`);
  }
  if (b2bGaInlineScriptTags.some((script) => b2bGtagScriptLifecycleRecord(script) === null)) {
    errors.push('B2B dynamic GA bootstrap must create, async, src, and append the same script element exactly once');
  }
  if (b2bGaInlineScriptTags.some((script) => executableTemplateLiteralIndex(script) !== -1)) {
    errors.push('B2B dynamic GA bootstrap must not use template literals');
  }
  if (configCount !== 1) {
    errors.push('B2B dynamic GA bootstrap must call gtag config exactly once');
  }

  return errors;
}

function hasB2bSuppressionReturnBeforeGtag(html) {
  const b2bGaScripts = b2bGaInlineScripts(html);

  return b2bGaScripts.length > 0
    && b2bGaScripts.every((script) => scriptHasB2bSuppressionReturnBeforeGtag(script));
}

function b2bSuppressionBlockEntry(scriptSource) {
  return executableRegexEntry(
    scriptSource,
    /if\s*\(([^(){};]*?)\)\s*\{\s*window\.ezlizeAnalyticsSuppressed = true;\s*return;\s*\}/u,
  );
}

function firstB2bSuppressionMarkerIndex(scriptSource) {
  const suppressedIndex = executableIndexOf(scriptSource, 'window.ezlizeAnalyticsSuppressed = true');
  const suppressionBlock = b2bSuppressionBlockEntry(scriptSource);
  const indexes = [
    suppressedIndex,
    suppressionBlock ? suppressionBlock.index : -1,
  ].filter((index) => index !== -1);

  return indexes.length === 0 ? -1 : Math.min(...indexes);
}

function executableBraceDepthAt(source, targetIndex) {
  let depth = 0;
  let index = 0;

  while (index < source.length && index < targetIndex) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    if (source[index] === '{') {
      depth += 1;
    } else if (source[index] === '}' && depth > 0) {
      depth -= 1;
    }
    index += 1;
  }

  return depth;
}

function findMatchingBrace(source, openIndex) {
  if (source[openIndex] !== '{') return -1;

  let depth = 0;
  let index = openIndex;
  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    if (source[index] === '{') {
      depth += 1;
    } else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }

  return -1;
}

function findMatchingParenthesis(source, openIndex) {
  if (source[openIndex] !== '(') return -1;

  let depth = 0;
  let index = openIndex;
  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    if (source[index] === '(') {
      depth += 1;
    } else if (source[index] === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }

  return -1;
}

function isStandaloneKeywordAt(source, index, keyword) {
  return source.startsWith(keyword, index)
    && !isIdentifierChar(source[index - 1])
    && !isIdentifierChar(source[index + keyword.length]);
}

function executableReturnEntries(source) {
  const entries = [];
  let index = 0;

  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    if (isStandaloneKeywordAt(source, index, 'return')) {
      entries.push({ index });
      index += 'return'.length;
      continue;
    }

    index += 1;
  }

  return entries;
}

function hasExecutableReturnBeforeIndex(source, limitIndex) {
  return executableReturnEntries(source).some((entry) => entry.index < limitIndex);
}

function hasExecutableReturnAtBraceDepthBeforeIndex(source, depth, limitIndex) {
  return executableReturnEntries(source)
    .some((entry) => entry.index < limitIndex && executableBraceDepthAt(source, entry.index) === depth);
}

function earlyReturnBranchReturnsBeforeIndex(scriptSource, conditionEnd, limitIndex) {
  const branchStart = skipWhitespace(scriptSource, conditionEnd);
  if (scriptSource[branchStart] === '{') {
    const branchEnd = findMatchingBrace(scriptSource, branchStart);
    if (branchEnd === -1) return false;
    const branchLimit = Math.min(branchEnd, limitIndex) - (branchStart + 1);
    return hasExecutableReturnBeforeIndex(scriptSource.slice(branchStart + 1, branchEnd), branchLimit);
  }

  return branchStart < limitIndex && isStandaloneKeywordAt(scriptSource, branchStart, 'return');
}

function executableIfConditionEntries(source) {
  const entries = [];
  let index = 0;

  while (index < source.length) {
    const literal = readStringLiteral(source, index);
    if (literal) {
      index = literal.end;
      continue;
    }

    if (source.startsWith('if', index)
      && !isIdentifierChar(source[index - 1])
      && !isIdentifierChar(source[index + 2])) {
      const openIndex = skipWhitespace(source, index + 2);
      const closeIndex = findMatchingParenthesis(source, openIndex);
      if (closeIndex !== -1) {
        entries.push({
          index,
          conditionEnd: closeIndex + 1,
        });
        index = closeIndex + 1;
        continue;
      }
    }

    index += 1;
  }

  return entries;
}

function hasB2bEarlyReturnBeforeSuppressionMarker(scriptSource) {
  const suppressionMarkerIndex = firstB2bSuppressionMarkerIndex(scriptSource);
  if (suppressionMarkerIndex === -1) return false;

  const suppressionBlock = b2bSuppressionBlockEntry(scriptSource);
  const suppressionDepth = executableBraceDepthAt(
    scriptSource,
    suppressionBlock ? suppressionBlock.index : suppressionMarkerIndex,
  );
  return hasExecutableReturnAtBraceDepthBeforeIndex(scriptSource, suppressionDepth, suppressionMarkerIndex)
    || executableIfConditionEntries(scriptSource)
    .some((entry) => entry.index < suppressionMarkerIndex
      && executableBraceDepthAt(scriptSource, entry.index) === suppressionDepth
      && earlyReturnBranchReturnsBeforeIndex(scriptSource, entry.conditionEnd, suppressionMarkerIndex));
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
  if (executableIndexOf(scriptSource, "window['ga-disable-' + measurementId] = true") === -1) {
    errors.push(`${rel}: C2C guard must set ga-disable measurement flag`);
  }
  if (executableIndexOf(scriptSource, 'window.urayahaAnalyticsSuppressed = true') === -1) {
    errors.push(`${rel}: C2C guard must set urayahaAnalyticsSuppressed`);
  }
  if (!hasScriptTagSrc(html, C2C_STATUS_SCRIPT)) {
    errors.push(`${rel}: C2C page must load ${C2C_STATUS_SCRIPT}`);
  }
  if (countScriptTagSrc(html, C2C_STATUS_SCRIPT) !== 1) {
    errors.push(`${rel}: C2C page must load ${C2C_STATUS_SCRIPT} exactly once`);
  }
  if (hasScriptTagSrc(html, `/${C2C_STATUS_SCRIPT}`)) {
    errors.push(`${rel}: C2C status script must stay relative for GitHub Pages /portfolio/ deployment`);
  }
  const invalidC2cGtagRefs = scriptSrcValues(html)
    .filter((src) => isAnyHtmlGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID)
      && !isHttpsHtmlGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID));
  if (invalidC2cGtagRefs.length > 0) {
    errors.push(`${rel}: C2C GA script must use HTTPS gtag URL for ${C2C_MEASUREMENT_ID}`);
  }
  const validC2cGtagRefs = scriptSrcValues(html)
    .filter((src) => isHttpsHtmlGtagScriptSrcForMeasurement(src, C2C_MEASUREMENT_ID));
  if (validC2cGtagRefs.length !== 1) {
    errors.push(`${rel}: C2C GA script must be loaded exactly once for ${C2C_MEASUREMENT_ID}`);
  }
  const c2cConfigCount = executableRegexCount(scriptSource, gtagConfigPattern(C2C_MEASUREMENT_ID));
  if (c2cConfigCount !== 1) {
    errors.push(`${rel}: C2C GA config must be called exactly once for ${C2C_MEASUREMENT_ID}`);
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
  if (executableIndexOf(scriptSource, 'var isProductionHost = productionHosts.includes(window.location.hostname);') === -1) {
    errors.push(`${rel}: B2B guard must compute isProductionHost before suppression decision`);
  }
  if (inlineScripts(html).some((script) => hasB2bEarlyReturnBeforeSuppressionMarker(script))) {
    errors.push(`${rel}: B2B guard must not early-return before marking suppression`);
  }
  if (!hasSuppressionCondition(scriptSource, REQUIRED_SUPPRESSION_TERMS)) {
    errors.push(`${rel}: B2B suppression condition must include ${REQUIRED_SUPPRESSION_TERMS.join(', ')}`);
  }
  if (executableIndexOf(scriptSource, 'window.ezlizeAnalyticsSuppressed = true') === -1) {
    errors.push(`${rel}: B2B guard must set ezlizeAnalyticsSuppressed`);
  }
  if (scriptSrcValues(html).some((src) => isAnyHtmlGtagScriptSrcForMeasurement(src, B2B_MEASUREMENT_ID))) {
    errors.push(`${rel}: B2B GA script must be dynamically inserted after the suppression return, not loaded by a static script tag`);
  }
  for (const error of b2bDynamicGtagErrors(html)) {
    errors.push(`${rel}: ${error}`);
  }
  if (!hasB2bSuppressionReturnBeforeGtag(html)) {
    errors.push(`${rel}: B2B suppression block must return before dynamic gtag bootstrap and bootstrap sequence must follow create/async/src/append/dataLayer/gtag/js/config order`);
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
  if (executableIndexOf(executableJs, 'var urlOptOut = disableKeys.some') === -1) {
    errors.push(`${rel}: status script must expose current-visit URL opt-out state`);
  }
  if (executableIndexOf(executableJs, 'var statusOk = (optOut || urlOptOut)') === -1) {
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

const b2bPages = listHtmlFiles(b2bDir);

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
