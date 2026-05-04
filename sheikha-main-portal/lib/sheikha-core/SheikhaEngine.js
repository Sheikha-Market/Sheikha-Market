/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ███████╗██╗  ██╗███████╗██╗██╗  ██╗██╗  ██╗ █████╗
 *  ██╔════╝██║  ██║██╔════╝██║██║ ██╔╝██║  ██║██╔══██╗
 *  ███████╗███████║█████╗  ██║█████╔╝ ███████║███████║
 *  ╚════██║██╔══██║██╔══╝  ██║██╔═██╗ ██╔══██║██╔══██║
 *  ███████║██║  ██║███████╗██║██║  ██╗██║  ██║██║  ██║
 *  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
 *
 *  SheikhaEngine — المحرك الموحّد لمنظومة شيخة
 *  Pipeline + Factory + Neural Network = المنظومة الكاملة
 *
 *  "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ" — الحديد ٤
 *  الله شاهد على كل ما يصدر من هذا المحرك
 *
 *  المالك: سلمان أحمد بن سلمان الراجح
 *  الترخيص: خاص — جميع الحقوق محفوظة © سوق شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ── المكونات الرئيسية ──────────────────────────────────────────────────────────
const { globalRegistry }  = require('../pipeline/PipelineRegistry');
const { globalNetwork }   = require('../factory/FactoryNetwork');
const NeuralNetwork       = require('../neural/NeuralNetwork');
const NeuralNode          = require('../neural/NeuralNode');
const { shariaActivation } = require('../neural/WeightedSharia');

// مصانع
const MarketFactory       = require('../factory/MarketFactory');
const OrganizationFactory = require('../factory/OrganizationFactory');
const PipelineFactory     = require('../factory/PipelineFactory');

// أنابيب
const { createDataPipeline }       = require('../pipeline/DataPipeline');
const { createShariaPipeline }     = require('../pipeline/ShariaPipeline');
const { createMarketPipeline }     = require('../pipeline/MarketPipeline');
const { createProductionPipeline } = require('../pipeline/ProductionPipeline');

const VERSION = '1.0.0';

