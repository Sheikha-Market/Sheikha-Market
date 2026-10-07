'use strict';

const OFFICIAL_BASE = 'https://router.hostinger.com/v1';

const enabled =
    process.env.HOSTINGER_AI_ROUTER_ENABLED !== 'false' &&
    Boolean(process.env.HOSTINGER_AI_ROUTER_API_KEY);

const baseUrl = process.env.HOSTINGER_AI_ROUTER_BASE_URL || OFFICIAL_BASE;
const model = process.env.HOSTINGER_AI_ROUTER_MODEL || process.env.AI_LLM_MODEL || '';
const allowed = String(process.env.HOSTINGER_AI_ROUTER_ALLOWED_MODELS || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

const checks = {
    enabled,
    https: String(baseUrl).startsWith('https://'),
    officialBase: baseUrl === OFFICIAL_BASE,
    modelConfigured: Boolean(model),
    keyPresent: Boolean(process.env.HOSTINGER_AI_ROUTER_API_KEY),
    modelAllowed: !allowed.length || allowed.includes(model)
};

console.log(JSON.stringify({
    provider: 'hostinger-ai-router',
    baseUrl,
    model: model || null,
    allowedModels: allowed,
    checks
}, null, 2));

if (enabled && (!checks.https || !checks.modelConfigured || !checks.keyPresent || !checks.modelAllowed)) {
    process.exit(1);
}
