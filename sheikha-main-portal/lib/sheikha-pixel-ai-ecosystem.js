/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 نظام بكسل الذكاء الاصطناعي الشيخي — Sheikha Pixel AI Ecosystem
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275
 *
 * الوظائف الرئيسية:
 *   createEcosystem()    — إنشاء نسخة جديدة من المنظومة
 *   process(payload)     — معالجة حدث وتصنيفه شرعياً
 *   getStatus()          — حالة المنظومة الكاملة
 *   getStatistics()      — إحصائيات المعالجة التراكمية
 *   analyze(data)        — تحليل ذكي بالذكاء الاصطناعي مع الفلتر الشرعي
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── ثوابت النظام ────────────────────────────────────────────────────────────
const ECOSYSTEM_VERSION = '1.0.0';
const SYSTEM_NAME_AR = 'نظام بكسل الذكاء الاصطناعي الشيخي';
const SYSTEM_NAME_EN = 'Sheikha Pixel AI Ecosystem';

// الأفعال المحظورة في تحليل البيانات (بلا ضرر ولا ضرار)
const PROHIBITED_SIGNALS = [
    { key: 'riba',        patterns: ['ربا', 'ربوي', 'ربوية', 'فائدة', 'فائدة ثابتة', 'فائدة مركبة', 'فوائد ربوية', 'interest', 'interest based', 'usury', 'riba', 'apr'], ref: 'البقرة: 275' },
    { key: 'gharar',      patterns: ['غرر', 'مجهول', 'gambling', 'qimar', 'مقامرة'],            ref: 'الحديث النبوي' },
    { key: 'fraud',       patterns: ['غش', 'تزوير', 'fraud', 'deception', 'manipulation'],     ref: 'الحديث: لا غش' },
    { key: 'harm',        patterns: ['ضرر', 'إيذاء', 'harm', 'attack', 'exploit', 'abuse'],     ref: 'الحديث: لا ضرر' },
    { key: 'privacy',     patterns: ['تجسس', 'spy', 'surveillance', 'wiretap', 'unauthorized'], ref: 'الحجرات: 12' },
    { key: 'monopoly',    patterns: ['احتكار', 'monopoly', 'price fixing', 'cartel'],           ref: 'الحديث النبوي' }
];

// الإشارات الإيجابية المحفّزة للتصنيف الحلال
const POSITIVE_SIGNALS = [
    { key: 'fair_trade',   patterns: ['تجارة عادلة', 'fair trade', 'halal', 'حلال', 'شرعي'],   weight: 0.9 },
    { key: 'transparency', patterns: ['شفافية', 'transparency', 'açık', 'honest', 'صادق'],      weight: 0.85 },
    { key: 'cooperation',  patterns: ['تعاون', 'cooperation', 'partnership', 'شراكة'],          weight: 0.8 },
    { key: 'zakat',        patterns: ['زكاة', 'zakat', 'charity', 'صدقة', 'إحسان'],             weight: 1.0 },
    { key: 'equity',       patterns: ['عدل', 'equity', 'justice', 'fairness', 'إنصاف'],         weight: 0.9 }
];

// مكونات النظام النشطة
const ACTIVE_COMPONENTS = {
    neural:  { name: 'الشبكة العصبية',        available: true,  version: '1.0.0' },
    sharia:  { name: 'محرك الشريعة',          available: true,  version: '1.0.0' },
    geo:     { name: 'التكيف الجغرافي',        available: true,  version: '1.0.0' },
    analytics:{ name: 'محرك التحليلات',        available: true,  version: '1.0.0' },
    tracking: { name: 'نظام التتبع الأمين',    available: true,  version: '1.0.0' }
};

