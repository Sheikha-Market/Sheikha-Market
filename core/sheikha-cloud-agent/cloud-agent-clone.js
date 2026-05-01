/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA CLOUD AGENT — وكيل سحابة شيخة (Clone Mode)                 ║
 * ║   يستنسخ نفسه ويُوزّع المهام على الشبكة — Distributed Clone Agent          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" — المائدة: ٢
 *
 * الوكيل الرئيسي برقم: 786 (بسم الله الرحمن الرحيم)
 * كل وكيل مستنسخ يحمل رقماً فريداً مشتقاً من الأصل 786
 *
 * واجهة الوحدة:
 *   init()              — تهيئة الوكيل الرئيسي وتحميل السجل
 *   clone(task)         — استنساخ وكيل جديد وتوزيع المهمة
 *   dispatch(tasks)     — توزيع مجموعة مهام على وكلاء متوازيين
 *   getAgent(id)        — جلب وكيل بمعرّفه
 *   listAgents()        — قائمة الوكلاء النشطين
 *   terminateAgent(id)  — إيقاف وكيل
 *   status()            — حالة منظومة الوكلاء كاملة
 */

'use strict';

const path  = require('path');
const fs    = require('fs');
const { EventEmitter } = require('events');

// ─── ثوابت ────────────────────────────────────────────────────────────────────

const MASTER_AGENT_ID  = 786; // بسم الله الرحمن الرحيم
const REGISTRY_PATH    = path.join(__dirname, 'agent-registry.json');
const MAX_CLONES       = 57;  // عدد دول منظمة التعاون الإسلامي

// ─── حالة الوحدة ──────────────────────────────────────────────────────────────

const emitter   = new EventEmitter();
let _registry   = null;
let _agents     = new Map();
let _ready      = false;
let _initAt     = null;
let _cloneCount = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة الوكيل الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    _registry = _loadRegistry();

    // تسجيل الوكيل الرئيسي
    const masterAgent = {
        id:          MASTER_AGENT_ID,
        type:        'master',
        nameAr:      'الوكيل الرئيسي — بسم الله',
        nameEn:      'Master Agent — Bismillah',
        reference:   'الفاتحة:1 — بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        status:      'active',
        createdAt:   new Date().toISOString(),
        tasks:       [],
        clones:      [],
        capabilities: ['clone', 'dispatch', 'monitor', 'heal'],
    };

    _agents.set(MASTER_AGENT_ID, masterAgent);
    _ready  = true;
    _initAt = new Date().toISOString();

    console.log(`[CLOUD-AGENT] 🤖 الوكيل الرئيسي ${MASTER_AGENT_ID} (بسم الله) — جاهز`);
    emitter.emit('init', masterAgent);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② استنساخ وكيل جديد
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * استنساخ وكيل جديد لتنفيذ مهمة محددة
 * @param {object} task — { name, type, payload, priority }
 * @returns {object} الوكيل المستنسخ
 */
function clone(task = {}) {
    if (!_ready) init();

    if (_cloneCount >= MAX_CLONES) {
        console.warn(`[CLOUD-AGENT] ⚠️ الحد الأقصى للوكلاء (${MAX_CLONES}) وصل — "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا"`);
        return null;
    }

    _cloneCount++;
    const cloneId   = MASTER_AGENT_ID * 1000 + _cloneCount; // مشتق من 786
    const cloneAgent = {
        id:        cloneId,
        parentId:  MASTER_AGENT_ID,
        type:      'clone',
        nameAr:    `وكيل مستنسخ #${_cloneCount}`,
        nameEn:    `Clone Agent #${_cloneCount}`,
        status:    'running',
        task:      {
            name:      task.name      || 'unnamed',
            type:      task.type      || 'general',
            payload:   task.payload   || {},
            priority:  task.priority  || 'normal',
            startedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        result:    null,
    };

    _agents.set(cloneId, cloneAgent);

    // ربط بالوكيل الأب
    const master = _agents.get(MASTER_AGENT_ID);
    if (master) master.clones.push(cloneId);

    console.log(`[CLOUD-AGENT] 🔁 استنساخ ${cloneId} لمهمة: ${task.name || 'عامة'}`);
    emitter.emit('clone', cloneAgent);

    return cloneAgent;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ توزيع مجموعة مهام
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * توزيع مجموعة مهام على وكلاء متوازيين
 * @param {object[]} tasks — قائمة المهام
 * @returns {object[]} الوكلاء المُنشَأون
 */
function dispatch(tasks = []) {
    if (!_ready) init();

    const agents = tasks.map(task => clone(task)).filter(Boolean);
    console.log(`[CLOUD-AGENT] 🚀 توزيع ${agents.length} مهمة على وكلاء متوازيين`);
    emitter.emit('dispatch', agents);
    return agents;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ إتمام مهمة وكيل
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تسجيل نتيجة مهمة وكيل وتحديث حالته
 * @param {number} agentId
 * @param {object} result
 */
function completeTask(agentId, result = {}) {
    const agent = _agents.get(agentId);
    if (!agent) return false;

    agent.status       = 'completed';
    agent.result       = result;
    agent.completedAt  = new Date().toISOString();

    emitter.emit('taskComplete', { agentId, result });
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ إيقاف وكيل
// ═══════════════════════════════════════════════════════════════════════════════

function terminateAgent(agentId) {
    const agent = _agents.get(agentId);
    if (!agent || agent.id === MASTER_AGENT_ID) return false;

    agent.status      = 'terminated';
    agent.terminatedAt = new Date().toISOString();
    emitter.emit('terminate', agentId);
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ قراءة السجل والوكلاء
// ═══════════════════════════════════════════════════════════════════════════════

function getAgent(id) {
    return _agents.get(Number(id)) || null;
}

function listAgents() {
    return Array.from(_agents.values());
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ حالة المنظومة
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    const all    = listAgents();
    const active = all.filter(a => a.status === 'running').length;
    const done   = all.filter(a => a.status === 'completed').length;

    return {
        module:         'sheikha-cloud-agent',
        nameAr:         'وكيل سحابة شيخة',
        masterAgentId:  MASTER_AGENT_ID,
        ready:          _ready,
        initAt:         _initAt,
        totalAgents:    all.length,
        activeClones:   active,
        completedTasks: done,
        maxClones:      MAX_CLONES,
        cloneCount:     _cloneCount,
        registry:       _registry ? _registry.meta : null,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// مساعدات داخلية
// ═══════════════════════════════════════════════════════════════════════════════

function _loadRegistry() {
    try {
        const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (_) {
        return { meta: { loaded: false }, agents: [] };
    }
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    clone,
    dispatch,
    completeTask,
    terminateAgent,
    getAgent,
    listAgents,
    status,
    emitter,
    MASTER_AGENT_ID,
};
