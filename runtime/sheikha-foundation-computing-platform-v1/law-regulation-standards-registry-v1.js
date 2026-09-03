    'use strict';

    const legalRegistrySchema = Object.freeze({
  "fields": [
    "jurisdiction",
    "authority",
    "title",
    "identifier",
    "version",
    "effectiveFrom",
    "effectiveTo",
    "status",
    "officialSource",
    "applicability",
    "obligations",
    "prohibitions",
    "evidence",
    "supersedes",
    "conflicts",
    "lastVerifiedAt",
    "nextReviewAt"
  ],
  "periodicRevalidationRequired": true,
  "staleCanBeTreatedCurrent": false,
  "statuses": [
    "CURRENT_VERIFIED",
    "SUPERSEDED",
    "PENDING_EFFECTIVE",
    "EXPIRED_OR_REPEALED",
    "UNKNOWN_REQUIRES_VERIFICATION"
  ]
});



    module.exports = { legalRegistrySchema };
