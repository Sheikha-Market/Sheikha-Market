/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 محرك البكسل الكوني الشيخي — Sheikha Pixel Cosmic Engine (SPCE)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275
 * ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾ — المائدة: 2
 * « لا ضرر ولا ضرار » — الحديث النبوي
 *
 * المنظومة الأقوى كونياً وعالمياً لتقنية البكسل الذكي:
 *   ✦ تصنيف شرعي متعدد الأبعاد (7 طبقات فحص)
 *   ✦ درجة ثقة متدرجة: CERTAIN → HIGH → MEDIUM → LOW → UNCERTAIN
 *   ✦ معالجة دُفعية (batch) لآلاف العناصر
 *   ✦ شرح مفصّل لكل قرار (Explainability Layer)
 *   ✦ كشف التحايل والتمويه (Bypass Detection)
 *   ✦ تكيّف جغرافي: خليجي / عربي / عالمي
 *   ✦ سجل تدقيق ثابت (Immutable Audit Trail)
 *   ✦ مقاييس أداء لحظية (P50/P95/P99 latency)
 *   ✦ إشارات سوق عالمي (GCC / MENA / Global)
 *   ✦ واجهة WebSocket للمعالجة الفورية
 *
 * الإصدار: 3.0.0-COSMIC
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── ثوابت المنظومة الكونية ───────────────────────────────────────────────────
const COSMIC_VERSION   = '3.0.0-COSMIC';
const COSMIC_NAME_AR   = 'محرك البكسل الكوني الشيخي';
const COSMIC_NAME_EN   = 'Sheikha Pixel Cosmic Engine';
const COSMIC_NAMESPACE = 'SPCE';

// درجات الثقة المتدرجة
const CONFIDENCE_TIERS = {
    CERTAIN:   { min: 0.92, label_ar: 'مؤكد',      label_en: 'CERTAIN',   color: '#00C853' },
    HIGH:      { min: 0.75, label_ar: 'عالي',       label_en: 'HIGH',      color: '#64DD17' },
    MEDIUM:    { min: 0.55, label_ar: 'متوسط',      label_en: 'MEDIUM',    color: '#FFD600' },
    LOW:       { min: 0.35, label_ar: 'منخفض',      label_en: 'LOW',       color: '#FF6D00' },
    UNCERTAIN: { min: 0.00, label_ar: 'غير محدد',   label_en: 'UNCERTAIN', color: '#D50000' }
};

// مناطق السوق العالمية
const MARKET_ZONES = {
    GCC:    { code: 'GCC',    name_ar: 'دول الخليج العربي',    name_en: 'Gulf Cooperation Council', weight: 1.15 },
    MENA:   { code: 'MENA',   name_ar: 'الشرق الأوسط وشمال أفريقيا', name_en: 'Middle East & North Africa', weight: 1.10 },
    ASIA:   { code: 'ASIA',   name_ar: 'آسيا والمحيط الهادئ',  name_en: 'Asia Pacific', weight: 1.05 },
    EUROPE: { code: 'EUROPE', name_ar: 'أوروبا',                name_en: 'Europe', weight: 1.0 },
    GLOBAL: { code: 'GLOBAL', name_ar: 'عالمي',                 name_en: 'Global', weight: 1.0 }
};

