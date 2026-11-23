/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔮 مسارات MCP — Model Context Protocol Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

const MCP_NODES = [
    { id: 'market',     name: 'Market Node',     icon: '🏪', status: 'active',   latency_ms: 32 },
    { id: 'contract',   name: 'Contract Node',   icon: '📋', status: 'active',   latency_ms: 41 },
    { id: 'supply',     name: 'Supply Node',     icon: '🔗', status: 'active',   latency_ms: 38 },
    { id: 'governance', name: 'Governance Node', icon: '⚖️', status: 'active',   latency_ms: 28 },
    { id: 'auth',       name: 'Auth Node',       icon: '🔐', status: 'active',   latency_ms: 22 },
    { id: 'analytics',  name: 'Analytics Node',  icon: '📊', status: 'active',   latency_ms: 55 },
    { id: 'git',        name: 'Git Node',        icon: '🌐', status: 'active',   latency_ms: 120 },
    { id: 'billing',    name: 'Billing Node',    icon: '💳', status: 'updating', latency_ms: null }
];

const MCP_TOOLS = [
    { id: 'market_search',    name: 'market_search',    node: 'market',     status: 'active', permissions: ['market:read'] },
    { id: 'get_live_prices',  name: 'get_live_prices',  node: 'market',     status: 'active', permissions: ['market:read'] },
    { id: 'create_contract',  name: 'create_contract',  node: 'contract',   status: 'active', permissions: ['contracts:write'] },
    { id: 'governance_check', name: 'governance_check', node: 'governance', status: 'active', permissions: ['governance:validate'] },
    { id: 'supply_sync',      name: 'supply_sync',      node: 'supply',     status: 'active', permissions: ['supply:sync'] },
    { id: 'analytics_report', name: 'analytics_report', node: 'analytics',  status: 'beta',   permissions: ['analytics:read'] }
];

// ─── GET /api/mcp — نظرة عامة ────────────────────────────────────────────────
router.get('/', (req, res) => {
    const activeNodes = MCP_NODES.filter(n => n.status === 'active').length;
    const activeTools = MCP_TOOLS.filter(t => t.status === 'active').length;

    res.json({
        success: true,
        status: 'UNKNOWN',
        evidence: 'STATIC_CATALOG_ONLY',
        nodes:  { total: MCP_NODES.length, active: activeNodes },
        tools:  { total: MCP_TOOLS.length, active: activeTools },
        uptime: null,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/mcp/health — الحالة الصحية ─────────────────────────────────────
router.get('/health', (req, res) => {
    const health = MCP_NODES.map(n => ({
        id:     n.id,
        name:   n.name,
        status: n.status,
        latency_ms: n.latency_ms,
        healthy: n.status === 'active'
    }));

    res.json({
        success: true,
        overall: 'UNKNOWN',
        simulated: true,
        nodes: health,
        active_sessions: null,
        requests_per_sec: null,
        error_rate: null,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/mcp/nodes — قائمة العقد ────────────────────────────────────────
router.get('/nodes', (req, res) => {
    res.json({
        success: true,
        count: MCP_NODES.length,
        nodes: MCP_NODES,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/mcp/tools — سجل الأدوات ────────────────────────────────────────
router.get('/tools', (req, res) => {
    const { node, status } = req.query;
    let tools = MCP_TOOLS;
    if (node)   tools = tools.filter(t => t.node   === node);
    if (status) tools = tools.filter(t => t.status === status);

    res.json({
        success: true,
        count: tools.length,
        tools,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/mcp/nodes/:id — عقدة محددة ─────────────────────────────────────
router.get('/nodes/:id', (req, res) => {
    const node = MCP_NODES.find(n => n.id === req.params.id);
    if (!node) return res.status(404).json({ success: false, message: 'العقدة غير موجودة' });

    const tools = MCP_TOOLS.filter(t => t.node === node.id);
    res.json({ success: true, node, tools, timestamp: new Date().toISOString() });
});

// ─── POST /api/mcp/execute — تنفيذ أداة ──────────────────────────────────────
router.post('/execute', (_req, res) => {
    res.status(501).json({ success: false, executed: false,
        error: 'LEGACY_EXECUTION_DISABLED', message: 'Use the governed MCP server.' });
});

// ─── GET /api/mcp/stream — تدفق الأحداث (SSE) ────────────────────────────────
router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const events = [
        { lvl: 'ok',   msg: 'MCP Server — all nodes operational' },
        { lvl: 'info', msg: 'Market Node: price stream active' },
        { lvl: 'ok',   msg: 'Governance check passed for latest request' },
        { lvl: 'info', msg: 'Analytics Node: daily report queued' },
    ];

    let idx = 0;
    const iv = setInterval(() => {
        const e = events[idx % events.length]; idx++;
        res.write(`data: ${JSON.stringify({ ...e, ts: new Date().toISOString() })}\n\n`);
    }, 2000);

    req.on('close', () => clearInterval(iv));
});

module.exports = router;
