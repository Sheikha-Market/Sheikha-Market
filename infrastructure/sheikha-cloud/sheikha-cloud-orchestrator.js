'use strict';

/**
 * Sheikha Cloud Orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * Central entry-point for the Sheikha Sovereign Multi-Cloud platform.
 * Loads and exposes all cloud layer specifications, and provides a unified
 * status / health API for the platform.
 *
 * Layers:
 *   L0 — Physical Infrastructure (sovereign regions, subsea cables, IXPs)
 *   L1 — Multi-Cloud Fabric (K8s federation, Terraform, cloud providers)
 *   L2 — Sovereignty & Governance (SCSF, HSM, PKI, OIC Council)
 *   L3 — AI Core (Sheikha Neural — LLM, fatwa engine, translation)
 *   L4 — Government Services (digital ID, eGov, e-voting, archive)
 *   L5 — Commerce Engine (global market, Sheikha Pay / DND, halal AI)
 *   L6 — Cybersecurity (zero trust, PQC, SOC, threat intel)
 *   L7 — Communications (mesh, LEO satellite, 6G, sovereign messaging)
 *   L8 — Finance & Science (CBDC, zakat, waqf, universities, IoT)
 *   L9 — Observability (OpenTelemetry, Prometheus, Grafana, Jaeger)
 */

const path = require('node:path');
const fs   = require('node:fs');

const CLOUD_BASE = path.join(__dirname);

// ── Spec loader ───────────────────────────────────────────────────────────────
function loadSpec(relPath) {
    const absPath = path.join(CLOUD_BASE, relPath);
    try {
        return JSON.parse(fs.readFileSync(absPath, 'utf8'));
    } catch (err) {
        console.error(`[SheikhaCloud] Failed to load spec: ${relPath} — ${err.message}`);
        return null;
    }
}

// ── Load all layer specifications ─────────────────────────────────────────────
const SPECS = {
    L0_physicalRegions:   loadSpec('physical/sovereign-regions.json'),
    L0_subseaCables:      loadSpec('physical/subsea-cables.json'),
    L1_cloudProviders:    loadSpec('multi-cloud/cloud-providers.json'),
    L2_sovereignty:       loadSpec('sovereignty/scsf-framework.json'),
    L2_governance:        loadSpec('governance/council.json'),
    L3_aiCore:            loadSpec('ai/sheikha-neural-core.json'),
    L4_govServices:       loadSpec('government-services/gov-services.json'),
    L5_commerce:          loadSpec('commerce/commerce-engine.json'),
    L6_security:          loadSpec('security/cybersecurity.json'),
    L7_communications:    loadSpec('communications/communications.json'),
    L8_financeScience:    loadSpec('finance/finance-science.json'),
    L9_roadmap:           loadSpec('roadmap/roadmap.json'),
    L10_checkpoint:       loadSpec('checkpoint/activation-checkpoint.json'),
};

// ── Platform identity ─────────────────────────────────────────────────────────
const PLATFORM = {
    name:       'Sheikha Sovereign Cloud',
    nameAr:     'شيخة السحابة السيادية',
    version:    '1.0.0',
    consortium: 'Sheikha Sovereign Cloud Consortium',
    memberStates: 57,
    primaryRegions: SPECS.L0_physicalRegions
        ? SPECS.L0_physicalRegions.regions.filter(r => r.tier === 'PRIMARY').length
        : 0,
    totalRegions: SPECS.L0_physicalRegions
        ? SPECS.L0_physicalRegions.regions.length
        : 0,
    standards: ['SCSF-1.0', 'ISO27001', 'FIPS-140-3-L4', 'NIST-SP800-207', 'OIC-DCI-1.0'],
};

// ── Health check ──────────────────────────────────────────────────────────────
function getHealthStatus() {
    const loadedLayers = Object.entries(SPECS)
        .filter(([, v]) => v !== null)
        .map(([k]) => k);
    const failedLayers = Object.entries(SPECS)
        .filter(([, v]) => v === null)
        .map(([k]) => k);

    return {
        status:       failedLayers.length === 0 ? 'healthy' : 'degraded',
        platform:     PLATFORM,
        layers:       { loaded: loadedLayers.length, failed: failedLayers.length, failedList: failedLayers },
        timestamp:    new Date().toISOString(),
    };
}

// ── Layer accessors ───────────────────────────────────────────────────────────

/** Returns all sovereign data-centre regions */
function getSovereignRegions() {
    return SPECS.L0_physicalRegions ? SPECS.L0_physicalRegions.regions : [];
}

