/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * ProductionPipeline — خط أنابيب الإنتاج والمصانع
 * «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه» — البيهقي
 *
 * يُدير دورة الإنتاج:
 *   1. استلام أمر الإنتاج
 *   2. التحقق من الموارد والمواد
 *   3. التدقيق الشرعي
 *   4. جدولة الإنتاج
 *   5. التنفيذ ومراقبة الجودة
 *   6. التسليم والتوثيق
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineEngine = require('./PipelineEngine');
const { createShariaPipeline } = require('./ShariaPipeline');

/**
 * ينشئ خط أنابيب الإنتاج
 * @param {object} [options]
 * @returns {PipelineEngine}
 */
function createProductionPipeline(options = {}) {
    const shariaPipeline = createShariaPipeline();

    const pipeline = new PipelineEngine({
        name: options.name || 'production-pipeline',
        nameAr: options.nameAr || 'خط أنابيب الإنتاج',
        mode: 'serial',
        stopOnError: true
    });

    // ── الخطوة 1: استلام وتحقق أمر الإنتاج ──────────────────────────────────
    pipeline.addStep({
        name: 'receive-order',
        nameAr: 'استلام أمر الإنتاج',
        handler: async (order) => {
            if (!order) throw new Error('ProductionPipeline: أمر الإنتاج فارغ');

            return {
                orderId:    order.orderId    || `PROD-${Date.now()}`,
                product:    order.product    || order.منتج    || 'unknown',
                quantity:   parseInt(order.quantity  || order.كمية    || 1, 10),
                factory:    order.factory    || order.مصنع    || 'default',
                priority:   order.priority   || order.أولوية || 'normal',
                requestedBy: order.requestedBy || 'system',
                requestedAt: new Date().toISOString(),
                status: 'received',
                _original: order
            };
        }
    });

    // ── الخطوة 2: التحقق من توفر الموارد ─────────────────────────────────────
    pipeline.addStep({
        name: 'check-resources',
        nameAr: 'التحقق من الموارد',
        handler: async (order, ctx) => {
            const resourceManager = ctx.resourceManager;

            if (resourceManager && typeof resourceManager.check === 'function') {
                const available = await resourceManager.check(order);
                if (!available.sufficient) {
                    throw new Error(`ProductionPipeline: موارد غير كافية — ${available.shortage}`);
                }
                return { ...order, _resources: available, status: 'resources-confirmed' };
            }

            // بيئة تجريبية: نفترض توفر الموارد
            return {
                ...order,
                _resources: { sufficient: true, note: 'تحقق تجريبي' },
                status: 'resources-confirmed'
            };
        }
    });

    // ── الخطوة 3: التدقيق الشرعي على أمر الإنتاج ────────────────────────────
    pipeline.addStep({
        name: 'sharia-check',
        nameAr: 'التدقيق الشرعي',
        handler: async (order) => {
            const auditInput = {
                price: order.unitPrice || 0,
                quantity: order.quantity,
                consented: true,
                _type: 'production'
            };

            const auditResult = await shariaPipeline.run(auditInput);

            if (auditResult.success && auditResult.output?.nonCompliant?.length > 0) {
                const violations = auditResult.output.nonCompliant[0]?._shariaAudit?.violations || [];
                throw new Error(`ProductionPipeline: مخالفة شرعية — ${violations.map(v => v.nameAr).join(', ')}`);
            }

            return { ...order, _shariaCompliant: true, status: 'sharia-approved' };
        }
    });

    // ── الخطوة 4: جدولة الإنتاج ──────────────────────────────────────────────
    pipeline.addStep({
        name: 'schedule',
        nameAr: 'جدولة الإنتاج',
        handler: async (order, ctx) => {
            const scheduler = ctx.scheduler;
            let scheduledStart, estimatedEnd;

            if (scheduler && typeof scheduler.schedule === 'function') {
                const slot = await scheduler.schedule(order);
                scheduledStart = slot.start;
                estimatedEnd   = slot.end;
            } else {
                scheduledStart = new Date().toISOString();
                const endDate  = new Date(Date.now() + order.quantity * 60000);
                estimatedEnd   = endDate.toISOString();
            }

            return {
                ...order,
                scheduledStart,
                estimatedEnd,
                status: 'scheduled'
            };
        }
    });

    // ── الخطوة 5: التنفيذ ومراقبة الجودة ─────────────────────────────────────
    pipeline.addStep({
        name: 'execute-and-qa',
        nameAr: 'التنفيذ ومراقبة الجودة',
        handler: async (order, ctx) => {
            const executor = ctx.executor;
            let produced, qualityScore;

            if (executor && typeof executor.execute === 'function') {
                const result = await executor.execute(order);
                produced      = result.produced;
                qualityScore  = result.qualityScore;
            } else {
                produced     = order.quantity;
                qualityScore = 1.0;
            }

            if (qualityScore < 0.7) {
                throw new Error(`ProductionPipeline: جودة الإنتاج منخفضة (${(qualityScore * 100).toFixed(0)}%)`);
            }

            return {
                ...order,
                produced,
                qualityScore,
                status: 'produced'
            };
        }
    });

    // ── الخطوة 6: التسليم والتوثيق ────────────────────────────────────────────
    pipeline.addStep({
        name: 'deliver-and-document',
        nameAr: 'التسليم والتوثيق',
        handler: async (order) => {
            return {
                orderId:      order.orderId,
                product:      order.product,
                quantity:     order.quantity,
                produced:     order.produced,
                factory:      order.factory,
                qualityScore: order.qualityScore,
                shariaCompliant: order._shariaCompliant,
                scheduledStart:  order.scheduledStart,
                estimatedEnd:    order.estimatedEnd,
                completedAt:  new Date().toISOString(),
                status: 'delivered',
                certificate: `SHEIKHA-PROD-${order.orderId}`
            };
        }
    });

    return pipeline;
}

module.exports = { createProductionPipeline };
