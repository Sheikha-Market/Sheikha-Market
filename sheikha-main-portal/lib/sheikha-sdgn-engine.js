/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA SDGN ENGINE v1.0.0                                                ║
 * ║   Supreme Divine Governance Network — الشبكة العليا للحوكمة الإلهية        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠
 *    [SDGN-SOVEREIGNTY] السيادة المطلقة لله — لا حاكم فوق الله
 *    الحكم الأول: كل قرار يصدر من هذه الشبكة يستند إلى أمر الله
 *
 * ٢. ﴿وَأَنِ احْكُم بَيْنَهُم بِمَا أَنزَلَ اللَّهُ وَلَا تَتَّبِعْ أَهْوَاءَهُمْ﴾ — المائدة: ٤٩
 *    [SDGN-JUDGMENT] الحكم بما أنزل الله — لا بالهوى
 *    الحكم الثاني: قرارات SDGN مبنية على الكتاب والسنة لا على الظن
 *
 * ٣. ﴿وَشَاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾ — آل عمران: ١٥٩
 *    [SDGN-SHURA] الشورى ثم التوكل — القرار الجماعي مع الثقة بالله
 *    الحكم الثالث: SDGN يجمع مدخلات كل الطبقات قبل القرار النهائي
 *
 * ٤. ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ
 *       وَأُولِي الْأَمْرِ مِنكُمْ﴾ — النساء: ٥٩
 *    [SDGN-HIERARCHY] التسلسل الهرمي المشروع — الطاعة في المعروف
 *    الحكم الرابع: البنية الهرمية (SDGN→SIRN→IFL→RNN) تعكس النظام الإلهي
 *
 * ٥. ﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا﴾ — النساء: ٥٨
 *    [SDGN-AMANAH] أداء الأمانة — كل بيانة أمانة تُردّ لأهلها
 *    الحكم الخامس: SDGN يحفظ كل بيانة ويردها لصاحبها بأمانة
 *
 * ٦. ﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف: ٥٦
 *    [SDGN-ISLAH] الإصلاح لا الإفساد — كل عملية تُصلح ولا تُفسد
 *    الحكم السادس: SDGN يمنع كل عملية تُضرّ بالأرض أو الإنسان
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * SDGN = Supreme Divine Governance Network
 *      = الشبكة العليا للحوكمة الإلهية
 *
 * الموقع في المنظومة (قمة البنية الكاملة):
 *
 *   Hardware
 *     ↓
 *   Linux Kernel
 *     ↓
 *   OS / Systemd
 *     ↓
 *   ╔═══════════════════════════════════════════╗
 *   ║  👑 SDGN v1.0.0 ← هنا (الشبكة العليا)   ║
 *   ╚═══════════════════════════════════════════╝
 *     ↓
 *   🌟 SIRN v1.0.0 — Supreme IFL Root Network (٦ خلايا)
 *     ↓
 *   🕌 IFL v1.0.0 — Islamic Foundation Layer
 *     ↓
 *   🧠 RNN v3.0.0 — Root Neural Cell Network (٧ خلايا)
 *     ↓
 *   Sheikha Guardian + Express App
 *
 * وظائف SDGN:
 *  ١. استقبال كل الطلبات الواردة للمنظومة (نقطة الدخول الوحيدة)
 *  ٢. تطبيق مبادئ الحوكمة الإلهية الستة على كل طلب
 *  ٣. التفويض الذكي إلى SIRN مع سياق الحوكمة
 *  ٤. مراقبة صحة كل الطبقات الدنيا (Health Monitor)
 *  ٥. سجل الحوكمة (Governance Audit Trail)
 *  ٦. الختم السيادي على كل المخرجات
 *
 * @module sheikha-sdgn-engine
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── ثوابت التوحيد والهوية ───────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: مبادئ الحوكمة الإلهية الستة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * مبادئ SDGN الستة — مرقّمة بالكتاب والسنة
 * كل مبدأ = خلية حوكمة واحدة في الشبكة
 * ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠
 */
