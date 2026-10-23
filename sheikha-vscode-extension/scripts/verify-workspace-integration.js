'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { inspectWorkspace, IntegrationJournal, integrationMarkdown } = require('../src/chat/sheikhaWorkspaceIntegration');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const journal = new IntegrationJournal();
  const first = await inspectWorkspace(root); journal.accept(root, first);
  const second = await inspectWorkspace(root); journal.accept(root, second);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-integration-evidence-'));
  const files = {
    'baseline.json': JSON.stringify(first, null, 2),
    'source-evidence.json': JSON.stringify(second, null, 2),
    'changes.json': JSON.stringify(journal.snapshot(), null, 2),
    'integration.ar.md': integrationMarkdown(journal.snapshot())
  };
  const hashes = {};
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, name), content, { mode: 0o600, flag: 'wx' });
    hashes[name] = crypto.createHash('sha256').update(content).digest('hex');
  }
  const result = { checkedAt: second.checkedAt, components: second.components.length,
    sourcesPresent: second.components.filter(c => c.state === 'SOURCES_PRESENT').length,
    changedBetweenReads: journal.newChangeCount, externalRequests: 0, sourceModified: false,
    runtimeVerified: false, modelTrainingPerformed: false, commercialProductionReady: false,
    output: directory, fileSha256: hashes };
  fs.writeFileSync(path.join(directory, 'verification.json'), JSON.stringify(result, null, 2), { mode: 0o600, flag: 'wx' });
  console.log(JSON.stringify(result, null, 2));
}

main().catch(() => { console.error('LOCAL_INTEGRATION_VERIFICATION_FAILED'); process.exitCode = 1; });
