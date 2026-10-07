'use strict';

const HOSTINGER_UPSTREAM_BASE = 'https://router.hostinger.com/v1';
const SHEIKHA_NATIVE_BASE = 'sheikha://native';
const SHEIKHA_NATIVE_MODEL = 'SheikhaNeural-v1.0';

function first(...values) {
    return values.find(v => String(v || '').trim()) || '';
}

function splitList(value) {
    return String(value || '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
}

function createSheikhaAIRouter(env = process.env) {
    const upstream = first(env.SHEIKHA_AI_ROUTER_UPSTREAM, 'sheikha');
    const enabled =
        first(env.SHEIKHA_AI_ROUTER_ENABLED, 'true').toLowerCase() === 'true';

    const native = upstream === 'sheikha';

    const baseUrl = native
        ? first(env.SHEIKHA_AI_ROUTER_BASE_URL, SHEIKHA_NATIVE_BASE)
        : first(
              env.SHEIKHA_AI_ROUTER_BASE_URL,
              env.HOSTINGER_AI_ROUTER_BASE_URL,
              HOSTINGER_UPSTREAM_BASE
          );

    const apiKey = native
        ? ''
        : first(
              env.SHEIKHA_AI_ROUTER_API_KEY,
              env.HOSTINGER_AI_ROUTER_API_KEY
          );

    const model = native
        ? first(env.SHEIKHA_AI_ROUTER_MODEL, SHEIKHA_NATIVE_MODEL)
        : first(
              env.SHEIKHA_AI_ROUTER_MODEL,
              env.HOSTINGER_AI_ROUTER_MODEL,
              env.AI_LLM_MODEL
          );

    const allowedModels = splitList(
        first(
            env.SHEIKHA_AI_ROUTER_ALLOWED_MODELS,
            native ? SHEIKHA_NATIVE_MODEL : env.HOSTINGER_AI_ROUTER_ALLOWED_MODELS
        )
    );

    const fallbackModels = splitList(
        first(
            env.SHEIKHA_AI_ROUTER_FALLBACK_MODELS,
            native ? '' : env.HOSTINGER_AI_ROUTER_FALLBACK_MODELS
        )
    );

    const failClosed =
        first(env.SHEIKHA_AI_ROUTER_FAIL_CLOSED, 'true').toLowerCase() !== 'false';

    const configured = native ? Boolean(model) : Boolean(apiKey && model);
    const secureBase = native || String(baseUrl).startsWith('https://');
    const modelAllowed = !allowedModels.length || allowedModels.includes(model);

    if (enabled && failClosed && (!configured || !secureBase || !modelAllowed)) {
        throw new Error('SHEIKHA_AI_ROUTER_POLICY_BLOCK');
    }

    return Object.freeze({
        name: 'Sheikha AI Router',
        provider: 'sheikha',
        router: 'sheikha-ai-router',
        upstream,
        upstreamType: native ? 'native-sheikha' : 'external-adapter',
        enabled,
        configured,
        baseUrl,
        model: model || null,
        allowedModels,
        fallbackModels,
        failClosed,
        keyPresent: native ? false : Boolean(apiKey),

        resolveModel(requestedModel) {
            const selected = requestedModel || model;
            if (!selected) {
                throw new Error('SHEIKHA_AI_ROUTER_MODEL_REQUIRED');
            }
            if (allowedModels.length && !allowedModels.includes(selected)) {
                throw new Error('SHEIKHA_AI_ROUTER_MODEL_NOT_ALLOWED');
            }
            return selected;
        },

        getClientConfig() {
            if (!configured) {
                throw new Error('SHEIKHA_AI_ROUTER_NOT_CONFIGURED');
            }

            if (native) {
                return {
                    provider: 'sheikha',
                    upstream: 'sheikha',
                    model,
                    native: true
                };
            }

            return {
                provider: 'sheikha',
                upstream,
                apiKey,
                baseURL: baseUrl,
                model,
                native: false
            };
        },

        status() {
            return {
                name: 'Sheikha AI Router',
                provider: 'sheikha',
                router: 'sheikha-ai-router',
                upstream,
                upstreamType: native ? 'native-sheikha' : 'external-adapter',
                enabled,
                configured,
                baseUrl,
                model: model || null,
                allowedModels,
                fallbackModels,
                failClosed,
                keyPresent: native ? false : Boolean(apiKey)
            };
        }
    });
}

module.exports = {
    HOSTINGER_UPSTREAM_BASE,
    SHEIKHA_NATIVE_BASE,
    SHEIKHA_NATIVE_MODEL,
    createSheikhaAIRouter
};