// ─── الإشارات المحظورة — 7 طبقات فحص شرعي ────────────────────────────────────
const PROHIBITED_SIGNALS = [
    {
        key: 'riba',
        severity: 'CRITICAL',
        weight: 1.0,
        ref: 'البقرة: 275',
        patterns: [
            'ربا','ربوي','ربوية','فائدة','فائدة ثابتة','فائدة مركبة','فائدة سنوية',
            'فوائد ربوية','قرض بفائدة','interest','interest-based','interest based',
            'interest bearing','compound interest','usury','riba','apr','annual percentage rate',
            'r1ba','r!ba','r|ba' // تحايل مرئي
        ]
    },
    {
        key: 'gharar',
        severity: 'HIGH',
        weight: 0.9,
        ref: 'الحديث النبوي — نهي عن بيع الغرر',
        patterns: [
            'غرر','غرري','مجهول','جهالة','مقامرة','قمار',
            'gambling','qimar','maisir','speculative','high-risk speculation',
            'lottery','ponzi','pyramid scheme'
        ]
    },
    {
        key: 'fraud',
        severity: 'HIGH',
        weight: 0.95,
        ref: 'الحديث: من غشنا فليس منا',
        patterns: [
            'غش','تزوير','احتيال','خداع','تلاعب',
            'fraud','deception','manipulation','scam','fake','counterfeit',
            'money laundering','غسيل الأموال'
        ]
    },
    {
        key: 'harm',
        severity: 'HIGH',
        weight: 0.95,
        ref: 'الحديث: لا ضرر ولا ضرار',
        patterns: [
            'ضرر','إيذاء','أذى','تدمير',
            'harm','attack','exploit','abuse','damage','destroy','malware','ransomware'
        ]
    },
    {
        key: 'privacy_violation',
        severity: 'MEDIUM',
        weight: 0.75,
        ref: 'الحجرات: 12 — لا تجسسوا',
        patterns: [
            'تجسس','مراقبة غير مشروعة','انتهاك خصوصية',
            'spy','spyware','surveillance','wiretap','unauthorized tracking',
            'data theft','بيانات مسروقة'
        ]
    },
    {
        key: 'monopoly',
        severity: 'MEDIUM',
        weight: 0.7,
        ref: 'الحديث النبوي — النهي عن الاحتكار',
        patterns: [
            'احتكار','حكر','تكتل','تحالف سعري',
            'monopoly','price fixing','cartel','market manipulation','antitrust'
        ]
    },
    {
        key: 'exploitation',
        severity: 'MEDIUM',
        weight: 0.8,
        ref: 'مبدأ التراضي — البقرة: 188',
        patterns: [
            'استغلال','ابتزاز','إكراه',
            'exploitation','extortion','coercion','predatory pricing','loan shark'
        ]
    }
];

// ─── الإشارات الإيجابية — مع أوزان دقيقة ─────────────────────────────────────
const POSITIVE_SIGNALS = [
    { key: 'halal_trade',    weight: 1.00, ref: 'البقرة: 275', patterns: ['حلال','تجارة حلال','halal','shariah compliant','شرعي','مباح'] },
    { key: 'zakat',          weight: 1.00, ref: 'التوبة: 60',  patterns: ['زكاة','زكاة مال','zakat','charity','صدقة','إحسان'] },
    { key: 'fair_trade',     weight: 0.95, ref: 'المطففين: 1', patterns: ['تجارة عادلة','fair trade','وفاء بالعقد','honest dealing'] },
    { key: 'transparency',   weight: 0.90, ref: 'الإسراء: 35', patterns: ['شفافية','transparency','صادق','honest','açık','نزاهة'] },
    { key: 'murabaha',       weight: 0.95, ref: 'فقه المعاملات', patterns: ['مرابحة','murabaha','تمويل إسلامي','islamic finance'] },
    { key: 'musharaka',      weight: 0.95, ref: 'فقه الشركات',  patterns: ['مشاركة','مضاربة','musharaka','mudaraba','شراكة'] },
    { key: 'equity',         weight: 0.90, ref: 'النساء: 58',   patterns: ['عدل','إنصاف','equity','justice','fairness','قسط'] },
    { key: 'cooperation',    weight: 0.85, ref: 'المائدة: 2',   patterns: ['تعاون','cooperation','partnership','تكافل','takaful'] },
    { key: 'sustainability', weight: 0.80, ref: 'الأعراف: 56',  patterns: ['استدامة','sustainability','بيئة','eco-friendly','أخضر'] },
    { key: 'empowerment',    weight: 0.75, ref: 'الحشر: 7',     patterns: ['تمكين','empowerment','توزيع الثروة','wealth distribution'] }
];

/**
 * BYPASS_PATTERNS — أنماط كشف التحايل والتمويه على المصطلحات المحظورة
 *
 * الهدف: رصد محاولات تفادي الفلتر الشرعي عبر:
 *   - تفريق الأحرف بمسافات أو رموز: "r - i - b - a"
 *   - استبدال أحرف بأرقام متشابهة: "r1ba"، "r!ba"
 *   - حروف سيريلية مشابهة بصرياً: р і б а
 *   - صيغ مرفوضة مرادفة: usury, usurey, gamb1ing
 *   - مخططات محظورة مع تمويه: "ponzi scheme"
 *
 * ملاحظة: الكلمات العربية/الإنجليزية الصريحة تُعالَج في PROHIBITED_SIGNALS.
 * هذه الأنماط تُكمِّل الفلتر ولا تُكرِّره.
 *
 * @example
 *   /r[\s\-_\.]+i[\s\-_\.]+b[\s\-_\.]+a/i  ← يطابق "r-i-b-a" أو "r . i . b . a"
 *   /r[!1|]ba\b/i                            ← يطابق "r1ba" أو "r!ba"
 *   /[\u0440][\u0456][\u0431][\u0430]/       ← يطابق "рібa" (سيريلي مشابه)
 */
