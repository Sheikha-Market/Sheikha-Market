/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA EXECUTION NEURAL CELL NETWORK
 * شبكة الخلايا العصبية لمنفذ القرارات والإنتاج
 *
 * "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ"
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ" — التوبة ١٠٥
 *
 * الهيكل العصبي (Neural Architecture):
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │            SHEIKHA EXECUTION NCN                     │
 *   │                                                      │
 *   │  [demand features x8] → DemandAnalysisCell          │
 *   │         ↓                                            │
 *   │  [supply features x8] → SupplyAnalysisCell    →     │
 *   │         ↓                                AggregatorCell → DecisionCell │
 *   │  [gap    features x8] → GapAnalysisCell              │
 *   │                                                      │
 *   │  Outputs: BOOST_SUPPLY | NORMAL_PRODUCTION |         │
 *   │           REDUCE_SUPPLY | HOLD                       │
 *   └─────────────────────────────────────────────────────┘
 *
 * كل خلية: 8→16→8 (Xavier init · ReLU·Tanh·Softmax)
 * خلية الاجتماع: 24→16→8
 * خلية القرار:   8→8→4  (Softmax → argmax)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * الإصدار: 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── دوال التفعيل ────────────────────────────────────────────────────────────

const Act = {
    relu:    x => Math.max(0, x),
    sigmoid: x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
    tanh:    x => Math.tanh(x),
    softmax(arr) {
        const max  = Math.max(...arr);
        const exps = arr.map(v => Math.exp(v - max));
        const sum  = exps.reduce((a, b) => a + b, 0) || 1;
        return exps.map(v => v / sum);
    }
};

// ─── تهيئة Xavier ─────────────────────────────────────────────────────────────

function _xavierInit(inSize, outSize) {
    const scale = Math.sqrt(2.0 / (inSize + outSize));
    const w = new Float32Array(inSize * outSize);
    for (let i = 0; i < w.length; i++) w[i] = (Math.random() * 2 - 1) * scale;
    return w;
}

// ─── Forward pass لطبقة كثيفة ────────────────────────────────────────────────

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
            default:        output[o] = sum;               break;
        }
    }
    return output;
}

// ─── تطبيع الإدخال (Clamp 0–1) ───────────────────────────────────────────────

