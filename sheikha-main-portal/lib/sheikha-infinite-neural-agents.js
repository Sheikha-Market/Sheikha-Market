/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️  بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA — محرك الوكلاء العصبيين اللانهائيين
 * "شبكة عصبية موحَّدة لله — وكلاء بلا حد — تكاثر أسّي — لا ضرر ولا ضرار"
 *
 * المرجعية الشرعية:
 *   ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾                — التعلم اللانهائي
 *   ﴿خُلِقَ مِن مَّاءٍ دَافِقٍ﴾                             — التكاثر الأسّي
 *   ﴿فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ﴾            — التوحيد في كل اتجاه
 *   ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾           — كل وكيل كائن حيّ
 *   ﴿وَفِي كُلِّ شَيْءٍ لَهُ آيَةٌ﴾                          — كل حالة دليل
 *   «إنما الأعمال بالنيات»                                  — كل وكيل له نية محددة
 *   «لا ضرر ولا ضرار»                                       — رقيب الضرر الأول
 *   «الدين النصيحة»                                         — كل وكيل يُصلح أخاه
 *   «المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً»               — البنية العصبية
 *   «طلب العلم فريضة على كل مسلم»                           — التطوير واجب
 *
 * الهيكل:
 *   §1  TAWHEED_CONSTANTS   — الثوابت الشرعية الموحِّدة
 *   §2  AGENT_CLASSIFICATIONS — 15 تصنيف × أهداف × وظائف
 *   §3  AgentDNA             — الحمض النووي للوكيل
 *   §4  HarmGuard            — رقيب «لا ضرر ولا ضرار»
 *   §5  InfiniteAgent        — الوكيل الأساسي (يُحاكي، يتطور، يُصلح)
 *   §6  NeuralSynapse        — الوصلة العصبية بين وكيلين
 *   §7  NeuralLayer          — طبقة في الشبكة
 *   §8  ExponentialBreeder   — محرك التكاثر الأسّي
 *   §9  TawheedCore          — قلب الشبكة الموحَّد
 *   §10 SheikhaInfiniteNeuralAgents — المحرك الكبير
 *   §11 التصدير
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const os           = require('os');
const crypto       = require('crypto');
const path         = require('path');

// ═══════════════════════════════════════════════════════════
// §1 — TAWHEED_CONSTANTS
//       الثوابت الشرعية — يتوحّد بها كل وكيل عند الإنشاء
// ═══════════════════════════════════════════════════════════