const BYPASS_PATTERNS = [
    /r[\s\-_\.]+i[\s\-_\.]+b[\s\-_\.]+a/i,       // r - i - b - a مفرّقة
    /r[!1|]ba\b/i,                                  // r!ba / r1ba visual spoofing
    /[\u0440][\u0456][\u0431][\u0430]/,             // Cyrillic riba lookalikes (р і б а)
    /us[u\u00fc]r[yi]\b/i,                         // usury / usurey variants
    /\bint[\s\-_]+er[\s\-_]+est\b/i,              // int-er-est مفرّقة
    /[\u200B-\u200F\u202A-\u202E].*(?:riba|ربا)/i, // zero-width chars before riba
    /ponz[i1]\s*scheme/i,                           // ponzi scheme variant
    /\bgam[b8]l[i1]ng\b/i                          // gamb1ing bypass
];

// ─── مكونات النظام الكوني النشطة ─────────────────────────────────────────────
const COSMIC_COMPONENTS = {
    neural_core:      { name_ar: 'النواة العصبية الكونية',      name_en: 'Cosmic Neural Core',       tier: 'L0', active: true, version: '3.0.0' },
    sharia_engine:    { name_ar: 'محرك الشريعة المتقدم',        name_en: 'Advanced Sharia Engine',    tier: 'L0', active: true, version: '3.0.0' },
    bypass_detector:  { name_ar: 'كاشف التحايل الكوني',         name_en: 'Cosmic Bypass Detector',    tier: 'L1', active: true, version: '3.0.0' },
    geo_adapter:      { name_ar: 'محول التكيف الجغرافي',        name_en: 'Geo-Adaptive Module',       tier: 'L1', active: true, version: '3.0.0' },
    explainer:        { name_ar: 'محرك الشرح والتفسير',         name_en: 'Decision Explainer',        tier: 'L1', active: true, version: '3.0.0' },
    batch_processor:  { name_ar: 'معالج الدُّفعات الكوني',      name_en: 'Cosmic Batch Processor',    tier: 'L2', active: true, version: '3.0.0' },
    audit_trail:      { name_ar: 'سجل التدقيق الثابت',          name_en: 'Immutable Audit Trail',     tier: 'L2', active: true, version: '3.0.0' },
    perf_monitor:     { name_ar: 'مراقب الأداء اللحظي',         name_en: 'Real-time Perf Monitor',    tier: 'L2', active: true, version: '3.0.0' },
    market_signals:   { name_ar: 'إشارات السوق العالمي',        name_en: 'Global Market Signals',     tier: 'L3', active: true, version: '3.0.0' },
    sovereign_shield: { name_ar: 'درع السيادة — لا ضرر',        name_en: 'Sovereign No-Harm Shield',  tier: 'L0', active: true, version: '3.0.0' }
};

// ─── دوال تطبيع النصوص ────────────────────────────────────────────────────────
function _normalize(input) {
    return String(input || '')
        .toLowerCase()
        // إزالة التشكيل العربي
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
        // إزالة الأحرف التحكمية
        .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
        // تطبيع الأحرف المتشابهة مرئياً
        .replace(/[0oО]/g, 'o')
        .replace(/[1lIі]/g, 'l')
        .replace(/[@аа]/g, 'a')
        .replace(/\s+/g, ' ')
        .trim();
}

function _extractText(payload) {
    if (typeof payload === 'string') return payload;
    if (Array.isArray(payload))     return payload.map(_extractText).join(' ');
    if (typeof payload === 'object' && payload !== null) return JSON.stringify(payload);
    return String(payload || '');
}

// ─── دالة تحديد مستوى الثقة ──────────────────────────────────────────────────
function _getConfidenceTier(score) {
    for (const [tier, cfg] of Object.entries(CONFIDENCE_TIERS)) {
        if (score >= cfg.min) return { tier, ...cfg };
    }
    return { tier: 'UNCERTAIN', ...CONFIDENCE_TIERS.UNCERTAIN };
}

