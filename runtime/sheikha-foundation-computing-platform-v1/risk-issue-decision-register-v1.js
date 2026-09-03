    'use strict';

    const registerSchemas = Object.freeze({
  "assumption": [
    "id",
    "statement",
    "owner",
    "validationMethod",
    "reviewAt",
    "status"
  ],
  "decision": [
    "id",
    "decision",
    "context",
    "alternatives",
    "rationale",
    "owner",
    "approvedBy",
    "effectiveAt",
    "evidence"
  ],
  "issue": [
    "id",
    "title",
    "impact",
    "owner",
    "action",
    "dueAt",
    "status",
    "evidence"
  ],
  "risk": [
    "id",
    "title",
    "cause",
    "event",
    "impact",
    "probability",
    "severity",
    "owner",
    "mitigation",
    "contingency",
    "status",
    "reviewAt"
  ]
});



    module.exports = { registerSchemas };
