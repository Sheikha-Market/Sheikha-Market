'use strict';

const assert = require('assert');
const { createSheikhaAIRouter, OFFICIAL_UPSTREAM } = require('../lib/sheikha-ai-router');

{
    const router = createSheikhaAIRouter({
        SHEIKHA_AI_ROUTER_ENABLED: 'false'
    });
    assert.strictEqual(router.provider, 'sheikha-ai-router');
    assert.strictEqual(router.upstream, 'hostinger');
    assert.strictEqual(router.enabled, false);
    assert.strictEqual(router.baseUrl, OFFICIAL_UPSTREAM);
}

{
    assert.throws(
        () =>
            createSheikhaAIRouter({
                SHEIKHA_AI_ROUTER_ENABLED: 'true',
                SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true'
            }),
        /SHEIKHA_AI_ROUTER_POLICY_BLOCK/
    );
}

{
    const router = createSheikhaAIRouter({
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        SHEIKHA_AI_ROUTER_API_KEY: 'test-only-not-a-real-secret',
        SHEIKHA_AI_ROUTER_MODEL: 'allowed-model',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'allowed-model,fallback-model',
        SHEIKHA_AI_ROUTER_FALLBACK_MODELS: 'fallback-model',
        SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true'
    });

    assert.strictEqual(router.enabled, true);
    assert.strictEqual(router.configured, true);
    assert.strictEqual(router.resolveModel(), 'allowed-model');
    assert.strictEqual(router.resolveModel('fallback-model'), 'fallback-model');
    assert.throws(() => router.resolveModel('blocked-model'), /MODEL_NOT_ALLOWED/);

    const client = router.getClientConfig();
    assert.strictEqual(client.baseURL, OFFICIAL_UPSTREAM);
    assert.ok(client.apiKey);
}

console.log('Sheikha AI Router runtime tests: PASS');
