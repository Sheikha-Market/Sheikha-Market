/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║       SHEIKHA UNITY ENGINE — محرك التوحيد والتكامل الكوني                   ║
 * ║   يُوحّد جميع خلايا الشبكة العصبية مع الوكيل السحابي والخادم الرئيسي       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "قُلْ هُوَ اللَّهُ أَحَدٌ" — الإخلاص: ١
 *
 * هذا المحرك يُوحّد:
 *   • 12 خلية عصبية (neural-cells.js)
 *   • الوكيل السحابي (cloud-agent-clone.js)
 *   • الخادم الرئيسي (server.js)
 *   • مسارات CI/CD (.github/workflows)
 *
 * واجهة الوحدة:
 *   init()           — تهيئة وتوحيد جميع الوحدات
 *   pulse(input)     — نبضة موحدة تُشغّل كل الخلايا والوكلاء
 *   createRouter()   — Express router لمسارات /api/agent
 *   status()         — حالة المنظومة الموحدة
 */

'use strict';

const path    = require('path');
let express;
try {
    express = require('express');
} catch (_) {
    express = null;
}

// ─── استيراد الوحدات ──────────────────────────────────────────────────────────

let neuralCells = null;
let cloudAgent  = null;

try {
    neuralCells = require('./neural-cells');
} catch (err) {
    console.warn('[UNITY-ENGINE] ⚠️ neural-cells غير متوفر:', err.message);
}

try {
    cloudAgent = require('../sheikha-cloud-agent/cloud-agent-clone');
} catch (err) {
    console.warn('[UNITY-ENGINE] ⚠️ cloud-agent-clone غير متوفر:', err.message);
}

// ─── حالة الوحدة ──────────────────────────────────────────────────────────────

let _ready     = false;
let _initAt    = null;
let _pulseCount = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة المحرك الموحد
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    console.log('[UNITY-ENGINE] 🕌 تهيئة محرك التوحيد...');
    console.log('[UNITY-ENGINE]    "قُلْ هُوَ اللَّهُ أَحَدٌ" — الإخلاص: 1');

    if (neuralCells) {
        neuralCells.init();
        console.log('[UNITY-ENGINE] ✅ 12 خلية عصبية — موحّدة');
    }

    if (cloudAgent) {
        cloudAgent.init();
        console.log(`[UNITY-ENGINE] ✅ الوكيل السحابي ${cloudAgent.MASTER_AGENT_ID} — موحّد`);
    }

    _ready  = true;
    _initAt = new Date().toISOString();

    console.log('[UNITY-ENGINE] 🌟 التوحيد مكتمل — كل الوحدات تعمل بتناسق');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② النبضة الموحدة — تُشغّل كل الخلايا والوكلاء
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * نبضة موحدة تُشغّل الخلايا العصبية والوكيل السحابي معاً
 * @param {object} input — { type, data, context, task }
 * @returns {object} نتيجة النبضة الكاملة
 */
