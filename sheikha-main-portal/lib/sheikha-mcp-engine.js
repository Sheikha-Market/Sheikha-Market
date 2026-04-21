/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔮 sheikha-mcp-engine.js — محرك مركز ربط الأدوات
 *  Model Context Protocol — Sheikha Implementation
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

const NODES = [
    { id: 'market',     name: 'Market Node',     status: 'active' },
    { id: 'contract',   name: 'Contract Node',   status: 'active' },
    { id: 'supply',     name: 'Supply Node',     status: 'active' },
    { id: 'governance', name: 'Governance Node', status: 'active' },
    { id: 'auth',       name: 'Auth Node',       status: 'active' },
    { id: 'analytics',  name: 'Analytics Node',  status: 'active' },
    { id: 'git',        name: 'Git Node',        status: 'active' },
    { id: 'billing',    name: 'Billing Node',    status: 'updating' }
];

const TOOLS = [
    { id: 'market_search',    node: 'market',     permissions: ['market:read'],       status: 'active' },
    { id: 'get_live_prices',  node: 'market',     permissions: ['market:read'],       status: 'active' },
    { id: 'create_contract',  node: 'contract',   permissions: ['contracts:write'],   status: 'active' },
    { id: 'governance_check', node: 'governance', permissions: ['governance:validate'],status: 'active' },
    { id: 'supply_sync',      node: 'supply',     permissions: ['supply:sync'],       status: 'active' },
    { id: 'analytics_report', node: 'analytics',  permissions: ['analytics:read'],    status: 'beta'   }
];

class SheikhaMCP extends EventEmitter {
    constructor() {
        super();
        this.nodes = NODES;
        this.tools = TOOLS;
        this.deny_by_default = true;
    }

    getHealth() {
        return {
            status: 'healthy',
            nodes:  this.nodes.map(n => ({ ...n, healthy: n.status === 'active' })),
            uptime: 99.7
        };
    }

    listTools(filters = {}) {
        let t = this.tools;
        if (filters.node)   t = t.filter(x => x.node   === filters.node);
        if (filters.status) t = t.filter(x => x.status === filters.status);
        return t;
    }

    executeTool(toolId, params = {}, permissions = []) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool)                    return { success: false, error: 'tool_not_found' };
        if (tool.status === 'disabled') return { success: false, error: 'tool_disabled' };

        // تحقق الصلاحيات
        const allowed = !this.deny_by_default ||
            tool.permissions.some(p => permissions.includes(p));
        if (!allowed) return { success: false, error: 'permission_denied', required: tool.permissions };

        this.emit('tool:executed', { tool: toolId, params, at: new Date().toISOString() });
        return {
            success:    true,
            tool:       toolId,
            latency_ms: Math.floor(Math.random() * 60 + 20),
            result:     { status: 'ok', data: `[result:${toolId}]` },
            at:         new Date().toISOString()
        };
    }
}

let _instance = null;
function getInstance() {
    if (!_instance) _instance = new SheikhaMCP();
    return _instance;
}

module.exports = { SheikhaMCP, getInstance, NODES, TOOLS };
console.log('✅ [MCP-ENGINE] محرك مركز ربط الأدوات — جاهز | Deny-by-Default: true');
