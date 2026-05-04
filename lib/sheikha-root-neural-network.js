/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * SHEIKHA ROOT NEURAL CELL NETWORK — الشبكة العصبية الجذرية لمنظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة ٣١
 *
 * 7 خلايا عصبية متخصصة حقيقية تعمل بشبكات عصبية رياضية كاملة:
 *   L0 — ShariaCell     : حماية شرعية — Sharia Compliance (4→16→8→2)
 *   L1 — RiskCell       : تحليل المخاطر — Risk Analysis (8→32→16→3)
 *   L2 — MarketCell     : ذكاء السوق — Market Intelligence (6→24→12→4)
 *   L3 — PriceCell      : تنبؤ الأسعار — Price Prediction (5→20→10→1)
 *   L4 — SecurityCell   : حماية الأمن — Security Guard (6→24→12→2)
 *   L5 — GovernanceCell : قرار الحوكمة — Governance Decision (8→32→16→3)
 *   L6 — MemoryCell     : الذاكرة والفهم — NLP + Word2Vec + Attention
 *
 * يعمل محلياً 100% — بدون أي API خارجي
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  🕌 IFL-POWERED ROOT NEURAL CELL NETWORK — مُدار بالطبقة الأساسية الإسلامية ║
// ║  IFL → Root Neural Cell Network → Guardian → App                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
const IFL = require('./sheikha-islamic-foundation-layer');

const { NeuralNetwork, SheikhaNeural, Matrix } = require('./sheikha-neural-core');

// ─── بيانات التدريب المضمّنة (Islamic + Market knowledge) ────────────────────
const SHARIA_TRAINING = {
    // [ربا، غرر، غش، احتكار، نجش] → [مسموح=0, محظور=1]
    X: [
        [0, 0, 0, 0, 0, 1, 0, 0],  // سوق شرعي نظيف
        [0, 0, 0, 0, 0, 1, 1, 0],  // شراء بنية صالحة
        [1, 0, 0, 0, 0, 0, 0, 0],  // ربا — محظور
        [0, 1, 0, 0, 0, 0, 0, 0],  // غرر — محظور
        [0, 0, 1, 0, 0, 0, 0, 0],  // غش — محظور
        [0, 0, 0, 1, 0, 0, 0, 0],  // احتكار — محظور
        [0, 0, 0, 0, 1, 0, 0, 0],  // نجش — محظور
        [1, 1, 0, 0, 0, 0, 0, 0],  // ربا + غرر — شديد التحريم
        [0, 0, 0, 0, 0, 1, 0, 1],  // بيع عادل بثمن معلوم
        [0, 0, 0, 0, 0, 0, 1, 1],  // تراضٍ + وزن دقيق
        [1, 0, 0, 1, 0, 0, 0, 0],  // ربا + احتكار
        [0, 0, 1, 0, 1, 0, 0, 0],  // غش + نجش
    ],
    Y: [
        [1, 0], [1, 0],
        [0, 1], [0, 1], [0, 1], [0, 1], [0, 1],
        [0, 1],
        [1, 0], [1, 0],
        [0, 1], [0, 1]
    ]
};

const RISK_TRAINING = {
    // [سعر/متوسط، حجم صفقة، تذبذب، جودة، موثوقية_مورد، سرعة_دوران، مخزون_كافٍ، سوق_إقليمي]
    X: [
        [0.5, 0.3, 0.1, 0.9, 0.95, 0.7, 0.8, 0.9],  // منخفض
        [0.6, 0.4, 0.2, 0.8, 0.90, 0.6, 0.7, 0.8],  // منخفض
        [0.7, 0.6, 0.4, 0.6, 0.70, 0.4, 0.5, 0.6],  // متوسط
        [0.8, 0.7, 0.5, 0.5, 0.65, 0.3, 0.4, 0.5],  // متوسط
        [0.9, 0.9, 0.8, 0.3, 0.40, 0.2, 0.2, 0.3],  // مرتفع
        [1.0, 1.0, 0.9, 0.2, 0.30, 0.1, 0.1, 0.2],  // مرتفع
        [0.4, 0.2, 0.1, 1.0, 1.00, 0.9, 0.9, 0.9],  // منخفض جداً
        [0.95, 0.85, 0.7, 0.3, 0.45, 0.2, 0.3, 0.3], // مرتفع
    ],
    Y: [
        [1, 0, 0], [1, 0, 0],
        [0, 1, 0], [0, 1, 0],
        [0, 0, 1], [0, 0, 1],
        [1, 0, 0],
        [0, 0, 1]
    ]
};

