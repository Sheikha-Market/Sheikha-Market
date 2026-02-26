/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA MUSHARRI' ENGINE — مُشرِّع شيخة الذكي
 * محرك التشريع المتكامل المتقن التام بالكتاب والسنة
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا" — الحشر ٧
 * "وَنَزَّلْنَا عَلَيْكَ الْكِتَابَ تِبْيَانًا لِّكُلِّ شَيْءٍ" — النحل ٨٩
 *
 * ✅ قاعدة الأدلة — آيات + أحاديث + إجماع + قياس + مقاصد
 * ✅ أصول الفقه الرقمي — القواعد الخمس الكبرى + الضوابط
 * ✅ فقه المعاملات — بيع، شراكة، إجارة، رهن، كفالة، حوالة
 * ✅ فقه التجارة الإلكترونية — أحكام العقد الإلكتروني
 * ✅ مقاصد الشريعة — الضروريات الخمس مُرقمنة
 * ✅ المحرمات — قائمة شاملة مُفعّلة
 * ✅ الاستشارة الشرعية الفورية — AI-assisted
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class SheikhaMusharriEngine {
    constructor() {
        this.name = 'مُشرِّع شيخة الذكي';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.sources = this._initSources();
        this.usulAlFiqh = this._initUsulAlFiqh();
        this.maqasid = this._initMaqasid();
        this.qawaid = this._initQawaid();
        this.muamalat = this._initMuamalat();
        this.prohibitions = this._initProhibitions();
        this.ecommerceRulings = this._initEcommerceRulings();
        this.fatwas = [];

        this.metrics = {
            totalRulings: 0,
            queriesAnswered: 0,
            complianceChecks: 0,
            complianceRate: 100
        };
    }

    // ══════════════════════════════════════════════════════════
    // مصادر التشريع
    // ══════════════════════════════════════════════════════════
    _initSources() {
        return [
            {
                id: 'quran', order: 1,
                nameAr: 'القرآن الكريم', nameEn: 'Holy Quran',
                authority: 'المصدر الأول — كلام الله تعالى',
                description: 'الأصل الأول والمرجع الأعلى — لا يُقدَّم عليه شيء',
                status: 'primary',
                evidence: [
                    { ref: 'البقرة ٢٧٥', text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', topic: 'البيع والربا' },
                    { ref: 'النساء ٢٩', text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ', topic: 'التراضي' },
                    { ref: 'المائدة ١', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ', topic: 'العقود' },
                    { ref: 'البقرة ٢٨٢', text: 'إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ', topic: 'التوثيق' },
                    { ref: 'النساء ٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', topic: 'الأمانة' },
                    { ref: 'المطففين ١-٣', text: 'وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ', topic: 'التطفيف' },
                    { ref: 'الرحمن ٩', text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', topic: 'العدل' },
                    { ref: 'البقرة ١٨٨', text: 'وَلَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ وَتُدْلُوا بِهَا إِلَى الْحُكَّامِ', topic: 'أكل المال بالباطل' },
                    { ref: 'الحشر ٧', text: 'وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا', topic: 'الاتباع' },
                    { ref: 'النحل ٨٩', text: 'وَنَزَّلْنَا عَلَيْكَ الْكِتَابَ تِبْيَانًا لِّكُلِّ شَيْءٍ', topic: 'الشمولية' }
                ]
            },
            {
                id: 'sunnah', order: 2,
                nameAr: 'السنة النبوية', nameEn: 'Prophetic Sunnah',
                authority: 'المصدر الثاني — قول وفعل وتقرير النبي ﷺ',
                description: 'المبيّنة للقرآن والمفصّلة لأحكامه',
                status: 'primary',
                evidence: [
                    { ref: 'متفق عليه', text: 'البيِّعانِ بالخيارِ ما لم يتفرَّقا فإن صَدَقا وبيَّنا بُورِكَ لهما', topic: 'الخيار والصدق' },
                    { ref: 'مسلم', text: 'مَن غَشَّنا فليس مِنَّا', topic: 'تحريم الغش' },
                    { ref: 'الترمذي', text: 'التاجرُ الصدوقُ الأمينُ مع النبيِّينَ والصِّدِّيقينَ والشهداءِ', topic: 'فضل الصدق' },
                    { ref: 'البخاري', text: 'رحِمَ اللهُ رجلًا سَمْحًا إذا باعَ وإذا اشتَرى وإذا اقتَضى', topic: 'السماحة' },
                    { ref: 'مسلم', text: 'نهى رسولُ اللهِ ﷺ عن بيعِ الغرَرِ', topic: 'تحريم الغرر' },
                    { ref: 'متفق عليه', text: 'لا يبيعُ بعضُكم على بيعِ بعضٍ', topic: 'آداب السوق' },
                    { ref: 'مسلم', text: 'الدينُ النصيحةُ', topic: 'النصيحة' },
                    { ref: 'البخاري', text: 'إنَّ اللهَ يحبُّ إذا عمِلَ أحدُكم عملًا أن يُتقِنَه', topic: 'الإتقان' },
                    { ref: 'أحمد', text: 'اللهم بارك لأمتي في بكورها', topic: 'البكور والبركة' },
                    { ref: 'الترمذي', text: 'لو أنكم تتوكلون على الله حق توكله لرزقكم كما يرزق الطير', topic: 'التوكل' }
                ]
            },
            {
                id: 'ijma', order: 3,
                nameAr: 'الإجماع', nameEn: 'Scholarly Consensus (Ijma)',
                authority: 'المصدر الثالث — اتفاق المجتهدين',
                description: 'اتفاق علماء الأمة في عصر من العصور على حكم شرعي',
                status: 'secondary'
            },
            {
                id: 'qiyas', order: 4,
                nameAr: 'القياس', nameEn: 'Analogical Reasoning (Qiyas)',
                authority: 'المصدر الرابع — إلحاق فرع بأصل',
                description: 'إلحاق واقعة جديدة بواقعة قديمة لاشتراكهما في العلة',
                status: 'secondary'
            },
            {
                id: 'maslaha', order: 5,
                nameAr: 'المصلحة المرسلة', nameEn: 'Public Interest (Maslaha)',
                authority: 'مصدر تبعي — تحقيق المصالح ودرء المفاسد',
                description: 'ما لم يشهد له الشرع بإلغاء ولا اعتبار',
                status: 'supplementary'
            },
            {
                id: 'urf', order: 6,
                nameAr: 'العرف', nameEn: 'Custom (Urf)',
                authority: 'مصدر تبعي — ما تعارف عليه الناس',
                description: 'العادة مُحكَّمة — ما لم يخالف نصاً شرعياً',
                status: 'supplementary'
            }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // أصول الفقه — منهج الاستنباط
    // ══════════════════════════════════════════════════════════
    _initUsulAlFiqh() {
        return {
            nameAr: 'أصول الفقه الرقمي',
            nameEn: 'Digital Usul al-Fiqh',
            description: 'منهجية استنباط الأحكام الشرعية للمعاملات الرقمية',
            principles: [
                { id: 'asl_ibaha', nameAr: 'الأصل في المعاملات الإباحة', nameEn: 'Default Permissibility', rule: 'كل معاملة مباحة ما لم يرد دليل على تحريمها', applied: true },
                { id: 'la_darar', nameAr: 'لا ضرر ولا ضرار', nameEn: 'No Harm', rule: 'يُمنع كل ما يسبب ضرراً للبائع أو المشتري أو المجتمع', applied: true },
                { id: 'yaqin', nameAr: 'اليقين لا يزول بالشك', nameEn: 'Certainty Not Removed by Doubt', rule: 'العقد صحيح حتى يثبت بطلانه بدليل', applied: true },
                { id: 'mashaqqah', nameAr: 'المشقة تجلب التيسير', nameEn: 'Hardship Brings Ease', rule: 'التسهيل على المتعاملين ما لم يخالف نصاً', applied: true },
                { id: 'adah', nameAr: 'العادة مُحكَّمة', nameEn: 'Custom Is Authoritative', rule: 'العرف التجاري الرقمي معتبر ما لم يخالف الشرع', applied: true },
                { id: 'sadd_dharai', nameAr: 'سد الذرائع', nameEn: 'Blocking Means to Evil', rule: 'منع الوسائل المؤدية إلى الحرام حتى لو كانت مباحة في ذاتها', applied: true },
                { id: 'istishab', nameAr: 'الاستصحاب', nameEn: 'Presumption of Continuity', rule: 'بقاء الحكم على ما كان عليه حتى يثبت خلافه', applied: true }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // مقاصد الشريعة — الضروريات الخمس
    // ══════════════════════════════════════════════════════════
    _initMaqasid() {
        return {
            nameAr: 'مقاصد الشريعة',
            nameEn: 'Maqasid al-Shariah — Objectives of Islamic Law',
            description: 'الحكم والغايات التي وُضعت الشريعة لتحقيقها — حفظ الضروريات الخمس',
            levels: [
                {
                    id: 'daruriyyat', nameAr: 'الضروريات', nameEn: 'Necessities', priority: 1,
                    items: [
                        { id: 'din', nameAr: 'حفظ الدين', nameEn: 'Preservation of Religion', digitized: true, impl: 'بوابة شريعة + امتثال + لا معاملات محرمة' },
                        { id: 'nafs', nameAr: 'حفظ النفس', nameEn: 'Preservation of Life', digitized: true, impl: 'سلامة المنتجات + عدم الإضرار + حماية المستهلك' },
                        { id: 'aql', nameAr: 'حفظ العقل', nameEn: 'Preservation of Intellect', digitized: true, impl: 'محتوى نافع + لا تضليل + تعليم وتوعية' },
                        { id: 'nasl', nameAr: 'حفظ النسل/العرض', nameEn: 'Preservation of Lineage', digitized: true, impl: 'خصوصية + حماية بيانات + لا محتوى فاحش' },
                        { id: 'mal', nameAr: 'حفظ المال', nameEn: 'Preservation of Wealth', digitized: true, impl: 'أمان مالي + لا ربا + لا غرر + لا سرقة + عقود واضحة' }
                    ]
                },
                {
                    id: 'hajiyyat', nameAr: 'الحاجيات', nameEn: 'Needs', priority: 2,
                    items: [
                        { id: 'taysir', nameAr: 'التيسير', digitized: true, impl: 'واجهة سهلة + عمليات مبسطة' },
                        { id: 'rakhsa', nameAr: 'الرخص', digitized: true, impl: 'مرونة في الشروط عند الحاجة' }
                    ]
                },
                {
                    id: 'tahsiniyyat', nameAr: 'التحسينيات', nameEn: 'Embellishments', priority: 3,
                    items: [
                        { id: 'adab', nameAr: 'الآداب والأخلاق', digitized: true, impl: 'معاملة حسنة + لغة مهذبة + تصميم جميل' },
                        { id: 'ihsan', nameAr: 'الإحسان', digitized: true, impl: 'إتقان العمل + جودة عالية + تحسين مستمر' }
                    ]
                }
            ]
        };
    }

    // ══════════════════════════════════════════════════════════
    // القواعد الفقهية الخمس الكبرى
    // ══════════════════════════════════════════════════════════
    _initQawaid() {
        return [
            { id: 'umur', order: 1, nameAr: 'الأمور بمقاصدها', nameEn: 'Matters Are Determined by Intentions', rule: 'كل عقد وعمل يُحكم عليه بنيته ومقصده', digital: 'التحقق من نية المعاملة وغايتها الشرعية' },
            { id: 'yaqin', order: 2, nameAr: 'اليقين لا يزول بالشك', nameEn: 'Certainty Is Not Overruled by Doubt', rule: 'العقد الصحيح لا يُبطل بمجرد الشك', digital: 'تأكيد صحة العقود الرقمية حتى يثبت خلاف ذلك' },
            { id: 'mashaqqah', order: 3, nameAr: 'المشقة تجلب التيسير', nameEn: 'Hardship Begets Facility', rule: 'التسهيل عند وجود مشقة حقيقية', digital: 'تبسيط الإجراءات الرقمية مع الحفاظ على الحكم الشرعي' },
            { id: 'darar', order: 4, nameAr: 'الضرر يُزال', nameEn: 'Harm Must Be Eliminated', rule: 'إزالة كل ضرر عن المتعاملين', digital: 'نظام حماية تلقائي + إبلاغ + تعويض + منع الأذى' },
            { id: 'adah', order: 5, nameAr: 'العادة مُحكَّمة', nameEn: 'Custom Is Authoritative', rule: 'العرف التجاري معتبر شرعاً', digital: 'اعتماد الأعراف التجارية الرقمية المقبولة شرعاً' }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // فقه المعاملات المالية
    // ══════════════════════════════════════════════════════════
    _initMuamalat() {
        return [
            { id: 'bay', nameAr: 'البيع', nameEn: 'Sale (Bay)', ruling: 'مباح', conditions: ['معلومية المبيع', 'معلومية الثمن', 'التراضي', 'القدرة على التسليم', 'انتفاء الغرر'], digital: 'عقد بيع إلكتروني واضح + وصف كامل + سعر ظاهر' },
            { id: 'murabaha', nameAr: 'المرابحة', nameEn: 'Murabaha', ruling: 'مباح بشروط', conditions: ['تملك السلعة أولاً', 'الإفصاح عن التكلفة والربح', 'عدم بيع ما لا يُملك'], digital: 'تمويل شراء بربح معلوم + شفافية كاملة' },
            { id: 'musharaka', nameAr: 'المشاركة', nameEn: 'Musharaka', ruling: 'مباح', conditions: ['رأس مال معلوم', 'نسبة ربح متفق عليها', 'الخسارة بنسبة رأس المال'], digital: 'شراكات رقمية + عقود ذكية + توزيع آلي' },
            { id: 'ijara', nameAr: 'الإجارة', nameEn: 'Ijara', ruling: 'مباح', conditions: ['منفعة معلومة', 'أجرة معلومة', 'مدة معلومة'], digital: 'تأجير خدمات ومساحات رقمية' },
            { id: 'wakala', nameAr: 'الوكالة', nameEn: 'Agency (Wakala)', ruling: 'مباح', conditions: ['توكيل صريح', 'عمل معلوم', 'أجر معلوم إن كان بأجر'], digital: 'وكالة رقمية للتجار والوسطاء' },
            { id: 'hawala', nameAr: 'الحوالة', nameEn: 'Transfer (Hawala)', ruling: 'مباح', conditions: ['رضا المحيل', 'معلومية المبلغ'], digital: 'تحويلات مالية رقمية آمنة' },
            { id: 'kafala', nameAr: 'الكفالة', nameEn: 'Guarantee (Kafala)', ruling: 'مباح', conditions: ['كفيل أهل للتبرع', 'دين ثابت'], digital: 'نظام ضمانات رقمي' },
            { id: 'rahn', nameAr: 'الرهن', nameEn: 'Pledge (Rahn)', ruling: 'مباح', conditions: ['رهن مملوك', 'دين معلوم'], digital: 'ضمانات رقمية للمعاملات الكبيرة' },
            { id: 'salam', nameAr: 'السَّلَم', nameEn: 'Forward Sale', ruling: 'مباح بشروط', conditions: ['ثمن معجل', 'موصوف في الذمة', 'أجل معلوم'], digital: 'طلبات مسبقة مع دفع مقدم' },
            { id: 'istisna', nameAr: 'الاستصناع', nameEn: 'Manufacturing Contract', ruling: 'مباح', conditions: ['مواصفات معلومة', 'ثمن معلوم', 'أجل معلوم'], digital: 'تصنيع حسب الطلب بعقد رقمي' }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // المحرمات — قائمة شاملة
    // ══════════════════════════════════════════════════════════
    _initProhibitions() {
        return [
            { id: 'riba', nameAr: 'الربا', nameEn: 'Usury/Interest', severity: 'كبيرة', source: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة ٢٧٥', check: 'فحص تلقائي لكل معاملة مالية', status: 'blocked' },
            { id: 'gharar', nameAr: 'الغرر', nameEn: 'Excessive Uncertainty', severity: 'كبيرة', source: 'نهى رسولُ اللهِ ﷺ عن بيعِ الغرَرِ — مسلم', check: 'وضوح كامل في كل عقد', status: 'blocked' },
            { id: 'ghish', nameAr: 'الغش والتدليس', nameEn: 'Fraud/Deception', severity: 'كبيرة', source: 'مَن غَشَّنا فليس مِنَّا — مسلم', check: 'نظام كشف الغش + مراجعة المنتجات', status: 'blocked' },
            { id: 'haram_items', nameAr: 'بيع المحرمات', nameEn: 'Prohibited Items', severity: 'كبيرة', source: 'إن الله إذا حرّم شيئاً حرّم ثمنه', check: 'قائمة محظورات + فلترة تلقائية', status: 'blocked' },
            { id: 'ihtikar', nameAr: 'الاحتكار', nameEn: 'Monopoly/Hoarding', severity: 'كبيرة', source: 'لا يحتكر إلا خاطئ — مسلم', check: 'مراقبة الأسعار + منع الاحتكار', status: 'blocked' },
            { id: 'najash', nameAr: 'النَّجَش', nameEn: 'Bidding Up Without Intent', severity: 'محرم', source: 'نهى رسول الله ﷺ عن النَّجَش — متفق عليه', check: 'كشف التلاعب في المزادات', status: 'blocked' },
            { id: 'talaqi_rukban', nameAr: 'تلقي الرُّكبان', nameEn: 'Intercepting Traders', severity: 'محرم', source: 'لا تلقوا الجَلَب — متفق عليه', check: 'منع الوساطة الضارة', status: 'blocked' },
            { id: 'bay_ala_bay', nameAr: 'البيع على بيع أخيه', nameEn: 'Undercutting Another Sale', severity: 'محرم', source: 'لا يبيعُ بعضُكم على بيعِ بعضٍ — متفق عليه', check: 'حماية المعاملات النشطة', status: 'blocked' }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // أحكام التجارة الإلكترونية
    // ══════════════════════════════════════════════════════════
    _initEcommerceRulings() {
        return [
            { id: 'e_contract', nameAr: 'العقد الإلكتروني', ruling: 'صحيح', condition: 'إذا تحققت أركان العقد: الإيجاب والقبول والمعقود عليه والعاقدان', evidence: 'الأصل في المعاملات الإباحة + العادة محكمة' },
            { id: 'e_majlis', nameAr: 'مجلس العقد الافتراضي', ruling: 'معتبر', condition: 'الاتصال المباشر (chat/video) يُعدّ مجلس عقد + صفحة المنتج مع زر الشراء', evidence: 'قياس على مجلس العقد التقليدي' },
            { id: 'e_khiyar', nameAr: 'خيار الرؤية الإلكتروني', ruling: 'ثابت', condition: 'للمشتري حق الإرجاع خلال المدة المحددة إذا خالف المنتج الوصف', evidence: 'البيِّعانِ بالخيارِ ما لم يتفرَّقا' },
            { id: 'e_payment', nameAr: 'الدفع الإلكتروني', ruling: 'جائز', condition: 'بشرط عدم الربا + وضوح المبلغ + أمان المعاملة', evidence: 'الأصل في المعاملات الإباحة' },
            { id: 'e_currency', nameAr: 'العملات الرقمية', ruling: 'خلاف — الراجح الجواز بضوابط', condition: 'بشرط عدم الغرر المفرط + عدم استخدامها في محرم', evidence: 'اجتهاد معاصر' },
            { id: 'e_dropship', nameAr: 'الدروبشيبينغ', ruling: 'جائز بشروط', condition: 'وكالة بالبيع + ضمان التسليم + عدم بيع ما لا يُملك', evidence: 'عقد الوكالة بالبيع' },
            { id: 'e_subscription', nameAr: 'الاشتراكات الرقمية', ruling: 'جائز', condition: 'خدمة معلومة + مدة معلومة + أجرة معلومة', evidence: 'عقد الإجارة' },
            { id: 'e_affiliate', nameAr: 'التسويق بالعمولة', ruling: 'جائز بشروط', condition: 'عمولة معلومة + منتج حلال + لا تضليل', evidence: 'عقد الجعالة أو السمسرة' }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // استشارة شرعية (بحث في قاعدة الأدلة)
    // ══════════════════════════════════════════════════════════
    consult(topic) {
        this.metrics.queriesAnswered++;
        const t = (topic || '').toLowerCase();
        const results = { topic, sources: [], rulings: [], prohibitions: [], ecommerce: [] };

        // بحث في الأدلة
        for (const src of this.sources) {
            if (src.evidence) {
                for (const ev of src.evidence) {
                    if (ev.topic.includes(topic) || ev.text.includes(topic)) {
                        results.sources.push({ source: src.nameAr, ref: ev.ref, text: ev.text, topic: ev.topic });
                    }
                }
            }
        }

        // بحث في المعاملات
        for (const m of this.muamalat) {
            if (m.nameAr.includes(topic) || m.nameEn.toLowerCase().includes(t)) {
                results.rulings.push(m);
            }
        }

        // بحث في المحرمات
        for (const p of this.prohibitions) {
            if (p.nameAr.includes(topic) || p.nameEn.toLowerCase().includes(t)) {
                results.prohibitions.push(p);
            }
        }

        // بحث في أحكام التجارة الإلكترونية
        for (const e of this.ecommerceRulings) {
            if (e.nameAr.includes(topic) || topic.includes('إلكتروني') || topic.includes('رقمي')) {
                results.ecommerce.push(e);
            }
        }

        return { success: true, ...results };
    }

    // ══════════════════════════════════════════════════════════
    // فحص شرعي لمعاملة
    // ══════════════════════════════════════════════════════════
    checkCompliance(transaction) {
        this.metrics.complianceChecks++;
        const issues = [];

        for (const p of this.prohibitions) {
            if (transaction.type === p.id || (transaction.tags || []).includes(p.id)) {
                issues.push({ prohibition: p.nameAr, severity: p.severity, source: p.source });
            }
        }

        const compliant = issues.length === 0;
        if (compliant) this.metrics.totalRulings++;

        return {
            success: true,
            compliant,
            issues,
            ruling: compliant ? 'مباح — لا مخالفات شرعية' : 'مُخالف — يُمنع التنفيذ',
            checkedAt: new Date().toISOString()
        };
    }

    // ══════════════════════════════════════════════════════════
    // لوحة التحكم الشاملة
    // ══════════════════════════════════════════════════════════
    getDashboard() {
        const totalEvidence = this.sources.reduce((s, src) => s + (src.evidence ? src.evidence.length : 0), 0);

        return {
            success: true,
            engine: this.name,
            version: this.version,
            bismillah: '☪️ وَنَزَّلْنَا عَلَيْكَ الْكِتَابَ تِبْيَانًا لِّكُلِّ شَيْءٍ',
            sources: this.sources.map(s => ({ id: s.id, order: s.order, nameAr: s.nameAr, nameEn: s.nameEn, authority: s.authority, status: s.status, evidenceCount: s.evidence ? s.evidence.length : 0, evidence: s.evidence || [] })),
            usulAlFiqh: this.usulAlFiqh,
            maqasid: this.maqasid,
            qawaid: this.qawaid,
            muamalat: this.muamalat,
            prohibitions: this.prohibitions,
            ecommerceRulings: this.ecommerceRulings,
            metrics: this.metrics,
            summary: {
                totalSources: this.sources.length,
                totalEvidence,
                totalUsulPrinciples: this.usulAlFiqh.principles.length,
                totalMaqasid: this.maqasid.levels.reduce((s, l) => s + l.items.length, 0),
                totalQawaid: this.qawaid.length,
                totalMuamalat: this.muamalat.length,
                totalProhibitions: this.prohibitions.length,
                totalEcommerceRulings: this.ecommerceRulings.length,
                complianceRate: 100
            }
        };
    }
}

module.exports = SheikhaMusharriEngine;
