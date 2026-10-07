'use strict';

const assert = require('assert');
const {
    createSheikhaAIRouter,
    createSheikhaRouterGovernor,
    createSheikhaProvider
} = require('../lib/sheikha-ai-router');

async function main() {
    const env = {
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        SHEIKHA_AI_ROUTER_UPSTREAM: 'hostinger',
        SHEIKHA_AI_ROUTER_BASE_URL: 'https://router.hostinger.com/v1',
        SHEIKHA_AI_ROUTER_API_KEY: 'test-only-not-a-real-secret',
        SHEIKHA_AI_ROUTER_MODEL: 'allowed-model',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'allowed-model,fallback-model',
        SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true',
        SHEIKHA_AI_ROUTER_MAX_TOKENS: '1024'
    };

    {
        const router = createSheikhaAIRouter(env);
        const governor = createSheikhaRouterGovernor(env);
        const governed = governor.governChatRequest(
            {
                model: 'allowed-model',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5000,
                apiKey: 'must-not-survive'
            },
            router
        );

        assert.strictEqual(governed.decision.authority, 'sheikha-governance');
        assert.strictEqual(governed.decision.provider, 'sheikha');
        assert.strictEqual(governed.payload.max_tokens, 1024);
        assert.ok(!('apiKey' in governed.payload));
    }

    {
        const calls = [];
        const provider = createSheikhaProvider({
            env,
            fetchImpl: async (url, init) => {
                calls.push({ url, init });
                return {
                    ok: true,
                    status: 200,
                    async text() {
                        return JSON.stringify({
                            id: 'test-response',
                            choices: [{ message: { role: 'assistant', content: 'ok' } }]
                        });
                    }
                };
            }
        });

        const response = await provider.chatCompletions({
            messages: [{ role: 'user', content: 'hello' }]
        });

        assert.strictEqual(calls.length, 1);
        assert.strictEqual(calls[0].url, 'https://router.hostinger.com/v1/chat/completions');
        assert.strictEqual(response.sheikha.provider, 'sheikha');
        assert.strictEqual(response.sheikha.authority, 'sheikha-governance');
        assert.strictEqual(response.sheikha.routing, 'sheikha-ai-router');
        assert.strictEqual(response.sheikha.upstream, 'hostinger');

        const status = provider.status();
        assert.strictEqual(status.provider, 'sheikha');
        assert.strictEqual(status.upstreamVisibility, 'private');
    }

    console.log('Sheikha AI Provider hierarchy tests: PASS');
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
