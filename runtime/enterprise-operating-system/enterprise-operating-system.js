const system = {
  system: "SHEIKHA_ENTERPRISE_OPERATING_SYSTEM_V1",
  status: "ACTIVE",
  mode: "GOVERNANCE_OPERATION_PROTECTION_ONLY",
  layers: [
    "MISSION_AUTHORITY",
    "STRATEGY_AUTHORITY",
    "CAPABILITY_AUTHORITY",
    "ENTERPRISE_KNOWLEDGE_GRAPH",
    "ENTERPRISE_HEALTH_INDEX",
    "CONTINUOUS_EXCELLENCE_FABRIC"
  ],
  forbidden: [
    "no attack",
    "no retaliation",
    "no threats",
    "no unauthorized access",
    "no harm"
  ],
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(system, null, 2));
