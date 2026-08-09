#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  REPORT_PATH,
  EVIDENCE_DIR,
  buildActivationArtifacts
} = require(
  '../../runtime/sheikha-language-foundation/v2/' +
  'sheikha-language-foundation-root-v2'
);

const ROOT = path.resolve(__dirname, '../..');

function writeJson(relativePath, value) {
  const outputPath = path.join(ROOT, relativePath);
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporaryPath, outputPath);
}

function activate() {
  const artifacts = buildActivationArtifacts();
  writeJson(REPORT_PATH, artifacts.report);
  writeJson(
    `${EVIDENCE_DIR}/sheikha-foundation-root-v2.ast.json`,
    artifacts.ast
  );
  writeJson(
    `${EVIDENCE_DIR}/sheikha-foundation-root-v2.types.json`,
    artifacts.types
  );
  writeJson(
    `${EVIDENCE_DIR}/sheikha-foundation-root-v2.ir.json`,
    artifacts.ir
  );
  writeJson(
    `${EVIDENCE_DIR}/sheikha-foundation-root-v2.bytecode.json`,
    artifacts.bytecode
  );
  writeJson(
    `${EVIDENCE_DIR}/sheikha-foundation-root-v2.run.json`,
    artifacts.run
  );
  writeJson(
    `${EVIDENCE_DIR}/sheikha-ai-capability-root-registry-v2.json`,
    artifacts.report.aiCapabilityRoots
  );
  writeJson(
    `${EVIDENCE_DIR}/sheikha-system-tool-adapter-registry-v2.json`,
    artifacts.report.systemToolAdapters
  );
  return artifacts.report;
}

if (require.main === module) {
  const report = activate();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    passed: report.passed,
    score: report.score,
    sourceSha256: report.identity.sourceSha256,
    bytecodeSha256: report.identity.bytecodeSha256,
    aiCapabilityRoots: report.aiCapabilityRoots.count,
    nativeStack: report.nativeStack,
    failedChecks: report.failedChecks,
    report: REPORT_PATH
  }, null, 2));
  if (!report.passed) process.exitCode = 1;
}

module.exports = {
  activate
};
