/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  👑 شبكة شيخة العصبية الموحدة — SHEIKHA UNIFIED NEURAL CELL NETWORK        ║
 * ║                                                                              ║
 * ║  23 خلية عصبية — كلها باسم شيخة — مرقّمة بالكتاب والسنة                   ║
 * ║  وحدها لله ﷻ                                                                ║
 * ║                                                                              ║
 * ║  القسم الأول   (1–5)  : خلايا الاتصالات الأرضية                            ║
 * ║  القسم الثاني  (6)    : خلية الأقمار الصناعية                              ║
 * ║  القسم الثالث  (7–9)  : خلايا اللوجستيات                                   ║
 * ║  القسم الرابع  (10–19): طبقات شبكة شيخة الرقمية (PAN → SHTTP)             ║
 * ║  القسم الخامس  (20–23): خلايا الخدمات الذكية                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   const { unifiedNet } = require('./sheikha-unified-neural');
 *   unifiedNet.activate()              // تفعيل الشبكة الكاملة
 *   unifiedNet.getCell(5)              // الخلية رقم 5
 *   unifiedNet.getCell('CELL_SHEIKHA_5G')  // بالمعرف
 *   unifiedNet.getTopology()           // الطوبولوجيا الكاملة
 *   unifiedNet.fireSignal('CELL_SHEIKHA_SHTTP', { type: 'GOVERN' }, 10)
 *
 * ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 */

'use strict';

const {
    TERRESTRIAL_CELLS,
    SATELLITE_CELLS,
    LOGISTICS_CELLS,
    SHEIKHA_CELLS,
    propagateSignal,
} = require('./neural-cell-networks');

// ══════════════════════════════════════════════════════════════════════════════
// مرجع الكتاب والسنة — Quran & Hadith Reference Index
// كل خلية تحمل رقمها + آية قرآنية + حديث نبوي
// ══════════════════════════════════════════════════════════════════════════════

