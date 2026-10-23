#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { repairLegacyTpm2bIdObjectFraming } = require('../../core/governance/sheikha-tpm-id-object-framing-v2');

const [inputPath, outputPath, reportPath] = process.argv.slice(2);
if (!inputPath || !outputPath || !reportPath) {
  process.stderr.write('Usage: repair-sheikha-tpm-id-object-framing-v2 INPUT OUTPUT REPORT\n');
  process.exit(2);
}

const input = fs.readFileSync(path.resolve(inputPath));
const result = repairLegacyTpm2bIdObjectFraming(input);
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), result.correctedBlob, { mode: 0o600 });
fs.writeFileSync(path.resolve(reportPath), `${JSON.stringify(result.evidence, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(result.evidence, null, 2)}\n`);
