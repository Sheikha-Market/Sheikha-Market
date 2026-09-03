    'use strict';

    const policyLifecycle = Object.freeze({
  "autoChangeWithoutAuthorizationAllowed": false,
  "conflictDetectionRequired": true,
  "effectiveDateRequired": true,
  "ownerRequired": true,
  "sourceEvidenceRequired": true,
  "stages": [
    "DRAFT",
    "SOURCE_BIND",
    "REVIEW",
    "APPROVE",
    "ACTIVATE",
    "MONITOR",
    "REASSESS",
    "AMEND",
    "SUPERSEDE",
    "RETIRE",
    "ARCHIVE"
  ],
  "versioningRequired": true
});



    module.exports = { policyLifecycle };
