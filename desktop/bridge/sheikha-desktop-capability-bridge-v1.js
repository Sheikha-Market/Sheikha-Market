'use strict';

const crypto = require('node:crypto');

const { evaluateDesktopCapability } = require(
  '../security/sheikha-desktop-governance-gate-v1'
);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function sha256Json(value) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function normalizeAdapters(adapters) {
  return new Map(Object.entries(adapters || {}).map(([capability, adapter]) => {
    if (!adapter || typeof adapter.execute !== 'function' || !String(adapter.id || '').trim()) {
      throw new Error(`Invalid execution adapter for capability: ${capability}`);
    }
    return [capability, Object.freeze({ id: String(adapter.id), execute: adapter.execute })];
  }));
}

function createEvidence(intent, decision, adapterId, outcome, detail = {}) {
  const evidence = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_DESKTOP_AUDIT_EVIDENCE_V1',
    requestId: intent.requestId,
    capability: intent.capability,
    actorId: intent.actor.id,
    requestedAt: intent.requestedAt,
    payloadSha256: sha256Json(intent.payload),
    governanceDecisionId: decision.decisionId,
    governanceStatus: decision.status,
    governanceReason: decision.reason,
    adapterId: adapterId || null,
    outcome,
    detail
  };
  return Object.freeze({ ...evidence, evidenceSha256: sha256Json(evidence) });
}

function createCapabilityBridge({ adapters = {}, auditSink = null } = {}) {
  const registry = normalizeAdapters(adapters);
  const writeAudit = typeof auditSink === 'function' ? auditSink : null;

  return Object.freeze({
    registeredCapabilities: Object.freeze([...registry.keys()].sort()),
    async execute(intent, context = {}) {
      const decision = evaluateDesktopCapability(intent, context);
      if (!decision.permitted) {
        const evidence = createEvidence(intent, decision, null, 'BLOCKED');
        if (writeAudit) await writeAudit(evidence);
        return { ok: false, status: 'BLOCKED', decision, evidence };
      }

      const adapter = registry.get(intent.capability);
      if (!adapter) {
        const blockedDecision = {
          ...decision,
          permitted: false,
          status: 'DENIED',
          reason: 'EXECUTION_ADAPTER_NOT_REGISTERED'
        };
        const evidence = createEvidence(intent, blockedDecision, null, 'BLOCKED');
        if (writeAudit) await writeAudit(evidence);
        return { ok: false, status: 'BLOCKED', decision: blockedDecision, evidence };
      }

      if (decision.humanApprovalRequired && !writeAudit) {
        const blockedDecision = {
          ...decision,
          permitted: false,
          status: 'DENIED',
          reason: 'DURABLE_AUDIT_SINK_REQUIRED_FOR_HIGH_IMPACT_ACTION'
        };
        return {
          ok: false,
          status: 'BLOCKED',
          decision: blockedDecision,
          evidence: createEvidence(intent, blockedDecision, adapter.id, 'BLOCKED')
        };
      }

      const authorizedEvidence = createEvidence(intent, decision, adapter.id, 'AUTHORIZED');
      if (writeAudit) await writeAudit(authorizedEvidence);
      try {
        const output = await adapter.execute({
          requestId: intent.requestId,
          capability: intent.capability,
          payload: intent.payload,
          actor: intent.actor,
          governanceDecision: decision
        });
        const evidence = createEvidence(intent, decision, adapter.id, 'SUCCEEDED', {
          outputSha256: sha256Json(output ?? null)
        });
        if (writeAudit) await writeAudit(evidence);
        return { ok: true, status: 'SUCCEEDED', output, decision, evidence };
      } catch (error) {
        const evidence = createEvidence(intent, decision, adapter.id, 'FAILED', {
          errorName: error?.name || 'Error',
          errorMessageSha256: sha256Json(String(error?.message || 'Execution adapter failed.'))
        });
        if (writeAudit) await writeAudit(evidence);
        return { ok: false, status: 'FAILED', decision, evidence };
      }
    }
  });
}

function createReadOnlyStatusAdapters({ runtimeStatus, releaseStatus }) {
  if (typeof runtimeStatus !== 'function' || typeof releaseStatus !== 'function') {
    throw new Error('Read-only status providers are required.');
  }
  return Object.freeze({
    'runtime.status.read': {
      id: 'SHEIKHA_DESKTOP_RUNTIME_STATUS_READ_ADAPTER_V1',
      execute: async () => runtimeStatus()
    },
    'release.status.read': {
      id: 'SHEIKHA_DESKTOP_RELEASE_STATUS_READ_ADAPTER_V1',
      execute: async () => releaseStatus()
    }
  });
}

module.exports = {
  createCapabilityBridge,
  createReadOnlyStatusAdapters,
  sha256Json
};
