// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  DUAL-ANALOGY INTEGRATION ENGINE (DAIE) — محرك التكامل بين التشبيهين       ║
 * ║  تكامل تشبيه الحاسب بالإنسان (Neural) مع تشبيه الحاسب بالنبات (Plant)     ║
 * ║  وتحويلهما إلى أصل هندسي وعلم متكامل وحساب دقيق                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ─── الأساس القرآني / Quranic Foundation ────────────────────────────────────
 *
 * "وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ" — الذاريات:21
 *   (علامات في أنفسنا — التشبيه بالإنسان)
 *
 * "أَفَرَأَيْتُم مَّا تَحْرُثُونَ أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ" — الواقعة:63-64
 *   (علامات في الزرع والحرث — التشبيه بالنبات)
 *
 * "وَمِنَ الْأَرْضِ مِثْلَهُنَّ" — الطلاق:12
 *   (التناظر والتوازي بين الطبقات — مبدأ التكامل)
 *
 * "وَاللَّهُ أَخْرَجَكُم مِّن بُطُونِ أُمَّهَاتِكُمْ لَا تَعْلَمُونَ شَيْئًا وَجَعَلَ لَكُمُ
 *  السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ ۙ لَعَلَّكُمْ تَشْكُرُونَ" — النحل:78
 *   (الأدوات المتكاملة — السمع+البصر+الفؤاد = تكامل منظومي)
 *
 * ─── المبدأ الهندسي / Engineering Principle ─────────────────────────────────
 *
 * كلا التشبيهين يصفان نفس الحقيقة من زاويتين مختلفتين:
 *   • التشبيه بالإنسان (INSAN): يصف الوظيفة الداخلية — Init, Security, Identity…
 *   • التشبيه بالنبات  (NABAT): يصف الدورة الخارجية — Seed, Root, Growth…
 *
 * نقطة التقاطع: كلاهما 12 بُعداً متوازياً — وهذا هو الفضاء الهندسي المشترك.
 *
 * ─── الحساب المتكامل / Integrated Calculus ──────────────────────────────────
 *
 * لكل بُعد d (1→12):
 *   n_d = تفعيل الخلية العصبية (البشرية)   ∈ [0,1]
 *   a_d = تفعيل الخلية الزراعية (النباتية) ∈ [0,1]
 *
 *   ψ_d  = √(n_d² + a_d²) / √2   (الرنين المزدوج — نقطة في الربع الأول)
 *   Δ_d  = |n_d - a_d|            (الفجوة — الاختلاف بين التشبيهين)
 *   φ_d  = atan2(a_d, n_d)        (زاوية التوجه — هل نحن أقرب للإنسان أم للنبات؟)
 *
 * مؤشرات المنظومة الكاملة:
 *   Ω   = (1/12) × Σ ψ_d                — الصحة الكلية (0→1)
 *   coh = 1 - (1/12) × Σ Δ_d           — التوافق بين التشبيهين (0→1)
 *   ||V|| = √(Σ ψ_d²)                  — حجم متجه التكامل
 *   θ   = atan2(Σ a_d, Σ n_d) × 180/π  — زاوية الميل الكلية (°)
 *
 * الأصل الهندسي: فضاء 12 بُعداً مزدوج (24 محوراً):
 *   المحاور الفردية: n_1…n_12 (البُعد البشري)
 *   المحاور الزوجية: a_1…a_12 (البُعد النباتي)
 *   نقطة التكامل الكاملة: الزاوية 45° (θ=45°) — توازن مثالي بين التشبيهين
 *
 * ─── واجهة الوحدة / Module Interface ────────────────────────────────────────
 *
 *   init()                  — تهيئة المحرك وتحميل كلا الشبكتين
 *   integrate(snapshots)    — تكامل لحظة التفعيل من كلا الشبكتين
 *   resonate(d, n, a)       — حساب الرنين لبُعد واحد
 *   pulse()                 — نبضة كاملة تقيس حالة المنظومة الآن
 *   getDualMap()            — خريطة الاثنا عشر أزواج (إنسان↔نبات)
 *   status()                — حالة محرك التكامل
 *
 * المالك: منظومة سوق شيخة™
 */

