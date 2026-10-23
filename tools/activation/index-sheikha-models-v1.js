'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildInventory } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1'
);

const root = path.resolve(__dirname, '../..');
const output = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1.json'
);
const inventory = buildInventory();
const body = `${JSON.stringify(inventory, null, 2)}\n`;
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, body, 'utf8');
console.log(JSON.stringify({
  system: inventory.system,
  summary: inventory.summary,
  output: path.relative(root, output),
  sha256: crypto.createHash('sha256').update(body).digest('hex'),
  networkUsed: false,
  modelsDownloaded: false,
  renewalMode: inventory.renewal.discoveryMode
}, null, 2));