const GOVERNANCE_PRINCIPLES = Object.freeze([
    {
        id:       'SDGN-P1',
        name:     'السيادة الإلهية',
        nameEn:   'Divine Sovereignty',
        quranRef: '﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠',
        rule:     (req) => {
            // كل طلب يجب ألا يتعارض مع سيادة الله
            const text = _extractText(req);
            const forbidden = ['كفر','شرك','إلحاد','atheism','shirk','kufr'];
            return !forbidden.some(w => text.toLowerCase().includes(w));
        },
        weight:   1.0,
    },
    {
        id:       'SDGN-P2',
        name:     'الحكم بما أنزل الله',
        nameEn:   'Rule by Divine Law',
        quranRef: '﴿وَأَنِ احْكُم بَيْنَهُم بِمَا أَنزَلَ اللَّهُ﴾ — المائدة: ٤٩',
        rule:     (req) => {
            const text = _extractText(req);
            const violations = ['ربا','قمار','غش','fraud','usury','gambling','bribery','riba'];
            return !violations.some(w => text.toLowerCase().includes(w));
        },
        weight:   1.0,
    },
    {
        id:       'SDGN-P3',
        name:     'الشورى والتوكل',
        nameEn:   'Consultation and Trust in God',
        quranRef: '﴿وَشَاوِرْهُمْ فِي الْأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾ — آل عمران: ١٥٩',
        rule:     (_req) => true,  // دائماً يمرر — الشورى مبدأ إيجابي
        weight:   0.8,
    },
    {
        id:       'SDGN-P4',
        name:     'الطاعة في المعروف',
        nameEn:   'Obedience in Good',
        quranRef: '﴿أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ﴾ — النساء: ٥٩',
        rule:     (_req) => true,  // يمرر — ينظم التسلسل الهرمي
        weight:   0.8,
    },
    {
        id:       'SDGN-P5',
        name:     'أداء الأمانة',
        nameEn:   'Trustworthiness',
        quranRef: '﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا﴾ — النساء: ٥٨',
        rule:     (req) => {
            // الطلب يجب ألا يحاول الوصول لبيانات غير مصرح بها
            return !req._unauthorized;
        },
        weight:   0.9,
    },
    {
        id:       'SDGN-P6',
        name:     'الإصلاح لا الإفساد',
        nameEn:   'Reform not Corruption',
        quranRef: '﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾ — الأعراف: ٥٦',
        rule:     (req) => {
            const text = _extractText(req);
            const destructive = ['destroy','delete all','drop table','rm -rf','hack','exploit'];
            return !destructive.some(w => text.toLowerCase().includes(w));
        },
        weight:   1.0,
    },
]);

