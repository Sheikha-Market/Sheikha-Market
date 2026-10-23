'use strict';

const { createHash } = require('node:crypto');
const HOSTINGER_UPSTREAM_BASE = 'https://router.hostinger.com/v1';
const SHEIKHA_NATIVE_BASE = 'sheikha://native';
const MAX_REQUEST_BYTES = 1024 * 1024;

function isTrustedRouterBase(upstream, baseURL) {
    return (upstream === 'sheikha' && baseURL === SHEIKHA_NATIVE_BASE) ||
        (upstream === 'hostinger' && baseURL === HOSTINGER_UPSTREAM_BASE);
}

function assertTrustedRouterBase(upstream, baseURL) {
    if (!isTrustedRouterBase(upstream, baseURL)) {
        throw new Error('SHEIKHA_AI_ROUTER_UNTRUSTED_ENDPOINT');
    }
}

function serializeRequest(payload) {
    let body;
    try { body = JSON.stringify(payload); } catch (_) {
        throw new Error('SHEIKHA_AI_ROUTER_INVALID_PAYLOAD');
    }
    if (!body || Buffer.byteLength(body) > MAX_REQUEST_BYTES) {
        throw new Error('SHEIKHA_AI_ROUTER_REQUEST_TOO_LARGE');
    }
    return body;
}

async function authorizeExternalDisclosure(authorize, body, upstream, baseURL) {
    assertTrustedRouterBase(upstream, baseURL);
    const request = Object.freeze({ action: 'DISCLOSE_EXTERNAL', upstream,
        endpoint: baseURL + '/chat/completions',
        resourceSha256: createHash('sha256').update(body).digest('hex') });
    let decision;
    // Trusted server code injects an idempotent policy check; caller JSON is never authority.
    // Provider and adapter both check the same binding immediately before dispatch.
    try { decision = typeof authorize === 'function' ? await authorize(request) : null; } catch (_) {}
    if (!decision || decision.allowed !== true || decision.action !== request.action ||
        decision.upstream !== upstream || decision.endpoint !== request.endpoint ||
        decision.resourceSha256 !== request.resourceSha256 || decision.noScopeExpansion !== true ||
        typeof decision.expiresAt !== 'string' || !(Date.parse(decision.expiresAt) > Date.now())) {
        throw new Error('SHEIKHA_PROVIDER_EXTERNAL_DISCLOSURE_DENIED');
    }
}

module.exports = { HOSTINGER_UPSTREAM_BASE, SHEIKHA_NATIVE_BASE, MAX_REQUEST_BYTES,
    isTrustedRouterBase, assertTrustedRouterBase, serializeRequest, authorizeExternalDisclosure };
