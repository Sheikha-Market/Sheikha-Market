/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🚌 SHEIKHA TRANSPORT BUS — الناقل الشامل لنقل المعلومات                    ║
 * ║  يربط كل خلايا الشبكة العصبية (55 خلية) وكل أنظمة المنظومة                ║
 * ║                                                                              ║
 * ║  الأنظمة المربوطة:                                                           ║
 * ║  🧠 Neural Cells (1-55)  — خلايا الشبكة العصبية                             ║
 * ║  🔧 IDE Server           — بيئة التطوير المتكاملة                           ║
 * ║  📦 SDK Server           — مجموعة أدوات التطوير                             ║
 * ║  🤖 MCP Server           — بروتوكول سياق النموذج                            ║
 * ║  🏢 ERP System           — تخطيط موارد المؤسسة                              ║
 * ║  🌐 All Engines          — كل المحركات (15 محرك)                            ║
 * ║  📡 Telecom Networks     — شبكات الاتصالات                                  ║
 * ║  🛒 Commerce Layer       — طبقة التجارة                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿ وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا ﴾ — الأنعام: 59
 *   كل حدث في النظام يُسجَّل ويُنقَل بعلم الله
 *
 * ﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ ﴾ — المائدة: 1
 *   كل رسالة بين الأنظمة عهد يجب الوفاء بتوصيلها
 *
 * ﴿ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ﴾ — الملك: 3
 *   تزامن كامل بلا تعارض — كما لا تفاوت في خلق الرحمن
 *
 * واجهة الوحدة:
 *   init()                          — تهيئة الناقل الشامل
 *   emit(event, payload, source)    — إطلاق حدث عبر الناقل
 *   on(event, handler)              — الاشتراك في حدث
 *   off(event, handler)             — إلغاء الاشتراك
 *   send(channel, message)          — إرسال رسالة للقائمة
 *   receive(channel)                — استقبال رسالة من القائمة
 *   stream(channel)                 — قناة بث مباشرة
 *   broadcast(payload)              — بث شامل لكل المشتركين
 *   bridge(systemA, systemB, pipe)  — جسر بين نظامين
 *   status()                        — حالة الناقل الكامل
 *   createRouter()                  — Express Router
 */

'use strict';

const { EventEmitter } = require('events');
const path = require('path');

let express;
try { express = require('express'); } catch (_) { express = null; }

// ═══════════════════════════════════════════════════════════════════════════════
// الأنواع والثوابت
// ═══════════════════════════════════════════════════════════════════════════════

/** قنوات الناقل المحددة بالقرآن والسنة */
const CHANNELS = {
    // Layer 10 — الناقل الشامل
    NEURAL_EVENTS:   'neural.events',        // خلية 51 — الأحداث العصبية (الأنعام:59)
    TASK_QUEUE:      'transport.queue',      // خلية 52 — قائمة المهام (البقرة:283)
    LIVE_STREAM:     'transport.stream',     // خلية 53 — البث المباشر (النمل:16)
    PROTOCOL_BRIDGE: 'transport.protocols',  // خلية 54 — جسر البروتوكولات (المائدة:1)
    SYNC_CHANNEL:    'transport.sync',       // خلية 55 — قناة التزامن (الملك:3)

    // أنظمة الأدوات — Layer 9
    IDE_CHANNEL:     'ide.events',           // خلية 46 — IDE
    SDK_CHANNEL:     'sdk.events',           // خلية 47 — SDK
    MCP_CHANNEL:     'mcp.events',           // خلية 48 — MCP
    ERP_CHANNEL:     'erp.events',           // خلية 49 — ERP
    DEVOPS_CHANNEL:  'devops.events',        // خلية 50 — DevOps

    // القنوات العملياتية
    DEBUG_CHANNEL:   'debug.alerts',         // التصحيح (خلايا 13-16)
    TRADE_CHANNEL:   'trade.orders',         // التجارة (خلايا 17-20)
    AI_CHANNEL:      'ai.inference',         // الذكاء الاصطناعي (خلايا 21-24)
    NETWORK_CHANNEL: 'network.events',       // الشبكة (خلايا 25-28)
    SECURITY_CHANNEL:'security.alerts',      // الأمن (خلية 2, 28, 43)
    HEALTH_CHANNEL:  'health.monitor',       // الصحة (خلايا 41-43)
    QUALITY_CHANNEL: 'quality.checks',       // الجودة (خلية 10)
    SYSTEM_BROADCAST:'system.broadcast',     // البث الشامل
};

