'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime',
  'governance',
  'licensing',
  'v1',
  'sheikha-license-recognition-v1.json'
);

function loadContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
}

function verifyContract(contract = loadContract()) {
  const checks = {
    systemId:
      contract.system === 'SHEIKHA_LICENSE_RECOGNITION_GOVERNANCE_V1',
    proprietaryType:
      contract.license?.type === 'PROPRIETARY_CONTRACTUAL_LICENSE',
    ownerAdoption:
      contract.license?.internalOwnerAdoption === true,
    noGovernmentApprovalClaim:
      contract.truthBoundaries?.governmentApprovalClaimed === false,
    noInternationalApprovalClaim:
      contract.truthBoundaries?.internationalOrganizationApprovalClaimed === false,
    noSingleWorldwideApprovalClaim:
      contract.truthBoundaries?.singleWorldwideApprovalClaimed === false,
    noOfficialRegistrationClaim:
      contract.truthBoundaries?.officialRegistrationClaimed === false,
    saudiStatusPending:
      contract.status?.saudiOfficial ===
      'PENDING_COMPETENT_AUTHORITY_CERTIFICATE_OR_PROCEDURE',
    humanAuthorityOnly:
      contract.governance?.humanAuthorityOnly === true,
    writtenLicenseRequired:
      contract.governance?.writtenLicenseRequired === true,
    thirdPartyRightsPreserved:
      contract.governance?.thirdPartyRightsPreserved === true,
    noProductionAuthorization:
      contract.deployment?.productionChangeAuthorized === false
  };

  return {
    system: contract.system,
    verified: Object.values(checks).every(Boolean),
    checks
  };
}

module.exports = {
  CONTRACT_PATH,
  loadContract,
  verifyContract
};

if (require.main === module) {
  const result = verifyContract();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.verified ? 0 : 1;
}
