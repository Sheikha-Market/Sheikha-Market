/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * NeuralNode — عقدة الشبكة العصبية لمنظومة شيخة
 * تمثّل: سوق | منظمة | مصنع | خط أنابيب | أي كيان في المنظومة
 *
 * "وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا" — البقرة ١٤٣
 * التوازن والوسطية في كل عقدة
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const NODE_TYPES = Object.freeze({
    MARKET:       'market',
    ORGANIZATION: 'organization',
    FACTORY:      'factory',
    PIPELINE:     'pipeline',
    GATEWAY:      'gateway',
    SENSOR:       'sensor',
    CUSTOM:       'custom'
});

const NODE_STATES = Object.freeze({
    ACTIVE:   'active',
    INACTIVE: 'inactive',
    LEARNING: 'learning',
    ERROR:    'error'
});

class NeuralNode {
    /**
     * @param {object} options
     * @param {string}  options.id       - معرّف العقدة
     * @param {string}  options.name     - الاسم
     * @param {string}  [options.nameAr] - الاسم العربي
     * @param {string}  [options.type]   - نوع العقدة
     * @param {number}  [options.weight] - وزن العقدة (0-1)
     * @param {*}       [options.entity] - الكيان المرتبط (سوق/مصنع/...)
     */
    constructor({ id, name, nameAr, type = NODE_TYPES.CUSTOM, weight = 1.0, entity = null } = {}) {
        if (!id)   throw new Error('NeuralNode: يجب تحديد معرّف العقدة (id)');
        if (!name) throw new Error('NeuralNode: يجب تحديد اسم العقدة (name)');

        this.id     = id;
        this.name   = name;
        this.nameAr = nameAr || name;
        this.type   = NODE_TYPES[type.toUpperCase()] || NODE_TYPES.CUSTOM;
        this.weight = Math.max(0, Math.min(1, weight)); // قيد: 0 ≤ weight ≤ 1
        this.entity = entity;
        this.state  = NODE_STATES.ACTIVE;

        /** @type {Map<string, {nodeId: string, weight: number}>} الروابط الصادرة */
        this.connections = new Map();

        /** سجل الإشارات المستقبَلة */
        this._signalHistory = [];

        /** الإخراج الأخير */
        this._lastOutput = null;

        this.createdAt = new Date().toISOString();
    }

    // ── الروابط ───────────────────────────────────────────────────────────────

    /**
     * إضافة رابط لعقدة أخرى
     * @param {string} targetId   - معرّف العقدة الهدف
     * @param {number} [weight=1] - وزن الرابط (0-1)
     */
    connect(targetId, weight = 1.0) {
        this.connections.set(targetId, {
            nodeId: targetId,
            weight: Math.max(0, Math.min(1, weight)),
            createdAt: new Date().toISOString()
        });
        return this;
    }

    disconnect(targetId) {
        this.connections.delete(targetId);
        return this;
    }

    isConnectedTo(targetId) {
        return this.connections.has(targetId);
    }

    // ── المعالجة ──────────────────────────────────────────────────────────────

    /**
     * معالجة إشارة واردة
     * @param {*} signal          - الإشارة
     * @param {Function} activate - دالة التفعيل (مُمرَّرة من الشبكة)
     * @returns {*} الإشارة المعالَجة
     */
    process(signal, activate = (x) => x) {
        if (this.state === NODE_STATES.INACTIVE) return null;
        if (this.state === NODE_STATES.ERROR)    return null;

        const weighted = this._applyWeight(signal);
        const output   = activate(weighted, this);

        this._lastOutput = output;
        this._signalHistory.push({
            input:  signal,
            output,
            at: new Date().toISOString()
        });

        // الاحتفاظ بآخر 50 إشارة فقط
        if (this._signalHistory.length > 50) {
            this._signalHistory.shift();
        }

        return output;
    }

    /** تطبيق الوزن على الإشارة */
    _applyWeight(signal) {
        if (typeof signal === 'number')  return signal * this.weight;
        if (typeof signal === 'object' && signal !== null) {
            return { ...signal, _weight: this.weight, _nodeId: this.id };
        }
        return signal;
    }

    // ── الحالة ────────────────────────────────────────────────────────────────

    activate()   { this.state = NODE_STATES.ACTIVE;   return this; }
    deactivate() { this.state = NODE_STATES.INACTIVE; return this; }
    setLearning(){ this.state = NODE_STATES.LEARNING; return this; }
    setError()   { this.state = NODE_STATES.ERROR;    return this; }

    isActive() { return this.state === NODE_STATES.ACTIVE; }

    // ── المعلومات ─────────────────────────────────────────────────────────────

    getStats() {
        return {
            id:             this.id,
            name:           this.name,
            nameAr:         this.nameAr,
            type:           this.type,
            weight:         this.weight,
            state:          this.state,
            connections:    this.connections.size,
            signalsProcessed: this._signalHistory.length,
            lastOutput:     this._lastOutput
        };
    }

    toJSON() {
        return {
            id:          this.id,
            name:        this.name,
            nameAr:      this.nameAr,
            type:        this.type,
            weight:      this.weight,
            state:       this.state,
            connections: [...this.connections.values()],
            createdAt:   this.createdAt
        };
    }
}

NeuralNode.NODE_TYPES  = NODE_TYPES;
NeuralNode.NODE_STATES = NODE_STATES;

module.exports = NeuralNode;
