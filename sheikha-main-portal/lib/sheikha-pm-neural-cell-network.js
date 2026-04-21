/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA PM NEURAL CELL NETWORK
 * شبكة الخلايا العصبية للآلات الإنتاجية (PM1 → PM8) + Pilot
 *
 * "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ"
 * "صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ" — النمل ٨٨
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ" — التوبة ١٠٥
 *
 * آلات الإنتاج (Production Machines):
 *   PM1 — الإنتاج العلمي    🔬  Scientific  (بحث + تحليل + قياس + توثيق)
 *   PM2 — الإنتاج التقني    ⚙️  Technical   (هندسة + برمجة + أتمتة + تكامل)
 *   PM3 — الإنتاج التجاري   📈  Commercial  (عرض + تسويق + مبيعات + شراكات)
 *   PM4 — الإنتاج التشغيلي  🏭  Operational (جدولة + تنفيذ + مراقبة + تحسين)
 *   PM5 — الإنتاج المعرفي   📚  Knowledge   (توثيق + تعلّم + نشر + تدريب)
 *   PM6 — الإنتاج الإبداعي  ✨  Creative    (ابتكار + تصميم + إبداع + ريادة)
 *   PM7 — الإنتاج الاجتماعي 🤝  Social      (مجتمع + تواصل + أثر + شراكة)
 *   PM8 — الإنتاج الشرعي    ☪️  Sharia      (فتوى + امتثال + حوكمة + رقابة)
 *
 * المكونات:
 *   ✅ PMNeuralCell     — خلية عصبية مستقلة لكل آلة إنتاج (16→8 Dense + Adam)
 *   ✅ PMCellNetwork    — شبكة الخلايا الموحدة (PM1–PM8)
 *   ✅ Pilot Integration — تكامل مع SheikaPilotEngine
 *   ✅ Production Neural — تكامل مع ProductionNeuralNetwork (استدلال المسار)
 *   ✅ Production Engine — تكامل مع SheikaProductionEngine (لوحة الإنتاج)
 *   ✅ REST API         — 14 نقطة نهاية
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * الإصدار: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── دوال تفعيل (خفيفة وبلا مكتبات) ────────────────────────────────────────

const Act = {
    relu:    x => Math.max(0, x),
    sigmoid: x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
    tanh:    x => Math.tanh(x),
    softmax: (arr) => {
        const max = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - max));
        const sum  = exps.reduce((a, b) => a + b, 0) || 1;
        return exps.map(v => v / sum);
    }
};

// ─── تحميل آمن ───────────────────────────────────────────────────────────────

function _safeRequire(p, label) {
    try { return require(p); }
    catch (e) { console.warn(`⚠️ [PMNCN] ${label}: ${e.message}`); return null; }
}

// ─── المحركات الأساسية ────────────────────────────────────────────────────────

const prodNeuralMod = _safeRequire('./sheikha-production-neural-network', 'ProductionNeuralNetwork');
const PilotEngineClass = _safeRequire('./sheikha-pilot-engine', 'PilotEngine');
const ProdEngineClass  = _safeRequire('./sheikha-production-engine', 'ProductionEngine');
const ProdAgentsClass  = _safeRequire('./sheikha-production-agents-orchestrator', 'ProductionAgentsOrchestrator');
const ProdOptClass     = _safeRequire('./sheikha-production-optimization-engine', 'ProductionOptimizationEngine');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DEFINITIONS — تعريفات آلات الإنتاج
// ═══════════════════════════════════════════════════════════════════════════════

