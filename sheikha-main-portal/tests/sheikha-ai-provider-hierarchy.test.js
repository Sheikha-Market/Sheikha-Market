'use strict';

const assert = require('assert');
const {
    createSheikhaAIRouter,
    createSheikhaRouterGovernor,
    createSheikhaProvider
} = require('../lib/sheikha-ai-router/index.js');

async function main() {
    const env = {
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        SHEIKHA_AI_ROUTER_UPSTREAM: 'sheikha',
        SHEIKHA_AI_ROUTER_MODEL: 'SheikhaNeural-v1.0',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'SheikhaNeural-v1.0',
        SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true',
        SHEIKHA_AI_ROUTER_MAX_TOKENS: '1024'
    };

    const router = createSheikhaAIRouter(env);
    const governor = createSheikhaRouterGovernor(env);

    const governed = governor.governChatRequest(
        {
            model: 'SheikhaNeural-v1.0',
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

    const provider = createSheikhaProvider({
        env,
        sheikhaAdapter: {
            id: 'sheikha',
            visibility: 'native-upstream',
            async chatCompletions(payload) {
                return {
                    id: 'native-test',
                    model: payload.model,
                    choices: [{ message: { role: 'assistant', content: 'شيخة' } }]
                };
            }
        }
    });

    const response = await provider.chatCompletions({
        messages: [{ role: 'user', content: 'السلام عليكم' }]
    });

    assert.strictEqual(response.sheikha.provider, 'sheikha');
    assert.strictEqual(response.sheikha.authority, 'sheikha-governance');
    assert.strictEqual(response.sheikha.routing, 'sheikha-ai-router');
    assert.strictEqual(response.sheikha.upstream, 'sheikha');

    const status = provider.status();
    assert.strictEqual(status.provider, 'sheikha');
    assert.strictEqual(status.upstream, 'sheikha');
    assert.strictEqual(status.upstreamVisibility, 'native');

    console.log('Sheikha AI Provider hierarchy tests: PASS');
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
