#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildEkAkRecreationContract } = require('../../core/governance/sheikha-tpm-ek-ak-recreation-contract-v2');

const root = path.resolve(__dirname, '..', '..');
const inventoryPath = path.join(root, 'runtime/governance/platform-trust/v2/evidence/tpm-read-only-inventory-v2.json');
const outputPath = path.join(root, 'runtime/governance/platform-trust/v2/evidence/tpm-ek-ak-recreation-contract-v2.json');
const inventoryRaw = fs.readFileSync(inventoryPath);
const inventory = JSON.parse(inventoryRaw.toString('utf8'));
if (inventory.status !== 'READ_ONLY_INVENTORY_COMPLETE') throw new Error('COMPLETE_INVENTORY_REQUIRED');
if (inventory.inventory.persistentHandles.length || inventory.inventory.transientHandles.length) {
  throw new Error('EMPTY_OBJECT_HANDLE_INVENTORY_REQUIRED');
}
const contract = buildEkAkRecreationContract({
  inventoryReportSha256: crypto.createHash('sha256').update(inventoryRaw).digest('hex'),
});
fs.writeFileSync(outputPath, `${JSON.stringify(contract, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(contract, null, 2)}\n`);
