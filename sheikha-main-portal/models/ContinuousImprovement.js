/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔄 محرك التحسين المستمر — منظومة شيخة
 *  Continuous Improvement Engine — Kaizen for Neural Logic Models
 *
 *  "وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه: 114
 *
 *  الوظائف الجوهرية:
 *    1. جمع التغذية الراجعة  (Feedback Collection)  — تصحيح نتائج الاستدلال
 *    2. خزينة التجارب        (Experience Replay)    — حفظ أمثلة الإدخال/الهدف
 *    3. جدولة معدل التعلم    (LR Scheduler)         — Cosine Annealing
 *    4. دورة التحسين التلقائي (Auto-Improve Cycle)  — تدريب متواصل على التجارب
 *    5. تتبع الأداء           (Metrics Tracker)      — Loss, Accuracy, Trend
 *    6. إصدارات النموذج      (Model Versioning)     — لقطات وتراجع
 *    7. تقرير التحسين        (Improvement Report)   — ملخص شامل
 *
 *  الخصائص:
 *    ✅ Cosine Annealing — معدل تعلم يتذبذب بين الأقصى والأدنى
 *    ✅ Experience Replay Buffer — خزينة بحجم أقصى مع عينة عشوائية
 *    ✅ Feedback → Auto-Target Vector — تحويل التغذية الراجعة لمتجه هدف
 *    ✅ Model Snapshots — حفظ واسترداد أي إصدار سابق
 *    ✅ Accuracy per Logic — دقة كل منطق على حدة
 *    ✅ Trend Analysis — اتجاه الخسارة (تحسن / تراجع / مستقر)
 *
 *  المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const database   = require('../config/database');
const { getNetwork, N_LOGICS, N_OUTPUT, encodeContext } = require('./LogicNeuralNetwork');
const { ALL_LOGICS } = require('./SheikhaLogics');

// ═══════════════════════════════════════════════════════════════════════════════
// الثوابت
// ═══════════════════════════════════════════════════════════════════════════════

const BUFFER_MAX_SIZE   = 500;   // أقصى حجم لخزينة التجارب
const SNAPSHOT_MAX_KEEP = 10;    // أقصى عدد لقطات محفوظة
const METRICS_WINDOW    = 50;    // نافذة حساب المتوسط المتحرك للخسارة
const MIN_SAMPLES_AUTO  = 5;     // الحد الأدنى للعينات قبل التحسين التلقائي
const AUTO_CYCLE_STEPS  = 20;    // عدد خطوات التدريب في كل دورة تحسين

// ═══════════════════════════════════════════════════════════════════════════════
// 1. LEARNING RATE SCHEDULER — جدولة معدل التعلم
// ═══════════════════════════════════════════════════════════════════════════════

class LRScheduler {
    /**
     * @param {number} lrMax     — معدل التعلم الأقصى
     * @param {number} lrMin     — معدل التعلم الأدنى
     * @param {number} period    — دورة Cosine بالخطوات
     * @param {string} strategy  — 'cosine' | 'step_decay' | 'warmup_cosine'
     */
    constructor(lrMax = 0.01, lrMin = 0.0001, period = 200, strategy = 'cosine') {
        this.lrMax    = lrMax;
        this.lrMin    = lrMin;
        this.period   = period;
        this.strategy = strategy;
        this.step     = 0;
        this.history  = []; // [{ step, lr }]
    }

    // الحصول على معدل التعلم الحالي
    getLR() {
        const t = this.step % this.period;
        let lr;

        switch (this.strategy) {
            case 'cosine':
                // Cosine Annealing: lr = min + 0.5*(max-min)*(1 + cos(π*t/T))
                lr = this.lrMin + 0.5 * (this.lrMax - this.lrMin) *
                     (1 + Math.cos(Math.PI * t / this.period));
                break;

            case 'step_decay':
                // Step Decay: lr *= 0.5 كل period خطوة
                lr = this.lrMax * Math.pow(0.5, Math.floor(this.step / this.period));
                lr = Math.max(lr, this.lrMin);
                break;

            case 'warmup_cosine':
                // Warm-up خلال أول 10% ثم Cosine
                const warmupSteps = Math.floor(this.period * 0.1);
                if (this.step < warmupSteps) {
                    lr = this.lrMax * (this.step / warmupSteps);
                } else {
                    const tAfter = (this.step - warmupSteps) % (this.period - warmupSteps);
                    const remaining = this.period - warmupSteps;
                    lr = this.lrMin + 0.5 * (this.lrMax - this.lrMin) *
                         (1 + Math.cos(Math.PI * tAfter / remaining));
                }
                break;

            default:
                lr = this.lrMax;
        }

        return +lr.toFixed(8);
    }

