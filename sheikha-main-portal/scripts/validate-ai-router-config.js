'use strict';

try {
    require('dotenv').config();
} catch (_) {
    // Validator remains dependency-free when run before npm install.
}

const UPSTREAM_BASE = 'https://router.hostinger.com/v1';

function first(...values) {
    return values.find(v => String(v || '').trim()) || '';
}

const enabled =
    first(
        process.env.SHEIKHA_AI_ROUTER_ENABLED,
        process.env.HOSTINGER_AI_ROUTER_ENABLED,
        'false'
    ).toLowerCase() === 'true';

const baseUrl = first(
    process.env.SHEIKHA_AI_ROUTER_BASE_URL,
    process.env.HOSTINGER_AI_ROUTER_BASE_URL,
    UPSTREAM_BASE
);

const apiKey = first(
    process.env.SHEIKHA_AI_ROUTER_API_KEY,
    process.env.HOSTINGER_AI_ROUTER_API_KEY
);

const model = first(
    process.env.SHEIKHA_AI_ROUTER_MODEL,
    process.env.HOSTINGER_AI_ROUTER_MODEL,
    process.env.AI_LLM_MODEL
);

const allowed = first(
    process.env.SHEIKHA_AI_ROUTER_ALLOWED_MODELS,
    process.env.HOSTINGER_AI_ROUTER_ALLOWED_MODELS
)
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

const failClosed =
    first(
        process.env.SHEIKHA_AI_ROUTER_FAIL_CLOSED,
        process.env.HOSTINGER_AI_ROUTER_FAIL_CLOSED,
        'true'
    ).toLowerCase() !== 'false';

const checks = {
    enabled,
    https: String(baseUrl).startsWith('https://'),
    upstreamOfficial: baseUrl === UPSTREAM_BASE,
    modelConfigured: Boolean(model),
    keyPresent: Boolean(apiKey),
    modelAllowed: !allowed.length || allowed.includes(model),
    failClosed
};

console.log(JSON.stringify({
    name: 'Sheikha AI Router',
    provider: 'sheikha-ai-router',
    upstream: 'hostinger-ai-router',
    baseUrl,
    model: model || null,
    allowedModels: allowed,
    checks
}, null, 2));

if (
    enabled &&
    failClosed &&
    (!checks.https || !checks.modelConfigured || !checks.keyPresent || !checks.modelAllowed)
) {
    process.exit(1);
}