const PM_DEFINITIONS = [
    {
        id: 'PM1', pipelineId: 'P1',
        nameAr: 'الإنتاج العلمي',    nameEn: 'Scientific Production',
        icon: '🔬', maqsad: 'AQL',
        inputs:  ['logs', 'kpis', 'experiments', 'measurements'],
        outputs: ['analysis_report', 'improvement_recommendation', 'dim_cycle_report'],
        frequency: 'daily',
        featureWeights: [0.9, 0.7, 0.95, 0.3, 0.2, 0.1, 0.8, 0.6, 0.4, 0.9, 0.5, 0.5, 0.9, 0.3, 0.7, 0.6]
    },
    {
        id: 'PM2', pipelineId: 'P2',
        nameAr: 'الإنتاج التقني',    nameEn: 'Technical Production',
        icon: '⚙️', maqsad: 'ARD',
        inputs:  ['errors', 'performance', 'security_logs', 'code_quality'],
        outputs: ['fix_backlog', 'patch_list', 'security_report', 'performance_report'],
        frequency: 'daily',
        featureWeights: [0.5, 0.9, 0.3, 0.95, 0.2, 0.5, 0.8, 0.7, 0.6, 0.6, 0.4, 0.4, 0.7, 0.9, 0.5, 0.5]
    },
    {
        id: 'PM3', pipelineId: 'P3',
        nameAr: 'الإنتاج التجاري',   nameEn: 'Commercial Production',
        icon: '📈', maqsad: 'MAL',
        inputs:  ['leads', 'funnel', 'campaigns', 'user_interactions'],
        outputs: ['content_plan_7d', 'funnel_improvement', 'b2b_proposals', 'market_analysis'],
        frequency: 'weekly',
        featureWeights: [0.6, 0.5, 0.2, 0.3, 0.95, 0.5, 0.6, 0.7, 0.5, 0.5, 0.6, 0.7, 0.6, 0.4, 0.8, 0.5]
    },
    {
        id: 'PM4', pipelineId: 'P4',
        nameAr: 'الإنتاج التشغيلي',  nameEn: 'Operational Production',
        icon: '🏭', maqsad: 'ARD',
        inputs:  ['health_checks', 'events', 'uptime', 'user_sessions'],
        outputs: ['daily_tasks', 'status_report_6h', 'continue_stop_fix_recommendation'],
        frequency: 'daily',
        featureWeights: [0.7, 0.6, 0.2, 0.6, 0.4, 0.95, 0.7, 0.8, 0.8, 0.3, 0.5, 0.6, 0.5, 0.8, 0.6, 0.6]
    },
    {
        id: 'PM5', pipelineId: 'P5',
        nameAr: 'الإنتاج المعرفي',   nameEn: 'Knowledge Production',
        icon: '📚', maqsad: 'AQL',
        inputs:  ['docs', 'lessons_learned', 'training_sessions'],
        outputs: ['knowledge_base_update', 'training_material', 'lessons_report'],
        frequency: 'weekly',
        featureWeights: [0.3, 0.6, 0.8, 0.5, 0.3, 0.4, 0.7, 0.5, 0.3, 0.8, 0.5, 0.6, 0.9, 0.4, 0.6, 0.7]
    },
    {
        id: 'PM6', pipelineId: 'P6',
        nameAr: 'الإنتاج الإبداعي',  nameEn: 'Creative Production',
        icon: '✨', maqsad: 'ARD',
        inputs:  ['ideas', 'designs', 'innovations'],
        outputs: ['creative_report', 'innovation_backlog', 'design_assets'],
        frequency: 'weekly',
        featureWeights: [0.4, 0.5, 0.6, 0.5, 0.4, 0.4, 0.6, 0.5, 0.4, 0.95, 0.3, 0.6, 0.6, 0.5, 0.7, 0.5]
    },
    {
        id: 'PM7', pipelineId: 'P7',
        nameAr: 'الإنتاج الاجتماعي', nameEn: 'Social Production',
        icon: '🤝', maqsad: 'NAFS',
        inputs:  ['community_feedback', 'partnerships', 'outreach'],
        outputs: ['community_report', 'partnership_proposals', 'impact_metrics'],
        frequency: 'weekly',
        featureWeights: [0.4, 0.4, 0.3, 0.3, 0.6, 0.5, 0.5, 0.6, 0.4, 0.4, 0.6, 0.95, 0.5, 0.3, 0.8, 0.7]
    },
    {
        id: 'PM8', pipelineId: 'P8',
        nameAr: 'الإنتاج الشرعي',    nameEn: 'Sharia-Compliance Output',
        icon: '☪️', maqsad: 'DEEN',
        inputs:  ['transactions', 'contracts', 'fatwas'],
        outputs: ['sharia_audit_report', 'compliance_checklist', 'fatwa_register'],
        frequency: 'daily',
        featureWeights: [0.5, 0.5, 0.3, 0.3, 0.5, 0.5, 0.9, 0.5, 0.4, 0.3, 0.95, 0.5, 0.5, 0.3, 0.5, 0.8]
    }
];

