'use strict';

// Explicit local verification only. The two calculations use synthetic inputs.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { ObservationBridge } = require('../src/chat/sheikhaObservationBridge');
const { inspectDelivery } = require('../src/chat/sheikhaDeliveryInspection');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
function snapshot() {
  const base = path.join(os.homedir(), '.local/share/sheikha-observation-industry/v1/state');
  return ['ledger.json', 'data-catalog.json', 'news-read-state.json'].map(file => {
    const location = path.join(base, file);
    try {
      const stat = fs.lstatSync(location);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > 5 * 1024 * 1024) throw Error('UNSAFE_STATE_FILE');
      return { file, present: true, sha256: digest(fs.readFileSync(location)) };
    } catch (error) { if (error.code === 'ENOENT') return { file, present: false }; throw error; }
  });
}
async function main() {
  const before = snapshot(); const bridge = new ObservationBridge();
  const service = await bridge.report();
  const effect = await bridge.execute('EFFECT', { baseline: 20, observed: 15, better: 'LOWER', unit: 'minute' });
  const balance = await bridge.execute('INDUSTRIAL_BALANCE', { unit: 'kg', inputs: 100, acceptedOutputs: 85, byproducts: 10, waste: 3, inventoryChange: 2, tolerance: 0.01 });
  const after = snapshot(); assert.deepEqual(after, before);
  const delivery = await inspectDelivery(path.resolve(__dirname, '../..'));
  assert.equal(service.tools.length, 16);
  assert.ok(delivery.artifacts.length > 0 && delivery.artifacts.every(item => item.matchesRecordedBytes));
  const report = { checkedAt: new Date().toISOString(), extensionVersion: require('../package.json').version,
    service, effect, balance, calculationInputs: 'SYNTHETIC_NOT_CUSTOMER_MEASUREMENTS',
    knownStateFilesBefore: before, knownStateFilesAfter: after, knownStateFilesUnchanged: true,
    stateScope: 'THREE_KNOWN_DEFAULT_PROFILE_FILES_ONLY_NOT_FULL_SYSTEM_AUDIT', delivery,
    externalNetworkUsed: false, modelInvoked: false, trainingExecuted: false, hardwareAccessed: false,
    productionReady: false };
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-chat-grounding-'));
  fs.chmodSync(directory, 0o700);
  const content = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(directory, 'verification.json'), content, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ output: directory, reportSha256: digest(content), tools: service.tools.length,
    domains: service.domains, matchedPackages: delivery.artifacts.length, effect: effect.result, balance: balance.result,
    knownStateFilesUnchanged: true, productionReady: false }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
