/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * MarketPipeline — خط أنابيب معالجة طلبات الأسواق
 * "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ"
 * — النساء ٢٩
 *
 * يعالج طلبات الأسواق عبر:
 *   1. التحقق من صحة الطلب
 *   2. التدقيق الشرعي
 *   3. المطابقة مع المعروضات (Matching)
 *   4. توليد الاستجابة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineEngine = require('./PipelineEngine');
const { createShariaPipeline } = require('./ShariaPipeline');

/**
 * ينشئ خط أنابيب معالجة طلبات الأسواق
 * @param {object} [options]
 * @returns {PipelineEngine}
 */
function createMarketPipeline(options = {}) {
    const shariaPipeline = createShariaPipeline();

    const pipeline = new PipelineEngine({
        name: options.name || 'market-pipeline',
        nameAr: options.nameAr || 'خط أنابيب السوق',
        mode: 'serial',
        stopOnError: true
    });

    // ── الخطوة 1: التحقق من صحة الطلب ────────────────────────────────────────
    pipeline.addStep({
        name: 'validate-request',
        nameAr: 'التحقق من الطلب',
        handler: async (request) => {
            if (!request) throw new Error('MarketPipeline: الطلب فارغ');

            const req = typeof request === 'string' ? { query: request } : { ...request };

            if (!req.type) req.type = 'search';
            if (!req.market) req.market = 'general';
            if (!req.userId && !req.anonymous) req.anonymous = true;

            req._validatedAt = new Date().toISOString();
            return req;
        }
    });

    // ── الخطوة 2: التدقيق الشرعي على الطلب ───────────────────────────────────
    pipeline.addStep({
        name: 'sharia-check',
        nameAr: 'التدقيق الشرعي',
        handler: async (request) => {
            const auditInput = {
                ...request,
                _type: request.type || 'query',
                consented: true  // الطلب نفسه لا يحتاج موافقة — البيع فقط يحتاجها
            };

            const auditResult = await shariaPipeline.run(auditInput);

            if (auditResult.success && auditResult.output) {
                const classified = auditResult.output;
                const item = Array.isArray(classified.compliant)
                    ? classified.compliant[0]
                    : auditInput;

                if (classified.nonCompliant && classified.nonCompliant.length > 0) {
                    return {
                        ...request,
                        _shariaViolations: classified.nonCompliant[0]?._shariaAudit?.violations || [],
                        _shariaCompliant: false
                    };
                }
                return { ...request, _shariaCompliant: true, _shariaAudit: item?._shariaAudit };
            }
            return { ...request, _shariaCompliant: true };
        }
    });

    // ── الخطوة 3: المطابقة والبحث (Matching) ──────────────────────────────────
    pipeline.addStep({
        name: 'matching',
        nameAr: 'المطابقة والبحث',
        handler: async (request, ctx) => {
            // محرك المطابقة الفعلي يُمرَّر عبر ctx.matchingEngine
            if (ctx.matchingEngine && typeof ctx.matchingEngine.search === 'function') {
                const matches = await ctx.matchingEngine.search(request);
                return { ...request, _matches: matches };
            }

            // بيانات تجريبية عند غياب المحرك
            return {
                ...request,
                _matches: [],
                _matchingNote: 'لا يوجد محرك مطابقة — نتائج فارغة'
            };
        }
    });

    // ── الخطوة 4: بناء الاستجابة ──────────────────────────────────────────────
    pipeline.addStep({
        name: 'build-response',
        nameAr: 'بناء الاستجابة',
        handler: async (request) => {
            return {
                success: true,
                market: request.market,
                type: request.type,
                shariaCompliant: request._shariaCompliant !== false,
                shariaViolations: request._shariaViolations || [],
                results: request._matches || [],
                count: (request._matches || []).length,
                processedAt: new Date().toISOString()
            };
        }
    });

    return pipeline;
}

module.exports = { createMarketPipeline };
