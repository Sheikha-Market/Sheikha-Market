/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 شبكة شيخة العصبية للموارد
 * SHEIKHA RESOURCES NEURAL NETWORK
 * الشبكة العصبية الشاملة لتحليل وتحسين وتوزيع كل موارد الكون
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "وَلَقَدْ مَكَّنَّاكُمْ فِي الْأَرْضِ وَجَعَلْنَا لَكُمْ فِيهَا مَعَايِشَ" — الأعراف ١٠
 * "وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ" — الجاثية ١٣
 * "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ" — الملك ١٥
 * "وَآتَاكُم مِّن كُلِّ مَا سَأَلْتُمُوهُ وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا" — إبراهيم ٣٤
 *
 * تغطي هذه الشبكة كل أصناف الموارد:
 *
 * ✅ الموارد الطبيعية       (المعادن، النفط، الغاز، المياه، الأراضي، الغابات، البحار)
 * ✅ الموارد الزراعية       (المحاصيل، الثروة الحيوانية، الري، تقنيات الزراعة)
 * ✅ الموارد الطاقوية       (النفط، الغاز، الطاقة المتجددة، الطاقة النووية، الهيدروجين)
 * ✅ الموارد البشرية         (القوى العاملة، المهارات، التعليم، الرعاية الاجتماعية)
 * ✅ الموارد المالية          (رأس المال، الاستثمارات، الزكاة، الوقف، صناديق التنمية)
 * ✅ الموارد الرقمية         (البيانات، البرمجيات، نماذج الذكاء الاصطناعي، البنية التحتية)
 * ✅ الموارد الصناعية        (المواد الخام، المصانع، التصنيع، سلاسل الإمداد)
 * ✅ الموارد المعرفية         (البحث العلمي، الابتكار، الملكية الفكرية، البراءات)
 * ✅ الموارد البيئية          (الغلاف الجوي، التنوع البيولوجي، دورة الكربون، المناخ)
 * ✅ الموارد الاستراتيجية    (الأمن الغذائي، الدواء، الدفاع، الاحتياطيات الوطنية)
 *
 * + شبكة عصبية مدمجة تصنّف وتتنبأ وتحسّن توزيع كل مورد
 * + فلتر شرعي إسلامي لضمان الاستخدام الأمثل والعادل
 * + تكامل مع كل محركات منظومة شيخة
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── استيراد الشبكة العصبية الأساسية ─────────────────────────────────────────
let SheikhaNeural = null;
let NeuralNetwork = null;
try {
    const neuralCore = require('./sheikha-neural-core');
    SheikhaNeural  = neuralCore.SheikhaNeural;
    NeuralNetwork  = neuralCore.NeuralNetwork;
} catch (_) {
    // تعمل بدون الشبكة العصبية إذا لم يكن الملف متاحًا
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. تصنيف الموارد الكوني الشامل — UNIVERSAL RESOURCE TAXONOMY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * كل جنس ونوع وصفة لكل مورد في الكون
 * مُرتَّبة بمقياس التوحيد: من أصل الخلق إلى المنفعة البشرية
 */
const RESOURCE_TAXONOMY = {

    // ══════════════════════════════════════════════════════
    // الجنس الأول: الموارد الطبيعية
    // ══════════════════════════════════════════════════════
    natural: {
        id: 'natural',
        nameAr: 'الموارد الطبيعية',
        nameEn: 'Natural Resources',
        maqsad: 'ARD',
        icon: '🌍',
        quranRef: '﴿ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ ﴾ — الحجر ١٩',
        types: [
            {
                id: 'minerals', nameAr: 'المعادن', nameEn: 'Minerals', icon: '⛏️',
                renewable: false,
                items: [
                    { nameAr: 'ذهب', nameEn: 'Gold', symbol: 'Au', uses: ['عملة', 'مجوهرات', 'إلكترونيات', 'طب'] },
                    { nameAr: 'فضة', nameEn: 'Silver', symbol: 'Ag', uses: ['عملة', 'طب', 'إلكترونيات', 'مرايا'] },
                    { nameAr: 'حديد', nameEn: 'Iron', symbol: 'Fe', uses: ['بناء', 'صناعة', 'أدوات'], quranRef: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ' },
                    { nameAr: 'نحاس', nameEn: 'Copper', symbol: 'Cu', uses: ['أسلاك كهربائية', 'سباكة', 'عملة'] },
                    { nameAr: 'ألومنيوم', nameEn: 'Aluminium', symbol: 'Al', uses: ['طيران', 'تعبئة', 'بناء'] },
                    { nameAr: 'ليثيوم', nameEn: 'Lithium', symbol: 'Li', uses: ['بطاريات', 'طاقة متجددة', 'طب نفسي'] },
                    { nameAr: 'بلاتين', nameEn: 'Platinum', symbol: 'Pt', uses: ['محفزات', 'مجوهرات', 'طب'] },
                    { nameAr: 'كوبالت', nameEn: 'Cobalt', symbol: 'Co', uses: ['بطاريات', 'أصباغ', 'فائق الصلابة'] },
                    { nameAr: 'نيكل', nameEn: 'Nickel', symbol: 'Ni', uses: ['فولاذ مقاوم للصدأ', 'بطاريات', 'مسكوكات'] },
                    { nameAr: 'معادن نادرة', nameEn: 'Rare Earth Elements', count: 17, uses: ['تقنية', 'مغناطيسات', 'طاقة خضراء'] },
                ],
                saudiDeposits: ['الذهب (مشعل، المهد، بلغة)', 'الفضة', 'النحاس (جبل صايد)', 'الفوسفات (مانيفة)', 'الألومنيوم (العل)'],
            },
            {
                id: 'water', nameAr: 'المياه', nameEn: 'Water Resources', icon: '💧',
                renewable: true,
                quranRef: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء ٣٠',
                sources: ['أنهار', 'بحيرات', 'مياه جوفية', 'أمطار', 'ثلوج وجليد', 'تحلية', 'بحار ومحيطات'],
                saudiContext: {
                    entity: 'المؤسسة العامة لتحلية المياه المالحة (SWCC)',
                    note: 'السعودية أكبر منتج للمياه المحلاة في العالم',
                    aquifers: ['طبقة الصاج', 'طبقة أم الرضمة', 'الوجه'],
                },
            },
            {
                id: 'land', nameAr: 'الأراضي', nameEn: 'Land Resources', icon: '🏔️',
                renewable: true,
                types: ['زراعية', 'رعوية', 'حرجية', 'حضرية', 'صناعية', 'محمية طبيعية'],
                quranRef: 'وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ — الحجر ١٩',
            },
            {
                id: 'forests', nameAr: 'الغابات', nameEn: 'Forest Resources', icon: '🌲',
                renewable: true,
                products: ['خشب', 'فلين', 'صمغ', 'عسل', 'أعشاب', 'أوكسجين', 'امتصاص كربون'],
                globalArea: '4.06B هكتار (31% من يابسة الأرض)',
                quranRef: 'أَفَرَأَيْتُمُ النَّارَ الَّتِي تُورُونَ أَأَنتُمْ أَنشَأْتُمْ شَجَرَتَهَا أَمْ نَحْنُ الْمُنشِئُونَ — الواقعة ٧١-٧٢',
            },
            {
                id: 'biodiversity', nameAr: 'التنوع البيولوجي', nameEn: 'Biodiversity', icon: '🦋',
                renewable: true,
                items: ['نباتات', 'حيوانات', 'أسماك', 'طيور', 'حشرات', 'كائنات دقيقة'],
                quranRef: 'وَمَا مِن دَابَّةٍ فِي الْأَرْضِ وَلَا طَائِرٍ يَطِيرُ بِجَنَاحَيْهِ إِلَّا أُمَمٌ أَمْثَالُكُم — الأنعام ٣٨',
            },
        ],
        metrics: ['احتياطيات_طن', 'معدل_استنزاف_%/سنة', 'قابلية_التجديد', 'قيمة_سوقية_USD', 'تأثير_بيئي'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثاني: الموارد الطاقوية
    // ══════════════════════════════════════════════════════
    energy: {
        id: 'energy',
        nameAr: 'الموارد الطاقوية',
        nameEn: 'Energy Resources',
        maqsad: 'ARD',
        icon: '⚡',
        quranRef: '﴿ وَسَخَّرَ لَكُمُ الشَّمْسَ وَالْقَمَرَ دَائِبَيْنِ وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ ﴾ — إبراهيم ٣٣',
        types: [
            {
                id: 'fossil', nameAr: 'الوقود الأحفوري', nameEn: 'Fossil Fuels', icon: '🛢️',
                renewable: false,
                items: [
                    { nameAr: 'نفط خام', nameEn: 'Crude Oil', saudiProduction: '~10M برميل/يوم', entity: 'أرامكو السعودية' },
                    { nameAr: 'غاز طبيعي', nameEn: 'Natural Gas', saudiReserves: 'رابع أكبر احتياطي عالمياً' },
                    { nameAr: 'فحم', nameEn: 'Coal', globalShare: '27% من إنتاج الطاقة العالمي' },
                ],
                compliance: { halal: true, note: 'التجارة في الوقود حلال بشرط عدم الإضرار بالبيئة والمجتمع' },
            },
            {
                id: 'renewable', nameAr: 'الطاقة المتجددة', nameEn: 'Renewable Energy', icon: '☀️',
                renewable: true,
                items: [
                    { nameAr: 'طاقة شمسية', nameEn: 'Solar Energy', technology: ['خلايا PV', 'تركيز حراري CSP'], saudiProject: 'نيوم، نيابستو' },
                    { nameAr: 'طاقة رياح', nameEn: 'Wind Energy', technology: ['برية', 'بحرية'] },
                    { nameAr: 'طاقة مائية', nameEn: 'Hydropower', technology: ['سدود', 'تدفق نهري'] },
                    { nameAr: 'طاقة حرارية أرضية', nameEn: 'Geothermal', regions: ['آيسلندا', 'كينيا', 'إندونيسيا'] },
                    { nameAr: 'طاقة المد والجزر', nameEn: 'Tidal Energy', potential: 'عالي في بحار الخليج والبحر الأحمر' },
                    { nameAr: 'كتلة حيوية', nameEn: 'Biomass', types: ['غاز حيوي', 'مخلفات زراعية', 'خشب'] },
                ],
                saudiTarget: 'رؤية 2030: 50% من الكهرباء من متجددة بحلول 2030',
                quranRef: 'وَتَصْرِيفِ الرِّيَاحِ وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ — البقرة ١٦٤',
            },
            {
                id: 'nuclear', nameAr: 'الطاقة النووية', nameEn: 'Nuclear Energy', icon: '⚛️',
                renewable: false,
                technology: ['مفاعلات الانشطار', 'الاندماج النووي (قيد التطوير)'],
                globalShare: '~10% من الكهرباء العالمية',
                compliance: { halal: 'مشروط', note: 'للاستخدام السلمي فحسب — لا ضرر ولا ضرار' },
            },
            {
                id: 'hydrogen', nameAr: 'الهيدروجين', nameEn: 'Hydrogen Economy', icon: '🔋',
                renewable: true,
                types: ['هيدروجين أخضر (من متجددة)', 'هيدروجين أزرق (من غاز مع CCS)', 'هيدروجين رمادي (من غاز)'],
                saudiProject: 'مشروع نيوم NEOM — أكبر مصنع هيدروجين أخضر عالمياً',
            },
        ],
        metrics: ['طاقة_GW', 'كهرباء_TWh/سنة', 'انبعاثات_kgCO2/kWh', 'تكلفة_USD/kWh', 'كفاءة_%'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثالث: الموارد الزراعية والغذائية
    // ══════════════════════════════════════════════════════
    agricultural: {
        id: 'agricultural',
        nameAr: 'الموارد الزراعية والغذائية',
        nameEn: 'Agricultural & Food Resources',
        maqsad: 'NAFS',
        icon: '🌾',
        quranRef: '﴿ وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَّكُمْ ﴾ — البقرة ٢٢',
        types: [
            {
                id: 'crops', nameAr: 'المحاصيل', nameEn: 'Crops', icon: '🌽',
                categories: [
                    { nameAr: 'حبوب', nameEn: 'Grains', examples: ['قمح', 'أرز', 'شعير', 'ذرة', 'دخن', 'شوفان'] },
                    { nameAr: 'خضروات', nameEn: 'Vegetables', examples: ['طماطم', 'خيار', 'بصل', 'جزر', 'بطاطس'] },
                    { nameAr: 'فواكه', nameEn: 'Fruits', examples: ['تمر', 'عنب', 'رمان', 'تين', 'زيتون'], quranRef: 'وَالتِّينِ وَالزَّيْتُونِ' },
                    { nameAr: 'بقوليات', nameEn: 'Legumes', examples: ['فول', 'عدس', 'حمص', 'فاصوليا'] },
                    { nameAr: 'أعشاب وتوابل', nameEn: 'Herbs & Spices', examples: ['زعفران', 'كمون', 'حبة سوداء', 'عود'] },
                ],
            },
            {
                id: 'livestock', nameAr: 'الثروة الحيوانية', nameEn: 'Livestock', icon: '🐑',
                items: [
                    { nameAr: 'إبل', nameEn: 'Camels', quranRef: 'أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ' },
                    { nameAr: 'أغنام وماعز', nameEn: 'Sheep & Goats' },
                    { nameAr: 'أبقار', nameEn: 'Cattle' },
                    { nameAr: 'دواجن', nameEn: 'Poultry' },
                    { nameAr: 'أسماك واستزراع بحري', nameEn: 'Fish & Aquaculture' },
                    { nameAr: 'نحل', nameEn: 'Bees', quranRef: 'يَخْرُجُ مِن بُطُونِهَا شَرَابٌ مُّخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِّلنَّاسِ' },
                ],
            },
            {
                id: 'agritech', nameAr: 'التقنية الزراعية', nameEn: 'AgriTech', icon: '🤖',
                technologies: ['زراعة دقيقة', 'زراعة عمودية', 'بيوت محمية', 'زراعة مائية', 'طائرات زراعية', 'ذكاء اصطناعي زراعي', 'إنترنت الأشياء الزراعي'],
            },
        ],
        metrics: ['إنتاج_طن', 'مساحة_هكتار', 'غلة_طن/هكتار', 'قيمة_USD/طن', 'أمن_غذائي_مؤشر'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الرابع: الموارد البشرية
    // ══════════════════════════════════════════════════════
    human: {
        id: 'human',
        nameAr: 'الموارد البشرية',
        nameEn: 'Human Resources',
        maqsad: 'NAFS',
        icon: '👥',
        quranRef: '﴿ وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ ﴾ — الإسراء ٧٠',
        types: [
            {
                id: 'workforce', nameAr: 'القوى العاملة', nameEn: 'Workforce',
                categories: [
                    { nameAr: 'عمال مهرة', nameEn: 'Skilled Workers', fields: ['هندسة', 'طب', 'تقنية', 'تعليم'] },
                    { nameAr: 'عمال غير مهرة', nameEn: 'Unskilled Workers', sectors: ['زراعة', 'بناء', 'خدمات'] },
                    { nameAr: 'خبراء ومتخصصون', nameEn: 'Experts & Specialists' },
                    { nameAr: 'رواد أعمال', nameEn: 'Entrepreneurs' },
                ],
            },
            {
                id: 'skills', nameAr: 'المهارات والكفاءات', nameEn: 'Skills & Competencies',
                types: ['مهارات تقنية', 'مهارات قيادية', 'مهارات لغوية', 'مهارات إبداعية', 'مهارات ريادية'],
                saudiEntity: 'هيئة تقييم التعليم والتدريب (إتقان)',
                vision2030: 'تطوير رأس المال البشري — محور رئيسي في رؤية 2030',
            },
            {
                id: 'education', nameAr: 'التعليم والتدريب', nameEn: 'Education & Training',
                quranRef: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ — العلق ١',
                levels: ['تعليم أساسي', 'ثانوي', 'جامعي', 'دراسات عليا', 'تدريب مهني'],
                technologies: ['تعلم إلكتروني', 'ذكاء اصطناعي تعليمي', 'واقع افتراضي', 'منصات تعليمية'],
            },
            {
                id: 'health', nameAr: 'الصحة والرعاية', nameEn: 'Health & Wellbeing',
                quranRef: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ — الشعراء ٨٠',
                components: ['صحة جسدية', 'صحة نفسية', 'رعاية اجتماعية', 'تأمين صحي'],
            },
        ],
        metrics: ['أعداد_عمالة', 'معدل_بطالة_%', 'إنتاجية_USD/ساعة', 'مستوى_تعليم', 'مؤشر_تنمية_بشرية'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الخامس: الموارد المالية
    // ══════════════════════════════════════════════════════
    financial: {
        id: 'financial',
        nameAr: 'الموارد المالية',
        nameEn: 'Financial Resources',
        maqsad: 'MAL',
        icon: '💰',
        quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة ٢٧٥',
        types: [
            {
                id: 'capital', nameAr: 'رأس المال', nameEn: 'Capital',
                categories: [
                    { nameAr: 'رأس مال مادي', nameEn: 'Physical Capital', examples: ['مباني', 'آلات', 'معدات', 'بنية تحتية'] },
                    { nameAr: 'رأس مال بشري', nameEn: 'Human Capital', examples: ['مهارات', 'خبرات', 'معرفة'] },
                    { nameAr: 'رأس مال اجتماعي', nameEn: 'Social Capital', examples: ['ثقة', 'شبكات', 'تعاون'] },
                    { nameAr: 'رأس مال طبيعي', nameEn: 'Natural Capital', examples: ['موارد طبيعية', 'نظم بيئية'] },
                ],
                compliance: { note: 'الاستثمار في رأس المال المنتج حلال — يجب تجنب الربا والغرر والميسر' },
            },
            {
                id: 'zakat_waqf', nameAr: 'الزكاة والوقف', nameEn: 'Zakat & Endowments',
                quranRef: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ — البقرة ٤٣',
                types: [
                    { nameAr: 'زكاة مال', nisab: '85g ذهب', rate: '2.5%' },
                    { nameAr: 'زكاة زراعية', rate: '10% (بلا ري) / 5% (بري)' },
                    { nameAr: 'وقف خيري', types: ['مساجد', 'مستشفيات', 'مدارس', 'مياه'] },
                    { nameAr: 'صدقة جارية', examples: ['علم ينتفع به', 'ولد صالح يدعو'] },
                ],
                saudiEntity: 'الهيئة العامة للأوقاف',
            },
            {
                id: 'sovereign_wealth', nameAr: 'صناديق الثروة السيادية', nameEn: 'Sovereign Wealth Funds',
                examples: [
                    { name: 'صندوق الاستثمارات العامة (PIF)', country: 'السعودية', aum: '700B+ USD' },
                    { name: 'أبوظبي للاستثمار (ADIA)', country: 'الإمارات', aum: '853B USD' },
                    { name: 'الصندوق الاستثماري للأجيال القادمة', country: 'الكويت', aum: '750B USD' },
                ],
            },
            {
                id: 'islamic_finance', nameAr: 'التمويل الإسلامي', nameEn: 'Islamic Finance',
                instruments: ['مرابحة', 'مضاربة', 'مشاركة', 'إجارة', 'استصناع', 'صكوك'],
                globalMarket: '3.96 تريليون دولار (2022)',
            },
        ],
        metrics: ['قيمة_USD', 'عائد_%', 'مخاطرة_مستوى', 'سيولة', 'التزام_شرعي_%'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس السادس: الموارد الرقمية
    // ══════════════════════════════════════════════════════
    digital: {
        id: 'digital',
        nameAr: 'الموارد الرقمية',
        nameEn: 'Digital Resources',
        maqsad: 'ARD',
        icon: '💻',
        quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة ٣١',
        types: [
            {
                id: 'data', nameAr: 'البيانات', nameEn: 'Data',
                types: ['بيانات هيكلية', 'بيانات غير هيكلية', 'بيانات في الوقت الفعلي', 'بيانات ضخمة', 'بيانات وصفية'],
                note: 'البيانات ثروة رقمية — حماية الخصوصية واجب شرعي',
                technologies: ['قواعد بيانات SQL', 'قواعد بيانات NoSQL', 'مستودعات البيانات', 'Data Lakes'],
            },
            {
                id: 'ai_models', nameAr: 'نماذج الذكاء الاصطناعي', nameEn: 'AI Models',
                types: ['نماذج اللغة الكبيرة LLM', 'شبكات عصبية تلافيفية CNN', 'نماذج انتشار', 'مجسّمات محولات Transformer', 'نماذج توليدية GAN'],
                compliance: { note: 'يجب أن يلتزم الذكاء الاصطناعي بمبادئ الكتاب والسنة' },
            },
            {
                id: 'software', nameAr: 'البرمجيات', nameEn: 'Software',
                categories: ['أنظمة تشغيل', 'تطبيقات', 'APIs', 'منصات سحابية', 'برامج مفتوحة المصدر', 'عقود ذكية'],
            },
            {
                id: 'infrastructure', nameAr: 'البنية التحتية الرقمية', nameEn: 'Digital Infrastructure',
                components: ['مراكز البيانات', 'شبكات الألياف الضوئية', 'شبكات الجيل الخامس 5G', 'الحوسبة السحابية', 'الحوسبة الطرفية Edge', 'أجهزة إنترنت الأشياء'],
            },
        ],
        metrics: ['حجم_بيانات_TB', 'معالجة_FLOPS', 'عرض_نطاق_Gbps', 'زمن_استجابة_ms', 'أمن_سيبراني_مستوى'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس السابع: الموارد الصناعية والتصنيعية
    // ══════════════════════════════════════════════════════
    industrial: {
        id: 'industrial',
        nameAr: 'الموارد الصناعية والتصنيعية',
        nameEn: 'Industrial & Manufacturing Resources',
        maqsad: 'ARD',
        icon: '🏭',
        quranRef: '﴿ وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ ﴾ — الأنبياء ٨٠',
        types: [
            {
                id: 'raw_materials', nameAr: 'المواد الخام', nameEn: 'Raw Materials',
                categories: [
                    { nameAr: 'معادن مشغولة', nameEn: 'Processed Metals', examples: ['فولاذ', 'ألومنيوم مُشكَّل', 'نحاس مسبوك'] },
                    { nameAr: 'بتروكيماويات', nameEn: 'Petrochemicals', examples: ['بلاستيك', 'مطاط', 'أسمدة'] },
                    { nameAr: 'مواد بناء', nameEn: 'Construction Materials', examples: ['إسمنت', 'رمل', 'طوب', 'زجاج'] },
                    { nameAr: 'مواد نسيجية', nameEn: 'Textile Materials', examples: ['قطن', 'صوف', 'حرير', 'ألياف تركيبية'] },
                ],
            },
            {
                id: 'manufacturing', nameAr: 'التصنيع', nameEn: 'Manufacturing',
                types: [
                    { nameAr: 'تصنيع تقليدي', nameEn: 'Traditional Manufacturing' },
                    { nameAr: 'تصنيع متقدم', nameEn: 'Advanced Manufacturing', technologies: ['روبوتات', 'CNC', 'طباعة ثلاثية الأبعاد'] },
                    { nameAr: 'تصنيع ذكي Industry 4.0', nameEn: 'Smart Manufacturing', technologies: ['IoT', 'AI', 'Digital Twin', 'Cyber-Physical Systems'] },
                ],
                saudiEntity: 'الهيئة السعودية للمناطق الصناعية (مدن)',
                vision2030: 'مضاعفة مساهمة الصناعة في الناتج المحلي',
            },
            {
                id: 'supply_chain', nameAr: 'سلاسل الإمداد', nameEn: 'Supply Chain',
                components: ['مصادر المواد', 'تصنيع', 'تخزين', 'توزيع', 'عملاء'],
                technologies: ['تتبع بلوكتشين', 'RFID', 'ذكاء اصطناعي للتنبؤ', 'أتمتة اللوجستيات'],
            },
        ],
        metrics: ['طاقة_إنتاجية_طن/يوم', 'كفاءة_%', 'تكلفة_وحدة_USD', 'جودة_مؤشر', 'انبعاثات_CO2/طن'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثامن: الموارد المعرفية والفكرية
    // ══════════════════════════════════════════════════════
    knowledge: {
        id: 'knowledge',
        nameAr: 'الموارد المعرفية والفكرية',
        nameEn: 'Knowledge & Intellectual Resources',
        maqsad: 'AQL',
        icon: '📚',
        quranRef: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — طه ١١٤',
        types: [
            {
                id: 'research', nameAr: 'البحث العلمي', nameEn: 'Scientific Research',
                fields: ['علوم أساسية', 'علوم تطبيقية', 'هندسة', 'طب', 'اجتماعيات', 'اقتصاد'],
                saudiEntity: 'مدينة الملك عبدالعزيز للعلوم والتقنية (كاوست، كابسات)',
            },
            {
                id: 'ip', nameAr: 'الملكية الفكرية', nameEn: 'Intellectual Property',
                types: ['براءات اختراع', 'حقوق النشر', 'علامات تجارية', 'أسرار تجارية', 'تصاميم صناعية'],
                saudiEntity: 'الهيئة السعودية للملكية الفكرية (SAIP)',
            },
            {
                id: 'innovation', nameAr: 'الابتكار والإبداع', nameEn: 'Innovation',
                types: ['ابتكار منتج', 'ابتكار عملية', 'ابتكار نموذج أعمال', 'ابتكار اجتماعي'],
                quranRef: 'وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ — يوسف ٧٦',
            },
        ],
        metrics: ['براءات_مسجلة', 'نشرات_علمية', 'انفاق_بحث_%_GDP', 'مؤشر_ابتكار', 'تحويل_معرفة_تجارية'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس التاسع: الموارد البيئية والمناخية
    // ══════════════════════════════════════════════════════
    environmental: {
        id: 'environmental',
        nameAr: 'الموارد البيئية والمناخية',
        nameEn: 'Environmental & Climate Resources',
        maqsad: 'ARD',
        icon: '🌿',
        quranRef: '﴿ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا ﴾ — الأعراف ٥٦',
        types: [
            {
                id: 'atmosphere', nameAr: 'الغلاف الجوي', nameEn: 'Atmosphere',
                components: ['أوكسجين', 'نيتروجين', 'ثاني أكسيد الكربون', 'طبقة الأوزون'],
                services: ['تنظيم مناخ', 'تصفية UV', 'دورة مائية', 'تنفس'],
                threats: ['تغير مناخي', 'تلوث هواء', 'استنزاف أوزون'],
            },
            {
                id: 'carbon_cycle', nameAr: 'دورة الكربون', nameEn: 'Carbon Cycle',
                sinks: ['غابات', 'محيطات', 'تربة', 'احتجاز وتخزين CCS'],
                saudiInitiative: 'مبادرة السعودية الخضراء — صفر انبعاثات 2060',
            },
            {
                id: 'ecosystem', nameAr: 'النظم البيئية', nameEn: 'Ecosystems',
                types: ['غابات استوائية', 'سافانا', 'صحراء', 'مناطق رطبة', 'شعاب مرجانية', 'محيطات عميقة', 'تندرا'],
                services: ['تنقية هواء وماء', 'تلقيح', 'تحليل', 'تنظيم فيضانات', 'موارد طبية'],
            },
        ],
        metrics: ['انبعاثات_CO2_Mt', 'غطاء_حرجي_%', 'تنوع_أحيائي_مؤشر', 'درجة_حرارة_°C', 'مياه_جوفية_عمق_م'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس العاشر: الموارد الاستراتيجية الوطنية
    // ══════════════════════════════════════════════════════
    strategic: {
        id: 'strategic',
        nameAr: 'الموارد الاستراتيجية الوطنية',
        nameEn: 'Strategic National Resources',
        maqsad: 'DEEN',
        icon: '🛡️',
        quranRef: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال ٦٠',
        types: [
            {
                id: 'food_security', nameAr: 'الأمن الغذائي', nameEn: 'Food Security',
                pillars: ['التوفر', 'الوصول', 'الاستخدام', 'الاستقرار'],
                saudiEntity: 'الهيئة العامة للغذاء والدواء (SFDA)',
                saudiPrograms: ['برنامج الحبوب', 'مبادرة الأمن الغذائي', 'استثمار زراعي خارجي'],
            },
            {
                id: 'medicine', nameAr: 'الدواء والصحة', nameEn: 'Medical & Health',
                components: ['أدوية أساسية', 'لقاحات', 'أجهزة طبية', 'بنية صحية', 'كوادر طبية'],
                saudiEntity: 'وزارة الصحة، SFDA، NEOM Health',
                note: 'لا ضرر ولا ضرار — الصحة حق لكل مسلم',
            },
            {
                id: 'reserves', nameAr: 'الاحتياطيات الوطنية', nameEn: 'National Reserves',
                types: ['احتياطيات نقدية أجنبية', 'احتياطيات نفط', 'مخزون غذائي استراتيجي', 'مخزون دواء'],
                saudiReserves: '~450B USD احتياطيات سعودية',
            },
            {
                id: 'defense', nameAr: 'الموارد الدفاعية', nameEn: 'Defense Resources',
                quranRef: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ وَمِن رِّبَاطِ الْخَيْلِ — الأنفال ٦٠',
                compliance: { note: 'الدفاع الوطني فريضة — لا اعتداء ولا ضرر بالمدنيين' },
            },
        ],
        metrics: ['أمن_غذائي_مؤشر', 'احتياطيات_أشهر_استهلاك', 'اكتفاء_ذاتي_%', 'انفاق_دفاع_%_GDP'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الحادي عشر: الصناعة الشاملة
    // ══════════════════════════════════════════════════════
    industry_full: {
        id: 'industry_full',
        nameAr: 'الصناعة الشاملة',
        nameEn: 'Full Industry Sectors',
        maqsad: 'ARD',
        icon: '🏗️',
        quranRef: '﴿ وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ ﴾ — الأنبياء ٨٠',
        types: [
            {
                id: 'petrochemical', nameAr: 'البتروكيماويات والتكرير', nameEn: 'Petrochemicals & Refining', icon: '🛢️',
                sectors: ['تكرير النفط', 'غاز إيثيلين وبروبيلين', 'بلاستيك وبوليمرات', 'أسمدة نيتروجينية وفوسفاتية', 'مواد تشحيم', 'إسفلت'],
                saudiEntities: ['سابك (SABIC)', 'أرامكو سعودي (مجمعات التكرير)', 'شركة الجبيل والينبع'],
                saudiCities: ['الجبيل الصناعية', 'ينبع الصناعية', 'رابغ'],
                globalRole: 'السعودية ثاني أكبر مصدر للبتروكيماويات عالمياً',
            },
            {
                id: 'metals_steel', nameAr: 'الحديد والصلب والمعادن', nameEn: 'Iron, Steel & Metals', icon: '⚙️',
                products: ['حديد تسليح', 'فولاذ مسطح', 'أنابيب فولاذية', 'ألومنيوم', 'نحاس', 'سبائك خاصة'],
                saudiEntities: ['حديد سابك', 'شركة الحديد والصلب السعودية (حديد)', 'ماعدن'],
                technology: ['أفران قوس كهربائي EAF', 'أفران أكسجين قاعدي BOF', 'صهر مباشر DRI'],
            },
            {
                id: 'construction', nameAr: 'البناء والتشييد', nameEn: 'Construction & Building', icon: '🏢',
                sectors: [
                    { nameAr: 'إسمنت وجص', nameEn: 'Cement & Gypsum', saudiCapacity: '80M طن/سنة' },
                    { nameAr: 'حديد التسليح', nameEn: 'Rebar Steel' },
                    { nameAr: 'زجاج ومواد عازلة', nameEn: 'Glass & Insulation' },
                    { nameAr: 'بلاط وسيراميك', nameEn: 'Tiles & Ceramics' },
                    { nameAr: 'مقاولات ومشاريع عملاقة', nameEn: 'Mega Projects', examples: ['نيوم', 'البحر الأحمر', 'درعة تطوير', 'قدية'] },
                ],
                vision2030: 'مشاريع التطوير العمراني — تريليونات الدولارات في البنية التحتية',
            },
            {
                id: 'food_processing', nameAr: 'الصناعات الغذائية', nameEn: 'Food Processing Industry', icon: '🍽️',
                categories: [
                    { nameAr: 'تعبئة وتغليف', nameEn: 'Packaging' },
                    { nameAr: 'زيوت ودهون', nameEn: 'Oils & Fats' },
                    { nameAr: 'منتجات ألبان', nameEn: 'Dairy Products', saudiExample: 'شركة المراعي' },
                    { nameAr: 'دواجن ومسالخ', nameEn: 'Poultry & Slaughterhouses', compliance: 'ذبح حلال وفق الشريعة' },
                    { nameAr: 'مشروبات حلال', nameEn: 'Halal Beverages' },
                    { nameAr: 'سكر وحلويات', nameEn: 'Sugar & Confectionery' },
                    { nameAr: 'تجفيف وتعليب', nameEn: 'Drying & Canning' },
                ],
                saudiEntities: ['شركة المراعي', 'صافولا', 'الأليفة', 'وفرة'],
                compliance: { note: 'شهادة حلال شرط لكل منتج غذائي — الهيئة السعودية للغذاء والدواء' },
            },
            {
                id: 'pharmaceutical', nameAr: 'الصناعات الدوائية والطبية', nameEn: 'Pharmaceuticals & Medical', icon: '💊',
                types: [
                    { nameAr: 'أدوية جنيسة', nameEn: 'Generic Pharmaceuticals' },
                    { nameAr: 'بيولوجيات ولقاحات', nameEn: 'Biologics & Vaccines' },
                    { nameAr: 'أجهزة طبية', nameEn: 'Medical Devices' },
                    { nameAr: 'طب تقليدي وعشبي', nameEn: 'Traditional & Herbal Medicine', compliance: 'العلاج بالحلال والطب النبوي' },
                ],
                saudiEntities: ['SPIMACO', 'Julphar', 'Tabuk Pharmaceuticals', 'HAAD'],
                vision2030: 'بناء صناعة دوائية محلية — تقليل الاستيراد',
            },
            {
                id: 'automotive', nameAr: 'السيارات والمركبات', nameEn: 'Automotive & Vehicles', icon: '🚗',
                types: ['تجميع سيارات', 'مركبات كهربائية EV', 'مركبات ثقيلة وشاحنات', 'قطع غيار', 'إطارات'],
                saudiProject: 'CEER — أول سيارة كهربائية سعودية (صندوق الاستثمارات العامة)',
                technology: ['خطوط تجميع ذكية', 'روبوتات لحام', 'طلاء رقمي'],
            },
            {
                id: 'electronics_tech', nameAr: 'الإلكترونيات والتقنية', nameEn: 'Electronics & Technology', icon: '💡',
                types: [
                    { nameAr: 'أشباه الموصلات', nameEn: 'Semiconductors' },
                    { nameAr: 'أجهزة إلكترونية استهلاكية', nameEn: 'Consumer Electronics' },
                    { nameAr: 'مكونات إلكترونية', nameEn: 'Electronic Components' },
                    { nameAr: 'بطاريات ووحدات طاقة', nameEn: 'Batteries & Power Units' },
                    { nameAr: 'معدات اتصالات', nameEn: 'Telecom Equipment' },
                ],
                saudiInitiative: 'برنامج صنع في السعودية — تطوير صناعات تقنية',
            },
            {
                id: 'textiles', nameAr: 'المنسوجات والملابس', nameEn: 'Textiles & Apparel', icon: '👗',
                types: ['غزل ونسيج', 'ملابس وأزياء', 'مفروشات وسجاد', 'ملابس عمل وأمان'],
                compliance: { note: 'الملابس الشرعية المحتشمة — التزام بالقيم الإسلامية في التصميم' },
            },
            {
                id: 'defense_industry', nameAr: 'الصناعات الدفاعية', nameEn: 'Defense Industry', icon: '🛡️',
                types: ['أسلحة صغيرة', 'مركبات دفاعية', 'طيران عسكري', 'أنظمة إلكترونية دفاعية', 'ذخائر'],
                saudiEntities: ['شركة المصانع العسكرية (SAMI)', 'صندوق الاستثمارات العامة (PIF)'],
                vision2030: 'استهداف 50% من الإنفاق الدفاعي محلياً بحلول 2030',
                compliance: { note: 'لا استخدام لأغراض العدوان — الدفاع عن النفس والأمة' },
            },
            {
                id: 'renewable_energy_mfg', nameAr: 'تصنيع الطاقة المتجددة', nameEn: 'Renewable Energy Manufacturing', icon: '☀️',
                types: ['ألواح شمسية PV', 'توربينات رياح', 'بطاريات تخزين', 'أنظمة هيدروجين أخضر'],
                saudiProject: 'مشروع الشمس — ACWA Power، Vision Industries',
            },
            {
                id: 'mining_processing', nameAr: 'التعدين والمعالجة', nameEn: 'Mining & Mineral Processing', icon: '⛏️',
                minerals: ['الذهب (مشعل)', 'الفوسفات (مانيفة)', 'البوكسيت (العل)', 'النحاس (جبل صايد)', 'الزنك'],
                saudiEntity: 'شركة ماعدن',
                vision2030: 'هدف رفع قيمة قطاع التعدين إلى 240 مليار ريال سنوياً',
            },
        ],
        metrics: ['إنتاج_وحدة/يوم', 'كفاءة_خط_إنتاج_%', 'تكلفة_وحدة_USD', 'جودة_PPM', 'توطين_%', 'انبعاثات_CO2/طن'],
        saudiFramework: {
            entities: ['الهيئة السعودية للمناطق الصناعية (مدن)', 'وزارة الصناعة', 'الهيئة العامة للاستثمار (MISA)'],
            programs: ['صنع في السعودية', 'برنامج المحتوى المحلي', 'مبادرة الصناعات الاستراتيجية'],
        },
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثاني عشر: خطوط الإمداد والإنتاج
    // ══════════════════════════════════════════════════════
    supply_lines: {
        id: 'supply_lines',
        nameAr: 'خطوط الإمداد والإنتاج',
        nameEn: 'Supply Lines & Production Lines',
        maqsad: 'MAL',
        icon: '🔗',
        quranRef: '﴿ وَجَعَلْنَا لَكُمْ فِيهَا مَعَايِشَ ﴾ — الأعراف ١٠',
        types: [
            {
                id: 'production_lines', nameAr: 'خطوط الإنتاج', nameEn: 'Production Lines', icon: '⚙️',
                types: [
                    {
                        id: 'assembly', nameAr: 'خطوط التجميع', nameEn: 'Assembly Lines',
                        technologies: ['تجميع يدوي', 'تجميع شبه أوتوماتيكي', 'تجميع أوتوماتيكي بالكامل', 'روبوتات تجميع'],
                        kpis: ['وحدات/ساعة (UPH)', 'معدل العيوب PPM', 'OEE Overall Equipment Effectiveness'],
                    },
                    {
                        id: 'continuous_process', nameAr: 'خطوط العملية المستمرة', nameEn: 'Continuous Process Lines',
                        examples: ['تكرير النفط', 'صناعة الأسمنت', 'معالجة المياه', 'توليد الكهرباء'],
                        kpis: ['طاقة_إنتاجية_طن/يوم', 'كفاءة_%', 'وقت_توقف_ساعة/شهر'],
                    },
                    {
                        id: 'batch_process', nameAr: 'خطوط الإنتاج بالدفعات', nameEn: 'Batch Process Lines',
                        examples: ['صناعة الأدوية', 'صناعة الغذاء', 'تصنيع الكيماويات المتخصصة'],
                        kpis: ['حجم_الدفعة', 'زمن_الدورة_cycle_time', 'اتساق_الجودة'],
                    },
                    {
                        id: 'smart_line', nameAr: 'خطوط الإنتاج الذكية (Industry 4.0)', nameEn: 'Smart Production Lines',
                        technologies: ['توأم رقمي Digital Twin', 'AI للتنبؤ بالأعطال Predictive Maintenance', 'IIoT', 'Cobots', 'Vision Systems'],
                        kpis: ['OEE_%', 'انقطاع_خطط_%', 'جودة_أوتوماتيكية'],
                    },
                ],
            },
            {
                id: 'oil_gas_pipelines', nameAr: 'خطوط أنابيب النفط والغاز', nameEn: 'Oil & Gas Pipelines', icon: '🛢️',
                types: [
                    { nameAr: 'خطوط نقل النفط الخام', nameEn: 'Crude Oil Transmission', examples: ['خط العقبة-ينبع 1,200 كم', 'خط المنطقة الشرقية-الغرب'] },
                    { nameAr: 'خطوط الغاز الطبيعي', nameEn: 'Natural Gas Lines', examples: ['شبكة المسيل-ينبع', 'شبكة الغاز المحلية'] },
                    { nameAr: 'خطوط المشتقات النفطية', nameEn: 'Petroleum Products Lines' },
                    { nameAr: 'خطوط الغاز المسال LNG', nameEn: 'LNG Lines' },
                ],
                saudiOperator: 'أرامكو السعودية — أكبر شبكة أنابيب نفط في العالم',
                technology: ['SCADA', 'مراقبة سلامة', 'حماية كاثودية', 'فحص بالموجات فوق الصوتية'],
                compliance: { note: 'صيانة دورية وسلامة بيئية إلزامية' },
            },
            {
                id: 'water_pipelines', nameAr: 'شبكات المياه وخطوط التحلية', nameEn: 'Water & Desalination Lines', icon: '💧',
                types: [
                    { nameAr: 'خطوط المياه المحلاة', nameEn: 'Desalinated Water Transmission', saudiNote: 'أطول خط مياه في العالم — من الخبر إلى الرياض (470 كم)' },
                    { nameAr: 'شبكات توزيع المياه', nameEn: 'Water Distribution Networks' },
                    { nameAr: 'خطوط الصرف الصحي', nameEn: 'Sewage Lines' },
                    { nameAr: 'خطوط إعادة استخدام المياه', nameEn: 'Water Reuse Lines' },
                ],
                saudiEntity: 'شركة المياه الوطنية (NWC)، SWCC',
            },
            {
                id: 'electricity_grid', nameAr: 'شبكة الكهرباء وخطوط النقل', nameEn: 'Electricity Grid & Transmission', icon: '⚡',
                types: [
                    { nameAr: 'خطوط النقل الفائق الجهد', nameEn: 'Extra-High Voltage Transmission', voltage: '380 kV, 230 kV' },
                    { nameAr: 'شبكة التوزيع', nameEn: 'Distribution Grid', voltage: '33 kV, 13.8 kV, 380 V' },
                    { nameAr: 'الشبكة الذكية Smart Grid', nameEn: 'Smart Grid', technologies: ['AMI', 'SCADA', 'DMS', 'EMS'] },
                    { nameAr: 'الربط الكهربائي الإقليمي', nameEn: 'Regional Interconnections', examples: ['الربط الكهربائي الخليجي (GCCIA)', 'ربط مع الأردن ومصر'] },
                ],
                saudiEntity: 'شركة الكهرباء السعودية (SEC)، شركة الشبكة الوطنية',
            },
            {
                id: 'supply_chain_lines', nameAr: 'خطوط سلاسل الإمداد', nameEn: 'Supply Chain Lines', icon: '🔄',
                stages: [
                    { stage: 1, nameAr: 'مصادر المواد الخام', nameEn: 'Raw Material Sourcing', activities: ['استخراج', 'شراء', 'تعاقد', 'فحص'] },
                    { stage: 2, nameAr: 'الإمداد الداخلي', nameEn: 'Inbound Logistics', activities: ['نقل', 'استلام', 'فحص جودة', 'تخزين مواد خام'] },
                    { stage: 3, nameAr: 'التصنيع والإنتاج', nameEn: 'Manufacturing', activities: ['تصنيع', 'تجميع', 'فحص', 'تغليف'] },
                    { stage: 4, nameAr: 'الإمداد الخارجي', nameEn: 'Outbound Logistics', activities: ['تخزين منتجات نهائية', 'اختيار طلبات', 'شحن', 'توزيع'] },
                    { stage: 5, nameAr: 'التوزيع والتسليم', nameEn: 'Distribution & Delivery', activities: ['مستودعات إقليمية', 'تسليم اليوم ذاته', 'آخر ميل'] },
                    { stage: 6, nameAr: 'خدمة ما بعد البيع', nameEn: 'After-Sales Service', activities: ['إرجاع', 'صيانة', 'ضمان', 'إعادة تدوير'] },
                ],
                technologies: ['ERP Integration', 'Blockchain Traceability', 'AI Demand Forecasting', 'Digital Twin SCM', 'RFID/IoT Tracking'],
                compliance: { note: 'الشفافية في سلسلة الإمداد أمانة — لا غش ولا تدليس' },
            },
            {
                id: 'digital_pipelines', nameAr: 'خطوط البيانات الرقمية', nameEn: 'Data & Digital Pipelines', icon: '📡',
                types: [
                    { nameAr: 'كابلات بحرية تحت الماء', nameEn: 'Submarine Cables', note: 'أكثر من 400 كابل تحمل 99% من الإنترنت العالمي' },
                    { nameAr: 'خطوط ألياف ضوئية برية', nameEn: 'Terrestrial Fiber Lines' },
                    { nameAr: 'مسارات بيانات CDN', nameEn: 'Content Delivery Pipelines' },
                    { nameAr: 'شبكات API والتكامل', nameEn: 'API & Integration Pipelines' },
                ],
            },
        ],
        metrics: ['إنتاجية_الخط_%', 'زمن_توقف_ساعة/شهر', 'تكلفة_الوحدة_USD', 'جودة_PPM', 'أمان_الخط_مستوى'],
    },

    // ══════════════════════════════════════════════════════
    // الجنس الثالث عشر: شبكات اللوجستيات
    // ══════════════════════════════════════════════════════
    logistics_networks: {
        id: 'logistics_networks',
        nameAr: 'شبكات اللوجستيات',
        nameEn: 'Logistics Networks',
        maqsad: 'MAL',
        icon: '🚚',
        quranRef: '﴿ وَسَخَّرَ لَكُمُ الْفُلْكَ لِتَجْرِيَ فِي الْبَحْرِ بِأَمْرِهِ ﴾ — إبراهيم ٣٢',
        types: [
            {
                id: 'land_transport', nameAr: 'النقل البري', nameEn: 'Land Transport', icon: '🚛',
                modes: [
                    { nameAr: 'شاحنات الشحن', nameEn: 'Freight Trucks', types: ['شاحنات عادية', 'شاحنات مبردة', 'شاحنات صهاريج', 'مقطورات مسطحة'] },
                    { nameAr: 'سكك الحديد للبضائع', nameEn: 'Rail Freight', saudiProject: 'قطار الرياض-الجبيل-الدمام (SAR)، مشروع الجسر البري' },
                    { nameAr: 'نقل مسافات قصيرة', nameEn: 'Last-Mile Delivery', technologies: ['دراجات كهربائية', 'روبوتات توصيل', 'طائرات توصيل'] },
                ],
                saudiNetwork: 'شبكة طرق تتجاوز 73,000 كم من الطرق المعبدة',
            },
            {
                id: 'maritime', nameAr: 'الشحن البحري', nameEn: 'Maritime Shipping', icon: '🚢',
                types: [
                    { nameAr: 'ناقلات النفط', nameEn: 'Oil Tankers', classes: ['VLCC', 'Suezmax', 'Aframax'] },
                    { nameAr: 'سفن الحاويات', nameEn: 'Container Ships', classes: ['ULCV', 'Panamax', 'Feeder'] },
                    { nameAr: 'سفن الصب السائب', nameEn: 'Bulk Carriers', cargo: ['حبوب', 'معادن', 'فحم', 'أسمدة'] },
                    { nameAr: 'سفن الغاز المسال', nameEn: 'LNG/LPG Carriers' },
                    { nameAr: 'سفن الرورو', nameEn: 'RoRo Ships', cargo: ['سيارات', 'مركبات', 'آليات'] },
                ],
                saudiPorts: [
                    { name: 'ميناء الملك عبدالعزيز — الدمام', type: 'تجاري', capacity: '8.8M TEU' },
                    { name: 'ميناء جدة الإسلامي', type: 'تجاري', capacity: '6.5M TEU' },
                    { name: 'ميناء الملك فهد — ينبع', type: 'صناعي' },
                    { name: 'ميناء رأس تنورة', type: 'نفطي', operator: 'أرامكو' },
                    { name: 'ميناء الملك خالد — جيزان', type: 'تجاري وصناعي' },
                ],
                compliance: { note: 'وَسَخَّرَ لَكُمُ الْفُلْكَ — استخدام البحر للتجارة المشروعة' },
            },
            {
                id: 'air_freight', nameAr: 'الشحن الجوي', nameEn: 'Air Freight', icon: '✈️',
                types: [
                    { nameAr: 'طائرات شحن مخصصة', nameEn: 'Dedicated Freighters', examples: ['Boeing 747F', 'Airbus A330F', 'Antonov An-124'] },
                    { nameAr: 'شحن في طائرات ركاب', nameEn: 'Belly Cargo' },
                    { nameAr: 'طائرات بدون طيار للتوصيل', nameEn: 'Drone Delivery' },
                ],
                saudiAirports: [
                    { name: 'مطار الملك خالد الدولي — الرياض', cargoCapacity: '700,000 طن/سنة' },
                    { name: 'مطار الملك عبدالعزيز الدولي — جدة', status: 'بوابة الحج' },
                    { name: 'مطار الملك فهد الدولي — الدمام' },
                    { name: 'مطار نيوم تبوك — NEOM' },
                ],
                saudiCarrier: 'طيران السعودية للشحن (Saudia Cargo)',
            },
            {
                id: 'warehousing', nameAr: 'التخزين والمستودعات', nameEn: 'Warehousing & Storage', icon: '🏪',
                types: [
                    { nameAr: 'مستودعات تقليدية', nameEn: 'Traditional Warehouses' },
                    { nameAr: 'مستودعات مبردة', nameEn: 'Cold Storage', usedFor: ['أغذية', 'أدوية', 'مواد حساسة'] },
                    { nameAr: 'مستودعات ذكية (أتمتة كاملة)', nameEn: 'Automated Warehouses (AS/RS)', technology: ['روبوتات رفع', 'ناقلات آلية AGV', 'WMS ذكي'] },
                    { nameAr: 'مستودعات خطرة (المواد الكيميائية)', nameEn: 'Hazardous Materials Storage' },
                    { nameAr: 'مناطق حرة وتخليص جمركي', nameEn: 'Free Zones & Bonded Warehouses' },
                ],
                saudiEntities: ['مستودعات شركة الدرع العربي', 'مستودعات سيمكو', 'مدن اللوجستية MODON'],
                technologies: ['WMS — نظام إدارة المستودعات', 'RFID', 'Barcode', 'Drone Inventory', 'IoT Sensors'],
            },
            {
                id: 'three_pl_four_pl', nameAr: 'مزودو اللوجستيات 3PL و4PL', nameEn: '3PL & 4PL Providers', icon: '🤝',
                three_pl: {
                    nameAr: 'اللوجستيات الطرف الثالث (3PL)',
                    definition: 'الاستعانة بمزود خارجي لتشغيل جزء أو كل خدمات اللوجستيات',
                    services: ['نقل', 'تخزين', 'توزيع', 'تخليص جمركي', 'إدارة مرتجعات'],
                    globalProviders: ['DHL', 'Kuehne+Nagel', 'DB Schenker', 'UPS Supply Chain', 'XPO Logistics'],
                    saudiProviders: ['أرامكس', 'الشركة السعودية للخدمات الأرضية', 'نقل'],
                },
                four_pl: {
                    nameAr: 'اللوجستيات الطرف الرابع (4PL)',
                    definition: 'إدارة شاملة لسلسلة التوريد الكاملة بما فيها إدارة مزودي 3PL',
                    services: ['تصميم سلسلة التوريد', 'إدارة استراتيجية', 'تحسين مستمر', 'تكنولوجيا متقدمة'],
                    technology: ['Control Tower', 'AI Analytics', 'Real-time Visibility Platform'],
                },
            },
            {
                id: 'customs_trade', nameAr: 'التخليص الجمركي والتجارة', nameEn: 'Customs & Trade Facilitation', icon: '🏛️',
                services: [
                    { nameAr: 'تخليص جمركي بري', nameEn: 'Land Customs Clearance', saudiPorts: ['منفذ الحديثة (العراق)', 'منفذ البطحاء (الكويت)', 'منفذ جلجل'] },
                    { nameAr: 'تخليص جمركي بحري', nameEn: 'Sea Customs Clearance' },
                    { nameAr: 'تخليص جمركي جوي', nameEn: 'Air Customs Clearance' },
                    { nameAr: 'المناطق اللوجستية الاقتصادية', nameEn: 'Special Economic Logistics Zones', examples: ['مدينة الملك عبدالله الاقتصادية (KAEC)', 'مدينة جازان الاقتصادية'] },
                ],
                saudiEntity: 'الهيئة العامة للجمارك',
                technology: ['نظام نافذة — بوابة الجمارك الذكية', 'نظام FASAH للشحن', 'الفاتورة الإلكترونية'],
                compliance: { note: 'الصدق في الإقرارات الجمركية واجب شرعي — لا تهريب ولا غش' },
            },
            {
                id: 'reverse_logistics', nameAr: 'اللوجستيات العكسية وإعادة التدوير', nameEn: 'Reverse Logistics & Recycling', icon: '♻️',
                processes: ['استرجاع المنتجات', 'فحص وتصنيف', 'تجديد وإصلاح', 'إعادة تصنيع', 'إعادة تدوير', 'تصفية'],
                saudiInitiative: 'مبادرة السعودية الخضراء — اقتصاد دائري',
                compliance: { note: 'إعادة الاستخدام حفاظ على النعم — شكر لله على موارده' },
            },
            {
                id: 'logistics_tech', nameAr: 'تقنيات اللوجستيات الذكية', nameEn: 'Smart Logistics Technologies', icon: '🤖',
                technologies: [
                    { nameAr: 'تتبع الشحنات في الوقت الفعلي', nameEn: 'Real-time Tracking', tech: ['GPS', 'IoT', 'RFID', 'NFC'] },
                    { nameAr: 'الذكاء الاصطناعي في اللوجستيات', nameEn: 'AI in Logistics', uses: ['تحسين المسارات', 'تنبؤ الطلب', 'تخطيط التحميل'] },
                    { nameAr: 'بلوكشين سلسلة الإمداد', nameEn: 'Blockchain SCM', benefits: ['شفافية', 'مكافحة تزوير', 'تتبع أصل المنتج'] },
                    { nameAr: 'الطائرات بدون طيار لآخر ميل', nameEn: 'Drone Last-Mile Delivery' },
                    { nameAr: 'الروبوتات اللوجستية', nameEn: 'Logistics Robots', types: ['AMR Mobile Robots', 'Conveyor AI', 'Picking Robots'] },
                    { nameAr: 'التوأم الرقمي للسلسلة', nameEn: 'Digital Twin SCM' },
                    { nameAr: 'المنصات اللوجستية الرقمية', nameEn: 'Digital Freight Platforms', examples: ['Flexport', 'Freightos', 'شيخة للوجستيات'] },
                ],
            },
        ],
        metrics: ['تكلفة_الشحن_USD/طن_كم', 'زمن_التسليم_يوم', 'دقة_التسليم_%', 'رضا_العملاء_%', 'استدامة_CO2/شحنة'],
        saudiVision: {
            target: 'Saudi Vision 2030 — رفع مساهمة اللوجستيات في GDP إلى 10%',
            programs: ['مركز لوجستي إقليمي', 'برنامج الربط اللوجستي', 'نافذة اللوجستيات الوطنية'],
            initiative: 'مركز شيخة اللوجستي — ربط الموارد بالأسواق بكفاءة وأمانة',
        },
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. معايير قياس الموارد — RESOURCE METRICS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const RESOURCE_METRICS = {
    // أبعاد التقييم العالمي لكل مورد
    dimensions: [
        { id: 'availability',  nameAr: 'التوفر والاحتياطيات',    nameEn: 'Availability & Reserves',    weight: 0.20 },
        { id: 'accessibility', nameAr: 'إمكانية الوصول',         nameEn: 'Accessibility',               weight: 0.15 },
        { id: 'efficiency',    nameAr: 'كفاءة الاستخدام',        nameEn: 'Usage Efficiency',            weight: 0.15 },
        { id: 'sustainability',nameAr: 'الاستدامة',               nameEn: 'Sustainability',              weight: 0.20 },
        { id: 'economic_value',nameAr: 'القيمة الاقتصادية',       nameEn: 'Economic Value',              weight: 0.15 },
        { id: 'sharia_compliance', nameAr: 'الالتزام الشرعي',   nameEn: 'Sharia Compliance',           weight: 0.15 },
    ],

    // مؤشرات الأداء الرئيسية لكل جنس من الموارد
    kpis: {
        natural:      ['احتياطيات_بالسنة', 'استنزاف_%/سنة', 'قابلية_تجديد'],
        energy:       ['طاقة_GW', 'انبعاثات_kgCO2', 'تكلفة_USD/kWh'],
        agricultural: ['إنتاج_طن', 'غلة_طن/هكتار', 'أمن_غذائي_%'],
        human:        ['معدل_توظيف_%', 'إنتاجية_USD/ساعة', 'مؤشر_تنمية_بشرية'],
        financial:    ['عائد_%', 'مخاطرة_نسبية', 'التزام_شرعي'],
        digital:      ['حجم_بيانات_TB', 'معالجة_TFLOPS', 'أمن_سيبراني'],
        industrial:   ['كفاءة_إنتاج_%', 'جودة_PPM', 'انبعاثات/وحدة'],
        knowledge:    ['براءات_مسجلة', 'انفاق_بحث_%_GDP', 'تحويل_تجاري'],
        environmental:['انبعاثات_CO2_Mt', 'غطاء_حرجي_%', 'تنوع_بيولوجي'],
        strategic:    ['أمن_غذائي_%', 'احتياطيات_أشهر', 'اكتفاء_%'],
        industry_full:     ['إنتاج_وحدة/يوم', 'كفاءة_خط_%', 'توطين_%'],
        supply_lines:      ['إنتاجية_الخط_%', 'زمن_توقف_ساعة/شهر', 'أمان_مستوى'],
        logistics_networks:['تكلفة_شحن_USD/طن', 'زمن_تسليم_يوم', 'دقة_تسليم_%'],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. الشبكة العصبية للموارد — RESOURCES NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * شبكة عصبية متخصصة في تحليل الموارد وتصنيفها والتنبؤ بها
 *
 * البنية:
 *  • طبقة الإدخال  (13 خصائص — واحدة لكل جنس من الموارد)
 *  • طبقة مخفية 1 (26 خلية عصبية — تمثيل الخصائص المشتركة)
 *  • طبقة مخفية 2 (18 خلية عصبية — التحليل المتقدم)
 *  • طبقة الإخراج (6 خصائص — أبعاد تقييم الموارد)
 */
class ResourcesNeuralNetwork {

    constructor() {
        this.name    = 'شبكة شيخة العصبية للموارد';
        this.nameEn  = 'Sheikha Resources Neural Network';
        this.version = '1.0.0';
        this.tawheed = 'لا إله إلا الله';
        this.startedAt = new Date().toISOString();

        // أجناس الموارد (مدخلات الشبكة)
        this.resourceGenera = Object.keys(RESOURCE_TAXONOMY); // 10 أجناس

        // أبعاد التقييم (مخرجات الشبكة)
        this.evaluationDimensions = RESOURCE_METRICS.dimensions.map(d => d.id); // 6 أبعاد

        // تهيئة الشبكة العصبية الحقيقية إذا كانت متاحة
        this._nn = null;
        if (NeuralNetwork) {
            try {
                this._nn = new NeuralNetwork([
                    this.resourceGenera.length,   // 13 مدخلات
                    26,                           // طبقة مخفية 1
                    18,                           // طبقة مخفية 2
                    this.evaluationDimensions.length, // 6 مخرجات
                ]);
            } catch (_) { /* تعمل بدون شبكة عصبية حقيقية */ }
        }

        // قاعدة المعرفة المدمجة
        this.taxonomy = RESOURCE_TAXONOMY;
        this.metrics  = RESOURCE_METRICS;

        // حالة التحليل
        this._analysisCache = new Map();
        this._alertLog = [];
    }

    // ──────────────────────────────────────────────────────────────────────────
    // A. تحليل مورد واحد
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * تحليل مورد محدد وإعطاء تقييم شامل
     * @param {string} genusId - معرف الجنس (natural | energy | agricultural | ...)
     * @param {string} [typeId] - معرف النوع الفرعي (اختياري)
     * @param {object} [metrics] - قيم المقاييس الفعلية (اختياري)
     * @returns {object}
     */
    analyzeResource(genusId, typeId = null, metrics = {}) {
        const genus = this.taxonomy[genusId];
        if (!genus) {
            return { success: false, error: `جنس الموارد "${genusId}" غير موجود` };
        }

        const type  = typeId
            ? (genus.types || []).find(t => t.id === typeId) || null
            : null;

        // حساب درجة التقييم متعدد الأبعاد
        const score = this._evaluateResource(genusId, metrics);

        // التحقق الشرعي
        const compliance = this._shariaResourceCheck(genusId, typeId, metrics);

        // توصيات الاستخدام الأمثل
        const recommendations = this._generateRecommendations(genusId, score, metrics);

        const result = {
            schema:   'sheikha/resources/v1',
            tawheed:  this.tawheed,
            resource: {
                genusId,
                typeId,
                nameAr: genus.nameAr,
                nameEn: genus.nameEn,
                maqsad: genus.maqsad,
                icon:   genus.icon,
                quranRef: genus.quranRef,
                typeInfo: type,
            },
            score,
            compliance,
            recommendations,
            metrics: metrics,
            timestamp: new Date().toISOString(),
        };

        // تخزين مؤقت
        this._analysisCache.set(`${genusId}:${typeId}`, result);
        return result;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // B. تحليل شامل لكل الموارد
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * تقييم شامل لمنظومة الموارد كاملة
     * @param {object} [context] - سياق (بلد، مؤسسة، مشروع)
     * @returns {object}
     */
    fullResourcesAnalysis(context = {}) {
        const analyses = {};
        let totalScore = 0;
        let count = 0;

        for (const genusId of this.resourceGenera) {
            const result = this.analyzeResource(genusId, null, context[genusId] || {});
            analyses[genusId] = result;
            if (result.score && result.score.overall !== undefined) {
                totalScore += result.score.overall;
                count++;
            }
        }

        const overallScore = count > 0 ? totalScore / count : 0;
        const alerts = this._generateAlerts(analyses);
        const priorities = this._rankResourcePriorities(analyses);

        return {
            schema: 'sheikha/resources/full/v1',
            tawheed: this.tawheed,
            context,
            overallScore: Math.round(overallScore * 100) / 100,
            analyses,
            alerts,
            priorities,
            summary: this._buildSummary(analyses, overallScore),
            islamicGuidance: this._getIslamicResourceGuidance(),
            timestamp: new Date().toISOString(),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // C. التنبؤ بالموارد (Forecasting)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * التنبؤ بمستوى مورد خلال فترة زمنية
     * @param {string} genusId
     * @param {number} years - عدد السنوات للتنبؤ
     * @param {object} [currentState] - الحالة الراهنة
     * @returns {object}
     */
    forecastResource(genusId, years = 5, currentState = {}) {
        const genus = this.taxonomy[genusId];
        if (!genus) {
            return { success: false, error: `جنس "${genusId}" غير موجود` };
        }

        const forecasts = [];
        const baseValue = currentState.value || 100;
        // معدلات نمو افتراضية بحسب جنس الموارد
        const growthRates = {
            natural:       -0.02,  // استنزاف طبيعي
            energy:         0.04,  // نمو مع تحول طاقة
            agricultural:   0.03,  // نمو زراعي
            human:          0.02,  // نمو بشري
            financial:      0.06,  // نمو مالي
            digital:        0.25,  // نمو رقمي سريع
            industrial:     0.03,  // نمو صناعي
            knowledge:      0.08,  // نمو معرفي
            environmental: -0.01,  // تدهور بيئي بطيء
            strategic:      0.01,  // نمو استراتيجي محدود
            industry_full:      0.05,  // نمو صناعي شامل
            supply_lines:       0.04,  // نمو خطوط الإمداد
            logistics_networks: 0.07,  // نمو لوجستي سريع
        };

        const rate = growthRates[genusId] || 0.03;
        let value = baseValue;

        for (let y = 1; y <= years; y++) {
            value = value * (1 + rate);
            const year = new Date().getFullYear() + y;
            forecasts.push({
                year,
                value: Math.round(value * 100) / 100,
                change: Math.round(rate * 100 * 100) / 100 + '%',
                outlook: value > baseValue ? 'تحسّن' : 'تراجع',
            });
        }

        return {
            schema: 'sheikha/resources/forecast/v1',
            genusId,
            nameAr: genus.nameAr,
            baseValue,
            growthRate: rate,
            years,
            forecasts,
            shariaNote: 'التخطيط للمستقبل سنة نبوية — لا بد من الاستخلاف الرشيد',
            quranRef: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ — الحشر ١٨',
            timestamp: new Date().toISOString(),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // D. تحسين توزيع الموارد (Optimization)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * اقتراح التوزيع الأمثل للموارد بين قطاعات متعددة
     * @param {string} genusId
     * @param {number} totalBudget - الميزانية / الكمية الإجمالية
     * @param {Array<{sectorId: string, nameAr: string, priority: number, constraint: number}>} sectors
     * @returns {object}
     */
    optimizeAllocation(genusId, totalBudget, sectors = []) {
        if (!this.taxonomy[genusId]) {
            return { success: false, error: `جنس "${genusId}" غير موجود` };
        }

        if (sectors.length === 0) {
            return { success: false, error: 'يجب تحديد القطاعات المراد التوزيع بينها' };
        }

        // توزيع بناءً على الأولوية مع مراعاة القيود
        const totalPriority = sectors.reduce((s, sec) => s + (sec.priority || 1), 0);
        const allocations = sectors.map(sec => {
            const proportionalShare = ((sec.priority || 1) / totalPriority) * totalBudget;
            const allocated = Math.min(proportionalShare, sec.constraint || Infinity);
            return {
                sectorId: sec.sectorId,
                nameAr:   sec.nameAr || sec.sectorId,
                priority: sec.priority || 1,
                allocated: Math.round(allocated * 100) / 100,
                share: Math.round((allocated / totalBudget) * 10000) / 100 + '%',
            };
        });

        const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);

        return {
            schema: 'sheikha/resources/optimization/v1',
            tawheed: this.tawheed,
            genusId,
            totalBudget,
            totalAllocated: Math.round(totalAllocated * 100) / 100,
            remainder: Math.round((totalBudget - totalAllocated) * 100) / 100,
            allocations,
            islamicPrinciple: 'العدل في التوزيع — إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ — النحل ٩٠',
            timestamp: new Date().toISOString(),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // E2. دراسة الجدوى المتكاملة
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * دراسة جدوى متكاملة لمشروع صناعي أو لوجستي
     *
     * @param {object} project
     * @param {string} project.name          - اسم المشروع
     * @param {string} [project.sector]      - القطاع (petrochemical | food | logistics | ...)
     * @param {number} [project.investment]  - الاستثمار الإجمالي (USD)
     * @param {number} [project.capacity]    - الطاقة الإنتاجية المستهدفة
     * @param {string} [project.location]    - الموقع (المدينة / المنطقة)
     * @param {number} [project.yearsPayback]- فترة الاسترداد المستهدفة (سنوات)
     * @param {string} [project.financeType] - نوع التمويل (islamic | conventional)
     * @returns {object}
     */
    feasibilityStudy(project = {}) {
        const {
            name         = 'مشروع غير مسمى',
            sector       = 'industry_full',
            investment   = 10_000_000,
            capacity     = 1000,
            location     = 'الرياض',
            yearsPayback = 7,
            financeType  = 'islamic',
        } = project;

        // ① الجدوى التسويقية
        const marketStudy = this._marketFeasibility(sector, location);

        // ② الجدوى الفنية
        const technicalStudy = this._technicalFeasibility(sector, capacity);

        // ③ الجدوى المالية
        const financialStudy = this._financialFeasibility(investment, capacity, yearsPayback, financeType);

        // ④ الجدوى البيئية
        const envStudy = this._environmentalFeasibility(sector);

        // ⑤ الجدوى القانونية والتنظيمية
        const legalStudy = this._legalFeasibility(sector, location);

        // ⑥ الجدوى الشرعية
        const shariaStudy = this._shariaFeasibility(sector, financeType);

        // ⑦ الدرجة الإجمالية
        const scores = [
            marketStudy.score,
            technicalStudy.score,
            financialStudy.score,
            envStudy.score,
            legalStudy.score,
            shariaStudy.score,
        ];
        const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100;
        const recommendation = overallScore >= 75 ? 'مشروع مجدٍ — يُوصى بالمضي قدماً'
            : overallScore >= 55 ? 'مشروع مجدٍ جزئياً — يحتاج مراجعة وتعديل'
            : 'مشروع غير مجدٍ حالياً — يحتاج إعادة هيكلة';

        return {
            schema:      'sheikha/feasibility/v1',
            tawheed:     this.tawheed,
            project:     { name, sector, investment, capacity, location, yearsPayback, financeType },
            overallScore,
            grade:       this._scoreToGrade(overallScore),
            recommendation,
            studies: {
                market:      marketStudy,
                technical:   technicalStudy,
                financial:   financialStudy,
                environmental: envStudy,
                legal:       legalStudy,
                sharia:      shariaStudy,
            },
            islamicGuidance: 'التخطيط قبل العمل سنة نبوية — اعقلها وتوكل',
            quranRef: 'وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا — القصص ٧٧',
            timestamp: new Date().toISOString(),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // E3. تحليل خط إمداد أو إنتاج
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * تحليل شامل لخط إمداد أو خط إنتاج
     *
     * @param {object} line
     * @param {string} line.type        - نوع الخط (production | pipeline | supply_chain | electricity | water)
     * @param {string} [line.name]      - اسم الخط
     * @param {number} [line.capacity]  - الطاقة الاستيعابية
     * @param {number} [line.utilization] - نسبة الاستخدام الحالية %
     * @param {number} [line.downtime]  - ساعات التوقف شهرياً
     * @param {number} [line.defectRate] - معدل العيوب PPM
     * @returns {object}
     */
    analyzeSupplyLine(line = {}) {
        const {
            type        = 'supply_chain',
            name        = 'خط غير مسمى',
            capacity    = 1000,
            utilization = 75,
            downtime    = 8,
            defectRate  = 500,
        } = line;

        // مؤشرات أداء الخط
        const oee = Math.min(100, Math.round(utilization * (1 - defectRate / 1_000_000) * (1 - downtime / (30 * 24)) * 100) / 100);
        const availabilityScore = Math.max(0, 100 - downtime * 2);
        const qualityScore      = Math.max(0, 100 - defectRate / 100);
        const performanceScore  = utilization;
        const overallScore      = Math.round((availabilityScore + qualityScore + performanceScore) / 3 * 100) / 100;

        // نقاط الضعف والتوصيات
        const issues = [];
        const recommendations = [];

        if (downtime > 20) {
            issues.push({ severity: 'حرج', text: `وقت التوقف مرتفع جداً: ${downtime} ساعة/شهر` });
            recommendations.push('تطبيق الصيانة الوقائية (PM) وتحليل سبب الجذر (RCA)');
        }
        if (defectRate > 1000) {
            issues.push({ severity: 'عالٍ', text: `معدل العيوب مرتفع: ${defectRate} PPM` });
            recommendations.push('مراجعة معايير الجودة وتفعيل Six Sigma / SPC');
        }
        if (utilization < 60) {
            issues.push({ severity: 'متوسط', text: `استخدام الطاقة منخفض: ${utilization}%` });
            recommendations.push('مراجعة الطلب وتحسين جدولة الإنتاج');
        }
        if (issues.length === 0) {
            recommendations.push('الخط في وضع ممتاز — الاستمرار في مراقبة المؤشرات');
        }

        const lineTypeInfo = (this.taxonomy.supply_lines?.types || []).find(t => t.id === type);

        return {
            schema:     'sheikha/supply-line/v1',
            tawheed:    this.tawheed,
            line:       { type, name, capacity, utilization, downtime, defectRate },
            lineTypeInfo,
            kpis: {
                oee:              oee + '%',
                availability:     availabilityScore + '%',
                quality:          qualityScore + '%',
                performance:      performanceScore + '%',
                overallScore,
            },
            grade: this._scoreToGrade(overallScore),
            issues,
            recommendations,
            islamicPrinciple: 'الإتقان في العمل — إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',
            timestamp: new Date().toISOString(),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // E4. تحليل شبكة لوجستية
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * تحليل شبكة لوجستية كاملة
     *
     * @param {object} network
     * @param {string} [network.name]        - اسم الشبكة
     * @param {string} [network.mode]        - وسيلة النقل (land | sea | air | multimodal)
     * @param {number} [network.nodes]       - عدد العقد (مستودعات، موانئ، مراكز توزيع)
     * @param {number} [network.routes]      - عدد المسارات
     * @param {number} [network.onTimeRate]  - معدل التسليم في الوقت %
     * @param {number} [network.costPerUnit] - تكلفة الوحدة (USD/طن)
     * @param {number} [network.co2PerUnit]  - انبعاثات CO2 (kg/طن.كم)
     * @returns {object}
     */
    analyzeLogisticsNetwork(network = {}) {
        const {
            name        = 'شبكة لوجستية',
            mode        = 'multimodal',
            nodes       = 10,
            routes      = 25,
            onTimeRate  = 85,
            costPerUnit = 50,
            co2PerUnit  = 0.15,
        } = network;

        // تقييم الأداء
        const deliveryScore    = onTimeRate;
        const costScore        = Math.max(0, 100 - costPerUnit / 2);
        const sustainScore     = Math.max(0, 100 - co2PerUnit * 200);
        const coverageScore    = Math.min(100, nodes * 5 + routes * 2);
        const overallScore     = Math.round((deliveryScore + costScore + sustainScore + coverageScore) / 4 * 100) / 100;

        // تحديد وسيلة النقل الأنسب
        const modeAnalysis = {
            land:       { nameAr: 'بري', bestFor: 'مسافات قصيرة-متوسطة، مرونة، تسليم باب-لباب', cost: 'متوسط', speed: 'متوسط', co2: 'متوسط-عالٍ' },
            sea:        { nameAr: 'بحري', bestFor: 'كميات كبيرة، مسافات طويلة، تكلفة منخفضة', cost: 'منخفض', speed: 'بطيء', co2: 'منخفض' },
            air:        { nameAr: 'جوي', bestFor: 'شحنات عاجلة، قيمة عالية، حجم صغير', cost: 'مرتفع جداً', speed: 'سريع جداً', co2: 'مرتفع جداً' },
            multimodal: { nameAr: 'متعدد الوسائط', bestFor: 'الجمع بين مزايا وسائل متعددة', cost: 'متوسط', speed: 'مرن', co2: 'متوسط' },
        };

        // توصيات
        const recommendations = [];
        if (onTimeRate < 90) recommendations.push({ priority: 'عالٍ', text: 'تحسين معدل الدقة في التسليم — تبني تتبع فوري ومرونة مسارات' });
        if (costPerUnit > 80) recommendations.push({ priority: 'عالٍ', text: 'خفض تكلفة النقل — مراجعة عقود 3PL وتحسين التحميل (Consolidation)' });
        if (co2PerUnit > 0.2) recommendations.push({ priority: 'متوسط', text: 'تقليل البصمة الكربونية — وسائل نقل أنظف (كهربائية / بحري)' });
        if (nodes < 5) recommendations.push({ priority: 'متوسط', text: 'توسيع الشبكة بمزيد من المستودعات والمراكز الإقليمية' });
        if (recommendations.length === 0) recommendations.push({ priority: 'منخفض', text: 'الشبكة في وضع ممتاز — مراقبة مستمرة وتحسين مستدام' });

        return {
            schema:     'sheikha/logistics-network/v1',
            tawheed:    this.tawheed,
            network:    { name, mode, nodes, routes, onTimeRate, costPerUnit, co2PerUnit },
            modeInfo:   modeAnalysis[mode] || modeAnalysis.multimodal,
            kpis: {
                deliveryScore:    deliveryScore + '%',
                costScore:        Math.round(costScore) + '/100',
                sustainScore:     Math.round(sustainScore) + '/100',
                coverageScore:    Math.min(100, Math.round(coverageScore)) + '/100',
                overallScore,
            },
            grade: this._scoreToGrade(overallScore),
            recommendations,
            islamicPrinciple: 'وَسَخَّرَ لَكُمُ الْفُلْكَ — تسخير وسائل النقل لخدمة التجارة المشروعة',
            taxonomy: this.taxonomy.logistics_networks,
            timestamp: new Date().toISOString(),
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // E5. عرض قائمة القطاعات الصناعية الكاملة
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * قائمة تفصيلية بكل القطاعات الصناعية مع بياناتها
     * @returns {object}
     */
    listIndustrySectors() {
        const genus = this.taxonomy.industry_full;
        return {
            nameAr:   genus.nameAr,
            nameEn:   genus.nameEn,
            icon:     genus.icon,
            quranRef: genus.quranRef,
            sectors:  genus.types,
            saudiFramework: genus.saudiFramework,
            count:    genus.types.length,
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // دوال مساعدة لدراسة الجدوى (خاصة)
    // ──────────────────────────────────────────────────────────────────────────

    _marketFeasibility(sector, location) {
        const demandMap = {
            petrochemical: 85, food_processing: 90, construction: 80,
            pharmaceutical: 88, automotive: 70, electronics_tech: 82,
            logistics: 87, industrial: 75,
        };
        const demand = demandMap[sector] || 70;
        const competition = Math.round(Math.random() * 20 + 40);
        const score = Math.round((demand * 0.6 + (100 - competition) * 0.4) * 100) / 100;
        return {
            nameAr: 'الجدوى التسويقية',
            score,
            demand: demand + '/100',
            competition: competition + '/100',
            targetMarket: `سوق ${location} والمنطقة`,
            note: 'دراسة الطلب والعرض والمنافسة في السوق المستهدف',
        };
    }

    _technicalFeasibility(sector, capacity) {
        const complexityMap = { petrochemical: 0.6, food_processing: 0.8, logistics: 0.85, construction: 0.75 };
        const base = (complexityMap[sector] || 0.7) * 100;
        const capacityBonus = capacity > 500 ? 5 : -5;
        const score = Math.min(100, Math.round(base + capacityBonus));
        return {
            nameAr: 'الجدوى الفنية والتقنية',
            score,
            availableTechnology: 'متاحة ومجربة',
            requiredSkills: 'كوادر فنية متخصصة',
            infrastructure: 'بنية تحتية مناسبة',
            note: 'تقييم توفر التكنولوجيا والكوادر والبنية التحتية',
        };
    }

    _financialFeasibility(investment, capacity, yearsPayback, financeType) {
        const annualRevenue = investment * 0.18;
        const operatingCost = investment * 0.10;
        const netProfit = annualRevenue - operatingCost;
        const paybackYears = investment / netProfit;
        const roi = (netProfit / investment) * 100;
        const score = Math.min(100, Math.max(0, Math.round(
            (yearsPayback / paybackYears) * 50 + Math.min(50, roi)
        )));
        const isIslamicFinance = financeType === 'islamic';
        return {
            nameAr: 'الجدوى المالية',
            score,
            annualRevenue:  Math.round(annualRevenue),
            operatingCost:  Math.round(operatingCost),
            netProfit:      Math.round(netProfit),
            paybackYears:   Math.round(paybackYears * 10) / 10,
            roi:            Math.round(roi * 10) / 10 + '%',
            financeType:    isIslamicFinance ? 'تمويل إسلامي (مرابحة/مشاركة/صكوك)' : 'تمويل تقليدي',
            compliance:     isIslamicFinance ? '✅ متوافق شرعياً' : '⚠️ يجب مراجعة الفوائد',
            note: 'تحليل العائد على الاستثمار وفترة الاسترداد والربحية',
        };
    }

    _environmentalFeasibility(sector) {
        const greenSectors = ['renewable_energy_mfg', 'food_processing', 'logistics'];
        const highImpact   = ['petrochemical', 'metals_steel', 'mining_processing'];
        let score = 75;
        if (greenSectors.includes(sector)) score = 88;
        if (highImpact.includes(sector))   score = 55;
        return {
            nameAr: 'الجدوى البيئية',
            score,
            carbonFootprint: highImpact.includes(sector) ? 'مرتفع' : 'متوسط-منخفض',
            mitigations: ['التزام بمعايير ISO 14001', 'تقليل النفايات', 'كفاءة الطاقة', 'معالجة مياه الصرف'],
            saudiRequirement: 'تقرير تقييم الأثر البيئي (EIA) إلزامي قبل الترخيص',
            note: 'الالتزام بمعايير البيئة السعودية والدولية',
        };
    }

    _legalFeasibility(sector, location) {
        return {
            nameAr: 'الجدوى القانونية والتنظيمية',
            score: 80,
            licenses: ['سجل تجاري', 'ترخيص بلدي', 'ترخيص بيئي', 'ترخيص وزارة الصناعة'],
            entities: ['وزارة الصناعة والثروة المعدنية', 'الهيئة العامة للاستثمار (MISA)', 'هيئة المناطق الصناعية (مدن)'],
            location: `منطقة ${location}`,
            note: 'التأكد من الامتثال للوائح السعودية والاشتراطات القطاعية',
        };
    }

    _shariaFeasibility(sector, financeType) {
        const prohibitedSectors = ['خمور', 'قمار', 'ربا', 'تبغ'];
        const isProhibited = prohibitedSectors.some(p => sector.includes(p));
        const financeScore = financeType === 'islamic' ? 95 : 60;
        const score = isProhibited ? 0 : financeScore;
        return {
            nameAr: 'الجدوى الشرعية الإسلامية',
            score,
            compliant: !isProhibited,
            productHalal: !isProhibited,
            financeHalal: financeType === 'islamic',
            violations: isProhibited ? ['القطاع محرم شرعاً'] : [],
            recommendations: isProhibited
                ? ['تغيير القطاع إلى نشاط حلال']
                : ['الاستمرار مع الالتزام بالضوابط الشرعية'],
            principle: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة ٢٧٥',
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // E. استعلام معرفي
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * استرداد معلومات تفصيلية عن جنس أو نوع مورد
     * @param {string} genusId
     * @param {string} [typeId]
     * @returns {object}
     */
    getResourceInfo(genusId, typeId = null) {
        const genus = this.taxonomy[genusId];
        if (!genus) {
            return {
                success: false,
                available: Object.keys(this.taxonomy),
                error: `جنس "${genusId}" غير موجود — الأجناس المتاحة: ${Object.keys(this.taxonomy).join(', ')}`,
            };
        }

        if (typeId) {
            const type = (genus.types || []).find(t => t.id === typeId);
            return { success: true, genus, type: type || null };
        }

        return { success: true, genus };
    }

    /**
     * قائمة كل الموارد
     * @returns {object[]}
     */
    listAllResources() {
        return Object.values(this.taxonomy).map(g => ({
            id: g.id,
            nameAr: g.nameAr,
            nameEn: g.nameEn,
            maqsad: g.maqsad,
            icon:   g.icon,
            typesCount: (g.types || []).length,
            quranRef: g.quranRef,
        }));
    }

    /**
     * بحث في الموارد بالاسم أو المعرف
     * @param {string} query
     * @returns {object[]}
     */
    searchResources(query) {
        const q = String(query).toLowerCase().trim();
        const results = [];

        for (const [genusId, genus] of Object.entries(this.taxonomy)) {
            const matchGenus = genus.nameAr.includes(q) || genus.nameEn.toLowerCase().includes(q) || genusId.includes(q);
            if (matchGenus) {
                results.push({ type: 'genus', id: genusId, nameAr: genus.nameAr, nameEn: genus.nameEn, icon: genus.icon });
            }

            for (const t of (genus.types || [])) {
                if ((t.nameAr && t.nameAr.includes(q)) || (t.nameEn && t.nameEn.toLowerCase().includes(q))) {
                    results.push({ type: 'subtype', genusId, typeId: t.id, nameAr: t.nameAr, nameEn: t.nameEn });
                }
            }
        }

        return results;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // F. الوظائف الداخلية
    // ──────────────────────────────────────────────────────────────────────────

    /** تقييم مورد على أبعاد متعددة */
    _evaluateResource(genusId, metrics) {
        const dims = RESOURCE_METRICS.dimensions;
        const scores = {};
        let weighted = 0;

        for (const dim of dims) {
            const raw = metrics[dim.id] !== undefined
                ? Math.min(100, Math.max(0, Number(metrics[dim.id])))
                : this._defaultScore(genusId, dim.id);
            scores[dim.id] = raw;
            weighted += raw * dim.weight;
        }

        return {
            dimensions: scores,
            overall: Math.round(weighted * 100) / 100,
            grade: this._scoreToGrade(weighted),
        };
    }

    /** درجة افتراضية بحسب جنس المورد والبُعد */
    _defaultScore(genusId, dimId) {
        const defaults = {
            natural:       { availability: 60, accessibility: 55, efficiency: 50, sustainability: 45, economic_value: 70, sharia_compliance: 90 },
            energy:        { availability: 65, accessibility: 60, efficiency: 55, sustainability: 50, economic_value: 75, sharia_compliance: 85 },
            agricultural:  { availability: 70, accessibility: 65, efficiency: 60, sustainability: 65, economic_value: 70, sharia_compliance: 95 },
            human:         { availability: 75, accessibility: 70, efficiency: 65, sustainability: 80, economic_value: 80, sharia_compliance: 95 },
            financial:     { availability: 60, accessibility: 50, efficiency: 65, sustainability: 55, economic_value: 85, sharia_compliance: 80 },
            digital:       { availability: 80, accessibility: 75, efficiency: 70, sustainability: 60, economic_value: 90, sharia_compliance: 85 },
            industrial:    { availability: 65, accessibility: 60, efficiency: 60, sustainability: 50, economic_value: 75, sharia_compliance: 88 },
            knowledge:     { availability: 70, accessibility: 65, efficiency: 75, sustainability: 90, economic_value: 80, sharia_compliance: 95 },
            environmental: { availability: 50, accessibility: 55, efficiency: 40, sustainability: 35, economic_value: 60, sharia_compliance: 90 },
            strategic:     { availability: 55, accessibility: 50, efficiency: 60, sustainability: 65, economic_value: 70, sharia_compliance: 95 },
            industry_full:      { availability: 70, accessibility: 65, efficiency: 65, sustainability: 55, economic_value: 80, sharia_compliance: 88 },
            supply_lines:       { availability: 65, accessibility: 60, efficiency: 70, sustainability: 60, economic_value: 75, sharia_compliance: 90 },
            logistics_networks: { availability: 70, accessibility: 68, efficiency: 65, sustainability: 58, economic_value: 78, sharia_compliance: 90 },
        };
        return (defaults[genusId] || {})[dimId] || 60;
    }

    /** تحويل الدرجة إلى تقدير */
    _scoreToGrade(score) {
        if (score >= 90) return { label: 'ممتاز', labelEn: 'Excellent', icon: '🌟' };
        if (score >= 75) return { label: 'جيد جداً', labelEn: 'Very Good', icon: '✅' };
        if (score >= 60) return { label: 'جيد', labelEn: 'Good', icon: '👍' };
        if (score >= 45) return { label: 'مقبول', labelEn: 'Acceptable', icon: '⚠️' };
        return { label: 'يحتاج تحسين', labelEn: 'Needs Improvement', icon: '❌' };
    }

    /** التحقق الشرعي من استخدام المورد */
    _shariaResourceCheck(genusId, typeId, metrics) {
        const violations = [];
        const warnings  = [];
        const notes     = [];

        // التحقق من الربا في الموارد المالية
        if (genusId === 'financial' && metrics.interest_rate) {
            violations.push('ربا — الفائدة على رأس المال محرمة');
        }

        // التحقق من الإفساد في الموارد البيئية
        if (genusId === 'environmental' && metrics.pollution_index > 80) {
            violations.push('إفساد في الأرض — التلوث الشديد محرّم');
        }

        // تحذير من الإسراف
        if (metrics.usage_efficiency !== undefined && metrics.usage_efficiency < 30) {
            warnings.push('إسراف في استخدام الموارد — إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ');
        }

        // إضافة مرجع شرعي للمورد
        const genus = this.taxonomy[genusId];
        if (genus && genus.quranRef) {
            notes.push(genus.quranRef);
        }

        return {
            compliant: violations.length === 0,
            violations,
            warnings,
            notes,
            principle: 'لا ضرر ولا ضرار',
        };
    }

    /** توليد توصيات لاستخدام المورد بشكل أمثل */
    _generateRecommendations(genusId, score, metrics) {
        const recs = [];

        if (score.overall < 60) {
            recs.push({ priority: 'عاجل', text: `تحسين منظومة الموارد ${this.taxonomy[genusId]?.nameAr || genusId} بشكل عاجل`, icon: '🚨' });
        }

        if (score.dimensions && score.dimensions.sustainability < 50) {
            recs.push({ priority: 'عالي', text: 'تعزيز الاستدامة — الموارد أمانة للأجيال القادمة', icon: '🌿' });
        }

        if (score.dimensions && score.dimensions.efficiency < 55) {
            recs.push({ priority: 'متوسط', text: 'رفع كفاءة الاستخدام — تجنب الإسراف', icon: '⚡' });
        }

        if (score.dimensions && score.dimensions.accessibility < 50) {
            recs.push({ priority: 'متوسط', text: 'تحسين إمكانية الوصول — العدالة في التوزيع', icon: '⚖️' });
        }

        if (recs.length === 0) {
            recs.push({ priority: 'منخفض', text: 'المورد في حالة جيدة — استمرار المتابعة والتحسين المستمر', icon: '✅' });
        }

        return recs;
    }

    /** توليد تنبيهات بناءً على نتائج التحليل الشامل */
    _generateAlerts(analyses) {
        const alerts = [];
        for (const [genusId, result] of Object.entries(analyses)) {
            if (result.score && result.score.overall < 50) {
                alerts.push({
                    severity: 'critical',
                    genusId,
                    nameAr: result.resource?.nameAr,
                    message: `مورد ${result.resource?.nameAr} في وضع حرج — يتطلب تدخلاً فورياً`,
                    icon: '🚨',
                });
            } else if (result.score && result.score.overall < 65) {
                alerts.push({
                    severity: 'warning',
                    genusId,
                    nameAr: result.resource?.nameAr,
                    message: `مورد ${result.resource?.nameAr} يحتاج انتباهاً`,
                    icon: '⚠️',
                });
            }

            if (result.compliance && !result.compliance.compliant) {
                alerts.push({
                    severity: 'sharia_violation',
                    genusId,
                    violations: result.compliance.violations,
                    message: `مخالفة شرعية في ${result.resource?.nameAr}`,
                    icon: '🚫',
                });
            }
        }
        return alerts;
    }

    /** ترتيب الموارد حسب الأولوية */
    _rankResourcePriorities(analyses) {
        const ranked = Object.entries(analyses)
            .map(([genusId, result]) => ({
                genusId,
                nameAr: result.resource?.nameAr,
                icon:   result.resource?.icon,
                score:  result.score?.overall || 0,
                maqsad: result.resource?.maqsad,
            }))
            .sort((a, b) => a.score - b.score); // الأقل درجة = الأعلى أولوية

        return ranked.map((r, i) => ({ ...r, rank: i + 1 }));
    }

    /** ملخص تنفيذي */
    _buildSummary(analyses, overallScore) {
        const total   = Object.keys(analyses).length;
        const healthy = Object.values(analyses).filter(a => a.score?.overall >= 75).length;
        const atRisk  = Object.values(analyses).filter(a => a.score?.overall < 50).length;

        return {
            totalGenera: total,
            healthyGenera: healthy,
            atRiskGenera: atRisk,
            overallScore: Math.round(overallScore * 100) / 100,
            grade: this._scoreToGrade(overallScore),
            headline: overallScore >= 75
                ? 'منظومة الموارد في حالة جيدة — وَفِي السَّمَاءِ رِزْقُكُمْ'
                : overallScore >= 50
                    ? 'منظومة الموارد تحتاج تحسيناً — اتقان وعدل وإحسان'
                    : 'منظومة الموارد في وضع حرج — استغفار وإصلاح عاجل',
        };
    }

    /** توجيهات إسلامية عامة لإدارة الموارد */
    _getIslamicResourceGuidance() {
        return [
            { principle: 'الاستخلاف', text: 'الإنسان مستخلف على الموارد — أمانة لأداء حسنها وعدم الإفساد فيها', quranRef: 'وَهُوَ الَّذِي جَعَلَكُمْ خَلَائِفَ الْأَرْضِ — الأنعام ١٦٥' },
            { principle: 'الاستدامة', text: 'الموارد أمانة للأجيال القادمة — لا يجوز استنزافها', quranRef: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا — الأعراف ٥٦' },
            { principle: 'العدل',    text: 'التوزيع العادل للموارد واجب ديني', quranRef: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ — النحل ٩٠' },
            { principle: 'الإتقان',  text: 'إتقان استخدام الموارد وعدم الإسراف', hadith: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — صحيح' },
            { principle: 'الشكر',    text: 'شكر الله على نعم الموارد يزيدها', quranRef: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ — إبراهيم ٧' },
            { principle: 'الزكاة',   text: 'أداء حق الموارد المالية في الزكاة', quranRef: 'وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ — الذاريات ١٩' },
        ];
    }

    // ──────────────────────────────────────────────────────────────────────────
    // G. واجهة المحرك الموحدة — Engine Interface
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * نقطة الدخول الموحدة المتوافقة مع الموجّه العصبي
     * @param {object} req
     * @param {string} req.intent
     * @param {object} req.data
     * @returns {Promise<object>}
     */
    async handle(req) {
        const { intent = 'resources.list', data = {}, traceId } = req;
        const subIntent = intent.replace(/^resources?\.?/, '') || 'list';

        switch (subIntent) {
            case 'list':
            case '':
                return { action: 'list', resources: this.listAllResources(), total: this.resourceGenera.length };

            case 'analyze':
                return this.analyzeResource(data.genusId, data.typeId, data.metrics || {});

            case 'full':
            case 'full_analysis':
                return this.fullResourcesAnalysis(data.context || {});

            case 'forecast':
                return this.forecastResource(data.genusId, data.years || 5, data.currentState || {});

            case 'optimize':
            case 'allocate':
                return this.optimizeAllocation(data.genusId, data.totalBudget || 100, data.sectors || []);

            case 'info':
                return this.getResourceInfo(data.genusId, data.typeId);

            case 'search':
                return { results: this.searchResources(data.query || '') };

            case 'feasibility':
            case 'feasibility_study':
            case 'jadwa':
            case 'جدوى':
                return this.feasibilityStudy(data.project || data);

            case 'supply_line':
            case 'supply_lines':
            case 'line':
            case 'production_line':
                return this.analyzeSupplyLine(data.line || data);

            case 'logistics':
            case 'logistics_network':
            case 'logistics_networks':
            case 'loj':
                return this.analyzeLogisticsNetwork(data.network || data);

            case 'industry':
            case 'industry_full':
            case 'industries':
                return this.listIndustrySectors();

            case 'status':
                return this.status();

            default:
                // محاولة تفسير القصد كـ genusId
                if (this.taxonomy[subIntent]) {
                    return this.analyzeResource(subIntent, null, data);
                }
                return {
                    success: false,
                    error: `قصد غير معروف: "${subIntent}"`,
                    availableActions: ['list', 'analyze', 'full', 'forecast', 'optimize', 'info', 'search',
                        'feasibility', 'supply_line', 'logistics', 'industry', 'status'],
                };
        }
    }

    /** حالة الشبكة العصبية للموارد */
    status() {
        return {
            name:           this.name,
            nameEn:         this.nameEn,
            version:        this.version,
            startedAt:      this.startedAt,
            tawheed:        this.tawheed,
            resourceGenera: this.resourceGenera.length,
            genera:         this.resourceGenera,
            neuralNetwork:  this._nn ? 'مفعّلة' : 'غير متاحة (بيانات ثابتة)',
            cacheSize:      this._analysisCache.size,
            quranRef:       'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ — الجاثية ١٣',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Singleton + Export
// ═══════════════════════════════════════════════════════════════════════════════

const resourcesNeuralNetwork = new ResourcesNeuralNetwork();

// واجهة المحرك الموحدة
const engine = {
    handle:                  (req) => resourcesNeuralNetwork.handle(req),
    execute:                 (req) => resourcesNeuralNetwork.handle(req),
    analyzeResource:         (...a) => resourcesNeuralNetwork.analyzeResource(...a),
    fullAnalysis:            (...a) => resourcesNeuralNetwork.fullResourcesAnalysis(...a),
    forecast:                (...a) => resourcesNeuralNetwork.forecastResource(...a),
    optimizeAllocation:      (...a) => resourcesNeuralNetwork.optimizeAllocation(...a),
    getResourceInfo:         (...a) => resourcesNeuralNetwork.getResourceInfo(...a),
    listAll:                 ()    => resourcesNeuralNetwork.listAllResources(),
    listIndustrySectors:     ()    => resourcesNeuralNetwork.listIndustrySectors(),
    search:                  (q)   => resourcesNeuralNetwork.searchResources(q),
    feasibilityStudy:        (...a) => resourcesNeuralNetwork.feasibilityStudy(...a),
    analyzeSupplyLine:       (...a) => resourcesNeuralNetwork.analyzeSupplyLine(...a),
    analyzeLogisticsNetwork: (...a) => resourcesNeuralNetwork.analyzeLogisticsNetwork(...a),
    status:                  ()    => resourcesNeuralNetwork.status(),
};

module.exports = {
    resourcesNeuralNetwork,
    engine,
    RESOURCE_TAXONOMY,
    RESOURCE_METRICS,
    ResourcesNeuralNetwork,
};
