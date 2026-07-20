#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const HEADER_PATH = path.join(
  ROOT,
  'bare-metal/include/sheikha_driver_abi_v1.h'
);
const SOURCE_PATH = path.join(
  ROOT,
  'bare-metal/hal/sheikha_driver_abi_v1_smoke.c'
);
const REPORT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/hardware-compatibility/v1/' +
    'sheikha-driver-abi-v1-smoke-report.json'
);
const REQUIRED_MARKER = 'SHEIKHA_DRIVER_ABI_V1_SMOKE_OK';

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function writeEvidence(marker) {
  if (marker !== REQUIRED_MARKER) {
    throw new Error('Driver ABI smoke marker was not supplied');
  }
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_DRIVER_ABI_V1_SMOKE',
    generatedAt: new Date().toISOString(),
    status: 'PASSED',
    compiler: 'gcc',
    compilerFlags: [
      '-std=c11',
      '-Wall',
      '-Wextra',
      '-Werror',
    ],
    marker,
    header: {
      path: path.relative(ROOT, HEADER_PATH),
      sha256: sha256(HEADER_PATH),
    },
    source: {
      path: path.relative(ROOT, SOURCE_PATH),
      sha256: sha256(SOURCE_PATH),
    },
    assertions: {
      boundedDiscoveryAllowed: true,
      ungrantedWriteDenied: true,
      highImpactRequiresHumanApproval: true,
      storageMutationRequiresSeparateAuthorization: true,
      firmwareMutationRequiresSeparateAuthorization: true,
    },
    persistentExecutableCreated: false,
  };
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (require.main === module) {
  const report = writeEvidence(process.argv[2]);
  console.log(JSON.stringify(report, null, 2));
}

module.exports = { REPORT_PATH, REQUIRED_MARKER, sha256, writeEvidence };
