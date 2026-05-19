'use strict';

const config = require('../config/config');
const integrationGateway = require('../integration/sheikha-integration-gateway');
const integrations = require('./integrations');

const BLUEPRINT_VERSION = '1.0.0';
const BLUEPRINT_IDENTITY = {
    nameAr: 'محرك blueprint متعدد البيئات',
    nameEn: 'Sheikha Multi-Environment Blueprint Engine',
    version: BLUEPRINT_VERSION
};

const REPO_BLUEPRINT = Object.freeze({
    services: [
        { name: 'API Gateway', path: '/api/gateway', owner: 'routes/api-gateway.js', priority: 'P0' },
        { name: 'Multi Environment Operations', path: '/api/multi-env', owner: 'routes/multi-env-operations.js', priority: 'P0' },
        { name: 'Neural Operations', path: '/api/neural-ops', owner: 'routes/neural-operations.js', priority: 'P1' },
        { name: 'Supply Chain', path: '/api/scm', owner: 'routes/scm.js', priority: 'P1' },
        { name: 'Safety', path: '/api/safety', owner: 'routes/safety.js', priority: 'P0' }
    ],
    priorities: [
        'توحيد التشغيل بين development / staging / production',
        'ربط المحولات الحالية عبر adapter registry موحد',
        'تفعيل مراقبة وامتثال وتشغيل آمن بموافقة بشرية للعمليات الحرجة',
        'إضافة جاهزية لسلسلة الإمداد البرمجية قبل الإطلاق'
    ],
    sprints: [
        {
            sprint: 1,
            focus: 'الأساس التشغيلي',
            outcomes: ['تهيئة البيئات', 'كشف المحولات', 'حالة التشغيل والامتثال', 'دليل blueprint']
        },
        {
            sprint: 2,
            focus: 'تكامل العمليات',
            outcomes: ['ربط neural-ops وscm', 'تشخيص adapters', 'runbooks للبوت التشغيلي']
        },
        {
            sprint: 3,
            focus: 'بوابات الاعتمادية والإطلاق',
            outcomes: ['بوابات security/compliance/health', 'جاهزية DR', 'تقارير readiness متعددة المناطق']
        }
    ]
});

function getPlatformConfig() {
    return config.platform || {};
}

function getEnvironmentNames() {
    return Object.keys(getPlatformConfig().environments || {});
}

function normalizeEnvironmentName(value) {
    const input = String(value || '').trim().toLowerCase();
    if (!input) return String(getPlatformConfig().defaultEnvironment || 'development');
    return getEnvironmentNames().includes(input) ? input : '';
}

function normalizeSector(value) {
    const supported = getPlatformConfig().supportedSectors || [];
    const input = String(value || '').trim().toLowerCase();
    if (!input) return String(getPlatformConfig().defaultSector || '');
    return supported.includes(input) ? input : '';
}

function listBuiltinAdapters() {
    try {
        return integrations.listAdapters();
    } catch (_) {
        return [];
    }
}

function getIntegrationGatewayStatus() {
    try {
        return integrationGateway.status();
    } catch (_) {
        return {
            connectors: {
                total: 0,
                connected: 0,
                disconnected: 0
            }
        };
    }
}

function getEnvironmentRecord(name) {
    const envName = normalizeEnvironmentName(name);
    if (!envName) return null;
    return { name: envName, ...(getPlatformConfig().environments || {})[envName] };
}

function mapAdapters(adapterNames) {
    const names = Array.isArray(adapterNames) ? adapterNames : [];
    const builtin = new Map(listBuiltinAdapters().map(adapter => [adapter.name, adapter]));
    return names.map((name) => ({
        name,
        available: builtin.has(name),
        connected: builtin.has(name) ? !!builtin.get(name).connected : false
    }));
}

function getEnvironmentStatus(name) {
    const record = getEnvironmentRecord(name);
    if (!record) return null;

    return {
        name: record.name,
        enabled: !!record.enabled,
        runtime: record.runtime,
        region: record.region,
        criticality: record.criticality,
        deploymentTargets: record.deploymentTargets || [],
        healthTargets: record.healthTargets || [],
        adapters: mapAdapters(record.adapters),
        approvalsRequired: !!(((getPlatformConfig().criticalityLevels || {})[record.criticality] || {}).approvalsRequired)
    };
}

function listEnvironmentStatuses() {
    return getEnvironmentNames().map(getEnvironmentStatus).filter(Boolean);
}

