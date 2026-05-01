/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA TRAFFIC MONITOR — مراقب حركة المعلومات الوارد والصادر              ║
 * ║                                                                              ║
 * ║  • يعرف كل بايت وارد ومن أين جاء ولمن ذهب                                  ║
 * ║  • يفرّق بين المحلي / الإقليمي / الدولي / العالمي                           ║
 * ║  • يسجّل الأنماط الشاذة ويُنبّه الشبكة العصبية                              ║
 * ║  • لا ضرر ولا ضرار — "لا يحل للمسلم أن يروّع أخاه" — أبوداود               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَلَا تَعْثَوْا فِي الْأَرْضِ مُفْسِدِينَ" — البقرة:٦٠
 */

'use strict';

const { EventEmitter } = require('events');

// ═══════════════════════════════════════════════════════════════
// ① تصنيف مصدر الاتصال
// ═══════════════════════════════════════════════════════════════
const SOURCE_ZONES = {
    LOCAL:        { label: 'محلي',      labelEn: 'Local',        cidrs: ['127.0.0.0/8', '::1/128', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'] },
    REGIONAL:     { label: 'إقليمي',    labelEn: 'Regional',     cidrs: [] },     // تُعبأ من GeoIP
    NATIONAL:     { label: 'وطني',      labelEn: 'National',     cidrs: [] },     // تُعبأ من GeoIP
    INTERNATIONAL:{ label: 'دولي',      labelEn: 'International',cidrs: [] },
    GLOBAL:       { label: 'عالمي',     labelEn: 'Global',       cidrs: [] },
    UNKNOWN:      { label: 'مجهول',     labelEn: 'Unknown',      cidrs: [] },
};

// ─── فئات المحتوى المنقول ─────────────────────────────────────────────────────
const TRAFFIC_TYPES = {
    API_READ:     { nameAr: 'قراءة API',         direction: 'INBOUND',  risk: 'LOW' },
    API_WRITE:    { nameAr: 'كتابة API',          direction: 'INBOUND',  risk: 'MEDIUM' },
    AUTH:         { nameAr: 'مصادقة',            direction: 'INBOUND',  risk: 'HIGH' },
    MARKETPLACE:  { nameAr: 'معاملة تجارية',     direction: 'INBOUND',  risk: 'HIGH' },
    STATIC:       { nameAr: 'ملفات ثابتة',        direction: 'OUTBOUND', risk: 'LOW' },
    WS:           { nameAr: 'WebSocket',          direction: 'DUPLEX',   risk: 'MEDIUM' },
    PROBE:        { nameAr: 'فحص/مسح',           direction: 'INBOUND',  risk: 'CRITICAL' },
    UNKNOWN:      { nameAr: 'غير محدد',          direction: 'INBOUND',  risk: 'MEDIUM' },
};

// ═══════════════════════════════════════════════════════════════
// ② مراقب الحركة — TrafficMonitor
// ═══════════════════════════════════════════════════════════════
class TrafficMonitor extends EventEmitter {

    constructor({ windowMs = 60000, maxLogSize = 5000 } = {}) {
        super();
        this.windowMs   = windowMs;
        this.maxLogSize = maxLogSize;

        // إحصائيات الجلسة
        this._stats = {
            inbound:    { count: 0, bytes: 0 },
            outbound:   { count: 0, bytes: 0 },
            blocked:    { count: 0, reasons: {} },
            byZone:     {},
            byType:     {},
            byPort:     {},
            anomalies:  [],
        };

        // نافذة زمنية لكشف الاندفاعات
        this._window = new Map();   // ip → [timestamps]
        this._log    = [];

        // تنظيف دوري
        this._cleanTimer = setInterval(() => this._clean(), windowMs);
        if (this._cleanTimer.unref) this._cleanTimer.unref();
    }

    // ─── تسجيل طلب وارد ────────────────────────────────────────────────────────

    recordInbound({ ip, port, method, path, bytes = 0, type = 'UNKNOWN' }) {
        const zone  = this._classifyZone(ip);
        const entry = {
            dir:    'INBOUND',
            ip,
            zone,
            port,
            method,
            path,
            bytes,
            type,
            ts:     Date.now(),
        };

        this._stats.inbound.count++;
        this._stats.inbound.bytes += bytes;
        this._bumpZone(zone, 'inbound');
        this._bumpType(type);
        this._bumpPort(port, 'inbound');

        const burst = this._checkBurst(ip);
        if (burst.exceeded) {
            entry.anomaly = true;
            this._recordAnomaly('BURST', ip, `${burst.count} طلب في ${this.windowMs / 1000}ث`);
        }

        this._addLog(entry);
        this.emit('inbound', entry);
        return entry;
    }

    // ─── تسجيل رد صادر ─────────────────────────────────────────────────────────

    recordOutbound({ ip, port, status, bytes = 0 }) {
        const zone  = this._classifyZone(ip);
        const entry = {
            dir:    'OUTBOUND',
            ip,
            zone,
            port,
            status,
            bytes,
            ts:     Date.now(),
        };

        this._stats.outbound.count++;
        this._stats.outbound.bytes += bytes;
        this._bumpZone(zone, 'outbound');
        this._bumpPort(port, 'outbound');

        this._addLog(entry);
        this.emit('outbound', entry);
        return entry;
    }

    // ─── تسجيل حجب ──────────────────────────────────────────────────────────────

    recordBlocked({ ip, port, reason }) {
        this._stats.blocked.count++;
        this._stats.blocked.reasons[reason] = (this._stats.blocked.reasons[reason] || 0) + 1;
        this._recordAnomaly('BLOCKED', ip, reason);
        this.emit('blocked', { ip, port, reason, ts: Date.now() });
    }

    // ─── middleware Express ──────────────────────────────────────────────────────

    /**
     * استخدامه:
     *   const { monitor } = require('./core/comms');
     *   app.use(monitor.middleware());
     */
    middleware() {
        return (req, res, next) => {
            const ip   = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const port = req.socket.localPort || 8080;
            const type = this._classifyType(req);

            this.recordInbound({
                ip, port,
                method: req.method,
                path:   req.path,
                bytes:  parseInt(req.headers['content-length'] || '0', 10),
                type,
            });

            const origEnd = res.end.bind(res);
            res.end = (...args) => {
                const bytes = typeof args[0] === 'string'
                    ? Buffer.byteLength(args[0])
                    : (Buffer.isBuffer(args[0]) ? args[0].length : 0);
                this.recordOutbound({ ip, port, status: res.statusCode, bytes });
                return origEnd(...args);
            };

            next();
        };
    }

    // ─── لوحة الإحصائيات ─────────────────────────────────────────────────────

    getDashboard() {
        const now   = Date.now();
        const upMin = process.uptime ? Math.round(process.uptime() / 60) : 0;
        return {
            schema:      'sheikha/v2',
            tawheed:     'لا إله إلا الله',
            no_harm:     'لا ضرر ولا ضرار',
            uptime_min:  upMin,
            stats:       this._stats,
            zones:       Object.keys(SOURCE_ZONES).map((k) => ({
                id:      k,
                nameAr:  SOURCE_ZONES[k].label,
                nameEn:  SOURCE_ZONES[k].labelEn,
                inbound: (this._stats.byZone[k] || {}).inbound  || 0,
                outbound:(this._stats.byZone[k] || {}).outbound || 0,
            })),
            recent_anomalies: this._stats.anomalies.slice(-10),
            verse: { ref: 'البقرة:٦٠', text: 'وَلَا تَعْثَوْا فِي الْأَرْضِ مُفْسِدِينَ' },
        };
    }

    getRecentLog(limit = 50) {
        return this._log.slice(-limit);
    }

    // ─── مساعدات خاصة ─────────────────────────────────────────────────────────

    _classifyZone(ip) {
        if (!ip || ip === 'unknown') return 'UNKNOWN';
        if (ip.startsWith('127.') || ip === '::1' || ip.startsWith('10.') ||
            ip.startsWith('192.168.') || ip.match(/^172\.(1[6-9]|2\d|3[01])\./))
            return 'LOCAL';
        return 'GLOBAL';   // GeoIP يُضاف لاحقاً
    }

    _classifyType(req) {
        const p = req.path || '';
        if (req.method === 'GET' && (p.startsWith('/api/') || p.startsWith('/marketplace'))) return 'API_READ';
        if (['POST','PUT','PATCH','DELETE'].includes(req.method) && p.startsWith('/api/'))     return 'API_WRITE';
        if (p.startsWith('/api/auth') || p.startsWith('/login'))                               return 'AUTH';
        if (p.startsWith('/marketplace/checkout') || p.startsWith('/api/payment'))             return 'MARKETPLACE';
        if (req.headers.upgrade === 'websocket')                                               return 'WS';
        if (req.method === 'GET' && !p.startsWith('/api'))                                     return 'STATIC';
        return 'UNKNOWN';
    }

    _checkBurst(ip, limit = 200) {
        const now  = Date.now();
        const list = (this._window.get(ip) || []).filter((t) => now - t < this.windowMs);
        list.push(now);
        this._window.set(ip, list);
        return { count: list.length, exceeded: list.length > limit };
    }

    _bumpZone(zone, dir) {
        if (!this._stats.byZone[zone]) this._stats.byZone[zone] = { inbound: 0, outbound: 0 };
        this._stats.byZone[zone][dir]++;
    }

    _bumpType(type) {
        this._stats.byType[type] = (this._stats.byType[type] || 0) + 1;
    }

    _bumpPort(port, dir) {
        if (!this._stats.byPort[port]) this._stats.byPort[port] = { inbound: 0, outbound: 0 };
        this._stats.byPort[port][dir]++;
    }

    _recordAnomaly(kind, ip, detail) {
        const entry = { kind, ip, detail, ts: new Date().toISOString() };
        this._stats.anomalies.push(entry);
        if (this._stats.anomalies.length > 200) this._stats.anomalies.shift();
        this.emit('anomaly', entry);
    }

    _addLog(entry) {
        this._log.push(entry);
        if (this._log.length > this.maxLogSize) this._log.shift();
    }

    _clean() {
        const cutoff = Date.now() - this.windowMs;
        for (const [ip, list] of this._window) {
            const filtered = list.filter((t) => t > cutoff);
            if (filtered.length === 0) this._window.delete(ip);
            else this._window.set(ip, filtered);
        }
    }

    destroy() {
        clearInterval(this._cleanTimer);
    }
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = { TrafficMonitor, SOURCE_ZONES, TRAFFIC_TYPES };
