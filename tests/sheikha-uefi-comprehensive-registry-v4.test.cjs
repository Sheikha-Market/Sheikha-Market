'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

test('Sheikha UEFI comprehensive registry V4', () => {
  const verifier = path.resolve(
    __dirname,
    '../tools/verification/sheikha-uefi-comprehensive-registry-v4-verifier.cjs'
  );

  const output = execFileSync(
    process.execPath,
    [verifier],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        LC_ALL: 'C.UTF-8',
        LANG: 'C.UTF-8'
      }
    }
  );

  const report = JSON.parse(output);

  assert.equal(report.passed, true);
  assert.equal(report.specificationBaselineCount, 5);
  assert.equal(report.edk2ReleaseTag, 'edk2-stable202605');
  assert.equal(report.edk2PackageCount, 28);
  assert.equal(report.edk2DependencyCount, 13);
  assert.equal(report.phaseCount, 8);
  assert.equal(report.architectureTargetCount, 6);
  assert.ok(report.capabilityGroupCount >= 30);
  assert.ok(report.registrationCount >= 500);
  assert.equal(report.allDeclaredGroupsRegistered, true);
  assert.equal(report.registrationDoesNotMeanImplemented, true);
  assert.equal(
    report.allOfficialProtocolIdentifiersExhaustivelyRegistered,
    false
  );
  assert.equal(report.allUefiProtocolsImplemented, false);
  assert.equal(report.allDriversComplete, false);
  assert.equal(report.allEdk2PackagesBuilt, false);
  assert.equal(report.physicalHardwareBootVerified, false);
  assert.equal(report.secureBootVerified, false);
  assert.equal(report.productionFirmwareReady, false);
  assert.equal(report.autonomousReligiousRulingAllowed, false);
  assert.equal(report.qualifiedScholarReviewRequired, true);
});
