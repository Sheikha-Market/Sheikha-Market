/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║     SHEIKHA CIVILIZATION BOOTSTRAP                                           ║
 * ║     تفعيل المنظومة الحضارية — نقطة البدء المركزية                           ║
 * ║                                                                              ║
 * ║     SHEIKHA Sovereign Cognitive Infrastructure                               ║
 * ║     Unified Global Operational Intelligence Infrastructure                   ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾
 *
 * هذا الملف هو نقطة التفعيل المركزية للمنظومة الحضارية SHEIKHA.
 * يُشغّل جميع الطبقات بترتيب محدد ومنضبط:
 *
 *   1. Runtime Kernel          — النواة التشغيلية
 *   2. Infrastructure Fabric   — بنية الفابريك (13 طبقة)
 *   3. Observability Layer     — المراقبة والقياس
 *   4. Governance Fabric       — السيادة والحوكمة
 *   5. Integration Gateway     — التكاملات العالمية
 *   6. Orchestrator            — التنسيق الذاتي
 *   7. Modules Registry        — سجل الوحدات
 *   8. Domain Layers:
 *      - Supply Chain Runtime
 *      - Industrial Runtime
 *      - Trade Exchange Runtime
 *      - Financial Runtime
 *      - Smart Cities Runtime
 *
 * طبقات النظام:
 *   Infrastructure Layer → Runtime Layer → Intelligence Layer →
 *   Orchestration Layer → Governance Layer → Observability Layer →
 *   Autonomous Operations Layer
 *
 * @module sheikha-civilization-bootstrap
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

// ─── Infrastructure Layer ─────────────────────────────────────────────────────
const kernel       = require('./runtime/sheikha-runtime-kernel');
const fabric       = require('./fabric/sheikha-infrastructure-fabric');

// ─── Runtime & Intelligence Layers ───────────────────────────────────────────
const observability = require('./observability/sheikha-observability-layer');
const governance   = require('./governance/sheikha-governance-fabric');
const integration  = require('./integration/sheikha-integration-gateway');

// ─── Orchestration Layer ──────────────────────────────────────────────────────
const orchestrator = require('./orchestration/sheikha-orchestrator');

// ─── Modules Layer ────────────────────────────────────────────────────────────
const modules      = require('./modules/index');

// ─── Domain Layers ────────────────────────────────────────────────────────────
const supplyChain  = require('./supply-chain/index');
const industry     = require('./industry/index');
const trade        = require('./trade/index');
const financial    = require('./financial/index');
const smartCities  = require('./smart-cities/index');

// ─── Civilization Identity ───────────────────────────────────────────────────

const CIVILIZATION_IDENTITY = {
    name:      'SHEIKHA',
    technical: 'SHEIKHA Sovereign Cognitive Infrastructure',
    executive: 'Unified Global Operational Intelligence Infrastructure',
    version:   '1.0.0',
    phase:     'Phase-1-Modular-Monolith',
    layers:    [
        'Infrastructure Layer',
        'Runtime Layer',
        'Intelligence Layer',
        'Orchestration Layer',
        'Governance Layer',
        'Observability Layer',
        'Autonomous Operations Layer',
    ],
    domains: [
        'Supply Chain',
        'Industrial',
        'Trade Exchange',
        'Financial',
        'Smart Cities',
    ],
    vision: 'بناء بنية تشغيل عالمية موحدة للصناعة والتجارة والخدمات والبنية الذكية والمدن والأنظمة التشغيلية ضمن منظومة سيادية قابلة للتوسع المستمر.',
    bootTime: null,
};

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * تفعيل المنظومة الحضارية SHEIKHA الكاملة.
 * @returns {object} — مرجع للمنظومة المُفعَّلة
 */
