#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {evaluateLanguageProductRelease} = require('../../core/language/sheikha-language-product-release-gate-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const OUTPUT = path.join(ROOT, 'runtime/sheikha-language-production/v1/sheikha-language-product-release-gate-v1-report.json');
const TEST_EVIDENCE = 'runtime/sheikha-language-production/v1/sheikha-language-release-test-evidence-v1.json';

function generate() {
  const testRecord = read(TEST_EVIDENCE);
  const passed = (suite) => suite?.passed > 0 && suite?.failed === 0;
  const report = evaluateLanguageProductRelease({
    foundation: read('runtime/sheikha-language-foundation/v2/sheikha-language-foundation-root-v2-report.json'),
    architecture: read('runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json'),
    firmware: read('runtime/bare-metal/v3/firmware-platform/sheikha-firmware-platform-oem-odm-v1-report.json'),
    testEvidence: {
      compilerAndVmTestsPassed: passed(testRecord.suites.compilerAndVm),
      foundationTestsPassed: passed(testRecord.suites.foundation),
      arabicLogicTestsPassed: passed(testRecord.suites.arabicLogic),
      kernelContractTestsPassed: passed(testRecord.suites.kernelContract)
    }
  });
  report.generatedAt = new Date().toISOString();
  report.testEvidence = {record: TEST_EVIDENCE, totals: testRecord.totals, expiresOnRelevantSourceChange: true};
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(generate(), null, 2)}\n`);
module.exports = {generate, OUTPUT};
