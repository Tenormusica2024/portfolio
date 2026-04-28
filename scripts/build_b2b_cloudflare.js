const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const src = path.join(repoRoot, 'b2b');
const out = path.join(repoRoot, 'dist', 'b2b');

execFileSync('node', [path.join(repoRoot, 'scripts', 'check_b2b_hero_headlines.js')], {
  cwd: repoRoot,
  stdio: 'inherit',
});

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const excludedDirs = new Set(['.vercel']);
const excludedExts = new Set(['.md']);
const excludedFiles = new Set(['.gitignore', '.vercelignore', 'vercel.json']);

function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(target, { recursive: true });
      copyDir(source, target);
      continue;
    }
    if (!entry.isFile()) continue;
    if (excludedFiles.has(entry.name)) continue;
    if (excludedExts.has(path.extname(entry.name).toLowerCase())) continue;
    fs.copyFileSync(source, target);
  }
}

copyDir(src, out);
console.log(`[cloudflare] copied static files to ${path.relative(repoRoot, out)}`);
