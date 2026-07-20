'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const gates = JSON.parse(fs.readFileSync(path.join(root, 'runtime/bare-metal/v2/contracts/sheikha-v2-completion-gates.json'), 'utf8'));
const hashOk = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
function evaluate(gate) {
  const evidencePath = path.join(root, gate.evidence);
  if (!fs.existsSync(evidencePath)) return {flag: gate.flag, verified: false, reason: 'EVIDENCE_MISSING'};
  let record;
  try { record = JSON.parse(fs.readFileSync(evidencePath, 'utf8')); }
  catch { return {flag: gate.flag, verified: false, reason: 'EVIDENCE_INVALID_JSON'}; }
  const checks = record.checks || {};
  const missingChecks = gate.requires.filter((name) => checks[name] !== true);
  const verified = record.status === 'VERIFIED' && record.verified === true &&
    hashOk(record.evidenceHash) && typeof record.verifiedAt === 'string' &&
    typeof record.verifiedBy === 'string' && record.verifiedBy.length > 0 &&
    missingChecks.length === 0;
  return {flag: gate.flag, verified, reason: verified ? 'VERIFIED' : 'EVIDENCE_REQUIREMENTS_NOT_MET', missingChecks};
}
const results = gates.gates.map(evaluate);
const completionFlags = Object.fromEntries(results.map((item) => [item.flag, item.verified]));
process.stdout.write(JSON.stringify({
  schemaVersion: '1.0.0',
  system: 'SHEIKHA_V2_COMPLETION_GATE_EVALUATION',
  completionFlags,
  results,
  remainingCompletionGates: results.filter((item) => !item.verified).length,
  allCompletionGatesPassed: results.every((item) => item.verified)
}, null, 2) + '\n');
