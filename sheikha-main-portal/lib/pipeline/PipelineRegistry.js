/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * PipelineRegistry — سجل خطوط الأنابيب المعرّفة في منظومة شيخة
 * "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ"
 *
 * مسؤوليات السجل:
 *   - تسجيل خطوط الأنابيب وتخزينها
 *   - استرجاعها بالاسم
 *   - عرض قائمة بجميع الأنابيب
 *   - منع التكرار (لا تسجيل اسم مرتين)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineEngine = require('./PipelineEngine');

class PipelineRegistry {
    constructor() {
        /** @type {Map<string, PipelineEngine>} */
        this._registry = new Map();
        this._createdAt = new Date().toISOString();
    }

    // ── التسجيل ───────────────────────────────────────────────────────────────

    /**
     * تسجيل خط أنابيب
     * @param {PipelineEngine} pipeline
     */
    register(pipeline) {
        if (!(pipeline instanceof PipelineEngine)) {
            throw new TypeError('PipelineRegistry: يجب أن يكون الكائن نسخة من PipelineEngine');
        }
        if (this._registry.has(pipeline.name)) {
            throw new Error(`PipelineRegistry: خط الأنابيب "${pipeline.name}" مسجّل مسبقاً`);
        }
        this._registry.set(pipeline.name, pipeline);
        return this;
    }

    /** تسجيل أو استبدال (upsert) */
    registerOrReplace(pipeline) {
        if (!(pipeline instanceof PipelineEngine)) {
            throw new TypeError('PipelineRegistry: يجب أن يكون الكائن نسخة من PipelineEngine');
        }
        this._registry.set(pipeline.name, pipeline);
        return this;
    }

    // ── الاسترجاع ─────────────────────────────────────────────────────────────

    /**
     * @param {string} name
     * @returns {PipelineEngine|undefined}
     */
    get(name) {
        return this._registry.get(name);
    }

    /** استرجاع أو رمي خطأ إذا لم يُعثر عليه */
    getOrThrow(name) {
        const p = this._registry.get(name);
        if (!p) throw new Error(`PipelineRegistry: لم يُعثر على خط الأنابيب "${name}"`);
        return p;
    }

    has(name) {
        return this._registry.has(name);
    }

    // ── القائمة ───────────────────────────────────────────────────────────────

    list() {
        return [...this._registry.values()].map(p => p.toJSON());
    }

    names() {
        return [...this._registry.keys()];
    }

    get size() {
        return this._registry.size;
    }

    // ── التشغيل ───────────────────────────────────────────────────────────────

    /**
     * تشغيل خط أنابيب بالاسم
     * @param {string} name
     * @param {*} input
     * @param {object} [context]
     */
    async run(name, input, context = {}) {
        return this.getOrThrow(name).run(input, context);
    }

    // ── المعلومات ─────────────────────────────────────────────────────────────

    toJSON() {
        return {
            createdAt: this._createdAt,
            count: this.size,
            pipelines: this.list()
        };
    }
}

// Singleton: سجل عالمي واحد لكل المنظومة
const globalRegistry = new PipelineRegistry();

module.exports = { PipelineRegistry, globalRegistry };
