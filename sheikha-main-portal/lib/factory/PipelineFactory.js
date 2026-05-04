/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * PipelineFactory — مصنع خطوط الأنابيب
 * يُنتج خطوط أنابيب جاهزة بناءً على النوع المطلوب
 *
 * «فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ» — آل عمران ١٥٩
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineEngine    = require('../pipeline/PipelineEngine');
const { globalRegistry } = require('../pipeline/PipelineRegistry');
const { createDataPipeline }       = require('../pipeline/DataPipeline');
const { createShariaPipeline }     = require('../pipeline/ShariaPipeline');
const { createMarketPipeline }     = require('../pipeline/MarketPipeline');
const { createProductionPipeline } = require('../pipeline/ProductionPipeline');

const PIPELINE_TYPES = Object.freeze({
    DATA:       'data',
    SHARIA:     'sharia',
    MARKET:     'market',
    PRODUCTION: 'production',
    CUSTOM:     'custom'
});

class PipelineFactory {
    constructor({ registry = globalRegistry } = {}) {
        this._registry = registry;
        this._counter  = 0;
    }

    /**
     * إنشاء خط أنابيب حسب النوع
     * @param {object} config
     * @param {string}  config.type       - النوع: data|sharia|market|production|custom
     * @param {string}  [config.name]     - اسم مخصص (اختياري)
     * @param {string}  [config.nameAr]   - الاسم العربي
     * @param {boolean} [config.register] - تسجيل في السجل العالمي (افتراضي: true)
     * @param {object}  [config.options]  - خيارات إضافية للمصنع
     * @returns {PipelineEngine}
     */
    create(config = {}) {
        if (!config.type) throw new Error('PipelineFactory: يجب تحديد نوع خط الأنابيب');

        const type = String(config.type).toLowerCase();
        this._counter++;

        const pipelineOptions = {
            ...config.options,
            name:   config.name   || `${type}-pipeline-${this._counter}`,
            nameAr: config.nameAr || this._defaultNameAr(type)
        };

        let pipeline;
        switch (type) {
            case PIPELINE_TYPES.DATA:
                pipeline = createDataPipeline(pipelineOptions);
                break;
            case PIPELINE_TYPES.SHARIA:
                pipeline = createShariaPipeline(pipelineOptions);
                break;
            case PIPELINE_TYPES.MARKET:
                pipeline = createMarketPipeline(pipelineOptions);
                break;
            case PIPELINE_TYPES.PRODUCTION:
                pipeline = createProductionPipeline(pipelineOptions);
                break;
            case PIPELINE_TYPES.CUSTOM: {
                if (!config.steps || !Array.isArray(config.steps)) {
                    throw new Error('PipelineFactory: النوع custom يتطلب تحديد خطوات steps[]');
                }
                pipeline = new PipelineEngine(pipelineOptions);
                pipeline.addSteps(config.steps);
                break;
            }
            default:
                throw new Error(`PipelineFactory: نوع غير مدعوم "${type}". الأنواع المدعومة: ${Object.values(PIPELINE_TYPES).join(', ')}`);
        }

        if (config.register !== false) {
            try {
                this._registry.registerOrReplace(pipeline);
            } catch (_) {
                // السجل لا يمنع الإنشاء
            }
        }

        return pipeline;
    }

    _defaultNameAr(type) {
        const names = {
            data:       'خط أنابيب البيانات',
            sharia:     'خط أنابيب التدقيق الشرعي',
            market:     'خط أنابيب السوق',
            production: 'خط أنابيب الإنتاج',
            custom:     'خط أنابيب مخصص'
        };
        return names[type] || 'خط أنابيب';
    }

    getStats() {
        return {
            factory: 'PipelineFactory',
            produced: this._counter,
            registered: this._registry.size
        };
    }

    toJSON() {
        return { ...this.getStats(), registry: this._registry.toJSON() };
    }
}

PipelineFactory.PIPELINE_TYPES = PIPELINE_TYPES;

module.exports = PipelineFactory;
