'use strict';

const { createSheikhaAIRouter } = require('../sheikha-ai-router');
const { createSheikhaRouterGovernor } = require('./governance');
const { createHostingerUpstreamAdapter } = require('./hostinger-upstream');

function createSheikhaProvider(options = {}) {
    const env = options.env || process.env;
    const router = options.router || createSheikhaAIRouter(env);
    const governor = options.governor || createSheikhaRouterGovernor(env);

    const upstreams = new Map();
    upstreams.set(
        'hostinger',
        options.hostingerAdapter ||
            createHostingerUpstreamAdapter({
                router,
                fetchImpl: options.fetchImpl,
                env
            })
    );

    function getUpstream() {
        const upstream = upstreams.get(router.upstream);
        if (!upstream) throw new Error('SHEIKHA_PROVIDER_UPSTREAM_NOT_REGISTERED');
        return upstream;
    }

    async function chatCompletions(payload, context = {}) {
        if (context.authorized === false) {
            throw new Error('SHEIKHA_PROVIDER_AUTHORITY_DENIED');
        }

        const governed = governor.governChatRequest(payload, router);
        const upstream = getUpstream();
        const response = await upstream.chatCompletions(governed.payload);

        return {
            ...response,
            sheikha: {
                provider: 'sheikha',
                authority: governor.authority,
                routing: 'sheikha-ai-router',
                upstream: upstream.id,
                model: governed.decision.model
            }
        };
    }

    function status() {
        return {
            provider: 'sheikha',
            identity: 'Sheikha AI Provider',
            upperLayer: governor.name,
            routingLayer: 'Sheikha AI Router',
            lowerLayer: 'Sheikha Provider Fabric',
            upstream: router.upstream,
            upstreamVisibility: 'private',
            router: router.status()
        };
    }

    return Object.freeze({
        id: 'sheikha',
        name: 'Sheikha AI Provider',
        chatCompletions,
        status
    });
}

module.exports = { createSheikhaProvider };
