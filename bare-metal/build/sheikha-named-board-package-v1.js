#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const BOARD = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/boards/msi-pulse-16-ai-c1vfkg-board-package-v1.json');
const RECOVERY = path.join(ROOT, 'bare-metal/contracts/SHEIKHA-NAMED-BOARD-RECOVERY-CONTRACT-V1.json');
const PHYSICAL = path.join(ROOT, 'runtime/bare-metal/v2/evidence/physical-hardware-boot-verification.json');
const OUTPUT = path.join(ROOT, 'runtime/bare-metal/v3/firmware-platform/boards/msi-pulse-16-ai-c1vfkg-board-package-v1-report.json');

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function hashFile(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function relative(file) { return path.relative(ROOT, file).split(path.sep).join('/'); }

function evaluate() {
  const board = read(BOARD);
  const recovery = read(RECOVERY);
  const physical = read(PHYSICAL);
  const bindingMatches = ['vendor', 'model', 'architecture', 'firmwareMode', 'biosVendor', 'biosVersion', 'biosDate']
    .every((key) => board.binding[key] === physical.platform[key]);
  const evidenceRecordsValid = physical.evidenceRecords.every((record) => {
    const file = path.join(ROOT, record.path);
    return fs.existsSync(file) && hashFile(file) === record.sha256;
  });
  const seedVerified = bindingMatches && evidenceRecordsValid && physical.verified === true &&
    physical.observations?.postKernelGreenBarVisibleBothRuns === true &&
    physical.observations?.internalDiskWritesObserved === false;
  const pendingUnits = board.implementationUnits.filter((unit) => !unit.state.endsWith('VERIFIED'));
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_NAMED_BOARD_PACKAGE_QUALIFICATION_V1',
    boardPackage: board.id,
    status: seedVerified ? 'BOARD_SEED_EVIDENCE_VERIFIED_BSP_AND_RECOVERY_PENDING' : 'BOARD_SEED_EVIDENCE_REJECTED',
    generatedAt: new Date().toISOString(),
    bindingMatches,
    evidenceRecordsValid,
    seedVerified,
    implementation: {
      verifiedUnits: board.implementationUnits.filter((unit) => unit.state.endsWith('VERIFIED')).map((unit) => unit.id),
      pendingUnits,
      completedBsp: board.claimBoundary.isCompletedBsp
    },
    recovery: {
      contract: recovery.id,
      failClosed: recovery.defaultAuthorization === 'DENY',
      physicalDrillCompleted: recovery.physicalRecoveryDrillCompleted,
      productionReleasePermitted: recovery.productionReleasePermitted
    },
    safeNextAction: 'IMPLEMENT_ACPI_SMBIOS_AND_DEVICE_INVENTORY_WITHOUT_PHYSICAL_FIRMWARE_WRITE',
    evidence: {path: relative(PHYSICAL), sha256: hashFile(PHYSICAL)}
  };
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  return report;
}

function generate() {
  const report = evaluate();
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(generate(), null, 2)}\n`);
module.exports = {evaluate, generate, BOARD, RECOVERY, OUTPUT};
