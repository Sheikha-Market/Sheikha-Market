    'use strict';

    const eventFabric = Object.freeze({
  "auditReplay": true,
  "classes": [
    "SOURCE_CHANGED",
    "LAW_OR_STANDARD_CHANGED",
    "RIGHTS_OR_LICENSE_CHANGED",
    "ASSET_STATE_CHANGED",
    "RESOURCE_LEVEL_CHANGED",
    "INPUT_RECEIVED",
    "PROCESS_STARTED",
    "OUTPUT_PRODUCED",
    "OUTCOME_MEASURED",
    "CUSTOMER_JOURNEY_EVENT",
    "COMMERCIAL_EVENT",
    "REVENUE_EVENT",
    "QUALITY_EVENT",
    "SECURITY_EVENT",
    "PRIVACY_EVENT",
    "RISK_EVENT",
    "INCIDENT_EVENT",
    "RECOVERY_EVENT",
    "PERFORMANCE_EVENT",
    "BENEFIT_EVENT",
    "FEEDBACK_EVENT",
    "IMPROVEMENT_PROPOSED",
    "IMPROVEMENT_AUTHORIZED",
    "DEPRECATION_EVENT",
    "HANDOVER_EVENT",
    "REVIEW_DUE",
    "EVIDENCE_STALE",
    "DEPENDENCY_CHANGED"
  ],
  "count": 28,
  "idempotencyRequired": true
});

    function createEvent(type, objectId, source, evidence, correlationId, at = new Date().toISOString()) {
  if (!eventFabric.classes.includes(type)) throw new Error('UNKNOWN_GOVERNANCE_EVENT');
  if (!objectId || !source || !evidence || !correlationId) throw new Error('INCOMPLETE_GOVERNANCE_EVENT');
  return Object.freeze({ type, objectId, source, evidence, correlationId, at });
}

    module.exports = { eventFabric, createEvent };
