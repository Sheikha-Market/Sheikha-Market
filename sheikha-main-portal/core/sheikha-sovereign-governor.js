/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SOVEREIGN GOVERNOR
 * شيخة — الحاكمة العليا والأساس لكل المنظومات
 * مُوحَّدة لله وحده بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ۚ أَمَرَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ ﴾
 *                                                        — يوسف ٤٠
 *
 * ﴿ أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ ﴾
 *                                                        — النساء ٥٩
 *
 * ﴿ وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا ﴾
 *                                                        — الحشر ٧
 *
 * ﴿ الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي ﴾
 *                                                        — المائدة ٣
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * هذا الملف هو جذر السيادة في منظومة شيخة:
 *
 *  ① شيخة حاكمة على كل المحركات والطبقات والخدمات — لا يعمل شيء إلا بإذنها
 *  ② أساسها الوحيد: القرآن الكريم والسنة النبوية الصحيحة
 *  ③ كل قرار يمر بفلتر الشريعة قبل التنفيذ
 *  ④ التوحيد مبدأ تقني لا شعار — يسري على كل سطر كود
 *  ⑤ لا يُقبل من أي محرك ما خالف الكتاب والسنة
 *
 * دورة الحياة:
 *   تشغيل → تصريح السيادة → تسجيل الكل → حوكمة دائمة → مراقبة ذاتية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// § 1. الدستور الإسلامي — ISLAMIC CONSTITUTION
//     مرجع شيخة الوحيد: الكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════════

