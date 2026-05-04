/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * NeuralNetwork — الشبكة العصبية الكاملة لمنظومة شيخة
 * تربط جميع العقد (أسواق، منظمات، مصانع، خطوط أنابيب) في شبكة واحدة موحّدة
 *
 * دالة التفعيل: الكتاب والسنة (WeightedSharia)
 * الهدف: وحدها لله — منظومة مترابطة بلا ضرر ولا ضرار
 *
 * "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا" — آل عمران ١٠٣
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const NeuralNode      = require('./NeuralNode');
const SynapticRouter  = require('./SynapticRouter');
const { shariaActivation, computeWeight, extractShariaAttrs } = require('./WeightedSharia');

class NeuralNetwork {
    /**
     * @param {object} [options]
     * @param {string}   [options.name]            - اسم الشبكة
     * @param {Function} [options.activationFn]    - دالة التفعيل (افتراضي: shariaActivation)
     * @param {boolean}  [options.learningEnabled] - تفعيل التعلم (افتراضي: true)
     */
    constructor({ name, activationFn, learningEnabled = true } = {}) {
        this.name   = name || 'sheikha-neural-network';
        this.nameAr = 'شبكة شيخة العصبية';

        /** دالة التفعيل — مبنية على الكتاب والسنة */
        this.activationFn = activationFn || shariaActivation;

        this.learningEnabled = learningEnabled;

        /** @type {Map<string, NeuralNode>} */
        this.nodes = new Map();

        /** الموجّه السينابتيكي */
        this.router = new SynapticRouter(this);

        /** سجل التعلم */
        this._learningLog = [];

        /** إحصاءات الشبكة */
        this._stats = {
            signalsSent:    0,
            signalsOk:      0,
            signalsFailed:  0,
            learningCycles: 0
        };

        this.createdAt = new Date().toISOString();
    }

    // ── إدارة العقد ───────────────────────────────────────────────────────────

    /**
     * إضافة عقدة
     * @param {NeuralNode|object} node
     * @returns {NeuralNode}
     */
    addNode(node) {
        const n = node instanceof NeuralNode ? node : new NeuralNode(node);
        if (this.nodes.has(n.id)) {
            throw new Error(`NeuralNetwork: العقدة "${n.id}" موجودة مسبقاً`);
        }
        this.nodes.set(n.id, n);
        return n;
    }

    /** إضافة أو استبدال */
    upsertNode(node) {
        const n = node instanceof NeuralNode ? node : new NeuralNode(node);
        this.nodes.set(n.id, n);
        return n;
    }

    removeNode(id) {
        this.nodes.delete(id);
        // حذف الروابط لهذه العقدة من بقية العقد
        for (const node of this.nodes.values()) {
            node.disconnect(id);
        }
        return this;
    }

    /** @returns {NeuralNode|undefined} */
    getNode(id) { return this.nodes.get(id); }

    hasNode(id) { return this.nodes.has(id); }

    get nodeCount() { return this.nodes.size; }

    // ── الروابط ───────────────────────────────────────────────────────────────

    /**
     * ربط عقدتين
     * @param {string} sourceId
     * @param {string} targetId
     * @param {number} [weight=1]
     */
    connect(sourceId, targetId, weight = 1.0) {
        const source = this.nodes.get(sourceId);
        const target = this.nodes.get(targetId);
        if (!source) throw new Error(`NeuralNetwork: العقدة المصدر "${sourceId}" غير موجودة`);
        if (!target) throw new Error(`NeuralNetwork: العقدة الهدف "${targetId}" غير موجودة`);
        source.connect(targetId, weight);
        return this;
    }

    disconnect(sourceId, targetId) {
        this.nodes.get(sourceId)?.disconnect(targetId);
        return this;
    }

    // ── إرسال الإشارات ────────────────────────────────────────────────────────

    /**
     * إرسال إشارة عبر الشبكة
     * @param {string}  sourceId
     * @param {string}  targetId   (أو '*' للبث)
     * @param {*}       signal
     * @param {string}  [strategy]
     */
    async send(sourceId, targetId, signal, strategy) {
        this._stats.signalsSent++;
        const result = await this.router.route(sourceId, targetId, signal, strategy);
        if (result.success) this._stats.signalsOk++;
        else                this._stats.signalsFailed++;
        return result;
    }

    /** بثّ إشارة لجميع العقد النشطة */
    async broadcast(sourceId, signal) {
        return this.send(sourceId, '*', signal, SynapticRouter.STRATEGIES.BROADCAST);
    }

    // ── التعلم (Learning) ────────────────────────────────────────────────────

    /**
     * دورة تعلم: تُحدّث أوزان العقد بناءً على بيانات تجريبية
     * @param {Array<{nodeId: string, feedback: object}>} samples
     */
    learn(samples = []) {
        if (!this.learningEnabled) return { skipped: true, reason: 'التعلم معطّل' };

        this._stats.learningCycles++;
        const updates = [];

        for (const sample of samples) {
            const node = this.nodes.get(sample.nodeId);
            if (!node) continue;

            const attrs  = { ...extractShariaAttrs(node.entity), ...sample.feedback };
            const result = computeWeight(attrs);

            const oldWeight = node.weight;
            const newWeight = Math.max(0.01, Math.min(1, result.score));

            node.weight = newWeight;
            updates.push({ nodeId: node.id, oldWeight, newWeight, score: result.score });
        }

        this._learningLog.push({
            cycle:   this._stats.learningCycles,
            updates,
            at:      new Date().toISOString()
        });

        if (this._learningLog.length > 100) this._learningLog.shift();

        return { cycle: this._stats.learningCycles, updates };
    }

    // ── لقطة الشبكة ───────────────────────────────────────────────────────────

    /** قائمة بجميع الروابط */
    getEdges() {
        const edges = [];
        for (const node of this.nodes.values()) {
            for (const [targetId, conn] of node.connections.entries()) {
                edges.push({ source: node.id, target: targetId, weight: conn.weight });
            }
        }
        return edges;
    }

    /** قائمة العقد مع إحصاءاتها */
    getNodeList() {
        return [...this.nodes.values()].map(n => n.toJSON());
    }

    // ── الإحصاءات ─────────────────────────────────────────────────────────────

    getStats() {
        return {
            name:        this.name,
            nodes:       this.nodeCount,
            edges:       this.getEdges().length,
            ...this._stats,
            createdAt:   this.createdAt
        };
    }

    toJSON() {
        return {
            name:      this.name,
            nameAr:    this.nameAr,
            nodes:     this.getNodeList(),
            edges:     this.getEdges(),
            stats:     this.getStats(),
            routeLog:  this.router.getLog().slice(-20),
            learning:  this._learningLog.slice(-10)
        };
    }
}

module.exports = NeuralNetwork;
