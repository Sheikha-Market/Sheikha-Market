    'use strict';

    const continuousImprovement = Object.freeze({
  "baselineRequired": true,
  "evidenceRequired": true,
  "hypothesisRequired": true,
  "loop": [
    "DETECT",
    "PRIORITIZE",
    "HYPOTHESIZE",
    "DESIGN",
    "AUTHORIZE",
    "IMPLEMENT",
    "MEASURE",
    "COMPARE",
    "KEEP_OR_ROLLBACK",
    "DOCUMENT"
  ],
  "measurementRequired": true,
  "noveltyAloneIsNotImprovement": true,
  "rollbackWhenSafe": true,
  "signals": [
    "INCIDENT",
    "CUSTOMER_FEEDBACK",
    "PUBLIC_BENEFIT_RESULT",
    "QUALITY_DRIFT",
    "PERFORMANCE_DRIFT",
    "SECURITY_FINDING",
    "PRIVACY_FINDING",
    "LAW_OR_STANDARD_CHANGE",
    "SCIENTIFIC_OR_TECHNICAL_ADVANCEMENT",
    "COST_CHANGE",
    "REVENUE_CHANGE",
    "RESOURCE_SCARCITY_CHANGE",
    "DEPENDENCY_CHANGE",
    "OPERATIONS_FEEDBACK"
  ]
});



    module.exports = { continuousImprovement };
