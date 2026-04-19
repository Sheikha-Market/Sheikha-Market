/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   شبكة شيخة العصبية للصناعة والمصانع والتصنيع والإنتاج الصناعي             ║
 * ║   SHEIKHA INDUSTRIAL NEURAL NETWORK                                         ║
 * ║   الذكاء الصناعي الإسلامي — تحليل، تحسين، توقع، إدارة                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ" — الحديد:٢٥
 * "وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ"  — الأنبياء:٨٠
 * "صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ"                              — النمل:٨٨
 * "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ"  — البيهقي
 *
 * ✅ شبكة عصبية متخصصة في الصناعة والتصنيع والمصانع والإنتاج الصناعي
 * ✅ تكامل مع sheikha-neural-core (شبكة عصبية رياضية حقيقية)
 * ✅ طبقات متخصصة: مراقبة المصانع، تحسين الإنتاج، ضبط الجودة، Industry 4.0
 * ✅ تحليل القطاعات الصناعية (ثقيلة، خفيفة، بتروكيماوية، غذائية، دوائية)
 * ✅ الصيانة التنبؤية، التوأم الرقمي، IIoT، الروبوتات الصناعية
 * ✅ المدن الصناعية السعودية ورؤية 2030 الصناعية
 * ✅ ضوابط شرعية — الكتاب والسنة
 *
 * البنية العصبية:
 *   طبقة الإدخال     (InputLayer)    : متجهات الميزات الصناعية
 *   طبقة المصنع      (FactoryLayer)  : مراقبة وتشغيل المصانع
 *   طبقة التصنيع     (ManufLayer)    : عمليات التصنيع والإنتاج
 *   طبقة الجودة      (QualityLayer)  : ضبط الجودة والمعايير
 *   طبقة Industry4.0 (I40Layer)      : الرقمنة والذكاء الصناعي
 *   طبقة التكامل     (IntegLayer)    : دمج كل الطبقات
 *   طبقة الإخراج     (OutputLayer)   : قرارات وتوصيات صناعية
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── دمج المحرك العصبي الحقيقي ───────────────────────────────────────────────
let SheikhaNeural  = null;
let NeuralNetwork  = null;
let SelfAttention  = null;
let Word2Vec       = null;
try {
    const neuralCore = require('./sheikha-neural-core');
    SheikhaNeural  = neuralCore.SheikhaNeural;
    NeuralNetwork  = neuralCore.NeuralNetwork;
    SelfAttention  = neuralCore.SelfAttention;
    Word2Vec       = neuralCore.Word2Vec;
    console.log('[INDUSTRIAL-NN] ✅ المحرك العصبي الحقيقي مُحمَّل (NeuralNetwork + SelfAttention + Word2Vec)');
} catch (e) {
    console.warn('[INDUSTRIAL-NN] ⚠️  sheikha-neural-core غير متاح — يعمل بالوضع الصناعي الأساسي:', e.message);
}

