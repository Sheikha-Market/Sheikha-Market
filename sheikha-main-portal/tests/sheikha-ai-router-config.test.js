'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');

const validator = path.join(__dirname, '..', 'scripts', 'validate-ai-router-config.js');

function run(extraEnv = {}) {
    return spawnSync(process.execPath, [validator], {
        env: {
            ...process.env,
            SHEIKHA_AI_ROUTER_ENABLED: '',
            SHEIKHA_AI_ROUTER_UPSTREAM: '',
            SHEIKHA_AI_ROUTER_BASE_URL: '',
            SHEIKHA_AI_ROUTER_API_KEY: '',
            SHEIKHA_AI_ROUTER_MODEL: '',
            SHEIKHA_AI_ROUTER_ALLOWED_MODELS: '',
            SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'true',
            HOSTINGER_AI_ROUTER_API_KEY: '',
            HOSTINGER_AI_ROUTER_MODEL: '',
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
    assert.strictEqual(body.provider, 'sheikha');
    assert.strictEqual(body.upstream, 'sheikha');
    assert.strictEqual(body.upstreamType, 'native-sheikha');
    assert.strictEqual(body.model, 'SheikhaNeural-v1.0');
    assert.strictEqual(body.checks.enabled, true);
    assert.strictEqual(body.checks.keyPresent, false);
}

{
    const result = run({
        SHEIKHA_AI_ROUTER_UPSTREAM: 'hostinger',
        SHEIKHA_AI_ROUTER_ENABLED: 'true'
    });
    assert.strictEqual(result.status, 1);
}

{
    const result = run({
        SHEIKHA_AI_ROUTER_UPSTREAM: 'hostinger',
        SHEIKHA_AI_ROUTER_ENABLED: 'true',
        HOSTINGER_AI_ROUTER_API_KEY: 'test-only-not-a-real-secret',
        HOSTINGER_AI_ROUTER_MODEL: 'test-model',
        SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'test-model'
    });
    assert.strictEqual(result.status, 0, result.stderr || result.stdout);
    const body = JSON.parse(result.stdout);
    assert.strictEqual(body.upstream, 'hostinger');
    assert.strictEqual(body.checks.keyPresent, true);
    assert.strictEqual(body.checks.hostingerOfficial, true);
}

console.log('Sheikha AI Router validator tests: PASS');
