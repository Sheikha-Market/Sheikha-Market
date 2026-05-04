/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * PipelineStep — وحدة الخطوة الأساسية في خط الأنابيب
 * "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه" — الإتقان في كل خطوة
 *
 * كل خطوة تستقبل مدخلات (input) وتُنتج مخرجات (output) بدون ضرر.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class PipelineStep {
    /**
     * @param {object} options
     * @param {string}   options.name        - اسم الخطوة (عربي أو إنجليزي)
     * @param {string}   [options.nameAr]    - الاسم العربي
     * @param {Function} options.handler     - async (input, context) => output
     * @param {boolean}  [options.enabled]   - تفعيل/تعطيل الخطوة
     * @param {string[]} [options.requires]  - أسماء الخطوات التي يجب إنجازها أولاً
     */
    constructor({ name, nameAr, handler, enabled = true, requires = [] }) {
        if (!name) throw new Error('PipelineStep: يجب تحديد اسم الخطوة');
        if (typeof handler !== 'function') throw new Error('PipelineStep: يجب تحديد دالة المعالجة handler');

        this.name     = name;
        this.nameAr   = nameAr || name;
        this.handler  = handler;
        this.enabled  = enabled;
        this.requires = requires;

        // إحصاءات التشغيل
        this.stats = {
            runs: 0,
            successes: 0,
            failures: 0,
            totalDurationMs: 0
        };
    }

    /**
     * تشغيل الخطوة
     * @param {*} input     - المدخلات
     * @param {object} ctx  - سياق خط الأنابيب (context)
     * @returns {Promise<{output: *, meta: object}>}
     */
    async run(input, ctx = {}) {
        if (!this.enabled) {
            return { output: input, meta: { skipped: true, step: this.name } };
        }

        const start = Date.now();
        this.stats.runs++;

        try {
            const output = await this.handler(input, ctx);
            const durationMs = Date.now() - start;
            this.stats.successes++;
            this.stats.totalDurationMs += durationMs;

            return {
                output,
                meta: {
                    step: this.name,
                    nameAr: this.nameAr,
                    success: true,
                    durationMs,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (err) {
            this.stats.failures++;
            throw Object.assign(err, { pipelineStep: this.name });
        }
    }

    /** إحصاءات الخطوة */
    getStats() {
        const avg = this.stats.runs > 0
            ? Math.round(this.stats.totalDurationMs / this.stats.runs)
            : 0;
        return { ...this.stats, avgDurationMs: avg, step: this.name };
    }

    toJSON() {
        return {
            name: this.name,
            nameAr: this.nameAr,
            enabled: this.enabled,
            requires: this.requires,
            stats: this.getStats()
        };
    }
}

module.exports = PipelineStep;