/** الأحداث القياسية للمنظومة */
const EVENTS = {
    CELL_ACTIVATED:    'cell.activated',
    CELL_ERROR:        'cell.error',
    DEBUG_TRIGGERED:   'debug.triggered',
    TRADE_COMPLETED:   'trade.completed',
    TRADE_FAILED:      'trade.failed',
    AI_INFERENCE_DONE: 'ai.inference.done',
    SYSTEM_HEALTH:     'system.health',
    ERP_SYNC:          'erp.sync',
    MCP_TOOL_CALLED:   'mcp.tool.called',
    IDE_ANALYSIS_DONE: 'ide.analysis.done',
    SECURITY_ALERT:    'security.alert',
    NEURAL_PULSE:      'neural.pulse',
    TRANSPORT_READY:   'transport.ready',
};

const MAX_QUEUE_SIZE   = 10000;
const MAX_LOG_SIZE     = 5000;
const MAX_LISTENERS    = 100;

// ═══════════════════════════════════════════════════════════════════════════════
// حالة الناقل
// ═══════════════════════════════════════════════════════════════════════════════

const _bus        = new EventEmitter();
_bus.setMaxListeners(MAX_LISTENERS);

let _ready        = false;
let _initAt       = null;
let _emitCount    = 0;
let _sendCount    = 0;
let _bridgeCount  = 0;

/** قوائم الانتظار لكل قناة */
const _queues     = new Map();   // channel → Array<message>

/** سجل الأحداث الأخيرة */
const _eventLog   = [];

/** الجسور المفعّلة بين الأنظمة */
const _bridges    = new Map();   // bridgeId → { systemA, systemB, pipe, active }

/** المشتركون في كل قناة */
const _subscribers = new Map();  // channel → Set<handlerId>

/** ربط الأنظمة الخارجية */
const _connectedSystems = new Map(); // systemId → { name, connected, lastSeen }

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة الناقل الشامل
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    console.log('[TRANSPORT-BUS] 🚌 بسم الله الرحمن الرحيم');
    console.log('[TRANSPORT-BUS] ﴿ وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا ﴾ — الأنعام: 59');

    // تهيئة قوائم الانتظار لكل القنوات
    for (const ch of Object.values(CHANNELS)) {
        _queues.set(ch, []);
        _subscribers.set(ch, new Set());
    }

    // تسجيل الأنظمة المتصلة
    _registerBuiltinSystems();

    _ready  = true;
    _initAt = new Date().toISOString();

    // إطلاق حدث الجاهزية
    _bus.emit(EVENTS.TRANSPORT_READY, { timestamp: _initAt });

    console.log(`[TRANSPORT-BUS] ✅ ${Object.keys(CHANNELS).length} قناة — ${_connectedSystems.size} نظام مرتبط`);
    console.log('[TRANSPORT-BUS] 🌟 الناقل الشامل جاهز — كل الأنظمة مربوطة لله');
}

