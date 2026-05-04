/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * DataPipeline — خط أنابيب البيانات
 * تدفق بيانات المنتجات والأسعار والمخزون عبر مراحل التحقق والتطبيع والإثراء
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineEngine = require('./PipelineEngine');

/**
 * ينشئ خط أنابيب جاهزاً لمعالجة بيانات المنتجات والأسعار
 * @param {object} [options]
 * @returns {PipelineEngine}
 */
function createDataPipeline(options = {}) {
    const pipeline = new PipelineEngine({
        name: options.name || 'data-pipeline',
        nameAr: options.nameAr || 'خط أنابيب البيانات',
        mode: 'serial',
        stopOnError: options.stopOnError !== undefined ? options.stopOnError : false
    });

    // ── الخطوة 1: التحقق من صحة المدخلات ─────────────────────────────────────
    pipeline.addStep({
        name: 'validate-input',
        nameAr: 'التحقق من صحة المدخلات',
        handler: async (input) => {
            if (input === null || input === undefined) {
                throw new Error('DataPipeline: المدخلات فارغة');
            }
            const data = Array.isArray(input) ? input : [input];
            return data.map(item => ({ ...item, _validated: true }));
        }
    });

    // ── الخطوة 2: تطبيع الحقول (Normalize) ───────────────────────────────────
    pipeline.addStep({
        name: 'normalize',
        nameAr: 'تطبيع الحقول',
        handler: async (items) => {
            return items.map(item => ({
                id:          item.id          || item._id     || null,
                name:        item.name        || item.nameAr  || item.title || '',
                nameAr:      item.nameAr      || item.name    || '',
                price:       parseFloat(item.price  || item.سعر   || 0),
                currency:    item.currency    || item.عملة   || 'SAR',
                quantity:    parseInt(item.quantity || item.كمية  || 0, 10),
                unit:        item.unit        || item.وحدة   || 'unit',
                category:    item.category    || item.فئة    || 'general',
                source:      item.source      || 'unknown',
                updatedAt:   item.updatedAt   || new Date().toISOString(),
                _validated:  true,
                _normalized: true
            }));
        }
    });

    // ── الخطوة 3: الإثراء بمعلومات إضافية (Enrich) ───────────────────────────
    pipeline.addStep({
        name: 'enrich',
        nameAr: 'إثراء البيانات',
        handler: async (items, ctx) => {
            return items.map(item => ({
                ...item,
                priceFormatted: `${item.price.toFixed(2)} ${item.currency}`,
                inStock: item.quantity > 0,
                enrichedAt: new Date().toISOString(),
                pipelineCtx: ctx.pipeline
            }));
        }
    });

    // ── الخطوة 4: التخزين / الإخراج ──────────────────────────────────────────
    pipeline.addStep({
        name: 'output',
        nameAr: 'الإخراج والتسليم',
        handler: async (items, ctx) => {
            if (typeof ctx.onOutput === 'function') {
                await ctx.onOutput(items);
            }
            return { items, count: items.length, processedAt: new Date().toISOString() };
        }
    });

    return pipeline;
}

module.exports = { createDataPipeline };
