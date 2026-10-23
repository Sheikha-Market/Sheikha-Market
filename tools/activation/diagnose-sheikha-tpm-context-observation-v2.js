#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { diagnoseContextObservationFailure } = require('../../core/governance/sheikha-tpm-context-observation-diagnosis-v2');

const [stderrPath, contextPath, framingRepairPath, outputPath] = process.argv.slice(2);
if (!stderrPath || !contextPath || !framingRepairPath || !outputPath) {
  process.stderr.write('Usage: diagnose-sheikha-tpm-context-observation-v2 STDERR CONTEXT FRAMING_REPAIR OUTPUT\n');
  process.exit(2);
}

const crypto = require('node:crypto');
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const stderr = fs.readFileSync(path.resolve(stderrPath), 'utf8');
const context = fs.readFileSync(path.resolve(contextPath));
const framingRepair = fs.readFileSync(path.resolve(framingRepairPath));
const report = diagnoseContextObservationFailure({
  stderr,
  contextSha256: digest(context),
  framingRepairSha256: digest(framingRepair),
});
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
