/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA COMMS ENGINE — محرك الاتصالات الموحّد                              ║
 * ║                                                                              ║
 * ║  يجمع في يد واحدة:                                                          ║
 * ║  • TrafficMonitor   — حركة المعلومات الوارد والصادر                         ║
 * ║  • AccessController — من يُسمع له                                           ║
 * ║  • SecureChannel    — قناة الاتصال الآمن                                    ║
 * ║  • NetworkMap       — خريطة الشبكة المحلية/الدولية/العالمية                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   const { commsEngine } = require('./core/comms');
 *
 *   // تركيب كل middleware في Express
 *   app.use(commsEngine.pipeline());
 *
 *   // لوحة الاتصالات
 *   app.get('/api/comms', (req, res) => res.json(commsEngine.getDashboard()));
 */

'use strict';

const { TrafficMonitor, SOURCE_ZONES, TRAFFIC_TYPES } = require('./traffic');
const { AccessController, ACCESS_LEVELS,
        DEFAULT_PATH_RULES, PERMANENT_BLOCKLIST }      = require('./access-control');
const { SecureChannel, TLS_CONFIG }                    = require('./secure-channel');
const { getNetworkMap, NETWORK_LEVELS,
        COMMUNICATION_MATRIX,
        getAllowedConnections, getBlockedConnections }  = require('./network-map');

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const TAWHEED = 'لا إله إلا الله';
const NO_HARM = 'لا ضرر ولا ضرار';

// ═══════════════════════════════════════════════════════════════
// محرك الاتصالات الموحّد — SheikhaCommsEngine
// ═══════════════════════════════════════════════════════════════
class SheikhaCommsEngine {

    constructor(secret) {
        this.nameAr  = 'محرك الاتصالات الموحّد — شيخة';
        this.nameEn  = 'Sheikha Unified Communications Engine';
        this.tawheed = TAWHEED;
        this.no_harm = NO_HARM;
        this.version = '1.0.0';

        this.traffic = new TrafficMonitor();
        this.access  = new AccessController(DEFAULT_PATH_RULES);
        this.channel = new SecureChannel(secret);

        // ربط الأحداث: إذا كشفت المراقبة اندفاعاً → يُحجب IP تلقائياً
        this.traffic.on('anomaly', (a) => {
            if (a.kind === 'BURST') {
                this.access.blockIP(a.ip, 300000);  // 5 دقائق
                console.warn(`🛡️ [COMMS] IP ${a.ip} محجوب 5 دقائق بسبب: ${a.detail}`);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // Pipeline كامل للتركيب على Express
    // يُطبَّق بالترتيب الصحيح:
    // ① هوية DID ② توقيع HMAC ③ ACL ④ مراقبة حركة ⑤ تدقيق
    // ═══════════════════════════════════════════════════════════
    pipeline() {
        return [
            ...this.channel.pipeline(),          // DID + HMAC + Audit
            this.access.middleware(),            // ACL
            this.traffic.middleware(),           // Traffic Monitor
        ];
    }

    // ═══════════════════════════════════════════════════════════
    // واجهة الطلبات
    // ═══════════════════════════════════════════════════════════
    handle(request) {
        const { intent, data = {} } = request;

        if (intent === 'comms.dashboard')     return Promise.resolve(this.getDashboard());
        if (intent === 'comms.traffic')       return Promise.resolve(this.traffic.getDashboard());
        if (intent === 'comms.network')       return Promise.resolve(getNetworkMap());
        if (intent === 'comms.access.rules')  return Promise.resolve(DEFAULT_PATH_RULES.map(
            (r) => ({ pattern: r.pattern.toString(), level: r.level, desc: r.desc, methods: r.methods })
        ));
        if (intent === 'comms.access.blocked')return Promise.resolve(this.access.getBlockedIPs());
        if (intent === 'comms.channel')       return Promise.resolve(this.channel.getDashboard());
        if (intent === 'comms.log')           return Promise.resolve(this.traffic.getRecentLog(data.limit || 50));
        if (intent === 'comms.audit')         return Promise.resolve(this.channel.audit.getRecent(data.limit || 50));
        if (intent === 'comms.block_ip')      {
            if (data.ip) this.access.blockIP(data.ip, data.durationMs);
            return Promise.resolve({ blocked: data.ip });
        }

        return Promise.resolve(this.getDashboard());
    }

    // ═══════════════════════════════════════════════════════════
    // لوحة القيادة الكاملة
    // ═══════════════════════════════════════════════════════════
    getDashboard() {
        const traffic = this.traffic.getDashboard();
        const channel = this.channel.getDashboard();
        const network = getNetworkMap();

        return {
            nameAr:      this.nameAr,
            tawheed:     this.tawheed,
            no_harm:     this.no_harm,
            version:     this.version,
            traffic: {
                inbound:  traffic.stats.inbound,
                outbound: traffic.stats.outbound,
                blocked:  traffic.stats.blocked,
                zones:    traffic.zones,
                anomalies: traffic.recent_anomalies,
            },
            access: {
                rules_count:   DEFAULT_PATH_RULES.length,
                blocked_ips:   this.access.getBlockedIPs().length,
                levels:        Object.keys(ACCESS_LEVELS),
            },
            channel: {
                layers:        channel.layers,
                audit_entries: channel.audit_entries,
                tls_notes:     channel.tls_notes,
            },
            network: {
                levels_count:  Object.keys(NETWORK_LEVELS).length,
                connections:   network.summary,
                levels:        network.levels.map((l) => ({
                    nameAr: l.nameAr,
                    level:  l.level,
                    trust:  l.trust_level,
                    icon:   l.icon,
                })),
            },
            verse: { ref: 'الحجرات:١٣', text: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
        };
    }

    // ═══════════════════════════════════════════════════════════
    // إيقاف
    // ═══════════════════════════════════════════════════════════
    destroy() {
        this.traffic.destroy();
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const commsEngine = new SheikhaCommsEngine(process.env.HMAC_SECRET);

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = {
    commsEngine,
    SheikhaCommsEngine,
    // re-exports
    TrafficMonitor,
    AccessController,
    SecureChannel,
    getNetworkMap,
    NETWORK_LEVELS,
    COMMUNICATION_MATRIX,
    SOURCE_ZONES,
    TRAFFIC_TYPES,
    ACCESS_LEVELS,
    TLS_CONFIG,
    getAllowedConnections,
    getBlockedConnections,
};
