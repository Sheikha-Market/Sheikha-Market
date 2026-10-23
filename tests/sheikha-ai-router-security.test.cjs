'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const { createSheikhaAIRouter } = require('../lib/sheikha-ai-router');
const { createSheikhaProvider } = require('../lib/sheikha-ai-router/provider');
const { createHostingerUpstreamAdapter, MAX_RESPONSE_BYTES } = require('../lib/sheikha-ai-router/hostinger-upstream');
const { HOSTINGER_UPSTREAM_BASE, MAX_REQUEST_BYTES } = require('../lib/sheikha-ai-router/transport-policy');

const env = Object.freeze({
    SHEIKHA_AI_ROUTER_UPSTREAM: 'hostinger',
    HOSTINGER_AI_ROUTER_API_KEY: 'synthetic-test-key-not-a-credential',
    HOSTINGER_AI_ROUTER_MODEL: 'test-model',
    SHEIKHA_AI_ROUTER_ALLOWED_MODELS: 'test-model'
});
const request = () => ({ messages: [{ role: 'user', content: 'public synthetic fixture' }] });
const completion = () => ({
    id: 'test-completion', object: 'chat.completion', model: 'test-model',
    choices: [{ index: 0, message: { role: 'assistant', content: 'synthetic result' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 }
});
const approve = binding => ({ ...binding, allowed: true, noScopeExpansion: true,
    expiresAt: new Date(Date.now() + 60000).toISOString() });
const jsonResponse = body => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const adapter = options => createHostingerUpstreamAdapter({
    router: createSheikhaAIRouter(env), env: {}, authorizeExternalRequest: approve,
    fetchImpl: async () => jsonResponse(completion()), ...options
});

let originalFetch;
let emptyCwd;
before(() => {
    originalFetch = global.fetch;
    global.fetch = () => { throw new Error('REAL_NETWORK_FORBIDDEN_IN_TEST'); };
    emptyCwd = mkdtempSync(join(tmpdir(), 'sheikha-router-test-'));
});
after(() => { global.fetch = originalFetch; rmSync(emptyCwd, { recursive: true, force: true }); });

for (const context of [undefined, {}, { authorized: true }, { allowed: true, verified: true },
    { authorized: true, authorizeExternalRequest: approve }]) {
    test('external provider denies caller-supplied authority ' + JSON.stringify(context), async () => {
        let calls = 0;
        const provider = createSheikhaProvider({ env, fetchImpl: async () => { calls++; } });
        await assert.rejects(provider.chatCompletions(request(), context), /EXTERNAL_DISCLOSURE_DENIED/);
        assert.equal(calls, 0);
        assert.equal(provider.status().externalDisclosurePolicy, 'DENY_EXTERNAL');
    });
}

test('custom external adapter and payload consent cannot bypass provider authorization', async () => {
    let calls = 0;
    const provider = createSheikhaProvider({ env,
        hostingerAdapter: { id: 'hostinger', chatCompletions: async () => { calls++; } } });
    await assert.rejects(provider.chatCompletions({ ...request(), authorized: true,
        consent: { verified: true, allowed: true } }), /EXTERNAL_DISCLOSURE_DENIED/);
    assert.equal(calls, 0);
});

test('native dispatch remains local and respects explicit authority denial', async () => {
    let calls = 0;
    const provider = createSheikhaProvider({ env: {}, sheikhaAdapter: {
        id: 'sheikha', chatCompletions: async () => { calls++; return completion(); }
    } });
    assert.equal((await provider.chatCompletions(request())).sheikha.upstream, 'sheikha');
    await assert.rejects(provider.chatCompletions(request(), { authorized: false }), /AUTHORITY_DENIED/);
    assert.equal(calls, 1);
});

const invalidBases = [
    'http://router.hostinger.com/v1', 'https://example.invalid/v1',
    'https://router.hostinger.com.example.invalid/v1', 'https://router.hostinger.com@localhost/v1',
    'https://user:private-value@router.hostinger.com/v1', 'https://router.hostinger.com:443/v1',
    'https://router.hostinger.com/v1/', 'https://router.hostinger.com/v1?key=private-value',
    'https://router.hostinger.com/v1#fragment', 'https://router.hostinger.com/%76%31',
    'https://router.hostinger.com/v1/../v1', 'https://127.0.0.1/v1'
];
for (const baseURL of invalidBases) {
    test('runtime and validator reject noncanonical endpoint ' + baseURL, () => {
        const config = { ...env, SHEIKHA_AI_ROUTER_BASE_URL: baseURL, SHEIKHA_AI_ROUTER_FAIL_CLOSED: 'false' };
        assert.throws(() => createSheikhaAIRouter(config), /UNTRUSTED_ENDPOINT/);
        const result = spawnSync(process.execPath, [resolve(__dirname, '../scripts/validate-ai-router-config.js')], {
            cwd: emptyCwd, env: config, encoding: 'utf8', timeout: 10000
        });
        assert.equal(result.error, undefined, 'validator child process must start successfully');
        assert.equal(result.status, 1, result.stderr);
        const body = JSON.parse(result.stdout);
        assert.equal(body.checks.secureTransport, false);
        assert.equal(body.baseUrl, '[UNTRUSTED_ENDPOINT]');
        assert.ok(!result.stdout.includes('private-value'));
    });
}

test('unknown upstream and changed native endpoint are denied', () => {
    assert.throws(() => createSheikhaAIRouter({ ...env, SHEIKHA_AI_ROUTER_UPSTREAM: 'unknown' }), /UNTRUSTED_ENDPOINT/);
    assert.throws(() => createSheikhaAIRouter({ SHEIKHA_AI_ROUTER_BASE_URL: HOSTINGER_UPSTREAM_BASE }), /UNTRUSTED_ENDPOINT/);
});

test('disabled configuration cannot return transport credentials', () => {
    const router = createSheikhaAIRouter({ ...env, SHEIKHA_AI_ROUTER_ENABLED: 'false',
        SHEIKHA_AI_ROUTER_BASE_URL: 'https://user:secret@example.invalid' });
    assert.throws(() => router.getClientConfig(), /DISABLED/);
    assert.equal(router.status().baseUrl, '[UNTRUSTED_ENDPOINT]');
});

test('direct adapter rejects a forged router endpoint before authorization or fetch', async () => {
    let calls = 0;
    const instance = adapter({ router: { getClientConfig: () => ({ baseURL: 'https://example.invalid', apiKey: 'fake' }) },
        authorizeExternalRequest: () => { calls++; }, fetchImpl: () => { calls++; } });
    await assert.rejects(instance.chatCompletions(request()), /UNTRUSTED_ENDPOINT/);
    assert.equal(calls, 0);
});

const invalidDecisions = {
    missing: undefined,
    'JSON object instead of server function': { allowed: true },
    'boolean result': () => true,
    rejected: binding => ({ ...approve(binding), allowed: false }),
    'wrong action': binding => ({ ...approve(binding), action: 'READ' }),
    'wrong upstream': binding => ({ ...approve(binding), upstream: 'other' }),
    'wrong endpoint': binding => ({ ...approve(binding), endpoint: 'https://example.invalid' }),
    'wrong payload binding': binding => ({ ...approve(binding), resourceSha256: '0'.repeat(64) }),
    'expanded scope': binding => ({ ...approve(binding), noScopeExpansion: false }),
    expired: binding => ({ ...approve(binding), expiresAt: '2000-01-01T00:00:00Z' }),
    'invalid expiry': binding => ({ ...approve(binding), expiresAt: 'tomorrow' }),
    'no expiry': binding => ({ ...approve(binding), expiresAt: undefined }),
    'verifier throws': () => { throw new Error('private verifier error'); }
};
for (const [name, verifier] of Object.entries(invalidDecisions)) {
    test('direct adapter default-denies ' + name, async () => {
        let calls = 0;
        const instance = adapter({ authorizeExternalRequest: verifier, fetchImpl: () => { calls++; } });
        await assert.rejects(instance.chatCompletions(request()), /^Error: SHEIKHA_PROVIDER_EXTERNAL_DISCLOSURE_DENIED$/);
        assert.equal(calls, 0);
    });
}

test('approved synthetic request has exact transport binding and no redirects', async () => {
    const bindings = [];
    let calls = 0;
    const provider = createSheikhaProvider({ env,
        authorizeExternalRequest: binding => { bindings.push(binding); return approve(binding); },
        fetchImpl: async (url, options) => {
            calls++;
            assert.equal(url, HOSTINGER_UPSTREAM_BASE + '/chat/completions');
            assert.equal(options.redirect, 'error');
            assert.equal(options.method, 'POST');
            assert.equal(options.headers.authorization, 'Bearer ' + env.HOSTINGER_AI_ROUTER_API_KEY);
            assert.equal(bindings.at(-1).resourceSha256, createHash('sha256').update(options.body).digest('hex'));
            assert.ok(!JSON.stringify(bindings).includes('public synthetic fixture'));
            return jsonResponse(completion());
        }
    });
    assert.equal((await provider.chatCompletions(request())).choices[0].message.content, 'synthetic result');
    assert.equal(calls, 1);
    assert.equal(bindings.length, 2);
    assert.deepEqual(bindings[0], bindings[1]);
    assert.ok(Object.isFrozen(bindings[0]));
});

test('payload mutation during asynchronous authorization cannot change the transmitted snapshot', async () => {
    const payload = request();
    const provider = createSheikhaProvider({ env,
        authorizeExternalRequest: async binding => {
            payload.messages[0].content = 'private mutation must not be sent';
            await Promise.resolve();
            return approve(binding);
        },
        fetchImpl: async (_url, options) => {
            assert.equal(JSON.parse(options.body).messages[0].content, 'public synthetic fixture');
            return jsonResponse(completion());
        }
    });
    await provider.chatCompletions(payload);
});

test('adapter rechecks authorization and does not retry when revoked between checks', async () => {
    let decisions = 0;
    let calls = 0;
    const provider = createSheikhaProvider({ env,
        authorizeExternalRequest: binding => ++decisions === 1 ? approve(binding) : null,
        fetchImpl: async () => { calls++; }
    });
    await assert.rejects(provider.chatCompletions(request()), /EXTERNAL_DISCLOSURE_DENIED/);
    assert.equal(decisions, 2);
    assert.equal(calls, 0);
});

test('streaming, invalid and oversized payloads never leave adapter', async () => {
    let calls = 0;
    const instance = adapter({ fetchImpl: async () => { calls++; } });
    const circular = {}; circular.self = circular;
    for (const [payload, code] of [[{ ...request(), stream: true }, /STREAM_NOT_SUPPORTED/],
        [null, /INVALID_PAYLOAD/], [[], /INVALID_PAYLOAD/], [circular, /INVALID_PAYLOAD/],
        [{ data: 'x'.repeat(MAX_REQUEST_BYTES) }, /REQUEST_TOO_LARGE/]]) {
        await assert.rejects(instance.chatCompletions(payload), code);
    }
    assert.equal(calls, 0);
});

for (const value of ['0', '-1', '120001', 'abc', '5ms', '1.5', '']) {
    test('invalid timeout fails closed: ' + JSON.stringify(value), () => {
        assert.throws(() => adapter({ env: { SHEIKHA_AI_ROUTER_TIMEOUT_MS: value } }), /INVALID_TIMEOUT/);
    });
}

for (const [name, body] of Object.entries({
    empty: {}, array: [], null: null, 'error envelope': { error: 'private upstream error' },
    'no choices': { ...completion(), choices: [] },
    'wrong role': { ...completion(), choices: [{ index: 0, message: { role: 'user', content: 'x' } }] },
    'bad index': { ...completion(), choices: [{ index: -1, message: { role: 'assistant', content: 'x' } }] },
    'null content without calls': { ...completion(), choices: [{ index: 0, message: { role: 'assistant', content: null } }] },
    'negative usage': { ...completion(), usage: { prompt_tokens: -1, completion_tokens: 0, total_tokens: 0 } },
    'string usage': { ...completion(), usage: { prompt_tokens: '1', completion_tokens: 0, total_tokens: 1 } },
    'missing model': { ...completion(), model: '' },
    'stream chunk': { ...completion(), object: 'chat.completion.chunk' }
})) {
    test('HTTP 200 invalid completion is rejected: ' + name, async () => {
        await assert.rejects(adapter({ fetchImpl: async () => jsonResponse(body) }).chatCompletions(request()), /INVALID_RESPONSE/);
    });
}

test('valid function calls are returned as data, never executed', async () => {
    const result = completion();
    result.choices[0].message = { role: 'assistant', content: null, tool_calls: [
        { id: 'call-1', type: 'function', function: { name: 'untrusted_tool', arguments: '{"x":1}' } }
    ] };
    const output = await adapter({ fetchImpl: async () => jsonResponse(result) }).chatCompletions(request());
    assert.deepEqual(output, result);
});

test('invalid tool call structure is rejected', async () => {
    const result = completion();
    result.choices[0].message.tool_calls = [{ id: 'bad-call', type: 'function', function: { name: 'x', arguments: {} } }];
    await assert.rejects(adapter({ fetchImpl: async () => jsonResponse(result) }).chatCompletions(request()), /INVALID_RESPONSE/);
});

for (const body of ['not JSON', '', '{"incomplete":']) {
    test('malformed JSON rejected: ' + JSON.stringify(body), async () => {
        await assert.rejects(adapter({ fetchImpl: async () => new Response(body) }).chatCompletions(request()), /INVALID_JSON/);
    });
}

test('missing response stream cannot fall back to unbounded text()', async () => {
    await assert.rejects(adapter({ fetchImpl: async () => ({ ok: true, text: () => { throw new Error('must not run'); } }) })
        .chatCompletions(request()), /INVALID_RESPONSE/);
});

test('oversized declared response is cancelled before reading', async () => {
    const response = new Response('small', { headers: { 'content-length': String(MAX_RESPONSE_BYTES + 1) } });
    await assert.rejects(adapter({ fetchImpl: async () => response }).chatCompletions(request()), /RESPONSE_TOO_LARGE/);
    assert.equal(response.bodyUsed, true);
});

test('actual response bytes are bounded even with misleading content-length', async () => {
    let cancelled = false;
    const response = new Response(new ReadableStream({
        pull(controller) { controller.enqueue(new Uint8Array(65536)); },
        cancel() { cancelled = true; }
    }), { headers: { 'content-length': '1' } });
    await assert.rejects(adapter({ fetchImpl: async () => response }).chatCompletions(request()), /RESPONSE_TOO_LARGE/);
    assert.equal(cancelled, true);
});

for (const properties of [{ redirected: true }, { url: 'https://example.invalid/v1/chat/completions' }]) {
    test('unexpected response location denied: ' + JSON.stringify(properties), async () => {
        const response = jsonResponse(completion());
        for (const [key, value] of Object.entries(properties)) Object.defineProperty(response, key, { value });
        await assert.rejects(adapter({ fetchImpl: async () => response }).chatCompletions(request()), /REDIRECT_DENIED/);
    });
}

test('upstream HTTP errors do not expose response bodies or trigger retries', async () => {
    let calls = 0;
    const instance = adapter({ fetchImpl: async () => { calls++; return new Response('private payload', { status: 401 }); } });
    await assert.rejects(instance.chatCompletions(request()), error => {
        assert.equal(error.message, 'SHEIKHA_UPSTREAM_REQUEST_FAILED');
        assert.equal(error.status, 401);
        assert.equal(error.body, undefined);
        assert.ok(!JSON.stringify(error).includes('private payload'));
        return true;
    });
    assert.equal(calls, 1);
});

test('transport exceptions are redacted', async () => {
    await assert.rejects(adapter({ fetchImpl: async () => { throw new Error('private-key prompt URL'); } })
        .chatCompletions(request()), /^Error: SHEIKHA_UPSTREAM_TRANSPORT_FAILED$/);
});

test('request timeout aborts without retry', async () => {
    let calls = 0;
    const instance = adapter({ env: { SHEIKHA_AI_ROUTER_TIMEOUT_MS: '5' },
        fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
            calls++;
            options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
        }) });
    await assert.rejects(instance.chatCompletions(request()), /UPSTREAM_TIMEOUT/);
    assert.equal(calls, 1);
});

for (const file of ['sheikha-ai-router-runtime.test.js', 'sheikha-ai-router-config.test.js', 'sheikha-ai-provider-hierarchy.test.js']) {
    test('existing contract in clean environment: ' + file, () => {
        const result = spawnSync(process.execPath, [resolve(__dirname, file)], {
            cwd: emptyCwd, env: { PATH: '/usr/bin:/bin' }, encoding: 'utf8', timeout: 10000
        });
        assert.equal(result.error, undefined, 'contract child process must start successfully');
        assert.equal(result.status, 0, result.stderr || result.stdout);
        assert.match(result.stdout, /PASS/);
    });
}