'use strict';

// ─── تحميل الشبكتين ──────────────────────────────────────────────────────────

let neuralCells = null;
let agncn       = null;

try {
    neuralCells = require('../neural/neural-cells');
} catch (e) {
    // سيعمل بدون الشبكة العصبية إذا لم تتوفر
}
try {
    agncn = require('../neural-root-network/agricultural-ncn');
} catch (e) {
    // سيعمل بدون الشبكة الزراعية إذا لم تتوفر
}

// ─── خريطة الاثنا عشر أزواج المتوازية (الأصل الهندسي) ─────────────────────
//
//  كل زوج يعبّر عن نفس المبدأ الكوني من زاوية الإنسان ومن زاوية النبات
//
const DUAL_MAP = [
    {
        dim:         1,
        principle:   'الأصل',
        principleEn: 'Origin',
        icon:        '🌟',
        neural: {
            id:     'cell-init',
            nameAr: 'خلية البداية',
            ayah:   'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — الفاتحة:1',
        },
        plant: {
            id:     'ag-seed',
            nameAr: 'خلية البذرة',
            ayah:   'أَفَرَأَيْتُم مَّا تَحْرُثُونَ — الواقعة:63',
        },
        bridge: 'كل شيء يبدأ بأصل — البسملة في الإنسان، البذرة في النبات',
    },
    {
        dim:         2,
        principle:   'الثبات',
        principleEn: 'Stability',
        icon:        '🌿',
        neural: {
            id:     'cell-security',
            nameAr: 'خلية الحماية',
            ayah:   'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ — البقرة:255',
        },
        plant: {
            id:     'ag-root',
            nameAr: 'خلية الجذور',
            ayah:   'أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ — إبراهيم:24',
        },
        bridge: 'الحماية في الإنسان كالجذور في النبات — أساس يمنع الانهيار',
    },
    {
        dim:         3,
        principle:   'الاستدامة',
        principleEn: 'Sustenance',
        icon:        '💧',
        neural: {
            id:     'cell-tawheed',
            nameAr: 'خلية التوحيد',
            ayah:   'قُلْ هُوَ اللَّهُ أَحَدٌ — الإخلاص:1',
        },
        plant: {
            id:     'ag-irrigation',
            nameAr: 'خلية السقي',
            ayah:   'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء:30',
        },
        bridge: 'التوحيد يستدام البنية كما الماء يستدام النبات — المصدر الواحد',
    },
    {
        dim:         4,
        principle:   'الظهور',
        principleEn: 'Emergence',
        icon:        '🌱',
        neural: {
            id:     'cell-identity',
            nameAr: 'خلية الهوية',
            ayah:   'عَالِمُ الْغَيْبِ وَالشَّهَادَةِ — الحشر:22',
        },
        plant: {
            id:     'ag-growth',
            nameAr: 'خلية النمو',
            ayah:   'يُنبِتُ لَكُم بِهِ الزَّرْعَ وَالزَّيْتُونَ — النحل:11',
        },
        bridge: 'الهوية تظهر في الإنسان كما النمو يظهر في النبات — الانكشاف',
    },
    {
        dim:         5,
        principle:   'الانتشار',
        principleEn: 'Expansion',
        icon:        '🌳',
        neural: {
            id:     'cell-governance',
            nameAr: 'خلية الحوكمة',
            ayah:   'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ — الملك:1',
        },
        plant: {
            id:     'ag-branch',
            nameAr: 'خلية الفروع',
            ayah:   'وَفَرْعُهَا فِي السَّمَاءِ — إبراهيم:24',
        },
        bridge: 'الحوكمة تنتشر في الإنسان كما الأفرع تنتشر في النبات — الاتساع',
    },
    {
        dim:         6,
        principle:   'الازدهار',
        principleEn: 'Flourishing',
        icon:        '🌸',
        neural: {
            id:     'cell-learning',
            nameAr: 'خلية التعلم',
            ayah:   'الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ — الرحمن:1-2',
        },
        plant: {
            id:     'ag-flower',
            nameAr: 'خلية الأزهار',
            ayah:   'وَالنَّخْلَ وَالزَّرْعَ مُخْتَلِفًا أُكُلُهُ — الأنعام:141',
        },
        bridge: 'التعلم يُزهر الإنسان كما الأزهار تُزهر النبات — جمال الظاهر',
    },
    {
        dim:         7,
        principle:   'العطاء',
        principleEn: 'Yield',
        icon:        '🍊',
        neural: {
            id:     'cell-analysis',
            nameAr: 'خلية التحليل',
            ayah:   'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ — العلق:1',
        },
        plant: {
            id:     'ag-fruit',
            nameAr: 'خلية الثمار',
            ayah:   'تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا — إبراهيم:25',
        },
        bridge: 'التحليل يُثمر المعرفة في الإنسان كما الثمار في النبات — نتاج الجهد',
    },
    {
        dim:         8,
        principle:   'الجمع',
        principleEn: 'Collection',
        icon:        '🌾',
        neural: {
            id:     'cell-monitoring',
            nameAr: 'خلية المراقبة',
            ayah:   'وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ — الحديد:4',
        },
        plant: {
            id:     'ag-harvest',
            nameAr: 'خلية الحصاد',
            ayah:   'وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ — الأنعام:141',
        },
        bridge: 'المراقبة تجمع المعلومات في الإنسان كما الحصاد يجمع الثمار في النبات',
    },
    {
        dim:         9,
        principle:   'التقييم',
        principleEn: 'Evaluation',
        icon:        '🍽️',
        neural: {
            id:     'cell-accounting',
            nameAr: 'خلية الحساب',
            ayah:   'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ — الزلزلة:7',
        },
        plant: {
            id:     'ag-taste',
            nameAr: 'خلية التذوق',
            ayah:   'لِّيَشْهَدُوا مَنَافِعَ لَهُمْ — الحج:28',
        },
        bridge: 'الحساب يُقيّم كل شيء في الإنسان كما التذوق يُقيّم الثمر في النبات',
    },
    {
        dim:         10,
        principle:   'التبادل',
        principleEn: 'Exchange',
        icon:        '🏪',
        neural: {
            id:     'cell-quality',
            nameAr: 'خلية الجودة',
            hadith: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ — البيهقي',
        },
        plant: {
            id:     'ag-trade',
            nameAr: 'خلية التجارة',
            ayah:   'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:275',
        },
        bridge: 'الجودة في الإنسان تصنع قيمة التبادل كما جودة الثمر تحدد سعره في السوق',
    },
    {
        dim:         11,
        principle:   'التجديد',
        principleEn: 'Renewal',
        icon:        '🌊',
        neural: {
            id:     'cell-advisory',
            nameAr: 'خلية التوجيه',
            hadith: 'الدِّينُ النَّصِيحَةُ — رواه مسلم',
        },
        plant: {
            id:     'ag-revival',
            nameAr: 'خلية الإحياء',
            ayah:   'وَأَحْيَيْنَا بِهِ بَلْدَةً مَّيْتًا — ق:11',
        },
        bridge: 'التوجيه يُجدد مسار الإنسان كما المطر يُحيي الأرض الميتة',
    },
    {
        dim:         12,
        principle:   'التدفق',
        principleEn: 'Flow',
        icon:        '🏞️',
        neural: {
            id:     'cell-balance',
            nameAr: 'خلية توازن الحِمل',
            ayah:   'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا — البقرة:286',
        },
        plant: {
            id:     'ag-river',
            nameAr: 'خلية الأنهار',
            ayah:   'وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَّكُمْ — البقرة:22',
        },
        bridge: 'توازن الحِمل في الإنسان كالأنهار في النبات — التوزيع العادل والتدفق المستمر',
    },
];