function getOperationsBotStatus() {
    const operationsBot = getPlatformConfig().operationsBot || {};
    return {
        enabled: !!operationsBot.enabled,
        mode: operationsBot.mode || 'assistive',
        humanApprovalRequiredForCriticalOps: operationsBot.humanApprovalRequiredForCriticalOps !== false,
        runbooks: Array.isArray(operationsBot.runbooks) ? operationsBot.runbooks : []
    };
}

function getComplianceStatus() {
    const compliance = getPlatformConfig().compliance || {};
    const supplyChain = getPlatformConfig().supplyChain || {};
    return {
        frameworks: Array.isArray(compliance.frameworks) ? compliance.frameworks : [],
        shariaAligned: compliance.shariaAligned !== false,
        prohibitedUseCases: Array.isArray(compliance.prohibitedUseCases) ? compliance.prohibitedUseCases : [],
        softwareSupplyChain: {
            sbomRequired: supplyChain.sbomRequired !== false,
            signedArtifactsRequired: supplyChain.signedArtifactsRequired !== false,
            vulnerabilityScanning: supplyChain.vulnerabilityScanning !== false,
            deploymentGates: Array.isArray(supplyChain.deploymentGates) ? supplyChain.deploymentGates : []
        }
    };
}

function getBlueprint() {
    return {
        identity: BLUEPRINT_IDENTITY,
        repository: 'Sheikha-Market/Sheikha-Market',
        defaultEnvironment: getPlatformConfig().defaultEnvironment,
        defaultSector: getPlatformConfig().defaultSector,
        sectors: getPlatformConfig().supportedSectors || [],
        services: REPO_BLUEPRINT.services,
        priorities: REPO_BLUEPRINT.priorities,
        sprints: REPO_BLUEPRINT.sprints
    };
}

function getStatus() {
    const gatewayStatus = getIntegrationGatewayStatus();
    return {
        identity: BLUEPRINT_IDENTITY,
        environments: listEnvironmentStatuses(),
        adapters: {
            builtin: listBuiltinAdapters(),
            gateway: gatewayStatus.connectors
        },
        operationsBot: getOperationsBotStatus(),
        compliance: getComplianceStatus(),
        timestamp: new Date().toISOString()
    };
}

function validateRequest(payload = {}) {
    const environment = normalizeEnvironmentName(payload.environment);
    const sector = normalizeSector(payload.sector);
    const adapterNames = Array.isArray(payload.adapters) ? payload.adapters : [];

    if (!environment) {
        return { ok: false, errors: ['environment غير صالح أو غير مدعوم'] };
    }
    if (!sector) {
        return { ok: false, errors: ['sector غير صالح أو غير مدعوم'] };
    }
    if (adapterNames.length > 25) {
        return { ok: false, errors: ['الحد الأقصى للمحولات المطلوب فحصها هو 25'] };
    }
    if (!adapterNames.every(name => typeof name === 'string' && name.trim() && name.length <= 64)) {
        return { ok: false, errors: ['adapters يجب أن تكون أسماء نصية صالحة'] };
    }

    const status = getEnvironmentStatus(environment);
    const compliance = getComplianceStatus();
    const prohibitedUseCases = new Set(compliance.prohibitedUseCases);
    const requestedUseCase = String(payload.useCase || '').trim().toLowerCase();

    if (requestedUseCase && prohibitedUseCases.has(requestedUseCase)) {
        return { ok: false, errors: ['حالة الاستخدام المطلوبة محظورة ضمن سياسات الامتثال'] };
    }

    const effectiveAdapters = adapterNames.length ? mapAdapters(adapterNames) : status.adapters;
    const availableAdapters = effectiveAdapters.filter(adapter => adapter.available).length;
    const readinessScore = Math.min(
        100,
        (status.enabled ? 40 : 0) +
        (availableAdapters > 0 ? 30 : 0) +
        (status.healthTargets.length > 0 ? 20 : 0) +
        (status.approvalsRequired ? 10 : 5)
    );

    return {
        ok: true,
        environment,
        sector,
        readinessScore,
        approvalsRequired: status.approvalsRequired,
        adapters: effectiveAdapters,
        healthTargets: status.healthTargets,
        deploymentTargets: status.deploymentTargets,
        compliance
    };
}

module.exports = {
    BLUEPRINT_IDENTITY,
    getBlueprint,
    getStatus,
    getEnvironmentStatus,
    listEnvironmentStatuses,
    getOperationsBotStatus,
    getComplianceStatus,
    normalizeEnvironmentName,
    normalizeSector,
    validateRequest
};