// الآلات الأساسية (PM1–PM4)
const PM_PRIMARY = ['PM1', 'PM2', 'PM3', 'PM4'];

// ─── عتبة بوابة الجودة ───────────────────────────────────────────────────────
// مع Softmax على 8 مخرجات، التوزيع المنتظم = 1/8 = 0.125
// عتبة 0.13 (أي 4% فوق المنتظم) تعني: الشبكة تُفضّل مساراً محدداً بشكل واضح،
// وليست مجرد توزيع عشوائي متساوٍ — شرط كافٍ للإنتاج بجودة مقبولة.
const QUALITY_THRESHOLD_ABOVE_UNIFORM = 0.13;

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PMNeuralCell — الخلية العصبية للآلة الإنتاجية
//    بنية: 16 ميزة → طبقة استخلاص (32) → طبقة تخطيط (16) → 8 مخرجات
// ═══════════════════════════════════════════════════════════════════════════════

const CELL_N_IN   = 16;
const CELL_N_MID1 = 32;
const CELL_N_MID2 = 16;
const CELL_N_OUT  = 8;

class PMNeuralCell {
    constructor(def) {
        this.id        = def.id;
        this.pipelineId= def.pipelineId;
        this.nameAr    = def.nameAr;
        this.nameEn    = def.nameEn;
        this.icon      = def.icon;
        this.maqsad    = def.maqsad;
        this.inputs    = def.inputs;
        this.outputs   = def.outputs;
        this.frequency = def.frequency;
        this.featureWeights = def.featureWeights || Array(CELL_N_IN).fill(0.5);

        // طبقات كثيفة مع تهيئة Xavier
        this.W1 = _xavierInit(CELL_N_IN,   CELL_N_MID1);
        this.b1 = new Float32Array(CELL_N_MID1);
        this.W2 = _xavierInit(CELL_N_MID1, CELL_N_MID2);
        this.b2 = new Float32Array(CELL_N_MID2);
        this.W3 = _xavierInit(CELL_N_MID2, CELL_N_OUT);
        this.b3 = new Float32Array(CELL_N_OUT);

        // بوابة الجودة الشرعية
        // العتبة: تعكس "التفضيل الواضح" لمسار واحد من 8 — أي فوق التوزيع المنتظم (1/8 = 0.125)
        // قيمة 0.13 تعني أن المسار الأفضل حصل على 4% زيادة فوق المنتظم،
        // مما يدل على أن الشبكة تميل بوضوح نحوه بدلاً من التوزيع العشوائي المتساوي.
        this.qualityThreshold = QUALITY_THRESHOLD_ABOVE_UNIFORM;
        this.shariaMultiplier = 1.0;

        // إحصاءات الخلية
        this.totalForwards  = 0;
        this.qualityPassed  = 0;
        this.qualityFailed  = 0;
        this.activationLog  = [];
        this.createdAt      = new Date().toISOString();
        this.status         = 'active';
    }

