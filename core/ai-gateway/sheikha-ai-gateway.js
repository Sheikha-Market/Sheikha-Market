'use strict';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core';

async function askSheikhaCore({ prompt, model = DEFAULT_MODEL, context = {} }) {
    if (!prompt || typeof prompt !== 'string') {
        return {
            success: false,
            error: 'invalid_prompt',
            message: 'prompt مطلوب'
        };
    }

    const body = {
        model,
        prompt,
        stream: false,
        options: {
            temperature: 0.2,
            num_ctx: 4096
        }
    };

    const r = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!r.ok) {
        return {
            success: false,
            error: 'local_model_unavailable',
            status: r.status
        };
    }

    const data = await r.json();

    return {
        success: true,
        provider: 'sheikha-local',
        model,
        mode: 'governed-local-ai',
        governance: {
            tawheed: true,
            noRiba: true,
            noFraud: true,
            noHarm: true,
            noGhaybPrediction: true,
            humanAuthority: true
        },
        context,
        output: data.response || '',
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    askSheikhaCore,
    DEFAULT_MODEL,
    OLLAMA_URL
};