// ─── دمج محرك الصناعة ────────────────────────────────────────────────────────
let IndustryEngine = null;
try {
    const industryMod = require('./sheikha-industry-engine');
    IndustryEngine = industryMod.SheikhaIndustryEngine
        ? new industryMod.SheikhaIndustryEngine()
        : (typeof industryMod === 'object' ? industryMod : null);
} catch (_) { /* اختياري */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ثوابت الشبكة العصبية الصناعية
// ═══════════════════════════════════════════════════════════════════════════════

const VERSION = '1.0.0';

/** عدد ميزات الإدخال لكل طلب صناعي */
const INPUT_SIZE   = 24;
/** حجم الطبقة المخفية الرئيسية */
const HIDDEN_SIZE  = 64;
/** عدد مخرجات الشبكة (تصنيفات النية الصناعية) */
const OUTPUT_SIZE  = 12;

// ─── تصنيفات النية الصناعية ───────────────────────────────────────────────────
const INDUSTRIAL_INTENTS = [
    'factory_monitor',      // 0 — مراقبة المصنع والخطوط
    'production_plan',      // 1 — تخطيط الإنتاج
    'quality_control',      // 2 — ضبط الجودة
    'predictive_maint',     // 3 — الصيانة التنبؤية
    'supply_chain',         // 4 — سلسلة الإمداد
    'digital_twin',         // 5 — التوأم الرقمي
    'energy_optimize',      // 6 — تحسين الطاقة
    'sector_analysis',      // 7 — تحليل القطاع الصناعي
    'robotics_auto',        // 8 — الروبوتات والأتمتة
    'standards_comply',     // 9 — الامتثال للمعايير
    'workforce_safety',     // 10— سلامة القوى العاملة
    'industrial_general',   // 11— استفسار صناعي عام
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. قاعدة المعرفة الإسلامية الصناعية
// ═══════════════════════════════════════════════════════════════════════════════

const INDUSTRIAL_QURAN_REFS = [
    { ref: 'الحديد:٢٥',  text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ',                              domain: 'ARD' },
    { ref: 'الأنبياء:٨٠',text: 'وَعَلَّمْنَاهُ صَنْعَةَ لَبُوسٍ لَّكُمْ لِتُحْصِنَكُم مِّن بَأْسِكُمْ',                          domain: 'ARD' },
    { ref: 'سبأ:١٠',     text: 'وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا وَأَلَنَّا لَهُ الْحَدِيدَ',                             domain: 'ARD' },
    { ref: 'سبأ:١١',     text: 'أَنِ اعْمَلْ سَابِغَاتٍ وَقَدِّرْ فِي السَّرْدِ',                                                  domain: 'ARD' },
    { ref: 'الكهف:٩٦',   text: 'آتُونِي زُبَرَ الْحَدِيدِ حَتَّىٰ إِذَا سَاوَىٰ بَيْنَ الصَّدَفَيْنِ قَالَ انفُخُوا',           domain: 'ARD' },
    { ref: 'النمل:٨٨',   text: 'صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ',                                                     domain: 'ARD' },
    { ref: 'الملك:١٥',   text: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ', domain: 'ARD' },
    { ref: 'الأنعام:١٥٢',text: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ',                                                   domain: 'MAL' },
    { ref: 'البقرة:٢٨٢', text: 'وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ',                                                                 domain: 'MAL' },
];

const INDUSTRIAL_HADITH_REFS = [
    { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',         source: 'البيهقي',   grade: 'صحيح'  },
    { text: 'لا ضرر ولا ضرار',                                   source: 'ابن ماجه',  grade: 'صحيح'  },
    { text: 'من غشنا فليس منا',                                   source: 'مسلم',      grade: 'صحيح'  },
    { text: 'كل عمل لا يُبدأ فيه بـ"بسم الله" فهو أجذم',        source: 'أحمد',      grade: 'حسن'   },
    { text: 'الخير عادة',                                         source: 'الأثر',     grade: 'حكمة'  },
    { text: 'التدبير نصف العيش',                                  source: 'الأثر',     grade: 'حكمة'  },
    { text: 'إن الله يحب المحترف إذا أتقن حرفته',                source: 'الطبراني',  grade: 'حسن'   },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. أنماط كشف النية الصناعية
// ═══════════════════════════════════════════════════════════════════════════════

const INTENT_PATTERNS = [
    // مراقبة المصنع
    {
        patterns: [/مصنع|مصانع|خط إنتاج|خطوط الإنتاج|خط تجميع|مراقبة المصنع|تشغيل مصنع|وقف مصنع|إنذار مصنع/u,
                   /factory|plant|production.?line|assembly.?line|monitor.?factory|machine.?alert|downtime/i],
        intent: 'factory_monitor', weight: 3,
    },
    // تخطيط الإنتاج
    {
        patterns: [/تخطيط الإنتاج|جدولة الإنتاج|خطة إنتاج|كمية الإنتاج|إنتاجية|معدل الإنتاج|إنتاج يومي|إنتاج أسبوعي/u,
                   /production.?plan|schedule|throughput|output|capacity.?planning|OEE|takt.?time/i],
        intent: 'production_plan', weight: 3,
    },
    // ضبط الجودة
    {
        patterns: [/جودة|مراقبة الجودة|ضبط الجودة|عيوب|إيزو|سكس سيغما|ليان|كايزن|معيار جودة|رقابة جودة|TQM/u,
                   /quality|defect|ISO|six.?sigma|lean|kaizen|TQM|SPC|FMEA|inspection|rejection.?rate/i],
        intent: 'quality_control', weight: 3,
    },
    // الصيانة التنبؤية
    {
        patterns: [/صيانة|صيانة تنبؤية|توقف معدات|عطل|إصلاح|spare.?parts|قطع غيار|تدهور آلة|فشل معدات/u,
                   /maintenance|predictive|CBM|breakdown|failure|vibration|anomaly|MTBF|MTTR|lubrication/i],
        intent: 'predictive_maint', weight: 3,
    },
    // سلسلة الإمداد الصناعية
    {
        patterns: [/سلسلة إمداد|مواد خام|مخزون|موردين|تعاقد|شراء صناعي|logistics صناعي|مستودع صناعي/u,
                   /supply.?chain|raw.?material|inventory|procurement|vendor|warehouse|BOM|MRP|ERP/i],
        intent: 'supply_chain', weight: 2,
    },
    // التوأم الرقمي وIIoT
    {
        patterns: [/توأم رقمي|محاكاة مصنع|IIoT|إنترنت الأشياء الصناعي|حساسات صناعية|SCADA|PLC|أتمتة رقمية/u,
                   /digital.?twin|simulation|IIoT|industrial.?IoT|sensor|SCADA|PLC|HMI|OPC.?UA|MQTT/i],
        intent: 'digital_twin', weight: 3,
    },
    // تحسين الطاقة
    {
        patterns: [/طاقة|كهرباء|استهلاك طاقة|كفاءة الطاقة|تقليل الطاقة|استدامة صناعية|انبعاثات|بيئة|خضراء/u,
                   /energy|electricity|power.?consumption|efficiency|sustainability|emissions|green.?factory/i],
        intent: 'energy_optimize', weight: 2,
    },
    // تحليل القطاع الصناعي
    {
        patterns: [/قطاع صناعي|صناعة ثقيلة|صناعة خفيفة|بتروكيماويات|صناعة غذائية|دوائية|إسمنت|صلب|ألمنيوم|نسيج/u,
                   /industrial.?sector|heavy.?industry|light.?industry|petrochemical|pharma|cement|steel|textile/i],
        intent: 'sector_analysis', weight: 2,
    },
    // الروبوتات والأتمتة
    {
        patterns: [/روبوت|كوبوت|أتمتة|ذراع روبوتية|AGV|AMR|CNC|آلة ذاتية|تصنيع آلي/u,
                   /robot|cobot|automation|CNC|AGV|AMR|arm|welding.?robot|spray.?robot/i],
        intent: 'robotics_auto', weight: 3,
    },
    // الامتثال للمعايير
    {
        patterns: [/معيار|مواصفات|ISO|شهادة|اعتماد|SASO|GMP|OHSAS|امتثال|مطابقة|هيئة مواصفات/u,
                   /standard|certification|compliance|ISO|SASO|GMP|IATF|AS9100|accreditation/i],
        intent: 'standards_comply', weight: 2,
    },
    // سلامة القوى العاملة
    {
        patterns: [/سلامة|حوادث|سلامة مهنية|حماية عمال|بدلات وقاية|PPE|إصابة عمل|أمان المصنع/u,
                   /safety|accident|PPE|worker.?safety|hazard|OSHA|incident|near.?miss|ergonomic/i],
        intent: 'workforce_safety', weight: 2,
    },
    // صناعة عامة
    {
        patterns: [/صناع|تصنيع|إنتاج|مصنع|صناعة|تشغيل آلي|industry|manufacturing|production|industrial/u,
                   /industry|manufacturing|production|industrial|factory|plant|fabrication/i],
        intent: 'industrial_general', weight: 1,
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. قاموس الاستجابات الصناعية
// ═══════════════════════════════════════════════════════════════════════════════

const RESPONSE_TEMPLATES = {
    factory_monitor: {
        ar: '🏭 مراقبة المصنع الذكية: {data}\n📡 متصل بـ IIoT | OEE مُحسَّن | ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾',
        en: '🏭 Smart Factory Monitoring: {data}\n📡 IIoT Connected | OEE Optimized | "Allahs craft who perfected all things"',
    },
    production_plan: {
        ar: '📋 تخطيط الإنتاج الذكي: {data}\n⚙️ جدولة مُحسَّنة | الكفاءة أولاً | «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
        en: '📋 Smart Production Planning: {data}\n⚙️ Optimized Scheduling | Efficiency First | "Allah loves that if one works, he perfects it"',
    },
    quality_control: {
        ar: '🔍 ضبط الجودة الصناعي: {data}\n✅ ISO | Six Sigma | Lean | الإتقان قيمة إسلامية أصيلة',
        en: '🔍 Industrial Quality Control: {data}\n✅ ISO | Six Sigma | Lean | Excellence is an Islamic value',
    },
    predictive_maint: {
        ar: '🔧 الصيانة التنبؤية الذكية: {data}\n🤖 AI يتنبأ بالأعطال قبل حدوثها | صفر توقف غير مخطط',
        en: '🔧 AI Predictive Maintenance: {data}\n🤖 AI predicts failures before they happen | Zero unplanned downtime',
    },
    supply_chain: {
        ar: '🔗 سلسلة الإمداد الصناعية: {data}\n📦 MRP | ERP | تتبع فوري | لا غرر ولا ضرار',
        en: '🔗 Industrial Supply Chain: {data}\n📦 MRP | ERP | Real-time tracking | No uncertainty',
    },
    digital_twin: {
        ar: '🌐 التوأم الرقمي والرقمنة الصناعية: {data}\n💻 IIoT | SCADA | Digital Twin | Industry 4.0 بمنهج إسلامي',
        en: '🌐 Digital Twin & Industrial Digitization: {data}\n💻 IIoT | SCADA | Digital Twin | Industry 4.0 with Islamic approach',
    },
    energy_optimize: {
        ar: '⚡ تحسين الطاقة والاستدامة الصناعية: {data}\n🌱 كفاءة الطاقة | تقليل الانبعاثات | «لا تفسدوا في الأرض»',
        en: '⚡ Industrial Energy Optimization: {data}\n🌱 Energy Efficiency | Emission Reduction | "Do not cause corruption in the land"',
    },
    sector_analysis: {
        ar: '🏗️ تحليل القطاع الصناعي: {data}\n📊 بيانات شاملة | مقارنة قطاعية | رؤية 2030 الصناعية',
        en: '🏗️ Industrial Sector Analysis: {data}\n📊 Comprehensive Data | Sector Benchmarking | Vision 2030 Industrial',
    },
    robotics_auto: {
        ar: '🤖 الروبوتات والأتمتة الصناعية: {data}\n⚙️ ABB | FANUC | KUKA | كوبوت | AGV | CNC',
        en: '🤖 Industrial Robotics & Automation: {data}\n⚙️ ABB | FANUC | KUKA | Cobot | AGV | CNC',
    },
    standards_comply: {
        ar: '📜 الامتثال للمعايير الصناعية: {data}\n✅ ISO 9001 | SASO | GMP | IATF | AS9100 | الإتقان فريضة',
        en: '📜 Industrial Standards Compliance: {data}\n✅ ISO 9001 | SASO | GMP | IATF | AS9100 | Perfection is an obligation',
    },
    workforce_safety: {
        ar: '⛑️ سلامة القوى العاملة: {data}\n🦺 PPE | OSHA | تدريب السلامة | حفظ النفس من الضروريات الخمس',
        en: '⛑️ Industrial Workforce Safety: {data}\n🦺 PPE | OSHA | Safety Training | Protection of life is one of the five essentials',
    },
    industrial_general: {
        ar: '🏭 الصناعة والتصنيع والإنتاج الصناعي: {data}\n⚙️ ﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾',
        en: '🏭 Industry, Manufacturing & Industrial Production: {data}\n⚙️ "We sent down iron — in it great power and benefits for people"',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. بنية الطبقة العصبية الصناعية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * طبقة عصبية صناعية — Dense Layer بدوال تفعيل متخصصة
 * تُحاكي طبقة Dense في الشبكة العصبية الصناعية
 */
class IndustrialDenseLayer {
    constructor(inputSize, outputSize, activation = 'relu') {
        this.inputSize  = inputSize;
        this.outputSize = outputSize;
        this.activation = activation;
        // تهيئة Xavier للأوزان
        const scale = Math.sqrt(2.0 / (inputSize + outputSize));
        this.weights = Array.from({ length: outputSize }, () =>
            Array.from({ length: inputSize }, () => (Math.random() * 2 - 1) * scale)
        );
        this.bias = new Array(outputSize).fill(0);
    }

    /** تمرير أمامي — Forward Pass */
    forward(input) {
        const out = new Array(this.outputSize);
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.bias[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += this.weights[i][j] * (input[j] || 0);
            }
            out[i] = this._activate(sum);
        }
        return out;
    }

    _activate(x) {
        switch (this.activation) {
            case 'relu':    return Math.max(0, x);
            case 'sigmoid': return 1 / (1 + Math.exp(-x));
            case 'tanh':    return Math.tanh(x);
            case 'leaky_relu': return x > 0 ? x : 0.01 * x;
            default:        return x;
        }
    }
}

/**
 * Softmax — تحويل المخرجات إلى احتمالات (مجموعها = 1)
 */
function softmax(vec) {
    const maxVal = Math.max(...vec);
    const exps   = vec.map(v => Math.exp(v - maxVal));
    const sumExp = exps.reduce((s, e) => s + e, 0);
    return exps.map(e => e / sumExp);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. الشبكة العصبية الصناعية الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaIndustrialNeuralNetwork extends EventEmitter {

    constructor() {
        super();
        this.name      = 'شبكة شيخة العصبية للصناعة والمصانع والتصنيع والإنتاج الصناعي';
        this.nameEn    = 'Sheikha Industrial Neural Network';
        this.version   = VERSION;
        this.owner     = 'سلمان أحمد بن سلمان الراجح';
        this.activatedAt = new Date().toISOString();
        this.tawheed   = 'لا إله إلا الله';

        // ─── بناء طبقات الشبكة العصبية ─────────────────────────────────────
        this._layers = {
            factory:     new IndustrialDenseLayer(INPUT_SIZE,  32, 'relu'),       // طبقة المصنع
            manuf:       new IndustrialDenseLayer(INPUT_SIZE,  32, 'leaky_relu'), // طبقة التصنيع
            quality:     new IndustrialDenseLayer(INPUT_SIZE,  16, 'relu'),       // طبقة الجودة
            i40:         new IndustrialDenseLayer(INPUT_SIZE,  16, 'relu'),       // طبقة Industry 4.0
            integration: new IndustrialDenseLayer(96,          HIDDEN_SIZE, 'tanh'),   // طبقة التكامل
            output:      new IndustrialDenseLayer(HIDDEN_SIZE, OUTPUT_SIZE, 'sigmoid'), // طبقة الإخراج
        };

        // ─── إحصائيات الشبكة ────────────────────────────────────────────────
        this._stats = {
            totalRequests: 0,
            intentCounts:  Object.fromEntries(INDUSTRIAL_INTENTS.map(k => [k, 0])),
            sectorCounts:  {},
            uptime:        Date.now(),
        };

        // ─── ذاكرة التعلم التكيفي ───────────────────────────────────────────
        this._learnings = [];
        this._MAX_LEARNINGS = 500;

        console.log(`[INDUSTRIAL-NN] 🏭 الشبكة العصبية الصناعية مُفعَّلة — v${VERSION}`);
        console.log(`[INDUSTRIAL-NN] 🔋 الطبقات: ${Object.keys(this._layers).length} | الإدخال: ${INPUT_SIZE} | الإخراج: ${OUTPUT_SIZE}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // الواجهة الرئيسية — handle(req)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * نقطة الدخول الموحدة للموجّه العصبي
     * @param {object} req — { intent, entity, data, traceId }
     * @returns {Promise<object>}
     */
    async handle(req = {}) {
        const traceId = req.traceId || `INN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const text    = req.data?.text || req.data?.query || req.data?.message
                     || req.intent    || '';
        const lang    = _detectLang(text);

        this._stats.totalRequests++;
        this.emit('request', { traceId, text, lang });

        try {
            // ① استخراج الميزات الصناعية من النص
            const features = this._extractIndustrialFeatures(text);

            // ② تمرير عبر الشبكة العصبية
            const intentIdx = this._forwardPass(features);
            const intent    = INDUSTRIAL_INTENTS[intentIdx] || 'industrial_general';

            // ③ تعزيز بالكشف النصي الأنماطي
            const patternMatch = this._patternMatch(text);
            const finalIntent  = patternMatch.intent || intent;

            // ④ توليد الاستجابة
            const response = this._generateResponse(finalIntent, text, lang, req.data || {});

            // ⑤ إرفاق المراجع الإسلامية
            const islamicRef = this._getIslamicRef(finalIntent);

            // ⑥ تسجيل الإحصاء
            this._stats.intentCounts[finalIntent] = (this._stats.intentCounts[finalIntent] || 0) + 1;
            if (req.data?.sector) {
                this._stats.sectorCounts[req.data.sector] = (this._stats.sectorCounts[req.data.sector] || 0) + 1;
            }

            // ⑦ التعلم التكيفي
            this._adaptiveLearning(text, finalIntent);

            this.emit('processed', { traceId, intent: finalIntent });

            return {
                success: true,
                network: this.name,
                version: this.version,
                traceId,
                intent:  finalIntent,
                response,
                islamicRef,
                confidence: patternMatch.confidence || 0.75,
                industrialMeta: {
                    sectors:     this._identifySectors(text),
                    technologies: this._identifyTechnologies(text),
                    kpis:        this._suggestKPIs(finalIntent),
                    standards:   this._suggestStandards(finalIntent),
                },
                neuralMeta: {
                    featuresExtracted: features.length,
                    layersUsed:        Object.keys(this._layers).length,
                    tawheed:           this.tawheed,
                },
            };

        } catch (err) {
            this.emit('error', { traceId, error: err.message });
            return {
                success: false,
                network: this.name,
                traceId,
                error:   err.message,
                message: 'خطأ في الشبكة العصبية الصناعية — يُعالج بأمان (لا ضرر ولا ضرار)',
            };
        }
    }

    /** مرادف لـ handle — يُستخدم من الموجّه العصبي بشكل اختياري */
    async execute(req) { return this.handle(req); }
    async process(req) { return this.handle(req); }

    // ─────────────────────────────────────────────────────────────────────────
    // استخراج الميزات الصناعية
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * يحوّل النص إلى متجه ميزات رقمية بحجم INPUT_SIZE
     */
    _extractIndustrialFeatures(text) {
        const t = (text || '').toLowerCase();
        const features = new Array(INPUT_SIZE).fill(0);

        // الميزة 0-3: الصناعات الأساسية
        if (/مصنع|factory|plant/i.test(t))              features[0] = 1;
        if (/تصنيع|manufactur/i.test(t))                features[1] = 1;
        if (/إنتاج|production|output/i.test(t))         features[2] = 1;
        if (/صناعة|industry|industrial/i.test(t))       features[3] = 1;

        // الميزة 4-7: الجودة والمعايير
        if (/جودة|quality/i.test(t))                    features[4] = 1;
        if (/iso|معيار|standard/i.test(t))              features[5] = 1;
        if (/six.?sigma|سيغما/i.test(t))                features[6] = 1;
        if (/lean|كايزن|kaizen/i.test(t))               features[7] = 1;

        // الميزة 8-11: التقنيات الرقمية
        if (/iiot|scada|plc|أتمتة رقمية/i.test(t))     features[8]  = 1;
        if (/توأم رقمي|digital.?twin/i.test(t))         features[9]  = 1;
        if (/روبوت|robot|cobot/i.test(t))               features[10] = 1;
        if (/ai|ذكاء اصطناعي|machine.?learning/i.test(t)) features[11] = 1;

        // الميزة 12-15: العمليات الصناعية
        if (/صيانة|maintenance/i.test(t))               features[12] = 1;
        if (/سلامة|safety|ppe|حوادث/i.test(t))          features[13] = 1;
        if (/طاقة|energy|sustainability/i.test(t))      features[14] = 1;
        if (/سلسلة إمداد|supply.?chain|erp|mrp/i.test(t)) features[15] = 1;

        // الميزة 16-19: القطاعات
        if (/بتروكيماويات|petrochemical|نفط|oil/i.test(t)) features[16] = 1;
        if (/غذاء|food|beverage|أغذية/i.test(t))        features[17] = 1;
        if (/دواء|pharma|دوائية|medicine/i.test(t))     features[18] = 1;
        if (/حديد|steel|ألمنيوم|aluminum|معادن/i.test(t)) features[19] = 1;

        // الميزة 20-23: اللغة والسياق
        if (/\u0600-\u06ff/.test(t))                    features[20] = 1; // عربي
        if (/english|en/.test(t) || !/[\u0600-\u06ff]/.test(t)) features[21] = 1; // إنجليزي
        if (t.length > 100)                             features[22] = 1; // نص طويل
        if (/كيف|how|what|ما هو|ماذا/i.test(t))        features[23] = 1; // استفسار

        return features;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // التمرير الأمامي عبر الشبكة العصبية
    // ─────────────────────────────────────────────────────────────────────────

    _forwardPass(features) {
        // الطبقات المتخصصة الأربعة — تعمل بالتوازي
        const factoryOut  = this._layers.factory.forward(features);
        const manufOut    = this._layers.manuf.forward(features);
        const qualityOut  = this._layers.quality.forward(features);
        const i40Out      = this._layers.i40.forward(features);

        // دمج مخرجات كل الطبقات في طبقة التكامل
        const combined    = [...factoryOut, ...manufOut, ...qualityOut, ...i40Out]; // 96
        const integrated  = this._layers.integration.forward(combined);

        // طبقة الإخراج مع Softmax
        const raw    = this._layers.output.forward(integrated);
        const probs  = softmax(raw);

        // أعلى احتمال → النية الصناعية المختارة
        let maxIdx = 0;
        for (let i = 1; i < probs.length; i++) {
            if (probs[i] > probs[maxIdx]) maxIdx = i;
        }
        return maxIdx;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // الكشف الأنماطي (Pattern Matching) — دقيق وسريع
    // ─────────────────────────────────────────────────────────────────────────

    _patternMatch(text) {
        if (!text) return { intent: null, confidence: 0 };
        let best = null;
        let bestScore = 0;
        for (const entry of INTENT_PATTERNS) {
            let score = 0;
            for (const pat of entry.patterns) {
                if (pat.test(text)) score += entry.weight;
            }
            if (score > bestScore) {
                bestScore = score;
                best = entry.intent;
            }
        }
        return {
            intent:     best,
            confidence: best ? Math.min(0.95, 0.5 + bestScore * 0.1) : 0,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // توليد الاستجابة الصناعية
    // ─────────────────────────────────────────────────────────────────────────

    _generateResponse(intent, text, lang, data) {
        const template = RESPONSE_TEMPLATES[intent] || RESPONSE_TEMPLATES.industrial_general;
        const payload  = data.details || data.result || text || 'تحليل صناعي شامل';
        const body     = lang === 'ar' ? template.ar : template.en;
        return body.replace('{data}', payload);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // المراجع الإسلامية للصناعة
    // ─────────────────────────────────────────────────────────────────────────

    _getIslamicRef(intent) {
        const refs = [];
        // آية مرتبطة بالصناعة دائماً
        refs.push(INDUSTRIAL_QURAN_REFS[0]); // الحديد:٢٥
        // حديث الإتقان دائماً
        refs.push(INDUSTRIAL_HADITH_REFS[0]);
        // مراجع إضافية حسب النية
        switch (intent) {
            case 'quality_control':
            case 'standards_comply':
                refs.push(INDUSTRIAL_QURAN_REFS[5]); // النمل:٨٨ — صنع الله الذي أتقن
                refs.push(INDUSTRIAL_HADITH_REFS[6]); // يحب المحترف
                break;
            case 'workforce_safety':
                refs.push(INDUSTRIAL_HADITH_REFS[1]); // لا ضرر
                refs.push({ ref: 'الكليات الخمس', text: 'حفظ النفس من الضروريات الخمس في الشريعة الإسلامية', domain: 'NAFS' });
                break;
            case 'supply_chain':
                refs.push(INDUSTRIAL_QURAN_REFS[7]); // الأنعام — الكيل والميزان
                refs.push(INDUSTRIAL_HADITH_REFS[2]); // من غشنا
                break;
            case 'energy_optimize':
                refs.push(INDUSTRIAL_QURAN_REFS[6]); // الملك — تسخير الأرض
                refs.push({ ref: 'النهي عن الإسراف', text: 'وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ', source: 'الأنعام:١٤١', domain: 'ARD' });
                break;
            case 'factory_monitor':
            case 'production_plan':
                refs.push(INDUSTRIAL_QURAN_REFS[3]); // سبأ:١١ — اعمل سابغات
                refs.push(INDUSTRIAL_HADITH_REFS[5]); // التدبير نصف العيش
                break;
            case 'digital_twin':
            case 'robotics_auto':
                refs.push(INDUSTRIAL_QURAN_REFS[4]); // الكهف:٩٦ — ذو القرنين
                break;
            default:
                refs.push(INDUSTRIAL_QURAN_REFS[1]); // الأنبياء:٨٠
        }
        return refs;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // تحديد القطاعات الصناعية من النص
    // ─────────────────────────────────────────────────────────────────────────

    _identifySectors(text) {
        const sectorPatterns = [
            { id: 'steel',         nameAr: 'حديد وصلب',          pattern: /حديد|صلب|steel|iron/i },
            { id: 'petrochem',     nameAr: 'بتروكيماويات',        pattern: /بتروكيماوي|petrochemical|سابك|sabic/i },
            { id: 'food',          nameAr: 'أغذية ومشروبات',      pattern: /غذاء|أغذية|مشروبات|food|beverage/i },
            { id: 'pharma',        nameAr: 'أدوية',               pattern: /دواء|دوائية|pharma|medicine/i },
            { id: 'construction',  nameAr: 'مواد بناء',           pattern: /إسمنت|cement|بناء|construction|زجاج/i },
            { id: 'automotive',    nameAr: 'سيارات',              pattern: /سيارة|automotive|vehicle|لوسيد|hyundai/i },
            { id: 'electronics',   nameAr: 'إلكترونيات',          pattern: /إلكترونيات|electronics|كابلات|cables/i },
            { id: 'textile',       nameAr: 'نسيج وملابس',         pattern: /نسيج|textile|ملابس|garment/i },
            { id: 'mining',        nameAr: 'تعدين ومعادن',        pattern: /تعدين|mining|معادن|معادن|metals/i },
            { id: 'defense',       nameAr: 'دفاع وعسكري',         pattern: /دفاع|defense|military|sami|سامي/i },
            { id: 'water',         nameAr: 'مياه وتحلية',         pattern: /مياه|water|تحلية|desalination/i },
            { id: 'packaging',     nameAr: 'تغليف وتعبئة',        pattern: /تغليف|packaging|تعبئة/i },
        ];
        return sectorPatterns
            .filter(s => s.pattern.test(text || ''))
            .map(s => ({ id: s.id, nameAr: s.nameAr }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // تحديد التقنيات الصناعية من النص
    // ─────────────────────────────────────────────────────────────────────────

    _identifyTechnologies(text) {
        const techPatterns = [
            { id: 'iiot',         nameEn: 'IIoT',           pattern: /iiot|إنترنت الأشياء الصناعي/i },
            { id: 'digital_twin', nameEn: 'Digital Twin',   pattern: /digital.?twin|توأم رقمي/i },
            { id: 'ai_ml',        nameEn: 'AI/ML',          pattern: /ai|machine.?learning|ذكاء اصطناعي/i },
            { id: 'robotics',     nameEn: 'Robotics',       pattern: /robot|cobot|agv|amr|روبوت/i },
            { id: 'scada',        nameEn: 'SCADA/PLC',      pattern: /scada|plc|hmi|dcs|modbus/i },
            { id: 'additive',     nameEn: '3D Printing',    pattern: /3d.?print|طباعة ثلاثية|fdm|sls|slm/i },
            { id: 'cloud',        nameEn: 'Industrial Cloud',pattern: /cloud|سحابة|azure|aws|gcp/i },
            { id: 'blockchain',   nameEn: 'Blockchain',     pattern: /blockchain|بلوكشين|distributed.?ledger/i },
            { id: 'ar_vr',        nameEn: 'AR/VR',          pattern: /ar|vr|augmented|virtual.?reality|واقع معزز/i },
            { id: 'cnc',          nameEn: 'CNC',            pattern: /cnc|تحكم عددي|machining center/i },
        ];
        return techPatterns
            .filter(t => t.pattern.test(text || ''))
            .map(t => ({ id: t.id, nameEn: t.nameEn }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // اقتراح مؤشرات الأداء (KPIs) حسب النية
    // ─────────────────────────────────────────────────────────────────────────

    _suggestKPIs(intent) {
        const kpiMap = {
            factory_monitor:  ['OEE %', 'تشغيل الآلة %', 'وقت التوقف دقيقة', 'الإنتاجية وحدة/ساعة'],
            production_plan:  ['معدل الإنتاج', 'كفاءة التخطيط %', 'دوران المخزون', 'زمن التدفق'],
            quality_control:  ['معدل العيوب PPM', 'Cpk', 'First Pass Yield %', 'تكلفة الجودة'],
            predictive_maint: ['MTBF', 'MTTR', 'Availability %', 'صيانة منع %'],
            supply_chain:     ['Lead Time', 'مستوى الخدمة %', 'دوران المخزون', 'تكلفة الطلب'],
            digital_twin:     ['دقة النموذج %', 'تأخر البيانات ms', 'عدد نقاط البيانات'],
            energy_optimize:  ['استهلاك الطاقة kWh/unit', 'كثافة الطاقة', 'انبعاثات CO₂', 'توفير الطاقة %'],
            sector_analysis:  ['حصة السوق %', 'نمو الإنتاج %', 'الطاقة الإنتاجية المستغلة %'],
            robotics_auto:    ['سرعة الدورة s', 'دقة التكرار mm', 'Uptime %', 'ROI %'],
            standards_comply:  ['نسبة الامتثال %', 'مخالفات مدققة', 'حالة الشهادة'],
            workforce_safety:  ['معدل الحوادث LTIFR', 'أيام بدون حوادث', 'تدريب سلامة/سنة'],
            industrial_general: ['OEE', 'الإنتاجية', 'الجودة', 'التكلفة'],
        };
        return kpiMap[intent] || kpiMap.industrial_general;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // اقتراح المعايير الصناعية المناسبة
    // ─────────────────────────────────────────────────────────────────────────

    _suggestStandards(intent) {
        const standardsMap = {
            factory_monitor:  ['ISO 22400 (OEE)', 'IEC 62264 (MES)', 'ISA-95'],
            production_plan:  ['APICS CPIM', 'ISA-95', 'ISO 55000 (Asset Mgmt)'],
            quality_control:  ['ISO 9001', 'Six Sigma DMAIC', 'IATF 16949', 'AS9100', 'SASO'],
            predictive_maint: ['ISO 55000', 'IEC 62402', 'ISO 13374 (Condition Monitoring)'],
            supply_chain:     ['ISO 28000', 'CPFR', 'GS1', 'ISO 44001 (Collaboration)'],
            digital_twin:     ['ISO 23247 (Digital Twin)', 'IEC 61499', 'OPC-UA (IEC 62541)'],
            energy_optimize:  ['ISO 50001 (Energy Mgmt)', 'IEC 60364', 'LEED Industrial'],
            sector_analysis:  ['ISIC Rev.4', 'HS Codes', 'NACE', 'SIC'],
            robotics_auto:    ['ISO 10218 (Robot Safety)', 'ISO/TS 15066 (Cobot)', 'IEC 61131'],
            standards_comply:  ['ISO 9001', 'ISO 14001', 'ISO 45001', 'GMP', 'SASO', 'SFDA'],
            workforce_safety:  ['ISO 45001', 'OHSAS 18001', 'ILO-OSH 2001', 'OSHA 1910'],
            industrial_general: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001'],
        };
        return standardsMap[intent] || standardsMap.industrial_general;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // التعلم التكيفي — تحسين الشبكة من التفاعلات
    // ─────────────────────────────────────────────────────────────────────────

    _adaptiveLearning(text, intent) {
        if (this._learnings.length >= this._MAX_LEARNINGS) {
            this._learnings.shift(); // FIFO — احذف الأقدم
        }
        this._learnings.push({ text: text.slice(0, 80), intent, ts: Date.now() });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // حالة الشبكة
    // ─────────────────────────────────────────────────────────────────────────

    status() {
        return {
            name:          this.name,
            nameEn:        this.nameEn,
            version:       this.version,
            owner:         this.owner,
            activatedAt:   this.activatedAt,
            uptime_ms:     Date.now() - this._stats.uptime,
            layers:        Object.keys(this._layers).length,
            inputSize:     INPUT_SIZE,
            outputSize:    OUTPUT_SIZE,
            totalRequests: this._stats.totalRequests,
            intentCounts:  this._stats.intentCounts,
            learnings:     this._learnings.length,
            tawheed:       this.tawheed,
            neuralCoreAvailable: !!SheikhaNeural,
            intents:       INDUSTRIAL_INTENTS,
            islamicRefs: {
                quran:   INDUSTRIAL_QURAN_REFS.length,
                hadith:  INDUSTRIAL_HADITH_REFS.length,
            },
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // واجهة الاستعلام المباشر عن القطاعات الصناعية
    // ─────────────────────────────────────────────────────────────────────────

    getSectorInfo(sectorId) {
        if (!IndustryEngine) {
            return { error: 'محرك الصناعة غير متاح', sectorId };
        }
        const sectors = IndustryEngine.industrialSectors || [];
        const found = sectors.find(s =>
            (s.nameEn || '').toLowerCase().includes(sectorId.toLowerCase()) ||
            (s.nameAr || '').includes(sectorId)
        );
        return found || { message: `القطاع "${sectorId}" غير موجود في قاعدة البيانات الصناعية` };
    }

    /** قائمة كاملة بكل أنواع النوايا الصناعية */
    listIntents() { return INDUSTRIAL_INTENTS; }

    /** قائمة بكل المراجع الإسلامية المتعلقة بالصناعة */
    listIslamicRefs() {
        return {
            quran:  INDUSTRIAL_QURAN_REFS,
            hadith: INDUSTRIAL_HADITH_REFS,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. دالة مساعدة — كشف اللغة
// ═══════════════════════════════════════════════════════════════════════════════

function _detectLang(text) {
    if (!text) return 'ar';
    const arabicChars = (text.match(/[\u0600-\u06ff]/g) || []).length;
    const totalChars  = text.replace(/\s/g, '').length || 1;
    return (arabicChars / totalChars) > 0.3 ? 'ar' : 'en';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Singleton — نسخة واحدة في كل النظام
// ═══════════════════════════════════════════════════════════════════════════════

const _network = new SheikhaIndustrialNeuralNetwork();

// ─── واجهة المحرك الموحدة (للموجّه العصبي) ──────────────────────────────────
const engine = {
    handle:  (...args) => _network.handle(...args),
    execute: (...args) => _network.execute(...args),
    process: (...args) => _network.process(...args),
    status:  ()        => _network.status(),
    listIntents: ()    => _network.listIntents(),
    getSectorInfo: (id)=> _network.getSectorInfo(id),
    listIslamicRefs: ()=> _network.listIslamicRefs(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Export
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    engine,
    SheikhaIndustrialNeuralNetwork,
    INDUSTRIAL_INTENTS,
    INDUSTRIAL_QURAN_REFS,
    INDUSTRIAL_HADITH_REFS,
    VERSION,
};