/** Returns regions filtered by tier ('PRIMARY' | 'SECONDARY') */
function getRegionsByTier(tier) {
    return getSovereignRegions().filter(r => r.regionTier === tier || r.tier === tier);
}

/** Returns the SCSF sovereignty principles */
function getSovereigntyPrinciples() {
    return SPECS.L2_sovereignty ? SPECS.L2_sovereignty.principles : [];
}

/** Returns the data residency matrix (country → approved regions) */
function getDataResidency(countryCode) {
    const matrix = SPECS.L2_sovereignty?.dataResidencyMatrix
        ? SPECS.L2_sovereignty.dataResidencyMatrix.entries
        : {};
    return matrix[countryCode] || matrix['DEFAULT_OIC'] || [];
}

/** Returns OIC member states list */
function getOICMemberStates() {
    return SPECS.L2_governance ? SPECS.L2_governance.oicMemberStates : null;
}

/** Returns AI layer configuration */
function getAIConfig() {
    return SPECS.L3_aiCore || null;
}

/** Returns commerce engine configuration */
function getCommerceConfig() {
    return SPECS.L5_commerce || null;
}

/** Returns cybersecurity layer details */
function getSecurityConfig() {
    return SPECS.L6_security || null;
}

/** Returns implementation roadmap */
function getRoadmap() {
    return SPECS.L9_roadmap ? SPECS.L9_roadmap.phases : [];
}

/** Returns current active roadmap phase based on current date */
function getCurrentPhase() {
    const now    = new Date();
    const phases = getRoadmap();
    // Phase 1 start is 2026-Q2
    const phase1Start = new Date('2026-04-01');
    const monthsElapsed = Math.floor((now - phase1Start) / (1000 * 60 * 60 * 24 * 30));

    if (monthsElapsed < 0)  return phases[0] || null;
    if (monthsElapsed < 12) return phases[0] || null;
    if (monthsElapsed < 36) return phases[1] || null;
    if (monthsElapsed < 60) return phases[2] || null;
    return phases[3] || null;
}

function getActivationCheckpoint() {
    return SPECS.L10_checkpoint || null;
}

function getScopeMetrics() {
    const checkpoint = getActivationCheckpoint();
    const targets = checkpoint?.measurableScope || {};
    const live = {
        regions: {
            total: getSovereignRegions().length,
            primary: getRegionsByTier('PRIMARY').length,
            secondary: getRegionsByTier('SECONDARY').length,
        },
        providers: {
            total: SPECS.L1_cloudProviders && Array.isArray(SPECS.L1_cloudProviders.providers)
                ? SPECS.L1_cloudProviders.providers.length
                : 0,
        },
        roadmapPhases: getRoadmap().length,
    };

    return {
        targets,
        live,
        timestamp: new Date().toISOString(),
    };
}

function getDataFabricConfig() {
    const checkpoint = getActivationCheckpoint();
    const dataFabric = checkpoint?.dataFabric || null;
    const residencyMatrix = SPECS.L2_sovereignty?.dataResidencyMatrix
        ? SPECS.L2_sovereignty.dataResidencyMatrix
        : null;

    return {
        dataFabric,
        residencyMatrix,
        timestamp: new Date().toISOString(),
    };
}

function getRootNeuralRuntimeConfig() {
    const checkpoint = getActivationCheckpoint();
    return {
        rootNeuralRuntime: checkpoint?.rootNeuralRuntime || null,
        aiLayer: getAIConfig(),
        timestamp: new Date().toISOString(),
    };
}

function ok(res, data, message) {
    return res.json({ success: true, data, message, timestamp: new Date().toISOString() });
}

function getGapAnalysis() {
    const checks = [
        { key: 'roadmap', passed: getRoadmap().length > 0, severity: 'high', message: 'خارطة الطريق متوفرة' },
        { key: 'sovereignty', passed: getSovereigntyPrinciples().length > 0, severity: 'high', message: 'طبقة السيادة متوفرة' },
        { key: 'security', passed: !!getSecurityConfig(), severity: 'high', message: 'طبقة الأمن متوفرة' },
        { key: 'communications', passed: !!SPECS.L7_communications, severity: 'medium', message: 'طبقة الاتصالات متوفرة' },
        { key: 'checkpoint', passed: !!getActivationCheckpoint(), severity: 'high', message: 'نموذج checkpoint متوفر' },
    ];

    const gaps = checks
        .filter(c => !c.passed)
        .map((c, index) => ({
            id: `GAP-${String(index + 1).padStart(3, '0')}`,
            domain: c.key,
            severity: c.severity,
            title: `فجوة في ${c.key}`,
            action: `استكمال المتطلبات الخاصة بـ ${c.key} قبل التوسع المرحلي`,
        }));

    const passedCount = checks.filter(c => c.passed).length;
    const passRate = checks.length === 0 ? 0 : Math.round((passedCount / checks.length) * 100);

    return {
        summary: {
            totalChecks: checks.length,
            passedChecks: passedCount,
            failedChecks: checks.length - passedCount,
            passRate,
        },
        checks,
        gaps,
        timestamp: new Date().toISOString(),
    };
}