// ─── الحالة الداخلية ──────────────────────────────────────────────────────────

let _ready      = false;
let _startedAt  = null;
let _pulseCount = 0;

// ─── تهيئة المحرك ────────────────────────────────────────────────────────────

/**
 * تهيئة محرك التكامل بين التشبيهين
 */
function init() {
    if (_ready) return status();

    if (neuralCells && typeof neuralCells.init === 'function') {
        try { neuralCells.init(); } catch (_) {}
    }
    if (agncn && typeof agncn.init === 'function') {
        try { agncn.init(); } catch (_) {}
    }

    _ready     = true;
    _startedAt = new Date().toISOString();

    console.info(
        '[DAIE] 🌟 محرك التكامل بين التشبيهين جاهز —',
        DUAL_MAP.length, 'بُعداً مزدوجاً — إنسان↔نبات'
    );

    return status();
}

// ─── الرنين المزدوج لبُعد واحد ───────────────────────────────────────────────

/**
 * حساب الرنين المزدوج لبُعد واحد
 * ψ_d = √(n² + a²) / √2  ∈ [0, 1]
 *
 * @param {number} d  — رقم البُعد (1-12)
 * @param {number} n  — تفعيل الخلية العصبية (البشرية)   ∈ [0,1]
 * @param {number} a  — تفعيل الخلية الزراعية (النباتية) ∈ [0,1]
 * @returns {object}  — مؤشرات الرنين لهذا البُعد
 */
