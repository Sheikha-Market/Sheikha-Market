'use strict';

const sheikhaLanguageLayer = require('../lib/sheikha-language-layer');

const SUPPORTED_RUNTIME_MODES = ['pilot', 'production', 'development', 'staging'];

function resolveRuntimeMode(input) {
    const raw = String(input || process.env.SHEIKHA_RUNTIME_MODE || 'pilot').trim().toLowerCase();
    return SUPPORTED_RUNTIME_MODES.includes(raw) ? raw : 'pilot';
}

function buildRootConfig({ runtimeMode } = {}) {
    const mode = resolveRuntimeMode(runtimeMode);

    return {
        name: 'Sheikha Root Foundation',
        version: '1.0.0',
        runtimeMode: mode,
        covenant: 'توحيد البناء الرقمي لله بالكتاب والسنة',
        layers: [
            'language-layer',
            'identity',
            'governance',
            'operations',
            'integration',
            'intelligence',
            'experience'
        ],
        capabilities: {
            governance: ['audit-trails', 'shariah-flags', 'runtime-policy'],
            integration: ['api-gateway', 'event-connectors', 'retry-queue'],
            intelligence: ['ai-recommendations', 'operational-signals'],
            experience: ['tenant-portals', 'control-tower'],
            data: ['json-fallback', 'postgres-mirroring']
        },
        principles: [
            'لا ربا',
            'لا غرر',
            'لا غش',
            'البيع عن تراضٍ',
            'أوفوا الكيل والميزان'
        ]
    };
}

function getSystemSnapshot({ runtimeMode } = {}) {
    const mode = resolveRuntimeMode(runtimeMode);
    const config = buildRootConfig({ runtimeMode: mode });

    return {
        runtimeMode: mode,
        status: 'ready',
        languageLayer: {
            status: 'active',
            activatedAt: sheikhaLanguageLayer.activate().timestamp
        },
        layers: config.layers,
        capabilities: config.capabilities,
        generatedAt: new Date().toISOString()
    };
}

function bootstrapRoot({ runtimeMode } = {}) {
    const mode = resolveRuntimeMode(runtimeMode);

    return {
        success: true,
        runtimeMode: mode,
        config: buildRootConfig({ runtimeMode: mode }),
        snapshot: getSystemSnapshot({ runtimeMode: mode }),
        activatedAt: new Date().toISOString()
    };
}

module.exports = {
    bootstrapRoot,
    buildRootConfig,
    getSystemSnapshot,
    resolveRuntimeMode
};