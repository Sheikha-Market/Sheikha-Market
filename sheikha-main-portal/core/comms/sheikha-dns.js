/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌐 SHEIKHA DNS — نظام أسماء النطاقات الداخلي                               ║
 * ║  Sheikha Internal DNS — Service Discovery & Routing                          ║
 * ║                                                                              ║
 * ║  يحوّل أسماء الخدمات إلى عناوين وبروتوكولات فعلية داخل منظومة شيخة         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   const dns = require('./sheikha-dns');
 *   const record = dns.resolve('market');      // → { host, port, protocol, ... }
 *   dns.register('my-service', { host: '...', port: 3001 });
 *   dns.lookup('payment', 'SRV');
 *
 * ﴿ وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ﴾ — البقرة: 148
 */

'use strict';

const crypto = require('crypto');

// ─── أنواع السجلات ────────────────────────────────────────────────────────

/**
 * أنواع سجلات DNS الداخلية:
 * A     — عنوان IPv4
 * AAAA  — عنوان IPv6
 * SRV   — سجل الخدمة (host + port + protocol)
 * TXT   — نص وصفي / بيانات التكوين
 * CNAME — اسم بديل (alias)
 */
const RECORD_TYPES = ['A', 'AAAA', 'SRV', 'TXT', 'CNAME'];

// ─── السجلات المدمجة ──────────────────────────────────────────────────────

/**
 * خريطة الخدمات الأساسية في منظومة شيخة
 * كل خدمة = { type, host, port, protocol, path, weight, priority, meta }
 */
const BUILT_IN_RECORDS = {

    // ── خدمات الإنتاج الأساسية ──────────────────────────────────
    'market': {
        type:     'SRV',
        nameAr:   'سوق شيخة',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/smart-market',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['core', 'commerce'],
    },
    'auth': {
        type:     'SRV',
        nameAr:   'خدمة المصادقة',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/auth',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['security', 'core'],
    },
    'payment': {
        type:     'SRV',
        nameAr:   'خدمة الدفع الإسلامي',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/payment',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['commerce', 'sharia'],
    },
    'neural': {
        type:     'SRV',
        nameAr:   'محرك الشبكة العصبية',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/neural',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['ai', 'core'],
    },
    'telecom': {
        type:     'SRV',
        nameAr:   'منظومة الاتصالات',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/telecom',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['network', 'core'],
    },
    'waterline': {
        type:     'SRV',
        nameAr:   'خط أمان شيخة',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/waterline',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['security', 'core'],
    },
    'dbus': {
        type:     'SRV',
        nameAr:   'ناقل رسائل شيخة',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/dbus',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['messaging', 'core'],
    },
    'dns': {
        type:     'SRV',
        nameAr:   'نظام DNS الداخلي',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/dns',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['network', 'core'],
    },
    'satellite': {
        type:     'SRV',
        nameAr:   'بوابة الأقمار الصناعية',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/telecom/satellite',
        weight:   80,
        priority: 2,
        healthy:  true,
        tags:     ['network', 'gps'],
    },
    'sharia': {
        type:     'SRV',
        nameAr:   'محرك الرقابة الشرعية',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/sharia',
        weight:   100,
        priority: 1,
        healthy:  true,
        tags:     ['sharia', 'core'],
    },
    'knowledge': {
        type:     'SRV',
        nameAr:   'قاعدة المعرفة',
        host:     'localhost',
        port:     3000,
        protocol: 'HTTPS',
        path:     '/api/telecom/knowledge-base',
        weight:   90,
        priority: 2,
        healthy:  true,
        tags:     ['knowledge', 'islamic'],
    },

    // ── CNAME — أسماء بديلة ──────────────────────────────────────
    'store':    { type: 'CNAME', target: 'market',    nameAr: 'المتجر' },
    'shop':     { type: 'CNAME', target: 'market',    nameAr: 'التسوق' },
    'login':    { type: 'CNAME', target: 'auth',      nameAr: 'تسجيل الدخول' },
    'ai':       { type: 'CNAME', target: 'neural',    nameAr: 'الذكاء الاصطناعي' },
    'security': { type: 'CNAME', target: 'waterline', nameAr: 'الأمان' },
    'msg':      { type: 'CNAME', target: 'dbus',      nameAr: 'الرسائل' },

    // ── TXT — بيانات وصفية ───────────────────────────────────────
    'sheikha.market': {
        type:    'TXT',
        nameAr:  'المعرّف الرئيسي لمنظومة شيخة',
        value:   'v=sheikha1; owner=salman-bin-salman-alrajeh; tawheed=true; sharia=compliant',
    },
};