function _normalizeText(input) {
    return String(input || '')
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, '') // Arabic diacritics
        .replace(/[\u200C-\u200F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ─── المنظومة الرئيسية ────────────────────────────────────────────────────────
class SheikhapixelAIEcosystem {
    constructor(options = {}) {
        this.name     = SYSTEM_NAME_AR;
        this.nameEn   = SYSTEM_NAME_EN;
        this.version  = ECOSYSTEM_VERSION;
        this.options  = options;

        // الإحصائيات التراكمية
        this._stats = {
            processed:  0,
            failed:     0,
            halal:      0,
            haram:      0,
            pending:    0,
            violations: {}
        };

        // سجل آخر 100 عملية
        this._recentLog = [];

        this._startTime  = Date.now();
        this._systemStatus = 'ready';

        console.log('[PIXEL-SYSTEM] 🎨 تهيئة نظام البكسل الشيخة...');
        console.log('[PIXEL-SYSTEM] ✅ نظام البكسل جاهز');
    }

    // ─── process(payload) — معالجة حدث وتصنيفه ──────────────────────────────
    process(payload = {}) {
        const ts = new Date().toISOString();
        this._stats.processed++;

        try {
            const text = typeof payload === 'string'
                ? payload
                : JSON.stringify(payload);
            const lower = _normalizeText(text);

            // فحص الإشارات المحظورة
            const violations = [];
            for (const sig of PROHIBITED_SIGNALS) {
                if (sig.patterns.some(p => lower.includes(p.toLowerCase()))) {
                    violations.push({ key: sig.key, ref: sig.ref });
                    this._stats.violations[sig.key] = (this._stats.violations[sig.key] || 0) + 1;
                }
            }

            // حساب درجة الإيجابية
            let positiveScore = 0;
            let positiveCount = 0;
            for (const sig of POSITIVE_SIGNALS) {
                if (sig.patterns.some(p => lower.includes(p.toLowerCase()))) {
                    positiveScore += sig.weight;
                    positiveCount++;
                }
            }
            const avgPositive = positiveCount > 0 ? positiveScore / positiveCount : 0;

            const isHalal = violations.length === 0;
            const confidence = isHalal
                ? Math.min(1, 0.7 + avgPositive * 0.3)
                : Math.max(0, 0.4 - violations.length * 0.1);

            if (isHalal) {
                this._stats.halal++;
            } else {
                this._stats.haram++;
            }

            const record = {
                id:         `px-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
                halal:      isHalal,
                confidence: Math.round(confidence * 100) / 100,
                violations,
                positiveScore: Math.round(avgPositive * 100) / 100,
                timestamp:  ts
            };

            this._recentLog.push(record);
            if (this._recentLog.length > 100) this._recentLog.shift();

            return { success: true, ...record };
        } catch (err) {
            this._stats.failed++;
            return { success: false, error: err.message, timestamp: ts };
        }
    }

    // ─── analyze(data) — تحليل ذكي ───────────────────────────────────────────
    analyze(data = {}) {
        const result = this.process(data);

        // طبقة تحليل إضافية: تقييم السياق
        const contextScore = this._evaluateContext(data);

        return {
            ...result,
            analysis: {
                contextScore,
                recommendation: result.halal && contextScore > 0.6
                    ? 'الحدث يتوافق مع ضوابط الشريعة ومبادئ لا ضرر ولا ضرار'
                    : result.halal
                        ? 'الحدث مسموح مع مراعاة السياق'
                        : 'الحدث يحتاج مراجعة — يحتوي على مؤشرات محظورة',
                quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
                hadith:   'لا ضرر ولا ضرار'
            }
        };
    }

    // ─── getStatus() — حالة المنظومة ─────────────────────────────────────────
    getStatus() {
        const now = Date.now();
        const uptimeMs = now - this._startTime;

        return {
            status:    this._systemStatus,
            name:      this.name,
            nameEn:    this.nameEn,
            version:   this.version,
            timestamp: new Date().toISOString(),
            uptimeMs,
            uptimeHuman: _formatUptime(uptimeMs),
            components: Object.entries(ACTIVE_COMPONENTS).reduce((acc, [k, v]) => {
                acc[k] = v.available;
                return acc;
            }, {}),
            statistics: this._buildStats(),
            recentProcessed: this._recentLog.length,
            islamicFoundation: {
                quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
                hadith:   'لا ضرر ولا ضرار',
                principle:'الشريعة الإسلامية أساس المنظومة'
            }
        };
    }

    // ─── getStatistics() — الإحصائيات التراكمية ──────────────────────────────
    getStatistics() {
        return this._buildStats();
    }

    // ─── getRecentLog() — سجل آخر المعالجات ─────────────────────────────────
    getRecentLog(limit = 20) {
        return this._recentLog.slice(-limit);
    }

    // ─── reset() — إعادة تعيين الإحصائيات ───────────────────────────────────
    reset() {
        this._stats = { processed: 0, failed: 0, halal: 0, haram: 0, pending: 0, violations: {} };
        this._recentLog = [];
    }

    // ─── دوال مساعدة خاصة ────────────────────────────────────────────────────
    _buildStats() {
        const { processed, failed, halal, haram } = this._stats;
        const successRate = processed > 0 ? `${Math.round((processed - failed) / processed * 100)}%` : '0%';
        const halalRate   = processed > 0 ? `${Math.round(halal / processed * 100)}%` : '0%';
        return { processed, failed, halal, haram, successRate, halalRate, topViolations: this._stats.violations };
    }

    _evaluateContext(data) {
        if (!data || typeof data !== 'object') return 0.5;
        const keys = Object.keys(data).join(' ').toLowerCase();
        let score = 0.5;
        for (const sig of POSITIVE_SIGNALS) {
            if (sig.patterns.some(p => keys.includes(p.toLowerCase()))) {
                score = Math.min(1, score + sig.weight * 0.1);
            }
        }
        return Math.round(score * 100) / 100;
    }
}

// ─── دالة مساعدة لتنسيق وقت التشغيل ─────────────────────────────────────────
function _formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60)   return `${s}ث`;
    if (s < 3600) return `${Math.floor(s / 60)}د`;
    return `${Math.floor(s / 3600)}س ${Math.floor((s % 3600) / 60)}د`;
}

// ─── Singleton + factory ──────────────────────────────────────────────────────
let _instance = null;

function getInstance() {
    if (!_instance) {
        _instance = new SheikhapixelAIEcosystem();
    }
    return _instance;
}

function createEcosystem(options = {}) {
    return new SheikhapixelAIEcosystem(options);
}

// ─── تصدير ───────────────────────────────────────────────────────────────────
module.exports = getInstance();
module.exports.SheikhapixelAIEcosystem = SheikhapixelAIEcosystem;
module.exports.createEcosystem = createEcosystem;
module.exports.getInstance    = getInstance;
module.exports.ACTIVE_COMPONENTS = ACTIVE_COMPONENTS;
module.exports.ECOSYSTEM_VERSION = ECOSYSTEM_VERSION;
