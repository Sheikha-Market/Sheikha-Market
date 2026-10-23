#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {evaluateTpmProductionTrialGate} = require('../../core/governance/sheikha-tpm-production-trial-gate-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const PLATFORM = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/sheikha-firmware-platform-oem-odm-v1-report.json');
const PREFLIGHT = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-tpm-quote-readiness-v1-report.json');
const CONFORMANCE = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-tpm2-part2-structures-conformance-v1.json');
const OUTPUT = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-tpm-production-trial-gate-v1-report.json');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function generate() {
  const report = {...evaluateTpmProductionTrialGate({platformReport: read(PLATFORM), quotePreflight: read(PREFLIGHT), conformance: read(CONFORMANCE)}), checkedAt: new Date().toISOString()};
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(generate(), null, 2)}\n`);
module.exports = {generate, OUTPUT};
