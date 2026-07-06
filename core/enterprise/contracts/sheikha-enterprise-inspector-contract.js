"use strict";

function createEmptyEnterpriseInspector(reason = "INSPECTOR_NOT_AVAILABLE") {
  return {
    system: "SHEIKHA_ENTERPRISE_INSPECTOR_CONTRACT",
    status: "DEGRADED",
    reason,
    compact: true,
    timestamp: new Date().toISOString()
  };
}

function safeCompactInspectorContext(snapshot = {}) {
  return {
    system: snapshot.system || "SHEIKHA_ENTERPRISE_INSPECTOR_COMPACT",
    status: snapshot.status || "UNKNOWN",
    reason: snapshot.reason || null,
    timestamp: snapshot.timestamp || new Date().toISOString()
  };
}

module.exports = {
  createEmptyEnterpriseInspector,
  safeCompactInspectorContext
};