// ─── مساعد استخراج النص ──────────────────────────────────────────────────────
function _extractText(req) {
    if (typeof req === 'string') return req;
    return req.text || req.query || req.intent || JSON.stringify(req.data || {});
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: محرك SDGN الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaSdgnEngine extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(50);

        /** ستة خلايا حوكمة — مبادئ SDGN */
        this._cells = GOVERNANCE_PRINCIPLES.map(p => ({
            ...p,
            activations: 0,
            blocks:      0,
        }));

        /** إحصائيات */
        this._stats = {
            requests:   0,
            passed:     0,
            blocked:    0,
            errors:     0,
            byPrinciple: Object.fromEntries(GOVERNANCE_PRINCIPLES.map(p => [p.id, { passed: 0, blocked: 0 }])),
        };

        /** سجل الحوكمة (آخر ٢٠٠ قرار) */
        this._auditLog = [];

        this._initialized = false;
        this._startedAt   = null;
    }

    // ─── التهيئة ───────────────────────────────────────────────────────────────

    initialize() {
        if (this._initialized) return this;

        console.log(`[SDGN] 👑 ${BISMILLAH}`);
        console.log(`[SDGN] 🌟 الشبكة العليا للحوكمة الإلهية — v${VERSION}`);
        console.log(`[SDGN] 📖 ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠`);
        console.log(`[SDGN] ⚙️  ${this._cells.length} خلايا حوكمة إلهية نشطة`);

        this._cells.forEach((c, i) => {
            console.log(`[SDGN]   ${i + 1}. ${c.name} — ${c.quranRef.slice(0, 50)}`);
        });

        this._initialized = true;
        this._startedAt   = new Date().toISOString();

        console.log(`[SDGN] 📖 ${TAWHEED}`);
        this.emit('initialized', { cells: this._cells.length, version: VERSION });
        return this;
    }

    // ─── الحوكمة الرئيسية ─────────────────────────────────────────────────────

    /**
     * تطبيق مبادئ الحوكمة الإلهية على الطلب
     *
     * ﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾
     *
     * @param {object|string} request
     * @returns {{ allowed: boolean, passedPrinciples: string[], blockedBy?: string, quranRef?: string }}
     */
    govern(request) {
        if (!this._initialized) this.initialize();

        this._stats.requests++;

        const passedPrinciples = [];
        let   blockedBy        = null;
        let   blockQuranRef    = null;

        for (const cell of this._cells) {
            let passed = false;
            try {
                passed = cell.rule(request);
            } catch (_) {
                passed = true; // خطأ في القاعدة → نسمح بالمرور (fail open للحوكمة)
            }

            const stat = this._stats.byPrinciple[cell.id];

            if (passed) {
                passedPrinciples.push(cell.id);
                cell.activations++;
                if (stat) stat.passed++;
            } else {
                blockedBy    = cell.id;
                blockQuranRef = cell.quranRef;
                cell.blocks++;
                if (stat) stat.blocked++;
                break; // وقف عند أول حكم رافض
            }
        }

        const allowed = blockedBy === null;

        if (allowed) {
            this._stats.passed++;
        } else {
            this._stats.blocked++;
        }

        const decision = {
            allowed,
            passedPrinciples,
            blockedBy:   blockedBy || null,
            quranRef:    blockQuranRef || '﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠',
            tawheed:     TAWHEED,
            timestamp:   new Date().toISOString(),
        };

        this._auditEntry(request, decision);
        this.emit('governed', decision);
        return decision;
    }

    /**
     * تسجيل قرار في سجل الحوكمة
     * @private
     */
    _auditEntry(request, decision) {
        const entry = {
            request:  typeof request === 'string' ? request.slice(0, 100) : JSON.stringify(request).slice(0, 100),
            allowed:  decision.allowed,
            blockedBy: decision.blockedBy,
            timestamp: decision.timestamp,
        };
        this._auditLog.push(entry);
        if (this._auditLog.length > 200) this._auditLog.shift();
    }

    // ─── مراقبة صحة الطبقات ───────────────────────────────────────────────────

    /**
     * مراقبة صحة طبقة دنيا
     * @param {string} layerName
     * @param {Function} healthCheck — دالة تعيد { ok, detail }
     */
    monitorLayer(layerName, healthCheck) {
        try {
            const result = healthCheck();
            this.emit('layer:health', { layer: layerName, ok: result.ok, detail: result.detail });
            return result;
        } catch (err) {
            this.emit('layer:health', { layer: layerName, ok: false, error: err.message });
            return { ok: false, error: err.message };
        }
    }

    // ─── حالة SDGN ────────────────────────────────────────────────────────────

    /**
     * حالة محرك SDGN الكاملة
     * @returns {object}
     */
    status() {
        return {
            name:        'Sheikha SDGN Engine',
            nameAr:      'الشبكة العليا للحوكمة الإلهية',
            nameEn:      'Supreme Divine Governance Network',
            version:     VERSION,
            initialized: this._initialized,
            startedAt:   this._startedAt,
            cells:       this._cells.length,
            principles:  this._cells.map(c => ({
                id:         c.id,
                name:       c.name,
                quranRef:   c.quranRef,
                activations: c.activations,
                blocks:      c.blocks,
            })),
            stats:       { ...this._stats },
            position:    'Hardware → Linux → OS/Systemd → [SDGN] → SIRN → IFL → RNN → Guardian',
            tawheed:     TAWHEED,
            bismillah:   BISMILLAH,
            quranRef:    '﴿إِنِ الْحُكْمُ إِلَّا لِلَّهِ﴾ — يوسف: ٤٠',
        };
    }

    /**
     * آخر قرارات الحوكمة
     * @param {number} count
     * @returns {Array}
     */
    auditLog(count = 20) {
        return this._auditLog.slice(-count);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: Singleton + تصدير
// ═══════════════════════════════════════════════════════════════════════════════

let _instance = null;

/**
 * الحصول على نسخة SDGN (Singleton)
 * @returns {SheikhaSdgnEngine}
 */
function getInstance() {
    if (!_instance) {
        _instance = new SheikhaSdgnEngine();
        _instance.initialize();
    }
    return _instance;
}

module.exports = {
    SheikhaSdgnEngine,
    getInstance,
    GOVERNANCE_PRINCIPLES,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