function resonate(d, n = 0, a = 0) {
    const nn  = Math.max(0, Math.min(1, n));
    const aa  = Math.max(0, Math.min(1, a));
    const psi = Math.sqrt(nn * nn + aa * aa) / Math.sqrt(2);       // رنين مزدوج
    const gap = Math.abs(nn - aa);                                  // الفجوة
    const phi = Math.atan2(aa, nn) * (180 / Math.PI);              // زاوية التوجه (°)
    const dom = nn > aa ? 'neural' : aa > nn ? 'plant' : 'balanced'; // الغالب
    const pair = DUAL_MAP.find(p => p.dim === d);

    return {
        dim:       d,
        principle: pair ? pair.principle : `بُعد-${d}`,
        icon:      pair ? pair.icon      : '⚙️',
        neural:    parseFloat(nn.toFixed(4)),
        plant:     parseFloat(aa.toFixed(4)),
        psi:       parseFloat(psi.toFixed(4)),
        gap:       parseFloat(gap.toFixed(4)),
        phi:       parseFloat(phi.toFixed(2)),
        dominant:  dom,
    };
}

// ─── تكامل لحظة كاملة ────────────────────────────────────────────────────────

/**
 * تكامل لحظة التفعيل من كلا الشبكتين — الحساب المتكامل الكامل
 *
 * @param {object} snapshots — { neural: {cellId: activation, ...}, plant: {cellId: activation, ...} }
 * @returns {object} — نتيجة التكامل الكاملة
 */
