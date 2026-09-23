    'use strict';

    const informationGovernance = Object.freeze({
  "required": [
    "source",
    "rights",
    "timestamp",
    "verificationState",
    "reviewDate"
  ],
  "staleCanTriggerHighImpactExecution": false,
  "states": [
    "UNVERIFIED",
    "SOURCE_BOUND",
    "VERIFIED",
    "DERIVED",
    "STALE",
    "SUPERSEDED",
    "RESTRICTED",
    "ARCHIVED"
  ],
  "unverifiedCanTriggerHighImpactExecution": false
});



    module.exports = { informationGovernance };
