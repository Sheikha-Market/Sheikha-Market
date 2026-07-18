'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  loadContract,
  verifyContract
} = require('../core/governance/sheikha-license-recognition-v1');

const ROOT = path.resolve(__dirname, '..');
const AR_LICENSE = path.join(
  ROOT,
  'LICENSES',
  'SHEIKHA-PROPRIETARY-GOVERNED-USE-LICENSE-V1-AR.md'
);
const EN_LICENSE = path.join(
  ROOT,
  'LICENSES',
  'SHEIKHA-PROPRIETARY-GOVERNED-USE-LICENSE-V1-EN.md'
);
const ROADMAP = path.join(
  ROOT,
  'docs',
  'legal',
  'SHEIKHA-LICENSE-RECOGNITION-ROADMAP-V1.md'
);

test('license governance contract verifies', () => {
  const result = verifyContract();
  assert.equal(result.verified, true);
});

test('internal adoption is distinct from Saudi official status', () => {
  const contract = loadContract();
  assert.equal(contract.license.internalOwnerAdoption, true);
  assert.equal(
    contract.status.saudiOfficial,
    'PENDING_COMPETENT_AUTHORITY_CERTIFICATE_OR_PROCEDURE'
  );
  assert.equal(contract.truthBoundaries.officialRegistrationClaimed, false);
});

test('no single worldwide approval is claimed', () => {
  const contract = loadContract();
  assert.equal(
    contract.truthBoundaries.singleWorldwideApprovalClaimed,
    false
  );
  assert.match(
    contract.status.worldwide,
    /NO_SINGLE_WORLDWIDE_APPROVAL/
  );
});

test('software is not assigned human, religious, or official authority', () => {
  const contract = loadContract();
  assert.equal(contract.governance.softwareHasFaith, false);
  assert.equal(contract.governance.softwareHasConsciousness, false);
  assert.equal(
    contract.governance.softwareHasOfficialRepresentation,
    false
  );
});

test('written licensing and third-party rights are mandatory', () => {
  const contract = loadContract();
  assert.equal(contract.governance.writtenLicenseRequired, true);
  assert.equal(contract.governance.thirdPartyRightsPreserved, true);
});

test('Arabic and English license texts exist and contain status boundaries', () => {
  const ar = fs.readFileSync(AR_LICENSE, 'utf8');
  const en = fs.readFileSync(EN_LICENSE, 'utf8');

  assert.match(ar, /معتمدة داخليًا/);
  assert.match(ar, /بانتظار الشهادة/);
  assert.match(en, /internal adoption/i);
  assert.match(en, /not a governmental certificate/i);
});

test('roadmap separates internal adoption, Saudi documentation, and international use', () => {
  const roadmap = fs.readFileSync(ROADMAP, 'utf8');
  assert.match(roadmap, /اعتماد المالك داخليًا/);
  assert.match(roadmap, /التوثيق السعودي للمصنف/);
  assert.match(roadmap, /الحماية الدولية لحقوق المؤلف/);
  assert.match(roadmap, /القابلية التعاقدية عبر الحدود/);
});

test('production actions remain unauthorized', () => {
  const contract = loadContract();
  assert.equal(contract.deployment.productionChangeAuthorized, false);
  assert.equal(contract.deployment.serviceRestartAuthorized, false);
  assert.equal(contract.deployment.packageInstallationAuthorized, false);
  assert.equal(contract.deployment.cleanupAuthorized, false);
});