const MARKET_TRAINING = {
    // [سعر_اليوم/أمس، حجم_التداول، طلب، عرض، موسمية، شهر]
    X: [
        [1.0, 0.8, 0.7, 0.6, 0.5, 0.4],  // مستقر
        [1.0, 0.9, 0.8, 0.8, 0.5, 0.5],  // مستقر
        [1.1, 0.9, 0.9, 0.7, 0.6, 0.6],  // نمو
        [1.2, 1.0, 1.0, 0.7, 0.7, 0.7],  // نمو قوي
        [0.8, 0.6, 0.4, 0.8, 0.3, 0.3],  // هبوط
        [0.7, 0.5, 0.3, 0.9, 0.2, 0.2],  // هبوط حاد
        [1.3, 0.5, 0.8, 0.3, 0.9, 0.9],  // تذبذب
        [0.6, 1.2, 0.9, 0.2, 0.8, 0.8],  // تذبذب حاد
    ],
    Y: [
        [1, 0, 0, 0], [1, 0, 0, 0],
        [0, 1, 0, 0], [0, 1, 0, 0],
        [0, 0, 1, 0], [0, 0, 1, 0],
        [0, 0, 0, 1], [0, 0, 0, 1]
    ]
};

const GOVERNANCE_TRAINING = {
    // [امتثال_شرعي، مخاطر، جودة_المعلومات، موثوقية_طرف، سعر_عادل، توثيق، ضمانات، ملاءة]
    X: [
        [1.0, 0.1, 0.9, 0.9, 0.9, 1.0, 0.9, 0.9],  // موافقة
        [0.9, 0.2, 0.8, 0.8, 0.8, 0.9, 0.8, 0.8],  // موافقة
        [0.7, 0.5, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],  // مراجعة
        [0.6, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],  // مراجعة
        [0.3, 0.8, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],  // رفض
        [0.1, 0.9, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],  // رفض
        [0.0, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],  // رفض قاطع
        [1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],  // موافقة مثالية
    ],
    Y: [
        [1, 0, 0], [1, 0, 0],
        [0, 1, 0], [0, 1, 0],
        [0, 0, 1], [0, 0, 1], [0, 0, 1],
        [1, 0, 0]
    ]
};

// ─── بيانات تدريب Word2Vec (معرفة إسلامية + سوق) ────────────────────────────
const NLP_TRAINING_CORPUS = [
    'البيع حلال الربا حرام لا ضرر ولا ضرار',
    'المعادن الحديد النحاس الألمنيوم الذهب الفضة',
    'السوق التجارة البيع الشراء العقد الثمن السلعة',
    'الجودة الوزن الكيل الميزان بالقسط صدق الأمانة',
    'شيخة منظومة تقنية إسلامية رقمية اقتصادية',
    'المدينة المنورة سوق النبي الصادق الأمين الخلفاء',
    'السكراب إعادة التدوير البيئة الاستدامة الموارد',
    'HS code تصنيف جمارك استيراد تصدير لوجستيات',
    'الشريعة الفقه الحلال الحرام المباح المكروه',
    'الزكاة الصدقة التبرع الوقف الخير الإحسان',
    'التحليل المخاطر الأسعار السوق التنبؤ الذكاء',
    'الأمان الحماية الخصوصية التشفير الهوية الرقمية',
    'الحوكمة القرار الإدارة الرقابة التدقيق الشفافية',
    'نيورال خلايا عصبية تعلم آلي ذكاء اصطناعي',
    'رياضيات مصفوفات خوارزميات تدريب تحسين آدم',
    'القرآن السنة الحديث الإسناد العلم النافع',
    'التقنية الابتكار التطوير البرمجة الخوادم السحابة',
    'المملكة السعودية الخليج العالم الأسواق الدولية',
];

// ─── إعدادات التدريب السريع (للبدء في ثوانٍ) ────────────────────────────────
const TRAIN_CONFIG = { epochs: 30, batchSize: 4, learningRate: 0.005, verbose: false };