function _norm(v, max) {
    if (!max || max === 0) return 0;
    return Math.min(1, Math.max(0, v / max));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. NeuralCell — الخلية العصبية الأساسية
//    بنية قابلة للتهيئة: inSize → hidSize → outSize
// ═══════════════════════════════════════════════════════════════════════════════

class NeuralCell {
    /**
     * @param {object} def
     * @param {string} def.id        — معرّف الخلية
     * @param {string} def.nameAr    — الاسم العربي
     * @param {string} def.nameEn    — الاسم الإنجليزي
     * @param {string} def.icon      — رمز الخلية
     * @param {number} def.inSize    — حجم الإدخال
     * @param {number} def.hidSize   — حجم الطبقة الخفية
     * @param {number} def.outSize   — حجم الإخراج
     * @param {number} def.threshold — عتبة الجودة
     */
    constructor(def) {
        this.id        = def.id;
        this.nameAr    = def.nameAr;
        this.nameEn    = def.nameEn;
        this.icon      = def.icon || '🧠';
        this.inSize    = def.inSize;
        this.hidSize   = def.hidSize;
        this.outSize   = def.outSize;
        this.threshold = def.threshold || 0.13;

        // طبقتان كثيفتان
        this.W1 = _xavierInit(this.inSize,  this.hidSize);
        this.b1 = new Float32Array(this.hidSize);
        this.W2 = _xavierInit(this.hidSize, this.outSize);
        this.b2 = new Float32Array(this.outSize);

        // إحصاءات
        this.totalForwards = 0;
        this.qualityPassed = 0;
        this.qualityFailed = 0;
        this.activationLog = [];
        this.createdAt     = new Date().toISOString();
        this.status        = 'active';
    }

    /** تنشيط الخلية (forward pass) */
    forward(inputVec) {
        // تطبيع والتحقق
        const safeIn = inputVec.map(v => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0));

        // طبقة 1: inSize → hidSize (ReLU)
        const h1 = _denseForward(safeIn, this.W1, this.b1, this.hidSize, 'relu');
        // طبقة 2: hidSize → outSize (linear → Softmax)
        const raw = _denseForward(h1, this.W2, this.b2, this.outSize, 'linear');
        const output = Act.softmax(raw);

        const maxScore    = Math.max(...output);
        const topIdx      = output.indexOf(maxScore);
        const quality     = maxScore >= this.threshold;

        if (quality) this.qualityPassed++; else this.qualityFailed++;
        this.totalForwards++;

        const entry = { at: Date.now(), maxScore: +maxScore.toFixed(4), quality, topIdx };
        this.activationLog.push(entry);
        if (this.activationLog.length > 100) this.activationLog.shift();

        return { output: output.map(v => +v.toFixed(4)), maxScore: +maxScore.toFixed(4), topIdx, quality };
    }

    getStatus() {
        const passRate = this.totalForwards > 0
            ? +((this.qualityPassed / this.totalForwards) * 100).toFixed(1)
            : 0;
        return {
            id: this.id, nameAr: this.nameAr, nameEn: this.nameEn, icon: this.icon,
            architecture: `${this.inSize}→${this.hidSize}→${this.outSize}`,
            activations:  ['ReLU', 'Softmax'],
            status:       this.status,
            threshold:    this.threshold,
            stats: {
                totalForwards: this.totalForwards,
                qualityPassed: this.qualityPassed,
                qualityFailed: this.qualityFailed,
                passRate:      passRate + '%'
            },
            lastActivation: this.activationLog[this.activationLog.length - 1] || null,
            createdAt: this.createdAt
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. تعريفات الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

/** أسماء أوضاع القرار */
const DECISION_MODES = ['BOOST_SUPPLY', 'NORMAL_PRODUCTION', 'REDUCE_SUPPLY', 'HOLD'];

/** الإجراءات المرتبطة بكل وضع */
const MODE_ACTIONS = {
    BOOST_SUPPLY:       ['ACTIVATE_PM3', 'ACTIVATE_PM4', 'ENABLE_AUTO_SCALING'],
    NORMAL_PRODUCTION:  ['MAINTAIN_PM4', 'MONITOR_SUPPLY'],
    REDUCE_SUPPLY:      ['PAUSE_PM3', 'OPTIMIZE_INVENTORY'],
    HOLD:               ['STANDBY', 'AWAIT_DATA']
};

/** فجوة الطلب/العرض التي تُطلق BOOST_SUPPLY */
const BOOST_THRESHOLD = 100;
/** أقصى قيمة للتطبيع */
const NORM_MAX_QTY = 10000;

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SheikhaExecutionNeuralCellNetwork — الشبكة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaExecutionNeuralCellNetwork {
    constructor() {
        this.name    = 'شبكة الخلايا العصبية لمنفذ القرارات — شيخة';
        this.nameEn  = 'Sheikha Execution Neural Cell Network';
        this.version = '1.0.0';
        this.createdAt = new Date().toISOString();
        this.status    = 'active';

        // ── خلايا التحليل (طبقة الإدخال) ──────────────────────────────────
        this.demandCell = new NeuralCell({
            id: 'DEMAND', nameAr: 'خلية تحليل الطلب', nameEn: 'Demand Analysis Cell',
            icon: '📦', inSize: 8, hidSize: 16, outSize: 8, threshold: 0.13
        });

        this.supplyCell = new NeuralCell({
            id: 'SUPPLY', nameAr: 'خلية تحليل العرض', nameEn: 'Supply Analysis Cell',
            icon: '🏭', inSize: 8, hidSize: 16, outSize: 8, threshold: 0.13
        });

        this.gapCell = new NeuralCell({
            id: 'GAP', nameAr: 'خلية تحليل الفجوة', nameEn: 'Gap Analysis Cell',
            icon: '📊', inSize: 8, hidSize: 16, outSize: 8, threshold: 0.13
        });

        // ── خلية الاجتماع (طبقة مخفية) ────────────────────────────────────
        this.aggregatorCell = new NeuralCell({
            id: 'AGGREGATOR', nameAr: 'خلية الاجتماع', nameEn: 'Signal Aggregator Cell',
            icon: '🔗', inSize: 24, hidSize: 16, outSize: 8, threshold: 0.13
        });

        // ── خلية القرار (طبقة الإخراج) ────────────────────────────────────
        this.decisionCell = new NeuralCell({
            id: 'DECISION', nameAr: 'خلية القرار', nameEn: 'Decision Cell',
            icon: '⚡', inSize: 8, hidSize: 8, outSize: 4, threshold: 0.28
        });

        // ── حالة التشغيل ──────────────────────────────────────────────────
        this.currentMode      = null;
        this.activeActions    = [];
        this.lastDecision     = null;
        this.executionsCount  = 0;
        this.executionHistory = [];

        console.log(`✅ [ENCN] ${this.name} — 5 خلايا نشطة`);
        console.log('   ├─ DemandAnalysisCell   8→16→8');
        console.log('   ├─ SupplyAnalysisCell   8→16→8');
        console.log('   ├─ GapAnalysisCell      8→16→8');
        console.log('   ├─ AggregatorCell      24→16→8');
        console.log('   └─ DecisionCell          8→8→4  → BOOST|NORMAL|REDUCE|HOLD');
    }

    // ─── استخراج متجه ميزات الطلب (8 ميزات) ──────────────────────────────────

    _demandFeatures(ordersData) {
        const list = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
        const pending = list.filter(o => {
            const s = (o.status || '').toLowerCase();
            return s === 'pending' || s === 'open';
        });

        const totalQty = pending.reduce((s, o) => {
            const q = typeof o.quantity === 'number' ? o.quantity
                : (o.item && typeof o.item.quantity === 'number' ? o.item.quantity : 0);
            return s + q;
        }, 0);

        const count        = pending.length;
        const avgQty       = count > 0 ? totalQty / count : 0;
        const maxQty       = pending.reduce((m, o) => {
            const q = typeof o.quantity === 'number' ? o.quantity
                : (o.item && typeof o.item.quantity === 'number' ? o.item.quantity : 0);
            return Math.max(m, q);
        }, 0);
        const urgentCount  = pending.filter(o => (o.priority || '') === 'high').length;
        const materials    = new Set(pending.map(o => o.material || (o.item && o.item.metal) || 'unknown'));

        return [
            _norm(totalQty,       NORM_MAX_QTY),   // إجمالي الطلب المُطبَّع
            _norm(count,          50),              // عدد الطلبات المعلقة
            _norm(avgQty,         NORM_MAX_QTY),    // متوسط كمية الطلب
            _norm(maxQty,         NORM_MAX_QTY),    // أقصى طلب فردي
            _norm(urgentCount,    count || 1),      // نسبة الطلبات العاجلة
            _norm(materials.size, 10),              // تنوع المواد
            count > 0 ? 1 : 0,                     // يوجد طلب نشط؟
            totalQty > BOOST_THRESHOLD ? 1 : 0     // تجاوز العتبة؟
        ];
    }

    // ─── استخراج متجه ميزات العرض (8 ميزات) ──────────────────────────────────

    _supplyFeatures(supplyData) {
        let totalSupply = 0;
        let itemCount   = 0;
        let minStock    = Infinity;
        let maxStock    = 0;

        if (Array.isArray(supplyData)) {
            itemCount   = supplyData.length;
            totalSupply = supplyData.reduce((s, x) => s + (Number(x.quantity) || 0), 0);
            supplyData.forEach(x => {
                const q = Number(x.quantity) || 0;
                if (q < minStock) minStock = q;
                if (q > maxStock) maxStock = q;
            });
        } else {
            const inv = supplyData.inventory;
            if (inv && typeof inv === 'object' && !Array.isArray(inv)) {
                Object.values(inv).forEach(v => {
                    const q = typeof v === 'object' ? (Number(v.available) || 0) : (Number(v) || 0);
                    totalSupply += q;
                    itemCount++;
                    if (q < minStock) minStock = q;
                    if (q > maxStock) maxStock = q;
                });
            }
        }
        if (minStock === Infinity) minStock = 0;

        const variance   = maxStock > 0 ? (maxStock - minStock) / maxStock : 0;
        const stockRisk  = totalSupply < BOOST_THRESHOLD ? 1 : 0;

        return [
            _norm(totalSupply, NORM_MAX_QTY),    // إجمالي العرض المُطبَّع
            _norm(itemCount,   20),              // عدد بنود العرض
            _norm(minStock,    NORM_MAX_QTY),    // أدنى مخزون
            _norm(maxStock,    NORM_MAX_QTY),    // أعلى مخزون
            variance,                            // تباين المخزون
            stockRisk,                           // خطر النفاد
            totalSupply > 0 ? 1 : 0,            // يوجد عرض؟
            totalSupply < 50 ? 1 : 0            // مخزون حرج؟
        ];
    }

    // ─── استخراج متجه ميزات الفجوة (8 ميزات) ────────────────────────────────

    _gapFeatures(demand, supply) {
        const gap        = demand - supply;
        const ratio      = supply > 0 ? gap / supply : (demand > 0 ? 1 : 0);
        const normalized = _norm(gap, NORM_MAX_QTY);
        const critical   = gap > BOOST_THRESHOLD ? 1 : 0;
        const severe     = gap > BOOST_THRESHOLD * 5 ? 1 : 0;
        const ratioNorm  = Math.min(1, Math.max(0, ratio));
        const balanced   = gap >= -10 && gap <= 10 ? 1 : 0;
        const surplus    = gap < -BOOST_THRESHOLD ? 1 : 0;

        return [
            normalized,                              // الفجوة المُطبَّعة
            ratioNorm,                               // نسبة الفجوة إلى العرض
            critical,                                // فجوة حرجة؟
            severe,                                  // فجوة شديدة؟
            balanced,                                // متوازن؟
            surplus,                                 // فائض؟
            _norm(Math.abs(gap), NORM_MAX_QTY),     // الحجم المطلق للفجوة
            demand > 0 ? _norm(supply / demand, 1) : 0  // نسبة تغطية العرض
        ];
    }

    // ─── التمرير الأمامي الكامل (forward pass) ───────────────────────────────

    _forwardPass(ordersData, supplyData) {
        // استخراج الميزات
        const demandVec = this._demandFeatures(ordersData);
        const supplyVec = this._supplyFeatures(supplyData);
        const totalDemand = demandVec[0] * NORM_MAX_QTY;
        const totalSupply = supplyVec[0] * NORM_MAX_QTY;
        const gapVec    = this._gapFeatures(totalDemand, totalSupply);

        // تنشيط خلايا التحليل
        const dResult = this.demandCell.forward(demandVec);
        const sResult = this.supplyCell.forward(supplyVec);
        const gResult = this.gapCell.forward(gapVec);

        // دمج الإشارات → خلية الاجتماع (24 إدخال)
        const aggregatedInput = [...dResult.output, ...sResult.output, ...gResult.output];
        const aResult = this.aggregatorCell.forward(aggregatedInput);

        // خلية القرار (4 مخرجات: BOOST | NORMAL | REDUCE | HOLD)
        const rawDecision = this.decisionCell.forward(aResult.output);

        // ── هجين: إشارة التحيز القائمة على القواعد تُعزز مخرجات الشبكة ─────
        // عندما تكون الإشارات الحتمية واضحة (فجوة كبيرة / فائض)
        // نُعزز الخلية المناسبة بدلاً من الاعتماد الكامل على أوزان عشوائية.
        const gap = totalDemand - totalSupply;
        const boostedProbs = [...rawDecision.output];
        if (gap > BOOST_THRESHOLD) {
            // تعزيز BOOST_SUPPLY (index 0) — يتناسب مع مدى تجاوز العتبة
            const boost = Math.min(0.5, (gap - BOOST_THRESHOLD) / BOOST_THRESHOLD * 0.25);
            boostedProbs[0] = Math.min(1, boostedProbs[0] + boost);
        } else if (gap < -BOOST_THRESHOLD) {
            // تعزيز REDUCE_SUPPLY (index 2)
            const boost = Math.min(0.5, (Math.abs(gap) - BOOST_THRESHOLD) / BOOST_THRESHOLD * 0.25);
            boostedProbs[2] = Math.min(1, boostedProbs[2] + boost);
        } else if (Math.abs(gap) <= 10) {
            // تعزيز NORMAL_PRODUCTION (index 1)
            boostedProbs[1] = Math.min(1, boostedProbs[1] + 0.3);
        }
        // إعادة تطبيع
        const finalProbs = Act.softmax(boostedProbs);
        const modeIdx    = finalProbs.indexOf(Math.max(...finalProbs));
        const mode       = DECISION_MODES[modeIdx] || 'NORMAL_PRODUCTION';
        const confidence = finalProbs[modeIdx];

        return {
            cells: {
                demand:     dResult,
                supply:     sResult,
                gap:        gResult,
                aggregator: aResult,
                decision:   rawDecision
            },
            features: { demandVec, supplyVec, gapVec },
            mode,
            confidence: +confidence.toFixed(4),
            probabilities: DECISION_MODES.reduce((acc, m, i) => {
                acc[m] = +(finalProbs[i] || 0).toFixed(4);
                return acc;
            }, {})
        };
    }

    // ─── تحليل بيانات الطلب/العرض ─────────────────────────────────────────────

    _analyzeData(ordersData, supplyData) {
        const list = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
        const pending = list.filter(o => {
            const s = (o.status || '').toLowerCase();
            return s === 'pending' || s === 'open';
        });

        const totalDemand = pending.reduce((s, o) => {
            const q = typeof o.quantity === 'number' ? o.quantity
                : (o.item && typeof o.item.quantity === 'number' ? o.item.quantity : 0);
            return s + q;
        }, 0);

        let totalSupply = 0;
        if (Array.isArray(supplyData)) {
            totalSupply = supplyData.reduce((s, x) => s + (Number(x.quantity) || 0), 0);
        } else {
            const inv = supplyData.inventory;
            if (inv && typeof inv === 'object' && !Array.isArray(inv)) {
                totalSupply = Object.values(inv).reduce((s, v) => {
                    return s + (typeof v === 'object' ? (Number(v.available) || 0) : (Number(v) || 0));
                }, 0);
            }
        }

        const gap = totalDemand - totalSupply;
        return { totalDemand, totalSupply, gap, pendingCount: pending.length };
    }

    // ─── بناء تعليل القرار ────────────────────────────────────────────────────

    _buildReasoning(mode, analysis) {
        const { totalDemand, totalSupply, gap } = analysis;
        const reasons = [];

        if (mode === 'BOOST_SUPPLY') {
            reasons.push(`فجوة التوريد كبيرة: ${gap} طلب بدون توريد`);
            if (totalSupply < 50) reasons.push('المخزون في مستوى حرج');
            if (totalDemand > BOOST_THRESHOLD * 2) reasons.push('ضغط طلب مرتفع');
        } else if (mode === 'NORMAL_PRODUCTION') {
            reasons.push('مستويات العرض والطلب متوازنة');
            reasons.push(`إجمالي الطلب ${totalDemand} — العرض ${totalSupply}`);
        } else if (mode === 'REDUCE_SUPPLY') {
            reasons.push(`فائض في العرض: ${Math.abs(gap)} وحدة زائدة`);
        } else {
            reasons.push('البيانات غير كافية — في وضع الانتظار');
        }

        return reasons;
    }

    // ─── execute() — التنفيذ الكامل ───────────────────────────────────────────

    /**
     * تنفيذ دورة قرار كاملة
     * @param {*} ordersData
     * @param {*} supplyData
     * @returns {{ mode, actions, reasoning, analysis, neural, executedAt }}
     */
    execute(ordersData, supplyData) {
        const analysis  = this._analyzeData(ordersData, supplyData);
        const neural    = this._forwardPass(ordersData, supplyData);
        const mode      = neural.mode;
        const reasoning = this._buildReasoning(mode, analysis);
        const actions   = MODE_ACTIONS[mode] || [];
        const priority  = mode === 'BOOST_SUPPLY' ? 'high'
                        : mode === 'REDUCE_SUPPLY' ? 'medium'
                        : 'normal';

        const decision = {
            mode,
            actions,
            reasoning,
            priority,
            confidence:    neural.confidence,
            probabilities: neural.probabilities,
            timestamp:     new Date().toISOString()
        };

        // تحديث الحالة
        this.currentMode   = mode;
        this.activeActions = actions;
        this.lastDecision  = decision;
        this.executionsCount++;

        const actionsExecuted = actions.map(action => ({
            action,
            timestamp: new Date().toISOString(),
            status:    'executed',
            message:   this._actionMessage(action)
        }));

        const record = {
            timestamp: decision.timestamp,
            decision:  mode,
            reasoning,
            actions,
            confidence:        neural.confidence,
            executionResult:   'success',
            actionsExecuted
        };

        this.executionHistory.push(record);
        if (this.executionHistory.length > 50) this.executionHistory.shift();

        return {
            mode,
            actions,
            reasoning,
            analysis,
            neural: {
                confidence:    neural.confidence,
                probabilities: neural.probabilities,
                cells: {
                    demand:     { quality: neural.cells.demand.quality,     maxScore: neural.cells.demand.maxScore },
                    supply:     { quality: neural.cells.supply.quality,     maxScore: neural.cells.supply.maxScore },
                    gap:        { quality: neural.cells.gap.quality,        maxScore: neural.cells.gap.maxScore },
                    aggregator: { quality: neural.cells.aggregator.quality, maxScore: neural.cells.aggregator.maxScore },
                    decision:   { quality: neural.cells.decision.quality,   maxScore: neural.cells.decision.maxScore }
                }
            },
            actionsExecuted,
            priority,
            executedAt: decision.timestamp
        };
    }

    // ─── رسائل الإجراءات ──────────────────────────────────────────────────────

    _actionMessage(action) {
        const msgs = {
            ACTIVATE_PM3:      'تم تفعيل PM3 - إدارة التوريد',
            ACTIVATE_PM4:      'تم تفعيل PM4 - إدارة الإنتاج',
            ENABLE_AUTO_SCALING: 'تم تفعيل التوسع الآلي',
            MAINTAIN_PM4:      'PM4 يعمل بالمعدل الطبيعي',
            MONITOR_SUPPLY:    'مراقبة مستويات التوريد',
            PAUSE_PM3:         'تم إيقاف PM3 مؤقتاً',
            OPTIMIZE_INVENTORY: 'بدء تحسين المخزون',
            STANDBY:           'النظام في وضع الانتظار',
            AWAIT_DATA:        'انتظار بيانات إضافية'
        };
        return msgs[action] || `تنفيذ: ${action}`;
    }

    // ─── حالة الشبكة الكاملة ────────────────────────────────────────────────

    getNetworkStatus() {
        return {
            name:           this.name,
            nameEn:         this.nameEn,
            version:        this.version,
            status:         this.status,
            architecture:   'DemandCell+SupplyCell+GapCell → AggregatorCell → DecisionCell',
            cells: {
                demand:     this.demandCell.getStatus(),
                supply:     this.supplyCell.getStatus(),
                gap:        this.gapCell.getStatus(),
                aggregator: this.aggregatorCell.getStatus(),
                decision:   this.decisionCell.getStatus()
            },
            runtime: {
                currentMode:     this.currentMode,
                activeActions:   this.activeActions,
                executionsCount: this.executionsCount,
                lastDecision:    this.lastDecision
            },
            decisionModes: DECISION_MODES,
            modeActions:   MODE_ACTIONS,
            createdAt:     this.createdAt
        };
    }

    getState() {
        return {
            ok:              true,
            timestamp:       new Date().toISOString(),
            currentMode:     this.currentMode || 'NOT_INITIALIZED',
            activeActions:   this.activeActions,
            lastDecision:    this.lastDecision,
            executionsCount: this.executionsCount,
            lastExecution:   this.executionHistory[this.executionHistory.length - 1] || null
        };
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance = null;
function getNetwork() {
    if (!_instance) _instance = new SheikhaExecutionNeuralCellNetwork();
    return _instance;
}

module.exports = { SheikhaExecutionNeuralCellNetwork, getNetwork, DECISION_MODES, MODE_ACTIONS };
