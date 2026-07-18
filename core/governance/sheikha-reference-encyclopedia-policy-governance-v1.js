'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime',
  'governance',
  'reference-encyclopedia',
  'v1',
  'sheikha-reference-encyclopedia-policy-governance-v1.json'
);

function loadContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
}

function verifyContract(contract = loadContract()) {
  const roles = contract.roles || {};
  const boundaries = contract.authorityBoundaries || {};
  const impact = contract.highImpactPolicy || {};
  const governance = contract.governance || {};
  const architecture = contract.productArchitecture || {};
  const deployment = contract.deployment || {};

  const checks = {
    systemId:
      contract.system ===
      'SHEIKHA_REFERENCE_ENCYCLOPEDIA_POLICY_GOVERNANCE_V1',
    referenceRole:
      roles.internalReference === true,
    encyclopediaRole:
      roles.evidenceBasedEncyclopedia === true,
    policyDraftingRole:
      roles.internalPolicyDraftingEngine === true &&
      roles.internalRegulationDraftingEngine === true,
    governanceRole:
      roles.governanceAndCompliancePlatform === true,
    humanAuthorityOnly:
      boundaries.humanAuthorityOnly === true,
    noReligiousLegislativeAuthority:
      boundaries.religiousLegislativeAuthority === false,
    noGovernmentRegulatoryAuthority:
      boundaries.governmentRegulatoryAuthority === false,
    noJudicialAuthority:
      boundaries.judicialAuthority === false &&
      boundaries.officialArbitrationAuthority === false,
    noOfficialRepresentation:
      boundaries.officialRepresentation === false,
    noSoftwareHumanOrReligiousClaims:
      boundaries.softwareFaithClaimed === false &&
      boundaries.softwareConsciousnessClaimed === false &&
      boundaries.fatwaAuthority === false,
    noUnseenOrFutureGuaranteeClaims:
      boundaries.unseenKnowledgeClaimed === false &&
      boundaries.futureGuaranteeClaimed === false,
    humanApprovalForHighImpact:
      impact.automaticApprovalAllowed === false &&
      impact.writtenHumanApprovalRequired === true,
    evidenceAndRollback:
      impact.evidencePreservationRequired === true &&
      impact.rollbackRequired === true,
    truthfulVersionedReference:
      governance.truthfulnessRequired === true &&
      governance.evidenceBeforeClaim === true &&
      governance.sourceAttributionRequired === true &&
      governance.versioningRequired === true,
    websitePrimary:
      architecture.websitePrimaryProductSurface === true &&
      architecture.editorsOptionalDevelopmentTools === true &&
      architecture.githubRuntimeDependencyRequired === false,
    noProductionAuthorization:
      deployment.productionChangeAuthorized === false &&
      deployment.serviceRestartAuthorized === false &&
      deployment.packageInstallationAuthorized === false &&
      deployment.cleanupAuthorized === false
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