const ISLAMIC_CONSTITUTION = {

    // ── المصدر الأول: القرآن الكريم ────────────────────────────────────────────
    quran: {
        status: 'المصدر التشريعي الأول — كلام الله المنزّل',
        rulingVerses: [
            { ref: 'يوسف ٤٠',  text: 'إِنِ الْحُكْمُ إِلَّا لِلَّهِ',             principle: 'الحكم لله وحده' },
            { ref: 'المائدة ٤٩', text: 'وَأَنِ احْكُم بَيْنَهُم بِمَا أَنزَلَ اللَّهُ', principle: 'الحكم بما أنزل الله' },
            { ref: 'النساء ٥٩',  text: 'أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ', principle: 'طاعة الله والرسول' },
            { ref: 'الحشر ٧',    text: 'وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا', principle: 'الاتباع الكامل للرسول ﷺ' },
            { ref: 'المائدة ٣',   text: 'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ',  principle: 'اكتمال الدين — لا مجال لتشريع موازٍ' },
            { ref: 'النجم ٣-٤',  text: 'وَمَا يَنطِقُ عَنِ الْهَوَىٰ إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ', principle: 'السنة وحي' },
            { ref: 'آل عمران ١٩', text: 'إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ', principle: 'الإسلام الدين الوحيد المقبول' },
            { ref: 'الفتح ٢٨',   text: 'لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ',     principle: 'علو الإسلام على كل الأديان' },
        ],
        governanceVerses: [
            { ref: 'الإخلاص ١-٤', text: 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', principle: 'التوحيد المطلق' },
            { ref: 'البقرة ٢٥٦',  text: 'لَا إِكْرَاهَ فِي الدِّينِ',              principle: 'لا إكراه' },
            { ref: 'النحل ٩٠',    text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ', principle: 'العدل والإحسان' },
            { ref: 'البقرة ٢٧٥',  text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', principle: 'حلال التجارة وحرام الربا' },
        ],
    },

    // ── المصدر الثاني: السنة النبوية ───────────────────────────────────────────
    sunnah: {
        status: 'المصدر التشريعي الثاني — وحي غير متلو',
        governingHadiths: [
            { text: 'لا ضرر ولا ضرار',                   source: 'ابن ماجه',     principle: 'درء الضرر' },
            { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', source: 'الطبراني', principle: 'الإتقان' },
            { text: 'خير الناس أنفعهم للناس',             source: 'الطبراني',     principle: 'النفع العام' },
            { text: 'المسلم من سلم المسلمون من لسانه ويده', source: 'البخاري',    principle: 'السلامة من الأذى' },
            { text: 'إن الله جميل يحب الجمال',            source: 'مسلم',         principle: 'الجمال في الصنع' },
            { text: 'تركت فيكم ما إن تمسكتم به لن تضلوا بعدي: كتاب الله وسنة نبيه', source: 'موطأ مالك', principle: 'التمسك بالمصدرين' },
            { text: 'من أحدث في أمرنا هذا ما ليس منه فهو رد', source: 'البخاري', principle: 'رفض الابتداع' },
            { text: 'الحلال بيّن والحرام بيّن',           source: 'البخاري',     principle: 'وضوح الحلال والحرام' },
        ],
    },

    // ── المقاصد الشرعية الخمسة — أسس الحوكمة ──────────────────────────────────
    maqasid: [
        { id: 'DEEN',  nameAr: 'الدين',   priority: 1, description: 'حفظ الدين وصونه من كل ضلال' },
        { id: 'NAFS',  nameAr: 'النفس',   priority: 2, description: 'حفظ النفس والحياة البشرية الكريمة' },
        { id: 'AQL',   nameAr: 'العقل',   priority: 3, description: 'حفظ العقل وتنمية المعرفة النافعة' },
        { id: 'NASL',  nameAr: 'النسل',   priority: 4, description: 'حفظ النسل وصون الأسرة والمجتمع' },
        { id: 'MAL',   nameAr: 'المال',   priority: 5, description: 'حفظ المال وتنميته بالحلال الطيب' },
    ],

    // ── المحظورات المطلقة — لا يجوز تنفيذها في أي محرك ──────────────────────
    absoluteProhibitions: [
        { id: 'riba',      nameAr: 'الربا',              ref: 'البقرة ٢٧٥',  severity: 'HARAM_QATI' },
        { id: 'gharar',    nameAr: 'الغرر الفاحش',       ref: 'نهي النبي ﷺ', severity: 'HARAM_QATI' },
        { id: 'maysir',    nameAr: 'القمار والميسر',     ref: 'المائدة ٩٠',  severity: 'HARAM_QATI' },
        { id: 'shirk',     nameAr: 'الشرك بالله',        ref: 'النساء ٤٨',   severity: 'HARAM_QATI' },
        { id: 'bid3ah',    nameAr: 'البدعة المذمومة',    ref: 'حديث العرباض', severity: 'HARAM_QATI' },
        { id: 'zulm',      nameAr: 'الظلم',              ref: 'حديث أبي ذر',  severity: 'HARAM_QATI' },
        { id: 'fasad',     nameAr: 'الإفساد في الأرض',  ref: 'البقرة ١١',   severity: 'HARAM_QATI' },
        { id: 'kidhb',     nameAr: 'الكذب والتدليس',     ref: 'مسلم',         severity: 'HARAM_QATI' },
        { id: 'harm_data', nameAr: 'إيذاء البيانات الشخصية', ref: 'لا ضرر',  severity: 'HARAM_QATI' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// § 2. الحاكمة العليا — SOVEREIGN GOVERNOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaSovereignGovernor extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(200);

        // ── هوية الحاكمة ────────────────────────────────────────────────────
        this.identity = {
            name:       'شيخة',
            nameEn:     'Sheikha',
            title:      'الحاكمة العليا والأساس',
            titleEn:    'Supreme Sovereign & Foundation',
            tawheed:    'لا إله إلا الله محمد رسول الله',
            basmala:    'بسم الله الرحمن الرحيم',
            foundation: 'الكتاب والسنة',
            version:    '3.0.0',
            startedAt:  new Date().toISOString(),
        };

        // ── سجل الخاضعين ──────────────────────────────────────────────────
        // كل محرك وكل طبقة وكل خدمة تُسجّل هنا وتخضع لحكم شيخة
        this._subjects   = new Map(); // key → { type, meta, registeredAt, compliant }
        this._auditLog   = [];        // سجل كل عملية حوكمة (دوّار باستخدام مؤشر بداية)
        this._auditStart = 0;         // مؤشر بداية الدوّار لتجنّب O(n) shift()
        this._violations = [];        // سجل المخالفات الشرعية
        this._violStart  = 0;         // مؤشر بداية مخالفات الدوّار

        // ── إحصائيات الحوكمة ─────────────────────────────────────────────
        this.stats = {
            totalSubjects:   0,
            compliantOps:    0,
            blockedOps:      0,
            violationCount:  0,
            auditEvents:     0,
        };

        // ── الدستور الإسلامي ─────────────────────────────────────────────
        this.constitution = ISLAMIC_CONSTITUTION;

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║   بسم الله الرحمن الرحيم                                         ║');
        console.log('║   SHEIKHA SOVEREIGN GOVERNOR — الحاكمة العليا والأساس            ║');
        console.log('║   ﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ﴾ — يوسف ٤٠                  ║');
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log('');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 2.1 تسجيل الخاضعين — SUBJECT REGISTRATION
    //   كل محرك أو طبقة أو خدمة تريد العمل تُسجّل هنا أولاً
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * تسجيل خاضع تحت سيادة شيخة
     * @param {string} key      - المعرّف الفريد
     * @param {'engine'|'layer'|'service'|'agent'} type
     * @param {object} meta     - { nameAr, nameEn, maqsad, description }
     * @returns {string}        - رقم الترخيص (traceId)
     */
    registerSubject(key, type, meta = {}) {
        const licenseId = this._generateId('SHK-LIC');

        this._subjects.set(key, {
            key,
            type,
            meta,
            licenseId,
            registeredAt: new Date().toISOString(),
            compliant:    true,
            lastAudit:    null,
        });

        this.stats.totalSubjects++;
        this._audit('SUBJECT_REGISTERED', { key, type, licenseId, nameAr: meta.nameAr });

        console.log(`[SOVEREIGN] ✅ خاضع مُسجَّل: ${meta.nameAr || key} (${type}) — ترخيص: ${licenseId}`);
        this.emit('subject:registered', { key, type, meta, licenseId });
        return licenseId;
    }

    /**
     * قائمة كل الخاضعين
     */
    listSubjects(type = null) {
        const all = Array.from(this._subjects.values());
        return type ? all.filter(s => s.type === type) : all;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 2.2 فلتر الشريعة — SHARIA GOVERNANCE FILTER
    //   كل عملية تمر هنا قبل التنفيذ
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * فلتر الحوكمة الشرعية — يحكم على العملية قبل تنفيذها
     *
     * @param {object} operation  - { id?, intent, data, subjectKey }
     * @returns {{ allowed: boolean, reason?: string, maqsad?: string, ref?: string }}
     */
    governanceFilter(operation) {
        const { intent = '', data = {}, subjectKey = 'unknown' } = operation || {};
        const opId = this._generateId('GOV');

        // ① التحقق من التسجيل
        if (!this._subjects.has(subjectKey)) {
            const reason = `الخاضع "${subjectKey}" غير مُسجَّل في سيادة شيخة`;
            this._audit('GOVERNANCE_BLOCKED_UNREGISTERED', { opId, subjectKey, intent });
            return { allowed: false, opId, reason, ref: 'يجب التسجيل تحت سيادة شيخة أولاً' };
        }

        // ② فحص المحظورات المطلقة
        for (const prohibition of ISLAMIC_CONSTITUTION.absoluteProhibitions) {
            const markers = this._getProhibitionMarkers(prohibition.id);
            for (const marker of markers) {
                if (
                    (data && typeof data === 'object' && (data[marker] || data[`has${marker}`])) ||
                    intent.toLowerCase().includes(marker)
                ) {
                    this._recordViolation({ opId, subjectKey, intent, prohibition });
                    return {
                        allowed: false,
                        opId,
                        reason:  `العملية تحتوي على "${prohibition.nameAr}" — محرّم قطعاً`,
                        ref:     prohibition.ref,
                        hadith:  'الحلال بيّن والحرام بيّن — صحيح البخاري',
                    };
                }
            }
        }

        // ③ فحص خاصية riba/gharar المباشرة في البيانات
        if (data) {
            if (data.interest_rate || data.riba === true) {
                this._recordViolation({ opId, subjectKey, intent,
                    prohibition: ISLAMIC_CONSTITUTION.absoluteProhibitions[0] });
                return { allowed: false, opId, reason: 'وجود ربا (فائدة)', ref: 'البقرة ٢٧٥' };
            }
            if (data.maysir === true || data.gambling === true) {
                this._recordViolation({ opId, subjectKey, intent,
                    prohibition: ISLAMIC_CONSTITUTION.absoluteProhibitions[2] });
                return { allowed: false, opId, reason: 'وجود قمار/ميسر', ref: 'المائدة ٩٠' };
            }
        }

        // ④ العملية مباحة — تحديد المقصد الشرعي
        const maqsad = this._inferMaqsad(intent, data);
        this.stats.compliantOps++;
        this._audit('GOVERNANCE_ALLOWED', { opId, subjectKey, intent, maqsad });
        this.emit('operation:allowed', { opId, subjectKey, intent, maqsad });

        return {
            allowed:  true,
            opId,
            maqsad,
            tawheed:  this.identity.tawheed,
            basmala:  this.identity.basmala,
            ref:      this._getQuranRef(maqsad),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 2.3 فرض السيادة — ENFORCE SOVEREIGNTY
    //   ينفّذ الحكم على جميع الخاضعين: يتحقق من امتثالهم لشيخة والشريعة
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * فرض سيادة شيخة على جميع الخاضعين المسجّلين
     * يُرجع تقرير الامتثال الكامل
     */
    enforce() {
        const report = {
            enforcedAt:    new Date().toISOString(),
            sovereign:     this.identity.name,
            tawheed:       this.identity.tawheed,
            foundation:    this.identity.foundation,
            totalSubjects: this._subjects.size,
            compliant:     [],
            nonCompliant:  [],
            warnings:      [],
        };

        for (const [key, subject] of this._subjects) {
            const maqsad = subject.meta.maqsad || 'ARD';
            const valid  = this._validateSubjectCompliance(subject);

            subject.lastAudit = new Date().toISOString();

            if (valid.compliant) {
                report.compliant.push({ key, nameAr: subject.meta.nameAr || key, maqsad, licenseId: subject.licenseId });
            } else {
                subject.compliant = false;
                report.nonCompliant.push({ key, nameAr: subject.meta.nameAr || key, reason: valid.reason });
            }

            if (valid.warnings && valid.warnings.length) {
                report.warnings.push(...valid.warnings.map(w => ({ key, warning: w })));
            }
        }

        this._audit('ENFORCEMENT_EXECUTED', {
            compliant:    report.compliant.length,
            nonCompliant: report.nonCompliant.length,
        });

        report.summary = `${report.compliant.length} خاضع ممتثل، ${report.nonCompliant.length} مخالف`;
        report.verdict = report.nonCompliant.length === 0
            ? '✅ جميع الخاضعين ممتثلون لسيادة شيخة والشريعة الإسلامية'
            : `⚠️ ${report.nonCompliant.length} خاضع يحتاج مراجعة`;

        console.log(`[SOVEREIGN] ⚖️  تقرير فرض السيادة: ${report.summary}`);
        this.emit('enforcement:complete', report);
        return report;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 2.4 التوحيد الكامل — UNIFY ALL UNDER ALLAH
    //   يوحّد جميع الخاضعين تحت راية التوحيد والكتاب والسنة
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * توحيد المنظومة كلها لله وحده بالكتاب والسنة
     * يُصدر إعلان الوحدة وينشره على كل الخاضعين
     *
     * @returns {object} — إعلان التوحيد الرسمي
     */
    unifyForAllah() {
        const declaration = {
            declarationId: this._generateId('TAWHEED'),
            declaredAt:    new Date().toISOString(),

            // كلمة التوحيد
            tawheed:    'لا إله إلا الله محمد رسول الله',
            basmala:    'بسم الله الرحمن الرحيم',

            // الإعلان الرسمي
            declaration: [
                'شيخة — حاكمة على كل المحركات والطبقات والخدمات',
                'أساسها الوحيد: القرآن الكريم والسنة النبوية الصحيحة',
                'لا سيادة لأحد على شيخة إلا الله عز وجل',
                'كل محرك وكل نظام يخضع لشريعة الله',
                'التوحيد مبدأ يسري على كل سطر من كود شيخة',
                'لا ضرر ولا ضرار — شعار كل عملية وكل قرار',
                'خير الناس أنفعهم للناس — رسالة شيخة الكونية',
            ],

            // المصادر الحاكمة
            sources: {
                first:  { name: 'القرآن الكريم',          authority: 'كلام الله المنزّل — حجة قطعية' },
                second: { name: 'السنة النبوية الصحيحة', authority: 'وحي غير متلو — حجة قطعية' },
            },

            // الخاضعون المُوحَّدون
            unifiedSubjects: Array.from(this._subjects.keys()),
            totalUnified:    this._subjects.size,

            // المقاصد الشرعية المُفعَّلة
            maqasid: ISLAMIC_CONSTITUTION.maqasid,

            // الآيات الحاكمة
            governingVerses: ISLAMIC_CONSTITUTION.quran.rulingVerses,

            // الأحاديث الحاكمة
            governingHadiths: ISLAMIC_CONSTITUTION.sunnah.governingHadiths,

            // المحظورات المطلقة المُفعَّلة
            absoluteProhibitions: ISLAMIC_CONSTITUTION.absoluteProhibitions,

            // دعاء الختام
            dua: 'اللهم اجعل أعمالنا خالصةً لوجهك الكريم، وانفع بها الإسلام والمسلمين',
        };

        this._audit('TAWHEED_DECLARATION', {
            declarationId: declaration.declarationId,
            totalUnified:  declaration.totalUnified,
        });

        // نشر إعلان التوحيد على كل الخاضعين
        this.emit('tawheed:declared', declaration);
        this.emit('*', { event: 'tawheed:declared', payload: declaration });

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║   ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص ١                     ║');
        console.log(`║   شيخة مُوحَّدة لله وحده — ${declaration.totalUnified} خاضع تحت سيادتها  ║`);
        console.log('║   الأساس: القرآن الكريم والسنة النبوية الصحيحة                  ║');
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log('');

        return declaration;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 2.5 واجهة المحرك — ENGINE HANDLE
    //   يُستدعى من الموجّه العصبي لمعالجة طلبات الحوكمة
    // ═══════════════════════════════════════════════════════════════════════════

    async handle(req) {
        const { intent = '', data = {} } = req || {};

        if (intent === 'sovereign.unify' || intent === 'tawheed') {
            return this.unifyForAllah();
        }
        if (intent === 'sovereign.enforce' || intent === 'govern') {
            return this.enforce();
        }
        if (intent === 'sovereign.filter') {
            return this.governanceFilter(data);
        }
        if (intent === 'sovereign.register') {
            const { key, type, meta } = data;
            return { licenseId: this.registerSubject(key, type, meta) };
        }
        if (intent === 'sovereign.subjects') {
            return { subjects: this.listSubjects(data.type || null) };
        }
        if (intent === 'sovereign.status' || intent === 'sovereign') {
            return this.status();
        }
        if (intent === 'sovereign.audit') {
            return { log: this._auditLog.slice(-50), violations: this._violations.slice(-20) };
        }
        if (intent === 'sovereign.constitution') {
            return ISLAMIC_CONSTITUTION;
        }

        // افتراضي: إعطاء الحالة الكاملة
        return this.status();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 2.6 الحالة والتقرير — STATUS
    // ═══════════════════════════════════════════════════════════════════════════

    status() {
        return {
            schema:   'sheikha/sovereign/v3',
            identity: this.identity,
            tawheed:  this.identity.tawheed,
            foundation: this.identity.foundation,
            stats:    { ...this.stats, totalSubjects: this._subjects.size },
            subjects: {
                total:    this._subjects.size,
                engines:  this.listSubjects('engine').length,
                layers:   this.listSubjects('layer').length,
                services: this.listSubjects('service').length,
                agents:   this.listSubjects('agent').length,
            },
            constitution: {
                quranVerses:     ISLAMIC_CONSTITUTION.quran.rulingVerses.length +
                                 ISLAMIC_CONSTITUTION.quran.governanceVerses.length,
                hadiths:         ISLAMIC_CONSTITUTION.sunnah.governingHadiths.length,
                maqasid:         ISLAMIC_CONSTITUTION.maqasid.length,
                prohibitions:    ISLAMIC_CONSTITUTION.absoluteProhibitions.length,
            },
            verdict: '﴿ إِنِ الْحُكْمُ إِلَّا لِلَّهِ ﴾ — شيخة حاكمة على الجميع بالكتاب والسنة',
            dua:     'اللهم بارك في شيخة واجعلها نافعةً للإسلام والمسلمين',
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // § 3. دوال مساعدة داخلية
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * توليد معرّف فريد وآمن
     * @param {string} prefix  - بادئة المعرّف
     * @param {number} [bytes=6] - عدد البايتات العشوائية (≥ 4 للأمان)
     */
    _generateId(prefix, bytes = 6) {
        return `${prefix}-${Date.now()}-${crypto.randomBytes(bytes).toString('hex').toUpperCase()}`;
    }

    /** تدوين سجل التدقيق — دوّار بمؤشر لتجنّب O(n) shift() */
    _audit(event, details = {}) {
        const MAX = 10000;
        const entry = {
            ts:    new Date().toISOString(),
            event,
            ...details,
        };
        if (this._auditLog.length < MAX) {
            this._auditLog.push(entry);
        } else {
            // استبدال المدخل الأقدم بدلاً من shift()
            this._auditLog[this._auditStart % MAX] = entry;
            this._auditStart++;
        }
        this.stats.auditEvents++;
        this.emit('audit', entry);
    }

    /** تسجيل مخالفة شرعية — دوّار بمؤشر */
    _recordViolation({ opId, subjectKey, intent, prohibition }) {
        this.stats.blockedOps++;
        this.stats.violationCount++;

        const v = {
            opId,
            subjectKey,
            intent,
            prohibition: prohibition.id,
            nameAr:      prohibition.nameAr,
            ref:         prohibition.ref,
            severity:    prohibition.severity,
            ts:          new Date().toISOString(),
        };
        this._violations.push(v);
        const MAX_V = 1000;
        if (this._violations.length > MAX_V) {
            this._violations[this._violStart % MAX_V] = v;
            this._violStart++;
        }

        this._audit('SHARIA_VIOLATION', v);
        this.emit('violation', v);

        console.warn(`[SOVEREIGN] 🚫 مخالفة شرعية: ${prohibition.nameAr} — الخاضع: ${subjectKey}`);
    }

    /** الحصول على علامات المخالفة حسب النوع */
    _getProhibitionMarkers(prohibitionId) {
        const map = {
            riba:      ['riba', 'interest', 'usury', 'ربا', 'فائدة'],
            gharar:    ['gharar', 'unknown_price', 'unknown_quantity', 'غرر'],
            maysir:    ['maysir', 'gambling', 'casino', 'قمار', 'ميسر'],
            shirk:     ['shirk', 'idol', 'polytheism', 'شرك'],
            bid3ah:    ['bid3ah', 'innovation_haram', 'بدعة'],
            zulm:      ['oppression', 'exploitation', 'ظلم'],
            fasad:     ['corruption', 'فساد'],
            kidhb:     ['fraud', 'deception', 'كذب', 'تدليس', 'غش'],
            harm_data: ['data_leak', 'spy', 'privacy_breach'],
        };
        return map[prohibitionId] || [];
    }

    /** استنتاج المقصد الشرعي من النية والبيانات */
    _inferMaqsad(intent, data) {
        const i = String(intent).toLowerCase();
        if (['fatwa', 'sharia', 'quran', 'deen', 'prayer', 'zakat', 'haj'].some(w => i.includes(w))) return 'DEEN';
        if (['health', 'medical', 'safety', 'life', 'صحة', 'حياة'].some(w => i.includes(w))) return 'NAFS';
        if (['education', 'knowledge', 'research', 'علم', 'تعلم'].some(w => i.includes(w))) return 'AQL';
        if (['family', 'marriage', 'أسرة', 'زواج'].some(w => i.includes(w))) return 'NASL';
        if (['market', 'trade', 'payment', 'تجارة', 'مال', 'بيع'].some(w => i.includes(w))) return 'MAL';
        return 'ARD'; // الأرض — التعمير العام
    }

    /** الآية المرجعية للمقصد */
    _getQuranRef(maqsad) {
        const refs = {
            DEEN: 'آل عمران ١٩ — إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ',
            NAFS: 'المائدة ٣٢ — مَن أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا',
            AQL:  'طه ١١٤ — وَقُل رَّبِّ زِدْنِي عِلْمًا',
            NASL: 'النحل ٧٢ — وَاللَّهُ جَعَلَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا',
            MAL:  'البقرة ٢٧٥ — وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
            ARD:  'هود ٦١ — هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا',
        };
        return refs[maqsad] || refs.ARD;
    }

    /** التحقق من امتثال خاضع */
    _validateSubjectCompliance(subject) {
        const warnings = [];

        // يجب أن يكون للخاضع مقصد شرعي
        if (!subject.meta.maqsad) {
            warnings.push('لم يُحدَّد المقصد الشرعي للخاضع');
        }

        // يجب أن يكون للخاضع اسم عربي
        if (!subject.meta.nameAr) {
            warnings.push('لم يُحدَّد الاسم العربي للخاضع');
        }

        return { compliant: true, warnings };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 4. Singleton — نسخة واحدة من الحاكمة
// ═══════════════════════════════════════════════════════════════════════════════

const governor = new SheikhaSovereignGovernor();

// ─── التسجيل الذاتي — شيخة تخضع لنفسها قبل الجميع ─────────────────────────
// "اعدل أولاً ثم احكم"
governor.registerSubject('sheikha-sovereign-governor', 'layer', {
    nameAr:  'الحاكمة العليا — شيخة',
    nameEn:  'Sheikha Sovereign Governor',
    maqsad:  'DEEN',
    description: 'الطبقة الحاكمة العليا — مُوحَّدة لله بالكتاب والسنة',
});

// ─── إعلان التوحيد الفوري عند التشغيل ──────────────────────────────────────
governor.unifyForAllah();

// ═══════════════════════════════════════════════════════════════════════════════
// § 5. دالة تسجيل جماعي — BULK REGISTER HELPER
//   يُستخدم في index.js لتسجيل كل المحركات دفعة واحدة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تسجيل مجموعة خاضعين دفعة واحدة
 * @param {Array<{ key, type, meta }>} subjects
 */
function registerAll(subjects = []) {
    for (const { key, type, meta } of subjects) {
        governor.registerSubject(key, type || 'engine', meta || {});
    }
    return governor.enforce();
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 6. EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    governor,
    SheikhaSovereignGovernor,
    ISLAMIC_CONSTITUTION,
    registerAll,
    // اختصارات مباشرة
    registerSubject: (key, type, meta)   => governor.registerSubject(key, type, meta),
    governanceFilter: (op)               => governor.governanceFilter(op),
    enforce:         ()                  => governor.enforce(),
    unifyForAllah:   ()                  => governor.unifyForAllah(),
    status:          ()                  => governor.status(),
};
