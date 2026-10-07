'use strict';

const DEFAULT_TIMEOUT_MS = 60000;

function createHostingerUpstreamAdapter({ router, fetchImpl = global.fetch, env = process.env } = {}) {
    if (!router) throw new Error('SHEIKHA_UPSTREAM_ROUTER_REQUIRED');
    if (typeof fetchImpl !== 'function') throw new Error('SHEIKHA_UPSTREAM_FETCH_REQUIRED');

    const timeoutMs = Number.parseInt(env.SHEIKHA_AI_ROUTER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS, 10);

    async function chatCompletions(payload) {
        const client = router.getClientConfig();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetchImpl(
                client.baseURL.replace(/\/$/, '') + '/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        authorization: 'Bearer ' + client.apiKey
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                }
            );

            const text = await response.text();
            let body = {};
            try {
                body = text ? JSON.parse(text) : {};
            } catch (_) {
                body = { message: text.slice(0, 500) };
            }

            if (!response.ok) {
                const error = new Error('SHEIKHA_UPSTREAM_REQUEST_FAILED');
                error.status = response.status;
                error.upstream = 'hostinger';
                error.body = body;
                throw error;
            }

            return body;
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

module.exports = { createHostingerUpstreamAdapter };
