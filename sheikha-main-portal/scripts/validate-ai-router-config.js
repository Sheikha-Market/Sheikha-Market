'use strict';

try {
    require('dotenv').config();
} catch (_) {
    // Validator remains dependency-free when run before npm install.
}

const HOSTINGER_UPSTREAM_BASE = 'https://router.hostinger.com/v1';
const SHEIKHA_NATIVE_BASE = 'sheikha://native';
const SHEIKHA_NATIVE_MODEL = 'SheikhaNeural-v1.0';

function first(...values) {
    return values.find(v => String(v || '').trim()) || '';
}

const enabled =
    first(
        process.env.SHEIKHA_AI_ROUTER_ENABLED,
        process.env.HOSTINGER_AI_ROUTER_ENABLED,
        'false'
    ).toLowerCase() === 'true';

const upstream = first(process.env.SHEIKHA_AI_ROUTER_UPSTREAM, 'sheikha');

const baseUrl =
    upstream === 'hostinger'
        ? first(
              process.env.SHEIKHA_AI_ROUTER_BASE_URL,
              process.env.HOSTINGER_AI_ROUTER_BASE_URL,
              HOSTINGER_UPSTREAM_BASE
          )
        : first(process.env.SHEIKHA_AI_ROUTER_BASE_URL, SHEIKHA_NATIVE_BASE);

const apiKey =
    upstream === 'hostinger'
        ? first(
              process.env.SHEIKHA_AI_ROUTER_API_KEY,
              process.env.HOSTINGER_AI_ROUTER_API_KEY
          )
        : '';

const model =
    upstream === 'hostinger'
        ? first(
              process.env.SHEIKHA_AI_ROUTER_MODEL,
              process.env.HOSTINGER_AI_ROUTER_MODEL,
              process.env.AI_LLM_MODEL
          )
        : first(process.env.SHEIKHA_AI_ROUTER_MODEL, SHEIKHA_NATIVE_MODEL);

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
    nativeSheikha: upstream === 'sheikha',
    secureTransport:
        upstream === 'sheikha' || String(baseUrl).startsWith('https://'),
    hostingerOfficial:
        upstream !== 'hostinger' || baseUrl === HOSTINGER_UPSTREAM_BASE,
    modelConfigured: Boolean(model),
    keyPresent: upstream === 'sheikha' ? false : Boolean(apiKey),
    credentialsRequired: upstream === 'hostinger',
    modelAllowed: !allowed.length || allowed.includes(model),
    failClosed
};

console.log(JSON.stringify({
    name: 'Sheikha AI Router',
    provider: 'sheikha-ai-router',
    upstream,
    baseUrl,
    model: model || null,
    allowedModels: allowed,
    checks
}, null, 2));

if (
    enabled &&
    failClosed &&
    (!checks.secureTransport ||
        !checks.modelConfigured ||
        (checks.credentialsRequired && !checks.keyPresent) ||
        !checks.modelAllowed)
) {
    process.exit(1);
}
