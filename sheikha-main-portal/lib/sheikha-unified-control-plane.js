'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const runtimeKernel = require('../runtime/sheikha-runtime-kernel');
const governanceFabric = require('../governance/sheikha-governance-fabric');
const temporalStore = require('./sheikha-temporal-event-store');
const policyEngine = require('./sheikha-policy-engine-v2');
const contractRegistry = require('./sheikha-service-contract-registry');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SHEIKHA_CONTROL_PLANE_SECRET || 'sheikha-control-plane-dev-secret';

let _started = false;

function genCorrelationId() {
    return `corr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

function start() {
    if (_started) return status();
    runtimeKernel.boot();
    governanceFabric.start();
    _started = true;
    return status();
}

function evaluateSafety(action, context = {}) {
    const riskBase = action === 'deploy.production' ? 65 : action === 'deploy.staging' ? 40 : 20;
    const riskPenalty = context.touchesSecrets ? 25 : 0;
    const destructivePenalty = context.destructive ? 30 : 0;
    const score = Math.max(0, Math.min(100, riskBase + riskPenalty + destructivePenalty));
    return {
        passed: score < 80 && !context.incidentOpen,
        riskScore: score,
        reason: score >= 80 ? 'risk too high' : 'safety thresholds passed',
    };
}

function evaluateApproval(action, context = {}) {
    const needsApproval = action === 'deploy.production' || action === 'modify.secrets';
    const approved = !needsApproval || Boolean(context.approvedBy);
    return {
        needsApproval,
        approved,
        approvedBy: context.approvedBy || null,
        reason: approved ? 'approval satisfied' : 'missing required approval',
    };
}

function issueDelegationToken(payload = {}, expiresIn = '5m') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn, issuer: 'sheikha-control-plane' });
}

function verifyDelegationToken(token) {
    return jwt.verify(token, JWT_SECRET, { issuer: 'sheikha-control-plane' });
}

function evaluateDecision(input = {}) {
    start();
    const actor = input.actor || 'system';
    const action = input.action || 'unknown';
    const target = input.target || 'runtime';
    const category = input.category || 'operations';
    const correlationId = input.correlationId || genCorrelationId();
    const context = input.context || {};

    const policy = policyEngine.evaluate({
        action,
        category,
        principal: actor,
        actorType: context.actorType || 'human',
        context,
    });
    const safety = evaluateSafety(action, context);
    const approval = evaluateApproval(action, context);
    const allowed = Boolean(policy.allowed && safety.passed && approval.approved);

    const decision = {
        correlationId,
        actor,
        action,
        target,
        category,
        flow: {
            policyCheck: policy,
            safetyCheck: safety,
            approvalState: approval,
            auditWrite: true,
        },
        allowed,
        reason: allowed ? 'decision approved' : [policy.reason, safety.reason, approval.reason].join(' | '),
        decidedAt: new Date().toISOString(),
    };

    governanceFabric.audit('control-plane:decision', actor, decision);
    temporalStore.appendEvent({
        correlationId,
        type: 'decision',
        actor,
        action,
        target,
        decision,
    });

    return {
        ...decision,
        token: allowed ? issueDelegationToken({ actor, action, target, correlationId }) : null,
    };
}

function authorizeServiceCall(input = {}) {
    const correlationId = input.correlationId || genCorrelationId();
    const contractDecision = contractRegistry.authorizeCommunication(input);
    temporalStore.appendEvent({
        correlationId,
        type: 'service-authorization',
        actor: input.actor || 'system',
        action: input.action || 'call',
        target: `${input.source || 'unknown'}->${input.target || 'unknown'}`,
        decision: contractDecision,
    });
    return { correlationId, ...contractDecision };
}

function registerServiceContract(contract) {
    const saved = contractRegistry.registerContract(contract);
    const correlationId = genCorrelationId();
    temporalStore.appendEvent({
        correlationId,
        type: 'service-contract',
        actor: contract.owner || 'system',
        action: 'register.contract',
        target: contract.service,
        decision: { allowed: true, reason: 'contract updated', contract: saved },
    });
    return saved;
}

function timeline(limit = 20) {
    return temporalStore.replay({ limit });
}

function currentGovernanceDecision() {
    const events = temporalStore.replay({ type: 'decision', limit: 1 });
    const latest = events[0] || null;
    return latest
        ? { status: latest.decision.allowed ? 'Allowed' : 'Blocked', reason: latest.decision.reason, correlationId: latest.correlationId }
        : { status: 'Unknown', reason: 'no decisions recorded', correlationId: null };
}

function status() {
    return {
        controlPlane: { started: _started, name: 'Unified Operational Fabric v2', mode: 'human-governed' },
        runtime: runtimeKernel.status(),
        governance: governanceFabric.status(),
        temporalMemory: temporalStore.summary(),
        contracts: contractRegistry.summary(),
        currentDecision: currentGovernanceDecision(),
    };
}

function registerPolicyException(exceptionInput) {
    const entry = policyEngine.registerTemporaryException(exceptionInput);
    const correlationId = genCorrelationId();
    temporalStore.appendEvent({
        correlationId,
        type: 'policy-exception',
        actor: exceptionInput?.signedBy || 'unknown',
        action: exceptionInput?.action || 'unknown',
        target: 'policy-engine',
        decision: { allowed: true, reason: 'temporary exception registered', exceptionId: entry.exceptionId },
    });
    return entry;
}

function operationalSnapshot(limit = 25) {
    return {
        status: status(),
        timeline: timeline(limit),
        rollbackReadiness: {
            available: true,
            basis: 'event snapshots + deployment gates',
        },
    };
}

module.exports = {
    start,
    status,
    timeline,
    evaluateDecision,
    issueDelegationToken,
    verifyDelegationToken,
    authorizeServiceCall,
    registerServiceContract,
    registerPolicyException,
    operationalSnapshot,
};
