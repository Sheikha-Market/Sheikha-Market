'use strict';

const { assertTrustedRouterBase, serializeRequest, authorizeExternalDisclosure } =
    require('./transport-policy');
const DEFAULT_TIMEOUT_MS = 60000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

class UpstreamError extends Error {
    constructor(code, status) {
        super(code);
        this.upstream = 'hostinger';
        if (Number.isInteger(status)) this.status = status;
    }
}

function validCompletion(body) {
    const record = value => value && typeof value === 'object' && !Array.isArray(value);
    const label = value => typeof value === 'string' && value.length > 0 && value.length <= 256;
    if (!record(body) || !label(body.id) || !label(body.model) ||
        body.object !== 'chat.completion' || !Array.isArray(body.choices) ||
        !body.choices.length || body.choices.length > 32) return false;
    for (const choice of body.choices) {
        if (!record(choice) || !Number.isSafeInteger(choice.index) || choice.index < 0 ||
            !record(choice.message) || choice.message.role !== 'assistant') return false;
        const message = choice.message;
        const calls = message.tool_calls;
        if (calls !== undefined && (!Array.isArray(calls) || !calls.length || calls.length > 128 ||
            !calls.every(call => record(call) && label(call.id) && call.type === 'function' &&
                record(call.function) && label(call.function.name) &&
                typeof call.function.arguments === 'string'))) return false;
        if (typeof message.content !== 'string' && !(message.content === null && calls?.length)) return false;
    }
    if (body.usage !== undefined && (!record(body.usage) ||
        !['prompt_tokens', 'completion_tokens', 'total_tokens'].every(key =>
            Number.isSafeInteger(body.usage[key]) && body.usage[key] >= 0))) return false;
    return true;
}

async function readCompletion(response) {
    if (Number(response.headers?.get('content-length')) > MAX_RESPONSE_BYTES) {
        throw new UpstreamError('SHEIKHA_UPSTREAM_RESPONSE_TOO_LARGE');
    }
    if (typeof response.body?.getReader !== 'function') {
        throw new UpstreamError('SHEIKHA_UPSTREAM_INVALID_RESPONSE');
    }
    const reader = response.body.getReader();
    const chunks = [];
    let bytes = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > MAX_RESPONSE_BYTES) throw new UpstreamError('SHEIKHA_UPSTREAM_RESPONSE_TOO_LARGE');
            chunks.push(Buffer.from(value));
        }
    } catch (error) {
        try { await reader.cancel(); } catch (_) {}
        throw error;
    } finally {
        reader.releaseLock();
    }
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (_) {
        throw new UpstreamError('SHEIKHA_UPSTREAM_INVALID_JSON');
    }
    if (!validCompletion(body)) throw new UpstreamError('SHEIKHA_UPSTREAM_INVALID_RESPONSE');
    return body;
}

function createHostingerUpstreamAdapter({ router, fetchImpl = global.fetch,
    authorizeExternalRequest, env = process.env } = {}) {
    if (!router) throw new Error('SHEIKHA_UPSTREAM_ROUTER_REQUIRED');
    if (typeof fetchImpl !== 'function') throw new Error('SHEIKHA_UPSTREAM_FETCH_REQUIRED');

    const timeoutMs = Number(env.SHEIKHA_AI_ROUTER_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) {
        throw new Error('SHEIKHA_UPSTREAM_INVALID_TIMEOUT');
    }

    async function chatCompletions(payload) {
        const client = router.getClientConfig();
        assertTrustedRouterBase('hostinger', client.baseURL);
        const body = serializeRequest(payload);
        const snapshot = JSON.parse(body);
        if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
            throw new Error('SHEIKHA_AI_ROUTER_INVALID_PAYLOAD');
        }
        if (snapshot.stream) throw new Error('SHEIKHA_UPSTREAM_STREAM_NOT_SUPPORTED');
        await authorizeExternalDisclosure(authorizeExternalRequest, body, 'hostinger', client.baseURL);
        const endpoint = client.baseURL + '/chat/completions';
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        let response;

        try {
            response = await fetchImpl(
                endpoint,
                {
                    method: 'POST',
                    redirect: 'error',
                    headers: {
                        'content-type': 'application/json',
                        authorization: 'Bearer ' + client.apiKey
                    },
                    body,
                    signal: controller.signal
                }
            );
            if (response.redirected || (response.url && response.url !== endpoint)) {
                throw new UpstreamError('SHEIKHA_UPSTREAM_REDIRECT_DENIED');
            }
            if (!response.ok) {
                throw new UpstreamError('SHEIKHA_UPSTREAM_REQUEST_FAILED', response.status);
            }
            return await readCompletion(response);
        } catch (error) {
            const timedOut = controller.signal.aborted;
            controller.abort();
            try { await response?.body?.cancel(); } catch (_) {}
            // Never expose provider response bodies, prompts, credentials or transport errors.
            if (error instanceof UpstreamError) throw error;
            throw new UpstreamError(timedOut ? 'SHEIKHA_UPSTREAM_TIMEOUT' : 'SHEIKHA_UPSTREAM_TRANSPORT_FAILED');
        } finally {
            clearTimeout(timer);
        }
    }

    return Object.freeze({
        id: 'hostinger',
        visibility: 'private-upstream',
        baseUrl: router.baseUrl,
        chatCompletions
    });
}

module.exports = { createHostingerUpstreamAdapter, MAX_RESPONSE_BYTES };
