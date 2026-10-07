'use strict';

const OFFICIAL_UPSTREAM = 'https://router.hostinger.com/v1';

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
    const enabled =
        first(
            env.SHEIKHA_AI_ROUTER_ENABLED,
            env.HOSTINGER_AI_ROUTER_ENABLED,
            'false'
        ).toLowerCase() === 'true';

    const upstream = first(env.SHEIKHA_AI_ROUTER_UPSTREAM, 'hostinger');
    const baseUrl = first(
        env.SHEIKHA_AI_ROUTER_BASE_URL,
        env.HOSTINGER_AI_ROUTER_BASE_URL,
        OFFICIAL_UPSTREAM
    );
    const apiKey = first(
        env.SHEIKHA_AI_ROUTER_API_KEY,
        env.HOSTINGER_AI_ROUTER_API_KEY
    );
    const model = first(
        env.SHEIKHA_AI_ROUTER_MODEL,
        env.HOSTINGER_AI_ROUTER_MODEL,
        env.AI_LLM_MODEL
    );
    const allowedModels = splitList(
        first(
            env.SHEIKHA_AI_ROUTER_ALLOWED_MODELS,
            env.HOSTINGER_AI_ROUTER_ALLOWED_MODELS
        )
    );
    const fallbackModels = splitList(
        first(
            env.SHEIKHA_AI_ROUTER_FALLBACK_MODELS,
            env.HOSTINGER_AI_ROUTER_FALLBACK_MODELS
        )
    );
    const failClosed =
        first(
            env.SHEIKHA_AI_ROUTER_FAIL_CLOSED,
            env.HOSTINGER_AI_ROUTER_FAIL_CLOSED,
            'true'
        ).toLowerCase() !== 'false';

    const configured = Boolean(apiKey && model);
    const secureBase = String(baseUrl).startsWith('https://');
    const modelAllowed = !allowedModels.length || allowedModels.includes(model);

    if (
        enabled &&
        failClosed &&
        (!configured || !secureBase || !modelAllowed)
    ) {
        throw new Error('SHEIKHA_AI_ROUTER_POLICY_BLOCK');
    }

    return Object.freeze({
        name: 'Sheikha AI Router',
        provider: 'sheikha-ai-router',
        upstream,
        enabled,
        configured,
        baseUrl,
        model: model || null,
        allowedModels,
        fallbackModels,
        failClosed,
        keyPresent: Boolean(apiKey),
        resolveModel(requestedModel) {
            const selected = requestedModel || model;
            if (allowedModels.length && !allowedModels.includes(selected)) {
                throw new Error('SHEIKHA_AI_ROUTER_MODEL_NOT_ALLOWED');
            }
            return selected;
        },
        getClientConfig() {
            if (!configured) {
                throw new Error('SHEIKHA_AI_ROUTER_NOT_CONFIGURED');
            }
            return {
                apiKey,
                baseURL: baseUrl
            };
        },
        status() {
            return {
                name: 'Sheikha AI Router',
                provider: 'sheikha-ai-router',
                upstream,
                enabled,
                configured,
                baseUrl,
                model: model || null,
                allowedModels,
                fallbackModels,
                failClosed,
                keyPresent: Boolean(apiKey)
            };
        }
    });
}

module.exports = {
    OFFICIAL_UPSTREAM,
    createSheikhaAIRouter
};
