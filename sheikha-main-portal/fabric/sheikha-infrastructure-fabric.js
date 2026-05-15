/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA Infrastructure Fabric — بنية الفابريك المتكاملة             ║
 * ║           SHEIKHA Sovereign Cognitive Infrastructure                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * الطبقات الثلاث عشرة:
 *   1. Runtime Kernel           — النواة التشغيلية
 *   2. Identity Fabric          — هوية المنظومة
 *   3. Industrial Fabric        — النطاق الصناعي
 *   4. Trade Fabric             — نطاق التجارة والتبادل
 *   5. AI Fabric                — الذكاء الاصطناعي
 *   6. Supply Chain Fabric      — سلسلة الإمداد
 *   7. Financial Fabric         — المالية والتسويات
 *   8. Smart Cities Fabric      — المدن الذكية
 *   9. Observability Fabric     — المراقبة والقياس
 *  10. Security Fabric          — الأمان والحماية
 *  11. Global Integration Fab.  — التكاملات العالمية
 *  12. Autonomous Orchestration — التنسيق الذاتي
 *  13. Sovereign Governance     — الحوكمة السيادية
 *
 * @module fabric/sheikha-infrastructure-fabric
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');

// ─── Fabric Identity ─────────────────────────────────────────────────────────

const FABRIC_IDENTITY = {
    name: 'SHEIKHA Infrastructure Fabric',
    identity: 'SHEIKHA Sovereign Cognitive Infrastructure',
    executive: 'Unified Global Operational Intelligence Infrastructure',
    version: '1.0.0',
    layers: 13,
    initializedAt: null,
};

/**
 * حافلة الأحداث المشتركة بين طبقات الفابريك.
 */
const _fabricBus = new EventEmitter();
_fabricBus.setMaxListeners(128);

/**
 * سجل الطبقات المُحمَّلة.
 * @type {Map<string, {name: string, status: string, initializedAt: string}>}
 */
const _layers = new Map();

// ─── Layer Definitions ────────────────────────────────────────────────────────

const FABRIC_LAYERS = [
    { id: 'runtime-kernel',           name: 'Runtime Kernel Fabric',         domain: 'infrastructure' },
    { id: 'identity-fabric',          name: 'Identity Fabric',                domain: 'infrastructure' },
    { id: 'industrial-fabric',        name: 'Industrial Fabric',              domain: 'domain' },
    { id: 'trade-fabric',             name: 'Trade Fabric',                   domain: 'domain' },
    { id: 'ai-fabric',                name: 'AI Fabric',                      domain: 'domain' },
    { id: 'supply-chain-fabric',      name: 'Supply Chain Fabric',            domain: 'domain' },
    { id: 'financial-fabric',         name: 'Financial Fabric',               domain: 'domain' },
    { id: 'smart-cities-fabric',      name: 'Smart Cities Fabric',            domain: 'domain' },
    { id: 'observability-fabric',     name: 'Observability Fabric',           domain: 'infrastructure' },
    { id: 'security-fabric',          name: 'Security Fabric',                domain: 'infrastructure' },
    { id: 'global-integration-fab',   name: 'Global Integration Fabric',      domain: 'infrastructure' },
    { id: 'autonomous-orchestration', name: 'Autonomous Orchestration Fabric',domain: 'infrastructure' },
    { id: 'sovereign-governance',     name: 'Sovereign Governance Fabric',    domain: 'infrastructure' },
];

// ─── Fabric Initialization ────────────────────────────────────────────────────

/**
 * تهيئة بنية الفابريك الكاملة وتسجيل الثلاث عشرة طبقة.
 */
function initialize() {
    if (FABRIC_IDENTITY.initializedAt) {
        _log('warn', 'الفابريك مُهيَّأ بالفعل');
        return;
    }
    FABRIC_IDENTITY.initializedAt = new Date().toISOString();
    _log('info', `بدء تهيئة ${FABRIC_LAYERS.length} طبقة من طبقات الفابريك الثلاث عشرة…`);

    for (const layer of FABRIC_LAYERS) {
        _layers.set(layer.id, {
            ...layer,
            status: 'initialized',
            initializedAt: new Date().toISOString(),
        });
        _log('info', `  ✅ ${layer.name}`);
        _fabricBus.emit('layer:initialized', { id: layer.id, name: layer.name });
    }

    _log('info', `الفابريك جاهز | ${FABRIC_LAYERS.length} طبقة مُفعَّلة`);
    _fabricBus.emit('fabric:ready', { identity: FABRIC_IDENTITY });
}

// ─── Layer Access ─────────────────────────────────────────────────────────────

/**
 * الحصول على حالة طبقة معيّنة.
 * @param {string} layerId
 * @returns {object|null}
 */
function getLayer(layerId) {
    return _layers.get(layerId) || null;
}

/**
 * إرجاع قائمة الطبقات حسب النوع (infrastructure/domain).
 * @param {'infrastructure'|'domain'|'all'} [type='all']
 * @returns {object[]}
 */
function listLayers(type = 'all') {
    const all = [..._layers.values()];
    if (type === 'all') return all;
    return all.filter(l => l.domain === type);
}

// ─── Global Runtime Fabric Nodes ──────────────────────────────────────────────

/**
 * أنواع العقد التشغيلية في الشبكة العالمية.
 */
const RUNTIME_NODE_TYPES = [
    'Regional Runtime Node',
    'Industrial Runtime Node',
    'Trade Runtime Node',
    'Supply Runtime Node',
    'AI Runtime Node',
    'Smart Cities Runtime Node',
];

/**
 * سجل العقد المُسجَّلة.
 * @type {Map<string, {type: string, region: string, status: string, registeredAt: string}>}
 */
const _nodes = new Map();

/**
 * تسجيل عقدة تشغيلية في الشبكة العالمية.
 * @param {string} nodeId
 * @param {string} type
 * @param {string} [region='global']
 */
function registerNode(nodeId, type, region = 'global') {
    _nodes.set(nodeId, {
        type,
        region,
        status: 'active',
        registeredAt: new Date().toISOString(),
    });
    _log('info', `🌐 عقدة مسجّلة: ${nodeId} | نوع: ${type} | المنطقة: ${region}`);
    _fabricBus.emit('node:registered', { nodeId, type, region });
}

// ─── Observability ────────────────────────────────────────────────────────────

/**
 * الاشتراك في أحداث الفابريك.
 * @param {string} event
 * @param {Function} handler
 */
function on(event, handler) {
    _fabricBus.on(event, handler);
}

/**
 * إصدار حدث عبر الفابريك.
 * @param {string} event
 * @param {object} [payload={}]
 */
function emit(event, payload = {}) {
    _fabricBus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Health Report ────────────────────────────────────────────────────────────

/**
 * تقرير صحة الفابريك الكامل.
 * @returns {object}
 */
function healthReport() {
    const infraLayers = listLayers('infrastructure').length;
    const domainLayers = listLayers('domain').length;

    const report = {
        fabric: FABRIC_IDENTITY.name,
        identity: FABRIC_IDENTITY.identity,
        status: FABRIC_IDENTITY.initializedAt ? 'operational' : 'uninitialized',
        layers: {
            total: _layers.size,
            infrastructure: infraLayers,
            domain: domainLayers,
        },
        nodes: _nodes.size,
        checkedAt: new Date().toISOString(),
    };

    _fabricBus.emit('fabric:health', report);
    return report;
}

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-FABRIC]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    initialize,
    getLayer,
    listLayers,
    registerNode,
    healthReport,
    on,
    emit,
    FABRIC_IDENTITY,
    FABRIC_LAYERS,
    RUNTIME_NODE_TYPES,
};
