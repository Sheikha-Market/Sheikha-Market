    'use strict';

    const assetRights = Object.freeze({
  "classes": [
    "OWNED",
    "LICENSED",
    "LEASED",
    "SUBSCRIBED",
    "CUSTOMER_OWNED",
    "PARTNER_OWNED",
    "PUBLIC_OPEN",
    "GOVERNMENT_OR_REGULATED_ACCESS",
    "SHARED_COMMON",
    "UNKNOWN_UNVERIFIED"
  ],
  "ownershipClaimWithoutEvidenceAllowed": false,
  "required": [
    "assetId",
    "owner",
    "rightClass",
    "sourceEvidence",
    "costModel",
    "dataUseRights",
    "modelTrainingRights",
    "redistributionRights"
  ],
  "unknownUnverifiedProductionUseAllowed": false
});



    module.exports = { assetRights };
