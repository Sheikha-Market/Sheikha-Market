/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🚌 SHEIKHA DBUS — ناقل الرسائل بين الخدمات المصغرة                        ║
 * ║  Sheikha D-Bus — Microservices Message Bus                                   ║
 * ║                                                                              ║
 * ║  يربط جميع الخدمات الداخلية برسائل موحّدة آمنة ومرقمّنة بالكتاب والسنة     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   const dbus = require('./sheikha-dbus');
 *   dbus.publish('market.price.updated', { productId: '123', price: 50 });
 *   const sub = dbus.subscribe('market.price.updated', handler);
 *   dbus.request('dns.resolve', { service: 'market' }, callback);
 *
 * ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾ — المائدة: 2
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── ثوابت DBUS ─────────────────────────────────────────────────────────────

/** أقصى عدد رسائل في طابور الانتظار لكل قناة */
const MAX_QUEUE_SIZE = 1000;

/** مدة انتهاء صلاحية الاشتراك (بالمللي ثانية) — 24 ساعة */
const SUBSCRIPTION_TTL = 24 * 60 * 60 * 1000;

/** القنوات المدمجة المعرّفة مسبقاً */
const BUILT_IN_CHANNELS = {
    'market.price.updated':       { nameAr: 'تحديث سعر منتج',          priority: 'HIGH'   },
    'market.order.created':       { nameAr: 'طلب شراء جديد',           priority: 'HIGH'   },
    'market.order.fulfilled':     { nameAr: 'تنفيذ طلب شراء',          priority: 'NORMAL' },
    'market.product.listed':      { nameAr: 'إدراج منتج جديد',         priority: 'NORMAL' },
    'market.product.removed':     { nameAr: 'حذف منتج',                priority: 'NORMAL' },
    'user.registered':            { nameAr: 'تسجيل مستخدم جديد',       priority: 'NORMAL' },
    'user.verified':              { nameAr: 'تحقق من هوية المستخدم',    priority: 'HIGH'   },
    'payment.initiated':          { nameAr: 'بدء عملية دفع',           priority: 'CRITICAL'},
    'payment.completed':          { nameAr: 'إتمام عملية دفع',         priority: 'CRITICAL'},
    'payment.failed':             { nameAr: 'فشل عملية دفع',           priority: 'CRITICAL'},
    'sharia.violation.detected':  { nameAr: 'رصد مخالفة شرعية',        priority: 'CRITICAL'},
    'neural.prediction.ready':    { nameAr: 'توصية من الشبكة العصبية', priority: 'NORMAL' },
    'neural.risk.alert':          { nameAr: 'تنبيه مخاطر عصبي',        priority: 'HIGH'   },
    'dns.service.registered':     { nameAr: 'تسجيل خدمة في DNS',       priority: 'LOW'    },
    'dns.service.unregistered':   { nameAr: 'إلغاء تسجيل خدمة',        priority: 'LOW'    },
    'waterline.breach.detected':  { nameAr: 'اختراق خط الأمان',        priority: 'CRITICAL'},
    'waterline.threshold.warning':{ nameAr: 'تحذير من حد أمان',        priority: 'HIGH'   },
    'satellite.data.received':    { nameAr: 'بيانات واردة من قمر صناعي', priority: 'NORMAL'},
    'system.health.check':        { nameAr: 'فحص صحة النظام',           priority: 'LOW'    },
    'system.service.started':     { nameAr: 'بدء تشغيل خدمة',          priority: 'LOW'    },
    'system.service.stopped':     { nameAr: 'إيقاف خدمة',              priority: 'NORMAL' },
};

// ─── تطبيق DBUS ─────────────────────────────────────────────────────────────

