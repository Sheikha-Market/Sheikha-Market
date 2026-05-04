/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 الخلايا العصبية الجذرية — Sheikha Root Neural Cells
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * تعريف هيكل الخلايا العصبية الجذرية الموحّدة لله
 *
 * ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 *
 * أنواع الخلايا:
 *   TAWHEED (توحيد) — العقدة الجذر الأعلى
 *   ILMU    (علم)   — الإدراك والمعرفة
 *   ADLU    (عدل)   — العدل والتوازن
 *   RAHMA   (رحمة) — الرحمة والحماية
 *   QUWWA   (قوة)   — القوة والتنفيذ
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── أنواع الخلايا ────────────────────────────────────────────────────────────
const CELL_TYPES = {
    TAWHEED: 'TAWHEED',
    ILMU: 'ILMU',
    ADLU: 'ADLU',
    RAHMA: 'RAHMA',
    QUWWA: 'QUWWA'
};

// ─── مراجع قرآنية لكل نوع خلية ────────────────────────────────────────────────
const CELL_QURAN_REFS = {
    [CELL_TYPES.TAWHEED]: {
        ref: 'الإخلاص: 1',
        arabic: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
        principle: 'التوحيد — كل الخلايا تُرجَع إليه',
        priority: 1.0
    },
    [CELL_TYPES.ILMU]: {
        ref: 'البقرة: 31',
        arabic: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾',
        principle: 'العلم والإدراك والمعرفة',
        priority: 0.9
    },
    [CELL_TYPES.ADLU]: {
        ref: 'النساء: 58',
        arabic: '﴿ وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ ﴾',
        principle: 'العدل والإنصاف في القرارات',
        priority: 0.95
    },
    [CELL_TYPES.RAHMA]: {
        ref: 'الأنبياء: 107',
        arabic: '﴿ وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ ﴾',
        principle: 'الرحمة والحماية من الضرر',
        priority: 0.95
    },
    [CELL_TYPES.QUWWA]: {
        ref: 'الأنفال: 60',
        arabic: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾',
        principle: 'القوة والتنفيذ والاستعداد',
        priority: 0.85
    }
};

// ─── حالات الخلية ─────────────────────────────────────────────────────────────
const CELL_STATES = {
    DORMANT: 'DORMANT',       // خامدة
    ACTIVE: 'ACTIVE',         // نشطة
    FIRING: 'FIRING',         // تطلق إشارة
    INHIBITED: 'INHIBITED',   // مثبَّطة
    HEALING: 'HEALING'        // في طور الإصلاح
};

// ─── تعريف الخلية الجذرية ─────────────────────────────────────────────────────
class RootNeuralCell {
    /**
     * @param {object} opts
     * @param {string} opts.id
     * @param {string} opts.type  — من CELL_TYPES
     * @param {string} [opts.nameAr]
     * @param {number} [opts.activationThreshold=0.5]
     */
    constructor({ id, type, nameAr = '', activationThreshold = 0.5 }) {
        if (!CELL_TYPES[type]) throw new Error(`نوع خلية غير معروف: ${type}`);

        this.id = id;
        this.type = type;
        this.nameAr = nameAr || type;
        this.quranRef = CELL_QURAN_REFS[type];
        this.activationThreshold = activationThreshold;
        this.state = CELL_STATES.DORMANT;
        this.activation = 0.0;      // قيمة التفعيل الحالية [0-1]
        this.children = [];          // خلايا فرعية
        this.connections = [];       // اتصالات بخلايا أخرى { cellId, weight }
        this.history = [];           // سجل حالات الإشارات
        this.metadata = {
            createdAt: new Date().toISOString(),
            lastFired: null,
            totalFirings: 0
        };
    }

