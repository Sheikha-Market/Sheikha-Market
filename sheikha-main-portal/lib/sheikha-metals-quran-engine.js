/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — محرك المعادن القرآني
 * "الأصل القرآني والسني للمعادن — المصدر الأول للمعرفة"
 *
 * ﴿أَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾ — الحديد:25
 * ﴿وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ﴾ — الأنبياء:80
 *
 * الهيكل:
 *   §1  QURAN_METALS_AYAT      — آيات القرآن الكريم عن المعادن
 *   §2  SUNNAH_METALS_HADITHS  — أحاديث نبوية عن الذهب والفضة والتجارة
 *   §3  METALS_FIQH_RULINGS    — أحكام فقهية للمعادن (زكاة، ربا، بيع)
 *   §4  ISRA_QURAN_CONNECTIONS — الربط القرآني بالمعادن الصناعية
 *   §5  QuranMetalsKnowledge   — قاعدة المعرفة القرآنية المعدنية
 *   §6  FiqhMetalsAdvisor      — المستشار الفقهي للمعادن
 *   §7  SheikhaMetalsQuranEngine — المحرك الرئيسي
 *   §8  التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// §1 — QURAN_METALS_AYAT
//      آيات صريحة في المعادن (ذكر أو دلالة)
// ══════════════════════════════════════════════════════════════════════════════

