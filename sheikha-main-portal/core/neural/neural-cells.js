/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     SHEIKHA NEURAL CELLS — خلايا الشبكة العصبية المرقّمة بالكتاب والسنة    ║
 * ║          12 خلية — كل خلية مرتبطة بآية قرآنية أو حديث نبوي شريف           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: ٣١
 *
 * الخلايا الاثنتا عشرة:
 *   1.  الفاتحة:1    — خلية البداية        (Init)
 *   2.  البقرة:255   — خلية الحماية        (Security)
 *   3.  الإخلاص:1   — خلية التوحيد        (Tawheed / Compliance)
 *   4.  الحشر:22    — خلية الهوية          (Identity)
 *   5.  الملك:1     — خلية الحوكمة        (Governance)
 *   6.  الرحمن:1-2  — خلية التعلم         (Learning)
 *   7.  العلق:1     — خلية التحليل        (Analysis)
 *   8.  الحديد:4    — خلية المراقبة       (Monitoring)
 *   9.  الزلزلة:7-8 — خلية الحساب        (Accounting)
 *   10. حديث الإتقان — خلية الجودة        (Quality)
 *   11. حديث النصيحة — خلية التوجيه       (Advisory)
 *   12. البقرة:286   — خلية توازن الحِمل   (Load Balance)
 *
 * واجهة الوحدة:
 *   init()             — تهيئة الخلايا الاثنتي عشرة
 *   activate(cellId)   — تفعيل خلية بعينها
 *   process(input)     — معالجة إدخال عبر سلسلة الخلايا
 *   getCell(number)    — جلب خلية برقمها
 *   listCells()        — قائمة جميع الخلايا
 *   status()           — حالة الشبكة الكاملة
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ─── تحميل البيان ─────────────────────────────────────────────────────────────

const MANIFEST_PATH = path.join(__dirname, 'neural-cells-manifest.json');
let _manifest = null;
try {
    _manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} catch (_) {
    _manifest = { meta: {}, cells: [] };
}

// ─── حالة الوحدة ──────────────────────────────────────────────────────────────

let _cells    = new Map();   // رقم الخلية → كائن الخلية
let _ready    = false;
let _initAt   = null;
let _callCount = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    for (const def of _manifest.cells) {
        _cells.set(def.number, {
            ...def,
            activation: 0,
            fireCount:  0,
            lastFired:  null,
            active:     false,
        });
    }

    _ready  = true;
    _initAt = new Date().toISOString();

    console.log(`[NEURAL-CELLS] 🧠 ${_cells.size} خلية عصبية مُفعَّلة — مرقّمة بالكتاب والسنة`);
    _logCells();
}

function _logCells() {
    for (const [num, cell] of _cells) {
        const ref = cell.ayah || cell.hadith || '';
        console.log(`[NEURAL-CELLS]   خلية ${num}: ${cell.nameAr} — ${ref.slice(0, 40)}...`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② تفعيل خلية بعينها
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تفعيل خلية بعينها وتحديث حالتها
 * @param {number} cellNumber — رقم الخلية (1-12)
 * @param {object} context   — سياق التفعيل
 * @returns {object|null}
 */
function activate(cellNumber, context = {}) {
    if (!_ready) init();

    const cell = _cells.get(Number(cellNumber));
    if (!cell) return null;

    cell.activation = Math.min(1, cell.activation + 0.1);
    cell.fireCount++;
    cell.lastFired  = new Date().toISOString();
    cell.active     = true;

    return {
        cellNumber,
        id:         cell.id,
        nameAr:     cell.nameAr,
        reference:  cell.reference,
        activation: cell.activation,
        context,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ معالجة إدخال عبر سلسلة الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تمرير إدخال عبر سلسلة الخلايا العصبية
 * @param {object} input — { type, data, context }
 * @returns {object} نتيجة المعالجة
 */
function process(input = {}) {
    if (!_ready) init();
    _callCount++;

    const { type = 'general', data = {}, context = '' } = input;

    // تحديد الخلايا المُفعَّلة بناءً على نوع الإدخال
    const activationMap = {
        'startup':      [1],
        'auth':         [1, 2, 4],
        'security':     [1, 2, 3],
        'trade':        [1, 3, 9],
        'compliance':   [1, 3, 5, 6],
        'learning':     [1, 6, 7],
        'analysis':     [1, 7, 9],
        'monitoring':   [1, 8, 11],
        'transaction':  [1, 9, 10],
        'quality':      [1, 10, 11],
        'load':         [1, 12],
        'general':      [1, 3, 10],
    };

    const cellsToFire = activationMap[type] || activationMap['general'];
    const results     = cellsToFire.map(n => activate(n, { type, context }));

    return {
        id:          `proc_${Date.now()}_${_callCount}`,
        type,
        timestamp:   new Date().toISOString(),
        cellsFired:  cellsToFire,
        results,
        summary: `فُعِّلت ${cellsToFire.length} خلايا عصبية لمعالجة "${type}"`,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ قراءة الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

function getCell(number) {
    if (!_ready) init();
    return _cells.get(Number(number)) || null;
}

function listCells() {
    if (!_ready) init();
    return Array.from(_cells.values());
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ حالة الشبكة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    if (!_ready) init();

    const cells  = listCells();
    const active = cells.filter(c => c.active).length;
    const topActivated = cells
        .sort((a, b) => b.activation - a.activation)
        .slice(0, 3)
        .map(c => ({ number: c.number, nameAr: c.nameAr, activation: c.activation, fireCount: c.fireCount }));

    return {
        module:       'neural-cells',
        nameAr:       'خلايا الشبكة العصبية — مرقّمة بالكتاب والسنة',
        ready:        _ready,
        initAt:       _initAt,
        totalCells:   cells.length,
        activeCells:  active,
        callCount:    _callCount,
        topActivated,
        principle:    _manifest.meta.principle || '',
    };
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    activate,
    process,
    getCell,
    listCells,
    status,
};
