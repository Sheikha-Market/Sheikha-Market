/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║    SHEIKHA Distributed Runtime Fabric — بنية التشغيل الموزع                 ║
 * ║      SHEIKHA Sovereign Cognitive Infrastructure                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * هذه الطبقة مسؤولة عن:
 *   - تسجيل وإدارة عُقد التشغيل الموزعة (Runtime Nodes)
 *   - اكتشاف العقد (Node Discovery)
 *   - مزامنة الحالة بين العقد (State Sync)
 *   - مراقبة صحة الشبكة (Mesh Health)
 *   - التوزيع الجغرافي (Regional Distribution)
 *
 * أنواع العقد:
 *   - Regional Runtime Node
 *   - Industrial Runtime Node
 *   - Trade Runtime Node
 *   - Supply Runtime Node
 *   - AI Runtime Node
 *   - Smart Cities Runtime Node
 *
 * @module distributed/sheikha-distributed-fabric
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');
const crypto = require('crypto');

// ─── Identity ────────────────────────────────────────────────────────────────

const DISTRIBUTED_IDENTITY = {
    name: 'SHEIKHA Distributed Runtime Fabric',
    layer: 'Distributed Fabric Layer',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Node Types ───────────────────────────────────────────────────────────────

const NODE_TYPES = {
    REGIONAL:     'Regional Runtime Node',
    INDUSTRIAL:   'Industrial Runtime Node',
    TRADE:        'Trade Runtime Node',
    SUPPLY:       'Supply Runtime Node',
    AI:           'AI Runtime Node',
    SMART_CITIES: 'Smart Cities Runtime Node',
    GATEWAY:      'Gateway Runtime Node',
    EDGE:         'Edge Runtime Node',
};

// ─── Node Registry ────────────────────────────────────────────────────────────

/**
 * @type {Map<string, {
 *   nodeId: string,
 *   type: string,
 *   region: string,
 *   host: string,
 *   port: number|null,
 *   status: 'active'|'offline'|'degraded'|'unknown',
 *   capabilities: string[],
 *   lastSeen: string,
 *   registeredAt: string,
 *   metadata: object
 * }>}
 */
const _nodes = new Map();

// ─── Node Registration ────────────────────────────────────────────────────────

/**
 * تسجيل عقدة تشغيل موزعة.
 * @param {object} nodeSpec
 * @returns {string} — nodeId
 */
function registerNode(nodeSpec) {
    const {
        type = NODE_TYPES.REGIONAL,
        region = 'global',
        host = 'localhost',
        port = null,
        capabilities = [],
        metadata = {},
    } = nodeSpec;

    const nodeId = nodeSpec.nodeId || `node-${type.split(' ')[0].toLowerCase()}-${crypto.randomBytes(4).toString('hex')}`;

    _nodes.set(nodeId, {
        nodeId,
        type,
        region,
        host,
        port,
        status: 'active',
        capabilities,
        lastSeen: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        metadata,
    });

    _log('info', `🌐 عقدة مسجّلة: ${nodeId} | ${type} | ${region}`);
    _bus.emit('node:registered', { nodeId, type, region });
    return nodeId;
}

/**
 * تحديث حالة عقدة.
 * @param {string} nodeId
 * @param {'active'|'offline'|'degraded'|'unknown'} status
 */
function updateNodeStatus(nodeId, status) {
    const node = _nodes.get(nodeId);
    if (!node) {
        _log('warn', `العقدة "${nodeId}" غير موجودة`);
        return false;
    }
    const prev = node.status;
    node.status = status;
    node.lastSeen = new Date().toISOString();
    _bus.emit('node:status', { nodeId, from: prev, to: status });
    if (status === 'offline' || status === 'degraded') {
        _log('warn', `العقدة ${nodeId} أصبحت: ${status}`);
        _bus.emit('node:degraded', { nodeId, status });
    }
    return true;
}

/**
 * تحديث lastSeen لعقدة (heartbeat).
 * @param {string} nodeId
 */
function heartbeat(nodeId) {
    const node = _nodes.get(nodeId);
    if (!node) return false;
    node.lastSeen = new Date().toISOString();
    if (node.status !== 'active') {
        node.status = 'active';
        _bus.emit('node:recovered', { nodeId });
    }
    _bus.emit('node:heartbeat', { nodeId, at: node.lastSeen });
    return true;
}

// ─── Node Discovery ───────────────────────────────────────────────────────────

/**
 * اكتشاف العقد حسب المعايير.
 * @param {{type?: string, region?: string, status?: string}} [filter={}]
 * @returns {object[]}
 */
function discoverNodes(filter = {}) {
    let nodes = [..._nodes.values()];
    if (filter.type)   nodes = nodes.filter(n => n.type === filter.type);
    if (filter.region) nodes = nodes.filter(n => n.region === filter.region);
    if (filter.status) nodes = nodes.filter(n => n.status === filter.status);
    return nodes;
}

/**
 * الحصول على عقدة بمعرّفها.
 * @param {string} nodeId
 * @returns {object|null}
 */
function getNode(nodeId) {
    return _nodes.get(nodeId) || null;
}

// ─── State Sync ───────────────────────────────────────────────────────────────

/**
 * مزامنة حالة عقدة مع شبكة الشبكة.
 * @param {string} sourceNodeId
 * @param {object} state
 */
function syncState(sourceNodeId, state) {
    const node = _nodes.get(sourceNodeId);
    if (!node) return;
    node.lastSeen = new Date().toISOString();
    _bus.emit('state:sync', {
        sourceNodeId,
        state,
        syncedAt: new Date().toISOString(),
    });
}

// ─── Mesh Health ──────────────────────────────────────────────────────────────

/**
 * تقرير صحة الشبكة الموزعة.
 * @returns {object}
 */
function meshHealth() {
    const all = [..._nodes.values()];
    const active    = all.filter(n => n.status === 'active').length;
    const offline   = all.filter(n => n.status === 'offline').length;
    const degraded  = all.filter(n => n.status === 'degraded').length;

    const byType = {};
    for (const type of Object.values(NODE_TYPES)) {
        byType[type] = all.filter(n => n.type === type).length;
    }

    const report = {
        fabric: DISTRIBUTED_IDENTITY.name,
        totalNodes: all.length,
        active,
        offline,
        degraded,
        availability: all.length ? (active / all.length) : 1,
        byType,
        generatedAt: new Date().toISOString(),
    };

    _bus.emit('mesh:health', report);
    return report;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        ...DISTRIBUTED_IDENTITY,
        nodes: _nodes.size,
        active: [..._nodes.values()].filter(n => n.status === 'active').length,
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function start() {
    DISTRIBUTED_IDENTITY.startedAt = new Date().toISOString();

    // تسجيل العقدة المحلية تلقائياً
    registerNode({
        nodeId: 'node-local-primary',
        type: NODE_TYPES.REGIONAL,
        region: 'local',
        host: 'localhost',
        capabilities: ['trade', 'supply-chain', 'financial', 'industrial'],
        metadata: { primary: true, environment: process.env.NODE_ENV || 'development' },
    });

    _log('info', `SHEIKHA Distributed Runtime Fabric جاهزة | ${_nodes.size} عقدة`);
    _bus.emit('distributed:ready', { identity: DISTRIBUTED_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) {
    _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-DISTRIBUTED]';
    if (level === 'warn')  console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    registerNode,
    updateNodeStatus,
    heartbeat,
    discoverNodes,
    getNode,
    syncState,
    meshHealth,
    status,
    on,
    emit,
    NODE_TYPES,
    DISTRIBUTED_IDENTITY,
};