function _registerBuiltinSystems() {
    const systems = [
        { id: 'neural-cells',    name: 'خلايا الشبكة العصبية (55 خلية)',        channel: CHANNELS.NEURAL_EVENTS  },
        { id: 'debug-neural',    name: 'منظومة التصحيح العصبي',                  channel: CHANNELS.DEBUG_CHANNEL  },
        { id: 'ide-server',      name: 'خادم بيئة التطوير (port 3002)',           channel: CHANNELS.IDE_CHANNEL    },
        { id: 'sdk-server',      name: 'خادم SDK (port 3001)',                    channel: CHANNELS.SDK_CHANNEL    },
        { id: 'mcp-server',      name: 'خادم MCP (stdio/http)',                   channel: CHANNELS.MCP_CHANNEL    },
        { id: 'erp-system',      name: 'نظام ERP المتكامل',                      channel: CHANNELS.ERP_CHANNEL    },
        { id: 'devops-pipeline', name: 'خط CI/CD التلقائي',                      channel: CHANNELS.DEVOPS_CHANNEL },
        { id: 'trade-engine',    name: 'محرك التجارة الشرعية',                   channel: CHANNELS.TRADE_CHANNEL  },
        { id: 'ai-engine',       name: 'محرك الذكاء الاصطناعي',                  channel: CHANNELS.AI_CHANNEL     },
        { id: 'security-engine', name: 'محرك الأمن والحماية',                    channel: CHANNELS.SECURITY_CHANNEL},
        { id: 'network-layer',   name: 'طبقة الشبكة والاتصالات',                 channel: CHANNELS.NETWORK_CHANNEL},
        { id: 'health-monitor',  name: 'مراقب الصحة والسلامة',                   channel: CHANNELS.HEALTH_CHANNEL },
        { id: 'quality-engine',  name: 'محرك الجودة والإتقان',                   channel: CHANNELS.QUALITY_CHANNEL},
    ];

    for (const sys of systems) {
        _connectedSystems.set(sys.id, {
            ...sys,
            connected: true,
            lastSeen:  new Date().toISOString(),
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② إطلاق الأحداث — EMIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إطلاق حدث عبر الناقل الشامل
 * ﴿ وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا ﴾
 *
 * @param {string} event    — اسم الحدث (من EVENTS)
 * @param {object} payload  — بيانات الحدث
 * @param {string} source   — مصدر الحدث (system id)
 * @returns {object} معلومات الإطلاق
 */
function emit(event, payload = {}, source = 'system') {
    if (!_ready) init();
    _emitCount++;

    const envelope = {
        id:        `evt_${Date.now()}_${_emitCount}`,
        event,
        source,
        payload,
        timestamp: new Date().toISOString(),
        seq:       _emitCount,
    };

    // تسجيل الحدث
    _logEvent(envelope);

    // تحديث آخر ظهور للنظام المصدر
    const sys = _connectedSystems.get(source);
    if (sys) sys.lastSeen = envelope.timestamp;

    // إطلاق الحدث الداخلي
    _bus.emit(event, envelope);

    // إطلاق على قناة NEURAL_EVENTS أيضاً
    if (event !== EVENTS.TRANSPORT_READY) {
        _bus.emit(CHANNELS.NEURAL_EVENTS, envelope);
    }

    return { id: envelope.id, event, source, timestamp: envelope.timestamp };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ الاشتراك في الأحداث — ON / OFF
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * الاشتراك في حدث أو قناة
 * @param {string}   eventOrChannel — اسم الحدث أو القناة
 * @param {Function} handler        — دالة المعالجة
 * @returns {string} handler id
 */
function on(eventOrChannel, handler) {
    if (!_ready) init();
    if (typeof handler !== 'function') return null;

    _bus.on(eventOrChannel, handler);

    const handlerId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const subs = _subscribers.get(eventOrChannel);
    if (subs) subs.add(handlerId);

    return handlerId;
}

/**
 * إلغاء الاشتراك
 */
function off(eventOrChannel, handler) {
    _bus.off(eventOrChannel, handler);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ قائمة الانتظار — SEND / RECEIVE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إرسال رسالة إلى قائمة انتظار قناة
 * ﴿ فَلْيُؤَدِّ الَّذِي اؤْتُمِنَ أَمَانَتَهُ ﴾ — البقرة: 283
 *
 * @param {string} channel — القناة المستهدفة
 * @param {object} message — الرسالة
 * @returns {object} معلومات الإرسال
 */
function send(channel, message = {}) {
    if (!_ready) init();
    _sendCount++;

    const queue = _queues.get(channel);
    if (!queue) {
        return { success: false, error: `القناة "${channel}" غير موجودة` };
    }

    // تحقق من حجم القائمة
    if (queue.length >= MAX_QUEUE_SIZE) {
        // احذف الأقدم
        queue.shift();
    }

    const envelope = {
        id:        `msg_${Date.now()}_${_sendCount}`,
        channel,
        message,
        timestamp: new Date().toISOString(),
        seq:       _sendCount,
        delivered: false,
    };

    queue.push(envelope);

    // إشعار المشتركين بوجود رسالة جديدة
    _bus.emit(`${channel}.new`, envelope);

    return { success: true, id: envelope.id, channel, queueSize: queue.length };
}

/**
 * استقبال رسالة من قائمة الانتظار (FIFO)
 * @param {string}  channel — القناة
 * @param {boolean} peek    — عرض فقط بدون حذف
 * @returns {object|null}
 */
function receive(channel, peek = false) {
    if (!_ready) init();

    const queue = _queues.get(channel);
    if (!queue || queue.length === 0) return null;

    const msg = peek ? { ...queue[0] } : queue.shift();
    if (!peek) msg.delivered = true;

    return msg;
}

/**
 * استقبال دُفعة من الرسائل
 * @param {string} channel — القناة
 * @param {number} count   — عدد الرسائل
 * @returns {Array}
 */
function receiveBatch(channel, count = 10) {
    if (!_ready) init();

    const results = [];
    for (let i = 0; i < count; i++) {
        const msg = receive(channel);
        if (!msg) break;
        results.push(msg);
    }
    return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ البث الشامل — BROADCAST
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * بث شامل لجميع المشتركين في كل القنوات
 * ﴿ عُلِّمْنَا مَنطِقَ الطَّيْرِ ﴾ — النمل: 16
 *
 * @param {object} payload — البيانات المُذاعة
 * @param {string} source  — المصدر
 * @returns {object} نتيجة البث
 */
function broadcast(payload = {}, source = 'system') {
    if (!_ready) init();

    const broadcastId = `bc_${Date.now()}`;
    const envelope = {
        id:        broadcastId,
        type:      'broadcast',
        source,
        payload,
        timestamp: new Date().toISOString(),
    };

    // إطلاق على قناة البث الشاملة
    _bus.emit(CHANNELS.SYSTEM_BROADCAST, envelope);
    _logEvent({ event: 'system.broadcast', ...envelope });

    // إرسال لجميع قنوات قوائم الانتظار
    for (const ch of Object.values(CHANNELS)) {
        _bus.emit(`${ch}.broadcast`, envelope);
    }

    return { id: broadcastId, channels: Object.keys(CHANNELS).length, timestamp: envelope.timestamp };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ الجسور بين الأنظمة — BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إنشاء جسر ثنائي الاتجاه بين نظامين
 * مثال: جسر بين IDE وخلايا الشبكة العصبية
 *
 * @param {string}   systemA  — النظام الأول (id)
 * @param {string}   systemB  — النظام الثاني (id)
 * @param {Function} pipe     — دالة التحويل (اختياري)
 * @returns {object} معلومات الجسر
 */
function bridge(systemA, systemB, pipe = null) {
    if (!_ready) init();
    _bridgeCount++;

    const bridgeId = `bridge_${systemA}_${systemB}_${_bridgeCount}`;

    // الاشتراك في أحداث النظام الأول وإعادة إرسالها للثاني
    const handlerAtoB = (envelope) => {
        const transformed = pipe ? pipe(envelope, systemA, systemB) : envelope;
        if (transformed) {
            _bus.emit(`${systemB}.incoming`, { ...transformed, bridgeId, from: systemA });
        }
    };

    const handlerBtoA = (envelope) => {
        const transformed = pipe ? pipe(envelope, systemB, systemA) : envelope;
        if (transformed) {
            _bus.emit(`${systemA}.incoming`, { ...transformed, bridgeId, from: systemB });
        }
    };

    _bus.on(`${systemA}.outgoing`, handlerAtoB);
    _bus.on(`${systemB}.outgoing`, handlerBtoA);

    const bridgeInfo = {
        id:       bridgeId,
        systemA,
        systemB,
        active:   true,
        hasPipe:  !!pipe,
        createdAt: new Date().toISOString(),
        handlers: { AtoB: handlerAtoB, BtoA: handlerBtoA },
    };

    _bridges.set(bridgeId, bridgeInfo);

    console.log(`[TRANSPORT-BUS] 🌉 جسر مفعّل: ${systemA} ↔ ${systemB} (${bridgeId})`);

    return { id: bridgeId, systemA, systemB, active: true };
}

/**
 * حذف جسر بين نظامين
 */
function removeBridge(bridgeId) {
    const b = _bridges.get(bridgeId);
    if (!b) return false;

    _bus.off(`${b.systemA}.outgoing`, b.handlers.AtoB);
    _bus.off(`${b.systemB}.outgoing`, b.handlers.BtoA);
    b.active = false;

    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ الجسور الافتراضية المُعرَّفة مسبقاً
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تفعيل جميع الجسور الافتراضية بين أنظمة المنظومة
 */
function activateDefaultBridges() {
    const defaultBridges = [
        // IDE ↔ الشبكة العصبية
        ['ide-server',       'debug-neural',    null],
        // SDK ↔ كل المحركات
        ['sdk-server',       'neural-cells',    null],
        // MCP ↔ الذكاء الاصطناعي
        ['mcp-server',       'ai-engine',       null],
        // MCP ↔ الشبكة العصبية
        ['mcp-server',       'neural-cells',    null],
        // ERP ↔ التجارة
        ['erp-system',       'trade-engine',    null],
        // ERP ↔ الأمن
        ['erp-system',       'security-engine', null],
        // DevOps ↔ التصحيح
        ['devops-pipeline',  'debug-neural',    null],
        // التجارة ↔ الذكاء الاصطناعي
        ['trade-engine',     'ai-engine',       null],
        // الأمن ↔ الشبكة
        ['security-engine',  'network-layer',   null],
    ];

    const results = [];
    for (const [a, b, pipe] of defaultBridges) {
        results.push(bridge(a, b, pipe));
    }

    console.log(`[TRANSPORT-BUS] 🌉 ${results.length} جسر افتراضي مفعّل`);
    return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑧ ربط أنظمة ERP — الربط الكامل
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تسجيل نظام خارجي في الناقل
 * @param {object} system — { id, name, channel, version }
 * @returns {object}
 */
function registerSystem(system = {}) {
    if (!_ready) init();

    const { id, name = id, channel = CHANNELS.SYSTEM_BROADCAST, version = '1.0' } = system;
    if (!id) return { success: false, error: 'يلزم تحديد id للنظام' };

    _connectedSystems.set(id, {
        id, name, channel, version,
        connected: true,
        lastSeen:  new Date().toISOString(),
    });

    emit(EVENTS.SYSTEM_HEALTH, { systemId: id, status: 'connected', version }, id);

    return { success: true, systemId: id, name, channel };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑨ سجل الأحداث
// ═══════════════════════════════════════════════════════════════════════════════

function _logEvent(envelope) {
    _eventLog.unshift(envelope);
    if (_eventLog.length > MAX_LOG_SIZE) _eventLog.length = MAX_LOG_SIZE;
}

function getEventLog(limit = 50, filter = null) {
    let log = _eventLog.slice(0, Math.min(limit, MAX_LOG_SIZE));
    if (filter) log = log.filter(e => e.event === filter || e.source === filter);
    return log;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑩ حالة الناقل الكامل
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    if (!_ready) init();

    const queueStats = {};
    for (const [ch, q] of _queues) {
        if (q.length > 0) queueStats[ch] = q.length;
    }

    const activeBridges = Array.from(_bridges.values())
        .filter(b => b.active)
        .map(b => ({ id: b.id, systemA: b.systemA, systemB: b.systemB }));

    const connectedSystems = Array.from(_connectedSystems.values()).map(s => ({
        id:        s.id,
        name:      s.name,
        connected: s.connected,
        lastSeen:  s.lastSeen,
        channel:   s.channel,
    }));

    return {
        module:           'sheikha-transport-bus',
        nameAr:           'الناقل الشامل لنقل المعلومات — منظومة شيخة',
        nameEn:           'Sheikha Universal Transport Bus',
        ready:            _ready,
        initAt:           _initAt,
        channels:         Object.keys(CHANNELS).length,
        emitCount:        _emitCount,
        sendCount:        _sendCount,
        bridgeCount:      _bridgeCount,
        activeBridges:    activeBridges.length,
        bridges:          activeBridges,
        connectedSystems: connectedSystems.length,
        systems:          connectedSystems,
        queueStats,
        eventLogSize:     _eventLog.length,
        quran: {
            events:    '﴿ وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا ﴾ — الأنعام: 59',
            contracts: '﴿ أَوْفُوا بِالْعُقُودِ ﴾ — المائدة: 1',
            harmony:   '﴿ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ﴾ — الملك: 3',
        },
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑪ Express Router — /api/transport
// ═══════════════════════════════════════════════════════════════════════════════

function createRouter() {
    if (!_ready) init();
    if (!express) {
        console.warn('[TRANSPORT-BUS] ⚠️ express غير متوفر');
        return null;
    }

    const router = express.Router();
    router.use(express.json());

    // GET /api/transport/status — حالة الناقل
    router.get('/status', (_req, res) => {
        res.json({ success: true, status: status() });
    });

    // GET /api/transport/channels — قائمة القنوات
    router.get('/channels', (_req, res) => {
        res.json({ success: true, channels: CHANNELS });
    });

    // GET /api/transport/systems — الأنظمة المرتبطة
    router.get('/systems', (_req, res) => {
        const systems = Array.from(_connectedSystems.values());
        res.json({ success: true, total: systems.length, systems });
    });

    // POST /api/transport/emit — إطلاق حدث
    router.post('/emit', (req, res) => {
        const { event, payload = {}, source = 'api' } = req.body || {};
        if (!event) return res.status(400).json({ success: false, error: 'يلزم تحديد الحدث' });
        const result = emit(event, payload, source);
        res.json({ success: true, result });
    });

    // POST /api/transport/send — إرسال لقائمة انتظار
    router.post('/send', (req, res) => {
        const { channel, message = {} } = req.body || {};
        if (!channel) return res.status(400).json({ success: false, error: 'يلزم تحديد القناة' });
        const result = send(channel, message);
        res.json(result);
    });

    // GET /api/transport/receive/:channel — استقبال من القائمة
    router.get('/receive/:channel', (req, res) => {
        const { channel } = req.params;
        const count = Number(req.query.count) || 1;
        const msgs = count > 1 ? receiveBatch(channel, count) : [receive(channel)].filter(Boolean);
        res.json({ success: true, channel, count: msgs.length, messages: msgs });
    });

    // POST /api/transport/broadcast — بث شامل
    router.post('/broadcast', (req, res) => {
        const { payload = {}, source = 'api' } = req.body || {};
        const result = broadcast(payload, source);
        res.json({ success: true, result });
    });

    // POST /api/transport/bridge — إنشاء جسر
    router.post('/bridge', (req, res) => {
        const { systemA, systemB } = req.body || {};
        if (!systemA || !systemB) return res.status(400).json({ success: false, error: 'يلزم تحديد النظامين' });
        const result = bridge(systemA, systemB);
        res.json({ success: true, result });
    });

    // DELETE /api/transport/bridge/:id — حذف جسر
    router.delete('/bridge/:id', (req, res) => {
        const ok = removeBridge(req.params.id);
        res.json({ success: ok });
    });

    // GET /api/transport/events — سجل الأحداث
    router.get('/events', (req, res) => {
        const limit  = Number(req.query.limit)  || 50;
        const filter = req.query.filter || null;
        res.json({ success: true, events: getEventLog(limit, filter), total: _eventLog.length });
    });

    // POST /api/transport/register — تسجيل نظام خارجي
    router.post('/register', (req, res) => {
        const result = registerSystem(req.body || {});
        res.status(result.success ? 201 : 400).json(result);
    });

    // POST /api/transport/bridges/activate — تفعيل الجسور الافتراضية
    router.post('/bridges/activate', (_req, res) => {
        const results = activateDefaultBridges();
        res.json({ success: true, activated: results.length, bridges: results });
    });

    return router;
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();
activateDefaultBridges();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    emit,
    on,
    off,
    send,
    receive,
    receiveBatch,
    broadcast,
    bridge,
    removeBridge,
    activateDefaultBridges,
    registerSystem,
    getEventLog,
    status,
    createRouter,
    CHANNELS,
    EVENTS,
    bus: _bus,   // الـ EventEmitter الخام للاستخدام المتقدم
};
