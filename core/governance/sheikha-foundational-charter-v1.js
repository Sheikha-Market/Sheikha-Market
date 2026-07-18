'use strict';

const fs = require('fs');
const path = require('path');

const CONTRACT_PATH = path.join(
  __dirname,
  '../../runtime/governance/foundational-charter/v1/sheikha-foundational-charter-v1.json'
);

function loadContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
}

function getStatus() {
  const contract = loadContract();
  return {
    system: contract.system,
    version: contract.version,
    status: contract.status,
    owner: contract.owner,
    systemNature: contract.systemNature,
    governance: contract.governance,
    continualImprovement: contract.continualImprovement,
    architecture: contract.architecture
  };
}

function selfVerify() {
  const c = loadContract();
  const checks = {
    correctSystem: c.system === 'SHEIKHA_FOUNDATIONAL_CHARTER_V1',
    ownerIsHuman: c.owner && c.owner.human === true,
    noOfficialRepresentationClaim:
      c.owner &&
      c.owner.officialRepresentationClaimed === false &&
      c.systemNature.officialGroupRepresentative === false,
    softwareHasNoReligiousIdentity: c.systemNature.softwareHasReligion === false,
    noReligiousAuthority:
      c.systemNature.issuesFatwa === false &&
      c.systemNature.religiousAuthority === false,
    humanDecisionAuthority: c.governance.humanDecisionAuthority === true,
    noHarmRule: c.governance.noHarmRule === 'لا ضرر ولا ضرار',
    improvementIsHumanGoverned:
      c.continualImprovement.enabled === true &&
      c.continualImprovement.selfAmendmentAllowed === false &&
      c.continualImprovement.humanReviewRequired === true,
    errorIsNotBlanketExcuse:
      c.ijtihadAndError.blanketErrorExcuse === false &&
      c.ijtihadAndError.harmAuthorization === false,
    writtenContractPolicy:
      c.contracts.writtenByDefaultForMaterialOrDeferredTransactions === true &&
      c.contracts.humanApprovalRequired === true,
    websiteIsPrimarySurface:
      c.architecture.websiteRole === 'PRIMARY_PRODUCT_SURFACE',
    editorsAreOptionalTools:
      c.architecture.editorsRole === 'OPTIONAL_DEVELOPMENT_TOOLS',
    learningAspirationIsNotSelfCredential:
      c.owner.knowledgeAspiration &&
      c.owner.knowledgeAspiration.statementType ===
        'OWNER_PRAYER_AND_LEARNING_INTENT' &&
      c.owner.knowledgeAspiration.scholarStatusClaimed === false &&
      c.owner.knowledgeAspiration.divineRewardGuaranteed === false &&
      c.owner.knowledgeAspiration.religiousRankClaimed === false,
    ownedSystemAttributionPreservesBoundaries:
      c.ownershipAndAttribution &&
      c.ownershipAndAttribution.ownerAttributedLearningProfileAllowed === true &&
      c.ownershipAndAttribution.automaticScholarTitleAllowed === false &&
      c.ownershipAndAttribution.divineRewardMayBeRecordedAsAsset === false &&
      c.ownershipAndAttribution.thirdPartyRightsRetained === true
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    system: c.system,
    checks,
    failedChecks,
    passed: failedChecks.length === 0
  };
}

module.exports = {
  CONTRACT_PATH,
  loadContract,
  getStatus,
  selfVerify
};
