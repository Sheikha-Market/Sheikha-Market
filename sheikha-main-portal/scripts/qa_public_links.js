#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicDir = path.join(root, 'public');

function listHtmlFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...listHtmlFiles(p));
      continue;
    }
    if (e.isFile() && e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function normalizeRef(ref) {
  if (!ref) return null;
  if (ref.startsWith('http://') || ref.startsWith('https://')) return null;
  if (ref.startsWith('mailto:') || ref.startsWith('tel:')) return null;
  if (ref.startsWith('#') || ref.startsWith('javascript:')) return null;
  return ref.split('#')[0].split('?')[0];
}

function checkRef(baseDir, ref) {
  const n = normalizeRef(ref);
  if (!n) return { skip: true };
  if (n.startsWith('/api/')) return { api: true };
  if (n.startsWith('/')) {
    const abs = path.join(publicDir, n.slice(1));
    return { exists: fs.existsSync(abs), target: abs, ref: n };
  }
  const abs = path.resolve(baseDir, n);
  return { exists: fs.existsSync(abs), target: abs, ref: n };
}

const htmlFiles = listHtmlFiles(publicDir);
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
  const src = fs.readFileSync(file, 'utf8');
  const baseDir = path.dirname(file);

  const refs = [];
  for (const m of src.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)) refs.push(m[1]);
  for (const m of src.matchAll(/\bsrc\s*=\s*["']([^"']+)["']/g)) refs.push(m[1]);
  for (const m of src.matchAll(/location\.href\s*=\s*["']([^"']+)["']/g)) refs.push(m[1]);
  for (const m of src.matchAll(/window\.open\(\s*["']([^"']+)["']/g)) refs.push(m[1]);

  for (const ref of refs) {
    const r = checkRef(baseDir, ref);
    if (r.skip || r.api) continue;
    checked++;
    if (!r.exists) {
      broken.push({
        file: path.relative(publicDir, file),
        ref: r.ref,
      });
    }
  }
}

console.log('=== QA Public Links ===');
console.log('HTML files:', htmlFiles.length);
console.log('Checked local refs:', checked);
console.log('Broken refs:', broken.length);
for (const b of broken.slice(0, 80)) {
  console.log(`- ${b.file} -> ${b.ref}`);
}
if (broken.length > 80) {
  console.log(`... and ${broken.length - 80} more`);
}
