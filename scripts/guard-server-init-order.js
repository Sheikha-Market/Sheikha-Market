#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'server.js');
const source = fs.readFileSync(serverPath, 'utf8');
const lines = source.split(/\r?\n/);

const appInitIndex = lines.findIndex(line => /^\s*const\s+app\s*=\s*express\s*\(\s*\)\s*;?\s*$/.test(line));

if (appInitIndex === -1) {
  console.error('server.js guard failed: missing `const app = express()` initialization.');
  process.exit(1);
}

const earlyAppUse = [];

for (let index = 0; index < appInitIndex; index += 1) {
  const line = lines[index];
  if (/^\s*app\./.test(line)) {
    earlyAppUse.push({ line: index + 1, code: line.trim() });
  }
}

if (earlyAppUse.length > 0) {
  console.error('server.js guard failed: `app` is used before `const app = express()`.');
  for (const item of earlyAppUse) {
    console.error(`  line ${item.line}: ${item.code}`);
  }
  process.exit(1);
}

const sreMiddlewareIndex = lines.findIndex(line => /app\.use\s*\(\s*sreMiddleware\s*\)/.test(line));
const sreRoutesIndex = lines.findIndex(line => /app\.use\s*\(\s*['"]\/api\/sre['"]/.test(line));

if (sreMiddlewareIndex !== -1 && sreMiddlewareIndex < appInitIndex) {
  console.error('server.js guard failed: SRE middleware is mounted before app initialization.');
  process.exit(1);
}

if (sreRoutesIndex !== -1 && sreRoutesIndex < appInitIndex) {
  console.error('server.js guard failed: SRE routes are mounted before app initialization.');
  process.exit(1);
}

console.log(`server.js init order OK: app initialized at line ${appInitIndex + 1}.`);