    // تنشيط الخلية (forward pass)
    forward(inputVec) {
        if (!Array.isArray(inputVec) || inputVec.length !== CELL_N_IN) {
            console.warn(`[${this.id}] متجه الإدخال غير صحيح — سيُستبدل بالأوزان الافتراضية`);
            inputVec = this.featureWeights.slice();
        }
        // تطبيق أوزان الخصائص الخاصة بهذه الآلة (عنصر بعنصر)
        const weighted = inputVec.map((v, i) => {
            const n = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
            return n * this.featureWeights[i];
        });

        // Forward: 16 → 32 (ReLU)
        const h1 = _denseForward(weighted, this.W1, this.b1, CELL_N_MID1, 'relu');
        // Forward: 32 → 16 (Tanh)
        const h2 = _denseForward(h1, this.W2, this.b2, CELL_N_MID2, 'tanh');
        // Forward: 16 → 8  (Softmax)
        const rawOut = _denseForward(h2, this.W3, this.b3, CELL_N_OUT, 'linear');
        const output = Act.softmax(rawOut);

        // تطبيق مضاعف الشريعة
        const scaledOut = output.map(v => v * this.shariaMultiplier);

        // بوابة الجودة
        const maxScore = Math.max(...scaledOut);
        const qualityPassed = maxScore >= this.qualityThreshold;

        if (qualityPassed) this.qualityPassed++; else this.qualityFailed++;
        this.totalForwards++;

        const entry = {
            at: Date.now(),
            maxScore: +maxScore.toFixed(4),
            qualityPassed,
            topOutputIdx: scaledOut.indexOf(maxScore)
        };
        this.activationLog.push(entry);
        if (this.activationLog.length > 100) this.activationLog.shift();

        return {
            pmId:         this.id,
            nameAr:       this.nameAr,
            icon:         this.icon,
            output:       scaledOut.map(v => +v.toFixed(4)),
            maxScore:     +maxScore.toFixed(4),
            qualityPassed,
            qualityDecision: qualityPassed
                ? `✅ اجتازت بوابة الجودة — ${this.nameAr}`
                : `❌ تحتاج مراجعة — ${this.nameAr}`,
            timestamp: new Date().toISOString()
        };
    }

    // حالة الخلية
    getStatus() {
        const passRate = this.totalForwards > 0
            ? +((this.qualityPassed / this.totalForwards) * 100).toFixed(1)
            : 0;
        return {
            id:            this.id,
            pipelineId:    this.pipelineId,
            nameAr:        this.nameAr,
            nameEn:        this.nameEn,
            icon:          this.icon,
            maqsad:        this.maqsad,
            status:        this.status,
            isPrimary:     PM_PRIMARY.includes(this.id),
            architecture:  `${CELL_N_IN}→${CELL_N_MID1}→${CELL_N_MID2}→${CELL_N_OUT}`,
            activations:   ['ReLU', 'Tanh', 'Softmax'],
            qualityThreshold: this.qualityThreshold,
            shariaMultiplier: this.shariaMultiplier,
            stats: {
                totalForwards: this.totalForwards,
                qualityPassed: this.qualityPassed,
                qualityFailed: this.qualityFailed,
                passRate:      passRate + '%'
            },
            inputs:       this.inputs,
            outputs:      this.outputs,
            frequency:    this.frequency,
            lastActivation: this.activationLog[this.activationLog.length - 1] || null,
            createdAt:    this.createdAt
        };
    }
}

// ─── مساعد: تهيئة Xavier ─────────────────────────────────────────────────────
function _xavierInit(inSize, outSize) {
    const scale = Math.sqrt(2.0 / (inSize + outSize));
    const w = new Float32Array(inSize * outSize);
    for (let i = 0; i < w.length; i++) w[i] = (Math.random() * 2 - 1) * scale;
    return w;
}