class SheikhaDBus extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(200);

        this._subscriptions  = new Map();   // id → { channel, handler, createdAt, expiresAt }
        this._messageHistory = new Map();   // channel → Message[]
        this._stats = {
            published:  0,
            delivered:  0,
            dropped:    0,
            errors:     0,
        };
        this._startedAt = new Date().toISOString();

        // تفعيل دوري للتنظيف
        this._cleanupInterval = setInterval(() => this._cleanup(), 60 * 60 * 1000);
        if (this._cleanupInterval.unref) this._cleanupInterval.unref();
    }

    // ══════════════════════════════════════════════════════════════
    // نشر رسالة على قناة
    // ══════════════════════════════════════════════════════════════

    /**
     * ينشر رسالة على قناة معيّنة
     * @param {string} channel - اسم القناة (مثال: 'market.price.updated')
     * @param {*} payload - البيانات
     * @param {object} [options] - خيارات إضافية: { priority, persist, shariaCheck }
     * @returns {{ messageId: string, channel: string, deliveredTo: number }}
     */
    publish(channel, payload, options = {}) {
        if (!channel || typeof channel !== 'string') {
            throw new TypeError('DBUS: اسم القناة مطلوب ويجب أن يكون نصاً');
        }

        const message = {
            messageId:   `MSG-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
            channel,
            payload,
            priority:    options.priority || BUILT_IN_CHANNELS[channel]?.priority || 'NORMAL',
            timestamp:   new Date().toISOString(),
            publishedBy: options.publishedBy || 'system',
            shariaCheck: options.shariaCheck !== false,   // افتراضياً: مفعّل
        };

        // تحقق شرعي مبسّط
        if (message.shariaCheck && this._containsHaram(payload)) {
            this._stats.dropped++;
            return {
                messageId:   message.messageId,
                channel,
                deliveredTo: 0,
                blocked:     true,
                reason:      'sharia_filter',
                messageAr:   'الرسالة مرفوضة بسبب محتوى مخالف للشريعة',
            };
        }

        // حفظ في السجل
        if (options.persist !== false) {
            this._saveToHistory(channel, message);
        }

        // إرسال لجميع المشتركين
        let deliveredTo = 0;
        this._subscriptions.forEach(sub => {
            if (sub.channel === channel || sub.channel === '*') {
                try {
                    sub.handler(message);
                    deliveredTo++;
                    this._stats.delivered++;
                } catch (_) {
                    this._stats.errors++;
                }
            }
        });

        // EventEmitter للتوافق مع الكود القديم
        this.emit(channel, message);
        this._stats.published++;

        return { messageId: message.messageId, channel, deliveredTo };
    }

    // ══════════════════════════════════════════════════════════════
    // الاشتراك في قناة
    // ══════════════════════════════════════════════════════════════

    /**
     * يشترك في قناة ويستقبل الرسائل
     * @param {string} channel - اسم القناة أو '*' لكل القنوات
     * @param {Function} handler - دالة المعالجة (message) => void
     * @param {object} [options] - { ttl, subscribedBy }
     * @returns {{ subscriptionId: string, unsubscribe: Function }}
     */
    subscribe(channel, handler, options = {}) {
        if (!channel || typeof channel !== 'string') throw new TypeError('DBUS: اسم القناة مطلوب');
        if (typeof handler !== 'function') throw new TypeError('DBUS: المعالج يجب أن يكون دالة');

        const subscriptionId = `SUB-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        const ttl = options.ttl || SUBSCRIPTION_TTL;

        this._subscriptions.set(subscriptionId, {
            subscriptionId,
            channel,
            handler,
            subscribedBy: options.subscribedBy || 'unknown',
            createdAt:    new Date().toISOString(),
            expiresAt:    new Date(Date.now() + ttl).toISOString(),
        });

        const unsubscribe = () => this.unsubscribe(subscriptionId);
        return { subscriptionId, unsubscribe };
    }

    // ══════════════════════════════════════════════════════════════
    // إلغاء الاشتراك
    // ══════════════════════════════════════════════════════════════

    unsubscribe(subscriptionId) {
        const existed = this._subscriptions.has(subscriptionId);
        this._subscriptions.delete(subscriptionId);
        return { unsubscribed: existed, subscriptionId };
    }

    // ══════════════════════════════════════════════════════════════
    // طلب-استجابة (Request-Response)
    // ══════════════════════════════════════════════════════════════

    /**
     * يرسل طلباً وينتظر رداً مرة واحدة
     * @param {string} channel - قناة الطلب
     * @param {*} payload - بيانات الطلب
     * @param {number} [timeoutMs=5000] - مهلة الانتظار بالمللي ثانية
     * @returns {Promise<*>} - رد الخدمة
     */
    request(channel, payload, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            const replyChannel = `${channel}.reply.${crypto.randomBytes(4).toString('hex')}`;
            let resolved = false;

            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    this.unsubscribe(sub.subscriptionId);
                    reject(new Error(`DBUS: انتهت مهلة الطلب على القناة '${channel}'`));
                }
            }, timeoutMs);

            const sub = this.subscribe(replyChannel, (message) => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    this.unsubscribe(sub.subscriptionId);
                    resolve(message.payload);
                }
            });

            this.publish(channel, { ...payload, _replyChannel: replyChannel });
        });
    }

    // ══════════════════════════════════════════════════════════════
    // سجل الرسائل الأخيرة
    // ══════════════════════════════════════════════════════════════

    /**
     * جلب آخر الرسائل على قناة معيّنة
     * @param {string} channel
     * @param {number} [limit=20]
     */
    getHistory(channel, limit = 20) {
        const history = this._messageHistory.get(channel) || [];
        return history.slice(-limit);
    }

    // ══════════════════════════════════════════════════════════════
    // إحصاءات وحالة DBUS
    // ══════════════════════════════════════════════════════════════

    getStatus() {
        return {
            nameAr:        'ناقل رسائل شيخة',
            nameEn:        'Sheikha D-Bus',
            version:       '1.0.0',
            startedAt:     this._startedAt,
            uptime:        process.uptime(),
            stats:         { ...this._stats },
            subscriptions: this._subscriptions.size,
            channels: {
                builtin:  Object.keys(BUILT_IN_CHANNELS).length,
                active:   new Set([...this._subscriptions.values()].map(s => s.channel)).size,
            },
            verse:    '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾ — المائدة: 2',
            hadith:   '«المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً» — البخاري',
        };
    }

    getChannels() {
        return {
            channels: Object.entries(BUILT_IN_CHANNELS).map(([id, meta]) => ({
                id,
                ...meta,
                subscribers: [...this._subscriptions.values()].filter(s => s.channel === id).length,
                lastMessage: (this._messageHistory.get(id) || []).slice(-1)[0] || null,
            })),
            total: Object.keys(BUILT_IN_CHANNELS).length,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // مساعدات داخلية
    // ══════════════════════════════════════════════════════════════

    _saveToHistory(channel, message) {
        if (!this._messageHistory.has(channel)) {
            this._messageHistory.set(channel, []);
        }
        const history = this._messageHistory.get(channel);
        history.push(message);
        if (history.length > MAX_QUEUE_SIZE) {
            history.splice(0, history.length - MAX_QUEUE_SIZE);
        }
    }

    _containsHaram(payload) {
        if (!payload || typeof payload !== 'object') return false;
        const HARAM_KEYS = ['riba', 'interest_rate', 'alcohol', 'pork', 'gambling'];
        const str = JSON.stringify(payload).toLowerCase();
        return HARAM_KEYS.some(k => str.includes(k));
    }

    _cleanup() {
        const now = Date.now();
        let removed = 0;
        this._subscriptions.forEach((sub, id) => {
            if (sub.expiresAt && new Date(sub.expiresAt).getTime() < now) {
                this._subscriptions.delete(id);
                removed++;
            }
        });
        if (removed > 0) {
            this.publish('system.health.check', { cleanedSubscriptions: removed }, { persist: false });
        }
    }

    destroy() {
        clearInterval(this._cleanupInterval);
        this._subscriptions.clear();
        this._messageHistory.clear();
        this.removeAllListeners();
    }
}

// ─── Singleton ──────────────────────────────────────────────────────────────
const dbus = new SheikhaDBus();

module.exports = {
    dbus,
    SheikhaDBus,
    BUILT_IN_CHANNELS,
};