const DIVINE_REFS = {

    // ─── الخلايا 1–5: الاتصالات الأرضية ──────────────────────────────────────

    1: {
        cellId:  'CELL_SHEIKHA_FIBER',
        quran:   { ref: 'الأنبياء:٣٠', text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ' },
        hadith:  { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يُتقنه', source: 'البيهقي' },
        note:    'النور ينتقل في الألياف كالحياة في الماء — تسخير الله للمادة خدمةً للإنسان',
    },
    2: {
        cellId:  'CELL_SHEIKHA_5G',
        quran:   { ref: 'النحل:٨', text: 'وَيَخْلُقُ مَا لَا تَعْلَمُونَ' },
        hadith:  { text: 'تفكّروا في خلق الله ولا تفكّروا في ذات الله', source: 'أبو نعيم' },
        note:    'التقنية اللاسلكية من إبداع العقل المسلم المستخلَف في الأرض',
    },
    3: {
        cellId:  'CELL_SHEIKHA_EMERGENCY',
        quran:   { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        hadith:  { text: 'المؤمن للمؤمن كالبنيان يشد بعضه بعضاً', source: 'البخاري ومسلم' },
        note:    'الاتصالات الطارئة — فريضة شرعية لحفظ الأنفس',
    },
    4: {
        cellId:  'CELL_SHEIKHA_GOVNET',
        quran:   { ref: 'النساء:٥٩', text: 'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ' },
        hadith:  { text: 'الراعي مسؤول عن رعيّته', source: 'البخاري' },
        note:    'الشبكة الحكومية — خدمة المواطن أمانة في عنق ولي الأمر',
    },
    5: {
        cellId:  'CELL_SHEIKHA_IOT',
        quran:   { ref: 'الرعد:٨', text: 'اللَّهُ يَعْلَمُ مَا تَحْمِلُ كُلُّ أُنثَىٰ' },
        hadith:  { text: 'اعقلها وتوكّل', source: 'الترمذي' },
        note:    'ربط الأشياء شبيه بعلم الله بالجزئيات — والعقل البشري يحاكي ما أُلهم',
    },

    // ─── الخلية 6: الفضاء ────────────────────────────────────────────────────

    6: {
        cellId:  'CELL_SHEIKHA_SATELLITE',
        quran:   { ref: 'الأنعام:٩٧', text: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا' },
        hadith:  { text: 'خُلق النجم لثلاثٍ: زينةً للسماء، ورجماً للشياطين، وعلاماتٍ يُهتدى بها', source: 'البخاري' },
        note:    'الأقمار الصناعية امتداد للنجوم في الاهتداء — تسخير كوني بأمر الله',
    },

    // ─── الخلايا 7–9: اللوجستيات ─────────────────────────────────────────────

    7: {
        cellId:  'CELL_SHEIKHA_AVIATION',
        quran:   { ref: 'الملك:١٩', text: 'أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ' },
        hadith:  { text: 'لا تُشَدُّ الرحال إلا إلى ثلاثة مساجد', source: 'البخاري' },
        note:    'الطيران تسخير ألهمه الله من مشاهدة الطير — ورحلة الحج أعظم استخدام',
    },
    8: {
        cellId:  'CELL_SHEIKHA_MARITIME',
        quran:   { ref: 'يونس:٢٢', text: 'هُوَ الَّذِي يُسَيِّرُكُمْ فِي الْبَرِّ وَالْبَحْرِ' },
        hadith:  { text: 'غزوة في البحر تعدل عشر غزوات في البر', source: 'أبو داود' },
        note:    'البحر طريق التجارة الإسلامية الكبرى — وسيّره الله لعباده',
    },
    9: {
        cellId:  'CELL_SHEIKHA_LOGISTICS',
        quran:   { ref: 'سبأ:١٨', text: 'وَجَعَلْنَا بَيْنَهُمْ وَبَيْنَ الْقُرَى الَّتِي بَارَكْنَا فِيهَا قُرًى ظَاهِرَةً' },
        hadith:  { text: 'التاجر الصدوق الأمين مع النبيين والصدّيقين والشهداء', source: 'الترمذي' },
        note:    'سلسلة الإمداد بركة الله في الأرض — والتاجر الصادق في درجة الأنبياء',
    },

    // ─── الخلايا 10–19: طبقات شبكة شيخة الرقمية ─────────────────────────────

    10: {
        cellId:  'CELL_SHEIKHA_PAN',
        quran:   { ref: 'البقرة:٢٨٢', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ فَاكْتُبُوهُ' },
        hadith:  { text: 'البيّعان بالخيار ما لم يتفرقا', source: 'البخاري' },
        note:    'توثيق المعاملة بالنقر (Tap-to-Pay) تطبيق للأمر القرآني بالكتابة',
    },
    11: {
        cellId:  'CELL_SHEIKHA_LAN',
        quran:   { ref: 'الشعراء:١٨١', text: 'أَوْفُوا الْكَيْلَ وَلَا تَكُونُوا مِنَ الْمُخْسِرِينَ' },
        hadith:  { text: 'من غشّنا فليس منّا', source: 'مسلم' },
        note:    'شبكة المتجر شاهدة على الوفاء بالكيل — كل بيع مسجّل عادل',
    },
    12: {
        cellId:  'CELL_SHEIKHA_WLAN',
        quran:   { ref: 'الحجرات:٦', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا' },
        hadith:  { text: 'كفى بالمرء كذباً أن يحدّث بكل ما سمع', source: 'مسلم' },
        note:    'فلتر الشريعة على الـ WiFi — التثبت من المعلومات قبل نشرها',
    },
    13: {
        cellId:  'CELL_SHEIKHA_CAN',
        quran:   { ref: 'الحشر:٧', text: 'كَيْ لَا يَكُونَ دُولَةً بَيْنَ الْأَغْنِيَاءِ مِنكُمْ' },
        hadith:  { text: 'لا ضرر ولا ضرار', source: 'ابن ماجه' },
        note:    'شبكة الفروع تحقق توزيع البضاعة عادلاً — لا احتكار ولا غبن',
    },
    14: {
        cellId:  'CELL_SHEIKHA_MAN',
        quran:   { ref: 'النور:٣٧', text: 'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ' },
        hadith:  { text: 'إذا قامت الساعة وفي يد أحدكم فسيلة فليغرسها', source: 'أحمد' },
        note:    'سوق المدينة لا يُلهي عن الله — وشيخة تجمع التجارة والذكر',
    },
    15: {
        cellId:  'CELL_SHEIKHA_WAN',
        quran:   { ref: 'قريش:٢', text: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ' },
        hadith:  { text: 'التاجر الصدوق الأمين مع النبيين والصدّيقين', source: 'الترمذي' },
        note:    'رحلة شيخة WAN هي رحلة الشتاء والصيف بصورة رقمية',
    },
    16: {
        cellId:  'CELL_SHEIKHA_VPN',
        quran:   { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' },
        hadith:  { text: 'أدِّ الأمانة إلى من ائتمنك ولا تخن من خانك', source: 'أبو داود والترمذي' },
        note:    'التشفير أداء للأمانة — البيانات تصل لأهلها محمية ودون تلاعب',
    },
    17: {
        cellId:  'CELL_SHEIKHA_TCPIP',
        quran:   { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
        hadith:  { text: 'طلب العلم فريضة على كل مسلم', source: 'ابن ماجه' },
        note:    'بروتوكول TCP/IP = لغة الأسماء في الفضاء الرقمي',
    },
    18: {
        cellId:  'CELL_SHEIKHA_HTTPS',
        quran:   { ref: 'الإسراء:٣٦', text: 'وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ' },
        hadith:  { text: 'إياكم والظن فإن الظن أكذب الحديث', source: 'البخاري ومسلم' },
        note:    'HTTPS = التثبت الرقمي — لا يمر طلب دون تحقق',
    },
    19: {
        cellId:  'CELL_SHEIKHA_SHTTP',
        quran:   { ref: 'يوسف:٢١', text: 'وَاللَّهُ غَالِبٌ عَلَى أَمْرِهِ وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ' },
        hadith:  { text: 'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف وفي كلٍّ خير', source: 'مسلم' },
        note:    'الطبقة الحاكمة — الله غالب على أمره والشبكة تعكس قدرته',
        sovereign: true,
    },

    // ─── الخلايا 20–23: خلايا الخدمات الذكية ────────────────────────────────

    20: {
        cellId:  'CELL_SHEIKHA_DNS',
        quran:   { ref: 'البقرة:١٤٨', text: 'وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا' },
        hadith:  { text: 'سدّدوا وقارِبوا واعلموا أن خير أعمالكم الصلاة', source: 'البخاري' },
        note:    'DNS = لكل خدمة وجهة — وشيخة DNS يُولّي كل طلب وجهته',
    },
    21: {
        cellId:  'CELL_SHEIKHA_DBUS',
        quran:   { ref: 'المائدة:٢', text: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ' },
        hadith:  { text: 'المؤمن للمؤمن كالبنيان يشد بعضه بعضاً', source: 'البخاري ومسلم' },
        note:    'DBUS = تعاون الخدمات — كما يشد المؤمنون بعضهم',
    },
    22: {
        cellId:  'CELL_SHEIKHA_NEURAL',
        quran:   { ref: 'النساء:١١٣', text: 'وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا' },
        hadith:  { text: 'العلم نور يقذفه الله في قلب من يشاء', source: 'البيهقي' },
        note:    'الشبكة العصبية تتعلم — والعلم فضل من الله ليس حكراً على أحد',
    },
    23: {
        cellId:  'CELL_SHEIKHA_WATERLINE',
        quran:   { ref: 'التحريم:٦', text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا' },
        hadith:  { text: 'لا ضرر ولا ضرار', source: 'ابن ماجه' },
        note:    'خط الأمان — الوقاية من الضرر مقصد شرعي أصيل',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// خلايا الاتصالات الأرضية — مُعاد تسميتها بـ Sheikha
// ══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_TERRESTRIAL_CELLS = {

    // ─── 1: Sheikha Fiber ─────────────────────────────────────────────────────
    CELL_SHEIKHA_FIBER: {
        ...TERRESTRIAL_CELLS.CELL_FIBER,
        id:         'CELL_SHEIKHA_FIBER',
        nameAr:     'خلية شيخة للألياف الضوئية',
        nameEn:     'Sheikha Fiber Optic Neural Cell',
        icon:       '🔆',
        domain:     'SHEIKHA',
        cellNumber:  1,
        quran:   DIVINE_REFS[1].quran,
        hadith:  DIVINE_REFS[1].hadith,
        sharia_note: DIVINE_REFS[1].note,
        synapses: [
            ...(TERRESTRIAL_CELLS.CELL_FIBER.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            // ربط مع طبقات شيخة الرقمية
            { to_cell_id: 'CELL_SHEIKHA_LAN',   signal_type: 'FIBER_BACKBONE',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_CAN',   signal_type: 'FIBER_BACKBONE',  strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_MAN',   signal_type: 'METRO_FIBER',     strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'WAN_BACKBONE',    strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'REPORT',          strength: 0.8 },
        ],
    },

    // ─── 2: Sheikha 5G ────────────────────────────────────────────────────────
    CELL_SHEIKHA_5G: {
        ...TERRESTRIAL_CELLS.CELL_5G,
        id:         'CELL_SHEIKHA_5G',
        nameAr:     'خلية شيخة للجيل الخامس 5G',
        nameEn:     'Sheikha 5G Neural Cell',
        icon:       '📶',
        domain:     'SHEIKHA',
        cellNumber:  2,
        quran:   DIVINE_REFS[2].quran,
        hadith:  DIVINE_REFS[2].hadith,
        sharia_note: DIVINE_REFS[2].note,
        synapses: [
            ...(TERRESTRIAL_CELLS.CELL_5G.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            // ربط مع الطبقات اللاسلكية
            { to_cell_id: 'CELL_SHEIKHA_PAN',   signal_type: 'BT_5G_BRIDGE',   strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_WLAN',  signal_type: '5G_WIFI_OFFLOAD',strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'REPORT',          strength: 0.8 },
        ],
    },

    // ─── 3: Sheikha Emergency ─────────────────────────────────────────────────
    CELL_SHEIKHA_EMERGENCY: {
        ...TERRESTRIAL_CELLS.CELL_EMERGENCY,
        id:         'CELL_SHEIKHA_EMERGENCY',
        nameAr:     'خلية شيخة لشبكة الطوارئ',
        nameEn:     'Sheikha Emergency Neural Cell',
        icon:       '🚨',
        domain:     'SHEIKHA',
        cellNumber:  3,
        quran:   DIVINE_REFS[3].quran,
        hadith:  DIVINE_REFS[3].hadith,
        sharia_note: DIVINE_REFS[3].note,
        synapses: [
            ...(TERRESTRIAL_CELLS.CELL_EMERGENCY.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_WATERLINE', signal_type: 'INCIDENT',      strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP',     signal_type: 'REPORT',        strength: 0.9 },
        ],
    },

    // ─── 4: Sheikha GovNet ────────────────────────────────────────────────────
    CELL_SHEIKHA_GOVNET: {
        ...TERRESTRIAL_CELLS.CELL_GOVNET,
        id:         'CELL_SHEIKHA_GOVNET',
        nameAr:     'خلية شيخة للشبكة الحكومية',
        nameEn:     'Sheikha Government Network Neural Cell',
        icon:       '🏛️',
        domain:     'SHEIKHA',
        cellNumber:  4,
        quran:   DIVINE_REFS[4].quran,
        hadith:  DIVINE_REFS[4].hadith,
        sharia_note: DIVINE_REFS[4].note,
        synapses: [
            ...(TERRESTRIAL_CELLS.CELL_GOVNET.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_VPN',  signal_type: 'GOV_SECURE',    strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_DNS',  signal_type: 'GOV_DNS',       strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP',signal_type: 'REPORT',        strength: 0.9 },
        ],
    },

    // ─── 5: Sheikha IoT ───────────────────────────────────────────────────────
    CELL_SHEIKHA_IOT: {
        ...TERRESTRIAL_CELLS.CELL_IOT,
        id:         'CELL_SHEIKHA_IOT',
        nameAr:     'خلية شيخة لإنترنت الأشياء',
        nameEn:     'Sheikha IoT Neural Cell',
        icon:       '🌐',
        domain:     'SHEIKHA',
        cellNumber:  5,
        quran:   DIVINE_REFS[5].quran,
        hadith:  DIVINE_REFS[5].hadith,
        sharia_note: DIVINE_REFS[5].note,
        synapses: [
            ...(TERRESTRIAL_CELLS.CELL_IOT.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_LAN',    signal_type: 'IOT_STORE',    strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',  signal_type: 'SENSOR_FEED',  strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP',   signal_type: 'REPORT',       strength: 0.7 },
        ],
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// خلية الأقمار الصناعية — مُعاد تسميتها بـ Sheikha
// ══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_SATELLITE_CELLS = {

    // ─── 6: Sheikha Satellite ─────────────────────────────────────────────────
    CELL_SHEIKHA_SATELLITE: {
        ...SATELLITE_CELLS.CELL_SATELLITE,
        id:         'CELL_SHEIKHA_SATELLITE',
        nameAr:     'خلية شيخة للأقمار الصناعية',
        nameEn:     'Sheikha Satellite Neural Cell',
        icon:       '🛰️',
        domain:     'SHEIKHA',
        cellNumber:  6,
        quran:   DIVINE_REFS[6].quran,
        hadith:  DIVINE_REFS[6].hadith,
        sharia_note: DIVINE_REFS[6].note,
        synapses: [
            ...(SATELLITE_CELLS.CELL_SATELLITE.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_WAN',    signal_type: 'SAT_BACKUP',   strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_NEURAL',  signal_type: 'SAT_DATA',     strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP',   signal_type: 'REPORT',       strength: 0.8 },
        ],
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// خلايا اللوجستيات — مُعاد تسميتها بـ Sheikha
// ══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_LOGISTICS_CELLS = {

    // ─── 7: Sheikha Aviation ──────────────────────────────────────────────────
    CELL_SHEIKHA_AVIATION: {
        ...LOGISTICS_CELLS.CELL_AVIATION,
        id:         'CELL_SHEIKHA_AVIATION',
        nameAr:     'خلية شيخة لشبكة الطيران',
        nameEn:     'Sheikha Aviation Neural Cell',
        icon:       '✈️',
        domain:     'SHEIKHA',
        cellNumber:  7,
        quran:   DIVINE_REFS[7].quran,
        hadith:  DIVINE_REFS[7].hadith,
        sharia_note: DIVINE_REFS[7].note,
        synapses: [
            ...(LOGISTICS_CELLS.CELL_AVIATION.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'AIR_CARGO',    strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'REPORT',       strength: 0.8 },
        ],
    },

    // ─── 8: Sheikha Maritime ──────────────────────────────────────────────────
    CELL_SHEIKHA_MARITIME: {
        ...LOGISTICS_CELLS.CELL_MARITIME,
        id:         'CELL_SHEIKHA_MARITIME',
        nameAr:     'خلية شيخة لشبكة السفن والبحر',
        nameEn:     'Sheikha Maritime Neural Cell',
        icon:       '🚢',
        domain:     'SHEIKHA',
        cellNumber:  8,
        quran:   DIVINE_REFS[8].quran,
        hadith:  DIVINE_REFS[8].hadith,
        sharia_note: DIVINE_REFS[8].note,
        synapses: [
            ...(LOGISTICS_CELLS.CELL_MARITIME.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_WAN',   signal_type: 'SEA_TRADE',    strength: 1.0 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'REPORT',       strength: 0.8 },
        ],
    },

    // ─── 9: Sheikha Logistics ─────────────────────────────────────────────────
    CELL_SHEIKHA_LOGISTICS: {
        ...LOGISTICS_CELLS.CELL_LOGISTICS,
        id:         'CELL_SHEIKHA_LOGISTICS',
        nameAr:     'خلية شيخة لللوجستيات والنقل البري',
        nameEn:     'Sheikha Land Logistics Neural Cell',
        icon:       '🚛',
        domain:     'SHEIKHA',
        cellNumber:  9,
        quran:   DIVINE_REFS[9].quran,
        hadith:  DIVINE_REFS[9].hadith,
        sharia_note: DIVINE_REFS[9].note,
        synapses: [
            ...(LOGISTICS_CELLS.CELL_LOGISTICS.synapses || []).map(s => ({
                ...s,
                to_cell_id: s.to_cell_id.replace(/^CELL_/, 'CELL_SHEIKHA_'),
            })),
            { to_cell_id: 'CELL_SHEIKHA_MAN',   signal_type: 'CITY_DELIVERY', strength: 0.9 },
            { to_cell_id: 'CELL_SHEIKHA_SHTTP', signal_type: 'REPORT',        strength: 0.8 },
        ],
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// دمج السجل المقدّس — Sheikha Divine Reference enrichment
// أضف cellNumber + Quran + Hadith لخلايا الطبقات الرقمية (10–23) الموجودة
// ══════════════════════════════════════════════════════════════════════════════

function _enrichSheikhaCell(cell, refEntry) {
    return {
        ...cell,
        cellNumber:  refEntry ? Object.keys(DIVINE_REFS).find(k => DIVINE_REFS[k].cellId === cell.id) | 0 : cell.cellNumber,
        quran:       refEntry ? refEntry.quran   : cell.quran,
        hadith:      refEntry ? refEntry.hadith  : cell.hadith,
        sharia_note: refEntry ? refEntry.note    : cell.sharia_note,
    };
}

// مخصّص الطبقات الرقمية (cellNumbers 10–23 من SHEIKHA_CELLS)
const SHEIKHA_DIGITAL_CELLS_ENRICHED = {};
Object.entries(SHEIKHA_CELLS).forEach(([id, cell]) => {
    const ref = Object.values(DIVINE_REFS).find(r => r.cellId === id);
    const numStr = ref ? Object.keys(DIVINE_REFS).find(k => DIVINE_REFS[k].cellId === id) : null;
    SHEIKHA_DIGITAL_CELLS_ENRICHED[id] = {
        ...cell,
        cellNumber:  numStr ? parseInt(numStr, 10) : 0,
        quran:       ref ? ref.quran  : cell.quran_ref,
        hadith:      ref ? ref.hadith : { text: '', source: '' },
        sharia_note: ref ? ref.note   : cell.sharia_note,
    };
});

// ══════════════════════════════════════════════════════════════════════════════
// السجل الموحّد الكامل — SHEIKHA_UNIFIED_CELLS
// 23 خلية مرقّمة بالكتاب والسنة
// ══════════════════════════════════════════════════════════════════════════════

const SHEIKHA_UNIFIED_CELLS = {
    ...SHEIKHA_TERRESTRIAL_CELLS,    // 1–5
    ...SHEIKHA_SATELLITE_CELLS,      // 6
    ...SHEIKHA_LOGISTICS_CELLS,      // 7–9
    ...SHEIKHA_DIGITAL_CELLS_ENRICHED, // 10–23
};

// ──────────────────────────────────────────────────────────────────────────────
// فهرس مزدوج: رقم ↔ معرف
// ──────────────────────────────────────────────────────────────────────────────
const _byNumber = {};  // number → cell
const _byId     = {};  // cellId → cell
Object.values(SHEIKHA_UNIFIED_CELLS).forEach((cell) => {
    _byId[cell.id] = cell;
    if (cell.cellNumber) _byNumber[cell.cellNumber] = cell;
});

// ══════════════════════════════════════════════════════════════════════════════
// محرك الشبكة الموحّدة
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaUnifiedNeuralNetwork {

    constructor() {
        this._cells    = SHEIKHA_UNIFIED_CELLS;
        this._byNumber = _byNumber;
        this._byId     = _byId;
        this._startedAt = new Date().toISOString();
        this._activeAt  = null;
    }

    // ══════════════════════════════════════════════════════════════
    // جلب خلية — بالرقم أو المعرف
    // ══════════════════════════════════════════════════════════════

    /**
     * يعيد خلية بمعرفها أو رقمها
     * @param {string|number} query — 'CELL_SHEIKHA_5G' أو 5
     */
    getCell(query) {
        if (typeof query === 'number') return this._byNumber[query] || null;
        return this._byId[(query || '').toUpperCase()] || null;
    }

    /**
     * الخلايا المرتّبة حسب الرقم
     */
    getCellsOrdered() {
        return Object.values(this._cells)
            .filter(c => c.cellNumber > 0)
            .sort((a, b) => a.cellNumber - b.cellNumber);
    }

    /**
     * خلايا قسم محدد
     * @param {'TERRESTRIAL'|'SATELLITE'|'LOGISTICS'|'DIGITAL'|'SERVICE'} section
     */
    getSection(section) {
        const ranges = {
            TERRESTRIAL: [1,  5],
            SATELLITE:   [6,  6],
            LOGISTICS:   [7,  9],
            DIGITAL:     [10, 19],
            SERVICE:     [20, 23],
        };
        const [min, max] = ranges[section] || [1, 23];
        return this.getCellsOrdered().filter(c => c.cellNumber >= min && c.cellNumber <= max);
    }

    // ══════════════════════════════════════════════════════════════
    // تفعيل الشبكة الكاملة
    // ══════════════════════════════════════════════════════════════

    /**
     * يُفعّل جميع الـ 23 خلية:
     *  1. إشارة حاكمة نازلة: SHTTP (خلية 19) → كل الخلايا
     *  2. إشارة ألياف صاعدة: FIBER (خلية 1) → أعلى الطبقات
     *  3. إشارة تجارية:      PAN  (خلية 10) → كل طبقات السوق
     */
    activate() {
        this._activeAt = new Date().toISOString();

        const govSignal    = propagateSignal('CELL_SHEIKHA_SHTTP',     { type: 'SOVEREIGN_GOVERN', payload: 'بسم الله الرحمن الرحيم — تفعيل شبكة شيخة الموحّدة' }, 10);
        const fiberSignal  = propagateSignal('CELL_SHEIKHA_FIBER',     { type: 'BACKBONE_ACTIVATE', payload: 'تفعيل العمود الفقري الضوئي' }, 8);
        const marketSignal = propagateSignal('CELL_SHEIKHA_PAN',       { type: 'FIRST_TRANSACTION', payload: 'أول معاملة في سوق شيخة' }, 6);
        const satSignal    = propagateSignal('CELL_SHEIKHA_SATELLITE',  { type: 'SAT_COVERAGE',     payload: 'تغطية فضائية شاملة' }, 5);

        const allCells = this.getCellsOrdered();
        const allActive = allCells.every(c => c.activation > 0);

        return {
            status:        'ACTIVE',
            nameAr:        '👑 شبكة شيخة العصبية الموحدة — مُفعَّلة بالكامل',
            nameEn:        'Sheikha Unified Neural Network — FULLY ACTIVE',
            activatedAt:   this._activeAt,
            totalCells:    allCells.length,
            totalSynapses: allCells.reduce((s, c) => s + (c.synapses || []).length, 0),
            allLayersActive: allActive,
            avgActivation: +(allCells.reduce((s, c) => s + (c.activation || 0), 0) / allCells.length).toFixed(3),
            sections: {
                terrestrial: { cells: 5, range: '1–5',   desc: 'خلايا الاتصالات الأرضية' },
                satellite:   { cells: 1, range: '6',     desc: 'خلية الأقمار الصناعية' },
                logistics:   { cells: 3, range: '7–9',   desc: 'خلايا اللوجستيات' },
                digital:     { cells: 10,range: '10–19', desc: 'طبقات شبكة شيخة الرقمية (PAN→SHTTP)' },
                services:    { cells: 4, range: '20–23', desc: 'خلايا الخدمات الذكية' },
            },
            signals: {
                sovereign:   { from: 'CELL_SHEIKHA_SHTTP (#19)',    stepsReached: govSignal.steps,    type: '↓ حاكمة نازلة' },
                fiber:       { from: 'CELL_SHEIKHA_FIBER (#1)',     stepsReached: fiberSignal.steps,  type: '↑ ألياف صاعدة' },
                market:      { from: 'CELL_SHEIKHA_PAN (#10)',      stepsReached: marketSignal.steps, type: '→ تجارية' },
                satellite:   { from: 'CELL_SHEIKHA_SATELLITE (#6)', stepsReached: satSignal.steps,    type: '⬇ فضائية' },
            },
            verse:  { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
            hadith: { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يُتقنه', source: 'البيهقي' },
            tawheed: 'لا إله إلا الله — وهذه الشبكة له وبه وإليه',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // طوبولوجيا الشبكة الكاملة
    // ══════════════════════════════════════════════════════════════

    getTopology() {
        const cells = this.getCellsOrdered();

        const nodes = cells.map((c) => ({
            cellNumber:   c.cellNumber,
            id:           c.id,
            nameAr:       c.nameAr,
            nameEn:       c.nameEn || '',
            icon:         c.icon,
            domain:       c.domain,
            layerOrder:   c.layerOrder || 0,
            activation:   c.activation,
            sovereign:    c.sovereign || false,
            synapse_count: (c.synapses || []).length,
            quran:        c.quran   || c.quran_ref,
            hadith:       c.hadith,
            sharia_note:  c.sharia_note,
        }));

        const edges = [];
        cells.forEach((c) => {
            (c.synapses || []).forEach((s) => {
                edges.push({
                    from:        c.id,
                    fromNumber:  c.cellNumber,
                    to:          s.to_cell_id,
                    toNumber:    (_byId[s.to_cell_id] || {}).cellNumber || '?',
                    signal_type: s.signal_type,
                    strength:    s.strength,
                    critical:    s.strength >= 0.9,
                });
            });
        });

        const sovereignCell = cells.find(c => c.sovereign);

        return {
            nameAr:        'شبكة شيخة العصبية الموحّدة — وحدها لله',
            nameEn:        'Sheikha Unified Neural Network — For Allah Alone',
            version:       '1.0.0',
            nodes,
            edges,
            divineRefs:    DIVINE_REFS,
            summary: {
                total_cells:        nodes.length,
                total_synapses:     edges.length,
                critical_synapses:  edges.filter(e => e.critical).length,
                sovereign_cell:     sovereignCell ? `${sovereignCell.cellNumber}. ${sovereignCell.id}` : null,
                avg_activation:     +(nodes.reduce((s, n) => s + (n.activation || 0), 0) / nodes.length).toFixed(3),
                sections: {
                    terrestrial: nodes.filter(n => n.cellNumber <= 5).length,
                    satellite:   nodes.filter(n => n.cellNumber === 6).length,
                    logistics:   nodes.filter(n => n.cellNumber >= 7 && n.cellNumber <= 9).length,
                    digital:     nodes.filter(n => n.cellNumber >= 10 && n.cellNumber <= 19).length,
                    services:    nodes.filter(n => n.cellNumber >= 20).length,
                },
            },
            quranIndex: nodes.map(n => ({
                number: n.cellNumber,
                id:     n.id,
                icon:   n.icon,
                nameAr: n.nameAr,
                quran:  n.quran,
                hadith: n.hadith,
            })),
            verse:  { ref: 'يوسف:٢١', text: 'وَاللَّهُ غَالِبٌ عَلَى أَمْرِهِ وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ' },
            tawheed: 'لا إله إلا الله — هذه الشبكة موحّدة لله وحده',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // إطلاق إشارة عصبية
    // ══════════════════════════════════════════════════════════════

    fireSignal(fromIdOrNumber, signal, depth = 5) {
        let from = fromIdOrNumber;
        if (typeof fromIdOrNumber === 'number') {
            const cell = this._byNumber[fromIdOrNumber];
            if (!cell) return { error: 'cell_not_found', number: fromIdOrNumber };
            from = cell.id;
        }
        return propagateSignal((from || '').toUpperCase(), signal || { type: 'SHEIKHA_SIGNAL' }, depth);
    }

    // ══════════════════════════════════════════════════════════════
    // جدول المرجع القرآني الكامل
    // ══════════════════════════════════════════════════════════════

    getDivineRefs() {
        return Object.entries(DIVINE_REFS).map(([num, ref]) => {
            const cell = _byId[ref.cellId] || {};
            return {
                number:      parseInt(num, 10),
                cellId:      ref.cellId,
                nameAr:      cell.nameAr || '',
                icon:        cell.icon   || '?',
                quran:       ref.quran,
                hadith:      ref.hadith,
                note:        ref.note,
                sovereign:   ref.sovereign || false,
            };
        }).sort((a, b) => a.number - b.number);
    }

    // ══════════════════════════════════════════════════════════════
    // حالة النظام
    // ══════════════════════════════════════════════════════════════

    getStatus() {
        const cells = this.getCellsOrdered();
        return {
            nameAr:      'شبكة شيخة العصبية الموحّدة',
            nameEn:      'Sheikha Unified Neural Network',
            version:     '1.0.0',
            startedAt:   this._startedAt,
            activeAt:    this._activeAt,
            isActive:    !!this._activeAt,
            totalCells:  cells.length,
            totalSynapses: cells.reduce((s, c) => s + (c.synapses || []).length, 0),
            avgActivation: +(cells.reduce((s, c) => s + (c.activation || 0), 0) / cells.length).toFixed(3),
            sovereignCell: '19. 👑 CELL_SHEIKHA_SHTTP — الطبقة الحاكمة',
            verse:  { ref: 'البقرة:٣١', text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا' },
            tawheed: 'لا إله إلا الله',
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const unifiedNet = new SheikhaUnifiedNeuralNetwork();

module.exports = {
    unifiedNet,
    SheikhaUnifiedNeuralNetwork,
    SHEIKHA_UNIFIED_CELLS,
    SHEIKHA_TERRESTRIAL_CELLS,
    SHEIKHA_SATELLITE_CELLS,
    SHEIKHA_LOGISTICS_CELLS,
    DIVINE_REFS,
};