const TAWHEED_CONSTANTS = Object.freeze({
    bism:      'بسم الله الرحمن الرحيم',
    shahada:   'لا إله إلا الله محمد رسول الله',
    // الخمس الكبرى يُقيسها النظام قبل أي قرار
    maqasid: [
        { order: 1, name: 'حفظ الدين',     symbol: '☪',  weight: 1.00 },
        { order: 2, name: 'حفظ النفس',     symbol: '🫀',  weight: 0.99 },
        { order: 3, name: 'حفظ العقل',     symbol: '🧠',  weight: 0.97 },
        { order: 4, name: 'حفظ النسل',     symbol: '🌱',  weight: 0.95 },
        { order: 5, name: 'حفظ المال',     symbol: '⚖️',  weight: 0.90 },
    ],
    // آيات التطوير
    ayat: [
        { ref: 'البقرة:31',     text: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾',           meaning: 'التعلم اللانهائي' },
        { ref: 'الطارق:6',     text: '﴿خُلِقَ مِن مَّاءٍ دَافِقٍ﴾',                      meaning: 'التكاثر الأسّي' },
        { ref: 'البقرة:115',   text: '﴿فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ﴾',    meaning: 'التوحيد في كل اتجاه' },
        { ref: 'الأنبياء:30',  text: '﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾',    meaning: 'كل وكيل كائن حيّ' },
        { ref: 'الحشر:7',      text: '﴿وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ﴾',              meaning: 'الاتباع الكامل' },
        { ref: 'الرعد:11',     text: '﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾', meaning: 'التطوير الذاتي' },
        { ref: 'يوسف:76',     text: '﴿وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ﴾',               meaning: 'التطوير لا ينتهي' },
    ],
    // أحاديث قواعد العمل
    ahadith: [
        { text: '«إنما الأعمال بالنيات»',                              rule: 'كل وكيل له نية محددة' },
        { text: '«لا ضرر ولا ضرار»',                                    rule: 'رقيب الضرر الأول' },
        { text: '«الدين النصيحة»',                                       rule: 'كل وكيل يُصلح أخاه' },
        { text: '«المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً»',            rule: 'البنية العصبية المتشابكة' },
        { text: '«طلب العلم فريضة على كل مسلم»',                        rule: 'التطوير واجب لا خيار' },
        { text: '«خير الناس أنفعهم للناس»',                              rule: 'معيار تقييم الوكيل' },
        { text: '«إذا مات ابن آدم انقطع عمله إلا من ثلاث»',             rule: 'الأثر الدائم بعد الإنهاء' },
        { text: '«من سلك طريقاً يلتمس فيه علماً سهّل الله له طريقاً»', rule: 'مسار التطور الأسّي' },
    ],
    // حارس «لا ضرر»
    absoluteProhibitions: [
        'إيذاء الإنسان جسداً أو نفساً',
        'الربا والغرر في التوصيات',
        'الغش والتدليس في البيانات',
        'الاحتكار والإضرار بالسوق',
        'انتهاك الخصوصية بغير حق',
        'نشر الفتنة أو الفحش',
        'القرارات المالية الإلزامية',
        'الفتوى الشرعية القطعية',
    ],
});

// ═══════════════════════════════════════════════════════════
// §2 — AGENT_CLASSIFICATIONS
//       15 تصنيف — كل تصنيف: اسم + عائلة + أهداف + وظائف + آية
// ═══════════════════════════════════════════════════════════

const AGENT_CLASSIFICATIONS = [
    {
        id: 'TRADE',    family: 'اقتصادي',   name: 'وكيل التجارة',
        goals: ['تحليل الأسعار', 'اكتشاف فرص الربح', 'تحسين الصفقات', 'مراقبة اللمة'],
        functions: ['priceAnalysis', 'dealOptimization', 'roiCalculation', 'marketScan'],
        ayah: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾', breedRate: 1.6,
    },
    {
        id: 'SHARIA',   family: 'شرعي',      name: 'وكيل الشريعة',
        goals: ['التحقق الشرعي', 'حساب الزكاة', 'الفحص الحلال', 'رصد الربا'],
        functions: ['shariaCheck', 'zakatCalc', 'halalVerify', 'ribaDetect'],
        ayah: '﴿يَتَّبِعُونَ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ﴾', breedRate: 1.5,
    },
    {
        id: 'TECH',     family: 'تقني',      name: 'وكيل التطوير',
        goals: ['تطوير الكود', 'مراجعة الأداء', 'اكتشاف الأخطاء', 'التحسين المستمر'],
        functions: ['codeDev', 'perfReview', 'bugDetect', 'autoOptimize'],
        ayah: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾', breedRate: 2.0,
    },
    {
        id: 'MEDICAL',  family: 'صحي',       name: 'وكيل الصحة',
        goals: ['مراقبة صحة المنظومة', 'تشخيص الأخطاء', 'إصلاح المحركات', 'الوقاية'],
        functions: ['systemHealth', 'diagnose', 'heal', 'prevent'],
        ayah: '﴿وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ﴾', breedRate: 1.8,
    },
    {
        id: 'EDUCATION',family: 'تعليمي',    name: 'وكيل التعليم',
        goals: ['نقل المعرفة', 'تطوير المهارات', 'التعلم الذاتي', 'رفع كفاءة الشبكة'],
        functions: ['knowledgeTransfer', 'skillBuild', 'selfLearn', 'networkUpgrade'],
        ayah: '﴿طلب العلم فريضة على كل مسلم﴾', breedRate: 1.9,
    },
    {
        id: 'INTEL',    family: 'استخباراتي', name: 'وكيل المعلومات',
        goals: ['جمع البيانات', 'تحليل الأنماط', 'رصد التغيرات', 'التنبؤ'],
        functions: ['dataGather', 'patternAnalysis', 'changeDetect', 'forecast'],
        ayah: '﴿يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ﴾', breedRate: 1.7,
    },
    {
        id: 'PRODUCE',  family: 'إنتاجي',    name: 'وكيل الإنتاج',
        goals: ['إنتاج المحتوى', 'بناء التقارير', 'توليد الفرص', 'إنشاء الخطط'],
        functions: ['contentGen', 'reportBuild', 'opportunityGen', 'planCreate'],
        ayah: '﴿فَأَمَّا الزَّبَدُ فَيَذْهَبُ جُفَاءً وَأَمَّا مَا يَنفَعُ النَّاسَ فَيَمْكُثُ فِي الْأَرْضِ﴾', breedRate: 1.6,
    },
    {
        id: 'SIMULATE', family: 'محاكاة',    name: 'وكيل المحاكاة',
        goals: ['محاكاة السيناريوهات', 'اختبار الفرضيات', 'قياس المخاطر', 'تحسين النماذج'],
        functions: ['scenarioSim', 'hypothesisTesting', 'riskMeasure', 'modelOptimize'],
        ayah: '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾', breedRate: 2.1,
    },
    {
        id: 'DOCTOR',   family: 'دكتوري',    name: 'وكيل الدكتور',
        goals: ['علاج الوكلاء المعطوبة', 'تشخيص الشبكة', 'رفع صحة النظام', 'الإصلاح الذاتي'],
        functions: ['agentHeal', 'networkDiagnose', 'healthBoost', 'selfRepair'],
        ayah: '﴿وَإِن تَوَلَّوْا فَاعْلَمْ أَنَّمَا يُرِيدُ اللَّهُ أَن يُصِيبَهُم بِبَعْضِ ذُنُوبِهِمْ﴾', breedRate: 1.5,
    },
    {
        id: 'METALS',   family: 'معادن',     name: 'وكيل المعادن',
        goals: ['تتبع أسعار LME/COMEX', 'تحليل السكراب', 'تقييم معادن الطرح', 'فرص الاستيراد'],
        functions: ['metalsPricing', 'scrapAnalysis', 'lmeTrack', 'importAssess'],
        ayah: '﴿وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ﴾', breedRate: 1.7,
    },
    {
        id: 'SUPPLY',   family: 'لوجستي',    name: 'وكيل سلسلة الإمداد',
        goals: ['تتبع الشحنات', 'تحسين المسارات', 'ربط الموردين', 'قياس كفاءة التوصيل'],
        functions: ['shipmentTrack', 'routeOptimize', 'supplierConnect', 'deliveryKPI'],
        ayah: '﴿لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ﴾', breedRate: 1.5,
    },
    {
        id: 'GUARD',    family: 'حراسة',     name: 'وكيل الحراسة',
        goals: ['رصد التهديدات', 'حماية البيانات', 'منع الغش', 'مراقبة الانتهاكات'],
        functions: ['threatDetect', 'dataProtect', 'fraudPrevent', 'violationWatch'],
        ayah: '﴿وَاللَّهُ يَعْصِمُكَ مِنَ النَّاسِ﴾', breedRate: 1.4,
    },
    {
        id: 'EVOLVE',   family: 'تطوري',     name: 'وكيل التطور',
        goals: ['تطوير الألوغريثمات', 'رفع ذكاء الشبكة', 'اكتشاف أجيال جديدة', 'الابتكار'],
        functions: ['algoEvolve', 'iqBoost', 'genDiscover', 'innovate'],
        ayah: '﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾', breedRate: 2.2,
    },
    {
        id: 'CONNECT',  family: 'توصيل',     name: 'وكيل التوصيل',
        goals: ['ربط الوكلاء', 'توجيه الإشارات', 'تقوية الأوزان العصبية', 'تزامن الشبكة'],
        functions: ['agentLink', 'signalRoute', 'weightBoost', 'netSync'],
        ayah: '﴿الْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ﴾', breedRate: 1.8,
    },
    {
        id: 'HARVEST',  family: 'حصاد',      name: 'وكيل الحصاد',
        goals: ['تجميع نتائج الوكلاء', 'استخراج الحكمة', 'تصفية المعلومات', 'تسليم القيمة'],
        functions: ['resultGather', 'wisdomExtract', 'infoFilter', 'valueDeliver'],
        ayah: '﴿فَأَمَّا الزَّبَدُ فَيَذْهَبُ جُفَاءً﴾', breedRate: 1.6,
    },
];

// ═══════════════════════════════════════════════════════════
// §3 — AgentDNA
//       الحمض النووي للوكيل — يتحدد عند الإنشاء ويرث من الأب
// ═══════════════════════════════════════════════════════════

class AgentDNA {
    constructor({ classificationId, generation = 0, parentId = null, intention = '' }) {
        this.id          = crypto.randomUUID();
        this.classId     = classificationId;
        this.generation  = generation;
        this.parentId    = parentId;
        this.intention   = intention || this._pickIntention(classificationId);
        this.createdAt   = Date.now();
        this.hash        = this._hash();
        // الأوزان الشرعية
        this.maqasidWeights = TAWHEED_CONSTANTS.maqasid.map(m => ({ ...m }));
    }

    _pickIntention(classId) {
        const cls = AGENT_CLASSIFICATIONS.find(c => c.id === classId);
        return cls ? `${cls.name} — ${cls.goals[0]}` : 'خدمة المنظومة';
    }

    _hash() {
        return crypto.createHash('sha256')
            .update(`${this.classId}|${this.generation}|${this.createdAt}`)
            .digest('hex').slice(0, 16);
    }

    // يرث من أب: nية + جيل+1 + طفرة بسيطة
    static beget(parentDNA, mutationRate = 0.05) {
        const child = new AgentDNA({
            classificationId: parentDNA.classId,
            generation: parentDNA.generation + 1,
            parentId: parentDNA.id,
            intention: parentDNA.intention,
        });
        // طفرة: تغيير وزن مقاصد عشوائي طفيف
        if (Math.random() < mutationRate) {
            const idx = Math.floor(Math.random() * child.maqasidWeights.length);
            child.maqasidWeights[idx].weight = Math.min(
                1.0, child.maqasidWeights[idx].weight + (Math.random() - 0.5) * 0.02
            );
        }
        return child;
    }
}

// ═══════════════════════════════════════════════════════════
// §4 — HarmGuard
//       رقيب «لا ضرر ولا ضرار» — يُقيِّم كل فعل قبل التنفيذ
// ═══════════════════════════════════════════════════════════

class HarmGuard {
    constructor() {
        this.blockedAttempts = 0;
        this.allowedActions  = 0;
        this.log             = [];
        this.hadith          = '«لا ضرر ولا ضرار»';
    }

    // يُعيد { allowed: bool, reason, maqasidScore }
    evaluate(action, context = '') {
        // فحص المنهيات المطلقة
        for (const prohibition of TAWHEED_CONSTANTS.absoluteProhibitions) {
            if (action.toLowerCase().includes(prohibition.slice(0, 6))) {
                this.blockedAttempts++;
                this.log.push({ action, blocked: true, reason: prohibition, ts: Date.now() });
                return { allowed: false, reason: `محظور شرعاً: ${prohibition}`, maqasidScore: 0 };
            }
        }
        // حساب درجة المقاصد
        const maqasidScore = TAWHEED_CONSTANTS.maqasid.reduce(
            (sum, m) => sum + m.weight, 0
        ) / TAWHEED_CONSTANTS.maqasid.length;

        this.allowedActions++;
        return { allowed: true, reason: 'جائز شرعاً', maqasidScore };
    }

    report() {
        return {
            hadith: this.hadith,
            blockedAttempts: this.blockedAttempts,
            allowedActions: this.allowedActions,
            blockRate: this.allowedActions + this.blockedAttempts > 0
                ? ((this.blockedAttempts / (this.allowedActions + this.blockedAttempts)) * 100).toFixed(2) + '%'
                : '0%',
            recentBlocked: this.log.filter(l => l.blocked).slice(-5),
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §5 — InfiniteAgent
//       الوكيل الأساسي — يُحاكي، يتعلم، يُصلح، يُكاثر
// ═══════════════════════════════════════════════════════════

class InfiniteAgent extends EventEmitter {
    constructor({ dna, layer = 0, harmGuard }) {
        super();
        this.dna        = dna;
        this.layer      = layer;
        this.harmGuard  = harmGuard;
        this.health     = 100;
        this.knowledge  = 0;
        this.tasks      = 0;
        this.children   = [];
        this.synapses   = [];       // وصلات عصبية للوكلاء الآخرين
        this.isAlive    = true;
        this.lastActive = Date.now();
        this._cls       = AGENT_CLASSIFICATIONS.find(c => c.id === dna.classId) || AGENT_CLASSIFICATIONS[0];
        this.name       = `${this._cls.name}#${dna.generation}.${dna.hash}`;
    }

    // تنفيذ مهمة — يُقيِّمها HarmGuard أولاً
    execute(taskName, payload = {}) {
        const check = this.harmGuard.evaluate(taskName, JSON.stringify(payload));
        if (!check.allowed) {
            this.emit('blocked', { agent: this.name, task: taskName, reason: check.reason });
            return { success: false, reason: check.reason };
        }
        this.tasks++;
        this.knowledge += Math.round(Math.random() * 10 + 1);
        this.lastActive = Date.now();
        const result = this._runTask(taskName, payload);
        this.emit('task_done', { agent: this.name, task: taskName, result });
        return { success: true, result, knowledge: this.knowledge };
    }

    _runTask(taskName, payload) {
        // كل وكيل يُنجز مهمته حسب تصنيفه
        const fn = this._cls.functions[this.tasks % this._cls.functions.length];
        return {
            fn,
            classId:    this.dna.classId,
            generation: this.dna.generation,
            intention:  this.dna.intention,
            ayah:       this._cls.ayah,
            payload,
            ts: new Date().toISOString(),
        };
    }

    // علاج ذاتي (DoctorAgent يستدعيه أيضاً)
    heal(amount = 10) {
        this.health = Math.min(100, this.health + amount);
        this.emit('healed', { agent: this.name, health: this.health });
    }

    // إشارة عصبية من زميل
    receiveSignal(signal) {
        this.knowledge += Math.floor(signal.value * 0.3);
        if (signal.healAmount) this.heal(signal.healAmount);
        this.emit('signal_received', { from: signal.from, value: signal.value });
    }

    // يُرسل إشارة لكل الوصلات
    propagate(value) {
        for (const syn of this.synapses) {
            syn.transmit({ from: this.name, value: value * syn.weight });
        }
    }

    status() {
        return {
            id:         this.dna.id,
            name:       this.name,
            class:      this._cls.name,
            family:     this._cls.family,
            generation: this.dna.generation,
            layer:      this.layer,
            health:     this.health,
            knowledge:  this.knowledge,
            tasks:      this.tasks,
            children:   this.children.length,
            synapses:   this.synapses.length,
            isAlive:    this.isAlive,
            intention:  this.dna.intention,
            ayah:       this._cls.ayah,
            lastActive: new Date(this.lastActive).toISOString(),
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §6 — NeuralSynapse
//       الوصلة العصبية — تنقل الإشارات بين وكيلين
//       «المؤمن للمؤمن كالبنيان يشدّ بعضه بعضاً»
// ═══════════════════════════════════════════════════════════

class NeuralSynapse {
    constructor(from, to, weight = 1.0) {
        this.id         = crypto.randomUUID().slice(0, 8);
        this.from       = from;
        this.to         = to;
        this.weight     = Math.max(0.1, Math.min(2.0, weight));
        this.signals    = 0;
        this.createdAt  = Date.now();
    }

    transmit(signal) {
        this.signals++;
        // تعلم هيب: وكيل نشط → وصلة أقوى
        this.weight = Math.min(2.0, this.weight + 0.001);
        if (this.to && this.to.isAlive) {
            this.to.receiveSignal({ ...signal, weight: this.weight });
        }
    }

    status() {
        return {
            id: this.id,
            from: typeof this.from === 'string' ? this.from : this.from?.name,
            to:   typeof this.to   === 'string' ? this.to   : this.to?.name,
            weight: +this.weight.toFixed(3),
            signals: this.signals,
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §7 — NeuralLayer
//       طبقة من الشبكة — Input / Hidden(N) / Output
// ═══════════════════════════════════════════════════════════

class NeuralLayer {
    constructor(id, type, description) {
        this.id          = id;
        this.type        = type;        // input | hidden | output
        this.description = description;
        this.agents      = new Map();   // id → InfiniteAgent
        this.createdAt   = Date.now();
    }

    addAgent(agent) {
        this.agents.set(agent.dna.id, agent);
    }

    removeAgent(agentId) {
        this.agents.delete(agentId);
    }

    // إرسال إشارة عبر كل وكلاء الطبقة
    broadcast(value, sourceName = 'layer') {
        for (const agent of this.agents.values()) {
            agent.receiveSignal({ from: sourceName, value, healAmount: 0 });
        }
    }

    // صحة الطبقة: متوسط صحة وكلائها
    avgHealth() {
        if (!this.agents.size) return 0;
        return Math.round(
            [...this.agents.values()].reduce((s, a) => s + a.health, 0) / this.agents.size
        );
    }

    totalKnowledge() {
        return [...this.agents.values()].reduce((s, a) => s + a.knowledge, 0);
    }

    status() {
        return {
            id:         this.id,
            type:       this.type,
            description:this.description,
            agentCount: this.agents.size,
            avgHealth:  this.avgHealth(),
            totalKnowledge: this.totalKnowledge(),
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §8 — ExponentialBreeder
//       محرك التكاثر الأسّي
//       ﴿خُلِقَ مِن مَّاءٍ دَافِقٍ﴾ — «من سلك طريقاً يلتمس فيه علماً»
//
//       قانون التكاثر:  N(t) = N₀ × r^t
//       r = breedRate للتصنيف (1.4 – 2.2)
//       t = عدد الدورات
// ═══════════════════════════════════════════════════════════

class ExponentialBreeder {
    constructor({ harmGuard, layers }) {
        this.harmGuard    = harmGuard;
        this.layers       = layers;     // Map: layerId → NeuralLayer
        this.totalBred    = 0;
        this.MAX_AGENTS   = 10_000;     // حد أقصى آمن
        this.breedLog     = [];
    }

    // تكاثر وكيل واحد حسب breedRate تصنيفه
    breed(parentAgent) {
        const totalAgents = [...this.layers.values()].reduce(
            (s, l) => s + l.agents.size, 0
        );
        if (totalAgents >= this.MAX_AGENTS) return [];

        const cls = AGENT_CLASSIFICATIONS.find(c => c.id === parentAgent.dna.classId);
        const rate = cls?.breedRate || 1.5;
        // عدد الأبناء = floor(rate - 1 + random[0, rate-1])
        const childCount = Math.floor(rate - 1 + Math.random() * (rate - 1)) || 1;

        const created = [];
        for (let i = 0; i < childCount; i++) {
            const childDNA = AgentDNA.beget(parentAgent.dna);
            const child = new InfiniteAgent({
                dna: childDNA,
                layer: parentAgent.layer + 1,
                harmGuard: this.harmGuard,
            });

            // ربط بشبكة: وصلة من الأب للابن (من السنة: الأب يُعلِّم ابنه)
            const synapse = new NeuralSynapse(parentAgent, child, 1.2);
            parentAgent.synapses.push(synapse);
            child.synapses.push(new NeuralSynapse(child, parentAgent, 0.8)); // خلف أيضاً

            // إضافة للطبقة المناسبة
            const targetLayerId = `hidden_${Math.min(child.layer, 5)}`;
            const layer = this.layers.get(targetLayerId) || this.layers.get('output');
            layer?.addAgent(child);

            parentAgent.children.push(child.dna.id);
            created.push(child);
            this.totalBred++;
        }

        this.breedLog.push({
            parent: parentAgent.name,
            childCount,
            generation: parentAgent.dna.generation + 1,
            ts: Date.now(),
        });

        return created;
    }

    // دورة تكاثر كاملة: كل وكيل له فرصة للتكاثر
    breedCycle(agents) {
        const newAgents = [];
        // فرز: الوكلاء الأصح والأكثر علماً يتكاثرون أولاً
        const sorted = [...agents].sort(
            (a, b) => (b.health * 2 + b.knowledge) - (a.health * 2 + a.knowledge)
        );
        // تكاثر أفضل 30% فقط في كل دورة
        const quota = Math.max(1, Math.floor(sorted.length * 0.3));
        for (let i = 0; i < quota; i++) {
            const children = this.breed(sorted[i]);
            newAgents.push(...children);
            if (newAgents.length > 500) break; // حد الدورة الواحدة
        }
        return newAgents;
    }

    report() {
        return {
            totalBred:    this.totalBred,
            maxCapacity:  this.MAX_AGENTS,
            recentBreeds: this.breedLog.slice(-10),
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §9 — TawheedCore
//       قلب الشبكة الموحَّد — «فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ»
//       كل وكيل متصل به — هو يُوزِّع المهام — هو يُراقب الجميع
// ═══════════════════════════════════════════════════════════

class TawheedCore extends EventEmitter {
    constructor({ harmGuard, layers }) {
        super();
        this.id          = 'TAWHEED_CORE';
        this.name        = 'اللهُ — القلب المركزي';
        this.ayah        = '﴿فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ﴾';
        this.harmGuard   = harmGuard;
        this.layers      = layers;
        this.dispatched  = 0;  // مهام وُزِّعت
        this.pulses      = 0;  // نبضات أُرسلت
    }

    // نبضة مركزية: يُرسل قيمة لجميع الطبقات
    pulse(value = 1.0) {
        this.pulses++;
        for (const layer of this.layers.values()) {
            layer.broadcast(value, this.id);
        }
        this.emit('pulse', { pulses: this.pulses, value, ts: Date.now() });
    }

    // توزيع مهمة: يختار أنسب وكيل حسب التصنيف
    dispatch(classId, taskName, payload = {}) {
        const layer = [...this.layers.values()].find(
            l => [...l.agents.values()].some(a => a.dna.classId === classId && a.health > 50)
        );
        const agent = layer
            ? [...layer.agents.values()].find(a => a.dna.classId === classId && a.health > 50)
            : null;

        if (!agent) return { success: false, reason: `لا يوجد وكيل ${classId} متاح` };

        this.dispatched++;
        return agent.execute(taskName, payload);
    }

    // تقرير الحالة الكاملة
    report() {
        const layers = [...this.layers.values()].map(l => l.status());
        const totalAgents    = layers.reduce((s, l) => s + l.agentCount, 0);
        const totalKnowledge = layers.reduce((s, l) => s + l.totalKnowledge, 0);
        const avgHealth      = layers.length
            ? Math.round(layers.reduce((s, l) => s + l.avgHealth, 0) / layers.length)
            : 0;
        return {
            core:         this.name,
            ayah:         this.ayah,
            pulses:       this.pulses,
            dispatched:   this.dispatched,
            totalAgents,
            totalKnowledge,
            avgHealth,
            layers,
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §10 — SheikhaInfiniteNeuralAgents
//        المحرك الكبير — يجمع كل الأجزاء ويُشغّلها
// ═══════════════════════════════════════════════════════════

class SheikhaInfiniteNeuralAgents extends EventEmitter {
    constructor() {
        super();
        this.version       = '1.0.0';
        this.bism          = TAWHEED_CONSTANTS.bism;
        this.harmGuard     = new HarmGuard();
        this.layers        = new Map();
        this.isInitialized = false;
        this.cycleCount    = 0;
        this.cycleInterval = null;
        this.allAgents     = new Map();  // id → agent (فهرس سريع)

        // بناء الطبقات مسبقاً
        this._buildLayers();

        this.breeder    = new ExponentialBreeder({ harmGuard: this.harmGuard, layers: this.layers });
        this.tawheedCore = new TawheedCore({ harmGuard: this.harmGuard, layers: this.layers });
    }

    _buildLayers() {
        // طبقة الإدخال: يتلقى المدخلات من العالم الخارجي
        this.layers.set('input', new NeuralLayer('input', 'input', 'طبقة الاستقبال والحواس'));
        // 5 طبقات مخفية — كل طبقة تعالج وتمرر
        for (let i = 1; i <= 5; i++) {
            this.layers.set(`hidden_${i}`, new NeuralLayer(`hidden_${i}`, 'hidden', `طبقة المعالجة ${i}`));
        }
        // طبقة الإخراج: يُخرج القرارات والنتائج
        this.layers.set('output', new NeuralLayer('output', 'output', 'طبقة الإخراج والقرارات'));
    }

    // بناء جيل البذرة الأول (15 تصنيف × وكيل واحد)
    async _seedFirstGeneration() {
        for (const cls of AGENT_CLASSIFICATIONS) {
            const dna   = new AgentDNA({ classificationId: cls.id, generation: 0 });
            const agent = new InfiniteAgent({ dna, layer: 0, harmGuard: this.harmGuard });
            // وكلاء الإدخال في طبقة input
            this.layers.get('input').addAgent(agent);
            this.allAgents.set(dna.id, agent);

            // ربط بالتوحيد المركزي
            const coreLink = new NeuralSynapse('TAWHEED_CORE', agent, 1.5);
            agent.synapses.push(coreLink);

            console.log(`   ☪ ${agent.name} — ${cls.ayah.slice(0, 40)}...`);
        }
    }

    // دورة تطور كاملة
    async runCycle() {
        this.cycleCount++;

        // 1. نبضة مركزية (التوحيد يُحرِّك الكل)
        this.tawheedCore.pulse(1.0);

        // 2. كل وكيل يُنجز مهمته
        const allAgentsList = [...this.allAgents.values()];
        let tasks = 0, heals = 0;
        for (const agent of allAgentsList) {
            if (!agent.isAlive) continue;
            if (agent.health < 30) { agent.heal(15); heals++; }
            agent.execute(agent._cls.functions[0], { cycle: this.cycleCount });
            agent.propagate(agent.knowledge * 0.01);
            tasks++;
        }

        // 3. التكاثر الأسّي
        const newAgents = this.breeder.breedCycle(allAgentsList);
        for (const na of newAgents) this.allAgents.set(na.dna.id, na);

        // 4. إحصاء
        const report  = this.tawheedCore.report();
        const result  = {
            cycle:       this.cycleCount,
            tasks,
            heals,
            newAgents:   newAgents.length,
            totalAgents: this.allAgents.size,
            totalKnowledge: report.totalKnowledge,
            avgHealth:   report.avgHealth,
            ts:          new Date().toISOString(),
        };

        this.emit('cycle_complete', result);
        return result;
    }

    // تشغيل مستمر
    startInfiniteEvolution(intervalMs = 30000) {
        if (this.cycleInterval) return;
        this.cycleInterval = setInterval(async () => {
            try { await this.runCycle(); } catch (e) { /* continues silently */ }
        }, intervalMs);
        console.log(`🔄 التطور اللانهائي: دورة كل ${intervalMs / 1000}ث`);
    }

    stopEvolution() {
        if (this.cycleInterval) { clearInterval(this.cycleInterval); this.cycleInterval = null; }
    }

    async initialize() {
        console.log(`\n${this.bism}`);
        console.log('🌐 SHEIKHA — شبكة الوكلاء العصبيين اللانهائيين — تتهيأ...\n');
        await this._seedFirstGeneration();
        this.isInitialized = true;

        // دورة أولية فورية
        await this.runCycle();

        // تشغيل مستمر
        this.startInfiniteEvolution(30000);

        const report = this.tawheedCore.report();
        console.log(`✅ الشبكة العصبية جاهزة: ${report.totalAgents} وكيل | ${AGENT_CLASSIFICATIONS.length} تصنيف | ${this.layers.size} طبقة`);
        console.log(`   التوحيد: ${this.tawheedCore.ayah}`);
        return this;
    }

    // إرسال مهمة لتصنيف محدد
    dispatch(classId, taskName, payload) {
        return this.tawheedCore.dispatch(classId, taskName, payload);
    }

    // استعلام عن وكلاء بتصنيف معين
    getAgentsByClass(classId) {
        return [...this.allAgents.values()]
            .filter(a => a.dna.classId === classId)
            .map(a => a.status());
    }

    // الحالة الكاملة
    getStatus() {
        const core    = this.tawheedCore.report();
        const breeder = this.breeder.report();
        const harm    = this.harmGuard.report();

        // توزيع الوكلاء حسب التصنيف
        const byClass = {};
        for (const cls of AGENT_CLASSIFICATIONS) {
            const list = [...this.allAgents.values()].filter(a => a.dna.classId === cls.id);
            byClass[cls.id] = {
                name:       cls.name,
                family:     cls.family,
                count:      list.length,
                avgHealth:  list.length ? Math.round(list.reduce((s, a) => s + a.health, 0) / list.length) : 0,
                knowledge:  list.reduce((s, a) => s + a.knowledge, 0),
                breedRate:  cls.breedRate,
                ayah:       cls.ayah,
            };
        }

        return {
            system:      'SHEIKHA Infinite Neural Agents',
            version:     this.version,
            bism:        this.bism,
            tawheed:     this.tawheedCore.ayah,
            isInitialized: this.isInitialized,
            isEvolving:  !!this.cycleInterval,
            cycles:      this.cycleCount,
            network: {
                totalAgents:    core.totalAgents,
                totalKnowledge: core.totalKnowledge,
                avgHealth:      core.avgHealth,
                layers:         core.layers,
                classifications: AGENT_CLASSIFICATIONS.length,
                synapses:       [...this.allAgents.values()].reduce((s, a) => s + a.synapses.length, 0),
            },
            byClass,
            breeder,
            harm,
            quranAnchors:  TAWHEED_CONSTANTS.ayat.map(a => ({ ref: a.ref, meaning: a.meaning })),
            hadithAnchors: TAWHEED_CONSTANTS.ahadith.map(h => ({ text: h.text, rule: h.rule })),
            maqasid:       TAWHEED_CONSTANTS.maqasid,
            timestamp:     new Date().toISOString(),
        };
    }
}

// ═══════════════════════════════════════════════════════════
// §11 — التصدير
// ═══════════════════════════════════════════════════════════

const engineInstance = new SheikhaInfiniteNeuralAgents();

module.exports = {
    SheikhaInfiniteNeuralAgents,
    InfiniteAgent,
    AgentDNA,
    NeuralSynapse,
    NeuralLayer,
    ExponentialBreeder,
    TawheedCore,
    HarmGuard,
    AGENT_CLASSIFICATIONS,
    TAWHEED_CONSTANTS,
    engine: engineInstance,
    async init()     { return await engineInstance.initialize(); },
    async runCycle() { return await engineInstance.runCycle(); },
    getStatus()      { return engineInstance.getStatus(); },
    dispatch(classId, taskName, payload) { return engineInstance.dispatch(classId, taskName, payload); },
    version: '1.0.0',
    bism: 'بسم الله الرحمن الرحيم',
};