function integrate(snapshots = {}) {
    if (!_ready) init();
    _pulseCount++;

    const neuralSnap = snapshots.neural || {};
    const plantSnap  = snapshots.plant  || {};

    // بناء خريطة الفعاليات من معرّفات الخلايا
    const nById = _buildActivationMap(neuralSnap, 'neural');
    const aById = _buildActivationMap(plantSnap,  'plant');

    // حساب الرنين لكل بُعد من الاثنا عشر
    const dimensions = DUAL_MAP.map(pair => {
        const n = nById[pair.neural.id] || 0;
        const a = aById[pair.plant.id]  || 0;
        return resonate(pair.dim, n, a);
    });

    // ─── الحسابات الكلية (الأصل الهندسي) ────────────────────────────────────

    const sumPsi    = dimensions.reduce((s, d) => s + d.psi,    0);
    const sumGap    = dimensions.reduce((s, d) => s + d.gap,    0);
    const sumNeural = dimensions.reduce((s, d) => s + d.neural, 0);
    const sumPlant  = dimensions.reduce((s, d) => s + d.plant,  0);

    // Ω — الصحة الكلية (0→1): متوسط الرنين المزدوج
    const omega = parseFloat((sumPsi / DUAL_MAP.length).toFixed(4));

    // coh — التوافق بين التشبيهين (0→1): 1 - متوسط الفجوات
    const coherence = parseFloat((1 - sumGap / DUAL_MAP.length).toFixed(4));

    // ||V|| — حجم متجه التكامل في الفضاء 12D
    const vectorMagnitude = parseFloat(
        Math.sqrt(dimensions.reduce((s, d) => s + d.psi * d.psi, 0)).toFixed(4)
    );

    // θ — زاوية الميل الكلية: نحو الإنسان أم النبات؟ (°)
    const thetaDeg = parseFloat(
        (Math.atan2(sumPlant, sumNeural) * (180 / Math.PI)).toFixed(2)
    );

    // التشبيه الغالب على مستوى المنظومة
    const systemDominant = sumNeural > sumPlant + 0.05 ? 'neural'
                         : sumPlant > sumNeural + 0.05 ? 'plant'
                         : 'balanced';

    // الأبعاد الأقوى رنيناً
    const topDims = [...dimensions]
        .sort((a, b) => b.psi - a.psi)
        .slice(0, 3)
        .map(d => ({ dim: d.dim, principle: d.principle, icon: d.icon, psi: d.psi }));

    // الأبعاد الأعلى فجوة (تحتاج توازناً)
    const gapDims = [...dimensions]
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3)
        .map(d => ({
            dim: d.dim, principle: d.principle, icon: d.icon, gap: d.gap, dominant: d.dominant,
        }));

    // تصنيف الحالة الكلية
    const systemState = _classifyState(omega, coherence, thetaDeg);

    return {
        integratedAt:    new Date().toISOString(),
        pulseCount:      _pulseCount,

        // المؤشرات الهندسية الكلية
        calculus: {
            omega,
            coherence,
            vectorMagnitude,
            thetaDeg,
            systemDominant,
            systemState: systemState.label,
            systemStateAr: systemState.labelAr,
            description: systemState.description,
        },

        // تفاصيل الاثنا عشر بُعداً
        dimensions,

        // ملخص التحليل
        analysis: {
            topResonantDimensions: topDims,
            highGapDimensions:     gapDims,
            balanceScore: parseFloat(((coherence * 0.5 + omega * 0.5) * 100).toFixed(1)),
        },

        // الأساس القرآني
        foundations: {
            neuralPrinciple: 'وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ — الذاريات:21',
            plantPrinciple:  'أَفَرَأَيْتُم مَّا تَحْرُثُونَ أَأَنتُمْ تَزْرَعُونَهُ — الواقعة:63',
            integration:     'وَمِنَ الْأَرْضِ مِثْلَهُنَّ — الطلاق:12',
            tools:           'جَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ — النحل:78',
        },
    };
}

/**
 * تصنيف الحالة الكلية للمنظومة بناءً على المؤشرات الهندسية
 */
function _classifyState(omega, coherence, thetaDeg) {
    if (omega < 0.2) {
        return { label: 'dormant',   labelAr: 'خاملة',      description: 'المنظومة في سبات — تحتاج إطلاقاً' };
    }
    if (omega < 0.4) {
        return { label: 'awakening', labelAr: 'صاحية',      description: 'بدأ النشاط — يحتاج تغذية وتنشيطاً' };
    }
    if (coherence < 0.4) {
        return { label: 'unbalanced', labelAr: 'غير متوازنة', description: 'فجوة كبيرة بين التشبيهين — يحتاج معايرة' };
    }
    if (thetaDeg < 30) {
        return { label: 'neural-heavy', labelAr: 'مائلة للإنسان', description: 'التشبيه البشري غالب — ادمج البُعد النباتي' };
    }
    if (thetaDeg > 60) {
        return { label: 'plant-heavy',  labelAr: 'مائلة للنبات',  description: 'التشبيه النباتي غالب — ادمج البُعد البشري' };
    }
    if (omega >= 0.7 && coherence >= 0.7) {
        return { label: 'integrated',   labelAr: 'متكاملة',     description: 'تكامل ممتاز بين التشبيهين — الزاوية المثلى 45°' };
    }
    return { label: 'active',     labelAr: 'نشطة',        description: 'المنظومة نشطة — استمر في التطوير' };
}

