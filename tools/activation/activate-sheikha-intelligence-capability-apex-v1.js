#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');

const {
  FILES,
  buildActivationArtifacts,
  writeJson
} = require(
  '../../core/intelligence-apex/' +
  'sheikha-intelligence-capability-apex-v1'
);

function capturedInventoryOptions() {
  const source = process.env.SHEIKHA_OLLAMA_TAGS_FILE;
  if (!source) return {};
  const buffer = fs.readFileSync(source);
  const data = JSON.parse(buffer.toString('utf8'));
  if (!Array.isArray(data.models)) {
    throw new Error('OLLAMA_TAGS_CAPTURE_MODELS_REQUIRED');
  }
  return {
    localModels: data.models,
    inventoryEndpoint:
      'http://127.0.0.1:11434/api/tags',
    inventoryDiscoveryMethod:
      'CURL_LOOPBACK_CAPTURE_FOR_SANDBOXED_ACTIVATION',
    inventoryEvidence: {
      source: 'LOOPBACK_OLLAMA_TAGS_CAPTURE',
      file: source,
      bytes: buffer.byteLength,
      sha256: crypto
        .createHash('sha256')
        .update(buffer)
        .digest('hex')
    }
  };
}

async function activate(options = {}) {
  const artifacts = await buildActivationArtifacts(options);
  writeJson(FILES.models, artifacts.inventory, options);
  writeJson(FILES.capabilities, artifacts.capabilities, options);
  writeJson(FILES.routing, artifacts.routing, options);
  writeJson(FILES.report, artifacts.report, options);
  return artifacts.report;
}

if (require.main === module) {
  activate(capturedInventoryOptions())
    .then((report) => {
      console.log(JSON.stringify({
        system: report.system,
        status: report.status,
        passed: report.passed,
        coverage: report.coverage,
        benchmark: report.benchmark,
        truthBoundaries: report.truthBoundaries,
        failedChecks: report.failedChecks,
        report: FILES.report
      }, null, 2));
      if (!report.passed) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = {
  activate,
  capturedInventoryOptions
};
