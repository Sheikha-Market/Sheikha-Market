'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');

const validator = path.join(__dirname, '..', 'scripts', 'validate-ai-router-config.js');

function run(extraEnv = {}) {
    return spawnSync(process.execPath, [validator], {
        env: {
            ...process.env,
            SHEIKHA_AI_ROUTER_ENABLED: 'false',
            SHEIKHA_AI_ROUTER_API_KEY: '',
            SHEIKHA_AI_ROUTER_MODEL: '',
            SHEIKHA_AI_ROUTER_ALLOWED_MODELS: '',
            SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true',
            ...extraEnv
        },
        encoding: 'utf8'
    });
}

{
    const result = run();
    assert.strictEqual(result.status, 0, result.stderr || result.stdout);
    const body = JSON.parse(result.stdout);
    assert.strictEqual(body.name, 'Sheikha AI Router');
    assert.strictEqual(body.provider, 'sheikha-ai-router');
    assert.strictEqual(body.upstream, 'hostinger-ai-router');
    assert.strictEqual(body.checks.enabled, false);
}

{
    const result = run({
        SHEIKHA_AI_ROUTER_ENABLED: 'true'
    });
    assert.strictEqual(result.status, 1);
}

{
    const result = run({
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        SHEIKHA_AI_ROUTER_API_KEY: 'test-only-not-a-real-secret',
        SHEIKHA_AI_ROUTER_MODEL: 'test-model',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'test-model'
    });
    assert.strictEqual(result.status, 0, result.stderr || result.stdout);
    const body = JSON.parse(result.stdout);
    assert.strictEqual(body.checks.keyPresent, true);
    assert.strictEqual(body.checks.modelAllowed, true);
    assert.strictEqual(body.checks.upstreamOfficial, true);
}

{
    const result = run({
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        SHEIKHA_AI_ROUTER_API_KEY: 'test-only-not-a-real-secret',
        SHEIKHA_AI_ROUTER_MODEL: 'blocked-model',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'allowed-model'
    });
    assert.strictEqual(result.status, 1);
}

console.log('Sheikha AI Router validator tests: PASS');
