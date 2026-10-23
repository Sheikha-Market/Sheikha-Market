'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const snapshotPath = path.join(root, 'runtime', 'pm2-fabric', 'pm2-jlist.json');
const protectedKeys = new Set(['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']);

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object') return value;

  const output = {};
  for (const [key, child] of Object.entries(value)) {
    output[key] = protectedKeys.has(key) ? '[REDACTED]' : redact(child);
  }
  return output;
}

if (!fs.existsSync(snapshotPath)) {
  throw new Error('SHEIKHA_PM2_SNAPSHOT_NOT_FOUND');
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
fs.writeFileSync(snapshotPath, `${JSON.stringify(redact(snapshot), null, 2)}\n`);

console.log(JSON.stringify({
  system: 'SHEIKHA_PM2_SNAPSHOT_REDACTION_V1',
  status: 'REDACTED',
  file: path.relative(root, snapshotPath),
  protectedKeys: [...protectedKeys]
}, null, 2));