function pulse(input = {}) {
    if (!_ready) init();
    _pulseCount++;

    const { type = 'general', data = {}, context = '', task = null } = input;

    const result = {
        id:         `pulse_${Date.now()}_${_pulseCount}`,
        timestamp:  new Date().toISOString(),
        type,
        neural:     null,
        agent:      null,
    };

    // تشغيل الخلايا العصبية
    if (neuralCells) {
        result.neural = neuralCells.process({ type, data, context });
    }

    // تشغيل وكيل سحابي إذا كانت هناك مهمة
    if (cloudAgent && task) {
        result.agent = cloudAgent.clone({
            name:    task.name    || type,
            type:    task.type    || type,
            payload: task.payload || data,
            priority: task.priority || 'normal',
        });
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ Express Router — مسارات /api/agent
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إنشاء Express Router لمسارات الوكيل السحابي والشبكة العصبية
 * @returns {express.Router}
 */
function createRouter() {
    if (!_ready) init();

    if (!express) {
        console.warn('[UNITY-ENGINE] ⚠️ express غير متوفر — لا يمكن إنشاء Router');
        return null;
    }

    const router = express.Router();
    router.use(express.json());

    // POST /api/agent/clone — استنساخ وكيل جديد
    router.post('/clone', (req, res) => {
        const { name, type, payload, priority } = req.body || {};

        if (!cloudAgent) {
            return res.status(503).json({
                success: false,
                error: 'الوكيل السحابي غير متوفر حالياً',
            });
        }

        const agent = cloudAgent.clone({ name, type, payload, priority });

        if (!agent) {
            return res.status(429).json({
                success: false,
                error: 'تم بلوغ الحد الأقصى للوكلاء — لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
            });
        }

        return res.status(201).json({ success: true, agent });
    });

    // POST /api/agent/dispatch — توزيع مجموعة مهام
    router.post('/dispatch', (req, res) => {
        const { tasks = [] } = req.body || {};

        if (!cloudAgent) {
            return res.status(503).json({ success: false, error: 'الوكيل السحابي غير متوفر' });
        }

        const agents = cloudAgent.dispatch(tasks);
        return res.json({ success: true, dispatched: agents.length, agents });
    });

    // POST /api/agent/complete/:id — تسجيل إتمام مهمة
    router.post('/complete/:id', (req, res) => {
        const id     = Number(req.params.id);
        const result = req.body || {};

        if (!cloudAgent) {
            return res.status(503).json({ success: false, error: 'الوكيل السحابي غير متوفر' });
        }

        const ok = cloudAgent.completeTask(id, result);
        return res.json({ success: ok });
    });

    // DELETE /api/agent/:id — إيقاف وكيل
    router.delete('/:id', (req, res) => {
        const id = Number(req.params.id);

        if (!cloudAgent) {
            return res.status(503).json({ success: false, error: 'الوكيل السحابي غير متوفر' });
        }

        const ok = cloudAgent.terminateAgent(id);
        return res.json({ success: ok });
    });

    // GET /api/agent — قائمة الوكلاء
    router.get('/', (req, res) => {
        const agents = cloudAgent ? cloudAgent.listAgents() : [];
        return res.json({ success: true, agents, total: agents.length });
    });

    // GET /api/agent/:id — وكيل بعينه
    router.get('/:id', (req, res) => {
        const agent = cloudAgent ? cloudAgent.getAgent(Number(req.params.id)) : null;
        if (!agent) return res.status(404).json({ success: false, error: 'الوكيل غير موجود' });
        return res.json({ success: true, agent });
    });

    // GET /api/agent/neural/cells — قائمة الخلايا العصبية
    router.get('/neural/cells', (req, res) => {
        const cells = neuralCells ? neuralCells.listCells() : [];
        return res.json({ success: true, cells, total: cells.length });
    });

    // GET /api/agent/neural/cell/:number — خلية بعينها
    router.get('/neural/cell/:number', (req, res) => {
        const cell = neuralCells ? neuralCells.getCell(Number(req.params.number)) : null;
        if (!cell) return res.status(404).json({ success: false, error: 'الخلية غير موجودة' });
        return res.json({ success: true, cell });
    });

    // POST /api/agent/neural/process — معالجة عبر الخلايا العصبية
    router.post('/neural/process', (req, res) => {
        const input = req.body || {};

        if (!neuralCells) {
            return res.status(503).json({ success: false, error: 'الشبكة العصبية غير متوفرة' });
        }

        const result = neuralCells.process(input);
        return res.json({ success: true, result });
    });

    // POST /api/agent/pulse — نبضة موحدة (خلايا + وكيل)
    router.post('/pulse', (req, res) => {
        const result = pulse(req.body || {});
        return res.json({ success: true, result });
    });

    // GET /api/agent/status — حالة المنظومة كاملة
    router.get('/status', (req, res) => {
        return res.json({ success: true, status: status() });
    });

    return router;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ حالة المنظومة الموحدة
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    return {
        module:       'unity-engine',
        nameAr:       'محرك التوحيد — قُلْ هُوَ اللَّهُ أَحَدٌ',
        ready:        _ready,
        initAt:       _initAt,
        pulseCount:   _pulseCount,
        neuralCells:  neuralCells ? neuralCells.status() : { available: false },
        cloudAgent:   cloudAgent  ? cloudAgent.status()  : { available: false },
    };
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    pulse,
    createRouter,
    status,
};