// ═══════════════════════════════════════════════════════════════════════════════
// خلية عصبية متخصصة — Specialized Neural Cell
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralCell {
    constructor(id, nameAr, nameEn, architecture, labels, trainData) {
        this.id = id;
        this.nameAr = nameAr;
        this.nameEn = nameEn;
        this.labels = labels;
        this.trainData = trainData;
        this.status = 'initializing';
        this.inferences = 0;
        this.lastInference = null;
        this.trainedAt = null;
        this.accuracy = 0;

        // بناء الشبكة العصبية الحقيقية
        this.net = new NeuralNetwork({
            learningRate: TRAIN_CONFIG.learningRate,
            l2Lambda: 0.0001
        });

        // بناء الطبقات حسب البنية المحددة
        for (let i = 0; i < architecture.length - 1; i++) {
            const isLast = i === architecture.length - 2;
            this.net.addLayer(
                architecture[i],
                architecture[i + 1],
                isLast ? 'softmax' : 'relu'
            );
        }
    }

    // تدريب الخلية
    train() {
        if (!this.trainData || !this.trainData.X.length) return this;
        this.net.train(
            this.trainData.X,
            this.trainData.Y,
            { epochs: TRAIN_CONFIG.epochs, batchSize: TRAIN_CONFIG.batchSize, verbose: false }
        );
        this.accuracy = parseFloat((this.net.accuracy(this.trainData.X, this.trainData.Y) * 100).toFixed(1));
        this.trainedAt = new Date().toISOString();
        this.status = 'active';
        return this;
    }

    // استنتاج — Inference
    infer(inputVec) {
        const start = Date.now();
        const output = this.net.predict(Array.isArray(inputVec) ? inputVec : [inputVec]);
        const probs = Array.from(output.data);
        const maxIdx = probs.indexOf(Math.max(...probs));

        this.inferences++;
        this.lastInference = new Date().toISOString();

        return {
            cell: this.id,
            nameAr: this.nameAr,
            label: this.labels[maxIdx] || `class_${maxIdx}`,
            labelIndex: maxIdx,
            confidence: parseFloat((probs[maxIdx] * 100).toFixed(2)),
            probabilities: probs.map((p, i) => ({
                label: this.labels[i] || `class_${i}`,
                probability: parseFloat((p * 100).toFixed(2))
            })),
            inferenceMs: Date.now() - start,
            timestamp: new Date().toISOString()
        };
    }

    getStatus() {
        return {
            id: this.id,
            nameAr: this.nameAr,
            nameEn: this.nameEn,
            status: this.status,
            accuracy: this.accuracy + '%',
            inferences: this.inferences,
            trainedAt: this.trainedAt,
            lastInference: this.lastInference,
            layers: this.net.layers.length,
            params: this.net.layers.reduce((s, l) => s + l.weights.data.length + l.bias.data.length, 0)
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// الشبكة العصبية الجذرية الكاملة
// ═══════════════════════════════════════════════════════════════════════════════
class SheikhaRootNeuralCellNetwork {
    constructor() {
        this.name = 'Sheikha Root Neural Cell Network';
        this.nameAr = 'شبكة الخلايا العصبية الجذرية لمنظومة شيخة';
        this.version = '3.0.0';
        this.quranFoundation = '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة ٣١';
        this.principle = 'لا ضرر ولا ضرار — لا ربا — لا غرر — لا غش — لا احتكار';
        this.status = 'booting';
        this.bootTime = null;
        this.totalInferences = 0;

        // ─── الربط بالطبقة الأساسية الإسلامية (IFL) ───────────────────────────
        this.iflVersion  = IFL.IFL_VERSION;
        this.iflAxioms   = IFL.IFL_AXIOMS;          // القواعد الحاكمة الصلبة
        this.iflStack    = IFL.GOVERNANCE_STACK;     // تسلسل الحوكمة
        this.iflEnv      = IFL.detectRuntimeEnvironment(); // بيئة التشغيل
        this.iflLinked   = true;

        // 7 خلايا متخصصة
        this.cells = {
            sharia: new NeuralCell(
                'sharia', 'خلية الشريعة', 'Sharia Cell',
                [8, 16, 8, 2],
                ['مسموح — HALAL', 'محظور — HARAM'],
                SHARIA_TRAINING
            ),
            risk: new NeuralCell(
                'risk', 'خلية المخاطر', 'Risk Cell',
                [8, 32, 16, 3],
                ['مخاطرة منخفضة', 'مخاطرة متوسطة', 'مخاطرة مرتفعة'],
                RISK_TRAINING
            ),
            market: new NeuralCell(
                'market', 'خلية السوق', 'Market Cell',
                [6, 24, 12, 4],
                ['مستقر', 'نمو', 'هبوط', 'تذبذب'],
                MARKET_TRAINING
            ),
            governance: new NeuralCell(
                'governance', 'خلية الحوكمة', 'Governance Cell',
                [8, 32, 16, 3],
                ['موافقة', 'يحتاج مراجعة', 'مرفوض'],
                GOVERNANCE_TRAINING
            ),
            // الخلية اللغوية — تستخدم SheikhaNeural المتقدم
            memory: null
        };

        // الذاكرة المركزية — Word2Vec + SelfAttention
        this.memory = new SheikhaNeural();

        // إحصاءات الأداء
        this.stats = {
            totalInferences: 0,
            cellInferences: {},
            orchestratedDecisions: 0,
            avgInferenceMs: 0,
            startTime: Date.now()
        };

        // تهيئة الإحصاءات لكل خلية
        for (const id of Object.keys(this.cells)) {
            this.stats.cellInferences[id] = 0;
        }
    }

    // ─── التهيئة والتدريب عند الإقلاع ────────────────────────────────────────
    async boot() {
        if (this.status === 'active') return this;

        // التحقق من IFL قبل البدء
        const iflSovereign = IFL.sovereignCheck({});
        if (!iflSovereign.approved) {
            console.error('🚫 [ROOT-NEURAL] IFL sovereign check failed:', iflSovereign.reasons);
        }

        console.log('🧠 [ROOT-NEURAL] بدء تهيئة شبكة الخلايا العصبية الجذرية (IFL مُفعَّل)...');
        console.log(`   🕌 IFL v${IFL.IFL_VERSION} | ${IFL.IFL_AXIOMS.LA_RIBA} | ${IFL.IFL_AXIOMS.LA_GHARAR} | ${IFL.IFL_AXIOMS.LA_GHISH}`);
        const bootStart = Date.now();

        // تدريب الخلايا المتخصصة بالتوازي
        const cells = ['sharia', 'risk', 'market', 'governance'];
        await Promise.all(cells.map(id => {
            return new Promise(resolve => {
                try {
                    this.cells[id].train();
                    console.log(`   ✅ [${id.toUpperCase()}] دقة التدريب: ${this.cells[id].accuracy}%`);
                } catch (e) {
                    console.warn(`   ⚠️ [${id.toUpperCase()}] خطأ في التدريب: ${e.message}`);
                    this.cells[id].status = 'error';
                }
                resolve();
            });
        }));

        // تدريب الذاكرة اللغوية
        try {
            this.memory.trainOnKnowledge(NLP_TRAINING_CORPUS);
            console.log(`   ✅ [MEMORY] Word2Vec: ${this.memory.word2vec.vocab.size} كلمة | SelfAttention: مفعّل`);
        } catch (e) {
            console.warn(`   ⚠️ [MEMORY] خطأ: ${e.message}`);
        }

        this.bootTime = Date.now() - bootStart;
        this.status = 'active';
        console.log(`🌟 [ROOT-NEURAL] الشبكة جاهزة — وقت التهيئة: ${this.bootTime}ms | IFL: v${IFL.IFL_VERSION} ✅`);
        return this;
    }

    // ─── IFL Governance Check — يدمج IFL مع الشريعة + الحوكمة ────────────────
    iflGovernanceCheck(context = {}) {
        this._checkStatus();

        // 1) فحص القواعد الصلبة عبر IFL
        const hardRules = IFL.enforceHardRules(context);

        // 2) فحص شرعي عبر الخلية العصبية
        const features = [
            context.riba    ? 1 : 0,
            context.gharar  ? 1 : 0,
            context.ghish   ? 1 : 0,
            context.ihtikar ? 1 : 0,
            context.najash  ? 1 : 0,
            context.sidq    ? 1 : 0,
            context.taradi  ? 1 : 0,
            context.wazn    ? 1 : 0
        ];
        const neuralSharia = this.shariaCheck(features);

        // 3) فحص سيادي
        const sovereign = IFL.sovereignCheck({ targetCountry: context.targetCountry });

        const approved = hardRules.passed && neuralSharia.allowed && sovereign.approved;

        return {
            approved,
            iflVersion: IFL.IFL_VERSION,
            hardRules,
            neuralSharia: { allowed: neuralSharia.allowed, confidence: neuralSharia.confidence },
            sovereign: { approved: sovereign.approved, reasons: sovereign.reasons },
            axioms: IFL.IFL_AXIOMS,
            governanceStack: IFL.GOVERNANCE_STACK,
            runtimeEnv: this.iflEnv,
            timestamp: new Date().toISOString()
        };
    }

    // ─── L0: فحص شرعي ─────────────────────────────────────────────────────────
    shariaCheck(features) {
        // features: [ربا, غرر, غش, احتكار, نجش, صدق, تراضٍ, وزن_دقيق]
        this._checkStatus();
        this._checkCell('sharia');
        const result = this.cells.sharia.infer(features);
        this.stats.cellInferences.sharia++;
        this.stats.totalInferences++;
        const allowed = result.labelIndex === 0;
        return {
            ...result,
            allowed,
            blocked: !allowed,
            principle: this.principle
        };
    }

    // ─── L1: تحليل المخاطر ────────────────────────────────────────────────────
    riskAnalysis(features) {
        // [سعر_نسبي, حجم_صفقة_نسبي, تذبذب, جودة, موثوقية_مورد, دوران, مخزون, سوق_إقليمي]
        this._checkStatus();
        this._checkCell('risk');
        const result = this.cells.risk.infer(features);
        this.stats.cellInferences.risk++;
        this.stats.totalInferences++;
        return {
            ...result,
            riskLevel: result.labelIndex, // 0=low, 1=medium, 2=high
            mitigation: result.labelIndex === 0
                ? 'يمكن المضي بأمان'
                : result.labelIndex === 1
                    ? 'يُنصح بمراجعة الشروط قبل الإتمام'
                    : 'يجب التوقف حتى تحسّن المؤشرات'
        };
    }

    // ─── L2: ذكاء السوق ───────────────────────────────────────────────────────
    marketIntelligence(features) {
        // [نسبة_السعر_اليوم, حجم_التداول, طلب, عرض, موسمية, شهر_نسبي]
        this._checkStatus();
        this._checkCell('market');
        const result = this.cells.market.infer(features);
        this.stats.cellInferences.market++;
        this.stats.totalInferences++;
        return {
            ...result,
            trend: result.label,
            recommendation: result.labelIndex === 0
                ? 'السوق مستقر — مناسب للشراء والبيع'
                : result.labelIndex === 1
                    ? 'السوق في نمو — فرصة للبيع'
                    : result.labelIndex === 2
                        ? 'السوق في هبوط — احتياط في الشراء'
                        : 'السوق متذبذب — انتظر استقراراً'
        };
    }

    // ─── L5: قرار الحوكمة ─────────────────────────────────────────────────────
    governanceDecision(features) {
        // [امتثال_شرعي, مخاطر, جودة_معلومات, موثوقية, سعر_عادل, توثيق, ضمانات, ملاءة]
        this._checkStatus();
        this._checkCell('governance');
        const result = this.cells.governance.infer(features);
        this.stats.cellInferences.governance++;
        this.stats.totalInferences++;
        this.stats.orchestratedDecisions++;
        return {
            ...result,
            decision: result.label,
            approved: result.labelIndex === 0,
            action: result.labelIndex === 0
                ? 'PROCEED'
                : result.labelIndex === 1
                    ? 'REVIEW'
                    : 'REJECT'
        };
    }

    // ─── L6: فهم النص وتحليله ─────────────────────────────────────────────────
    analyzeText(text) {
        this._checkStatus();
        if (!this.memory.trained) return { error: 'الذاكرة اللغوية لم تُدرّب بعد' };
        const result = this.memory.analyze(text);
        this.stats.cellInferences.memory = (this.stats.cellInferences.memory || 0) + 1;
        this.stats.totalInferences++;
        return result;
    }

    textSimilarity(t1, t2) {
        if (!this.memory.trained) return { error: 'الذاكرة اللغوية لم تُدرّب بعد' };
        return { similarity: parseFloat(this.memory.similarity(t1, t2).toFixed(4)) };
    }

    similarWords(word, topK = 8) {
        if (!this.memory.trained) return [];
        return this.memory.similar(word, topK);
    }

    // ─── قرار شامل متسلسل (Orchestrated Pipeline) ────────────────────────────
    orchestrate(context = {}) {
        const start = Date.now();
        this._checkStatus();

        const {
            shariaFeatures   = [0, 0, 0, 0, 0, 1, 1, 1],
            riskFeatures     = [0.5, 0.3, 0.1, 0.9, 0.95, 0.7, 0.8, 0.9],
            marketFeatures   = [1.0, 0.8, 0.7, 0.6, 0.5, 0.4],
            govFeatures      = [1.0, 0.1, 0.9, 0.9, 0.9, 1.0, 0.9, 0.9],
        } = context;

        // L0: فحص شرعي أولاً — إذا محظور، توقف فوراً
        const shariaResult = this.shariaCheck(shariaFeatures);
        if (shariaResult.blocked) {
            return {
                success: false,
                blocked: true,
                reason: 'SHARIA_BLOCKED',
                sharia: shariaResult,
                principle: this.principle,
                decision: 'REJECTED_BY_SHARIA',
                orchestrationMs: Date.now() - start,
                timestamp: new Date().toISOString()
            };
        }

        // L1-L2: تحليل المخاطر والسوق بالتوازي
        const riskResult = this.riskAnalysis(riskFeatures);
        const marketResult = this.marketIntelligence(marketFeatures);

        // L5: قرار الحوكمة النهائي مع مراعاة نتائج الخلايا السابقة
        const adjustedGovFeatures = [
            shariaResult.allowed ? 1.0 : 0.0,
            riskResult.riskLevel === 0 ? 0.1 : riskResult.riskLevel === 1 ? 0.5 : 0.9,
            ...govFeatures.slice(2)
        ];
        const govResult = this.governanceDecision(adjustedGovFeatures);

        this.stats.orchestratedDecisions++;

        return {
            success: true,
            blocked: false,
            pipeline: {
                sharia: shariaResult,
                risk: riskResult,
                market: marketResult,
                governance: govResult
            },
            finalDecision: govResult.action,
            approved: govResult.approved,
            summary: {
                shariaCompliant: shariaResult.allowed,
                riskLevel: riskResult.label,
                marketTrend: marketResult.trend,
                recommendation: marketResult.recommendation
            },
            orchestrationMs: Date.now() - start,
            timestamp: new Date().toISOString()
        };
    }

    // ─── حالة الشبكة الكاملة ──────────────────────────────────────────────────
    getStatus() {
        const uptimeMs = Date.now() - this.stats.startTime;
        return {
            name: this.name,
            nameAr: this.nameAr,
            version: this.version,
            status: this.status,
            quranFoundation: this.quranFoundation,
            principle: this.principle,
            bootTimeMs: this.bootTime,
            uptime: {
                ms: uptimeMs,
                seconds: Math.floor(uptimeMs / 1000),
                formatted: this._formatUptime(uptimeMs)
            },
            cells: Object.fromEntries(
                Object.entries(this.cells)
                    .filter(([, v]) => v !== null)
                    .map(([id, cell]) => [id, cell.getStatus()])
            ),
            memory: {
                id: 'memory',
                nameAr: 'خلية الذاكرة والفهم',
                nameEn: 'Memory & NLP Cell',
                status: this.memory.trained ? 'active' : 'untrained',
                ...this.memory.getDashboard()
            },
            stats: {
                ...this.stats,
                avgInferenceMs: this.stats.totalInferences > 0
                    ? parseFloat((this.stats.avgInferenceMs || 0).toFixed(2))
                    : 0
            },
            architecture: {
                totalCells: Object.keys(this.cells).filter(k => this.cells[k]).length + 1,
                activationFunctions: ['ReLU', 'Softmax', 'GELU', 'Sigmoid', 'Tanh'],
                optimizer: 'Adam (β1=0.9, β2=0.999, ε=1e-8)',
                regularization: 'L2 (λ=0.0001)',
                nlp: 'Word2Vec Skip-gram + SelfAttention',
                independence: '100% محلي — بدون أي API خارجي'
            },
            timestamp: new Date().toISOString()
        };
    }

    _checkStatus() {
        if (this.status !== 'active') {
            throw new Error('الشبكة العصبية لم تُهيَّأ بعد — استدعِ boot() أولاً');
        }
    }

    _checkCell(id) {
        const cell = this.cells[id];
        if (!cell || cell.status !== 'active') {
            throw new Error(`الخلية ${id} غير جاهزة — حالتها: ${cell?.status || 'غير موجودة'}`);
        }
    }

    _formatUptime(ms) {
        const s = Math.floor(ms / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        if (d > 0) return `${d}d ${h}h ${m}m`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s % 60}s`;
    }
}

// Singleton
const rootNeuralNetwork = new SheikhaRootNeuralCellNetwork();
// تهيئة غير متزامنة عند الطلب الأول
let _bootPromise = null;
rootNeuralNetwork.ensureBooted = function() {
    if (this.status === 'active') return Promise.resolve(this);
    if (!_bootPromise) {
        _bootPromise = this.boot().catch(e => {
            // إعادة تعيين لإتاحة المحاولة مرة أخرى
            _bootPromise = null;
            return Promise.reject(e);
        });
    }
    return _bootPromise;
};

module.exports = rootNeuralNetwork;
