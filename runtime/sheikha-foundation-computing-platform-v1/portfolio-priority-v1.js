    'use strict';

    const portfolioPriority = Object.freeze({
  "factors": [
    "PUBLIC_BENEFIT",
    "USER_BENEFIT",
    "TIME_TO_VALUE",
    "REVENUE_POTENTIAL",
    "READINESS",
    "DEPENDENCY_UNBLOCKING",
    "RISK_REDUCTION",
    "STRATEGIC_AND_SCIENTIFIC_ADVANCEMENT",
    "COST_EFFICIENCY",
    "OPERABILITY"
  ],
  "humanWorthNotPriorityFactor": true,
  "levels": [
    "P0_GOVERNANCE_SAFETY_EVIDENCE_AND_BLOCKERS",
    "P1_NEAR_TERM_USER_BENEFIT_AND_REVENUE_ENABLERS",
    "P2_FOUNDATION_REUSE_AND_INTEGRATION_UNBLOCKERS",
    "P3_SCALING_INDUSTRY_IOT_GEOSPATIAL_SPACE_AND_ADVANCED_DATA",
    "P4_FRONTIER_RESEARCH_AND_LONG_TERM_EXPANSION"
  ],
  "shariaOrSafetyGatesOverridePriorityScore": true
});



    module.exports = { portfolioPriority };
