'use strict';

const assert = require('assert');
const {
    buildStatus,
    planCapabilityRoute
} = require('../lib/sheikha-ai-capability-fabric');

{
    const status = buildStatus();
    assert.strictEqual(status.providerIdentity, 'sheikha');
    assert.strictEqual(status.defaultUpstream, 'sheikha');
    assert.ok(status.summary.nativeCapabilities >= 1);
}

{
    const plan = planCapabilityRoute({
        capabilities: ['text-chat', 'rag'],
        dataClass: 'internal'
    });
    assert.strictEqual(plan.ok, true);
    assert.strictEqual(plan.decision, 'ALLOW_NATIVE');
    assert.strictEqual(plan.provider, 'sheikha');
    assert.strictEqual(plan.upstream, 'sheikha');
    assert.strictEqual(plan.executionPerformed, false);
}

{
    const plan = planCapabilityRoute({
        capabilities: ['web-search'],
        dataClass: 'restricted',
        allowExternal: true
    });
    assert.strictEqual(plan.ok, false);
    assert.strictEqual(plan.decision, 'DENY');
    assert.strictEqual(plan.reason, 'RESTRICTED_DATA_EXTERNAL_ROUTING_BLOCKED');
}

{
    const plan = planCapabilityRoute({
        capabilities: ['structured-output'],
        dataClass: 'internal',
        allowExternal: false
    });
    assert.strictEqual(plan.ok, false);
    assert.strictEqual(plan.decision, 'PLAN_EXTERNAL_ONLY');
    assert.ok(Array.isArray(plan.candidates));
    assert.strictEqual(plan.executionPerformed, false);
}

{
    const plan = planCapabilityRoute({
        capabilities: ['not-a-real-capability']
    });
    assert.strictEqual(plan.ok, false);
    assert.strictEqual(plan.reason, 'UNKNOWN_CAPABILITY');
}

console.log('Sheikha AI Capability Fabric tests: PASS');
