    'use strict';

    const projectGovernance = Object.freeze({
  "lifecycle": [
    "INITIATE",
    "PLAN",
    "DESIGN",
    "BUILD",
    "VERIFY",
    "RELEASE",
    "HANDOVER",
    "OPERATE",
    "IMPROVE"
  ],
  "model": [
    "PORTFOLIO",
    "PROGRAM",
    "PROJECT",
    "PRODUCT",
    "SERVICE",
    "OPERATION"
  ],
  "required": [
    "scopeBaseline",
    "requirementsTraceability",
    "workBreakdownStructure",
    "criticalPath",
    "dependencyGraph",
    "riskRegister",
    "issueRegister",
    "decisionLog",
    "assumptionLog",
    "costBaseline",
    "scheduleBaseline",
    "qualityPlan",
    "securityPlan",
    "commercialPlan",
    "operationsHandoverPlan"
  ]
});



    module.exports = { projectGovernance };
