'use strict';

const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
const { orchestrate } = require('../orchestrator/orchestrator-fabric');
const events = require('./event-bus');
const observability = require('./observability');

class PolicyEnforcementError extends Error {
  constructor(code, message, statusCode = 403) {
    super(message);
    this.name = 'PolicyEnforcementError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function enforce(input = {}, context = {}, options = {}) {
  const actorId = String(context.actorId || '').trim();
  if (!context.trusted || !actorId) {
    throw new PolicyEnforcementError('TRUSTED_IDENTITY_REQUIRED', 'Trusted actor identity is required.', 401);
  }
  const governance = governGovernance({
    actor: actorId,
    channel: 'runtime-fabric-v5',
    action: input.action,
    message: input.message || input.action || ''
  });
  governance.humanApproved = context.humanApproved === true;
  if (options.preApprovedPolicy) governance.preApprovedPolicy = options.preApprovedPolicy;
  const envelope = orchestrate({
    action: input.action,
    mutationRequested: options.mutationRequested !== false,
    mutationClass: options.mutationClass || 'GOVERNED_RUNTIME_WRITE'
  }, governance);
  const allowed = governance.allowed && (
    options.mutationRequested === false || envelope.mutationAuthorized
  );
  events.publish(allowed ? 'GOVERNANCE_APPROVED' : 'GOVERNANCE_BLOCKED', {
    action: input.action,
    governanceStatus: governance.status,
    mutationAuthorized: envelope.mutationAuthorized
  }, { actorId, correlationId: context.correlationId });
  observability.record(allowed ? 'admitted' : 'blocked');
  if (!allowed) {
    throw new PolicyEnforcementError(
      'POLICY_ENFORCEMENT_DENIED',
      governance.violation
        ? `Governance blocked the request: ${governance.violation}`
        : 'Human approval or an approved append-only policy is required.',
      403
    );
  }
  return { governance, envelope };
}

function status() {
  return {
    enforcementPoint: 'SHEIKHA_RUNTIME_FABRIC_V5_PEP',
    status: 'ACTIVE',
    order: ['trusted-identity', 'governance-admission', 'orchestrator-l11', 'dispatch', 'audit'],
    defaultMutationPolicy: 'DENY_WITHOUT_HUMAN_APPROVAL',
    automaticPolicy: 'APPEND_ONLY_TELEMETRY_ONLY'
  };
}

module.exports = { PolicyEnforcementError, enforce, status };
