'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

test('Sheikha UEFI EDK II exact local mapping V1', () => {
  const verifier = path.resolve(
    __dirname,
    '../tools/verification/sheikha-uefi-edk2-guid-mapping-v1-verifier.cjs'
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
  assert.equal(report.sourceTag, 'edk2-stable202605');
  assert.ok(report.packageCount >= 20);
  assert.ok(report.decFileCount > 0);
  assert.ok(report.dscFileCount > 0);
  assert.ok(report.infFileCount > 0);
  assert.ok(report.headerCount > 0);
  assert.ok(report.headerSymbolRecordCount > 0);
  assert.ok(report.decProtocolPpiGuidRecordCount > 0);
  assert.equal(report.registrationCount, 884);
  assert.equal(report.buildTargetCount, 7);
  assert.equal(report.fuzzyGuessingUsed, false);
  assert.equal(report.registrationDoesNotMeanImplemented, true);
  assert.equal(
    report.allOfficialProtocolIdentifiersExhaustivelyRegistered,
    false
  );
  assert.equal(report.allUefiProtocolsImplemented, false);
  assert.equal(report.firmwareBuildExecuted, false);
  assert.equal(report.physicalHardwareVerified, false);
});
