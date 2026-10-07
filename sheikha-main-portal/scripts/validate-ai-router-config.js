'use strict';

try {
    require('dotenv').config();
} catch (_) {
    // Validator remains dependency-free before npm install.
}

const HOSTINGER_UPSTREAM_BASE = 'https://router.hostinger.com/v1';
const SHEIKHA_NATIVE_BASE = 'sheikha://native';
const SHEIKHA_NATIVE_MODEL = 'SheikhaNeural-v1.0';

function first(...values) {
    return values.find(v => String(v || '').trim()) || '';
}

const upstream = first(process.env.SHEIKHA_AI_ROUTER_UPSTREAM, 'sheikha');
const native = upstream === 'sheikha';
const enabled =
    first(process.env.SHEIKHA_AI_ROUTER_ENABLED, 'true').toLowerCase() === 'true';

const baseUrl = native
    ? first(process.env.SHEIKHA_AI_ROUTER_BASE_URL, SHEIKHA_NATIVE_BASE)
    : first(
          process.env.SHEIKHA_AI_ROUTER_BASE_URL,
          process.env.HOSTINGER_AI_ROUTER_BASE_URL,
          HOSTINGER_UPSTREAM_BASE
      );

const apiKey = native
    ? ''
    : first(
          process.env.SHEIKHA_AI_ROUTER_API_KEY,
          process.env.HOSTINGER_AI_ROUTER_API_KEY
      );

const model = native
    ? first(process.env.SHEIKHA_AI_ROUTER_MODEL, SHEIKHA_NATIVE_MODEL)
    : first(
          process.env.SHEIKHA_AI_ROUTER_MODEL,
          process.env.HOSTINGER_AI_ROUTER_MODEL,
          process.env.AI_LLM_MODEL
      );

const allowed = first(
    process.env.SHEIKHA_AI_ROUTER_ALLOWED_MODELS,
    native ? SHEIKHA_NATIVE_MODEL : process.env.HOSTINGER_AI_ROUTER_ALLOWED_MODELS
)
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

const failClosed =
    first(process.env.SHEIKHA_AI_ROUTER_FAIL_CLOSED, 'true').toLowerCase() !== 'false';

const checks = {
    enabled,
    providerIsSheikha: true,
    nativeSheikha: native,
    secureTransport: native || String(baseUrl).startsWith('https://'),
    hostingerOfficial:
        upstream !== 'hostinger' || baseUrl === HOSTINGER_UPSTREAM_BASE,
    modelConfigured: Boolean(model),
    keyPresent: native ? false : Boolean(apiKey),
    credentialsRequired: !native,
    modelAllowed: !allowed.length || allowed.includes(model),
    failClosed
};

console.log(
    JSON.stringify(
        {
            name: 'Sheikha AI Router',
            provider: 'sheikha',
            identity: 'Sheikha AI Provider',
            upstream,
            upstreamType: native ? 'native-sheikha' : 'external-adapter',
            baseUrl,
            model: model || null,
            allowedModels: allowed,
            checks
        },
        null,
        2
    )
);

if (
    enabled &&
    failClosed &&
    (!checks.secureTransport ||
        !checks.hostingerOfficial ||
        !checks.modelConfigured ||
        (checks.credentialsRequired && !checks.keyPresent) ||
        !checks.modelAllowed)
) {
    process.exit(1);
}
