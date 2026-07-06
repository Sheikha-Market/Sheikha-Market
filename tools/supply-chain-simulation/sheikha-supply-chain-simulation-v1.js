'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT, p));
const write = (p, c) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), c); };

const checks = {
  engine: exists('runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1.json'),
  models: exists('runtime/supply-chain-simulation/v1/registries/simulation-models.json'),
  logisticsPlatform: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json'),
  visualChain: exists('runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
const report = {
  system: 'SHEIKHA_SUPPLY_CHAIN_SIMULATION_ENGINE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_SUPPLY_CHAIN_SIMULATION_GAPS' : 'SUPPLY_CHAIN_SIMULATION_ACTIVE_100',
  checks,
  missing,
  principle: 'ولا حول ولا قوة إلا بالله'
};

write('runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1-report.json', JSON.stringify(report, null, 2) + '\n');
write('runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1-report.md', `# SHEIKHA_SUPPLY_CHAIN_SIMULATION_ENGINE_V1\n\n- الحالة: ${report.status}\n- الدرجة: ${report.score}\n- القرار: ${report.decision}\n\nولا حول ولا قوة إلا بالله.\n`);
console.log(JSON.stringify(report, null, 2));