const QURAN_METALS_AYAT = [
    // ───── الحديد ─────
    {
        ayah:  'الحديد:25',
        arabic:'﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ وَلِيَعْلَمَ اللَّهُ مَن يَنصُرُهُ وَرُسُلَهُ بِالْغَيْبِ إِنَّ اللَّهَ قَوِيٌّ عَزِيزٌ﴾',
        surah: 'الحديد (57:25)',
        metals:['Fe', 'Steel', 'HMS1', 'HMS2'],
        lesson:'الحديد منزل من الله — يحمل قوة الدفاع وفائدة للناس. تجارته مشروعة ومباركة.',
        application:'قطاع الصلب والسكراب الحديدي — أعظم الصناعات وأوسعها نفعاً.',
    },
    {
        ayah:  'الكهف:96',
        arabic:'﴿آتُونِي زُبَرَ الْحَدِيدِ حَتَّى إِذَا سَاوَى بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا﴾',
        surah: 'الكهف (18:96)',
        metals:['Fe', 'Steel'],
        lesson:'ذو القرنين استخدم زبر الحديد (قطع ضخمة) لبناء السد — الهندسة والصناعة من سنن الله.',
        application:'التصنيع الانشائي + فهم درجات الصلب + الحرارة العالية في الصهر.',
    },
    {
        ayah:  'سبأ:10',
        arabic:'﴿وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلاً يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ وَأَلَنَّا لَهُ الْحَدِيدَ﴾',
        surah: 'سبأ (34:10)',
        metals:['Fe', 'Steel'],
        lesson:'إلانة الحديد: إشارة إلى القدرة الإلهية في تليين المعادن — أصل علم التطريق',
        application:'صهر الحديد + التشكيل الساخن + معالجة المعادن.',
    },
    {
        ayah:  'سبأ:11',
        arabic:'﴿أَنِ اعْمَلْ سَابِغَاتٍ وَقَدِّرْ فِي السَّرْدِ وَاعْمَلُوا صَالِحاً﴾',
        surah: 'سبأ (34:11)',
        metals:['Fe'],
        lesson:'تقدير الحلقات في الدروع — دقة التصنيع والقياس في العمل',
        application:'معايير الجودة + تقدير الوزن والسُّمك + الالتزام في الصنعة.',
    },
    {
        ayah:  'الأنبياء:80',
        arabic:'﴿وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّنْ بَأْسِكُمْ﴾',
        surah: 'الأنبياء (21:80)',
        metals:['Fe', 'Steel'],
        lesson:'تعليم الصنعة من الله — الحرف الحديدية تعليميٌ إلهي',
        application:'بناء درع + حماية + صناعة المعادن لحماية الناس.',
    },
    // ───── الذهب ─────
    {
        ayah:  'البقرة:261',
        arabic:'﴿مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ﴾',
        surah: 'البقرة (2:261)',
        metals:['Au', 'Ag'],
        lesson:'المال (والذهب منه) يُبارك عند الإنفاق في سبيل الله',
        application:'زكاة الذهب + الصدقة + مفهوم الثروة النامية.',
    },
    {
        ayah:  'التوبة:34',
        arabic:'﴿وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلَا يُنفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ﴾',
        surah: 'التوبة (9:34)',
        metals:['Au', 'Ag'],
        lesson:'تكنيز الذهب والفضة دون إخراج الزكاة — محرم',
        application:'وجوب زكاة الذهب إذا بلغ النصاب وحال الحول.',
    },
    {
        ayah:  'الكهف:31',
        arabic:'﴿يُحَلَّوْنَ فِيهَا مِنْ أَسَاوِرَ مِن ذَهَبٍ وَيَلْبَسُونَ ثِيَاباً خُضْراً مِّن سُندُسٍ وَإِسْتَبْرَقٍ﴾',
        surah: 'الكهف (18:31)',
        metals:['Au'],
        lesson:'الذهب في الجنة — يدل على شرف المعدن وعلو منزلته خلقاً',
        application:'الذهب في صنعة المجوهرات والحلي — حلال للنساء.',
    },
    // ───── الفضة ─────
    {
        ayah:  'الإنسان:15',
        arabic:'﴿وَيُطَافُ عَلَيْهِم بِآنِيَةٍ مِّن فِضَّةٍ وَأَكْوَابٍ كَانَتْ قَوَارِيرَا﴾',
        surah: 'الإنسان (76:15)',
        metals:['Ag'],
        lesson:'الفضة في الجنة — نعمة الله، وشرف تجارتها',
        application:'صناعة الفضة + حلي المرأة + خاتم الرجل.',
    },
    // ───── النحاس (الصُّفر) ─────
    {
        ayah:  'سبأ:12',
        arabic:'﴿وَلِسُلَيْمَانَ الرِّيحَ غُدُوُّهَا شَهْرٌ وَرَوَاحُهَا شَهْرٌ وَأَسَلْنَا لَهُ عَيْنَ الْقِطْرِ﴾',
        surah: 'سبأ (34:12)',
        metals:['Cu', 'Brass', 'Bronze'],
        lesson:'القطر = النحاس المنصهر — أسال الله لسليمان ينبوع نحاس للبناء',
        application:'صناعة النحاس + السبائك الصفراء + تجارة الصفر والبرونز.',
    },
    // ───── مبادئ تجارة عامة ─────
    {
        ayah:  'المطففين:1-3',
        arabic:'﴿وَيْلٌ لِّلْمُطَفِّفِينَ ٭ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ ٭ وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ﴾',
        surah: 'المطففين (83:1-3)',
        metals:['ALL'],
        lesson:'دقة الوزن والكيل واجبة في جميع السلع بما فيها المعادن',
        application:'معايير الوزن + موازين معتمدة + عدم الغش في السكراب.',
    },
    {
        ayah:  'الأعراف:85',
        arabic:'﴿وَلَا تَنقُصُوا الْمِكْيَالَ وَالْمِيزَانَ إِنِّي أَرَاكُم بِخَيْرٍ﴾',
        surah: 'الأعراف (7:85)',
        metals:['ALL'],
        lesson:'أمر الله بالوفاء بالكيل والميزان — يشمل المعادن والسكراب',
        application:'التوزين الدقيق + شهادات المعمل + أجهزة القياس المعتمدة.',
    },
    {
        ayah:  'النساء:29',
        arabic:'﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ﴾',
        surah: 'النساء (4:29)',
        metals:['ALL'],
        lesson:'البيع عن تراضٍ — الإيجاب والقبول الحر أساس العقد',
        application:'عقود بيع المعادن + الموافقة المبينة + وثائق الصفقة.',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §2 — SUNNAH_METALS_HADITHS
//      أحاديث نبوية في الذهب، الفضة، النحاس، التجارة
// ══════════════════════════════════════════════════════════════════════════════

const SUNNAH_METALS_HADITHS = [
    {
        id:       'H-001',
        text:     '«الذهب بالذهب والفضة بالفضة... يداً بيد، فمن زاد أو استزاد فقد أربى»',
        source:   'رواه مسلم — كتاب المساقاة والمزارعة',
        metals:   ['Au', 'Ag'],
        lesson:   'ربا الفضل محرم في الذهب بالذهب والفضة بالفضة — لا مرابحة بين متجانسين',
        ruling:   'يجب التساوي والتقابض في مجلس البيع',
    },
    {
        id:       'H-002',
        text:     '«لا تبيعوا الذهب بالذهب إلا مثلاً بمثل، ولا تشفوا بعضها على بعض»',
        source:   'متفق عليه',
        metals:   ['Au', 'Ag', 'Cu'],
        lesson:   'بيع الذهب بالذهب يتطلب المثلية والتقابض الفوري',
        ruling:   'الربا الصريح — لا فضل في التبادل',
    },
    {
        id:       'H-003',
        text:     '«التاجر الصدوق الأمين مع النبيين والصديقين والشهداء»',
        source:   'رواه الترمذي — حسن',
        metals:   ['ALL'],
        lesson:   'التاجر الأمين ينال أعلى مراتب الآخرة',
        ruling:   'الصدق في وصف المعادن والسكراب — الأمانة في الوزن والجودة',
    },
    {
        id:       'H-004',
        text:     '«نهى رسول الله ﷺ عن بيع الغرر»',
        source:   'رواه مسلم',
        metals:   ['ALL'],
        lesson:   'الغرر: كل بيع يتضمن جهالة أو مخاطرة تؤثر على العقد',
        ruling:   'وصف السكراب دقيقاً + تحديد الكمية + الكشف عن العيوب',
    },
    {
        id:       'H-005',
        text:     '«من غشنا فليس منا»',
        source:   'رواه مسلم',
        metals:   ['ALL'],
        lesson:   'الغش في المعادن وإخفاء العيوب محرم قطعاً',
        ruling:   'الإفصاح الكامل عن درجة السكراب والشوائب',
    },
    {
        id:       'H-006',
        text:     '«البيعان بالخيار ما لم يتفرقا»',
        source:   'متفق عليه',
        metals:   ['ALL'],
        lesson:   'خيار المجلس: للبائع والمشتري حق الفسخ قبل التفرق',
        ruling:   'في العقود الإلكترونية: حتى يتم إرسال الموافقة النهائية',
    },
    {
        id:       'H-007',
        text:     '«لا يحل لمسلم أن يبيع شيئاً إلا بيّن ما فيه»',
        source:   'رواه أحمد وابن ماجة',
        metals:   ['ALL'],
        lesson:   'الإفصاح عن العيوب واجب في كل بيع',
        ruling:   'وصف المعدن/السكراب بصدق في عقد البيع',
    },
    {
        id:       'H-008',
        text:     '«من احتكر طعاماً أربعين ليلة فقد برئ من الله وبرئ الله منه»',
        source:   'رواه أحمد والحاكم',
        metals:   ['ALL'],
        lesson:   'الاحتكار محرم — وينسحب على المعادن الأساسية عند الشُّح',
        ruling:   'لا حبس للمعادن الأساسية لرفع الأسعار قسراً',
    },
    {
        id:       'H-009',
        text:     '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
        source:   'رواه الطبراني والبيهقي',
        metals:   ['ALL'],
        lesson:   'الإتقان في صنع المعادن ومعالجة السكراب عبادة',
        ruling:   'جودة الإنتاج + دقة التصنيف + الالتزام بالمعايير',
    },
    {
        id:       'H-010',
        text:     '«دعا رسول الله ﷺ لآل إبراهيم بالبركة في الميزان وبالبركة في الصاع»',
        source:   'رواه أبو داود',
        metals:   ['ALL'],
        lesson:   'الدعاء للتجار الصادقين — البركة مقرونة بالعدل في الميزان',
        ruling:   'موازين معتمدة + شهادات قياس دورية.',
    },
    {
        id:       'H-011',
        text:     '«رفع القلم عن ثلاثة»',
        source:   'أبو داود والنسائي',
        metals:   ['Au', 'Ag'],
        lesson:   'المعتوه والنائم والصبي لا تصح معاملاتهم — الأهلية شرط',
        ruling:   'التحقق من أهلية أطراف عقود المعادن',
    },
    {
        id:       'H-012',
        text:     '«أحل الله البيع وحرّم الربا» — تذكير بالأصل الشرعي',
        source:   'البقرة 275 — مبدأ استدل به الفقهاء',
        metals:   ['ALL'],
        lesson:   'البيع الحقيقي حلال — الربا بكل أنواعه محرم',
        ruling:   'المعاملة القائمة على بيع فعلي للمعادن حلال',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// §3 — METALS_FIQH_RULINGS
//      أحكام فقهية مختارة للمعادن والسكراب
// ══════════════════════════════════════════════════════════════════════════════

const METALS_FIQH_RULINGS = {
    zakah: {
        gold: {
            nisab:     85,  // غرام
            rate:      2.5, // %
            condition: 'إذا بلغ 85 غرام وحال عليه الحول',
            note:      'زكاة الذهب المعلق (حلي المرأة): خلاف — الراجح: زكاة النساء في الحلي المعتاد غير واجبة عند جمهور الفقهاء',
        },
        silver: {
            nisab:     595,
            rate:      2.5,
            condition: 'إذا بلغ 595 غرام وحال عليه الحول',
        },
        tradeMetals: {
            rate:      2.5,
            condition: 'عروض التجارة — القيمة السوقية في نهاية الحول',
            note:      'المعادن للتجارة تُزكى كعروض تجارة — القيمة السوقية × 2.5%',
        },
    },
    riba: {
        riba_fadl: {
            definition: 'بيع الجنس بجنسه مع الزيادة',
            examples:   ['ذهب بذهب مع زيادة', 'فضة بفضة مع زيادة', 'حديد بحديد مع زيادة عند الحنابلة'],
            ruling:     'حرام — يشترط التماثل + التقابض',
        },
        riba_nasiah: {
            definition: 'تأخير أحد العوضين في بيع الأجناس الربوية',
            examples:   ['ذهب نقداً مقابل ذهب آجل', 'فضة فورية مقابل سعر آجل'],
            ruling:     'حرام — يشترط التقابض الفوري في مجلس البيع',
        },
        allowed: [
            'ذهب بفضة — يجوز مع التقابض وبأي نسبة',
            'ذهب بريال سعودي — عملة ورقية — يجوز نقداً',
            'حديد بنحاس — جنسان مختلفان — يجوز',
        ],
    },
    contracts: {
        murabaha: {
            name:   'المرابحة',
            halal:  true,
            model:  'البنك يشتري + يبيع بهامش معلوم',
            steps:  ['شراء السلعة فعلياً', 'حيازتها', 'بيعها بسعر معلوم + هامح معلوم'],
            risks:  ['لا تبيع ما لم تملك', 'لا بد من حيازة فعلية أو حكمية'],
        },
        salam: {
            name:   'بيع السلم',
            halal:  true,
            model:  'الدفع فوري + التسليم آجل',
            conditions: ['الثمن يُدفع كاملاً في المجلس', 'المبيع موصوف وصفاً دقيقاً', 'الأجل معلوم', 'مكان التسليم محدد'],
            note:   'استثناء مشروع — نص عليه الحديث النبوي في التمر',
        },
        istisna: {
            name:   'الاستصناع',
            halal:  true,
            model:  'عقد تصنيع بمواصفات محددة',
            conditions: ['وصف دقيق للمنتج', 'الأجل محدد', 'السعر متفق عليه'],
            note:   'مناسب لعقود تصنيع الفولاذ والإنشاء',
        },
        spot: {
            name:   'البيع الفوري',
            halal:  true,
            note:   'الأصل في البيوع — يشترط الحيازة قبل إعادة البيع',
        },
    },
    halal_criteria: {
        general: [
            'المعدن موجود وقابل للتسليم',
            'السعر معلوم ومحدد',
            'البائع يملك المعدن أو وكيل عنه',
            'الكمية والجودة محددتان',
            'الثمن حاضر أو آجل معلوم',
            'لا ضرر ولا شرط مخالف للشرع',
        ],
        scrap_specific: [
            'التصنيف الصادق (ISRI أو ما يقابله)',
            'الوزن بميزان معتمد',
            'الإفصاح عن الشوائب والملوثات',
            'عدم خلط الأصناف المختلفة بدون بيان',
        ],
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// §4 — ISRA_QURAN_CONNECTIONS
//      الربط بين أكواد ISRI والمصدر القرآني
// ══════════════════════════════════════════════════════════════════════════════

const ISRA_QURAN_CONNECTIONS = {
    '201': { isri: 'HMS1', arabic: 'حديد ثقيل #1', ayah: 'الحديد:25', lesson: 'الحديد فيه منافع للناس — تجارته مباركة' },
    '202': { isri: 'HMS2', arabic: 'حديد ثقيل #2', ayah: 'الحديد:25', lesson: 'كل فئات الحديد داخلة في الآية' },
    '102': { isri: 'Birch', arabic: 'نحاس Birch', ayah: 'سبأ:12', lesson: 'النحاس المنصهر — نعمة الله لسليمان' },
    '105': { isri: 'Candy', arabic: 'نحاس خفيف Candy', ayah: 'سبأ:12', lesson: 'القطر — النحاس الجيد' },
    '406': { isri: 'Twitch', arabic: 'ألومنيوم قصاصات', ayah: 'الأنبياء:80', lesson: 'الصنعة كمال للناس' },
    '240': { isri: 'Zorba', arabic: 'مختلط غير حديدي', ayah: 'سبأ:11', lesson: 'وقدّر في السرد — الدقة في التصنيف واجبة' },
    'Au':  { isri: 'Gold', arabic: 'ذهب', ayah: 'التوبة:34',  lesson: 'الذهب نعمة — لا يُكنز بل يُزكى' },
    'Ag':  { isri: 'Silver', arabic: 'فضة', ayah: 'الإنسان:15', lesson: 'الفضة شريفة — حلي مباح للنساء' },
};

// ══════════════════════════════════════════════════════════════════════════════
// §5 — QuranMetalsKnowledge
//      قاعدة البحث والاسترجاع
// ══════════════════════════════════════════════════════════════════════════════

class QuranMetalsKnowledge {
    constructor() {
        this.ayat    = QURAN_METALS_AYAT;
        this.hadiths = SUNNAH_METALS_HADITHS;
        this.isri    = ISRA_QURAN_CONNECTIONS;

        // فهرسة بالمعدن
        this._metalIndex = this._buildMetalIndex();
    }

    _buildMetalIndex() {
        const idx = {};
        for (const ayah of this.ayat) {
            for (const m of ayah.metals) {
                if (!idx[m]) idx[m] = { ayat: [], hadiths: [] };
                idx[m].ayat.push(ayah);
            }
        }
        for (const h of this.hadiths) {
            for (const m of h.metals) {
                if (!idx[m]) idx[m] = { ayat: [], hadiths: [] };
                idx[m].hadiths.push(h);
            }
        }
        return idx;
    }

    // استرجاع المصادر الشرعية لمعدن محدد
    getForMetal(metalId) {
        const direct = this._metalIndex[metalId] || { ayat: [], hadiths: [] };
        const all    = this._metalIndex['ALL'] || { ayat: [], hadiths: [] };
        const isri   = this.isri[metalId] || null;
        return {
            metal:   metalId,
            ayat:    [...direct.ayat, ...all.ayat],
            hadiths: [...direct.hadiths, ...all.hadiths],
            isriRef: isri,
            count:   { ayat: direct.ayat.length + all.ayat.length, hadiths: direct.hadiths.length + all.hadiths.length },
        };
    }

    // البحث النصي
    search(query) {
        const q = query?.toLowerCase() || '';
        const matchedAyat    = this.ayat.filter(a => a.arabic.includes(query) || a.lesson.includes(query) || a.application?.includes(query));
        const matchedHadiths = this.hadiths.filter(h => h.text.includes(query) || h.lesson.includes(query) || h.ruling?.includes(query));
        return { query, ayat: matchedAyat, hadiths: matchedHadiths, total: matchedAyat.length + matchedHadiths.length };
    }

    // الأحكام الفقهية
    getFiqhRuling(topic) {
        const rulings = METALS_FIQH_RULINGS;
        if (topic === 'zakah')    return rulings.zakah;
        if (topic === 'riba')     return rulings.riba;
        if (topic === 'contracts')return rulings.contracts;
        if (topic === 'halal')    return rulings.halal_criteria;
        return rulings;
    }

    // حساب الزكاة
    calculateZakah(metalType, weightGrams, pricePerGram) {
        const rules = METALS_FIQH_RULINGS.zakah;
        if (metalType === 'Au' || metalType === 'gold') {
            const nisab     = rules.gold.nisab;
            const obligated = weightGrams >= nisab;
            const amount    = obligated ? weightGrams * pricePerGram * (rules.gold.rate / 100) : 0;
            return {
                metal: 'ذهب', weightGrams, pricePerGram, nisabGrams: nisab,
                obligated, rate: obligated ? rules.gold.rate : 0,
                zakahAmount: +amount.toFixed(2), currency: 'SAR',
                note: rules.gold.note,
                ayah: '﴿وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ...﴾',
            };
        }
        if (metalType === 'Ag' || metalType === 'silver') {
            const nisab     = rules.silver.nisab;
            const obligated = weightGrams >= nisab;
            const amount    = obligated ? weightGrams * pricePerGram * (rules.silver.rate / 100) : 0;
            return {
                metal: 'فضة', weightGrams, pricePerGram, nisabGrams: nisab,
                obligated, rate: obligated ? rules.silver.rate : 0,
                zakahAmount: +amount.toFixed(2), currency: 'SAR',
            };
        }
        // للمعادن التجارية
        const totalValue = weightGrams * pricePerGram;
        const amount     = totalValue * (rules.tradeMetals.rate / 100);
        return {
            metal: metalType, type: 'عروض تجارة', totalValue, rate: rules.tradeMetals.rate,
            zakahAmount: +amount.toFixed(2), currency: 'SAR',
            note: rules.tradeMetals.note,
        };
    }

    getStats() {
        return {
            totalAyat:    this.ayat.length,
            totalHadiths: this.hadiths.length,
            indexedMetals: Object.keys(this._metalIndex).length,
            isriConnections: Object.keys(this.isri).length,
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §6 — FiqhMetalsAdvisor
//      المستشار الفقهي — يُقدّم المرجع الشرعي لكل معاملة
// ══════════════════════════════════════════════════════════════════════════════

class FiqhMetalsAdvisor {
    constructor(knowledge) {
        this.knowledge = knowledge;
    }

    // تقرير شرعي شامل لمعاملة
    assessTransaction({ contractType, metals, amount, parties, deferred = false }) {
        const ribaRules  = this.knowledge.getFiqhRuling('riba');
        const contracts  = this.knowledge.getFiqhRuling('contracts');
        const halal      = this.knowledge.getFiqhRuling('halal');

        const riskFlags  = [];
        const goodPoints = [];
        let   compliant  = true;

        // فحص الربا
        if (contractType === 'swap' && metals?.length === 2 && metals[0] === metals[1]) {
            riskFlags.push({ type: 'ربا الفضل', detail: ribaRules.riba_fadl.definition });
            compliant = false;
        }
        if (deferred && ['Au', 'Ag'].some(m => metals?.includes(m))) {
            riskFlags.push({ type: 'ربا النسيئة', detail: ribaRules.riba_nasiah.definition });
            compliant = false;
        }

        // نقاط إيجابية
        if (contractType === 'murabaha' && !deferred) goodPoints.push('المرابحة بشروطها ✅');
        if (contractType === 'salam')    goodPoints.push('بيع السلم المستوفي للشروط ✅');
        if (contractType === 'spot')     goodPoints.push('بيع فوري — الأصل الجائز ✅');

        const primaryRef = this.knowledge.getForMetal(metals?.[0] || 'ALL');

        return {
            verdict:    compliant ? '✅ مطابق مبدئياً' : '⚠️ يحتاج مراجعة شرعية',
            compliant,
            riskFlags,
            goodPoints,
            suggestedContract: contracts[contractType] || contracts.spot,
            quranRef:   primaryRef.ayat[0] || null,
            hadithRef:  primaryRef.hadiths[0] || null,
            halalCriteria: halal.general,
            disclaimer: '⚠️ اقتراح ومراجعة — ليس فتوى ملزمة. استشر عالم شريعة معتمد.',
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §7 — SheikhaMetalsQuranEngine
//      المحرك الرئيسي
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaMetalsQuranEngine {
    constructor() {
        this.version       = '1.0.0';
        this.bism          = 'بسم الله الرحمن الرحيم';
        this.knowledge     = new QuranMetalsKnowledge();
        this.advisor       = new FiqhMetalsAdvisor(this.knowledge);
        this.isInitialized = false;
        this.queries       = 0;
    }

    async initialize() {
        this.isInitialized = true;
        const stats = this.knowledge.getStats();
        console.log(`✅ [ACTIVE] sheikha-metals-quran-engine.js — ${stats.totalAyat} آية | ${stats.totalHadiths} حديث | ${stats.indexedMetals} معدن`);
        return this;
    }

    // الآيات المتعلقة بمعدن
    getAyatForMetal(metalId) {
        this.queries++;
        return this.knowledge.getForMetal(metalId);
    }

    // بحث نصي
    search(query) {
        this.queries++;
        return this.knowledge.search(query);
    }

    // أحكام فقهية
    getFiqhRuling(topic) {
        this.queries++;
        return this.knowledge.getFiqhRuling(topic);
    }

    // حساب الزكاة
    calculateZakah(metalType, weightGrams, pricePerGram) {
        this.queries++;
        return this.knowledge.calculateZakah(metalType, weightGrams, pricePerGram);
    }

    // تقييم معاملة شرعياً
    assessTransaction(params) {
        this.queries++;
        return this.advisor.assessTransaction(params);
    }

    // ربط ISRI بالمصدر القرآني
    getIsriConnection(isriCode) {
        this.queries++;
        return ISRA_QURAN_CONNECTIONS[isriCode] || { note: 'ابحث في قاعدة المعرفة' };
    }

    // آية عشوائية للقراءة اليومية
    getDailyVerse() {
        const idx  = Math.floor(Date.now() / 86400000) % QURAN_METALS_AYAT.length;
        return { ...QURAN_METALS_AYAT[idx], type: 'آية اليوم' };
    }

    // حديث عشوائي للتذكير
    getDailyHadith() {
        const idx = Math.floor(Date.now() / 86400000) % SUNNAH_METALS_HADITHS.length;
        return { ...SUNNAH_METALS_HADITHS[idx], type: 'حديث اليوم' };
    }

    getStatus() {
        return {
            system:        'SHEIKHA Metals Quran Engine',
            version:       this.version,
            bism:          this.bism,
            isInitialized: this.isInitialized,
            stats:         this.knowledge.getStats(),
            queries:       this.queries,
            islamicRoot:   '﴿أَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾',
            featured: {
                verse:  QURAN_METALS_AYAT[0].arabic,
                hadith: SUNNAH_METALS_HADITHS[0].text,
            },
            timestamp: new Date().toISOString(),
        };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// §8 — التصدير
// ══════════════════════════════════════════════════════════════════════════════

const engineInstance = new SheikhaMetalsQuranEngine();

module.exports = {
    SheikhaMetalsQuranEngine,
    QuranMetalsKnowledge,
    FiqhMetalsAdvisor,
    QURAN_METALS_AYAT,
    SUNNAH_METALS_HADITHS,
    METALS_FIQH_RULINGS,
    ISRA_QURAN_CONNECTIONS,
    engine:          engineInstance,
    async init()     { return await engineInstance.initialize(); },
    getStatus()      { return engineInstance.getStatus(); },
    version:         '1.0.0',
    bism:            'بسم الله الرحمن الرحيم',
};
