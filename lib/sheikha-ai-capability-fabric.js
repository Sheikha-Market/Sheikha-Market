'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(
    __dirname,
    '..',
    'config',
    'sheikha-ai-capability-fabric-v1.json'
);

function readRegistry() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function envConfigured(adapter) {
    if (!adapter.keyEnv) return true;
    return Boolean(process.env[adapter.keyEnv]);
}

function normalizeCapabilities(input) {
    if (!Array.isArray(input)) return [];
    return [...new Set(input.map(v => String(v || '').trim()).filter(Boolean))];
}

function adapterSupports(adapter, required) {
    const set = new Set(adapter.capabilities || []);
    return required.every(cap => set.has(cap));
}

function classifyData(dataClass) {
    const value = String(dataClass || 'internal').toLowerCase();
    if (['restricted', 'secret', 'highly-confidential'].includes(value)) {
        return 'restricted';
    }
    if (['public', 'internal', 'confidential'].includes(value)) return value;
    return 'internal';
}

function buildStatus() {
    const registry = readRegistry();
    const adapters = Object.entries(registry.adapters).map(([id, adapter]) => ({
        id,
        kind: adapter.kind,
        enabledByDefault: Boolean(adapter.enabledByDefault),
        configured: envConfigured(adapter),
        baseUrl: adapter.baseUrl || null,
        capabilities: adapter.capabilities || [],
        privacy: adapter.privacy || null,
        external: String(adapter.kind || '').includes('EXTERNAL')
    }));

    const nativeCapabilities = Object.entries(registry.capabilities)
        .filter(([, value]) => value.native === true)
        .map(([id]) => id);

    const adapterCapabilities = Object.entries(registry.capabilities)
        .filter(([, value]) => value.native !== true)
        .map(([id]) => id);

    return {
        system: registry.system,
        version: registry.version,
        status: registry.status,
        providerIdentity: registry.providerIdentity,
        defaultUpstream: registry.defaultUpstream,
        governance: registry.principles,
        summary: {
            totalCapabilities: Object.keys(registry.capabilities).length,
            nativeCapabilities: nativeCapabilities.length,
            adapterDependentCapabilities: adapterCapabilities.length,
            adapters: adapters.length,
            configuredExternalAdapters: adapters.filter(a => a.external && a.configured).length
        },
        capabilities: registry.capabilities,
        adapters,
        policy: registry.policy
    };
}

function planCapabilityRoute(input = {}) {
    const registry = readRegistry();
    const required = normalizeCapabilities(input.capabilities);
    const dataClass = classifyData(input.dataClass);
    const impact = String(input.impact || 'normal').toLowerCase();
    const allowExternal = input.allowExternal === true;
    const costPreference = String(input.costPreference || registry.policy.costTierDefault || 'balanced');

    const unknown = required.filter(cap => !registry.capabilities[cap]);
    if (unknown.length) {
        return {
            ok: false,
            decision: 'DENY',
            reason: 'UNKNOWN_CAPABILITY',
            unknownCapabilities: unknown,
            executionPerformed: false
        };
    }

    const native = registry.adapters.sheikha;
    if (adapterSupports(native, required)) {
        return {
            ok: true,
            decision: 'ALLOW_NATIVE',
            provider: 'sheikha',
            upstream: 'sheikha',
            capabilities: required,
            dataClass,
            impact,
            costPreference,
            externalExecution: false,
            executionPerformed: false,
            reason: 'NATIVE_SHEIKHA_CAPABILITIES_SATISFY_REQUEST'
        };
    }

    if (dataClass === 'restricted' && registry.policy.restrictedDataExternal === false) {
        return {
            ok: false,
            decision: 'DENY',
            reason: 'RESTRICTED_DATA_EXTERNAL_ROUTING_BLOCKED',
            capabilities: required,
            dataClass,
            executionPerformed: false
        };
    }

    if (impact === 'high' && registry.policy.highImpactAutoRoute === false) {
        return {
            ok: false,
            decision: 'REVIEW_REQUIRED',
            reason: 'HIGH_IMPACT_REQUIRES_EXPLICIT_REVIEW',
            capabilities: required,
            dataClass,
            executionPerformed: false
        };
    }

    if (!allowExternal || registry.policy.defaultExternalExecution === false) {
        return {
            ok: false,
            decision: 'PLAN_EXTERNAL_ONLY',
            reason: 'EXTERNAL_EXECUTION_REQUIRES_EXPLICIT_AUTHORIZATION',
            capabilities: required,
            dataClass,
            candidates: Object.entries(registry.adapters)
                .filter(([id, adapter]) =>
                    id !== 'sheikha' &&
                    adapterSupports(adapter, required)
                )
                .map(([id, adapter]) => ({
                    id,
                    kind: adapter.kind,
                    configured: envConfigured(adapter),
                    baseUrl: adapter.baseUrl || null
                })),
            executionPerformed: false
        };
    }

    const candidates = Object.entries(registry.adapters)
        .filter(([id, adapter]) =>
            id !== 'sheikha' &&
            adapterSupports(adapter, required) &&
            envConfigured(adapter)
        )
        .map(([id, adapter]) => ({
            id,
            kind: adapter.kind,
            baseUrl: adapter.baseUrl || null,
            configured: true
        }));

    if (!candidates.length) {
        return {
            ok: false,
            decision: 'DENY',
            reason: 'NO_CONFIGURED_ADAPTER_SATISFIES_CAPABILITIES',
            capabilities: required,
            executionPerformed: false
        };
    }

    return {
        ok: true,
        decision: 'EXTERNAL_ADAPTER_AUTHORIZED_FOR_PLAN',
        provider: 'sheikha',
        upstreamCandidate: candidates[0].id,
        candidates,
        capabilities: required,
        dataClass,
        impact,
        costPreference,
        externalExecution: true,
        executionPerformed: false,
        reason: 'SHEIKHA_GOVERNANCE_SELECTED_EXTERNAL_ADAPTER'
    };
}

module.exports = {
    readRegistry,
    buildStatus,
    planCapabilityRoute
};