function activate() {
    CIVILIZATION_IDENTITY.bootTime = new Date().toISOString();

    _banner();

    // ── 1. Runtime Kernel ──────────────────────────────────────────────────
    kernel.boot();
    kernel.registerService('infrastructure-fabric', { critical: true });
    kernel.registerService('observability-layer',   { critical: true });
    kernel.registerService('governance-fabric',     { critical: true });
    kernel.registerService('integration-gateway',   { critical: false });
    kernel.registerService('orchestrator',          { critical: false });
    kernel.registerService('modules-registry',      { critical: false });
    kernel.registerService('supply-chain',          { critical: false });
    kernel.registerService('industry',              { critical: false });
    kernel.registerService('trade',                 { critical: false });
    kernel.registerService('financial',             { critical: false });
    kernel.registerService('smart-cities',          { critical: false });

    // ── 2. Infrastructure Fabric ───────────────────────────────────────────
    fabric.initialize();
    kernel.startService('infrastructure-fabric');

    // ── 3. Observability Layer ─────────────────────────────────────────────
    observability.start();
    kernel.startService('observability-layer');
    observability.record('civilization.bootTime', CIVILIZATION_IDENTITY.bootTime);

    // Wire observability to kernel health
    kernel.on('kernel:health', (report) => {
        observability.record('kernel.engines', report.engines);
        observability.record('kernel.services.running', report.services.running);
    });

    // ── 4. Governance Fabric ───────────────────────────────────────────────
    governance.start();
    kernel.startService('governance-fabric');

    // ── 5. Integration Gateway ─────────────────────────────────────────────
    integration.start();
    kernel.startService('integration-gateway');

    // ── 6. Orchestrator ────────────────────────────────────────────────────
    orchestrator.start();
    kernel.startService('orchestrator');

    // Wire continuous evolution to observability
    orchestrator.on('cycle:complete', (summary) => {
        observability.record('evolution.totalCycles', summary.iteration);
        observability.record('evolution.lastCycleAt', summary.completedAt);
    });

    // ── 7. Modules Registry ────────────────────────────────────────────────
    modules.start();
    kernel.startService('modules-registry');

    // ── 8. Domain Layers ────────────────────────────────────────────────────
    supplyChain.start();
    kernel.startService('supply-chain');

    industry.start();
    kernel.startService('industry');

    trade.start();
    kernel.startService('trade');

    financial.start();
    kernel.startService('financial');

    smartCities.start();
    kernel.startService('smart-cities');

    // ── 9. Load Engine references into Kernel ──────────────────────────────
    kernel.loadEngine('observability', observability);
    kernel.loadEngine('governance', governance);
    kernel.loadEngine('integration', integration);
    kernel.loadEngine('orchestrator', orchestrator);
    kernel.loadEngine('fabric', fabric);

    // ── 10. Final Health Check ─────────────────────────────────────────────
    const health = kernel.healthCheck();
    observability.record('civilization.servicesRunning', health.services.running);

    _log(`✅ المنظومة مُفعَّلة | ${health.services.running}/${health.services.total} خدمة تعمل`);

    return {
        kernel,
        fabric,
        observability,
        governance,
        integration,
        orchestrator,
        modules,
        domains: { supplyChain, industry, trade, financial, smartCities },
        identity: CIVILIZATION_IDENTITY,
        health: () => kernel.healthCheck(),
        status: () => civilizationStatus(),
        runEvolutionCycle: (ctx) => orchestrator.runEvolutionCycle(ctx),
    };
}

// ─── Status ───────────────────────────────────────────────────────────────────

function civilizationStatus() {
    return {
        identity: CIVILIZATION_IDENTITY,
        kernel: kernel.status(),
        fabric: fabric.healthReport(),
        observability: observability.status(),
        governance: governance.status(),
        integration: integration.status(),
        orchestrator: orchestrator.status(),
        modules: modules.status(),
        domains: {
            supplyChain: supplyChain.status(),
            industry: industry.status(),
            trade: trade.status(),
            financial: financial.status(),
            smartCities: smartCities.status(),
        },
        generatedAt: new Date().toISOString(),
    };
}

// ─── Banner ───────────────────────────────────────────────────────────────────

function _banner() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                          ║');
    console.log('║   SHEIKHA Sovereign Cognitive Infrastructure                             ║');
    console.log('║   Unified Global Operational Intelligence Infrastructure                 ║');
    console.log('║                                                                          ║');
    console.log('║   بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ                                              ║');
    console.log('║   إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ                    ║');
    console.log('║                                                                          ║');
    console.log(`║   Phase: Phase-1-Modular-Monolith                                        ║`);
    console.log(`║   Boot:  ${new Date().toISOString()}                     ║`);
    console.log('║                                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
}

function _log(msg) {
    console.log(`[SHEIKHA-CIVILIZATION] ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    activate,
    civilizationStatus,
    CIVILIZATION_IDENTITY,
};