function getPrioritizedBacklog() {
    const checkpoint = getActivationCheckpoint();
    const templates = checkpoint && Array.isArray(checkpoint.backlogTemplates)
        ? checkpoint.backlogTemplates
        : [];
    const gapAnalysis = getGapAnalysis();

    const generatedItems = gapAnalysis.gaps.map((gap, index) => ({
        id: `AUTO-${String(index + 1).padStart(3, '0')}`,
        title: gap.title,
        priority: gap.severity === 'high' ? 'high' : 'medium',
        owner: gap.domain === 'security' ? 'Security' : 'Platform',
        source: 'gap-analysis',
    }));

    const items = [...templates, ...generatedItems].sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 };
        return (rank[a.priority] ?? 99) - (rank[b.priority] ?? 99);
    });

    return {
        items,
        total: items.length,
        timestamp: new Date().toISOString(),
    };
}

// ── Express router (optional — attach to existing Sheikha server) ─────────────
function createRouter() {
    // Lazy-load express to avoid hard dependency
    let express;
    try {
        express = require('express');
    } catch {
        console.warn('[SheikhaCloud] express not available — router not created');
        return null;
    }

    const router = express.Router();

    router.get('/health', (req, res) => {
        res.json(getHealthStatus());
    });

    router.get('/regions', (req, res) => {
        const { tier } = req.query;
        const regions = tier ? getRegionsByTier(tier) : getSovereignRegions();
        res.json({ success: true, count: regions.length, regions });
    });

    router.get('/sovereignty', (req, res) => {
        res.json({ success: true, principles: getSovereigntyPrinciples() });
    });

    router.get('/data-residency/:countryCode', (req, res) => {
        const { countryCode } = req.params;
        const approvedRegions = getDataResidency(countryCode.toUpperCase());
        res.json({ success: true, countryCode: countryCode.toUpperCase(), approvedRegions });
    });

    router.get('/roadmap', (req, res) => {
        res.json({ success: true, phases: getRoadmap(), currentPhase: getCurrentPhase() });
    });

    router.get('/ai', (req, res) => {
        res.json({ success: true, config: getAIConfig() });
    });

    router.get('/commerce', (req, res) => {
        res.json({ success: true, config: getCommerceConfig() });
    });

    router.get('/security', (req, res) => {
        res.json({ success: true, config: getSecurityConfig() });
    });

    router.get('/oic-members', (req, res) => {
        res.json({ success: true, data: getOICMemberStates() });
    });

    router.get('/platform', (req, res) => {
        res.json({ success: true, platform: PLATFORM, specs: Object.keys(SPECS) });
    });

    router.get('/checkpoint', (req, res) => {
        return ok(res, getActivationCheckpoint(), 'تم جلب نموذج checkpoint بنجاح');
    });

    router.get('/scope-metrics', (req, res) => {
        return ok(res, getScopeMetrics(), 'تم جلب مؤشرات النطاق المقاسة');
    });

    router.get('/data-fabric', (req, res) => {
        return ok(res, getDataFabricConfig(), 'تم جلب إعدادات نسيج البيانات');
    });

    router.get('/neural-root', (req, res) => {
        return ok(res, getRootNeuralRuntimeConfig(), 'تم جلب إعدادات الشبكة الجذرية');
    });

    router.get('/activation/gaps', (req, res) => {
        return ok(res, getGapAnalysis(), 'تم جلب تحليل الفجوات');
    });

    router.get('/activation/backlog', (req, res) => {
        return ok(res, getPrioritizedBacklog(), 'تم جلب قائمة الأعمال ذات الأولوية');
    });

    return router;
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
    PLATFORM,
    SPECS,
    getHealthStatus,
    getSovereignRegions,
    getRegionsByTier,
    getSovereigntyPrinciples,
    getDataResidency,
    getOICMemberStates,
    getAIConfig,
    getCommerceConfig,
    getSecurityConfig,
    getRoadmap,
    getCurrentPhase,
    getActivationCheckpoint,
    getScopeMetrics,
    getDataFabricConfig,
    getRootNeuralRuntimeConfig,
    getGapAnalysis,
    getPrioritizedBacklog,
    createRouter,
};
