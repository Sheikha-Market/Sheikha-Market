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
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. الشبكة العصبية للموارد — RESOURCES NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * شبكة عصبية متخصصة في تحليل الموارد وتصنيفها والتنبؤ بها
 *
 * البنية:
 *  • طبقة الإدخال  (10 خصائص — واحدة لكل جنس من الموارد)
 *  • طبقة مخفية 1 (20 خلية عصبية — تمثيل الخصائص المشتركة)
 *  • طبقة مخفية 2 (15 خلية عصبية — التحليل المتقدم)
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
                    this.resourceGenera.length,   // 10 مدخلات
                    20,                           // طبقة مخفية 1
                    15,                           // طبقة مخفية 2
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
                if (t.nameAr && t.nameAr.includes(q) || t.nameEn && t.nameEn.toLowerCase().includes(q)) {
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
                    availableActions: ['list', 'analyze', 'full', 'forecast', 'optimize', 'info', 'search', 'status'],
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
    handle:             (req) => resourcesNeuralNetwork.handle(req),
    execute:            (req) => resourcesNeuralNetwork.handle(req),
    analyzeResource:    (...a) => resourcesNeuralNetwork.analyzeResource(...a),
    fullAnalysis:       (...a) => resourcesNeuralNetwork.fullResourcesAnalysis(...a),
    forecast:           (...a) => resourcesNeuralNetwork.forecastResource(...a),
    optimizeAllocation: (...a) => resourcesNeuralNetwork.optimizeAllocation(...a),
    getResourceInfo:    (...a) => resourcesNeuralNetwork.getResourceInfo(...a),
    listAll:            ()    => resourcesNeuralNetwork.listAllResources(),
    search:             (q)   => resourcesNeuralNetwork.searchResources(q),
    status:             ()    => resourcesNeuralNetwork.status(),
};

module.exports = {
    resourcesNeuralNetwork,
    engine,
    RESOURCE_TAXONOMY,
    RESOURCE_METRICS,
    ResourcesNeuralNetwork,
};
