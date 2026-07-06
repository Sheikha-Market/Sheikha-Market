'use strict';
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const base = path.join(root, 'runtime/self-healing');
const dirs = ['errors', 'repairs', 'diagnostics'];

for (const d of dirs) fs.mkdirSync(path.join(base, d), { recursive: true });

const latest = path.join(base, 'diagnostics/latest.json');
fs.writeFileSync(latest, JSON.stringify({
  success: true,
  engine: 'SHEIKHA_SELF_HEALING_V1',
  status: 'ACTIVE',
  policy: 'DETECT_CLASSIFY_RECOMMEND_VERIFY',
  updatedAt: new Date().toISOString()
}, null, 2) + '\n');

console.log(JSON.stringify({
  success: true,
  engine: 'SHEIKHA_SELF_HEALING_V1',
  latest
}, null, 2));