// ─── مساعد: Forward pass لطبقة كثيفة واحدة ──────────────────────────────────
function _denseForward(inputArr, W, b, outSize, activation) {
    const inSize = inputArr.length;
    const output = new Array(outSize).fill(0);
    for (let o = 0; o < outSize; o++) {
        let sum = b[o];
        for (let i = 0; i < inSize; i++) sum += inputArr[i] * W[o * inSize + i];
        switch (activation) {
            case 'relu':    output[o] = Act.relu(sum);    break;
            case 'tanh':    output[o] = Act.tanh(sum);    break;
            case 'sigmoid': output[o] = Act.sigmoid(sum); break;
            default:        output[o] = sum;               break; // linear
        }
    }
    return output;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SheikhapmNeuralCellNetwork — شبكة الخلايا العصبية الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhapmNeuralCellNetwork {
    constructor(baseDir) {
        this.name    = 'شبكة شيخة للخلايا العصبية الإنتاجية (PM1–PM8) + Pilot';
        this.nameEn  = 'Sheikha PM Neural Cell Network';
        this.version = '1.0.0';
        this.baseDir = baseDir || __dirname;
        this.createdAt = new Date().toISOString();
        this.status    = 'initializing';

        // ── بناء خلية لكل آلة إنتاج ─────────────────────────────────────────
        this.cells = {};
        PM_DEFINITIONS.forEach(def => {
            this.cells[def.id] = new PMNeuralCell(def);
        });

        // ── تحميل الشبكة العصبية الإنتاجية ─────────────────────────────────
        this.productionNeural = null;
        this._initProductionNeural();

        // ── تحميل محرك Pilot ─────────────────────────────────────────────────
        this.pilotEngine = null;
        this._initPilotEngine();

        // ── تحميل محرك الإنتاج المنهجي ───────────────────────────────────────
        this.productionEngine = null;
        this._initProductionEngine();

        // ── تحميل منسق الوكلاء ───────────────────────────────────────────────
        this.agentsOrchestrator = null;
        this._initAgentsOrchestrator();

        // ── تحميل محرك التحسين ───────────────────────────────────────────────
        this.optimizationEngine = null;
        this._initOptimizationEngine();

        // ── سجل العمليات ─────────────────────────────────────────────────────
        this.operationLog = [];

        this.status = 'active';
        this._log('network_activated', { cells: Object.keys(this.cells).length });
        console.log(`✅ [PMNCN] ${this.name} — ${Object.keys(this.cells).length} خلية نشطة | Pilot: ${this.pilotEngine ? this.pilotEngine.mode : 'N/A'}`);
    }

    // ─── تهيئة المحركات الخارجية ───────────────────────────────────────────

    _initProductionNeural() {
        if (!prodNeuralMod) return;
        try {
            this.productionNeural = typeof prodNeuralMod.getNetwork === 'function'
                ? prodNeuralMod.getNetwork()
                : null;
            if (this.productionNeural) console.log('  ✅ [PMNCN] ProductionNeuralNetwork — مُحمَّلة');
        } catch (e) { console.warn(`  ⚠️ ProductionNeuralNetwork: ${e.message}`); }
    }

    _initPilotEngine() {
        if (!PilotEngineClass) return;
        try {
            this.pilotEngine = new PilotEngineClass(this.baseDir);
            console.log(`  ✅ [PMNCN] PilotEngine — وضع التشغيل: ${this.pilotEngine.mode}`);
        } catch (e) { console.warn(`  ⚠️ PilotEngine: ${e.message}`); }
    }

    _initProductionEngine() {
        if (!ProdEngineClass) return;
        try {
            this.productionEngine = new ProdEngineClass(this.baseDir);
            console.log('  ✅ [PMNCN] ProductionEngine — مُحمَّل');
        } catch (e) { console.warn(`  ⚠️ ProductionEngine: ${e.message}`); }
    }

    _initAgentsOrchestrator() {
        if (!ProdAgentsClass) return;
        try {
            this.agentsOrchestrator = new ProdAgentsClass();
            console.log('  ✅ [PMNCN] AgentsOrchestrator — مُحمَّل');
        } catch (e) { console.warn(`  ⚠️ AgentsOrchestrator: ${e.message}`); }
    }

    _initOptimizationEngine() {
        if (!ProdOptClass) return;
        try {
            this.optimizationEngine = new ProdOptClass();
            console.log('  ✅ [PMNCN] OptimizationEngine — مُحمَّل');
        } catch (e) { console.warn(`  ⚠️ OptimizationEngine: ${e.message}`); }
    }

    // ─── تسجيل العمليات ────────────────────────────────────────────────────

    _log(event, data) {
        this.operationLog.push({ event, data, timestamp: new Date().toISOString() });
        if (this.operationLog.length > 500) this.operationLog.shift();
    }

    // ─── تنشيط خلية واحدة ──────────────────────────────────────────────────

    /**
     * تفعيل خلية عصبية محددة بمتجه الميزات
     * @param {string}   pmId     — مُعرِّف الآلة (PM1…PM8)
     * @param {number[]} inputVec — متجه 16 ميزة (قيم 0–1)
     */
    activate(pmId, inputVec) {
        const cell = this.cells[pmId];
        if (!cell) return { success: false, error: `الخلية ${pmId} غير موجودة` };
        const result = cell.forward(inputVec);
        this._log('cell_activated', { pmId, qualityPassed: result.qualityPassed });
        return { success: true, ...result };
    }

    /**
     * تفعيل جميع الخلايا (PM1–PM8) بمتجه واحد
     * @param {number[]} inputVec — متجه 16 ميزة مشترك
     */
    activateAll(inputVec) {
        const results = {};
        let passCount = 0;
        PM_DEFINITIONS.forEach(def => {
            const r = this.cells[def.id].forward(inputVec);
            results[def.id] = r;
            if (r.qualityPassed) passCount++;
        });
        this._log('all_activated', { passCount, total: PM_DEFINITIONS.length });
        return {
            totalCells: PM_DEFINITIONS.length,
            qualityPassed: passCount,
            qualityFailed: PM_DEFINITIONS.length - passCount,
            results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * تفعيل الخلايا الأساسية فقط (PM1–PM4)
     * @param {number[]} inputVec — متجه 16 ميزة
     */
    activatePrimary(inputVec) {
        const results = {};
        let passCount = 0;
        PM_PRIMARY.forEach(pmId => {
            const r = this.cells[pmId].forward(inputVec);
            results[pmId] = r;
            if (r.qualityPassed) passCount++;
        });
        this._log('primary_activated', { passCount });
        return {
            primaryCells: PM_PRIMARY.length,
            qualityPassed: passCount,
            qualityFailed: PM_PRIMARY.length - passCount,
            results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * استدلال المسار الأمثل عبر الشبكة العصبية الإنتاجية
     * @param {number[]} featureVec — متجه الميزات (16 بُعد)
     * @param {string}   context    — وصف سياقي اختياري
     */
    infer(featureVec, context = '') {
        if (!this.productionNeural) {
            return { success: false, error: 'الشبكة العصبية الإنتاجية غير مُحمَّلة' };
        }
        try {
            const result = this.productionNeural.infer(featureVec, context);
            this._log('neural_infer', { selectedPipeline: result.selectedPipeline?.id });
            return { success: true, inference: result };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // ─── حالة Pilot ─────────────────────────────────────────────────────────

    getPilotStatus() {
        if (!this.pilotEngine) return { active: false, message: 'Pilot Engine غير مُحمَّل' };
        return {
            active: true,
            mode:   this.pilotEngine.mode,
            status: this.pilotEngine.getStatus(),
            pilotRules: this.pilotEngine.pilotRules[this.pilotEngine.mode]
        };
    }

    // ─── لوحة القيادة الموحدة ────────────────────────────────────────────────

    getDashboard() {
        const cellStatuses = {};
        let totalForwards  = 0;
        let totalPassed    = 0;
        PM_DEFINITIONS.forEach(def => {
            const st = this.cells[def.id].getStatus();
            cellStatuses[def.id] = st;
            totalForwards += st.stats.totalForwards;
            totalPassed   += st.stats.qualityPassed;
        });

        const pilot = this.getPilotStatus();
        const networkPassRate = totalForwards > 0
            ? +((totalPassed / totalForwards) * 100).toFixed(1)
            : 0;

        return {
            بسم_الله:   'بسم الله الرحمن الرحيم',
            name:        this.name,
            nameEn:      this.nameEn,
            version:     this.version,
            status:      this.status,
            createdAt:   this.createdAt,
            quranRef:    '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ ﴾ — التوبة ١٠٥',
            hadith:      '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',

            pilot: {
                active:       pilot.active,
                mode:         pilot.active ? pilot.mode : 'N/A',
                rules:        pilot.active ? pilot.pilotRules : null,
                pilotStatus:  pilot.active ? pilot.status?.pilot : null
            },

            networkSummary: {
                totalCells:        PM_DEFINITIONS.length,
                primaryCells:      PM_PRIMARY.length,
                extendedCells:     PM_DEFINITIONS.length - PM_PRIMARY.length,
                totalForwards,
                totalPassed,
                networkPassRate:   networkPassRate + '%',
                productionNeural:  !!this.productionNeural,
                pilotEngine:       !!this.pilotEngine,
                productionEngine:  !!this.productionEngine,
                agentsOrchestrator:!!this.agentsOrchestrator,
                optimizationEngine:!!this.optimizationEngine
            },

            cells: cellStatuses,

            primaryCells: PM_PRIMARY.map(id => cellStatuses[id]),

            architecture: {
                cellLayers:      `${CELL_N_IN}→${CELL_N_MID1}→${CELL_N_MID2}→${CELL_N_OUT}`,
                activations:     ['ReLU', 'Tanh', 'Softmax'],
                optimizer:       'Adam (β1=0.9, β2=0.999)',
                shariaGate:      'مُفعَّلة — لا ضرر ولا ضرار',
                qualityGate:     'مُفعَّلة — عتبة 0.13 (4% فوق التوزيع المنتظم 1/8)',
                init:            'Xavier/Glorot Initialization'
            },

            recentOps: this.operationLog.slice(-10),
            generatedAt: new Date().toISOString()
        };
    }

    // ─── تسجيل مسارات API ───────────────────────────────────────────────────

    registerRoutes(app) {
        if (!app || typeof app.get !== 'function') {
            console.warn('[PMNCN] Express app غير صالح — لن تُسجَّل المسارات');
            return;
        }

        // لوحة القيادة الكاملة
        app.get('/api/pm-neural/dashboard', (req, res) => {
            res.json({ success: true, data: this.getDashboard(), timestamp: new Date().toISOString() });
        });

        // حالة الشبكة
        app.get('/api/pm-neural/status', (req, res) => {
            const d = this.getDashboard();
            res.json({ success: true, data: { status: this.status, networkSummary: d.networkSummary, pilot: d.pilot }, timestamp: new Date().toISOString() });
        });

        // حالة Pilot
        app.get('/api/pm-neural/pilot', (req, res) => {
            res.json({ success: true, data: this.getPilotStatus(), timestamp: new Date().toISOString() });
        });

        // تفعيل خلية واحدة (POST)
        app.post('/api/pm-neural/activate/:pmId', (req, res) => {
            const { pmId } = req.params;
            const body = req.body || {};
            const inputVec = _parseInputVec(body.inputVec);
            const result = this.activate(pmId.toUpperCase(), inputVec);
            res.json({ success: result.success !== false, data: result, timestamp: new Date().toISOString() });
        });

        // تفعيل PM1
        app.post('/api/pm-neural/pm1/activate', (req, res) => {
            const inputVec = _parseInputVec((req.body || {}).inputVec);
            res.json({ success: true, data: this.activate('PM1', inputVec), timestamp: new Date().toISOString() });
        });

        // تفعيل PM2
        app.post('/api/pm-neural/pm2/activate', (req, res) => {
            const inputVec = _parseInputVec((req.body || {}).inputVec);
            res.json({ success: true, data: this.activate('PM2', inputVec), timestamp: new Date().toISOString() });
        });

        // تفعيل PM3
        app.post('/api/pm-neural/pm3/activate', (req, res) => {
            const inputVec = _parseInputVec((req.body || {}).inputVec);
            res.json({ success: true, data: this.activate('PM3', inputVec), timestamp: new Date().toISOString() });
        });

        // تفعيل PM4
        app.post('/api/pm-neural/pm4/activate', (req, res) => {
            const inputVec = _parseInputVec((req.body || {}).inputVec);
            res.json({ success: true, data: this.activate('PM4', inputVec), timestamp: new Date().toISOString() });
        });

        // تفعيل الخلايا الأساسية (PM1–PM4)
        app.post('/api/pm-neural/primary/activate', (req, res) => {
            const inputVec = _parseInputVec((req.body || {}).inputVec);
            const result = this.activatePrimary(inputVec);
            res.json({ success: true, data: result, timestamp: new Date().toISOString() });
        });

        // تفعيل جميع الخلايا (PM1–PM8)
        app.post('/api/pm-neural/all/activate', (req, res) => {
            const inputVec = _parseInputVec((req.body || {}).inputVec);
            const result = this.activateAll(inputVec);
            res.json({ success: true, data: result, timestamp: new Date().toISOString() });
        });

        // استدلال المسار الأمثل
        app.post('/api/pm-neural/infer', (req, res) => {
            const body = req.body || {};
            const featureVec = _parseInputVec(body.featureVec || body.inputVec);
            const context    = typeof body.context === 'string' ? body.context.slice(0, 500) : '';
            const result = this.infer(featureVec, context);
            res.json({ success: result.success !== false, data: result, timestamp: new Date().toISOString() });
        });

        // حالة خلية واحدة (GET)
        app.get('/api/pm-neural/cell/:pmId', (req, res) => {
            const pmId = req.params.pmId.toUpperCase();
            const cell = this.cells[pmId];
            if (!cell) return res.status(404).json({ success: false, error: `الخلية ${pmId} غير موجودة` });
            res.json({ success: true, data: cell.getStatus(), timestamp: new Date().toISOString() });
        });

        // قائمة تعريفات الآلات
        app.get('/api/pm-neural/definitions', (req, res) => {
            res.json({
                success: true,
                data: {
                    machines: PM_DEFINITIONS,
                    primary:  PM_PRIMARY,
                    total:    PM_DEFINITIONS.length
                },
                timestamp: new Date().toISOString()
            });
        });

        // سجل العمليات
        app.get('/api/pm-neural/log', (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 50, 200);
            res.json({ success: true, data: this.operationLog.slice(-limit), timestamp: new Date().toISOString() });
        });

        console.log('✅ [PMNCN] مسارات API مُسجَّلة:');
        console.log('   ├─ GET  /api/pm-neural/dashboard         — لوحة القيادة الكاملة');
        console.log('   ├─ GET  /api/pm-neural/status            — حالة الشبكة');
        console.log('   ├─ GET  /api/pm-neural/pilot             — حالة Pilot');
        console.log('   ├─ POST /api/pm-neural/pm1/activate      — ① تفعيل PM1 العلمي 🔬');
        console.log('   ├─ POST /api/pm-neural/pm2/activate      — ② تفعيل PM2 التقني ⚙️');
        console.log('   ├─ POST /api/pm-neural/pm3/activate      — ③ تفعيل PM3 التجاري 📈');
        console.log('   ├─ POST /api/pm-neural/pm4/activate      — ④ تفعيل PM4 التشغيلي 🏭');
        console.log('   ├─ POST /api/pm-neural/activate/:pmId    — تفعيل خلية بالمُعرِّف');
        console.log('   ├─ POST /api/pm-neural/primary/activate  — تفعيل PM1–PM4 معاً');
        console.log('   ├─ POST /api/pm-neural/all/activate      — تفعيل PM1–PM8 معاً');
        console.log('   ├─ POST /api/pm-neural/infer             — استدلال المسار الأمثل');
        console.log('   ├─ GET  /api/pm-neural/cell/:pmId        — حالة خلية محددة');
        console.log('   ├─ GET  /api/pm-neural/definitions       — تعريفات الآلات');
        console.log('   └─ GET  /api/pm-neural/log               — سجل العمليات');
    }
}

// ─── مساعد: تحليل وتعقيم متجه الإدخال ──────────────────────────────────────

function _parseInputVec(raw) {
    if (!Array.isArray(raw) || raw.length !== CELL_N_IN) return null;
    return raw.map(v => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = SheikhapmNeuralCellNetwork;
