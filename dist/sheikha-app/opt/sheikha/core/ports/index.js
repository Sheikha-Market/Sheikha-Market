/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA PORT ENGINE — محرك المنافذ الموحّد                                  ║
 * ║  الشبكة العصبية + السجل + موجّه الأسواق + API كاملة                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ" — آل عمران:١٥٩
 *
 * الاستخدام الأساسي:
 *
 *   const { portEngine } = require('./core/ports');
 *
 *   // أطلق الشبكة (تكتشف المنافذ الحرة تلقائياً)
 *   const status = await portEngine.ignite();
 *   const mainPort       = portEngine.getPort('MAIN');        // 8080 أو أي منفذ حر
 *   const marketPort     = portEngine.getPort('MARKETPLACE'); // 8081 أو أي منفذ حر
 *
 *   // استمع للأحداث
 *   portEngine.on('cell:relocated', (info) => console.log(info.msg));
 */

'use strict';

const { NeuralPortNetwork, network, DEFAULT_CELLS_CONFIG } = require('./neural-network');
const { NeuralPortCell }                                   = require('./neural-cell');
const { PORTS, SECURITY_RULES, MARKETPLACE_ROUTING_MAP,
        getPortInfo, getAllPorts }                          = require('./registry');
const { MARKETPLACE_SECTORS, resolveMarketSector,
        getSectorById, searchSectors }                     = require('./marketplace-router');

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const SCHEMA  = 'sheikha/v2';
const TAWHEED = 'لا إله إلا الله';
const NO_HARM = 'لا ضرر ولا ضرار';

// ═══════════════════════════════════════════════════════════════
// محرك المنافذ — SheikhaPortEngine
// ═══════════════════════════════════════════════════════════════
class SheikhaPortEngine {

    constructor() {
        this.schema    = SCHEMA;
        this.tawheed   = TAWHEED;
        this.no_harm   = NO_HARM;
        this.nameAr    = 'محرك المنافذ الموحّد — شيخة';
        this.nameEn    = 'Sheikha Unified Port Engine';
        this.version   = '1.0.0';
        this._network  = network;
        this._ignited  = false;
    }

    // ═══════════════════════════════════════════════════════════
    // ① إطلاق الشبكة العصبية
    // ═══════════════════════════════════════════════════════════

    async ignite() {
        if (this._ignited) return this._network.getNetworkStatus();
        const status = await this._network.ignite();
        this._ignited = true;
        return status;
    }

    // ═══════════════════════════════════════════════════════════
    // ② اكتشاف المنافذ الفعلية
    // ═══════════════════════════════════════════════════════════

    /** المنفذ الفعلي للخادم الرئيسي (قد يختلف عن 8080 لو كان مشغولاً) */
    getPort(cellId) {
        return this._network.getPort(cellId);
    }

    /** منفذ الخادم الرئيسي */
    get mainPort() {
        return this._network.getPort('MAIN');
    }

    /** منفذ سوق الأسواق */
    get marketplacePort() {
        return this._network.getPort('MARKETPLACE');
    }

    // ═══════════════════════════════════════════════════════════
    // ③ واجهة الموجّه العصبي
    // ═══════════════════════════════════════════════════════════

    handle(request) {
        const { intent, data = {} } = request;

        if (intent === 'port.status')           return Promise.resolve(this._rawStatus());
        if (intent === 'port.network')          return Promise.resolve(this._network.getNetworkStatus());
        if (intent === 'port.list')             return Promise.resolve(getAllPorts());
        if (intent === 'port.info')             return Promise.resolve(getPortInfo(data.port));
        if (intent === 'port.marketplace.list') return Promise.resolve(MARKETPLACE_SECTORS);
        if (intent === 'port.marketplace.sector') return Promise.resolve(getSectorById(data.id));
        if (intent === 'port.marketplace.search') return Promise.resolve(searchSectors(data.keyword));
        if (intent === 'port.routing')          return Promise.resolve(MARKETPLACE_ROUTING_MAP);
        if (intent === 'port.security')         return Promise.resolve(SECURITY_RULES);

        return Promise.resolve(this._rawStatus());
    }

    // ═══════════════════════════════════════════════════════════
    // ④ لوحة القيادة
    // ═══════════════════════════════════════════════════════════

    _rawStatus() {
        const net = this._network.getNetworkStatus();
        return {
            nameAr:           this.nameAr,
            network_status:   net.status,
            ignited:          this._ignited,
            port_map:         net.port_map,
            cells_count:      Object.keys(net.cells || {}).length,
            marketplace_sectors: MARKETPLACE_SECTORS.length,
            security_rules:   Object.keys(SECURITY_RULES).length - 1, // بدون GLOBAL
            tawheed:          this.tawheed,
            no_harm:          this.no_harm,
            verse:            { ref: 'الأنفال:٦٠', text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ' },
        };
    }

    // ═══════════════════════════════════════════════════════════
    // ⑤ تمرير الأحداث من الشبكة
    // ═══════════════════════════════════════════════════════════

    on(event, handler) { this._network.on(event, handler); return this; }
    off(event, handler) { this._network.off(event, handler); return this; }

    // ═══════════════════════════════════════════════════════════
    // ⑥ إيقاف الشبكة
    // ═══════════════════════════════════════════════════════════

    shutdown(reason) { this._network.shutdown(reason); this._ignited = false; }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const portEngine = new SheikhaPortEngine();

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
    portEngine,
    SheikhaPortEngine,
    NeuralPortNetwork,
    NeuralPortCell,
    // re-exports
    PORTS,
    SECURITY_RULES,
    MARKETPLACE_SECTORS,
    MARKETPLACE_ROUTING_MAP,
    getPortInfo,
    getAllPorts,
    getSectorById,
    searchSectors,
};
