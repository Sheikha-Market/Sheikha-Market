'use strict';

const LICENSES = Object.freeze([
  {
    id:'LicenseRef-Sheikha-Visual-Fabric-1.0',
    type:'ORIGINAL_SHEIKHA_SOFTWARE_LICENSE',
    scope:'original Sheikha runtime, contracts, adapters, policy code, scene descriptors and orchestration code',
    thirdPartyIncluded:false,
    patentGrant:false,
    governmentRegistrationClaim:false,
    trademarkRegistrationClaim:false,
    redistribution:'only under an executed Sheikha commercial/enterprise agreement',
    sourceCode:'internal unless separately licensed',
    attributionRequired:true
  },
  {
    id:'SHEIKHA_VISUAL_COMMERCIAL_PROFILE_V1',
    type:'COMMERCIAL_LICENSE_PROFILE',
    requires:['executed-commercial-agreement','SBOM-review','third-party-license-review','codec-patent-review-where-applicable','security-review'],
    customerDataTrainingDefault:false
  },
  {
    id:'SHEIKHA_VISUAL_ENTERPRISE_ONPREM_PROFILE_V1',
    type:'ENTERPRISE_ON_PREM_LICENSE_PROFILE',
    requires:['executed-enterprise-agreement','deployment-scope','support-scope','security-boundary'],
    customerOwnsProviderAccounts:true
  }
]);

const RIGHTS = Object.freeze({
  sheikhaNameAppliesToOriginalCodeOnly:true,
  thirdPartyNamesRemainWithOwners:true,
  thirdPartyLicensesPreserved:true,
  noThirdPartyRelicensing:true,
  noTrademarkOwnershipInference:true,
  noPatentOwnershipInference:true
});

module.exports = { LICENSES, RIGHTS };
