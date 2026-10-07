'use strict';

const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_MAX_INPUT_CHARS = 120000;

function integer(value, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

function createSheikhaRouterGovernor(env = process.env) {
    const maxTokens = integer(env.SHEIKHA_AI_ROUTER_MAX_TOKENS, DEFAULT_MAX_TOKENS);
    const maxInputChars = integer(
        env.SHEIKHA_AI_ROUTER_MAX_INPUT_CHARS,
        DEFAULT_MAX_INPUT_CHARS
    );

    function governChatRequest(payload = {}, router) {
        if (
            !router ||
            router.provider !== 'sheikha' ||
            router.router !== 'sheikha-ai-router'
        ) {
            throw new Error('SHEIKHA_GOVERNANCE_ROUTER_REQUIRED');
        }
        if (!router.enabled || !router.configured) {
            throw new Error('SHEIKHA_GOVERNANCE_ROUTER_NOT_READY');
        }

        const messages = Array.isArray(payload.messages) ? payload.messages : [];
        if (!messages.length) {
            throw new Error('SHEIKHA_GOVERNANCE_MESSAGES_REQUIRED');
        }

        const totalChars = messages.reduce((sum, item) => {
            const content = typeof item?.content === 'string' ? item.content : '';
            return sum + content.length;
        }, 0);
        if (totalChars > maxInputChars) {
            throw new Error('SHEIKHA_GOVERNANCE_INPUT_TOO_LARGE');
        }

        const model = router.resolveModel(payload.model);
        const requestedTokens =
            payload.max_completion_tokens ?? payload.max_tokens ?? maxTokens;
        const governedTokens = Math.min(integer(requestedTokens, maxTokens), maxTokens);

        const clean = {
            ...payload,
            model,
            messages
        };
        delete clean.apiKey;
        delete clean.api_key;
        delete clean.baseURL;
        delete clean.base_url;
        delete clean.authorization;

        if ('max_completion_tokens' in payload) {
            clean.max_completion_tokens = governedTokens;
            delete clean.max_tokens;
        } else {
            clean.max_tokens = governedTokens;
        }

        return Object.freeze({
            payload: clean,
            decision: Object.freeze({
                authority: 'sheikha-governance',
                provider: 'sheikha',
                upstream: router.upstream,
                model,
                maxTokens: governedTokens,
                principles: [
                    'no-harm',
                    'no-riba',
                    'no-deception',
                    'secret-isolation',
                    'explicit-authority',
                    'fail-closed'
                ]
            })
        });
    }

    return Object.freeze({
        name: 'Sheikha Supreme AI Governance',
        authority: 'sheikha-governance',
        maxTokens,
        maxInputChars,
        governChatRequest
    });
}

module.exports = {
    createSheikhaRouterGovernor,
    DEFAULT_MAX_TOKENS,
    DEFAULT_MAX_INPUT_CHARS
};