    // تقدم خطوة واحدة
    advance() {
        const lr = this.getLR();
        this.history.push({ step: this.step, lr });
        if (this.history.length > 200) this.history.shift();
        this.step++;
        return lr;
    }

    toJSON() {
        return {
            lrMax:    this.lrMax,
            lrMin:    this.lrMin,
            period:   this.period,
            strategy: this.strategy,
            step:     this.step,
            currentLR: this.getLR()
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.lrMax    = data.lrMax    ?? this.lrMax;
        this.lrMin    = data.lrMin    ?? this.lrMin;
        this.period   = data.period   ?? this.period;
        this.strategy = data.strategy ?? this.strategy;
        this.step     = data.step     ?? 0;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. EXPERIENCE REPLAY BUFFER — خزينة التجارب
// ═══════════════════════════════════════════════════════════════════════════════

class ExperienceBuffer {
    constructor(maxSize = BUFFER_MAX_SIZE) {
        this.maxSize  = maxSize;
        this.buffer   = []; // [{inputVec, targetVec, context, addedAt, weight}]
        this.totalAdded = 0;
    }

    /**
     * إضافة تجربة جديدة
     * @param {number[]} inputVec   — متجه الإدخال
     * @param {number[]} targetVec  — المتجه المستهدف
     * @param {string}   context    — السياق النصي
     * @param {number}   weight     — وزن أهمية هذه التجربة (1 = عادي، >1 = أهمية عالية)
     */
    add(inputVec, targetVec, context = '', weight = 1.0) {
        const entry = {
            inputVec:  inputVec.slice(),
            targetVec: targetVec.slice(),
            context,
            weight:    Math.max(0.1, weight),
            addedAt:   new Date().toISOString()
        };
        this.buffer.push(entry);
        this.totalAdded++;

        // إذا تجاوز الحجم الأقصى، احذف الأقدم والأقل أهمية
        if (this.buffer.length > this.maxSize) {
            // رتّب: الأحدث + الأعلى وزناً يبقى
            this.buffer.sort((a, b) => b.weight - a.weight || b.addedAt.localeCompare(a.addedAt));
            this.buffer = this.buffer.slice(0, this.maxSize);
        }
        return entry;
    }

    /**
     * سحب عينة عشوائية مرجّحة بالأوزان
     * @param {number} batchSize — عدد العينات المطلوبة
     */
    sample(batchSize = 8) {
        if (this.buffer.length === 0) return [];
        const n = Math.min(batchSize, this.buffer.length);

        // عينة مرجّحة — التجارب ذات الوزن الأعلى لها فرصة اختيار أكبر
        const totalWeight = this.buffer.reduce((s, e) => s + e.weight, 0);
        const chosen = new Set();
        const result  = [];

        let attempts = 0;
        while (result.length < n && attempts < n * 10) {
            const rand = Math.random() * totalWeight;
            let cumul  = 0;
            for (let i = 0; i < this.buffer.length; i++) {
                cumul += this.buffer[i].weight;
                if (rand <= cumul && !chosen.has(i)) {
                    chosen.add(i);
                    result.push(this.buffer[i]);
                    break;
                }
            }
            attempts++;
        }
        return result;
    }

    get size()  { return this.buffer.length; }

    clear() {
        this.buffer     = [];
        this.totalAdded = 0;
    }

    toJSON() {
        return {
            size:       this.buffer.length,
            maxSize:    this.maxSize,
            totalAdded: this.totalAdded,
            // نحفظ آخر 100 فقط في قاعدة البيانات لتوفير المساحة
            buffer: this.buffer.slice(-100).map(e => ({
                inputVec:  e.inputVec,
                targetVec: e.targetVec,
                context:   e.context,
                weight:    e.weight,
                addedAt:   e.addedAt
            }))
        };
    }

    fromJSON(data) {
        if (!data || !data.buffer) return;
        this.buffer     = data.buffer;
        this.totalAdded = data.totalAdded || this.buffer.length;
        this.maxSize    = data.maxSize    || this.maxSize;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. METRICS TRACKER — تتبع مؤشرات الأداء
// ═══════════════════════════════════════════════════════════════════════════════

class MetricsTracker {
    constructor() {
        this.lossHistory      = []; // [{ step, loss, timestamp }]
        this.accuracyHistory  = []; // [{ step, accuracy, timestamp }]
        this.logicAccuracy    = {}; // { logicId: { correct, total } }
        this.cycleResults     = []; // [{ cycleId, steps, avgLoss, avgAccuracy, improvedAt }]
        ALL_LOGICS.forEach(l => {
            this.logicAccuracy[l.id] = { correct: 0, total: 0 };
        });
    }

    // تسجيل خسارة خطوة تدريب
    recordLoss(step, loss) {
        this.lossHistory.push({ step, loss: +loss.toFixed(6), timestamp: new Date().toISOString() });
        if (this.lossHistory.length > 1000) this.lossHistory.shift();
    }

    // تسجيل دقة استدلال
    recordAccuracy(step, accuracy) {
        this.accuracyHistory.push({ step, accuracy: +accuracy.toFixed(4), timestamp: new Date().toISOString() });
        if (this.accuracyHistory.length > 1000) this.accuracyHistory.shift();
    }

    // تحديث دقة منطق معين بناءً على التغذية الراجعة
    updateLogicAccuracy(logicId, correct) {
        if (!this.logicAccuracy[logicId]) {
            this.logicAccuracy[logicId] = { correct: 0, total: 0 };
        }
        this.logicAccuracy[logicId].total++;
        if (correct) this.logicAccuracy[logicId].correct++;
    }

    // تسجيل نتيجة دورة تحسين
    recordCycle(cycleId, steps, avgLoss, avgAccuracy) {
        this.cycleResults.push({
            cycleId,
            steps,
            avgLoss:     +avgLoss.toFixed(6),
            avgAccuracy: +avgAccuracy.toFixed(4),
            improvedAt:  new Date().toISOString()
        });
        if (this.cycleResults.length > 200) this.cycleResults.shift();
    }

    // متوسط متحرك للخسارة (آخر N خطوة)
    getMovingAvgLoss(window = METRICS_WINDOW) {
        const recent = this.lossHistory.slice(-window);
        if (recent.length === 0) return null;
        return +(recent.reduce((s, r) => s + r.loss, 0) / recent.length).toFixed(6);
    }

    // اتجاه الخسارة: 'improving' | 'degrading' | 'stable' | 'unknown'
    getLossTrend() {
        if (this.lossHistory.length < 10) return 'unknown';
        const first5 = this.lossHistory.slice(-10, -5).map(r => r.loss);
        const last5  = this.lossHistory.slice(-5).map(r => r.loss);
        const avgFirst = first5.reduce((a, b) => a + b, 0) / first5.length;
        const avgLast  = last5.reduce((a, b) => a + b, 0)  / last5.length;
        const delta = (avgFirst - avgLast) / (avgFirst || 1);
        if (delta > 0.02)  return 'improving';
        if (delta < -0.02) return 'degrading';
        return 'stable';
    }

    // دقة كل منطق بالنسبة المئوية
    getLogicAccuracyMap() {
        const result = {};
        Object.entries(this.logicAccuracy).forEach(([id, { correct, total }]) => {
            result[id] = total > 0 ? +(correct / total * 100).toFixed(1) : null;
        });
        return result;
    }

    // الدقة الإجمالية
    getOverallAccuracy() {
        let totalCorrect = 0, totalAll = 0;
        Object.values(this.logicAccuracy).forEach(({ correct, total }) => {
            totalCorrect += correct;
            totalAll     += total;
        });
        return totalAll > 0 ? +(totalCorrect / totalAll * 100).toFixed(1) : null;
    }

    toJSON() {
        return {
            lossHistory:     this.lossHistory.slice(-200),
            accuracyHistory: this.accuracyHistory.slice(-200),
            logicAccuracy:   this.logicAccuracy,
            cycleResults:    this.cycleResults.slice(-50)
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.lossHistory     = data.lossHistory     || [];
        this.accuracyHistory = data.accuracyHistory || [];
        this.logicAccuracy   = data.logicAccuracy   || {};
        this.cycleResults    = data.cycleResults    || [];
        // تأكد من وجود مفاتيح كل المنطقيات
        ALL_LOGICS.forEach(l => {
            if (!this.logicAccuracy[l.id]) {
                this.logicAccuracy[l.id] = { correct: 0, total: 0 };
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MODEL VERSIONING — إصدارات النموذج
// ═══════════════════════════════════════════════════════════════════════════════

class ModelVersioning {
    constructor() {
        this.snapshots    = []; // [{ version, trainedSteps, savedAt, weights }]
        this.currentVersion = 'v1.0.0';
        this.versionCounter = 1;
    }

    // أخذ لقطة من النموذج الحالي
    snapshot(net, label = '') {
        const weights = {
            coreLayer:    net.coreLayer.exportWeights(),
            extLayer:     net.extLayer.exportWeights(),
            synthLayer:   net.synthLayer.exportWeights(),
            masterLayer:  net.masterLayer.exportWeights(),
            rankingLayer: net.rankingLayer.exportWeights()
        };

        this.versionCounter++;
        const version = `v${this.versionCounter}.0`;
        this.currentVersion = version;

        const snap = {
            version,
            label:        label || `تدريب-${net.trainedSteps}`,
            trainedSteps: net.trainedSteps,
            totalInferences: net.totalInferences,
            savedAt:      new Date().toISOString(),
            weights
        };

        this.snapshots.push(snap);
        // الاحتفاظ بأحدث SNAPSHOT_MAX_KEEP لقطة
        if (this.snapshots.length > SNAPSHOT_MAX_KEEP) {
            this.snapshots = this.snapshots.slice(-SNAPSHOT_MAX_KEEP);
        }

        return { version: snap.version, label: snap.label, savedAt: snap.savedAt };
    }

    // استرداد نموذج من لقطة معينة
    restore(net, version) {
        const snap = this.snapshots.find(s => s.version === version);
        if (!snap) return false;

        net.coreLayer.importWeights(snap.weights.coreLayer);
        net.extLayer.importWeights(snap.weights.extLayer);
        net.synthLayer.importWeights(snap.weights.synthLayer);
        net.masterLayer.importWeights(snap.weights.masterLayer);
        net.rankingLayer.importWeights(snap.weights.rankingLayer);
        net.trainedSteps    = snap.trainedSteps;
        net.totalInferences = snap.totalInferences;
        return true;
    }

    // قائمة الإصدارات (بدون الأوزان لتقليل البيانات)
    listVersions() {
        return this.snapshots.map(s => ({
            version:      s.version,
            label:        s.label,
            trainedSteps: s.trainedSteps,
            savedAt:      s.savedAt
        })).reverse();
    }

    toJSON() {
        return {
            currentVersion:  this.currentVersion,
            versionCounter:  this.versionCounter,
            // نحفظ آخر 5 لقطات فقط في قاعدة البيانات (الأوزان ثقيلة)
            snapshots: this.snapshots.slice(-5)
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.currentVersion  = data.currentVersion  || 'v1.0.0';
        this.versionCounter  = data.versionCounter  || 1;
        this.snapshots       = data.snapshots        || [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CONTINUOUS IMPROVEMENT ENGINE — محرك التحسين المستمر
// ═══════════════════════════════════════════════════════════════════════════════

class ContinuousImprovementEngine {
    constructor() {
        this.scheduler  = new LRScheduler(0.01, 0.0001, 200, 'cosine');
        this.buffer     = new ExperienceBuffer(BUFFER_MAX_SIZE);
        this.metrics    = new MetricsTracker();
        this.versioning = new ModelVersioning();

        this.cycleCount         = 0;
        this.feedbackCount      = 0;
        this.lastImprovedAt     = null;
        this.autoImproveEnabled = true;
        this.totalFeedback      = 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🟢 FEEDBACK — استقبال التغذية الراجعة
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * addFeedback — تسجيل تغذية راجعة على استدلال سابق
     * @param {object} opts
     * @param {string}   opts.inferenceId    — معرف الاستدلال (للتسجيل)
     * @param {string}   opts.context        — السياق النصي الأصلي
     * @param {number[]} opts.inputVector    — متجه الإدخال الأصلي
     * @param {string[]} opts.correctLogics  — المنطقيات الصحيحة التي كان يجب تفعيلها
     * @param {string[]} opts.wrongLogics    — المنطقيات التي فُعِّلت خطأً
     * @param {number}   opts.importance     — أهمية هذا المثال (1–5)
     * @returns {object} نتيجة إضافة التغذية الراجعة
     */
    addFeedback({ inferenceId = '', context = '', inputVector, correctLogics = [], wrongLogics = [], importance = 1 }) {
        // بناء متجه الهدف من التغذية الراجعة
        const targetVec = new Array(N_OUTPUT).fill(0);
        correctLogics.forEach(logicId => {
            const idx = ALL_LOGICS.findIndex(l => l.id === logicId);
            if (idx !== -1) targetVec[idx] = 1;
        });

        // بناء متجه الإدخال (من السياق إن لم يُقدَّم)
        let vec = inputVector;
        if (!vec || vec.length < N_OUTPUT) {
            vec = encodeContext(context);
        }
        vec = vec.slice(0, N_OUTPUT).map(v => Number(v) || 0);

        // وزن التجربة = الأهمية × 1 (صحيحة) أو 1.5 (كانت خاطئة)
        const weight = Math.min(5, Math.max(0.5, importance)) * (wrongLogics.length > 0 ? 1.5 : 1.0);

        // إضافة للخزينة
        this.buffer.add(vec, targetVec, context, weight);

        // تحديث مؤشرات الدقة
        correctLogics.forEach(id => this.metrics.updateLogicAccuracy(id, true));
        wrongLogics.forEach(id => this.metrics.updateLogicAccuracy(id, false));

        this.feedbackCount++;
        this.totalFeedback++;

        // تحسين تلقائي إذا تجاوزنا الحد الأدنى من العينات
        let autoImproveResult = null;
        if (this.autoImproveEnabled && this.buffer.size >= MIN_SAMPLES_AUTO && this.feedbackCount % 10 === 0) {
            autoImproveResult = this.runImproveCycle(AUTO_CYCLE_STEPS);
        }

        return {
            feedbackId:    `fb_${Date.now()}`,
            bufferSize:    this.buffer.size,
            targetVec,
            weight,
            autoImproved:  autoImproveResult !== null,
            cycleResult:   autoImproveResult
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 🔄 IMPROVE CYCLE — دورة التحسين التلقائي
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * runImproveCycle — تشغيل دورة تحسين كاملة
     * @param {number} steps      — عدد خطوات التدريب في هذه الدورة
     * @param {number} batchSize  — عدد العينات من الخزينة لكل خطوة
     */
    runImproveCycle(steps = AUTO_CYCLE_STEPS, batchSize = 8) {
        if (this.buffer.size < MIN_SAMPLES_AUTO) {
            return {
                success:  false,
                reason:   `خزينة التجارب صغيرة جداً (${this.buffer.size} < ${MIN_SAMPLES_AUTO})`,
                bufferSize: this.buffer.size
            };
        }

        const net     = getNetwork();
        const losses  = [];
        let   step    = 0;

        for (let s = 0; s < steps; s++) {
            const lr      = this.scheduler.advance();
            const samples = this.buffer.sample(batchSize);
            if (samples.length === 0) break;

            for (const sample of samples) {
                const loss = net.train(sample.inputVec.slice(), sample.targetVec.slice(), lr);
                if (loss !== null) {
                    losses.push(loss);
                    this.metrics.recordLoss(net.trainedSteps, loss);
                }
            }
            step++;
        }

        const avgLoss = losses.length > 0
            ? losses.reduce((a, b) => a + b, 0) / losses.length
            : 0;

        // دقة تقريبية بناءً على متوسط الخسارة
        const approxAccuracy = Math.max(0, 1 - avgLoss * 2);
        this.metrics.recordAccuracy(net.trainedSteps, approxAccuracy);

        this.cycleCount++;
        this.lastImprovedAt = new Date().toISOString();

        const cycleId = `cyc_${this.cycleCount}_${Date.now()}`;
        this.metrics.recordCycle(cycleId, steps, avgLoss, approxAccuracy);

        // حفظ الشبكة بعد الدورة
        net.save();
        this.save();

        return {
            success:     true,
            cycleId,
            cycleNumber: this.cycleCount,
            stepsRun:    step,
            samplesUsed: losses.length,
            avgLoss:     +avgLoss.toFixed(6),
            approxAccuracy: +(approxAccuracy * 100).toFixed(1),
            lossTrend:   this.metrics.getLossTrend(),
            currentLR:   this.scheduler.getLR(),
            trainedSteps: net.trainedSteps
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 📊 METRICS — مؤشرات الأداء
    // ─────────────────────────────────────────────────────────────────────────

    getMetrics() {
        const net = getNetwork();
        return {
            lossHistory:       this.metrics.lossHistory.slice(-50),
            accuracyHistory:   this.metrics.accuracyHistory.slice(-50),
            movingAvgLoss:     this.metrics.getMovingAvgLoss(),
            lossTrend:         this.metrics.getLossTrend(),
            overallAccuracy:   this.metrics.getOverallAccuracy(),
            logicAccuracy:     this.metrics.getLogicAccuracyMap(),
            scheduler:         this.scheduler.toJSON(),
            bufferSize:        this.buffer.size,
            bufferTotalAdded:  this.buffer.totalAdded,
            cycleCount:        this.cycleCount,
            feedbackCount:     this.totalFeedback,
            lastImprovedAt:    this.lastImprovedAt,
            trainedSteps:      net.trainedSteps,
            recentCycles:      this.metrics.cycleResults.slice(-10)
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 📷 VERSIONING — إصدارات النموذج
    // ─────────────────────────────────────────────────────────────────────────

    takeSnapshot(label = '') {
        const net = getNetwork();
        return this.versioning.snapshot(net, label);
    }

    restoreVersion(version) {
        const net = getNetwork();
        const ok  = this.versioning.restore(net, version);
        if (ok) {
            net.save();
            this.save();
        }
        return ok;
    }

    listVersions() {
        return this.versioning.listVersions();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 📋 IMPROVEMENT REPORT — تقرير التحسين الشامل
    // ─────────────────────────────────────────────────────────────────────────

    getImprovementReport() {
        const net      = getNetwork();
        const metrics  = this.getMetrics();
        const versions = this.listVersions();

        // أفضل 3 منطقيات دقةً وأسوأ 3
        const accuracyEntries = Object.entries(metrics.logicAccuracy)
            .filter(([, v]) => v !== null)
            .sort((a, b) => b[1] - a[1]);
        const top3    = accuracyEntries.slice(0, 3).map(([id, acc]) => ({ id, accuracy: acc }));
        const bottom3 = accuracyEntries.slice(-3).map(([id, acc]) => ({ id, accuracy: acc }));

        // مقارنة أول وآخر دورة
        const firstCycle = this.metrics.cycleResults[0]    || null;
        const lastCycle  = this.metrics.cycleResults.slice(-1)[0] || null;
        const lossImprovement = (firstCycle && lastCycle)
            ? +(((firstCycle.avgLoss - lastCycle.avgLoss) / (firstCycle.avgLoss || 1)) * 100).toFixed(1)
            : null;

        return {
            timestamp:        new Date().toISOString(),
            summary: {
                trainedSteps:     net.trainedSteps,
                totalInferences:  net.totalInferences,
                cycleCount:       this.cycleCount,
                feedbackCount:    this.totalFeedback,
                bufferSize:       this.buffer.size,
                currentVersion:   this.versioning.currentVersion,
                autoImproveEnabled: this.autoImproveEnabled
            },
            performance: {
                overallAccuracy:  metrics.overallAccuracy,
                movingAvgLoss:    metrics.movingAvgLoss,
                lossTrend:        metrics.lossTrend,
                lossImprovement:  lossImprovement !== null ? `${lossImprovement}%` : null,
                firstCycleLoss:   firstCycle?.avgLoss || null,
                lastCycleLoss:    lastCycle?.avgLoss  || null
            },
            topLogics:    top3,
            bottomLogics: bottom3,
            scheduler:    this.scheduler.toJSON(),
            recentCycles: this.metrics.cycleResults.slice(-5),
            versions:     versions.slice(0, 5),
            recommendations: this._buildRecommendations(metrics)
        };
    }

    // توصيات تلقائية بناءً على مؤشرات الأداء
    _buildRecommendations(metrics) {
        const recs = [];
        const trend = metrics.lossTrend;

        if (trend === 'degrading') {
            recs.push({ level: 'warning', ar: 'الخسارة في ازدياد — يُنصح بتقليل معدل التعلم أو إضافة بيانات تدريب أفضل' });
        }
        if (metrics.bufferSize < MIN_SAMPLES_AUTO) {
            recs.push({ level: 'info', ar: `خزينة التجارب تحتاج ${MIN_SAMPLES_AUTO - metrics.bufferSize} عينة إضافية لبدء التحسين التلقائي` });
        }
        if (metrics.overallAccuracy !== null && metrics.overallAccuracy < 60) {
            recs.push({ level: 'warning', ar: 'الدقة الإجمالية أقل من 60% — يُنصح بمراجعة جودة التغذية الراجعة' });
        }
        if (metrics.cycleCount > 10 && trend === 'stable') {
            recs.push({ level: 'success', ar: 'النموذج مستقر — يمكن أخذ لقطة وتوثيق الإصدار الحالي' });
        }
        if (trend === 'improving') {
            recs.push({ level: 'success', ar: 'النموذج يتحسن — استمر في إضافة التغذية الراجعة' });
        }
        if (recs.length === 0) {
            recs.push({ level: 'info', ar: 'النموذج يعمل بشكل طبيعي — لا توصيات حرجة حالياً' });
        }
        return recs;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 💾 PERSIST — حفظ واسترداد حالة محرك التحسين
    // ─────────────────────────────────────────────────────────────────────────

    save() {
        const data = {
            scheduler:      this.scheduler.toJSON(),
            buffer:         this.buffer.toJSON(),
            metrics:        this.metrics.toJSON(),
            versioning:     this.versioning.toJSON(),
            cycleCount:     this.cycleCount,
            feedbackCount:  this.totalFeedback,
            lastImprovedAt: this.lastImprovedAt,
            autoImproveEnabled: this.autoImproveEnabled,
            savedAt:        new Date().toISOString()
        };
        database.write('continuousImprovement', data);
        return data;
    }

    load() {
        const data = database.read('continuousImprovement');
        if (!data) return false;
        this.scheduler.fromJSON(data.scheduler);
        this.buffer.fromJSON(data.buffer);
        this.metrics.fromJSON(data.metrics);
        this.versioning.fromJSON(data.versioning);
        this.cycleCount         = data.cycleCount         || 0;
        this.totalFeedback      = data.feedbackCount      || 0;
        this.lastImprovedAt     = data.lastImprovedAt     || null;
        this.autoImproveEnabled = data.autoImproveEnabled !== false;
        return true;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine = null;

function getEngine() {
    if (!_engine) {
        _engine = new ContinuousImprovementEngine();
        _engine.load();
    }
    return _engine;
}

// ═══════════════════════════════════════════════════════════════════════════════
// التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    ContinuousImprovementEngine,
    LRScheduler,
    ExperienceBuffer,
    MetricsTracker,
    ModelVersioning,
    getEngine
};
