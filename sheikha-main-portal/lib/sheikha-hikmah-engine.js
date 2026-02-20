/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * محرك شيخة للحكمة والمنطق والبصيرة — Sheikha Hikmah Engine
 *
 * "يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا" — البقرة ٢٦٩
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة
 *
 * يشمل: المنطق — الحكمة — البصيرة — الحلم — العلم — الحساب
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaHikmahEngine {
    constructor() {
        this.id = 'SHEIKHA-HIKMAH';
        this.nameAr = 'محرك شيخة للحكمة والمنطق والبصيرة';
        this.nameEn = 'Sheikha Hikmah — Wisdom, Logic & Insight Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {

        // ══════════════════════════════════════════════════════════════════
        // الأساس القرآني والنبوي
        // ══════════════════════════════════════════════════════════════════
        this.foundations = [
            {
                id: 'F-01',
                nameAr: 'الحكمة',
                nameEn: 'Wisdom (Hikmah)',
                definition: 'وضع الشيء في موضعه — إصابة الحق بالعلم والعقل',
                quran: 'يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا',
                surah: 'البقرة', num: 269,
                hadith: 'لا حسد إلا في اثنتين: رجل آتاه الله مالاً فسلّطه على هلكته في الحق، ورجل آتاه الله الحكمة فهو يقضي بها ويعلّمها',
                narrator: 'متفق عليه',
                digital: 'كل قرار في المنظومة يجب أن يُبنى على حكمة — البيانات + السياق + المرجعية الشرعية'
            },
            {
                id: 'F-02',
                nameAr: 'المنطق',
                nameEn: 'Logic (Mantiq)',
                definition: 'ترتيب المقدمات للوصول إلى نتائج صحيحة — الاستدلال المنظم',
                quran: 'قُلْ هَاتُوا بُرْهَانَكُمْ إِن كُنتُمْ صَادِقِينَ',
                surah: 'البقرة', num: 111,
                quran2: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَى قُلُوبٍ أَقْفَالُهَا',
                surah2: 'محمد', num2: 24,
                digital: 'كل عملية حسابية وخوارزمية يجب أن تكون مبنية على منطق صحيح وبرهان واضح'
            },
            {
                id: 'F-03',
                nameAr: 'البصيرة',
                nameEn: 'Insight (Basirah)',
                definition: 'نور في القلب يُدرك به الحق من الباطل — الفهم العميق',
                quran: 'قُلْ هَذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ عَلَى بَصِيرَةٍ أَنَا وَمَنِ اتَّبَعَنِي',
                surah: 'يوسف', num: 108,
                digital: 'كل تحليل يجب أن يُقدّم رؤية واضحة (Insight) وليس مجرد أرقام'
            },
            {
                id: 'F-04',
                nameAr: 'الحلم',
                nameEn: 'Forbearance (Hilm)',
                definition: 'ضبط النفس عند الغضب — التأني وعدم العجلة في القرارات',
                quran: 'إِنَّ إِبْرَاهِيمَ لَأَوَّاهٌ حَلِيمٌ',
                surah: 'التوبة', num: 114,
                hadith: 'إن فيك خصلتين يحبهما الله: الحلم والأناة',
                narrator: 'رواه مسلم — قاله النبي لأشج عبد القيس',
                digital: 'النظام لا يتخذ قرارات متسرعة — كل عملية حرجة تمر بفترة تأنٍّ ومراجعة'
            },
            {
                id: 'F-05',
                nameAr: 'العلم',
                nameEn: 'Knowledge (Ilm)',
                definition: 'إدراك الشيء على ما هو عليه — معرفة الحقائق بالدليل',
                quran: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
                surah: 'طه', num: 114,
                hadith: 'من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة',
                narrator: 'رواه مسلم',
                digital: 'قاعدة معرفة مركزية تنمو باستمرار — كل تجربة تُوثّق وتُحلّل'
            },
            {
                id: 'F-06',
                nameAr: 'الحساب',
                nameEn: 'Reckoning (Hisab)',
                definition: 'العد والقياس والحساب الدقيق — إحصاء كل شيء',
                quran: 'هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا وَقَدَّرَهُ مَنَازِلَ لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ',
                surah: 'يونس', num: 5,
                quran2: 'وَأَحْصَى كُلَّ شَيْءٍ عَدَدًا',
                surah2: 'الجن', num2: 28,
                digital: 'كل شيء يُحسب ويُقاس ويُرقم — لا قرار بدون بيانات'
            }
        ];

        // ══════════════════════════════════════════════════════════════════
        // طبقات المنطق في المنظومة — Logic Layers
        // ══════════════════════════════════════════════════════════════════
        this.logicLayers = [
            {
                id: 'LL-01',
                nameAr: 'طبقة جمع البيانات',
                nameEn: 'Data Collection Layer',
                principle: 'العلم',
                quran: 'فَتَبَيَّنُوا — الحجرات ٦',
                description: 'جمع البيانات من مصادر موثوقة والتثبت منها',
                rules: [
                    'لا تقبل بيانات بدون مصدر',
                    'التحقق من صحة كل مدخل',
                    'رفض البيانات المتناقضة',
                    'توثيق مصدر كل بيانة'
                ],
                digitalCode: 'DATA_SOURCED && DATA_VERIFIED'
            },
            {
                id: 'LL-02',
                nameAr: 'طبقة التحليل المنطقي',
                nameEn: 'Logical Analysis Layer',
                principle: 'المنطق',
                quran: 'هَاتُوا بُرْهَانَكُمْ — البقرة ١١١',
                description: 'تحليل البيانات بمنطق صحيح واستدلال منظم',
                rules: [
                    'كل نتيجة يجب أن تكون مبنية على مقدمات صحيحة',
                    'لا قفز إلى استنتاجات بدون أدلة',
                    'فصل الحقائق عن الافتراضات',
                    'التعرف على المغالطات المنطقية وتجنبها'
                ],
                logicTypes: [
                    { nameAr: 'الاستقراء', nameEn: 'Induction', desc: 'من الجزئيات إلى القاعدة العامة' },
                    { nameAr: 'الاستنباط', nameEn: 'Deduction', desc: 'من القاعدة العامة إلى الجزئيات' },
                    { nameAr: 'القياس', nameEn: 'Analogy (Qiyas)', desc: 'إلحاق فرع بأصل لعلة جامعة — أصل فقهي' },
                    { nameAr: 'الاستصحاب', nameEn: 'Presumption of Continuity', desc: 'بقاء ما كان على ما كان حتى يثبت خلافه' },
                    { nameAr: 'سد الذرائع', nameEn: 'Blocking Pretexts', desc: 'منع الوسائل المؤدية إلى الضرر' }
                ],
                digitalCode: 'LOGIC_VALID && NO_FALLACIES'
            },
            {
                id: 'LL-03',
                nameAr: 'طبقة البصيرة والرؤية',
                nameEn: 'Insight & Vision Layer',
                principle: 'البصيرة',
                quran: 'أَدْعُو إِلَى اللَّهِ عَلَى بَصِيرَةٍ — يوسف ١٠٨',
                description: 'تحويل التحليل إلى رؤى عملية قابلة للتنفيذ',
                rules: [
                    'كل تحليل يُنتج رؤية واحدة على الأقل (Insight)',
                    'الرؤية يجب أن تكون قابلة للقياس والتنفيذ',
                    'ربط الرؤية بالهدف الشرعي والتجاري',
                    'تقديم بدائل وخيارات وليس خياراً واحداً'
                ],
                digitalCode: 'INSIGHT_ACTIONABLE && INSIGHT_MEASURABLE'
            },
            {
                id: 'LL-04',
                nameAr: 'طبقة الحلم والتأني',
                nameEn: 'Forbearance & Deliberation Layer',
                principle: 'الحلم',
                quran: 'الحِلم والأناة — حديث أشج عبد القيس',
                description: 'مراجعة القرارات الحرجة قبل التنفيذ — لا عجلة',
                rules: [
                    'القرارات الحرجة تنتظر 24 ساعة قبل التنفيذ',
                    'القرارات المالية تمر بمراجعة ثلاثية',
                    'القرارات الشرعية تُعرض على المراجع',
                    'لا رد فعل آلي على الأحداث الاستثنائية'
                ],
                cooldownPeriods: {
                    critical: '24 ساعة',
                    financial: '48 ساعة + مراجعة',
                    sharia: 'حتى الاعتماد البشري',
                    routine: 'فوري مع توثيق'
                },
                digitalCode: 'DELIBERATION_COMPLETE && HUMAN_APPROVED'
            },
            {
                id: 'LL-05',
                nameAr: 'طبقة الحكمة والقرار',
                nameEn: 'Wisdom & Decision Layer',
                principle: 'الحكمة',
                quran: 'يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ — البقرة ٢٦٩',
                description: 'اتخاذ القرار الحكيم — وضع الشيء في موضعه',
                rules: [
                    'القرار يجب أن يُحقق المصلحة ويدرأ المفسدة',
                    'القرار يتوافق مع القوانين العليا العشرة',
                    'القرار مبني على بيانات + منطق + بصيرة + حلم',
                    'القرار موثّق بالسبب والأثر المتوقع'
                ],
                decisionFramework: {
                    step1: 'جمع البيانات (العلم)',
                    step2: 'التحليل المنطقي (المنطق)',
                    step3: 'استخراج الرؤى (البصيرة)',
                    step4: 'المراجعة والتأني (الحلم)',
                    step5: 'القرار الحكيم (الحكمة)',
                    step6: 'التنفيذ المتقن (الإتقان)',
                    step7: 'القياس والتوثيق (الحساب)'
                },
                digitalCode: 'DECISION_WISE && DECISION_DOCUMENTED'
            },
            {
                id: 'LL-06',
                nameAr: 'طبقة الحساب والقياس',
                nameEn: 'Reckoning & Measurement Layer',
                principle: 'الحساب',
                quran: 'لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ — يونس ٥',
                description: 'قياس كل شيء وحساب النتائج والأثر',
                rules: [
                    'كل قرار يُقاس أثره بعد التنفيذ',
                    'كل عملية لها مؤشرات أداء محددة',
                    'مقارنة النتائج بالتوقعات',
                    'تسجيل الدروس المستفادة'
                ],
                metrics: {
                    decisionAccuracy: 'نسبة صحة القرارات',
                    executionSpeed: 'سرعة التنفيذ بعد القرار',
                    impactScore: 'قياس أثر القرار',
                    learningRate: 'معدل التعلم من الأخطاء'
                },
                digitalCode: 'MEASURED && DOCUMENTED && LEARNED'
            }
        ];

        // ══════════════════════════════════════════════════════════════════
        // قواعد الحكمة المنطقية — Wisdom Rules
        // ══════════════════════════════════════════════════════════════════
        this.wisdomRules = [
            {
                id: 'WR-01',
                nameAr: 'درء المفاسد مقدّم على جلب المصالح',
                nameEn: 'Preventing Harm Precedes Gaining Benefit',
                source: 'قاعدة فقهية',
                digital: 'إذا تعارضت ميزة جديدة مع أمان النظام — يُقدّم الأمان',
                priority: 1
            },
            {
                id: 'WR-02',
                nameAr: 'اليقين لا يزول بالشك',
                nameEn: 'Certainty Is Not Overruled by Doubt',
                source: 'قاعدة فقهية',
                digital: 'لا تُغيّر حالة مؤكدة بناءً على بيانات مشكوك فيها',
                priority: 2
            },
            {
                id: 'WR-03',
                nameAr: 'المشقة تجلب التيسير',
                nameEn: 'Hardship Brings Ease',
                source: 'قاعدة فقهية',
                digital: 'إذا واجه المستخدم صعوبة — النظام يُبسّط تلقائياً',
                priority: 3
            },
            {
                id: 'WR-04',
                nameAr: 'العادة محكّمة',
                nameEn: 'Custom Is Authoritative',
                source: 'قاعدة فقهية',
                digital: 'النظام يتعلم من عادات المستخدم ويتكيف معها',
                priority: 4
            },
            {
                id: 'WR-05',
                nameAr: 'الأمور بمقاصدها',
                nameEn: 'Matters Are Judged by Intentions',
                source: 'قاعدة فقهية',
                digital: 'كل إجراء يُقيّم بمقصده — النية تُحدد المسار',
                priority: 5
            },
            {
                id: 'WR-06',
                nameAr: 'إذا ضاق الأمر اتسع وإذا اتسع ضاق',
                nameEn: 'When Matter Narrows It Widens, When It Widens It Narrows',
                source: 'قاعدة فقهية',
                digital: 'في الأزمات — مرونة أكثر. في الاستقرار — ضوابط أشد',
                priority: 6
            },
            {
                id: 'WR-07',
                nameAr: 'لا اجتهاد مع النص',
                nameEn: 'No Independent Reasoning Against Clear Text',
                source: 'قاعدة أصولية',
                digital: 'إذا وُجد نص شرعي صريح — لا يُتجاوز بالخوارزميات',
                priority: 7
            },
            {
                id: 'WR-08',
                nameAr: 'ما لا يتم الواجب إلا به فهو واجب',
                nameEn: 'What Is Essential for Duty Is Itself a Duty',
                source: 'قاعدة أصولية',
                digital: 'الأمان والتوثيق والاختبار ليست اختيارية — هي واجبات',
                priority: 8
            }
        ];

        // ══════════════════════════════════════════════════════════════════
        // أنواع الحساب في المنظومة — Computation Types
        // ══════════════════════════════════════════════════════════════════
        this.computationTypes = [
            { id: 'CT-01', nameAr: 'حساب الزكاة', nameEn: 'Zakat Calculation', quran: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ', surah: 'البقرة', num: 43, desc: 'حساب دقيق لزكاة المال والمعادن والتجارة' },
            { id: 'CT-02', nameAr: 'حساب الميراث', nameEn: 'Inheritance Calculation', quran: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ', surah: 'النساء', num: 11, desc: 'حساب الفرائض والمواريث الشرعية' },
            { id: 'CT-03', nameAr: 'حساب التقويم الهجري', nameEn: 'Hijri Calendar', quran: 'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا', surah: 'التوبة', num: 36, desc: 'حساب التواريخ والأشهر الهجرية' },
            { id: 'CT-04', nameAr: 'حساب أوقات الصلاة', nameEn: 'Prayer Times', quran: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا', surah: 'النساء', num: 103, desc: 'حساب دقيق لأوقات الصلوات الخمس' },
            { id: 'CT-05', nameAr: 'حساب الأسعار والموازين', nameEn: 'Pricing & Weights', quran: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ', surah: 'الأنعام', num: 152, desc: 'حساب التسعير العادل والأوزان الدقيقة' },
            { id: 'CT-06', nameAr: 'حساب الأداء والنضج', nameEn: 'Performance & Maturity', quran: 'وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ كِتَابًا', surah: 'النبأ', num: 29, desc: 'مؤشرات KPI ونضج المنظومة' },
            { id: 'CT-07', nameAr: 'حساب المخاطر', nameEn: 'Risk Assessment', quran: 'وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ', surah: 'البقرة', num: 195, desc: 'تقييم المخاطر التقنية والتجارية والشرعية' },
            { id: 'CT-08', nameAr: 'حساب الجدوى', nameEn: 'Feasibility Study', quran: 'وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ', surah: 'الأعراف', num: 85, desc: 'دراسة الجدوى الاقتصادية والشرعية' }
        ];
    }

    getDashboard() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            engine: this.nameAr,
            engineEn: this.nameEn,
            version: this.version,
            owner: this.owner,
            activatedAt: this.activatedAt,
            summary: {
                foundations: this.foundations.length,
                logicLayers: this.logicLayers.length,
                wisdomRules: this.wisdomRules.length,
                computationTypes: this.computationTypes.length,
                totalElements: this.foundations.length + this.logicLayers.length + this.wisdomRules.length + this.computationTypes.length
            },
            foundations: this.foundations,
            logicLayers: this.logicLayers,
            wisdomRules: this.wisdomRules,
            computationTypes: this.computationTypes
        };
    }

    // تطبيق إطار القرار الحكيم
    applyWisdomFramework(input) {
        const { question, data, context } = input || {};
        return {
            framework: 'إطار القرار الحكيم — Sheikha Wisdom Framework',
            steps: [
                { step: 1, name: 'العلم — جمع البيانات', status: data ? 'بيانات متوفرة' : 'تحتاج بيانات', code: 'LL-01' },
                { step: 2, name: 'المنطق — التحليل', status: 'جاهز للتحليل', code: 'LL-02' },
                { step: 3, name: 'البصيرة — استخراج الرؤى', status: 'ينتظر التحليل', code: 'LL-03' },
                { step: 4, name: 'الحلم — المراجعة والتأني', status: 'ينتظر البصيرة', code: 'LL-04' },
                { step: 5, name: 'الحكمة — القرار', status: 'ينتظر المراجعة', code: 'LL-05' },
                { step: 6, name: 'الإتقان — التنفيذ', status: 'ينتظر القرار', code: 'EXECUTE' },
                { step: 7, name: 'الحساب — القياس', status: 'ينتظر التنفيذ', code: 'LL-06' }
            ],
            applicableRules: this.wisdomRules.map(r => ({ id: r.id, rule: r.nameAr })),
            question: question || 'لم يُحدد سؤال',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SheikhaHikmahEngine;