/**
 * بناء خريطة التفعيل (معرّف → قيمة) من مصدر البيانات
 */
function _buildActivationMap(source, type) {
    const map = {};
    if (typeof source !== 'object' || !source) return map;

    // إذا جاءت كمصفوفة {id, activation}[]
    if (Array.isArray(source)) {
        for (const item of source) {
            if (item && item.id) map[item.id] = parseFloat(item.activation || 0);
        }
        return map;
    }

    // إذا جاءت كـ {cellId: activation}
    for (const [key, val] of Object.entries(source)) {
        map[key] = parseFloat(val || 0);
    }
    return map;
}

// ─── نبضة المنظومة الحية ─────────────────────────────────────────────────────

/**
 * نبضة حية: تقرأ حالة كلا الشبكتين الآن وتُكاملهما
 */
function pulse() {
    if (!_ready) init();

    // قراءة حالة الشبكة العصبية (البشرية)
    let neuralSnap = {};
    if (neuralCells) {
        try {
            const ns = neuralCells.status();
            if (ns && ns.cells) {
                for (const c of ns.cells) {
                    neuralSnap[c.id] = parseFloat(c.activation || 0);
                }
            }
        } catch (_) {}
    }

    // قراءة حالة الشبكة الزراعية (النباتية)
    let plantSnap = {};
    if (agncn) {
        try {
            const as = agncn.status();
            if (as && as.cells) {
                for (const c of as.cells) {
                    plantSnap[c.id] = parseFloat(c.activation || 0);
                }
            }
        } catch (_) {}
    }

    return integrate({ neural: neuralSnap, plant: plantSnap });
}

// ─── الخريطة الثنائية ────────────────────────────────────────────────────────

/**
 * إرجاع خريطة الاثنا عشر أزواج مع معلوماتها الكاملة
 */
function getDualMap() {
    return DUAL_MAP.map(pair => ({
        ...pair,
        formula: `ψ_${pair.dim} = √(n_${pair.dim}² + a_${pair.dim}²) / √2`,
    }));
}

// ─── حالة المحرك ─────────────────────────────────────────────────────────────

function status() {
    return {
        engine:    'DAIE — Dual-Analogy Integration Engine',
        nameAr:    'محرك التكامل بين التشبيهين',
        version:   '1.0.0',
        ready:     _ready,
        startedAt: _startedAt,
        pulseCount: _pulseCount,
        dualDimensions: DUAL_MAP.length,
        networksLoaded: {
            neural: !!neuralCells,
            plant:  !!agncn,
        },
        geometricFoundation: {
            dimensions:   12,
            axes:         24,
            spaceType:    'Dual 12D Isomorphic Space',
            balancePoint: '45° — تكامل مثالي بين التشبيهين',
        },
        calculus: {
            omega:          'Ω = (1/12) × Σ ψ_d    — الصحة الكلية',
            coherence:      'coh = 1 - (1/12) × Σ Δ_d — التوافق',
            vectorMagnitude:'||V|| = √(Σ ψ_d²)      — حجم متجه التكامل',
            theta:          'θ = atan2(Σa, Σn) × 180/π — زاوية الميل',
            resonance:      'ψ_d = √(n² + a²) / √2   — رنين البُعد',
        },
        foundations: {
            neural:  'وَفِي أَنفُسِكُمْ ۚ أَفَلَا تُبْصِرُونَ — الذاريات:21',
            plant:   'أَفَرَأَيْتُم مَّا تَحْرُثُونَ — الواقعة:63',
            unity:   'وَمِنَ الْأَرْضِ مِثْلَهُنَّ — الطلاق:12',
        },
    };
}

// ─── تهيئة تلقائية ───────────────────────────────────────────────────────────

init();

// ─── تصدير الوحدة ────────────────────────────────────────────────────────────

module.exports = {
    init,
    status,
    resonate,
    integrate,
    pulse,
    getDualMap,
    DUAL_MAP,
};
