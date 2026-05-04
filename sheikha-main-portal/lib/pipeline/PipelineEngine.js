/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * PipelineEngine — محرك خط الأنابيب الرئيسي
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ" — التشاور والتنسيق بين الخطوات
 *
 * يدعم:
 *   - serial   : تسلسلي  (خطوة بعد خطوة)
 *   - parallel : متوازي  (جميع الخطوات دفعة واحدة)
 *   - branched : متشعّب (يختار المسار بناءً على شرط)
 *
 * المبدأ: لا ضرر ولا ضرار — إذا فشلت خطوة يمكن الإيقاف أو المتابعة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineStep = require('./PipelineStep');

const MODES = Object.freeze({ SERIAL: 'serial', PARALLEL: 'parallel', BRANCHED: 'branched' });

class PipelineEngine {
    /**
     * @param {object} options
     * @param {string}        options.name          - اسم خط الأنابيب
     * @param {string}        [options.nameAr]      - الاسم بالعربية
     * @param {'serial'|'parallel'|'branched'} [options.mode] - نمط التشغيل
     * @param {boolean}       [options.stopOnError] - إيقاف عند أول خطأ (افتراضي: true)
     * @param {Function}      [options.branchFn]    - دالة التفريع (للنمط branched): (input, ctx) => stepName
     */
    constructor({ name, nameAr, mode = MODES.SERIAL, stopOnError = true, branchFn = null } = {}) {
        if (!name) throw new Error('PipelineEngine: يجب تحديد اسم خط الأنابيب');

        this.name        = name;
        this.nameAr      = nameAr || name;
        this.mode        = MODES[mode.toUpperCase()] || MODES.SERIAL;
        this.stopOnError = stopOnError;
        this.branchFn    = branchFn;

        /** @type {PipelineStep[]} */
        this.steps = [];

        this.stats = {
            runs: 0,
            successes: 0,
            failures: 0
        };
    }

    // ── إدارة الخطوات ─────────────────────────────────────────────────────────

    /**
     * إضافة خطوة إلى خط الأنابيب
     * @param {PipelineStep|object} step
     */
    addStep(step) {
        const s = step instanceof PipelineStep ? step : new PipelineStep(step);
        this.steps.push(s);
        return this;
    }

    /** إضافة عدة خطوات دفعة واحدة */
    addSteps(steps = []) {
        steps.forEach(s => this.addStep(s));
        return this;
    }

    /** حذف خطوة بالاسم */
    removeStep(name) {
        this.steps = this.steps.filter(s => s.name !== name);
        return this;
    }

    // ── التشغيل ───────────────────────────────────────────────────────────────

    /**
     * تشغيل خط الأنابيب
     * @param {*} initialInput   - المدخل الأول
     * @param {object} [context] - سياق مشترك يُمرَّر لكل خطوة
     * @returns {Promise<PipelineResult>}
     */
    async run(initialInput, context = {}) {
        this.stats.runs++;
        const runCtx = { ...context, pipeline: this.name, mode: this.mode, startedAt: new Date().toISOString() };

        let result;
        try {
            switch (this.mode) {
                case MODES.PARALLEL:
                    result = await this._runParallel(initialInput, runCtx);
                    break;
                case MODES.BRANCHED:
                    result = await this._runBranched(initialInput, runCtx);
                    break;
                default:
                    result = await this._runSerial(initialInput, runCtx);
            }
            this.stats.successes++;
            return result;
        } catch (err) {
            this.stats.failures++;
            return this._buildResult(null, [], err);
        }
    }

    // ── الأنماط الداخلية ──────────────────────────────────────────────────────

    async _runSerial(input, ctx) {
        let current = input;
        const stepResults = [];

        for (const step of this.steps) {
            try {
                const { output, meta } = await step.run(current, ctx);
                stepResults.push(meta);
                current = output;
            } catch (err) {
                stepResults.push({ step: step.name, success: false, error: err.message });
                if (this.stopOnError) throw err;
            }
        }
        return this._buildResult(current, stepResults, null);
    }

    async _runParallel(input, ctx) {
        const settled = await Promise.allSettled(
            this.steps.map(step => step.run(input, ctx))
        );

        const stepResults = [];
        const outputs = [];
        let firstError = null;

        settled.forEach((s, i) => {
            if (s.status === 'fulfilled') {
                stepResults.push(s.value.meta);
                outputs.push(s.value.output);
            } else {
                stepResults.push({ step: this.steps[i].name, success: false, error: s.reason?.message });
                if (!firstError) firstError = s.reason;
            }
        });

        if (firstError && this.stopOnError) throw firstError;
        return this._buildResult(outputs, stepResults, firstError);
    }

    async _runBranched(input, ctx) {
        if (typeof this.branchFn !== 'function') {
            throw new Error('PipelineEngine: برنامج التفريع (branchFn) غير معرّف للنمط branched');
        }

        const targetName = await this.branchFn(input, ctx);
        const step = this.steps.find(s => s.name === targetName);

        if (!step) {
            throw new Error(`PipelineEngine: لم يُعثر على الخطوة "${targetName}" في خط الأنابيب "${this.name}"`);
        }

        const { output, meta } = await step.run(input, ctx);
        return this._buildResult(output, [meta], null);
    }

    _buildResult(output, stepResults, error) {
        return {
            pipeline: this.name,
            pipelineAr: this.nameAr,
            mode: this.mode,
            success: !error,
            output,
            stepResults,
            error: error ? error.message : null,
            completedAt: new Date().toISOString()
        };
    }

    // ── المعلومات ─────────────────────────────────────────────────────────────

    getStats() {
        return {
            pipeline: this.name,
            ...this.stats,
            steps: this.steps.map(s => s.getStats())
        };
    }

    toJSON() {
        return {
            name: this.name,
            nameAr: this.nameAr,
            mode: this.mode,
            stopOnError: this.stopOnError,
            steps: this.steps.map(s => s.toJSON()),
            stats: this.getStats()
        };
    }
}

PipelineEngine.MODES = MODES;

module.exports = PipelineEngine;
