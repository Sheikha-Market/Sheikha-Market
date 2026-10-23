'use strict';

const { SheikhaLocalMind } = require('../sheikha-local-mind');

let mindPromise = null;

async function getMind() {
    if (!mindPromise) {
        mindPromise = (async () => {
            const mind = new SheikhaLocalMind();
            await mind.initialize();
            return mind;
        })();
    }
    return mindPromise;
}

function lastUserMessage(messages = []) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i]?.role === 'user' && typeof messages[i]?.content === 'string') {
            return messages[i].content;
        }
    }
    return '';
}

function createSheikhaUpstreamAdapter() {
    async function chatCompletions(payload = {}) {
        const mind = await getMind();
        const prompt = lastUserMessage(payload.messages);

        if (!prompt) {
            throw new Error('SHEIKHA_NATIVE_MESSAGE_REQUIRED');
        }

        const result = mind.respond(prompt, {
            conversationId: payload.conversation_id || 'sheikha-ai-router'
        });

        return {
            id: result.id || ('sheikha-' + Date.now()),
            object: 'chat.completion',
            model: result.model || 'SheikhaNeural-v1.0',
            provider: 'sheikha',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: result.response
                    },
                    finish_reason: 'stop'
                }
            ],
            usage: {
                prompt_tokens: null,
                completion_tokens: null,
                total_tokens: null
            },
            sheikhaNative: {
                intent: result.intent,
                confidence: result.confidence,
                latencyMs: result.latencyMs,
                independence: result.independence
            }
        };
    }

    return Object.freeze({
        id: 'sheikha',
        visibility: 'native-upstream',
        model: 'SheikhaNeural-v1.0',
        chatCompletions
    });
}

module.exports = { createSheikhaUpstreamAdapter };