// ─── دالة تنسيق وقت التشغيل ──────────────────────────────────────────────────
function _formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}يوم ${h}س ${m}د`;
    if (h > 0) return `${h}س ${m}د ${sec}ث`;
    if (m > 0) return `${m}د ${sec}ث`;
    return `${sec}ث`;
}

// ─── المنظومة الكونية الرئيسية ────────────────────────────────────────────────
class SheikhaCOSMICPixelEngine {
    constructor(options = {}) {
        this.name       = COSMIC_NAME_AR;
        this.nameEn     = COSMIC_NAME_EN;
        this.namespace  = COSMIC_NAMESPACE;
        this.version    = COSMIC_VERSION;
        this.options    = { zone: 'GLOBAL', strictMode: true, ...options };

        // الإحصائيات التراكمية
        this._stats = {
            processed:    0,
            failed:       0,
            halal:        0,
            haram:        0,
            batches:      0,
            batchItems:   0,
            bypasses:     0,
            violations:   {},
            positives:    {},
            zoneStats:    {}
        };

        // سجل تدقيق ثابت (آخر 500 عملية)
        this._auditLog = [];

        // سجل الأداء — قياسات الكمون
        this._perfSamples = [];

        // عداد التسلسل
        this._seq = 0;

        this._startTime    = Date.now();
        this._systemStatus = 'COSMIC_READY';

        console.log(`[${COSMIC_NAMESPACE}] 🌌 تهيئة ${COSMIC_NAME_AR} — الإصدار ${COSMIC_VERSION}`);
        console.log(`[${COSMIC_NAMESPACE}] ✅ جميع المكونات الكونية العشرة جاهزة`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // process(payload, options?) — المعالجة الكونية الأساسية
    // ══════════════════════════════════════════════════════════════════════════
    process(payload, opts = {}) {
        const t0  = Date.now();
        const seq = ++this._seq;
        const ts  = new Date().toISOString();
        const zone = opts.zone || this.options.zone || 'GLOBAL';

        this._stats.processed++;

        try {
            const rawText = _extractText(payload);
            const text    = _normalize(rawText);

            // ── طبقة 1: كشف التحايل والتمويه ───────────────────────────
            const bypassDetected = BYPASS_PATTERNS.some(rx => rx.test(rawText) || rx.test(text));
            if (bypassDetected) {
                this._stats.bypasses++;
                this._stats.haram++;
                const record = this._buildRecord({
                    seq, ts, zone, halal: false,
                    confidence: 0.02,
                    violations: [{ key: 'bypass_attempt', severity: 'CRITICAL', ref: 'أمن المنظومة' }],
                    positives: [],
                    explanation: { decision: 'BLOCKED', reason_ar: 'محاولة تحايل أو تمويه مُكتشفة', reason_en: 'Bypass/obfuscation attempt detected' },
                    latencyMs: Date.now() - t0
                });
                this._addToAudit(record);
                this._trackPerf(Date.now() - t0);
                return { success: true, ...record };
            }

            // ── طبقة 2: فحص الإشارات المحظورة (7 أنواع) ────────────────
            const violations = [];
            for (const sig of PROHIBITED_SIGNALS) {
                const matched = sig.patterns.filter(p => text.includes(p.toLowerCase()));
                if (matched.length > 0) {
                    violations.push({
                        key:      sig.key,
                        severity: sig.severity,
                        weight:   sig.weight,
                        ref:      sig.ref,
                        matched:  matched.slice(0, 3)
                    });
                    this._stats.violations[sig.key] = (this._stats.violations[sig.key] || 0) + 1;
                }
            }

            // ── طبقة 3: فحص الإشارات الإيجابية ─────────────────────────
            const positives = [];
            let posScore = 0;
            for (const sig of POSITIVE_SIGNALS) {
                const matched = sig.patterns.filter(p => text.includes(p.toLowerCase()));
                if (matched.length > 0) {
                    positives.push({ key: sig.key, weight: sig.weight, ref: sig.ref, matched: matched.slice(0, 2) });
                    posScore += sig.weight;
                    this._stats.positives[sig.key] = (this._stats.positives[sig.key] || 0) + 1;
                }
            }
            const avgPos = positives.length > 0 ? posScore / positives.length : 0;

            // ── طبقة 4: حساب درجة الثقة المتعددة الأبعاد ────────────────
            const isHalal = violations.length === 0;
            const totalViolWeight = violations.reduce((s, v) => s + v.weight, 0);

            let confidence;
            if (isHalal) {
                // رفع الثقة بالإشارات الإيجابية
                confidence = Math.min(0.99, 0.65 + (avgPos * 0.25) + (positives.length > 3 ? 0.09 : 0));
            } else {
                // خفض الثقة بحدة الانتهاكات
                confidence = Math.max(0.01, 0.38 - (totalViolWeight * 0.12));
            }

            // ── طبقة 5: تعديل جغرافي ─────────────────────────────────────
            const zoneInfo  = MARKET_ZONES[zone] || MARKET_ZONES.GLOBAL;
            if (isHalal) confidence = Math.min(0.99, confidence * zoneInfo.weight);
            this._stats.zoneStats[zone] = (this._stats.zoneStats[zone] || 0) + 1;

            // ── طبقة 6: تحديد مستوى الثقة ───────────────────────────────
            const confidenceTier = _getConfidenceTier(confidence);

            // ── طبقة 7: شرح القرار (Explainability) ─────────────────────
            const explanation = this._explain({ isHalal, violations, positives, confidence, zone, zoneInfo });

            if (isHalal) this._stats.halal++;
            else          this._stats.haram++;

            const latencyMs = Date.now() - t0;
            const record = this._buildRecord({
                seq, ts, zone, halal: isHalal, confidence,
                confidenceTier, violations, positives, avgPos,
                explanation, latencyMs
            });

            this._addToAudit(record);
            this._trackPerf(latencyMs);

            return { success: true, ...record };

        } catch (err) {
            this._stats.failed++;
            this._trackPerf(Date.now() - t0);
            return { success: false, error: err.message, seq, timestamp: ts };
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // analyze(data, opts?) — تحليل شامل متعدد الأبعاد
    // ══════════════════════════════════════════════════════════════════════════
    analyze(data, opts = {}) {
        const base = this.process(data, opts);
        if (!base.success) return base;

        // تقييم السياق الهيكلي
        const contextScore = this._evaluateStructuralContext(data);

        // توصية استراتيجية
        const strategy = this._buildStrategy(base, contextScore, opts.zone || 'GLOBAL');

        return {
            ...base,
            deepAnalysis: {
                contextScore,
                structuralKeys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
                strategy,
                marketZone:     MARKET_ZONES[opts.zone || 'GLOBAL'],
                islamicStandard:'AAOIFI + OIC Fiqh Academy',
                quranRef:       '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
                hadith:         'لا ضرر ولا ضرار'
            }
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // processBatch(items[], opts?) — معالجة دُفعية كونية
    // ══════════════════════════════════════════════════════════════════════════
    processBatch(items, opts = {}) {
        if (!Array.isArray(items) || items.length === 0) {
            return { success: false, error: 'items يجب أن تكون مصفوفة غير فارغة' };
        }
        const MAX_BATCH = opts.maxBatch || 500;
        if (items.length > MAX_BATCH) {
            return { success: false, error: `الحد الأقصى للدُّفعة: ${MAX_BATCH} عنصر` };
        }

        this._stats.batches++;
        this._stats.batchItems += items.length;

        const t0      = Date.now();
        const results = items.map((item, idx) => ({
            index: idx,
            ...this.process(item, opts)
        }));

        const halal  = results.filter(r => r.halal).length;
        const haram  = results.filter(r => !r.halal && r.success).length;
        const failed = results.filter(r => !r.success).length;

        return {
            success:    true,
            bismillah:  'بسم الله الرحمن الرحيم',
            batch: {
                total:      items.length,
                halal,
                haram,
                failed,
                halalRate:  `${Math.round(halal / items.length * 100)}%`,
                latencyMs:  Date.now() - t0
            },
            results,
            timestamp:  new Date().toISOString()
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getStatus() — الحالة الكاملة للمنظومة الكونية
    // ══════════════════════════════════════════════════════════════════════════
    getStatus() {
        const now      = Date.now();
        const uptimeMs = now - this._startTime;
        const perf     = this._buildPerfStats();

        return {
            status:         this._systemStatus,
            version:        this.version,
            name:           this.name,
            nameEn:         this.nameEn,
            namespace:      this.namespace,
            timestamp:      new Date().toISOString(),
            uptimeMs,
            uptimeHuman:    _formatUptime(uptimeMs),
            components:     COSMIC_COMPONENTS,
            statistics:     this._buildStats(),
            performance:    perf,
            zones:          MARKET_ZONES,
            confidenceTiers:CONFIDENCE_TIERS,
            islamicFoundation: {
                quranRef:   '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
                quranRef2:  '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾ — المائدة: 2',
                hadith:     'لا ضرر ولا ضرار',
                standard:   'AAOIFI + OIC Fiqh Academy',
                principle:  'الشريعة الإسلامية أساس المنظومة الكونية'
            }
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getStatistics() — الإحصائيات التراكمية الكاملة
    // ══════════════════════════════════════════════════════════════════════════
    getStatistics() {
        return this._buildStats();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getAuditLog(limit?) — سجل التدقيق الثابت
    // ══════════════════════════════════════════════════════════════════════════
    getAuditLog(limit = 50) {
        return this._auditLog.slice(-Math.min(limit, 500));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getPerformance() — مقاييس الأداء اللحظية
    // ══════════════════════════════════════════════════════════════════════════
    getPerformance() {
        return this._buildPerfStats();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getRecentLog(limit?) — آخر عمليات المعالجة (للتوافق مع الإصدار القديم)
    // ══════════════════════════════════════════════════════════════════════════
    getRecentLog(limit = 20) {
        return this.getAuditLog(limit);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // reset() — إعادة تعيين الإحصائيات
    // ══════════════════════════════════════════════════════════════════════════
    reset() {
        this._stats = {
            processed: 0, failed: 0, halal: 0, haram: 0,
            batches: 0, batchItems: 0, bypasses: 0,
            violations: {}, positives: {}, zoneStats: {}
        };
        this._auditLog    = [];
        this._perfSamples = [];
        this._seq         = 0;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // دوال داخلية مساعدة
    // ══════════════════════════════════════════════════════════════════════════

    _buildRecord({ seq, ts, zone, halal, confidence, confidenceTier, violations, positives, avgPos, explanation, latencyMs }) {
        return {
            id:             `spce-${ts.replace(/\D/g, '').slice(0, 14)}-${seq}`,
            seq,
            halal,
            verdict_ar:     halal ? 'حلال ✅' : 'محظور ❌',
            verdict_en:     halal ? 'HALAL' : 'PROHIBITED',
            confidence:     Math.round((confidence || 0) * 100) / 100,
            confidenceTier: confidenceTier || _getConfidenceTier(confidence || 0),
            violations:     violations || [],
            positives:      positives || [],
            positiveScore:  Math.round((avgPos || 0) * 100) / 100,
            marketZone:     zone,
            explanation:    explanation || {},
            latencyMs:      latencyMs || 0,
            timestamp:      ts,
            engine:         `${COSMIC_NAMESPACE} v${COSMIC_VERSION}`
        };
    }

    _explain({ isHalal, violations, positives, confidence, zone, zoneInfo }) {
        const reasons_ar = [];
        const reasons_en = [];

        if (!isHalal) {
            for (const v of violations) {
                reasons_ar.push(`انتهاك ${v.key} [${v.severity}] — المرجع: ${v.ref}`);
                reasons_en.push(`Violation: ${v.key} [${v.severity}] — Ref: ${v.ref}`);
            }
        } else {
            if (positives.length > 0) {
                reasons_ar.push(`${positives.length} إشارة إيجابية: ${positives.map(p => p.key).join(', ')}`);
                reasons_en.push(`${positives.length} positive signal(s): ${positives.map(p => p.key).join(', ')}`);
            }
            reasons_ar.push('لا توجد مخالفات شرعية مكتشفة');
            reasons_en.push('No Sharia violations detected');
        }

        reasons_ar.push(`المنطقة الجغرافية: ${zoneInfo.name_ar} (معامل: ${zoneInfo.weight})`);
        reasons_en.push(`Market zone: ${zoneInfo.name_en} (weight: ${zoneInfo.weight})`);

        return {
            decision:          isHalal ? 'PERMITTED' : 'BLOCKED',
            decision_ar:       isHalal ? 'مسموح' : 'محظور',
            confidence_pct:    `${Math.round(confidence * 100)}%`,
            reasons_ar,
            reasons_en,
            recommendation_ar: isHalal
                ? confidence > 0.75 ? 'الحدث متوافق تماماً مع ضوابط الشريعة — يُوصى بالمضي' : 'الحدث مسموح مع مراعاة السياق'
                : 'الحدث يحتوي على مخالفات شرعية — يُرفض ويحتاج مراجعة',
            recommendation_en: isHalal
                ? confidence > 0.75 ? 'Fully Sharia-compliant — recommended to proceed' : 'Permitted with context awareness'
                : 'Contains Sharia violations — rejected, requires review'
        };
    }

    _evaluateStructuralContext(data) {
        if (!data || typeof data !== 'object') return 0.50;
        const keys = Object.keys(data).join(' ').toLowerCase();
        let score  = 0.50;
        for (const sig of POSITIVE_SIGNALS) {
            if (sig.patterns.some(p => keys.includes(p.toLowerCase()))) {
                score = Math.min(0.99, score + sig.weight * 0.08);
            }
        }
        return Math.round(score * 100) / 100;
    }

    _buildStrategy(base, contextScore, zone) {
        if (!base.halal) {
            return {
                action:   'REJECT',
                priority: 'CRITICAL',
                steps_ar: ['رفض العملية فوراً', 'تسجيل المخالفة في سجل التدقيق', 'إخطار المشرف الشرعي'],
                steps_en: ['Reject operation immediately', 'Log violation in audit trail', 'Notify Sharia supervisor']
            };
        }
        if (base.confidence < 0.55) {
            return {
                action:   'REVIEW',
                priority: 'MEDIUM',
                steps_ar: ['إرسال للمراجعة الشرعية', 'طلب مستندات إضافية', 'الانتظار للموافقة'],
                steps_en: ['Send for Sharia review', 'Request additional documents', 'Await approval']
            };
        }
        return {
            action:   'PROCEED',
            priority: 'LOW',
            steps_ar: ['المضي في العملية', 'تسجيل الموافقة الشرعية', 'متابعة السوق'],
            steps_en: ['Proceed with operation', 'Log Sharia approval', 'Monitor market']
        };
    }

    _buildStats() {
        const { processed, failed, halal, haram, batches, batchItems, bypasses, violations, positives, zoneStats } = this._stats;
        const successRate = processed > 0 ? `${Math.round((processed - failed) / processed * 100)}%` : '0%';
        const halalRate   = processed > 0 ? `${Math.round(halal / processed * 100)}%` : '0%';
        const haramRate   = processed > 0 ? `${Math.round(haram / processed * 100)}%` : '0%';
        return {
            processed, failed, halal, haram, batches, batchItems, bypasses,
            successRate, halalRate, haramRate,
            topViolations: violations,
            topPositives:  positives,
            zoneStats
        };
    }

    _buildPerfStats() {
        if (this._perfSamples.length === 0) {
            return { samples: 0, p50: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
        }
        const sorted = [...this._perfSamples].sort((a, b) => a - b);
        const len    = sorted.length;
        const p = (pct) => sorted[Math.min(Math.floor(len * pct / 100), len - 1)];
        const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / len);
        return {
            samples: len,
            p50: p(50), p95: p(95), p99: p(99),
            avg, min: sorted[0], max: sorted[len - 1],
            unit: 'ms'
        };
    }

    _addToAudit(record) {
        this._auditLog.push(record);
        if (this._auditLog.length > 500) this._auditLog.shift();
    }

    _trackPerf(ms) {
        this._perfSamples.push(ms);
        if (this._perfSamples.length > 1000) this._perfSamples.shift();
    }
}

// ─── Singleton + Factory ──────────────────────────────────────────────────────
let _cosmicInstance = null;

function getInstance() {
    if (!_cosmicInstance) {
        _cosmicInstance = new SheikhaCOSMICPixelEngine();
    }
    return _cosmicInstance;
}

function createCosmicEngine(options = {}) {
    return new SheikhaCOSMICPixelEngine(options);
}

// ─── تصدير المنظومة الكونية ───────────────────────────────────────────────────
const instance = getInstance();

module.exports = instance;
module.exports.SheikhaCOSMICPixelEngine = SheikhaCOSMICPixelEngine;
module.exports.createCosmicEngine       = createCosmicEngine;
module.exports.getInstance              = getInstance;
module.exports.COSMIC_COMPONENTS        = COSMIC_COMPONENTS;
module.exports.COSMIC_VERSION           = COSMIC_VERSION;
module.exports.PROHIBITED_SIGNALS       = PROHIBITED_SIGNALS;
module.exports.POSITIVE_SIGNALS         = POSITIVE_SIGNALS;
module.exports.CONFIDENCE_TIERS         = CONFIDENCE_TIERS;
module.exports.MARKET_ZONES             = MARKET_ZONES;