class SheikhaEngine {
    /**
     * @param {object} [options]
     * @param {boolean} [options.autoWire]  - ربط جميع الكيانات تلقائياً في الشبكة العصبية
     * @param {boolean} [options.verbose]   - طباعة رسائل التشغيل
     */
    constructor({ autoWire = true, verbose = false } = {}) {
        this.version   = VERSION;
        this.name      = 'SheikhaEngine';
        this.nameAr    = 'محرك شيخة الموحّد';
        this.verbose   = verbose;
        this.startedAt = new Date().toISOString();

        // ── طبقة Pipeline ────────────────────────────────────────────────────
        this.pipelineRegistry = globalRegistry;

        // ── طبقة Factory ─────────────────────────────────────────────────────
        this.factories = globalNetwork;

        // ── طبقة Neural Network ──────────────────────────────────────────────
        this.neuralNet = new NeuralNetwork({
            name:          'sheikha-main-network',
            activationFn:  shariaActivation,
            learningEnabled: true
        });

        // ── التهيئة الكاملة ───────────────────────────────────────────────────
        this._initPipelines();
        this._initNeuralNodes();
        if (autoWire) this._wireNetwork();

        this._log(`✅ ${this.nameAr} v${VERSION} — جاهز للتشغيل`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // تهيئة خطوط الأنابيب
    // ══════════════════════════════════════════════════════════════════════════

    _initPipelines() {
        const factory = new PipelineFactory({ registry: this.pipelineRegistry });
        const defs = [
            { type: 'data',       name: 'data-pipeline' },
            { type: 'sharia',     name: 'sharia-pipeline' },
            { type: 'market',     name: 'market-pipeline' },
            { type: 'production', name: 'production-pipeline' }
        ];
        for (const def of defs) {
            if (!this.pipelineRegistry.has(def.name)) {
                factory.create({ type: def.type, name: def.name });
            }
        }
        this._log(`📋 خطوط الأنابيب: ${this.pipelineRegistry.size} مُسجَّل`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // تهيئة عقد الشبكة العصبية
    // ══════════════════════════════════════════════════════════════════════════

    _initNeuralNodes() {
        // إضافة عقد الأسواق
        for (const market of this.factories.market.list()) {
            this._addEntityNode(market, NeuralNode.NODE_TYPES.MARKET);
        }

        // إضافة عقد المنظمات
        for (const org of this.factories.organization.list()) {
            this._addEntityNode(org, NeuralNode.NODE_TYPES.ORGANIZATION);
        }

        // إضافة عقد خطوط الأنابيب
        for (const pipeline of this.pipelineRegistry.list()) {
            try {
                this.neuralNet.upsertNode({
                    id:     'pipeline:' + pipeline.name,
                    name:   pipeline.name,
                    nameAr: pipeline.nameAr,
                    type:   NeuralNode.NODE_TYPES.PIPELINE,
                    weight: 0.9,
                    entity: pipeline
                });
            } catch (_) {}
        }

        this._log(`🧠 عقد الشبكة: ${this.neuralNet.nodeCount} عقدة`);
    }

    _addEntityNode(entity, type) {
        try {
            this.neuralNet.upsertNode({
                id:     `${type}:${entity.id}`,
                name:   entity.name,
                nameAr: entity.nameAr,
                type,
                weight: entity.charter ? 1.0 : 0.5,
                entity
            });
        } catch (_) {}
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ربط الشبكة (wiring)
    // ══════════════════════════════════════════════════════════════════════════

    _wireNetwork() {
        const nodeIds = [...this.neuralNet.nodes.keys()];
        if (nodeIds.length < 2) return;

        // ربط عقد الأسواق بعقد خطوط الأنابيب
        const marketNodes   = nodeIds.filter(id => id.startsWith('market:'));
        const pipelineNodes = nodeIds.filter(id => id.startsWith('pipeline:'));

        marketNodes.forEach(mId => {
            pipelineNodes.forEach(pId => {
                try { this.neuralNet.connect(mId, pId, 0.8); } catch (_) {}
            });
        });

        // ربط عقد المنظمات بعقد الأسواق
        const orgNodes = nodeIds.filter(id => id.startsWith('organization:'));
        orgNodes.forEach(oId => {
            marketNodes.forEach(mId => {
                try { this.neuralNet.connect(oId, mId, 0.9); } catch (_) {}
            });
        });

        this._log(`🔗 الروابط: ${this.neuralNet.getEdges().length} رابط`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // واجهة API الموحّدة
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * تشغيل خط أنابيب بالاسم
     * @param {string} pipelineName
     * @param {*}      input
     * @param {object} [context]
     */
    async runPipeline(pipelineName, input, context = {}) {
        return this.pipelineRegistry.run(pipelineName, input, context);
    }

    /**
     * معالجة بيانات عبر خط الأنابيب المناسب
     * @param {'data'|'sharia'|'market'|'production'} type
     * @param {*} input
     * @param {object} [context]
     */
    async process(type, input, context = {}) {
        const name = `${type}-pipeline`;
        if (!this.pipelineRegistry.has(name)) {
            throw new Error(`SheikhaEngine: خط الأنابيب "${name}" غير مسجّل`);
        }
        return this.runPipeline(name, input, context);
    }

    /**
     * إنشاء كيان جديد عبر المصنع
     * @param {'market'|'organization'|'pipeline'} factoryType
     * @param {object} config
     */
    create(factoryType, config = {}) {
        const entity = this.factories.create(factoryType, config);

        // تسجيل العقدة في الشبكة العصبية
        const type = NeuralNode.NODE_TYPES[factoryType.toUpperCase()] || NeuralNode.NODE_TYPES.CUSTOM;
        this._addEntityNode(entity, type);

        // ربط العقدة الجديدة بالشبكة
        this._wireNewNode(`${type}:${entity.id}`, type);

        return entity;
    }

    _wireNewNode(nodeId, type) {
        const ids = [...this.neuralNet.nodes.keys()];
        if (type === NeuralNode.NODE_TYPES.MARKET) {
            ids.filter(id => id.startsWith('pipeline:')).forEach(pid => {
                try { this.neuralNet.connect(nodeId, pid, 0.8); } catch (_) {}
            });
        } else if (type === NeuralNode.NODE_TYPES.ORGANIZATION) {
            ids.filter(id => id.startsWith('market:')).forEach(mid => {
                try { this.neuralNet.connect(nodeId, mid, 0.9); } catch (_) {}
            });
        }
    }

    /**
     * إرسال إشارة عبر الشبكة العصبية
     * @param {string} sourceId
     * @param {string} targetId
     * @param {*}      signal
     * @param {string} [strategy]
     */
    async sendSignal(sourceId, targetId, signal, strategy) {
        return this.neuralNet.send(sourceId, targetId, signal, strategy);
    }

    /**
     * دورة تعلم الشبكة
     * @param {Array} samples
     */
    learn(samples) {
        return this.neuralNet.learn(samples);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // المعلومات والإحصاءات
    // ══════════════════════════════════════════════════════════════════════════

    status() {
        return {
            engine:     this.name,
            engineAr:   this.nameAr,
            version:    this.version,
            startedAt:  this.startedAt,
            pipelines: {
                registered: this.pipelineRegistry.size,
                names:      this.pipelineRegistry.names()
            },
            factories:  this.factories.getStats(),
            neural:     this.neuralNet.getStats()
        };
    }

    toJSON() {
        return {
            ...this.status(),
            pipelineDetails: this.pipelineRegistry.toJSON(),
            factoryOverview: this.factories.overview(),
            networkSnapshot: this.neuralNet.toJSON()
        };
    }

    _log(msg) {
        if (this.verbose) console.log(`[SheikhaEngine] ${msg}`);
    }
}

// Singleton: محرك شيخة الموحّد
let _instance = null;

function getInstance(options) {
    if (!_instance) _instance = new SheikhaEngine(options);
    return _instance;
}

function resetInstance() {
    _instance = null;
}

module.exports = { SheikhaEngine, getInstance, resetInstance };
