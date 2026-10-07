'use strict';

const assert = require('assert');
const {
    createSheikhaAIRouter,
    SHEIKHA_NATIVE_BASE,
    SHEIKHA_NATIVE_MODEL,
    HOSTINGER_UPSTREAM_BASE
} = require('../lib/sheikha-ai-router');

{
    const router = createSheikhaAIRouter({});
    assert.strictEqual(router.provider, 'sheikha');
    assert.strictEqual(router.upstream, 'sheikha');
    assert.strictEqual(router.enabled, true);
    assert.strictEqual(router.configured, true);
    assert.strictEqual(router.baseUrl, SHEIKHA_NATIVE_BASE);
    assert.strictEqual(router.model, SHEIKHA_NATIVE_MODEL);
    assert.strictEqual(router.keyPresent, false);
    assert.strictEqual(router.getClientConfig().native, true);
}

{
    assert.throws(
        () =>
            createSheikhaAIRouter({
                SHEIKHA_AI_ROUTER_UPSTREAM: 'hostinger',
                SHEIKHA_AI_ROUTER_ENABLED: 'true',
                SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true'
            }),
        /SHEIKHA_AI_ROUTER_POLICY_BLOCK/
    );
}

{
    const router = createSheikhaAIRouter({
        SHEIKHA_AI_ROUTER_UPSTREAM: 'hostinger',
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        HOSTINGER_AI_ROUTER_API_KEY: 'test-only-not-a-real-secret',
        HOSTINGER_AI_ROUTER_MODEL: 'allowed-model',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'allowed-model',
        SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true'
    });

    assert.strictEqual(router.upstream, 'hostinger');
    assert.strictEqual(router.baseUrl, HOSTINGER_UPSTREAM_BASE);
    assert.strictEqual(router.getClientConfig().native, false);
    assert.ok(router.getClientConfig().apiKey);
}

console.log('Sheikha AI Router runtime tests: PASS');
