    'use strict';

    const resourceLifecycle = Object.freeze({
  "conservationWhenScarce": true,
  "noArtificialScarcity": true,
  "noMonopolisticWithholding": true,
  "ownedAndNonOwnedSupported": true,
  "rarityProfileRequired": true,
  "rightsVerificationRequired": true,
  "states": [
    "AVAILABLE",
    "ALLOCATED",
    "IN_USE",
    "CONSTRAINED",
    "SCARCE",
    "DEGRADED",
    "MAINTENANCE",
    "RESERVED",
    "EXHAUSTED",
    "RETIRED"
  ]
});



    module.exports = { resourceLifecycle };
