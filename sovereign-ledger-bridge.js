'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const REGISTRIES = [
  'SHEIKHA-CORE/blockchain/registry.json',
  'SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json',
  'blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json'
];

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readLiveSovereignLedger(root = __dirname) {
  try {
    const copies = REGISTRIES.map(rel => fs.readFileSync(path.join(root, rel)));
    const hashes = copies.map(sha256);
    if (new Set(hashes).size !== 1) throw Error('REGISTRY_MIRROR_MISMATCH');
    const registry = JSON.parse(copies[0].toString('utf8'));
    if (!registry || Array.isArray(registry) || typeof registry !== 'object')
      throw Error('REGISTRY_SCHEMA_INVALID');
    const entries = Object.entries(registry);
    if (!entries.length) throw Error('REGISTRY_EMPTY');
    let reward = 0;
    for (const [id, x] of entries) {
      if (!x || typeof x !== 'object' || Array.isArray(x) || x.id !== id)
        throw Error('REGISTRY_ID_MISMATCH');
      const units = x.shk_reward ?? 0;
      if (!Number.isSafeInteger(units) || units < 0) throw Error('REGISTRY_REWARD_INVALID');
      reward += units;
      if (!Number.isSafeInteger(reward)) throw Error('REWARD_SUM_OVERFLOW');
    }
    const blockRoot = path.join(root, 'SHEIKHA-CORE/sheikhachain/blocks');
    const names = fs.readdirSync(blockRoot).filter(n => /^block_\d{8}\.json$/.test(n)).sort();
    if (!names.length) throw Error('BLOCK_FILES_EMPTY');
    let previous = null;
    for (let index = 0; index < names.length; index++) {
      const data = JSON.parse(fs.readFileSync(path.join(blockRoot, names[index]), 'utf8'));
      if (data.index !== index || names[index] !== 'block_' + String(index).padStart(8, '0') + '.json')
        throw Error('BLOCK_INDEX_GAP');
      if (!/^[a-f0-9]{64}$/i.test(data.hash)) throw Error('BLOCK_HASH_INVALID');
      if (index > 0 && data.previous_hash !== previous) throw Error('BLOCK_LINK_MISMATCH');
      previous = data.hash;
    }
    return {
      ok: true, blocks: names.length, weights: entries.length,
      shk: reward.toLocaleString('en-US'), shkRaw: reward,
      ledger_live: true, registrySha256: hashes[0],
      financialBackingVerified: false, trainedModelWeightsVerified: false,
      blockchainIntegrityVerified: false
    };
  } catch (err) {
    return { ok: false, error: (
      err && /^(REGISTRY_|BLOCK_|REWARD_)/.test(err.message)
        ? err.message : 'LEDGER_SOURCE_UNAVAILABLE_OR_INVALID') };
  }
}
module.exports = { readLiveSovereignLedger };
