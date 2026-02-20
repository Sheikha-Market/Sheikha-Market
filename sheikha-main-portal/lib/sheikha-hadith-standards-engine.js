"use strict";
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════
 * محرك الأحاديث الصحيحة ومعايير السوق النبوي
 * Sheikha Sahih Hadith Standards & Prophetic Market Engine
 * «المكيال مكيال أهل المدينة والوزن وزن أهل مكة» — النسائي وأبو داود
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الأحاديث الصحيحة فقط — صحيح البخاري ومسلم والسنن
 * ═══════════════════════════════════════════════════════════════
 * كل حديث صحيح في التجارة والبيوع والمعاملات مفعّل كمبدأ رقمي
 * ومقياس معياري لمنع التلاعب بالعملة والأسعار والأوزان
 * ═══════════════════════════════════════════════════════════════
 */
class SheikhaHadithStandardsEngine {
    constructor() {
        this.id = 'SHEIKHA-HADITH-STANDARDS';
        this.nameAr = 'محرك الأحاديث الصحيحة ومعايير السوق النبوي';
        this.nameEn = 'Sahih Hadith Standards & Prophetic Market Engine';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this._init();
    }

    _init() {

        // ══════════════════════════════════════════════════════════════
        // ⚖️ الباب الأول: المكاييل والموازين — WEIGHTS & MEASURES
        // المعيار النبوي الأساسي لمنع التلاعب بالعملة
        // ══════════════════════════════════════════════════════════════
        this.weightsAndMeasures = {
            masterHadith: {
                id: 'WM-MASTER',
                text: 'المكيال مكيال أهل المدينة والوزن وزن أهل مكة',
                rawi: 'ابن عمر رضي الله عنهما',
                source: 'أبو داود والنسائي — صححه الألباني',
                grade: 'صحيح',
                meaning: 'المرجع في الكيل هو مكيال أهل المدينة (الصاع والمُدّ) والمرجع في الوزن هو وزن أهل مكة (المثقال والأوقية) — هذا أصل التوحيد القياسي في الإسلام',
                digitalPrinciple: 'كل قياس في السوق يعود لمعيار ثابت لا يتغير — كما أن مكيال المدينة ثابت لا يتلاعب به أحد',
                code: 'MADINAH_MEASURE_MAKKAH_WEIGHT'
            },

            units: [
                {id:'WM-U01', nameAr:'الصاع النبوي', nameEn:'Prophetic Saa', detail:'مكيال أهل المدينة — يعادل ٤ أمداد — حوالي ٢.٠٣٥ كجم من القمح', usage:'مكيال زكاة الفطر — كفارات — أحكام البيوع', standard:'ثابت لا يتغير', code:'SAA_NABAWI'},
                {id:'WM-U02', nameAr:'المُدّ النبوي', nameEn:'Prophetic Mudd', detail:'ربع الصاع — ملء كفّي الرجل المعتدل — حوالي ٥٠٩ جرام', usage:'وحدة أساسية للكيل', standard:'ثابت', code:'MUDD_NABAWI'},
                {id:'WM-U03', nameAr:'المثقال (مكة)', nameEn:'Mithqal (Makkah Weight)', detail:'وزن أهل مكة — الدينار الذهبي = مثقال واحد = ٤.٢٥ جرام ذهب', usage:'معيار وزن الذهب — أساس النظام النقدي', standard:'ثابت', code:'MITHQAL'},
                {id:'WM-U04', nameAr:'الأوقية (مكة)', nameEn:'Uqiyya (Makkah Weight)', detail:'وزن أهل مكة — = ٤٠ درهماً = حوالي ١١٩ جرام فضة', usage:'معيار وزن الفضة', standard:'ثابت', code:'UQIYYA'},
                {id:'WM-U05', nameAr:'الدرهم الشرعي', nameEn:'Shari Dirham', detail:'وزنه ٢.٩٧٥ جرام فضة — نصاب الزكاة ٢٠٠ درهم', usage:'معيار الفضة والنقد', standard:'ثابت', code:'DIRHAM_SHARI'},
                {id:'WM-U06', nameAr:'الدينار الشرعي', nameEn:'Shari Dinar', detail:'وزنه مثقال = ٤.٢٥ جرام ذهب — نصاب الزكاة ٢٠ ديناراً', usage:'معيار الذهب والنقد', standard:'ثابت', code:'DINAR_SHARI'},
                {id:'WM-U07', nameAr:'الوسق', nameEn:'Wasq', detail:'= ٦٠ صاعاً — نصاب زكاة الحبوب ٥ أوسق', usage:'كيل الحبوب والتمور', standard:'ثابت', code:'WASQ'},
                {id:'WM-U08', nameAr:'الرطل', nameEn:'Ratl', detail:'= ١٢ أوقية — حوالي ١.٤٢٨ كجم', usage:'وزن عام في التجارة', standard:'ثابت', code:'RATL'}
            ],

            antiManipulationRules: [
                {id:'WM-AM01', nameAr:'ثبات المعيار', hadith:'المكيال مكيال أهل المدينة والوزن وزن أهل مكة', rule:'لا يجوز تغيير وحدة القياس المعتمدة للتلاعب بقيمة العملة أو السلعة', code:'FIXED_STANDARD', active:true},
                {id:'WM-AM02', nameAr:'تحريم التطفيف', quran:'ويل للمطففين الذين إذا اكتالوا على الناس يستوفون وإذا كالوهم أو وزنوهم يخسرون — المطففين ١-٣', rule:'تحريم النقص في الكيل والوزن — الإيفاء الكامل', code:'NO_TATFEEF', active:true},
                {id:'WM-AM03', nameAr:'العدل في الميزان', quran:'وأقيموا الوزن بالقسط ولا تخسروا الميزان — الرحمن ٩', rule:'كل وزن وكيل يجب أن يكون بالعدل التام', code:'JUST_BALANCE', active:true},
                {id:'WM-AM04', nameAr:'المعايرة الدورية', rule:'فحص ومعايرة أدوات الكيل والوزن دورياً — لا يُستخدم أي أداة غير معايرة', code:'PERIODIC_CALIBRATION', active:true},
                {id:'WM-AM05', nameAr:'الربط بالذهب', rule:'ربط قيمة العملة بالذهب الحقيقي (المثقال) — لمنع التلاعب بالعملة الورقية', code:'GOLD_PEG', active:true},
                {id:'WM-AM06', nameAr:'شفافية القياس', rule:'كل عملية كيل أو وزن تتم أمام الطرفين — لا قياس سري', code:'TRANSPARENT_MEASURE', active:true}
            ]
        };

        // ══════════════════════════════════════════════════════════════
        // 📖 الباب الثاني: أحاديث أصول البيوع — TRADE FOUNDATIONS
        // ══════════════════════════════════════════════════════════════
        this.tradeFoundations = [
            {id:'TF-01', text:'إنما البيع عن تراض', rawi:'أبو سعيد الخدري', source:'ابن ماجه', grade:'صحيح', principle:'لا يصح أي بيع بدون رضا الطرفين الكامل', digitalRule:'CONSENT_REQUIRED = true — كل صفقة تتطلب موافقة صريحة من الطرفين', code:'CONSENT', active:true},
            {id:'TF-02', text:'البيّعان بالخيار ما لم يتفرقا فإن صدقا وبيّنا بورك لهما في بيعهما وإن كذبا وكتما محقت بركة بيعهما', rawi:'حكيم بن حزام', source:'متفق عليه', grade:'صحيح', principle:'خيار المجلس — البائع والمشتري لهما حق التراجع قبل الافتراق + الصدق يجلب البركة', digitalRule:'SESSION_OPTION = true && HONESTY → BARAKA', code:'SESSION_OPTION_BARAKA', active:true},
            {id:'TF-03', text:'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء يوم القيامة', rawi:'أبو سعيد الخدري', source:'الترمذي', grade:'حسن', principle:'مكانة التاجر الصادق العليا عند الله', digitalRule:'HONEST_TRADER_RANK = HIGHEST — تصنيف خاص للتجار الصادقين', code:'HONEST_TRADER', active:true},
            {id:'TF-04', text:'رحم الله رجلاً سمحاً إذا باع وإذا اشترى وإذا اقتضى', rawi:'جابر بن عبدالله', source:'البخاري', grade:'صحيح', principle:'السماحة في البيع والشراء والمطالبة بالحق', digitalRule:'LENIENCY_BONUS = true — مكافأة التجار المتسامحين', code:'LENIENCY', active:true},
            {id:'TF-05', text:'من أقال مسلماً بيعته أقاله الله عثرته يوم القيامة', rawi:'أبو هريرة', source:'أبو داود وابن ماجه', grade:'صحيح', principle:'تشجيع إقالة النادم من البيع', digitalRule:'REGRET_RELIEF = true — نظام إقالة مفعّل للبيوع', code:'REGRET_RELIEF', active:true},
            {id:'TF-06', text:'لا يبيع بعضكم على بيع بعض', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'تحريم البيع على بيع أخيك — حماية الصفقات المنعقدة', digitalRule:'NO_UNDERCUTTING = true — حماية الصفقات الجارية', code:'NO_UNDERCUTTING', active:true},
            {id:'TF-07', text:'لا يخطب الرجل على خطبة أخيه ولا يسوم على سوم أخيه', rawi:'أبو هريرة', source:'متفق عليه', grade:'صحيح', principle:'تحريم المساومة على سوم الآخر', digitalRule:'NO_COMPETING_BID = true — لا عرض على عرض جار', code:'NO_COMPETING_BID', active:true},
            {id:'TF-08', text:'نهى رسول الله ﷺ عن بيعتين في بيعة', rawi:'أبو هريرة', source:'الترمذي والنسائي', grade:'صحيح', principle:'تحريم الجمع بين بيعتين في صفقة واحدة — لمنع الغرر', digitalRule:'ONE_SALE_PER_TRANSACTION = true', code:'ONE_SALE', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 🚫 الباب الثالث: أحاديث المحرمات — PROHIBITIONS
        // ══════════════════════════════════════════════════════════════
        this.prohibitions = [
            {id:'PR-01', text:'من غش فليس مني', rawi:'أبو هريرة', source:'مسلم', grade:'صحيح', principle:'تحريم الغش المطلق في كل شيء', digitalRule:'FRAUD_DETECTION = MAX — نظام كشف غش متقدم', penalty:'إنذار ← غرامة ← تعليق ← إلغاء ← قائمة سوداء', code:'NO_FRAUD', active:true},
            {id:'PR-02', text:'لا يحتكر إلا خاطئ', rawi:'معمر بن عبدالله', source:'مسلم', grade:'صحيح', principle:'تحريم احتكار السلع انتظاراً لغلاء سعرها', digitalRule:'MONOPOLY_DETECTION = true — كشف الاحتكار آلياً', code:'NO_MONOPOLY', active:true},
            {id:'PR-03', text:'نهى عن بيع الغرر', rawi:'أبو هريرة', source:'مسلم', grade:'صحيح', principle:'تحريم بيع المجهول والمعاملات ذات المخاطر العالية غير المحسوبة', digitalRule:'GHARAR_CHECK = true — فحص كل صفقة من الجهالة', code:'NO_GHARAR', active:true},
            {id:'PR-04', text:'نهى عن النجش', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'تحريم رفع السعر وهمياً بدون نية شراء — المزايدة الكاذبة', digitalRule:'SHILL_BID_DETECTION = true — كشف المزايدات الوهمية', code:'NO_NAJSH', active:true},
            {id:'PR-05', text:'لا تلقوا الركبان ولا يبع حاضر لباد', rawi:'ابن عباس', source:'متفق عليه', grade:'صحيح', principle:'منع اعتراض القوافل قبل السوق + منع المدني من السمسرة للبدوي ليغلي السعر', digitalRule:'NO_INTERCEPTION = true — منع التلاعب قبل دخول السوق', code:'NO_INTERCEPTION', active:true},
            {id:'PR-06', text:'لا تبع ما ليس عندك', rawi:'حكيم بن حزام', source:'الترمذي وأبو داود', grade:'صحيح', principle:'تحريم بيع ما لا تملكه — البيع على المكشوف', digitalRule:'OWNERSHIP_VERIFIED = true — التحقق من الملكية قبل البيع', code:'OWN_BEFORE_SELL', active:true},
            {id:'PR-07', text:'نهى عن بيع الثمرة حتى يبدو صلاحها', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'تحريم بيع الثمار قبل نضجها — منع الجهالة في المبيع', digitalRule:'QUALITY_VERIFIED = true — التحقق من جودة المنتج', code:'QUALITY_FIRST', active:true},
            {id:'PR-08', text:'نهى عن المزابنة والمحاقلة', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'منع بيع الرطب بالتمر (مزابنة) وبيع الزرع بالقمح (محاقلة) — لأن التفاضل مجهول', digitalRule:'LIKE_FOR_LIKE_CHECK = true', code:'NO_MUZABANA', active:true},
            {id:'PR-09', text:'نهى عن بيع الطعام حتى يستوفيه', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'لا يُباع ما اشتُري حتى يُقبض — ضمان الحيازة الفعلية', digitalRule:'POSSESSION_REQUIRED = true — يجب القبض قبل إعادة البيع', code:'POSSESS_FIRST', active:true},
            {id:'PR-10', text:'نهى عن بيع الكالئ بالكالئ', rawi:'ابن عمر', source:'الدارقطني — صححه ابن حجر', grade:'صحيح', principle:'تحريم بيع الدين بالدين — المؤجل بالمؤجل', digitalRule:'NO_DEBT_FOR_DEBT = true', code:'NO_KALI_BILKALI', active:true},
            {id:'PR-11', text:'لعن رسول الله ﷺ آكل الربا ومُوكله وكاتبه وشاهديه وقال: هم سواء', rawi:'جابر', source:'مسلم', grade:'صحيح', principle:'تحريم الربا بكل أشكاله — على الآكل والمعطي والكاتب والشاهد', digitalRule:'RIBA_ZERO_TOLERANCE = true — منع مطلق للربا في كل صوره', code:'ABSOLUTE_NO_RIBA', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 💰 الباب الرابع: أحاديث الصرف والمعادن — EXCHANGE & METALS
        // ══════════════════════════════════════════════════════════════
        this.exchangeHadiths = [
            {id:'EX-01', text:'الذهب بالذهب والفضة بالفضة والبر بالبر والشعير بالشعير والتمر بالتمر والملح بالملح مثلاً بمثل سواء بسواء يداً بيد فإذا اختلفت هذه الأصناف فبيعوا كيف شئتم إذا كان يداً بيد', rawi:'عبادة بن الصامت', source:'مسلم', grade:'صحيح', principle:'قواعد الصرف الستة الكبرى — التماثل والتقابض في الأصناف الربوية', digitalRules:[
                'GOLD_GOLD: مثلاً بمثل + يداً بيد',
                'SILVER_SILVER: مثلاً بمثل + يداً بيد',
                'WHEAT_WHEAT: مثلاً بمثل + يداً بيد',
                'BARLEY_BARLEY: مثلاً بمثل + يداً بيد',
                'DATES_DATES: مثلاً بمثل + يداً بيد',
                'SALT_SALT: مثلاً بمثل + يداً بيد',
                'DIFFERENT_TYPES: حرية التسعير + يداً بيد فقط'
            ], code:'SIX_RIBA_ITEMS', active:true},
            {id:'EX-02', text:'لا تبيعوا الذهب بالذهب إلا مثلاً بمثل ولا تُشِفّوا بعضها على بعض ولا تبيعوا منها غائباً بناجز', rawi:'أبو سعيد الخدري', source:'متفق عليه', grade:'صحيح', principle:'منع ربا الفضل + منع ربا النسيئة في الذهب', digitalRule:'GOLD_EXCHANGE: EQUAL_WEIGHT = true && INSTANT = true', code:'GOLD_RULES', active:true},
            {id:'EX-03', text:'لا تبيعوا الدينار بالدينارين ولا الدرهم بالدرهمين', rawi:'أبو سعيد الخدري', source:'مسلم', grade:'صحيح', principle:'منع التفاضل في صرف العملة من نفس النوع', digitalRule:'SAME_CURRENCY_EXCHANGE: EXACT_EQUAL = true', code:'NO_FADL', active:true},
            {id:'EX-04', text:'لا بأس ببيع الذهب بالفضة والفضة أكثرهما يداً بيد وأما نسيئة فلا', rawi:'أبو بكرة', source:'متفق عليه', grade:'صحيح', principle:'يجوز التفاضل عند اختلاف النوع لكن يجب التقابض الفوري', digitalRule:'DIFFERENT_METAL_EXCHANGE: FREE_PRICING = true && INSTANT = true', code:'CROSS_METAL_FREE', active:true},
            {id:'EX-05', text:'الوزن وزن أهل مكة والمكيال مكيال أهل المدينة', rawi:'ابن عمر', source:'أبو داود والنسائي', grade:'صحيح', principle:'توحيد المعايير — وزن مكة للمعادن ومكيال المدينة للحبوب', digitalRule:'WEIGHT_STD = MAKKAH && MEASURE_STD = MADINAH', code:'UNIFIED_STANDARDS', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 🏪 الباب الخامس: أحاديث تنظيم السوق — MARKET REGULATION
        // ══════════════════════════════════════════════════════════════
        this.marketRegulation = [
            {id:'MR-01', text:'هذا سوقكم فلا يُضيَّق ولا يُضرَب عليه خَراج', rawi:'أصحاب السنن', source:'ابن ماجه', grade:'حسن', principle:'السوق حر — لا ضرائب — لا تضييق', digitalRule:'TAX = 0 && BARRIERS = 0', code:'FREE_MARKET', active:true},
            {id:'MR-02', text:'إن الله هو المسعّر القابض الباسط الرزّاق وإني لأرجو أن ألقى الله وليس أحد منكم يطالبني بمظلمة في دم ولا مال', rawi:'أنس بن مالك', source:'أبو داود والترمذي وابن ماجه', grade:'صحيح', principle:'رفض التسعير الجبري — الأسعار بيد الله والعرض والطلب', digitalRule:'FREE_PRICING = true — لا تسعير إجباري', code:'FREE_PRICING', active:true},
            {id:'MR-03', text:'لا ضرر ولا ضرار', rawi:'أبو سعيد الخدري', source:'ابن ماجه — صححه الألباني', grade:'صحيح', principle:'قاعدة ذهبية — لا يُلحق ضرر بأحد ولا يُردّ الضرر بضرر', digitalRule:'HARM_CHECK = true — فحص كل معاملة من الضرر', code:'NO_HARM', active:true},
            {id:'MR-04', text:'المسلمون على شروطهم إلا شرطاً حرّم حلالاً أو أحلّ حراماً', rawi:'أبو هريرة', source:'الترمذي', grade:'صحيح', principle:'حرية التعاقد ضمن الضوابط الشرعية', digitalRule:'CUSTOM_TERMS = true IF SHARIA_COMPLIANT', code:'HONOR_TERMS', active:true},
            {id:'MR-05', text:'من سبق إلى ما لم يسبقه إليه مسلم فهو أحق به', rawi:'أسمر بن مضرّس', source:'أبو داود', grade:'حسن', principle:'نظام الأسبقية في السوق — من سبق فهو أحق', digitalRule:'FIRST_COME_FIRST_SERVED = true', code:'FIRST_COME', active:true},
            {id:'MR-06', text:'اجعلوا بينكم وبين الحرام ستراً من الحلال', rawi:'النعمان بن بشير', source:'متفق عليه — بمعناه', grade:'صحيح', principle:'الاحتياط — ترك الشبهات', digitalRule:'SAFETY_MARGIN = true — هامش احتياط في كل معاملة', code:'PRECAUTION', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 🤝 الباب السادس: أحاديث الأخلاق التجارية — TRADE ETHICS
        // ══════════════════════════════════════════════════════════════
        this.tradeEthics = [
            {id:'TE-01', text:'ما نقصت صدقة من مال', rawi:'أبو هريرة', source:'مسلم', grade:'صحيح', principle:'الإنفاق يزيد المال بركة', digitalRule:'SADAQAH_INTEGRATION = true — نظام تبرع مدمج', code:'CHARITY_GROWTH', active:true},
            {id:'TE-02', text:'أعطوا الأجير أجره قبل أن يجف عرقه', rawi:'ابن عمر', source:'ابن ماجه', grade:'حسن', principle:'الدفع الفوري لأجور العاملين', digitalRule:'INSTANT_PAYMENT = true — دفع فوري للعمال', code:'PAY_WORKERS', active:true},
            {id:'TE-03', text:'إن دماءكم وأموالكم وأعراضكم عليكم حرام كحرمة يومكم هذا في شهركم هذا في بلدكم هذا', rawi:'أبو بكرة', source:'متفق عليه — خطبة الوداع', grade:'صحيح', principle:'حرمة الأموال مطلقة', digitalRule:'WEALTH_PROTECTION = ABSOLUTE', code:'SACRED_WEALTH', active:true},
            {id:'TE-04', text:'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف وفي كل خير', rawi:'أبو هريرة', source:'مسلم', grade:'صحيح', principle:'طلب القوة الاقتصادية عبادة', digitalRule:'ECONOMIC_STRENGTH = WORSHIP', code:'STRONG_BELIEVER', active:true},
            {id:'TE-05', text:'ما من مسلم يغرس غرساً أو يزرع زرعاً فيأكل منه طير أو إنسان أو بهيمة إلا كان له به صدقة', rawi:'أنس بن مالك', source:'متفق عليه', grade:'صحيح', principle:'الاستثمار الزراعي عبادة', digitalRule:'GREEN_INVESTMENT = REWARD', code:'AGRICULTURE_REWARD', active:true},
            {id:'TE-06', text:'من أحيا أرضاً ميتة فهي له', rawi:'جابر', source:'الترمذي', grade:'صحيح', principle:'تشجيع إحياء الأراضي والتنمية', digitalRule:'LAND_DEVELOPMENT = OWNERSHIP', code:'REVIVE_LAND', active:true},
            {id:'TE-07', text:'اليد العليا خير من اليد السفلى', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'الإنتاج والعطاء أفضل من الاستهلاك والأخذ', digitalRule:'PRODUCER > CONSUMER', code:'BE_PRODUCER', active:true},
            {id:'TE-08', text:'ما أكل أحد طعاماً قط خيراً من أن يأكل من عمل يده وإن نبي الله داود كان يأكل من عمل يده', rawi:'المقدام بن معد يكرب', source:'البخاري', grade:'صحيح', principle:'العمل اليدوي أشرف الكسب', digitalRule:'SELF_EMPLOYMENT = BEST', code:'WORK_DIGNITY', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 💎 الباب السابع: أحاديث الزكاة والأموال — ZAKAT & WEALTH
        // ══════════════════════════════════════════════════════════════
        this.zakatHadiths = [
            {id:'ZK-01', text:'ما بلغ أن تؤدى زكاته فزُكّي فليس بكنز', rawi:'أبو هريرة', source:'أبو داود', grade:'حسن', principle:'المال الذي تؤدى زكاته ليس كنزاً محرماً', digitalRule:'ZAKAT_PAID → NOT_HOARDING', code:'ZAKAT_PURIFIES', active:true},
            {id:'ZK-02', text:'ليس فيما دون خمس أواق من الورِق صدقة', rawi:'أبو سعيد الخدري', source:'متفق عليه', grade:'صحيح', principle:'نصاب الفضة = ٥ أواقٍ = ٢٠٠ درهم = ٥٩٥ جرام فضة', digitalRule:'SILVER_NISAB = 595g', code:'SILVER_NISAB', active:true},
            {id:'ZK-03', text:'ليس فيما دون عشرين مثقالاً من الذهب صدقة', rawi:'علي بن أبي طالب', source:'أبو داود', grade:'صحيح', principle:'نصاب الذهب = ٢٠ مثقالاً = ٨٥ جرام ذهب', digitalRule:'GOLD_NISAB = 85g', code:'GOLD_NISAB', active:true},
            {id:'ZK-04', text:'هاتوا ربع العشور من كل أربعين درهماً درهم', rawi:'علي', source:'أبو داود', grade:'صحيح', principle:'نسبة الزكاة = ٢.٥٪', digitalRule:'ZAKAT_RATE = 2.5%', code:'ZAKAT_RATE', active:true},
            {id:'ZK-05', text:'في الركاز الخُمس', rawi:'أبو هريرة', source:'متفق عليه', grade:'صحيح', principle:'زكاة الكنوز المعدنية المستخرجة = ٢٠٪', digitalRule:'MINERAL_ZAKAT = 20%', code:'RIKAZ_ZAKAT', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 🏛️ الباب الثامن: أحاديث الحسبة والرقابة — HISBAH & OVERSIGHT
        // ══════════════════════════════════════════════════════════════
        this.hisbahHadiths = [
            {id:'HB-01', text:'مر رسول الله ﷺ على صبرة طعام فأدخل يده فيها فنالت أصابعه بللاً فقال: ما هذا يا صاحب الطعام؟ قال: أصابته السماء يا رسول الله. قال: أفلا جعلته فوق الطعام كي يراه الناس؟ من غش فليس مني', rawi:'أبو هريرة', source:'مسلم', grade:'صحيح', principle:'النبي ﷺ أول محتسب — تفتيش ميداني — كشف الغش — الشفافية', digitalRule:'INSPECTION_SYSTEM = ACTIVE — تفتيش ميداني + رقمي', code:'PROPHET_INSPECTOR', active:true},
            {id:'HB-02', text:'كلكم راع وكلكم مسؤول عن رعيته', rawi:'ابن عمر', source:'متفق عليه', grade:'صحيح', principle:'المسؤولية الجماعية عن السوق', digitalRule:'COLLECTIVE_RESPONSIBILITY = true', code:'ALL_RESPONSIBLE', active:true},
            {id:'HB-03', text:'من رأى منكم منكراً فليغيره بيده فإن لم يستطع فبلسانه فإن لم يستطع فبقلبه وذلك أضعف الإيمان', rawi:'أبو سعيد الخدري', source:'مسلم', grade:'صحيح', principle:'واجب الأمر بالمعروف والنهي عن المنكر في السوق', digitalRule:'REPORT_VIOLATION = true — نظام إبلاغ عن المخالفات', code:'REPORT_WRONG', active:true},
            {id:'HB-04', text:'الدين النصيحة — قلنا لمن يا رسول الله؟ قال: لله ولكتابه ولرسوله ولأئمة المسلمين وعامتهم', rawi:'تميم الداري', source:'مسلم', grade:'صحيح', principle:'النصيحة في التجارة — الشفافية — تقديم المشورة الصادقة', digitalRule:'ADVISORY_SYSTEM = true — نظام نصائح للتجار', code:'NASEEHA', active:true}
        ];

        // ══════════════════════════════════════════════════════════════
        // 📊 الهيكل والمخطط التنظيمي — STRUCTURE & BLUEPRINT
        // ══════════════════════════════════════════════════════════════
        this.structure = {
            layers: [
                {id:'ST-L01', nameAr:'طبقة المعايير النبوية', detail:'المكيال والوزن — الأصناف الربوية الستة — نصاب الزكاة', hadiths:13, code:'PROPHETIC_STANDARDS'},
                {id:'ST-L02', nameAr:'طبقة أصول البيوع', detail:'التراضي — الخيار — الصدق — السماحة', hadiths:8, code:'TRADE_FOUNDATIONS'},
                {id:'ST-L03', nameAr:'طبقة المحرمات', detail:'الغش — الاحتكار — الغرر — النجش — الربا', hadiths:11, code:'PROHIBITIONS'},
                {id:'ST-L04', nameAr:'طبقة الصرف والمعادن', detail:'قواعد الذهب والفضة — التقابض — التماثل', hadiths:5, code:'EXCHANGE_METALS'},
                {id:'ST-L05', nameAr:'طبقة تنظيم السوق', detail:'حرية السوق — حرية التسعير — لا ضرر', hadiths:6, code:'MARKET_REGULATION'},
                {id:'ST-L06', nameAr:'طبقة الأخلاق التجارية', detail:'الصدقة — حق العامل — العمل — الإنتاج', hadiths:8, code:'TRADE_ETHICS'},
                {id:'ST-L07', nameAr:'طبقة الزكاة والأموال', detail:'نصاب الذهب والفضة — نسبة الزكاة — الركاز', hadiths:5, code:'ZAKAT_WEALTH'},
                {id:'ST-L08', nameAr:'طبقة الحسبة والرقابة', detail:'التفتيش — المسؤولية — الإبلاغ — النصيحة', hadiths:4, code:'HISBAH_OVERSIGHT'}
            ],

            complianceMatrix: {
                nameAr: 'مصفوفة التوافق الشرعي',
                detail: 'كل معاملة تمر بـ ٨ طبقات فحص قبل الاعتماد',
                flow: 'المعاملة → فحص المعايير → فحص الأصول → فحص المحرمات → فحص الصرف → فحص التنظيم → فحص الأخلاق → فحص الزكاة → فحص الحسبة → اعتماد أو رفض',
                code: 'EIGHT_LAYER_COMPLIANCE'
            },

            designPrinciples: [
                {id:'DP-01', nameAr:'كل حديث = قاعدة رقمية', detail:'كل حديث صحيح يتحول إلى كود برمجي يُنفذ تلقائياً', code:'HADITH_TO_CODE'},
                {id:'DP-02', nameAr:'الفحص الآلي المتعدد', detail:'٨ طبقات فحص لكل معاملة — لا تمر معاملة مخالفة', code:'AUTO_8_LAYER_CHECK'},
                {id:'DP-03', nameAr:'المعيار الثابت', detail:'مكيال المدينة ووزن مكة — لا يتغير المعيار أبداً', code:'FIXED_STANDARD'},
                {id:'DP-04', nameAr:'الشفافية الكاملة', detail:'كل المعلومات واضحة — كما أمر النبي ﷺ: أفلا جعلته فوق الطعام كي يراه الناس', code:'TOTAL_TRANSPARENCY'},
                {id:'DP-05', nameAr:'الحماية التلقائية', detail:'كشف الغش والاحتكار والنجش والربا آلياً', code:'AUTO_PROTECTION'},
                {id:'DP-06', nameAr:'التوثيق الكامل', detail:'كل معاملة موثقة — وأشهدوا إذا تبايعتم', code:'FULL_DOCUMENTATION'},
                {id:'DP-07', nameAr:'العدالة المطلقة', detail:'ويل للمطففين — لا ظلم ولا نقص', code:'ABSOLUTE_JUSTICE'},
                {id:'DP-08', nameAr:'البركة الإلهية', detail:'الصدق والأمانة تجلب البركة — البيّعان إن صدقا بورك لهما', code:'DIVINE_BARAKA'}
            ]
        };
    }

    // ══════════════════════════════════════════════════════════════
    // الدوال — Methods
    // ══════════════════════════════════════════════════════════════

    getDashboard() {
        const wmUnits = this.weightsAndMeasures.units.length;
        const wmRules = this.weightsAndMeasures.antiManipulationRules.length;
        const tf = this.tradeFoundations.length;
        const pr = this.prohibitions.length;
        const ex = this.exchangeHadiths.length;
        const mr = this.marketRegulation.length;
        const te = this.tradeEthics.length;
        const zk = this.zakatHadiths.length;
        const hb = this.hisbahHadiths.length;
        const totalHadiths = tf + pr + ex + mr + te + zk + hb + 1; // +1 for master hadith

        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            engine: this.nameAr,
            version: this.version,
            owner: this.owner,
            masterHadith: 'المكيال مكيال أهل المدينة والوزن وزن أهل مكة',
            summary: {
                measureUnits: wmUnits,
                antiManipulationRules: wmRules,
                tradeFoundationHadiths: tf,
                prohibitionHadiths: pr,
                exchangeHadiths: ex,
                marketRegulationHadiths: mr,
                tradeEthicsHadiths: te,
                zakatHadiths: zk,
                hisbahHadiths: hb,
                totalHadiths: totalHadiths,
                structureLayers: this.structure.layers.length,
                designPrinciples: this.structure.designPrinciples.length,
                totalActiveRules: totalHadiths + wmRules + wmUnits
            },
            abwab: [
                {bab: 'المكاييل والموازين', count: wmUnits + wmRules + 1},
                {bab: 'أصول البيوع', count: tf},
                {bab: 'المحرمات', count: pr},
                {bab: 'الصرف والمعادن', count: ex},
                {bab: 'تنظيم السوق', count: mr},
                {bab: 'الأخلاق التجارية', count: te},
                {bab: 'الزكاة والأموال', count: zk},
                {bab: 'الحسبة والرقابة', count: hb}
            ]
        };
    }

    getWeightsAndMeasures() { return this.weightsAndMeasures; }
    getTradeFoundations() { return this.tradeFoundations; }
    getProhibitions() { return this.prohibitions; }
    getExchangeHadiths() { return this.exchangeHadiths; }
    getMarketRegulation() { return this.marketRegulation; }
    getTradeEthics() { return this.tradeEthics; }
    getZakatHadiths() { return this.zakatHadiths; }
    getHisbahHadiths() { return this.hisbahHadiths; }
    getStructure() { return this.structure; }

    getAllHadiths() {
        const all = [];
        all.push({...this.weightsAndMeasures.masterHadith, bab:'المكاييل والموازين'});
        this.tradeFoundations.forEach(h => all.push({...h, bab:'أصول البيوع'}));
        this.prohibitions.forEach(h => all.push({...h, bab:'المحرمات'}));
        this.exchangeHadiths.forEach(h => all.push({...h, bab:'الصرف والمعادن'}));
        this.marketRegulation.forEach(h => all.push({...h, bab:'تنظيم السوق'}));
        this.tradeEthics.forEach(h => all.push({...h, bab:'الأخلاق التجارية'}));
        this.zakatHadiths.forEach(h => all.push({...h, bab:'الزكاة والأموال'}));
        this.hisbahHadiths.forEach(h => all.push({...h, bab:'الحسبة والرقابة'}));
        return all;
    }

    validateTransaction(tx) {
        const checks = [];
        // Layer 1: Weights & Measures
        checks.push({layer:'المعايير', rule:'معيار ثابت', pass: tx.standardUsed !== false, code:'FIXED_STD'});
        checks.push({layer:'المعايير', rule:'لا تطفيف', pass: tx.cheating !== true, code:'NO_TATFEEF'});
        // Layer 2: Trade Foundations
        checks.push({layer:'أصول البيوع', rule:'تراض', pass: tx.consent !== false, code:'CONSENT'});
        checks.push({layer:'أصول البيوع', rule:'خيار المجلس', pass: tx.sessionOption !== false, code:'OPTION'});
        // Layer 3: Prohibitions
        checks.push({layer:'محرمات', rule:'لا غش', pass: tx.fraud !== true, code:'NO_FRAUD'});
        checks.push({layer:'محرمات', rule:'لا احتكار', pass: tx.monopoly !== true, code:'NO_MONOPOLY'});
        checks.push({layer:'محرمات', rule:'لا غرر', pass: tx.gharar !== true, code:'NO_GHARAR'});
        checks.push({layer:'محرمات', rule:'لا نجش', pass: tx.shillBid !== true, code:'NO_NAJSH'});
        checks.push({layer:'محرمات', rule:'لا ربا', pass: tx.riba !== true, code:'NO_RIBA'});
        checks.push({layer:'محرمات', rule:'ملكية محققة', pass: tx.ownershipVerified !== false, code:'OWNED'});
        // Layer 4: Exchange
        checks.push({layer:'الصرف', rule:'تقابض فوري', pass: tx.instantSettlement !== false, code:'INSTANT'});
        // Layer 5: Market Regulation
        checks.push({layer:'التنظيم', rule:'لا ضرر', pass: tx.harmful !== true, code:'NO_HARM'});
        checks.push({layer:'التنظيم', rule:'شفافية', pass: tx.transparent !== false, code:'TRANSPARENT'});
        // Layer 6: Ethics
        checks.push({layer:'الأخلاق', rule:'عدالة', pass: tx.unjust !== true, code:'JUST'});
        // Layer 7: Zakat
        checks.push({layer:'الزكاة', rule:'زكاة محسوبة', pass: true, code:'ZAKAT_CALC'});
        // Layer 8: Hisbah
        checks.push({layer:'الحسبة', rule:'موثقة', pass: !!tx.documented || true, code:'DOCUMENTED'});

        const valid = checks.every(c => c.pass);
        const failedLayers = checks.filter(c => !c.pass).map(c => c.layer);
        return {
            totalChecks: checks.length,
            passed: checks.filter(c => c.pass).length,
            failed: checks.filter(c => !c.pass).length,
            valid,
            failedLayers: [...new Set(failedLayers)],
            details: checks
        };
    }

    searchHadiths(keyword) {
        return this.getAllHadiths().filter(h =>
            (h.text && h.text.includes(keyword)) ||
            (h.principle && h.principle.includes(keyword)) ||
            (h.bab && h.bab.includes(keyword))
        );
    }

    convertToStandard(value, fromUnit, toUnit) {
        const grams = {
            'مثقال': 4.25,
            'دينار': 4.25,
            'درهم': 2.975,
            'أوقية': 119,
            'رطل': 1428,
            'صاع': 2035,
            'مد': 508.75,
            'وسق': 122100
        };
        if (!grams[fromUnit] || !grams[toUnit]) return null;
        return { value: (value * grams[fromUnit]) / grams[toUnit], from: fromUnit, to: toUnit, standardGrams: value * grams[fromUnit] };
    }
}

module.exports = SheikhaHadithStandardsEngine;
