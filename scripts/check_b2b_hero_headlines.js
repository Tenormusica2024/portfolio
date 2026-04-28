#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const b2bDir = path.join(repoRoot, 'b2b');
const targetFiles = process.argv.length > 2
  ? process.argv.slice(2).map((file) => path.resolve(process.cwd(), file))
  : ['index.html'].map((file) => path.join(b2bDir, file));

const lineEndForbidden = /[、。，．,.]$/u;
const isolatedLine = /^[、。，．,.!?！？ー\-・]$|^[をにへがのとやで]$/u;

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/<[^>]*>/gu, '')
    .replace(/&nbsp;/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .trim();
}

function extractHeroTitleLines(html) {
  const heroTitleMatch = html.match(/<h1\b[^>]*class="[^"]*\bhero-title\b[^"]*"[^>]*>([\s\S]*?)<\/h1>/u);
  if (!heroTitleMatch) {
    throw new Error('hero-title h1 was not found');
  }

  const blockLineMatches = [...heroTitleMatch[1].matchAll(/<(?:em|span)\b[^>]*class="[^"]*\bhero-title-line\b[^"]*"[^>]*>([\s\S]*?)<\/(?:em|span)>/gu)];

  if (blockLineMatches.length > 0) {
    return blockLineMatches.map((match) => stripTags(match[1])).filter(Boolean);
  }

  return stripTags(heroTitleMatch[1])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function checkLines(filePath, lines) {
  const errors = [];

  lines.forEach((line, index) => {
    const lineNo = index + 1;

    if (lineEndForbidden.test(line)) {
      errors.push(`line ${lineNo} ends with forbidden punctuation: "${line}"`);
    }

    if (isolatedLine.test(line) || line.length <= 2) {
      errors.push(`line ${lineNo} is too isolated for a hero headline: "${line}"`);
    }
  });

  if (lines.length < 2 || lines.length > 4) {
    errors.push(`hero headline should use 2-4 intentional lines, found ${lines.length}: ${JSON.stringify(lines)}`);
  }

  return errors.map((message) => `${path.relative(repoRoot, filePath)}: ${message}`);
}

let failed = false;

for (const filePath of targetFiles) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const lines = extractHeroTitleLines(html);
    const errors = checkLines(filePath, lines);

    if (errors.length > 0) {
      failed = true;
      errors.forEach((error) => console.error(error));
    } else {
      console.log(`${path.relative(repoRoot, filePath)}: hero headline OK (${lines.join(' / ')})`);
    }
  } catch (error) {
    failed = true;
    console.error(`${path.relative(repoRoot, filePath)}: ${error.message}`);
  }
}

if (failed) {
  console.error('B2B hero headline guard failed.');
  process.exit(1);
}