    /**
     * تفعيل الخلية بقيمة إدخال
     * @param {number} input [0-1]
     * @returns {number} قيمة التفعيل بعد دالة sigma
     */
    activate(input) {
        const rawInput = Math.max(0, Math.min(1, input));
        // دالة sigmoid إسلامية: تُعطي أولوية للمدخل المرتفع
        this.activation = 1 / (1 + Math.exp(-10 * (rawInput - this.activationThreshold)));

        if (this.activation >= this.activationThreshold) {
            this.state = CELL_STATES.FIRING;
            this.metadata.lastFired = new Date().toISOString();
            this.metadata.totalFirings++;
        } else {
            this.state = rawInput > 0 ? CELL_STATES.ACTIVE : CELL_STATES.DORMANT;
        }

        this.history.push({
            input: rawInput,
            activation: this.activation,
            state: this.state,
            timestamp: new Date().toISOString()
        });
        if (this.history.length > 50) this.history.shift(); // حفظ آخر 50

        return this.activation;
    }

    /**
     * إضافة خلية فرعية
     * @param {RootNeuralCell} childCell
     * @param {number} [weight=1.0]
     */
    addChild(childCell, weight = 1.0) {
        this.children.push({ cell: childCell, weight });
        this.connections.push({ cellId: childCell.id, weight });
    }

    /**
     * نشر الإشارة للخلايا الفرعية
     * @param {number} signal
     */
    propagate(signal) {
        const outputs = [];
        for (const { cell, weight } of this.children) {
            const childInput = signal * weight * (this.quranRef.priority || 1.0);
            const childOutput = cell.activate(childInput);
            outputs.push({ cellId: cell.id, output: childOutput });
        }
        return outputs;
    }

    /**
     * تسلسل الخلية إلى JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            nameAr: this.nameAr,
            quranRef: this.quranRef,
            state: this.state,
            activation: Math.round(this.activation * 1000) / 1000,
            activationThreshold: this.activationThreshold,
            childrenCount: this.children.length,
            connections: this.connections,
            totalFirings: this.metadata.totalFirings,
            lastFired: this.metadata.lastFired,
            createdAt: this.metadata.createdAt
        };
    }
}

// ─── المصنع: بناء الخلايا الجذرية الافتراضية ─────────────────────────────────
function buildDefaultCells() {
    // الجذر: التوحيد
    const tawheed = new RootNeuralCell({
        id: 'root-tawheed',
        type: CELL_TYPES.TAWHEED,
        nameAr: 'خلية التوحيد — الجذر الأعلى',
        activationThreshold: 0.1   // تُفعَّل دائماً — الله حاضر دائماً
    });

    // خلايا المستوى الأول
    const ilmu = new RootNeuralCell({
        id: 'root-ilmu',
        type: CELL_TYPES.ILMU,
        nameAr: 'خلية العلم والإدراك',
        activationThreshold: 0.4
    });

    const adlu = new RootNeuralCell({
        id: 'root-adlu',
        type: CELL_TYPES.ADLU,
        nameAr: 'خلية العدل والميزان',
        activationThreshold: 0.45
    });

    const rahma = new RootNeuralCell({
        id: 'root-rahma',
        type: CELL_TYPES.RAHMA,
        nameAr: 'خلية الرحمة والحماية',
        activationThreshold: 0.35
    });

    const quwwa = new RootNeuralCell({
        id: 'root-quwwa',
        type: CELL_TYPES.QUWWA,
        nameAr: 'خلية القوة والتنفيذ',
        activationThreshold: 0.5
    });

    // ربط الجذر بالخلايا الفرعية
    tawheed.addChild(ilmu, 0.95);
    tawheed.addChild(adlu, 0.9);
    tawheed.addChild(rahma, 0.9);
    tawheed.addChild(quwwa, 0.8);

    return { tawheed, ilmu, adlu, rahma, quwwa };
}

// ─── تصدير ────────────────────────────────────────────────────────────────────
module.exports = {
    RootNeuralCell,
    CELL_TYPES,
    CELL_STATES,
    CELL_QURAN_REFS,
    buildDefaultCells
};
