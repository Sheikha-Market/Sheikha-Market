/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA ENERGY NEURAL NETWORK — شبكة شيخة العصبية للطاقة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ" — النور ٣٥
 * "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ" — الأنبياء ٣٠
 * "وَسَخَّرَ لَكُمُ الشَّمْسَ وَالْقَمَرَ دَائِبَيْنِ" — إبراهيم ٣٣
 * "وَهُوَ الَّذِي أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ نَبَاتَ كُلِّ شَيْءٍ" — الأنعام ٩٩
 *
 * شبكة عصبية متخصصة بالكامل في منظومة الطاقة:
 *
 * ① تصنيف مصادر الطاقة (Energy Source Classification)
 * ② توقع الطلب على الطاقة (Demand Forecasting)
 * ③ تحسين توزيع الطاقة (Grid Optimization)
 * ④ تحليل استقرار الشبكة الكهربائية (Grid Stability Analysis)
 * ⑤ تقييم مشاريع الطاقة المتجددة (Renewable Project Scoring)
 * ⑥ سوق تداول الطاقة الحلال (Halal Energy Trading)
 * ⑦ رؤية السعودية ٢٠٣٠ للطاقة (Saudi Vision 2030 Energy KPIs)
 * ⑧ الامتثال الشرعي لمشاريع الطاقة (Sharia Compliance)
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── استيراد الشبكة العصبية الحقيقية ──────────────────────────────────────────
let NeuralNetwork = null;
let Matrix = null;
try {
    const neuralCore = require('./sheikha-neural-core');
    NeuralNetwork = neuralCore.NeuralNetwork;
    Matrix = neuralCore.Matrix;
} catch (_) { /* تعمل بدون الشبكة العصبية عند غيابها */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. الأساس الشرعي للطاقة
// ═══════════════════════════════════════════════════════════════════════════════

const SHARIA_ENERGY_FOUNDATION = {
    tawheed:    'لَا إِلَٰهَ إِلَّا اللَّهُ — الله نور السماوات والأرض',
    quranRefs: [
        { text: '﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ﴾',                  ref: 'النور: ٣٥',    context: 'الله مصدر كل نور وطاقة' },
        { text: '﴿ وَسَخَّرَ لَكُمُ الشَّمْسَ وَالْقَمَرَ دَائِبَيْنِ ﴾',          ref: 'إبراهيم: ٣٣',  context: 'الشمس مسخّرة لخدمة الإنسان' },
        { text: '﴿ وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَحْيَا بِهِ الْأَرْضَ ﴾',     ref: 'البقرة: ١٦٤',  context: 'الماء مصدر الطاقة المائية' },
        { text: '﴿ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا ﴾',          ref: 'الأعراف: ٥٦',  context: 'حماية البيئة واجب شرعي' },
        { text: '﴿ وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ ﴾',          ref: 'الأنعام: ١٤١', context: 'ترشيد استهلاك الطاقة فريضة' },
        { text: '﴿ وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا ﴾',    ref: 'الأنعام: ٩٧',  context: 'توظيف الطاقة الكونية للهداية' },
        { text: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾',              ref: 'الأنفال: ٦٠',  context: 'الطاقة قوة للأمة الإسلامية' },
    ],
    hadithRefs: [
        { text: '«لا ضرر ولا ضرار»',                           ref: 'ابن ماجه', context: 'الطاقة النظيفة لا تضر البيئة' },
        { text: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',   ref: 'البيهقي', context: 'الكفاءة في استخدام الطاقة' },
        { text: '«المسلمون شركاء في ثلاث: الماء والكلأ والنار»',  ref: 'أبو داود', context: 'الطاقة ملك مشترك للأمة' },
        { text: '«اتقوا النار ولو بشق تمرة»',                    ref: 'البخاري', context: 'الترشيد حتى في اليسير' },
    ],
    principles: {
        noRiba:         'الطاقة الحلال لا تُموَّل بالربا — يُستخدم التمويل الإسلامي (صكوك، مشاركة)',
        noWaste:        'ترشيد الطاقة فريضة — الإسراف محرم',
        noHarm:         'الطاقة النووية مشروطة بضمان السلامة وعدم الإضرار',
        noMonopoly:     'احتكار الطاقة محرم — الوصول العادل حق للجميع',
        environmental:  'حماية البيئة واجب شرعي — الطاقة المتجددة أولى',
        sovereignty:    'الطاقة ركيزة سيادة الأمة — الاستقلال الطاقوي هدف استراتيجي',
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. تصنيف مصادر الطاقة الشامل
// ═══════════════════════════════════════════════════════════════════════════════

const ENERGY_SOURCES = {

    // ── الطاقة الشمسية ──────────────────────────────────────────────────────
    solar: {
        id: 'solar', nameAr: 'الطاقة الشمسية', nameEn: 'Solar Energy',
        icon: '☀️', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَسَخَّرَ لَكُمُ الشَّمْسَ وَالْقَمَرَ دَائِبَيْنِ ﴾ — إبراهيم ٣٣',
        subtypes: [
            { id: 'solar_pv',    nameAr: 'خلايا فوتوفولطية',       nameEn: 'Photovoltaic (PV)',      efficiency: '18–24%',  examples: ['ألواح سيليكون أحادي البلورة', 'ألواح CdTe', 'أنظمة BIPV'] },
            { id: 'solar_csp',   nameAr: 'طاقة شمسية مركّزة',      nameEn: 'Concentrated Solar (CSP)', efficiency: '15–20%', examples: ['أبراج الطاقة', 'الأطباق الشمسية', 'القنوات المكافئة'] },
            { id: 'solar_home',  nameAr: 'أنظمة شمسية منزلية',     nameEn: 'Rooftop Solar',          scale: '1–20 كيلوواط', examples: ['سقف المنازل', 'مزارع المجتمع', 'المزارع الشمسية'] },
            { id: 'solar_agri',  nameAr: 'الزراعة الشمسية',         nameEn: 'Agrivoltaics',           scale: 'متوسط',        examples: ['الزراعة تحت الألواح', 'ري شمسي'] },
        ],
        globalCapacityGW: 1600, saudiTargetGW: 58.7, neomProjectGW: 4,
        costUSDkWh: 0.025, co2gPerKWh: 20, capacityFactor: '15–25%',
        vision2030: { target: 'توليد 50% من الكهرباء بالطاقة الشمسية بحلول 2030', statusAr: 'قيد التنفيذ' },
        keywords: ['solar', 'pv', 'photovoltaic', 'شمسية', 'فوتوفولطية', 'ألواح', 'sun', 'csp', 'نيوم'],
    },

    // ── طاقة الرياح ─────────────────────────────────────────────────────────
    wind: {
        id: 'wind', nameAr: 'طاقة الرياح', nameEn: 'Wind Energy',
        icon: '💨', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَهُوَ الَّذِي يُرْسِلُ الرِّيَاحَ بُشْرًا بَيْنَ يَدَيْ رَحْمَتِهِ ﴾ — الفرقان ٤٨',
        subtypes: [
            { id: 'wind_onshore',  nameAr: 'رياح برية',    nameEn: 'Onshore Wind',    turbines: '2–6 ميغاواط', examples: ['دومة الجندل', 'مزارع رياح الجوف'] },
            { id: 'wind_offshore', nameAr: 'رياح بحرية',   nameEn: 'Offshore Wind',   turbines: '8–20 ميغاواط',examples: ['بحر الشمال', 'NEOM البحري'] },
            { id: 'wind_small',    nameAr: 'رياح صغيرة',   nameEn: 'Small Wind',      turbines: '< 100 كيلوواط', examples: ['ريفي', 'جزر'] },
        ],
        globalCapacityGW: 2100, saudiTargetGW: 16,
        costUSDkWh: 0.03, co2gPerKWh: 7, capacityFactor: '25–45%',
        vision2030: { target: 'إنشاء 2.7 جيجاواط من طاقة الرياح بحلول 2030', statusAr: 'قيد التنفيذ' },
        keywords: ['wind', 'turbine', 'رياح', 'توربين', 'مزرعة رياح', 'ريح', 'offshore'],
    },

    // ── الطاقة المائية ──────────────────────────────────────────────────────
    hydro: {
        id: 'hydro', nameAr: 'الطاقة المائية', nameEn: 'Hydropower',
        icon: '💧', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ — الأنبياء ٣٠',
        subtypes: [
            { id: 'hydro_large',  nameAr: 'سدود كبيرة',       nameEn: 'Large Hydro',        capacity: '> 100 ميغاواط', examples: ['السد العالي', 'ثلاثة أخانق', 'سد إيتيبو'] },
            { id: 'hydro_small',  nameAr: 'سدود صغيرة',        nameEn: 'Small Hydro (SHP)',  capacity: '< 10 ميغاواط',  examples: ['القنوات المائية', 'الأنهار الصغيرة'] },
            { id: 'hydro_pumped', nameAr: 'تخزين ضخ المياه',   nameEn: 'Pumped Storage',    capacity: 'تخزين واسع',    examples: ['مشروع PHES', 'بطارية الشبكة'] },
            { id: 'tidal',        nameAr: 'طاقة المد والجزر',   nameEn: 'Tidal Energy',       scale: 'ناشئة',            examples: ['La Rance', 'Swansea Bay'] },
            { id: 'wave',         nameAr: 'طاقة الأمواج',       nameEn: 'Wave Energy',        scale: 'تجريبي',           examples: ['OWC', 'Pelamis'] },
        ],
        globalCapacityGW: 1400,
        costUSDkWh: 0.02, co2gPerKWh: 4, capacityFactor: '35–60%',
        keywords: ['hydro', 'water', 'dam', 'مائية', 'ماء', 'سد', 'نهر', 'pumped', 'tidal'],
    },

    // ── الطاقة النووية ──────────────────────────────────────────────────────
    nuclear: {
        id: 'nuclear', nameAr: 'الطاقة النووية', nameEn: 'Nuclear Power',
        icon: '⚛️', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ ﴾ — الذاريات ٢٠',
        shariaNote: 'مباح مع ضمان عدم الإضرار وفق مبدأ «لا ضرر ولا ضرار»',
        subtypes: [
            { id: 'nuclear_pwr',  nameAr: 'مفاعل ضغط الماء',       nameEn: 'PWR — Pressurized Water Reactor', examples: ['براكة الإمارات', 'فرنسا'] },
            { id: 'nuclear_bwr',  nameAr: 'مفاعل غلي الماء',         nameEn: 'BWR — Boiling Water Reactor',    examples: ['اليابان', 'USA'] },
            { id: 'nuclear_smr',  nameAr: 'مفاعل صغير معياري',        nameEn: 'SMR — Small Modular Reactor',    examples: ['NuScale', 'Rolls-Royce SMR', 'المشروع السعودي'] },
            { id: 'nuclear_gen4', nameAr: 'مفاعل الجيل الرابع',        nameEn: 'Gen IV Reactor',                 examples: ['MSR', 'HTGR', 'SFR'] },
            { id: 'nuclear_fusion',nameAr: 'الاندماج النووي',           nameEn: 'Fusion (Future)',                examples: ['ITER', 'NIF', 'Commonwealth Fusion'] },
        ],
        globalCapacityGW: 415, saudiTarget: '16 مفاعلاً مقترحاً',
        costUSDkWh: 0.10, co2gPerKWh: 12, capacityFactor: '80–95%',
        keywords: ['nuclear', 'atom', 'reactor', 'نووية', 'مفاعل', 'ذرة', 'uranium', 'براكة', 'smr'],
    },

    // ── الهيدروجين ──────────────────────────────────────────────────────────
    hydrogen: {
        id: 'hydrogen', nameAr: 'الهيدروجين', nameEn: 'Hydrogen Energy',
        icon: '🔋', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ — الأنبياء ٣٠',
        subtypes: [
            { id: 'h2_green',    nameAr: 'هيدروجين أخضر',   nameEn: 'Green Hydrogen (Electrolysis)',  from: 'طاقة متجددة',   examples: ['نيوم', 'NEOM H2', 'Hype H2'] },
            { id: 'h2_blue',     nameAr: 'هيدروجين أزرق',    nameEn: 'Blue Hydrogen (CCUS)',           from: 'غاز طبيعي+CCS', examples: ['أرامكو H2', 'Air Products'] },
            { id: 'h2_fuel_cell',nameAr: 'خلايا الوقود',     nameEn: 'Fuel Cell (PEMFC, SOFC)',       uses: 'نقل، صناعة',    examples: ['Toyota Mirai', 'سيارات H2', 'قطارات H2'] },
            { id: 'h2_pipeline', nameAr: 'أنابيب الهيدروجين', nameEn: 'Hydrogen Pipeline',             scale: 'ناشئة',        examples: ['خط H2 نيوم-أوروبا', 'EU H2 Backbone'] },
        ],
        globalProductionMtpa: 90, neomH2TargetMtpa: 1.2,
        costUSDkgH2: 2.5, co2gPerKWh: 0, capacityFactor: '70–90%',
        vision2030: { target: 'أكبر منتج ومصدّر للهيدروجين الأخضر عالمياً', statusAr: 'قيد التطوير' },
        keywords: ['hydrogen', 'h2', 'fuel cell', 'هيدروجين', 'خلايا وقود', 'electrolyzer', 'neom', 'نيوم'],
    },

    // ── الطاقة الجوفية ──────────────────────────────────────────────────────
    geothermal: {
        id: 'geothermal', nameAr: 'الطاقة الجوفية', nameEn: 'Geothermal Energy',
        icon: '🌋', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ ﴾ — الرعد ٤',
        subtypes: [
            { id: 'geo_flash',  nameAr: 'محطة تبخير مباشر',  nameEn: 'Flash Steam Plant',       temp: '> 180°C', examples: ['آيسلندا', 'الفلبين', 'إندونيسيا'] },
            { id: 'geo_binary', nameAr: 'محطة ثنائية',        nameEn: 'Binary Cycle Plant',      temp: '100–180°C', examples: ['كينيا', 'California', 'نيوزيلندا'] },
            { id: 'geo_direct', nameAr: 'استخدام مباشر',      nameEn: 'Direct Use (Heating)',    temp: '< 100°C', examples: ['تدفئة المنازل', 'البيوت الزجاجية', 'spa'] },
            { id: 'geo_egs',    nameAr: 'أنظمة جوفية معززة', nameEn: 'Enhanced Geothermal (EGS)', scale: 'ناشئة', examples: ['Ormat EGS', 'Quaise Energy'] },
        ],
        globalCapacityGW: 16,
        costUSDkWh: 0.04, co2gPerKWh: 15, capacityFactor: '70–95%',
        keywords: ['geothermal', 'جوفية', 'حرارية', 'volcano', 'تربة', 'thermal', 'steam'],
    },

    // ── الغاز الطبيعي ──────────────────────────────────────────────────────
    natural_gas: {
        id: 'natural_gas', nameAr: 'الغاز الطبيعي', nameEn: 'Natural Gas',
        icon: '🔥', maqsad: 'MAL', halal: true, sustainable: false, carbonFree: false,
        quranRef: '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾ — الحديد ٢٥',
        subtypes: [
            { id: 'gas_ccgt', nameAr: 'محطة دورة مركبة',    nameEn: 'CCGT — Combined Cycle Gas Turbine', efficiency: '55–65%', examples: ['معظم محطات السعودية الجديدة'] },
            { id: 'gas_peaker',nameAr: 'محطة الذروة',        nameEn: 'Gas Peaker Plant',                  efficiency: '35–45%', examples: ['الطلب الذروة', 'احتياطي الشبكة'] },
            { id: 'lng',       nameAr: 'الغاز الطبيعي المسال', nameEn: 'LNG — Liquefied Natural Gas',      scale: 'عالمي',       examples: ['قطر LNG', 'أرامكو LNG', 'Sabic'] },
            { id: 'cng',       nameAr: 'غاز طبيعي مضغوط',   nameEn: 'CNG — Compressed Natural Gas',      uses: 'نقل، مصانع',   examples: ['حافلات CNG', 'سيارات CNG'] },
        ],
        globalCapacityGW: 1900, saudiGenerationShare: '~65%',
        costUSDkWh: 0.06, co2gPerKWh: 490, capacityFactor: '40–60%',
        keywords: ['gas', 'lng', 'cng', 'ccgt', 'غاز', 'طبيعي', 'methane', 'ميثان', 'محطة'],
    },

    // ── النفط / المازوت ─────────────────────────────────────────────────────
    oil: {
        id: 'oil', nameAr: 'النفط والمشتقات', nameEn: 'Oil & Petroleum',
        icon: '🛢️', maqsad: 'MAL', halal: true, sustainable: false, carbonFree: false,
        quranRef: '﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾ — هود ٦١',
        subtypes: [
            { id: 'oil_power', nameAr: 'محطات المازوت',   nameEn: 'Oil-fired Power Plant',  efficiency: '30–40%', examples: ['محطات السعودية القديمة'] },
            { id: 'oil_diesel',nameAr: 'ديزل موزع',        nameEn: 'Diesel Generator',       uses: 'طوارئ، نائي',  examples: ['مولدات احتياطية', 'مناطق عزلة'] },
        ],
        saudiGenerationShare: '~35% (يتناقص)',
        costUSDkWh: 0.10, co2gPerKWh: 650,
        keywords: ['oil', 'diesel', 'petroleum', 'نفط', 'مازوت', 'ديزل', 'مشتقات'],
    },

    // ── الطاقة الكهرومائية للتخزين ─────────────────────────────────────────
    storage: {
        id: 'storage', nameAr: 'تخزين الطاقة', nameEn: 'Energy Storage',
        icon: '🔋', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: true,
        quranRef: '﴿ وَادَّخَرُوا لِأَنفُسِكُمْ ﴾ — إشارة إلى الاستعداد والتخزين',
        subtypes: [
            { id: 'bess_li',   nameAr: 'بطاريات ليثيوم',       nameEn: 'Li-ion BESS',         energy: 'MWh–GWh',        examples: ['Tesla Megapack', 'CATL', 'مشاريع SA-BESS'] },
            { id: 'bess_flow', nameAr: 'بطاريات التدفق',         nameEn: 'Flow Battery (VRFB)', energy: 'MWh–GWh',        examples: ['Vanadium Redox', 'Iron-Air', 'Zinc-Bromine'] },
            { id: 'pumped_h',  nameAr: 'تخزين ضخ المياه',        nameEn: 'Pumped Hydro Storage', energy: 'TWh',            examples: ['Bath County USA', 'Dinorwig', 'PHES السعودي'] },
            { id: 'compressed_air', nameAr: 'هواء مضغوط', nameEn: 'CAES — Compressed Air', energy: 'GWh',           examples: ['Huntorf', 'McIntosh'] },
            { id: 'flywheel',  nameAr: 'دوّار الطاقة',            nameEn: 'Flywheel Storage',    energy: 'kWh–MWh',        examples: ['Beacon Power', 'Amber Kinetics'] },
            { id: 'thermal_storage', nameAr: 'تخزين حراري',      nameEn: 'Thermal Energy Storage', energy: 'GWh',          examples: ['ملح منصهر CSP', 'Ice Storage'] },
        ],
        keywords: ['battery', 'storage', 'bess', 'بطارية', 'تخزين', 'pumped', 'flywheel', 'محطة تخزين'],
    },

    // ── الشبكة الكهربائية الذكية ──────────────────────────────────────────
    smart_grid: {
        id: 'smart_grid', nameAr: 'الشبكة الكهربائية الذكية', nameEn: 'Smart Grid',
        icon: '⚡', maqsad: 'ARD', halal: true, sustainable: true, carbonFree: false,
        quranRef: '﴿ إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ ﴾ — النحل ٩٠',
        subtypes: [
            { id: 'ami',       nameAr: 'عداد ذكي',               nameEn: 'Advanced Metering Infrastructure (AMI)', examples: ['عداد KSA ذكي', 'Itron'] },
            { id: 'scada',     nameAr: 'نظام التحكم الإشرافي',    nameEn: 'SCADA / EMS / DMS',                     examples: ['Saudi SEC SCADA', 'GE GRID'] },
            { id: 'demand_response', nameAr: 'استجابة الطلب',    nameEn: 'Demand Response (DR)',                   examples: ['تخفيض ذروة الصيف', 'سعر الوقت'] },
            { id: 'microgrid', nameAr: 'شبكة ميكرو',              nameEn: 'Microgrid',                             examples: ['مجمع سكني', 'نيوم', 'جزيرة طاقة'] },
            { id: 'v2g',       nameAr: 'المركبة إلى الشبكة',       nameEn: 'Vehicle-to-Grid (V2G)',                  examples: ['EV السعودية', 'Tesla V2G', 'Nissan Leaf'] },
            { id: 'p2p_energy',nameAr: 'تداول الطاقة بين الأقران', nameEn: 'Peer-to-Peer Energy Trading',            examples: ['بلوكشين طاقة', 'شيخة P2P Energy'] },
        ],
        keywords: ['smart grid', 'ami', 'scada', 'ذكية', 'عداد', 'microgrid', 'v2g', 'demand', 'شبكة'],
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. مؤشرات الطاقة السعودية — رؤية 2030
// ═══════════════════════════════════════════════════════════════════════════════

const SAUDI_VISION2030_ENERGY = {
    name:    'رؤية المملكة العربية السعودية 2030 — قطاع الطاقة',
    nameEn:  'Saudi Vision 2030 — Energy Sector',
    baseYear: 2016,
    targetYear: 2030,

    targets: {
        renewableShare:    { value: 50, unit: '%',  label: 'حصة الطاقة المتجددة في مزيج الكهرباء' },
        solarCapacityGW:   { value: 58.7, unit: 'جيجاواط',  label: 'الطاقة الشمسية المركّبة' },
        windCapacityGW:    { value: 16,   unit: 'جيجاواط',  label: 'طاقة الرياح' },
        nuclearCapacityGW: { value: 17.6, unit: 'جيجاواط',  label: 'الطاقة النووية' },
        co2ReductionMtpa:  { value: 278,  unit: 'مليون طن/سنة', label: 'تخفيض انبعاثات CO₂' },
        greenH2TargetMtpa: { value: 1.2,  unit: 'مليون طن/سنة', label: 'إنتاج الهيدروجين الأخضر (NEOM)' },
        energyEfficiency:  { value: 20,   unit: '%',  label: 'تحسين كفاءة الطاقة' },
        electrificationTarget: { value: 100, unit: '%', label: 'الربط بالشبكة الكهربائية الوطنية' },
    },

    keyProjects: [
        { name: 'NEOM Smart Grid',         type: 'smart_grid', capacityGW: 4,    location: 'تبوك', year: 2030 },
        { name: 'Sudair Solar Farm',        type: 'solar',      capacityGW: 1.5,  location: 'الرياض', year: 2024 },
        { name: 'Al Shuaibah Solar',        type: 'solar',      capacityGW: 2.6,  location: 'جدة', year: 2025 },
        { name: 'Dumat Al Jandal Wind',     type: 'wind',       capacityGW: 0.4,  location: 'الجوف', year: 2023 },
        { name: 'Yanbu Nuclear (proposed)', type: 'nuclear',    capacityGW: 2.8,  location: 'ينبع', year: 2030 },
        { name: 'NEOM Green H2',            type: 'hydrogen',   capacityMtpa: 1.2, location: 'نيوم', year: 2030 },
        { name: 'SEC Smart Meters',         type: 'smart_grid', coverage: '100%', year: 2030 },
    ],

    agencies: [
        { name: 'وزارة الطاقة السعودية',    nameEn: 'Ministry of Energy', role: 'رسم السياسات' },
        { name: 'أرامكو السعودية',           nameEn: 'Saudi Aramco', role: 'إنتاج النفط والغاز والهيدروجين' },
        { name: 'شركة الكهرباء السعودية',    nameEn: 'Saudi Electricity Company (SEC)', role: 'نقل وتوزيع الكهرباء' },
        { name: 'أكوا باور',                 nameEn: 'ACWA Power', role: 'مشاريع طاقة متجددة' },
        { name: 'الهيئة السعودية للفضاء',    nameEn: 'Saudi Space Commission', role: 'مراقبة الطاقة بالأقمار' },
        { name: 'الهيئة النووية السعودية',   nameEn: 'Saudi Nuclear Authority (KACARE)', role: 'الطاقة النووية' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. سوق تداول الطاقة الحلال
// ═══════════════════════════════════════════════════════════════════════════════

const ENERGY_MARKET = {
    name:   'سوق شيخة لتداول الطاقة الحلال',
    nameEn: 'Sheikha Halal Energy Market',

    instruments: [
        { id: 'rec',        nameAr: 'شهادات الطاقة المتجددة', nameEn: 'Renewable Energy Certificates (RECs)', halal: true, shariaModel: 'بيع عادي' },
        { id: 'i_rec',      nameAr: 'REC دولية',               nameEn: 'International RECs (I-RECs)',          halal: true, shariaModel: 'بيع عادي' },
        { id: 'ppa',        nameAr: 'عقد شراء الطاقة',          nameEn: 'Power Purchase Agreement (PPA)',       halal: true, shariaModel: 'بيع سَلَم' },
        { id: 'sukuk_green',nameAr: 'صكوك خضراء',               nameEn: 'Green Sukuk',                         halal: true, shariaModel: 'صكوك مشاركة/إجارة' },
        { id: 'carbon',     nameAr: 'أرصدة الكربون',             nameEn: 'Carbon Credits (VCU/CER)',            halal: true, shariaModel: 'يُستشار الفقيه بشرط الضرورة' },
        { id: 'spot',       nameAr: 'تداول فوري',                nameEn: 'Energy Spot Market',                  halal: true, shariaModel: 'بيع عادي' },
        { id: 'p2p',        nameAr: 'تداول نظير لنظير',          nameEn: 'P2P Energy Trading (Blockchain)',     halal: true, shariaModel: 'بيع مباشر — بلوكشين' },
    ],

    haraamInstruments: [
        { id: 'futures_spec', nameAr: 'عقود مستقبلية مضاربية', nameEn: 'Speculative Energy Futures', reason: 'غرر وقمار — محرم' },
        { id: 'options',      nameAr: 'خيارات مضاربية',          nameEn: 'Speculative Options',        reason: 'غرر — محرم' },
        { id: 'riba_loan',    nameAr: 'قروض ربوية',              nameEn: 'Interest-bearing Energy Loans', reason: 'ربا — محرم' },
    ],

    pricing: {
        model: 'سعر لحظي + صيغ شرعية',
        units: ['ريال/كيلوواط·ساعة', 'دولار/MWh', 'دولار/kg H2'],
        zakat: 'زكاة أرباح الطاقة تُحسب على صافي الأرباح بنسبة 2.5%',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. معادلات الطاقة والفيزياء الكهربائية
// ═══════════════════════════════════════════════════════════════════════════════

const ENERGY_PHYSICS = {
    // قانون أوم: V = I × R
    ohm: (V, I, R) => {
        if (V !== null) return { V, I: I || V / R, R: R || V / I };
        return { V: I * R, I, R };
    },

    // الطاقة: E = P × t (كيلوواط·ساعة)
    energy: (powerKW, timeH) => ({ energyKWh: powerKW * timeH, powerKW, timeH }),

    // كفاءة: η = (Pout / Pin) × 100%
    efficiency: (powerOut, powerIn) => Math.round((powerOut / powerIn) * 10000) / 100,

    // قدرة الرياح: P = ½ × ρ × A × v³ × Cp
    windPower: (rho = 1.225, areaM2, windSpeedMs, Cp = 0.45) => {
        const P = 0.5 * rho * areaM2 * Math.pow(windSpeedMs, 3) * Cp;
        return { powerW: Math.round(P), powerKW: Math.round(P / 1000) };
    },

    // قدرة الخلية الشمسية: P = G × A × η_panel
    solarPower: (irradianceWm2 = 1000, areaM2 = 1, panelEfficiency = 0.20) => {
        const P = irradianceWm2 * areaM2 * panelEfficiency;
        return { powerW: Math.round(P), powerKW: Math.round(P / 1000 * 100) / 100 };
    },

    // عامل الطاقة: PF = cos(φ)
    powerFactor: (activePowerW, apparentPowerVA) => Math.round((activePowerW / apparentPowerVA) * 1000) / 1000,

    // الاستهلاك السنوي: Annual Energy = P(kW) × CF × 8760
    annualEnergy: (capacityKW, capacityFactor = 0.25) => ({
        annualKWh: Math.round(capacityKW * capacityFactor * 8760),
        capacityFactor: `${Math.round(capacityFactor * 100)}%`,
    }),

    // انبعاثات CO₂: tons_CO2 = kWh × emission_factor
    co2Emissions: (kWh, emissionFactorGramsPerKWh) => ({
        gramsTotal: kWh * emissionFactorGramsPerKWh,
        kgTotal: Math.round(kWh * emissionFactorGramsPerKWh / 100) / 10,
        tonsTotal: Math.round(kWh * emissionFactorGramsPerKWh / 100000 * 100) / 100,
    }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. كلمات مفتاحية لتصنيف الطاقة
// ═══════════════════════════════════════════════════════════════════════════════

const ENERGY_KEYWORDS = {};
for (const [id, src] of Object.entries(ENERGY_SOURCES)) {
    ENERGY_KEYWORDS[id] = src.keywords || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. الشبكة العصبية المخصصة للطاقة
//    Energy Neural Network — طبقات:
//    مدخلات (13 سمة) → 32 عصبون → 16 عصبون → 8 أنواع طاقة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * سمات مدخلات شبكة الطاقة العصبية:
 * [0] توفر الشمس (0–1) — Solar Irradiance Normalized
 * [1] سرعة الرياح (0–1) — Wind Speed Normalized (0–15 m/s)
 * [2] توفر المياه (0–1) — Water Availability
 * [3] القدرة المركّبة (0–1) — Installed Capacity Normalized
 * [4] تكلفة الكيلوواط·ساعة (0–1) — Cost Normalized
 * [5] انبعاثات CO₂ (0–1) — Emissions (0=صفر، 1=عالية)
 * [6] الاستدامة (0–1) — Sustainability Score
 * [7] الاستمرارية (0–1) — Dispatchability (يمكن التحكم به)
 * [8] وقت التشييد (0–1) — Construction Time Normalized
 * [9] الموثوقية (0–1) — Reliability / Capacity Factor
 * [10] التخزين المدمج (0/1) — Has Storage
 * [11] التوافق مع الشبكة (0–1) — Grid Compatibility
 * [12] عامل الحلال (0–1) — Halal Compliance Score
 */
const ENERGY_INPUT_DIM = 13;
const ENERGY_OUTPUT_DIM = Object.keys(ENERGY_SOURCES).length; // 9

/**
 * بيانات تدريبية مثالية (خصائص → نوع الطاقة)
 * كل صف: [sun, wind, water, cap, cost, co2, sustainable, dispatch, time, reliability, storage, grid, halal]
 */
const TRAINING_DATA = {
    inputs: [
        // شمسية        sun   wind  water cap   cost  co2   sust  disp  time  reli  stor  grid  halal
        /*solar*/      [0.95, 0.10, 0.05, 0.70, 0.15, 0.05, 0.95, 0.50, 0.30, 0.25, 0.40, 0.80, 1.00],
        /*wind*/       [0.10, 0.90, 0.10, 0.80, 0.20, 0.03, 0.95, 0.40, 0.40, 0.35, 0.30, 0.75, 1.00],
        /*hydro*/      [0.05, 0.10, 0.95, 0.90, 0.10, 0.02, 0.85, 0.95, 0.70, 0.55, 0.90, 0.90, 1.00],
        /*nuclear*/    [0.01, 0.01, 0.60, 0.95, 0.60, 0.06, 0.70, 0.99, 0.90, 0.90, 0.50, 0.95, 1.00],
        /*hydrogen*/   [0.50, 0.50, 0.30, 0.40, 0.50, 0.01, 0.90, 0.90, 0.50, 0.80, 0.95, 0.70, 1.00],
        /*geothermal*/ [0.05, 0.05, 0.20, 0.30, 0.25, 0.08, 0.85, 0.98, 0.60, 0.85, 0.60, 0.80, 1.00],
        /*natural_gas*/[0.05, 0.05, 0.05, 0.90, 0.40, 0.80, 0.20, 0.99, 0.40, 0.85, 0.10, 0.95, 1.00],
        /*oil*/        [0.05, 0.05, 0.05, 0.70, 0.55, 0.95, 0.10, 0.99, 0.30, 0.80, 0.05, 0.90, 1.00],
        /*storage*/    [0.20, 0.20, 0.10, 0.60, 0.45, 0.02, 0.90, 0.99, 0.20, 0.99, 1.00, 0.95, 1.00],
    ],
    // One-hot labels لأنواع الطاقة التسعة (solar, wind, hydro, nuclear, hydrogen, geothermal, natural_gas, oil, storage)
    labels: [
        [1,0,0,0,0,0,0,0,0], // solar
        [0,1,0,0,0,0,0,0,0], // wind
        [0,0,1,0,0,0,0,0,0], // hydro
        [0,0,0,1,0,0,0,0,0], // nuclear
        [0,0,0,0,1,0,0,0,0], // hydrogen
        [0,0,0,0,0,1,0,0,0], // geothermal
        [0,0,0,0,0,0,1,0,0], // natural_gas
        [0,0,0,0,0,0,0,1,0], // oil
        [0,0,0,0,0,0,0,0,1], // storage
    ],
    sourceIds: ['solar','wind','hydro','nuclear','hydrogen','geothermal','natural_gas','oil','storage'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. المحرك الرئيسي — SheikhaEnergyNeuralNetwork
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaEnergyNeuralNetwork {

    constructor() {
        this.name      = 'SheikhaEnergyNeuralNetwork';
        this.nameAr    = 'شبكة شيخة العصبية للطاقة';
        this.version   = '1.0.0';
        this.startedAt = new Date().toISOString();
        this.tawheed   = 'لَا إِلَٰهَ إِلَّا اللَّهُ — الله نور السماوات والأرض';
        this.schema    = 'sheikha/energy/v1';
        this.trained   = false;

        // تهيئة الشبكة العصبية الحقيقية
        this._initNeuralNetwork();
    }

    // ─── تهيئة الشبكة العصبية ────────────────────────────────────────────────

    _initNeuralNetwork() {
        if (!NeuralNetwork) {
            this.nn = null;
            return;
        }
        try {
            // بنية: 13 → Dense(32, relu) → Dense(16, relu) → Dense(9, softmax)
            this.nn = new NeuralNetwork({
                learningRate: 0.01,
                epochs: 200,
                l2Lambda: 0.0001,
            });
            this.nn.addLayer(ENERGY_INPUT_DIM, 32, 'relu');
            this.nn.addLayer(32, 16, 'relu');
            this.nn.addLayer(16, ENERGY_OUTPUT_DIM, 'softmax');

            // تدريب سريع على البيانات المثالية
            this._trainOnSeedData();
        } catch (err) {
            this.nn = null;
            console.warn('[ENERGY-NEURAL] ⚠️ تعذّر تهيئة الشبكة العصبية:', err.message);
        }
    }

    _trainOnSeedData() {
        if (!this.nn || !Matrix) return;
        const { inputs, labels } = TRAINING_DATA;
        // 200 دورة تدريب سريعة على البيانات التأسيسية
        const EPOCHS = 200;
        for (let e = 0; e < EPOCHS; e++) {
            for (let i = 0; i < inputs.length; i++) {
                this.nn.trainBatch([inputs[i]], [labels[i]], 'crossEntropy');
            }
        }
        this.trained = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الواجهة الرئيسية — handle(req)
    // ═══════════════════════════════════════════════════════════════════════════

    async handle(req) {
        const { intent = '', data = {} } = req || {};
        const normalized = String(intent).toLowerCase().trim();

        // توجيه حسب النية
        if (normalized === 'energy.classify' || data.text || data.query) {
            return this.classifyEnergySource(data.text || data.query || '');
        }
        if (normalized === 'energy.predict' || normalized === 'energy.forecast') {
            return this.forecastDemand(data);
        }
        if (normalized === 'energy.optimize') {
            return this.optimizeGrid(data);
        }
        if (normalized === 'energy.score' || normalized === 'energy.evaluate') {
            return this.scoreEnergyProject(data);
        }
        if (normalized === 'energy.trade' || normalized === 'energy.market') {
            return this.getEnergyMarketInfo(data);
        }
        if (normalized === 'energy.vision2030') {
            return this.getVision2030Status();
        }
        if (normalized === 'energy.sharia') {
            return this.checkShariaCompliance(data);
        }
        if (normalized === 'energy.physics' || normalized === 'energy.calc') {
            return this.calculate(data);
        }
        if (normalized === 'energy.list' || normalized === 'energy') {
            return this.listEnergySources(data.type || null);
        }
        if (normalized === 'energy.status' || normalized === 'energy.info') {
            return this.status();
        }

        // افتراضي
        return this.status();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // تصنيف مصدر الطاقة — classifyEnergySource
    // ═══════════════════════════════════════════════════════════════════════════

    classifyEnergySource(text) {
        if (!text) return { error: 'يرجى تقديم وصف لمصدر الطاقة', hint: 'مثال: "ألواح شمسية فوتوفولطية" أو "توربينات رياح بحرية"' };

        const normalizedText = String(text).toLowerCase();
        const scores = {};

        // تصنيف بالكلمات المفتاحية
        for (const [sourceId, keywords] of Object.entries(ENERGY_KEYWORDS)) {
            scores[sourceId] = 0;
            for (const kw of keywords) {
                if (normalizedText.includes(kw.toLowerCase())) scores[sourceId]++;
            }
        }

        // تعزيز بالشبكة العصبية إذا توفّرت
        let neuralPrediction = null;
        if (this.nn && this.trained) {
            try {
                // استخراج ميزات بسيطة من النص
                const features = this._extractTextFeatures(normalizedText);
                const output = this.nn.predict([features]);
                const probs  = Array.from(output.data);
                const maxIdx = probs.indexOf(Math.max(...probs));
                neuralPrediction = {
                    sourceId:   TRAINING_DATA.sourceIds[maxIdx],
                    confidence: Math.round(probs[maxIdx] * 100),
                    distribution: TRAINING_DATA.sourceIds.map((id, i) => ({
                        sourceId: id,
                        nameAr:   ENERGY_SOURCES[id]?.nameAr || id,
                        prob:     Math.round(probs[i] * 100),
                    })).sort((a, b) => b.prob - a.prob),
                };
                // دمج مع الكلمات المفتاحية
                const probs_map = {};
                TRAINING_DATA.sourceIds.forEach((id, i) => { probs_map[id] = probs[i]; });
                for (const [id] of Object.entries(scores)) {
                    scores[id] = (scores[id] * 0.6) + ((probs_map[id] || 0) * 10 * 0.4);
                }
            } catch (_) { /* تراجع إلى الكلمات المفتاحية */ }
        }

        // ترتيب النتائج
        const sorted = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .filter(([, s]) => s > 0);

        if (sorted.length === 0) {
            return {
                classified: false,
                message: 'لم يُتعرَّف على مصدر الطاقة — حاول وصفاً أدق',
                hint: 'أمثلة: شمسي، رياح، نووي، هيدروجين، غاز، جوفي، مائي',
                tawheed: this.tawheed,
            };
        }

        const topId     = sorted[0][0];
        const topSource = ENERGY_SOURCES[topId];

        return {
            classified: true,
            schema: this.schema,
            input: text,
            source: {
                id:      topId,
                nameAr:  topSource.nameAr,
                nameEn:  topSource.nameEn,
                icon:    topSource.icon,
                halal:   topSource.halal,
                sustainable: topSource.sustainable,
                carbonFree:  topSource.carbonFree,
                quranRef: topSource.quranRef,
                costUSDkWh: topSource.costUSDkWh,
                co2gPerKWh: topSource.co2gPerKWh,
                capacityFactor: topSource.capacityFactor,
            },
            bestSubtype: topSource.subtypes?.[0] || null,
            topScores: sorted.slice(0, 5).map(([id, score]) => ({
                sourceId: id,
                nameAr:   ENERGY_SOURCES[id]?.nameAr || id,
                icon:     ENERGY_SOURCES[id]?.icon || '⚡',
                score:    Math.round(score * 100) / 100,
            })),
            neuralEnhanced:  !!neuralPrediction,
            neuralPrediction,
            shariaStatus: topSource.halal ? 'حلال — مباح شرعاً' : 'يستوجب مراجعة شرعية',
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // توقع الطلب على الطاقة — forecastDemand
    // ═══════════════════════════════════════════════════════════════════════════

    forecastDemand(data = {}) {
        const {
            currentDemandMW = 5000,
            temperatureC    = 35,
            hour            = new Date().getHours(),
            month           = new Date().getMonth() + 1,
            dayType         = 'weekday', // weekday | friday | holiday
            populationM     = 35,
        } = data;

        // نموذج تقريبي لتوقع الطلب يعتمد على:
        // - درجة الحرارة (الصيف السعودي يرفع الطلب بشكل كبير)
        // - ساعة اليوم (الذروة 14:00–17:00 صيفاً)
        // - نوع اليوم

        const tempFactor     = 1 + Math.max(0, (temperatureC - 25) * 0.012); // +1.2% لكل درجة فوق 25°
        const hourFactors    = [0.65,0.60,0.58,0.57,0.58,0.62,0.70,0.80,0.90,0.95,0.98,1.00,1.02,1.05,1.10,1.08,1.05,1.00,0.97,0.95,0.92,0.88,0.80,0.70];
        const monthFactors   = [0.85,0.80,0.85,0.90,0.95,1.05,1.15,1.20,1.10,0.95,0.85,0.80]; // يناير→ديسمبر
        const dayFactor      = dayType === 'friday' ? 0.88 : dayType === 'holiday' ? 0.80 : 1.00;

        const hourFactor  = hourFactors[hour] || 1.0;
        const monthFactor = monthFactors[month - 1] || 1.0;
        const predictedMW = Math.round(currentDemandMW * tempFactor * hourFactor * monthFactor * dayFactor);

        const peakHours   = month >= 6 && month <= 9 ? '13:00–17:00' : '08:00–13:00';
        const renewableNow = this._estimateRenewableContribution(hour, month);

        return {
            schema: this.schema,
            forecast: {
                currentDemandMW,
                predictedDemandMW: predictedMW,
                changePercent: Math.round(((predictedMW - currentDemandMW) / currentDemandMW) * 100),
            },
            factors: {
                temperature: { value: temperatureC, factor: Math.round(tempFactor * 100) / 100 },
                hour:        { value: hour, factor: hourFactor, peakHours },
                month:       { value: month, factor: monthFactor },
                dayType:     { value: dayType, factor: dayFactor },
            },
            renewableShare: {
                currentPercent: renewableNow,
                solarMW: Math.round(predictedMW * renewableNow / 100 * 0.6),
                windMW:  Math.round(predictedMW * renewableNow / 100 * 0.4),
            },
            recommendation: predictedMW > currentDemandMW * 1.1
                ? 'تحذير: طلب مرتفع — تفعيل استجابة الطلب واحتياطي الطاقة'
                : 'الطلب ضمن النطاق الطبيعي',
            vision2030Note: `المستهدف: ${SAUDI_VISION2030_ENERGY.targets.renewableShare.value}% طاقة متجددة بحلول 2030`,
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // تحسين الشبكة الكهربائية — optimizeGrid
    // ═══════════════════════════════════════════════════════════════════════════

    optimizeGrid(data = {}) {
        const {
            totalDemandMW    = 10000,
            solarAvailableMW = 3000,
            windAvailableMW  = 800,
            gasCapacityMW    = 8000,
            nuclearMW        = 0,
            storageMWh       = 2000,
            storageSOC       = 0.5,
            exportMW         = 0,
        } = data;

        // خوارزمية إيفاء الطلب بأولوية التكلفة والبيئة
        // الأولوية: متجددة → نووي → هيدروجين → غاز → نفط
        let remainingDemand = totalDemandMW + exportMW;
        const dispatch = {};
        let co2TonsHour = 0;
        let costUSDHour = 0;

        // 1. الطاقة الشمسية (مجانية وخضراء)
        const solarDispatch = Math.min(solarAvailableMW, remainingDemand);
        dispatch.solar = Math.round(solarDispatch);
        remainingDemand -= solarDispatch;
        costUSDHour += solarDispatch * 0.025;

        // 2. طاقة الرياح
        const windDispatch = Math.min(windAvailableMW, remainingDemand);
        dispatch.wind = Math.round(windDispatch);
        remainingDemand -= windDispatch;
        costUSDHour += windDispatch * 0.03;

        // 3. نووي (إذا متوفر)
        if (nuclearMW > 0) {
            const nuclearDispatch = Math.min(nuclearMW, remainingDemand);
            dispatch.nuclear = Math.round(nuclearDispatch);
            remainingDemand -= nuclearDispatch;
            costUSDHour += nuclearDispatch * 0.10;
            co2TonsHour  += nuclearDispatch * 12 / 1e6; // 12 g/kWh
        }

        // 4. تفريغ البطاريات (إذا الشبكة في ضغط)
        const storageAvailableMW = Math.round(storageMWh * storageSOC / 4); // 4 ساعات تفريغ
        const storageDispatch = Math.min(storageAvailableMW, remainingDemand);
        dispatch.storage = Math.round(storageDispatch);
        remainingDemand -= storageDispatch;
        costUSDHour += storageDispatch * 0.05;

        // 5. الغاز الطبيعي (خيار احتياطي)
        const gasDispatch = Math.min(gasCapacityMW, remainingDemand);
        dispatch.natural_gas = Math.round(gasDispatch);
        remainingDemand -= gasDispatch;
        costUSDHour += gasDispatch * 0.06;
        co2TonsHour  += gasDispatch * 490 / 1e6;

        // 6. فائض غير مُلبَّى
        dispatch.unserved = Math.max(0, Math.round(remainingDemand));

        const renewablePercent = Math.round(((dispatch.solar || 0) + (dispatch.wind || 0)) / totalDemandMW * 100);

        return {
            schema: this.schema,
            optimization: {
                totalDemandMW,
                dispatchMW:       dispatch,
                unservedMW:       dispatch.unserved,
                renewablePercent,
                co2TonsPerHour:   Math.round(co2TonsHour * 100) / 100,
                costUSDPerHour:   Math.round(costUSDHour),
                vision2030Gap:    Math.max(0, SAUDI_VISION2030_ENERGY.targets.renewableShare.value - renewablePercent),
            },
            recommendation: dispatch.unserved > 0
                ? `⚠️ طاقة غير مُلبَّى: ${dispatch.unserved} ميغاواط — يلزم تفعيل احتياطي طارئ أو تخفيض الطلب`
                : `✅ الطلب مُلبَّى بالكامل — حصة متجددة: ${renewablePercent}%`,
            shariaNote: 'الأولوية للطاقة النظيفة حفاظاً على البيئة — "لا ضرر ولا ضرار"',
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // تقييم مشروع طاقة — scoreEnergyProject
    // ═══════════════════════════════════════════════════════════════════════════

    scoreEnergyProject(data = {}) {
        const {
            type         = 'solar',
            capacityMW   = 100,
            costMUSD     = 100,
            locationAr   = 'غير محدد',
            financing    = 'equity',   // equity | sukuk | loan
            co2Reduction = null,
            employmentLocal = 0.5,
            waterUsage   = 0,
        } = data;

        const source = ENERGY_SOURCES[type] || ENERGY_SOURCES.solar;

        // معايير التقييم — كل معيار من 10
        const criteria = {
            financial:   this._scoreFinancial(capacityMW, costMUSD, source.costUSDkWh),
            environmental: source.carbonFree ? 10 : (source.co2gPerKWh < 200 ? 7 : 4),
            social:      Math.round(employmentLocal * 10),
            sharia:      this._scoreShariaProject(type, financing),
            technical:   source.halal ? 8 : 6,
            strategic:   source.sustainable ? 9 : 6,
        };

        const weights = { financial: 0.25, environmental: 0.25, social: 0.10, sharia: 0.20, technical: 0.10, strategic: 0.10 };
        const totalScore = Object.entries(criteria).reduce((sum, [k, v]) => sum + v * weights[k], 0);
        const roundedScore = Math.round(totalScore * 10) / 10;

        return {
            schema: this.schema,
            project: { type, capacityMW, costMUSD, locationAr, financing },
            source: { nameAr: source.nameAr, icon: source.icon, halal: source.halal },
            score: {
                total: roundedScore,
                grade: roundedScore >= 8 ? 'ممتاز ✅' : roundedScore >= 6 ? 'جيد 🟡' : 'يحتاج مراجعة 🔴',
                breakdown: criteria,
                weights,
            },
            financing: {
                model: financing,
                shariaCompliant: financing !== 'loan',
                recommendation: financing === 'loan' ? 'يُستبدل بصكوك إسلامية أو مشاركة' : 'النموذج المالي متوافق مع الشريعة',
            },
            shariaVerdict: source.halal
                ? `✅ المشروع حلال — ${source.quranRef || ''}`
                : `⚠️ يستوجب مراجعة فقهية — ${source.shariaNote || ''}`,
            vision2030Alignment: source.sustainable ? 'يتوافق مع أهداف رؤية 2030 للطاقة' : 'لا يتوافق مباشرة مع أهداف الرؤية',
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // سوق الطاقة الحلال — getEnergyMarketInfo
    // ═══════════════════════════════════════════════════════════════════════════

    getEnergyMarketInfo(data = {}) {
        const { instrument = null } = data;
        if (instrument) {
            const inst = ENERGY_MARKET.instruments.find(i => i.id === instrument);
            if (!inst) return { error: `أداة غير موجودة: ${instrument}`, available: ENERGY_MARKET.instruments.map(i => i.id) };
            return { schema: this.schema, instrument: inst, market: ENERGY_MARKET.pricing, tawheed: this.tawheed };
        }
        return {
            schema: this.schema,
            market: {
                name:          ENERGY_MARKET.name,
                nameEn:        ENERGY_MARKET.nameEn,
                instruments:   ENERGY_MARKET.instruments,
                haraam:        ENERGY_MARKET.haraamInstruments,
                pricing:       ENERGY_MARKET.pricing,
                zakat:         ENERGY_MARKET.pricing.zakat,
            },
            shariaNote: 'سوق شيخة للطاقة يلتزم بتحريم الربا والغرر والمضاربة المحرمة',
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // مؤشرات رؤية 2030 — getVision2030Status
    // ═══════════════════════════════════════════════════════════════════════════

    getVision2030Status() {
        return {
            schema: this.schema,
            vision: SAUDI_VISION2030_ENERGY,
            summary: {
                totalTargets: Object.keys(SAUDI_VISION2030_ENERGY.targets).length,
                keyProjects:  SAUDI_VISION2030_ENERGY.keyProjects.length,
                agencies:     SAUDI_VISION2030_ENERGY.agencies.length,
            },
            sharia: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: ٦٠ — الطاقة قوة للأمة',
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // فحص الامتثال الشرعي — checkShariaCompliance
    // ═══════════════════════════════════════════════════════════════════════════

    checkShariaCompliance(data = {}) {
        const { type = 'solar', financing = 'equity', hasRiba = false, hasGharar = false, hasMonopoly = false, waterWaste = false } = data;
        const source = ENERGY_SOURCES[type] || null;
        const violations = [];
        const compliances = [];

        if (hasRiba)        violations.push({ rule: 'تحريم الربا', ref: 'البقرة: ٢٧٥' });
        if (hasGharar)      violations.push({ rule: 'تحريم الغرر', ref: 'أحاديث النهي عن بيع الغرر' });
        if (hasMonopoly)    violations.push({ rule: 'تحريم الاحتكار', ref: '«لا يحتكر إلا خاطئ» — مسلم' });
        if (waterWaste)     violations.push({ rule: 'الإسراف في الماء محرم', ref: '«لا تسرف ولو كنت على نهر»' });
        if (financing === 'loan') violations.push({ rule: 'التمويل الربوي محرم', ref: 'البقرة: ٢٧٥' });

        if (!hasRiba)       compliances.push('خلو المعاملة من الربا ✅');
        if (!hasGharar)     compliances.push('خلو المعاملة من الغرر ✅');
        if (source?.halal)  compliances.push(`مصدر الطاقة ${source.nameAr} حلال ✅`);
        if (!waterWaste)    compliances.push('لا إسراف في الماء ✅');
        if (!hasMonopoly)   compliances.push('لا احتكار للطاقة ✅');

        return {
            schema: this.schema,
            compliant: violations.length === 0,
            violations,
            compliances,
            source: source ? { nameAr: source.nameAr, halal: source.halal } : null,
            principles: SHARIA_ENERGY_FOUNDATION.principles,
            verdict: violations.length === 0
                ? '✅ المعاملة متوافقة مع الشريعة الإسلامية'
                : `⛔ توجد ${violations.length} مخالفة شرعية — يجب الإصلاح قبل المضي`,
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الحسابات الفيزيائية — calculate
    // ═══════════════════════════════════════════════════════════════════════════

    calculate(data = {}) {
        const { formula, params = {} } = data;
        if (!formula) return { error: 'يرجى تحديد formula: wind | solar | efficiency | co2 | annual | energy' };

        const results = {};
        switch (String(formula).toLowerCase()) {
            case 'wind':
                results.wind = ENERGY_PHYSICS.windPower(params.rho, params.areaM2 || 5026, params.windSpeedMs || 10, params.Cp);
                break;
            case 'solar':
                results.solar = ENERGY_PHYSICS.solarPower(params.irradianceWm2 || 1000, params.areaM2 || 1, params.efficiency || 0.20);
                break;
            case 'efficiency':
                results.efficiency = { efficiencyPercent: ENERGY_PHYSICS.efficiency(params.powerOut || 90, params.powerIn || 100) };
                break;
            case 'co2':
                results.co2 = ENERGY_PHYSICS.co2Emissions(params.kWh || 1000, params.emissionFactor || 490);
                break;
            case 'annual':
                results.annual = ENERGY_PHYSICS.annualEnergy(params.capacityKW || 1000, params.capacityFactor || 0.25);
                break;
            case 'energy':
                results.energy = ENERGY_PHYSICS.energy(params.powerKW || 100, params.timeH || 1);
                break;
            default:
                return { error: `معادلة غير معروفة: ${formula}`, available: ['wind','solar','efficiency','co2','annual','energy'] };
        }

        return { schema: this.schema, formula, params, results, tawheed: this.tawheed };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // قائمة مصادر الطاقة — listEnergySources
    // ═══════════════════════════════════════════════════════════════════════════

    listEnergySources(typeFilter = null) {
        if (typeFilter) {
            const src = ENERGY_SOURCES[typeFilter];
            if (!src) return { error: `مصدر غير موجود: ${typeFilter}`, available: Object.keys(ENERGY_SOURCES) };
            return { schema: this.schema, source: src, tawheed: this.tawheed };
        }
        const summary = Object.entries(ENERGY_SOURCES).map(([id, src]) => ({
            id, nameAr: src.nameAr, nameEn: src.nameEn,
            icon: src.icon, halal: src.halal,
            sustainable: src.sustainable, carbonFree: src.carbonFree,
            costUSDkWh: src.costUSDkWh, co2gPerKWh: src.co2gPerKWh,
            subtypesCount: src.subtypes?.length || 0,
        }));
        return {
            schema: this.schema,
            totalSources: summary.length,
            sources: summary,
            halalSources: summary.filter(s => s.halal).length,
            sustainableSources: summary.filter(s => s.sustainable).length,
            carbonFreeSources: summary.filter(s => s.carbonFree).length,
            tawheed: this.tawheed,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // حالة المحرك — status
    // ═══════════════════════════════════════════════════════════════════════════

    status() {
        return {
            schema:          this.schema,
            name:            this.name,
            nameAr:          this.nameAr,
            version:         this.version,
            startedAt:       this.startedAt,
            tawheed:         this.tawheed,
            quranRef:        '﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ﴾ — النور ٣٥',
            neuralEnabled:   !!this.nn,
            neuralTrained:   this.trained,
            neuralArchitecture: this.nn ? `${ENERGY_INPUT_DIM} → 32 → 16 → ${ENERGY_OUTPUT_DIM} (softmax)` : null,
            totalSources:    Object.keys(ENERGY_SOURCES).length,
            totalSubtypes:   Object.values(ENERGY_SOURCES).reduce((n, s) => n + (s.subtypes?.length || 0), 0),
            marketInstruments: ENERGY_MARKET.instruments.length,
            vision2030Targets: Object.keys(SAUDI_VISION2030_ENERGY.targets).length,
            capabilities: [
                'تصنيف مصادر الطاقة بالشبكة العصبية الحقيقية',
                'توقع الطلب على الطاقة حسب درجة الحرارة والساعة والموسم',
                'تحسين توزيع الطاقة بأولوية المتجددة',
                'تقييم مشاريع الطاقة مالياً وبيئياً وشرعياً',
                'سوق تداول الطاقة الحلال (صكوك، RECs، PPA، P2P)',
                'متابعة مؤشرات رؤية المملكة 2030 للطاقة',
                'الامتثال الشرعي الإسلامي لمشاريع الطاقة',
                'حسابات فيزيائية للطاقة (رياح، شمس، كفاءة، CO₂)',
                'دعم عربي وإنجليزي كامل',
            ],
            sharia: SHARIA_ENERGY_FOUNDATION.principles,
        };
    }

    // ─── دوال مساعدة خاصة ────────────────────────────────────────────────────

    /** استخراج ميزات رقمية من نص للتغذية بالشبكة العصبية */
    _extractTextFeatures(text) {
        const t = text.toLowerCase();
        return [
            (t.includes('solar') || t.includes('sun') || t.includes('شمس') || t.includes('pv') || t.includes('فوتو')) ? 0.9 : 0.1,
            (t.includes('wind') || t.includes('turbine') || t.includes('رياح') || t.includes('توربين')) ? 0.9 : 0.1,
            (t.includes('hydro') || t.includes('water') || t.includes('dam') || t.includes('مائية') || t.includes('سد')) ? 0.9 : 0.1,
            0.5, // capacity — غير معروف من النص
            (t.includes('cheap') || t.includes('رخيص') || t.includes('اقتصادي')) ? 0.2 : 0.5,
            (t.includes('clean') || t.includes('نظيف') || t.includes('green') || t.includes('أخضر')) ? 0.1 : 0.5,
            (t.includes('renewable') || t.includes('متجدد') || t.includes('sustainable')) ? 0.95 : 0.5,
            (t.includes('nuclear') || t.includes('نووي') || t.includes('gas') || t.includes('غاز')) ? 0.9 : 0.4,
            0.5, // time
            0.5, // reliability
            (t.includes('storage') || t.includes('battery') || t.includes('تخزين') || t.includes('بطارية')) ? 0.9 : 0.1,
            0.8, // grid compatibility — افتراضي جيد
            1.0, // halal — افتراضي حلال
        ];
    }

    /** تقدير حصة الطاقة المتجددة حسب الساعة والشهر */
    _estimateRenewableContribution(hour, month) {
        const solarHours  = hour >= 7 && hour <= 17;
        const summerMonth = month >= 5 && month <= 9;
        let base = 5; // 5% حد أدنى (رياح ليلية)
        if (solarHours) base += summerMonth ? 35 : 25;
        return Math.min(60, base);
    }

    /** تقييم الجانب المالي لمشروع طاقة */
    _scoreFinancial(capacityMW, costMUSD, costPerKWh = 0.05) {
        const costPerMW = costMUSD / capacityMW; // مليون دولار/ميغاواط
        // أقل تكلفة = أعلى درجة
        if (costPerMW < 0.5) return 10;
        if (costPerMW < 1.0) return 8;
        if (costPerMW < 2.0) return 6;
        if (costPerMW < 3.5) return 4;
        return 2;
    }

    /** تقييم الامتثال الشرعي للمشروع */
    _scoreShariaProject(type, financing) {
        let score = ENERGY_SOURCES[type]?.halal ? 8 : 4;
        if (financing === 'sukuk')  score = Math.min(10, score + 2);
        if (financing === 'equity') score = Math.min(10, score + 1);
        if (financing === 'loan')   score = Math.max(0, score - 4);
        return score;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

const engine = new SheikhaEnergyNeuralNetwork();

module.exports = {
    engine,
    SheikhaEnergyNeuralNetwork,
    ENERGY_SOURCES,
    SHARIA_ENERGY_FOUNDATION,
    SAUDI_VISION2030_ENERGY,
    ENERGY_MARKET,
    ENERGY_PHYSICS,
};