// ─── نظام DNS ────────────────────────────────────────────────────────────────

class SheikhaInternalDNS {

    constructor() {
        this._records    = new Map();   // name → DnsRecord
        this._ttlCache   = new Map();   // name → { record, expiresAt }
        this._queryLog   = [];
        this._stats      = { queries: 0, hits: 0, misses: 0, registered: 0 };
        this._startedAt  = new Date().toISOString();

        // تحميل السجلات المدمجة
        Object.entries(BUILT_IN_RECORDS).forEach(([name, record]) => {
            this._records.set(name.toLowerCase(), {
                ...record,
                name:      name.toLowerCase(),
                ttl:       300,
                builtin:   true,
                createdAt: this._startedAt,
                updatedAt: this._startedAt,
            });
        });
    }

    // ══════════════════════════════════════════════════════════════
    // حل الاسم → سجل الخدمة
    // ══════════════════════════════════════════════════════════════

    /**
     * يحوّل اسم خدمة إلى سجلها الكامل
     * @param {string} name - اسم الخدمة (مثال: 'market', 'payment')
     * @param {string} [type] - نوع السجل المطلوب (A|AAAA|SRV|TXT|CNAME)
     * @returns {object|null}
     */
    resolve(name, type = null) {
        if (!name || typeof name !== 'string') return null;
        const key = name.toLowerCase().trim();
        this._stats.queries++;

        // البحث في السجلات
        let record = this._records.get(key);

        if (!record) {
            this._stats.misses++;
            this._logQuery(key, type, false);
            return null;
        }

        // متابعة CNAME
        let depth = 0;
        while (record && record.type === 'CNAME' && depth < 5) {
            record = this._records.get(record.target);
            depth++;
        }

        if (!record) {
            this._stats.misses++;
            return null;
        }

        // تصفية حسب النوع إذا طُلب
        if (type && record.type !== type) {
            this._stats.misses++;
            return null;
        }

        this._stats.hits++;
        this._logQuery(key, type, true);

        return {
            name:      key,
            resolvedAt: new Date().toISOString(),
            ...record,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // تسجيل خدمة جديدة
    // ══════════════════════════════════════════════════════════════

    /**
     * يسجّل خدمة جديدة في DNS الداخلي
     * @param {string} name - اسم الخدمة
     * @param {object} recordData - بيانات السجل
     */
    register(name, recordData) {
        if (!name || typeof name !== 'string') throw new TypeError('DNS: اسم الخدمة مطلوب');
        if (!recordData || typeof recordData !== 'object') throw new TypeError('DNS: بيانات السجل مطلوبة');

        const key = name.toLowerCase().trim();
        const now = new Date().toISOString();
        const existing = this._records.get(key);

        const record = {
            type:      recordData.type || 'SRV',
            nameAr:    recordData.nameAr || name,
            host:      recordData.host || 'localhost',
            port:      recordData.port || 3000,
            protocol:  recordData.protocol || 'HTTP',
            path:      recordData.path || '/',
            weight:    recordData.weight !== undefined ? recordData.weight : 100,
            priority:  recordData.priority !== undefined ? recordData.priority : 10,
            healthy:   recordData.healthy !== false,
            tags:      recordData.tags || [],
            ttl:       recordData.ttl || 60,
            builtin:   false,
            name:      key,
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now,
        };

        this._records.set(key, record);
        this._stats.registered++;

        return {
            success:     true,
            name:        key,
            record,
            messageAr:  `تم تسجيل الخدمة '${key}' في Sheikha DNS`,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // إلغاء تسجيل خدمة
    // ══════════════════════════════════════════════════════════════

    unregister(name) {
        const key = name.toLowerCase().trim();
        const record = this._records.get(key);
        if (!record) return { success: false, error: 'not_found' };
        if (record.builtin) return { success: false, error: 'cannot_remove_builtin', messageAr: 'لا يمكن حذف السجلات المدمجة' };
        this._records.delete(key);
        return { success: true, name: key, messageAr: `تم إلغاء تسجيل الخدمة '${key}'` };
    }

    // ══════════════════════════════════════════════════════════════
    // البحث في السجلات
    // ══════════════════════════════════════════════════════════════

    /**
     * يبحث عن خدمات حسب الوسوم أو الكلمة المفتاحية
     * @param {string} query
     */
    search(query) {
        const q = (query || '').toLowerCase().trim();
        const results = [];
        this._records.forEach((record, name) => {
            const inName    = name.includes(q);
            const inNameAr  = (record.nameAr || '').includes(q);
            const inTags    = (record.tags || []).some(t => t.toLowerCase().includes(q));
            if (inName || inNameAr || inTags) results.push({ name, ...record });
        });
        return { query, results, count: results.length };
    }

    /**
     * جلب جميع الخدمات
     */
    listAll(tag = null) {
        const records = [];
        this._records.forEach((record, name) => {
            if (!tag || (record.tags || []).includes(tag)) {
                records.push({ name, ...record });
            }
        });
        return {
            records,
            count:   records.length,
            tags:    [...new Set(records.flatMap(r => r.tags || []))],
        };
    }

    // ══════════════════════════════════════════════════════════════
    // تحديث حالة الصحة
    // ══════════════════════════════════════════════════════════════

    setHealth(name, healthy) {
        const key = name.toLowerCase().trim();
        const record = this._records.get(key);
        if (!record) return { success: false, error: 'not_found' };
        record.healthy   = healthy;
        record.updatedAt = new Date().toISOString();
        return { success: true, name: key, healthy };
    }

    // ══════════════════════════════════════════════════════════════
    // حالة النظام
    // ══════════════════════════════════════════════════════════════

    getStatus() {
        return {
            nameAr:      'نظام أسماء النطاقات الداخلي — شيخة',
            nameEn:      'Sheikha Internal DNS',
            version:     '1.0.0',
            startedAt:   this._startedAt,
            uptime:      process.uptime(),
            stats:       { ...this._stats },
            totalRecords: this._records.size,
            builtinCount: [...this._records.values()].filter(r => r.builtin).length,
            customCount:  [...this._records.values()].filter(r => !r.builtin).length,
            healthyCount: [...this._records.values()].filter(r => r.healthy !== false).length,
            lastQueries:  this._queryLog.slice(-10),
            verse:       '﴿ وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ﴾ — البقرة: 148',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // مساعد داخلي — تسجيل الاستعلامات
    // ══════════════════════════════════════════════════════════════

    _logQuery(name, type, resolved) {
        this._queryLog.push({ name, type, resolved, ts: new Date().toISOString() });
        if (this._queryLog.length > 200) this._queryLog.splice(0, this._queryLog.length - 200);
    }
}

// ─── Singleton ──────────────────────────────────────────────────────────────
const sheikha_dns = new SheikhaInternalDNS();

module.exports = {
    sheikha_dns,
    SheikhaInternalDNS,
    BUILT_IN_RECORDS,
    RECORD_TYPES,
};
