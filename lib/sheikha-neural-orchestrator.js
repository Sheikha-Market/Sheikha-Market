/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 sheikha-neural-orchestrator.js — المُنسِّق العصبي الموحد
 *  ينسق بين جميع محركات المنظومة ويوحد تدفق البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');

// ──────────────────────────────────────────────────────────────────────────────
// خلايا الشبكة العصبية
// ──────────────────────────────────────────────────────────────────────────────
const NEURAL_CELLS = {
    identity:   { name: 'خلية الهوية',         status: 'active', engines: ['sheikha-digital-identity-engine', 'sheikha-brand-engine'] },
    market:     { name: 'خلية السوق',           status: 'active', engines: ['sheikha-smart-market-engine', 'sheikha-market-structure-engine'] },
    contracts:  { name: 'خلية العقود',          status: 'active', engines: ['sheikha-contract-engine'] },
    supply:     { name: 'خلية التغذية والتوريد', status: 'active', engines: ['sheikha-supply-logistics-engine'] },
    governance: { name: 'خلية الحوكمة',         status: 'active', engines: ['sheikha-governance-engine', 'sheikha-sharia-engine'] },
    monitoring: { name: 'خلية المراقبة',        status: 'active', engines: ['sheikha-monitor-engine', 'sheikha-intelligent-monitoring-system'] },
    tools:      { name: 'خلية الأدوات',         status: 'active', engines: ['sheikha-sdk-engine', 'sheikha-mcp-engine', 'sheikha-cli-engine'] },
    git:        { name: 'خلية Git',             status: 'active', engines: ['sheikha-sovereign-git', 'sheikha-git-engine'] },
};

// ──────────────────────────────────────────────────────────────────────────────
// المُنسِّق العصبي
// ──────────────────────────────────────────────────────────────────────────────
class SheikhaNeural extends EventEmitter {
    constructor() {
        super();
        this.id       = `snc_${Date.now()}`;
        this.cells    = NEURAL_CELLS;
        this.registry = new Map();
        this.stats    = { events: 0, routed: 0, errors: 0, started_at: new Date().toISOString() };
        this._setupInternalRouting();
    }

    // تسجيل محرك
    register(name, engine) {
        this.registry.set(name, engine);
        this.emit('engine:registered', { name, at: new Date().toISOString() });
        return this;
    }

    // الحصول على محرك مسجل
    get(name) {
        return this.registry.get(name) || null;
    }

    // إرسال حدث عبر الشبكة
    dispatch(event, payload = {}) {
        this.stats.events++;
        const envelope = {
            id:    `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            event,
            payload,
            at:    new Date().toISOString()
        };

        // توجيه الحدث للخلايا المعنية
        const cellRoutes = this._getRoutesForEvent(event);
        for (const cell of cellRoutes) {
            this.emit(`cell:${cell}`, envelope);
            this.stats.routed++;
        }

        this.emit('event:dispatched', envelope);
        return envelope.id;
    }

    // حالة الشبكة
    getStatus() {
        const activeCells = Object.values(this.cells).filter(c => c.status === 'active').length;
        return {
            id:            this.id,
            cells:         Object.keys(this.cells).length,
            active_cells:  activeCells,
            engines:       this.registry.size,
            stats:         this.stats,
            uptime_ms:     Date.now() - new Date(this.stats.started_at).getTime(),
            timestamp:     new Date().toISOString()
        };
    }

    // توجيه الأحداث للخلايا المناسبة
    _getRoutesForEvent(event) {
        const routeMap = {
            'order.created':    ['market', 'governance'],
            'contract.created': ['contracts', 'governance'],
            'supply.dispatched':['supply', 'monitoring'],
            'user.registered':  ['identity', 'governance'],
            'price.updated':    ['market', 'monitoring'],
            'alert.triggered':  ['monitoring'],
            'git.synced':       ['git', 'monitoring'],
        };
        return routeMap[event] || ['monitoring'];
    }

    // إعداد التوجيه الداخلي
    _setupInternalRouting() {
        // تسجيل أحداث المراقبة
        this.on('event:dispatched', e => {
            if (process.env.NODE_ENV !== 'production' || e.event?.startsWith('error')) {
                // يمكن إضافة تسجيل هنا
            }
        });
    }

    // تشغيل الفحص الصحي
    healthCheck() {
        const results = {};
        for (const [key, cell] of Object.entries(this.cells)) {
            results[key] = {
                name:   cell.name,
                status: cell.status,
                engines_registered: cell.engines.filter(e => this.registry.has(e)).length,
                engines_total:      cell.engines.length
            };
        }
        return { healthy: true, cells: results, stats: this.stats };
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Singleton
// ──────────────────────────────────────────────────────────────────────────────
let _instance = null;

function getInstance() {
    if (!_instance) _instance = new SheikhaNeural();
    return _instance;
}

// ──────────────────────────────────────────────────────────────────────────────
// التصدير
// ──────────────────────────────────────────────────────────────────────────────
module.exports = {
    SheikhaNeural,
    getInstance,
    NEURAL_CELLS,
    create: () => new SheikhaNeural()
};

console.log('✅ [NEURAL-ORCHESTRATOR] المُنسِّق العصبي الموحد — جاهز');
