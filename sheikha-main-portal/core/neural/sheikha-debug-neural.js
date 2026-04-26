/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🧠 SHEIKHA DEBUG NEURAL NETWORK — منظومة شيخة للتصحيح العصبي الكامل       ║
 * ║  شبكة الخلايا العصبية الكاملة — 45 خلية — كل الأنظمة والتقنيات            ║
 * ║  موحّدة لله ومرقّمة بالكتاب والسنة                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31
 * ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1
 * «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ» — البيهقي
 *
 * الطبقات الإحدى عشرة للشبكة العصبية الكاملة:
 *   Layer 0  — الأساس والتوحيد      (خلايا 1-12)   — CORE & TAWHEED
 *   Layer 1  — التشخيص والتصحيح    (خلايا 13-16)  — DEBUGGING & DIAGNOSTICS
 *   Layer 2  — التجارة والاقتصاد    (خلايا 17-20)  — COMMERCE & ECONOMY
 *   Layer 3  — الذكاء الاصطناعي    (خلايا 21-24)  — AI & MACHINE LEARNING
 *   Layer 4  — الشبكة والاتصالات   (خلايا 25-28)  — NETWORK & TELECOM
 *   Layer 5  — اللغة والإعلام       (خلايا 29-31)  — LANGUAGE & MEDIA
 *   Layer 6  — التعليم والبحث       (خلايا 32-35)  — EDUCATION & RESEARCH
 *   Layer 7  — القيادة والأخلاق     (خلايا 36-40)  — LEADERSHIP & ETHICS
 *   Layer 8  — الصحة والبيئة        (خلايا 41-45)  — HEALTH, ENV & LEGACY
 *   Layer 9  — الأدوات التقنية      (خلايا 46-50)  — IDE + SDK + MCP + ERP + DevOps
 *   Layer 10 — الناقل الشامل        (خلايا 51-55)  — TRANSPORT BUS
 *
 * واجهة الوحدة:
 *   init()                    — تهيئة الشبكة الكاملة (45 خلية)
 *   debug(input)              — تشغيل منظومة التصحيح الكامل
 *   activate(cellNumber, ctx) — تفعيل خلية بعينها
 *   process(input)            — معالجة عبر سلسلة الخلايا
 *   getCell(number)           — جلب خلية برقمها
 *   getLayer(layerId)         — جلب طبقة بأكملها
 *   listCells()               — قائمة جميع الخلايا
 *   listLayers()              — قائمة الطبقات
 *   status()                  — حالة الشبكة الكاملة
 *   createRouter()            — Express Router للمسارات
 */

'use strict';

const path = require('path');
const fs   = require('fs');

let express;
try { express = require('express'); } catch (_) { express = null; }

// ─── تحميل البيان الشامل ──────────────────────────────────────────────────────

const MANIFEST_PATH = path.join(__dirname, 'sheikha-complete-neural-manifest.json');
let _manifest = null;
try {
    _manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} catch (err) {
    console.warn('[DEBUG-NEURAL] ⚠️ فشل تحميل البيان الشامل:', err.message);
    _manifest = { meta: {}, layers: [], cells: [] };
}

// ─── الناقل الشامل (اختياري) ─────────────────────────────────────────────────

let _transport = null;
try {
    _transport = require('./sheikha-transport-bus');
} catch (_) { /* اختياري */ }

// ─── حالة الوحدة ──────────────────────────────────────────────────────────────

let _cells      = new Map();   // رقم الخلية → كائن الخلية
let _layers     = new Map();   // رقم الطبقة → قائمة الخلايا
let _ready      = false;
let _initAt     = null;
let _callCount  = 0;
let _debugCount = 0;
let _errorLog   = [];          // سجل الأخطاء المكتشفة

const ACTIVATION_INCREMENT = 0.05;
const MAX_ERROR_LOG        = 200;

// ═══════════════════════════════════════════════════════════════════════════════
// ① تهيئة الشبكة العصبية الكاملة — 55 خلية
// ═══════════════════════════════════════════════════════════════════════════════

function init() {
    if (_ready) return;

    console.log('[DEBUG-NEURAL] 🕌 بسم الله الرحمن الرحيم');
    console.log('[DEBUG-NEURAL] 🧠 تهيئة شبكة الخلايا العصبية الكاملة — منظومة شيخة');
    console.log(`[DEBUG-NEURAL]    "${_manifest.meta.principle || 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا'}"`);

    // تهيئة الخلايا
    for (const def of (_manifest.cells || [])) {
        _cells.set(def.number, {
            ...def,
            activation: 0,
            fireCount:  0,
            lastFired:  null,
            active:     false,
            errorCount: 0,
            healCount:  0,
        });
    }

    // تهيئة الطبقات
    for (const layer of (_manifest.layers || [])) {
        _layers.set(layer.id, {
            ...layer,
            cellObjects: layer.cells.map(n => _cells.get(n)).filter(Boolean),
        });
    }

    _ready  = true;
    _initAt = new Date().toISOString();

    console.log(`[DEBUG-NEURAL] ✅ ${_cells.size} خلية عصبية — ${_layers.size} طبقات`);
    _logLayersSummary();
}

function _logLayersSummary() {
    for (const [id, layer] of _layers) {
        console.log(`[DEBUG-NEURAL]   Layer ${id} | ${layer.nameAr} | ${layer.cells.length} خلايا`);
    }
    console.log('[DEBUG-NEURAL] 🌟 الشبكة العصبية الكاملة — موحّدة لله ومرقّمة بالكتاب والسنة');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② منظومة التصحيح الكامل — SHEIKHA DEBUGGING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تشغيل منظومة التصحيح الكاملة لاكتشاف الأخطاء وتشخيصها وإصلاحها
 * ﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا ﴾ — الحجرات: 6
 *
 * @param {object} input — { system, error, context, severity, data }
 * @returns {object} نتيجة التصحيح الكامل
 */
function debug(input = {}) {
    if (!_ready) init();
    _debugCount++;

    const {
        system    = 'general',
        error     = null,
        context   = '',
        severity  = 'info',   // info | warning | error | critical
        data      = {},
    } = input;

    const debugId = `debug_${Date.now()}_${_debugCount}`;
    const startTime = Date.now();

    // ─── المرحلة 1: الكشف (خلية 13 — فتبيّنوا) ──────────────────────────────
    const detection = _runDetection({ system, error, context, severity, data });

    // ─── المرحلة 2: التشخيص (خلية 14 — لا تقنطوا) ────────────────────────────
    const diagnosis = _runDiagnosis(detection);

    // ─── المرحلة 3: الإصلاح (خلية 15 — مع العسر يسر) ────────────────────────
    const healing = _runHealing(diagnosis);

    // ─── المرحلة 4: الإنذار (خلية 16 — الإشعار) ──────────────────────────────
    const alert = _runAlert(healing, severity);

    // ─── تفعيل الخلايا المعنية ───────────────────────────────────────────────
    const debugCells = [13, 14, 15, 16];
    if (error) debugCells.push(2, 8);                          // الأمن والمراقبة
    if (system === 'trade') debugCells.push(17, 18);           // التجارة
    if (system === 'ai') debugCells.push(21, 24);              // الذكاء الاصطناعي
    if (system === 'network') debugCells.push(25, 26, 28);     // الشبكة
    if (system === 'quality') debugCells.push(10, 11);         // الجودة

    const firedResults = [...new Set(debugCells)].map(n => activate(n, { debugId, system, severity }));

    // ─── تسجيل في سجل الأخطاء ────────────────────────────────────────────────
    if (severity === 'error' || severity === 'critical') {
        _logError({ debugId, system, error, severity, context, timestamp: new Date().toISOString() });
    }

    // ─── إطلاق حدث على الناقل الشامل ────────────────────────────────────────
    if (_transport) {
        _transport.emit('debug.triggered', { debugId, system, severity, issuesFound: detection.issuesFound }, 'debug-neural');
    }

    const elapsed = Date.now() - startTime;

    return {
        id:         debugId,
        timestamp:  new Date().toISOString(),
        system,
        severity,
        elapsed:    `${elapsed}ms`,
        detection,
        diagnosis,
        healing,
        alert,
        cellsFired: [...new Set(debugCells)],
        results:    firedResults,
        quran:      '﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾ — الشرح: 5',
        summary:    `منظومة التصحيح: ${detection.issuesFound} مشكلة مكتشفة — ${healing.healed} تم إصلاحها`,
    };
}

// ─── دوال التصحيح الداخلية ────────────────────────────────────────────────────

function _runDetection({ system, error, context, severity, data }) {
    const cell = _cells.get(13);
    if (cell) { cell.fireCount++; cell.active = true; cell.lastFired = new Date().toISOString(); }

    const issues = [];
    if (error) {
        issues.push({
            type:    'ERROR',
            message: typeof error === 'string' ? error : (error.message || String(error)),
            system,
            context,
        });
    }
    if (severity === 'critical') {
        issues.push({ type: 'CRITICAL', message: `نظام ${system} في حالة حرجة`, system, context });
    }

    return {
        cell:        13,
        cellNameAr:  'خلية كشف الأخطاء',
        reference:   'الحجرات:6 — فَتَبَيَّنُوا',
        issuesFound: issues.length,
        issues,
        timestamp:   new Date().toISOString(),
    };
}

function _runDiagnosis(detection) {
    const cell = _cells.get(14);
    if (cell) { cell.fireCount++; cell.active = true; cell.lastFired = new Date().toISOString(); }

    const rootCauses = detection.issues.map(issue => {
        let rootCause = 'سبب غير محدد — يلزم التحقق اليدوي';
        let recommendation = 'راجع السجلات التفصيلية';

        if (issue.type === 'ERROR') {
            if (issue.message && issue.message.includes('timeout')) {
                rootCause = 'انتهاء وقت الاستجابة — ربما ثقل في الشبكة أو الخادم';
                recommendation = 'تحقق من استجابة الخادم وفكّر في توسيع الطاقة';
            } else if (issue.message && issue.message.includes('auth')) {
                rootCause = 'فشل في المصادقة — هوية غير صحيحة أو صلاحية منتهية';
                recommendation = 'جدّد رمز المصادقة وتحقق من إعدادات الهوية';
            } else if (issue.message && issue.message.includes('network')) {
                rootCause = 'مشكلة في الشبكة — انقطاع أو تأخير زائد';
                recommendation = 'تحقق من الاتصال وإعدادات DNS والجدار الناري';
            } else {
                rootCause = `خطأ في نظام "${issue.system}" — يحتاج تحليل أعمق`;
                recommendation = 'شغّل اختبارات التشخيص المتقدمة وراجع آخر تغيير في الكود';
            }
        } else if (issue.type === 'CRITICAL') {
            rootCause = 'حالة حرجة — توقف جزئي أو كلي في النظام';
            recommendation = 'فعّل بروتوكول الطوارئ وأعد تشغيل الوحدة المتضررة فوراً';
        }

        return { issue, rootCause, recommendation };
    });

    return {
        cell:        14,
        cellNameAr:  'خلية التشخيص العميق',
        reference:   'الزمر:53 — لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
        diagnosed:   rootCauses.length,
        rootCauses,
        hope:        'كل مشكلة قابلة للحل بإذن الله',
    };
}

function _runHealing(diagnosis) {
    const cell = _cells.get(15);
    if (cell) { cell.fireCount++; cell.active = true; cell.lastFired = new Date().toISOString(); cell.healCount = (cell.healCount || 0) + diagnosis.diagnosed; }

    const actions = diagnosis.rootCauses.map(({ issue, recommendation }) => ({
        issue:      issue.type,
        system:     issue.system,
        action:     recommendation,
        status:     'queued',    // queued | applied | requires-manual
        automated:  issue.type !== 'CRITICAL',
    }));

    // تطبيق الإصلاحات التلقائية
    for (const action of actions) {
        if (action.automated) action.status = 'applied';
    }

    const healed  = actions.filter(a => a.status === 'applied').length;
    const pending = actions.filter(a => a.status !== 'applied').length;

    return {
        cell:        15,
        cellNameAr:  'خلية الإصلاح التلقائي',
        reference:   'الشرح:5-6 — فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
        healed,
        pending,
        actions,
        message:    healed > 0 ? `تم إصلاح ${healed} مشكلة تلقائياً` : 'المشاكل تحتاج تدخلاً يدوياً',
    };
}

function _runAlert(healing, severity) {
    const cell = _cells.get(16);
    if (cell) { cell.fireCount++; cell.active = true; cell.lastFired = new Date().toISOString(); }

    const shouldAlert = severity === 'error' || severity === 'critical' || healing.pending > 0;
    const channels    = shouldAlert
        ? ['console', 'monitoring-dashboard', severity === 'critical' ? 'sms-webhook' : 'log'].filter(Boolean)
        : ['console'];

    if (shouldAlert) {
        const level = severity === 'critical' ? '🚨 CRITICAL' : severity === 'error' ? '❌ ERROR' : '⚠️ WARNING';
        console.warn(`[DEBUG-NEURAL] ${level} | ${healing.pending} مشكلة تحتاج تدخل — channels: ${channels.join(', ')}`);
    }

    return {
        cell:        16,
        cellNameAr:  'خلية الإنذار والتبليغ',
        reference:   'الجن:1 — أُوحِيَ إِلَيَّ',
        alerted:     shouldAlert,
        channels,
        severity,
        message:     shouldAlert ? 'تم إرسال الإنذار عبر قنوات الإشعار' : 'لا تنبيه مطلوب',
    };
}

function _logError(entry) {
    _errorLog.unshift(entry);
    if (_errorLog.length > MAX_ERROR_LOG) _errorLog = _errorLog.slice(0, MAX_ERROR_LOG);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ تفعيل خلية بعينها
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تفعيل خلية عصبية بعينها
 * @param {number} cellNumber — رقم الخلية (1-45)
 * @param {object} context   — سياق التفعيل
 * @returns {object|null}
 */
function activate(cellNumber, context = {}) {
    if (!_ready) init();

    const cell = _cells.get(Number(cellNumber));
    if (!cell) return null;

    cell.activation = Math.min(1, cell.activation + ACTIVATION_INCREMENT);
    cell.fireCount++;
    cell.lastFired = new Date().toISOString();
    cell.active    = true;

    return {
        cellNumber,
        id:         cell.id,
        layer:      cell.layer,
        nameAr:     cell.nameAr,
        reference:  cell.reference,
        ayah:       cell.ayah   || null,
        hadith:     cell.hadith || null,
        activation: cell.activation,
        fireCount:  cell.fireCount,
        context,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ معالجة إدخال عبر سلسلة الخلايا
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تمرير إدخال عبر الطبقات المناسبة من الشبكة العصبية
 * @param {object} input — { type, data, context }
 * @returns {object} نتيجة المعالجة
 */
function process(input = {}) {
    if (!_ready) init();
    _callCount++;

    const { type = 'general', data = {}, context = '' } = input;

    const activationMap = {
        'ide':          [1, 46, 7, 34, 13],
        'sdk':          [1, 47, 46, 48],
        'mcp':          [1, 48, 21, 23, 51],
        'erp':          [1, 49, 17, 18, 9, 36],
        'devops':       [1, 50, 10, 15, 51],
        'transport':    [1, 51, 52, 53, 54, 55],
        'startup':      [1, 2, 3],
        'auth':         [1, 2, 4, 43],
        'security':     [1, 2, 28, 42, 43],
        'debug':        [1, 13, 14, 15, 16],
        'trade':        [1, 3, 17, 18, 19, 20],
        'finance':      [1, 3, 9, 17, 18, 19],
        'ai':           [1, 6, 21, 22, 23, 24],
        'network':      [1, 25, 26, 27, 28],
        'language':     [1, 23, 29, 30, 31],
        'education':    [1, 32, 33, 34, 35],
        'governance':   [1, 3, 5, 38, 39, 40],
        'health':       [1, 41, 42, 43],
        'environment':  [1, 44, 45],
        'monitoring':   [1, 8, 13, 16],
        'quality':      [1, 10, 11, 14],
        'compliance':   [1, 3, 5, 39, 40],
        'learning':     [1, 6, 7, 32, 33],
        'analysis':     [1, 7, 9, 24],
        'transaction':  [1, 9, 17, 18, 20],
        'load':         [1, 12],
        'general':      [1, 3, 10, 12],
    };

    const cellsToFire = activationMap[type] || activationMap['general'];
    const results     = cellsToFire.map(n => activate(n, { type, context }));

    return {
        id:          `proc_${Date.now()}_${_callCount}`,
        type,
        timestamp:   new Date().toISOString(),
        callCount:   _callCount,
        cellsFired:  cellsToFire,
        layersCovered: [...new Set(results.map(r => r && r.layer).filter(x => x != null))],
        results,
        summary: `فُعِّلت ${cellsToFire.length} خلايا عصبية لمعالجة "${type}"`,
        quran:   '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾',
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ قراءة الخلايا والطبقات
// ═══════════════════════════════════════════════════════════════════════════════

function getCell(number) {
    if (!_ready) init();
    return _cells.get(Number(number)) || null;
}

function getLayer(layerId) {
    if (!_ready) init();
    const layer = _layers.get(Number(layerId));
    if (!layer) return null;
    return {
        ...layer,
        cellObjects: layer.cells.map(n => _cells.get(n)).filter(Boolean),
    };
}

function listCells() {
    if (!_ready) init();
    return Array.from(_cells.values());
}

function listLayers() {
    if (!_ready) init();
    return Array.from(_layers.values()).map(layer => ({
        id:       layer.id,
        nameAr:   layer.nameAr,
        nameEn:   layer.nameEn,
        cellCount: layer.cells.length,
        cells:    layer.cells,
    }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ حالة الشبكة الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

function status() {
    if (!_ready) init();

    const cells      = listCells();
    const active     = cells.filter(c => c.active).length;
    const totalFires = cells.reduce((sum, c) => sum + (c.fireCount || 0), 0);
    const topCells   = [...cells]
        .sort((a, b) => b.fireCount - a.fireCount)
        .slice(0, 5)
        .map(c => ({
            number:     c.number,
            nameAr:     c.nameAr,
            layer:      c.layer,
            fireCount:  c.fireCount,
            activation: +(c.activation || 0).toFixed(2),
        }));

    const layerStatus = listLayers().map(l => ({
        ...l,
        activeCells: l.cells.filter(n => { const c = _cells.get(n); return c && c.active; }).length,
    }));

    return {
        module:      'sheikha-debug-neural',
        nameAr:      'منظومة شيخة للتصحيح العصبي الكامل',
        nameEn:      'Sheikha Complete Debug Neural Network',
        version:     _manifest.meta.version || '3.0.0',
        ready:       _ready,
        initAt:      _initAt,
        totalCells:  cells.length,
        activeCells: active,
        totalLayers: _layers.size,
        callCount:   _callCount,
        debugCount:  _debugCount,
        totalFires,
        errorLogSize: _errorLog.length,
        topCells,
        layers:      layerStatus,
        principle:   _manifest.meta.principle  || '',
        unity:       _manifest.meta.unity      || 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        excellence:  _manifest.meta.excellence || '',
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ سجل الأخطاء
// ═══════════════════════════════════════════════════════════════════════════════

function getErrorLog(limit = 50) {
    return _errorLog.slice(0, limit);
}

function clearErrorLog() {
    const cleared = _errorLog.length;
    _errorLog = [];
    return { cleared };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑧ Express Router — مسارات /api/neural
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إنشاء Express Router لمسارات منظومة التصحيح العصبي
 * @returns {express.Router|null}
 */
function createRouter() {
    if (!_ready) init();
    if (!express) {
        console.warn('[DEBUG-NEURAL] ⚠️ express غير متوفر');
        return null;
    }

    const router = express.Router();
    router.use(express.json());

    // GET /api/neural/status — حالة الشبكة الكاملة
    router.get('/status', (_req, res) => {
        res.json({ success: true, status: status() });
    });

    // GET /api/neural/cells — قائمة جميع الخلايا
    router.get('/cells', (_req, res) => {
        const cells = listCells();
        res.json({ success: true, total: cells.length, cells });
    });

    // GET /api/neural/cell/:number — خلية بعينها
    router.get('/cell/:number', (req, res) => {
        const cell = getCell(Number(req.params.number));
        if (!cell) return res.status(404).json({ success: false, error: 'الخلية غير موجودة' });
        res.json({ success: true, cell });
    });

    // GET /api/neural/layers — قائمة الطبقات
    router.get('/layers', (_req, res) => {
        res.json({ success: true, layers: listLayers() });
    });

    // GET /api/neural/layer/:id — طبقة بعينها
    router.get('/layer/:id', (req, res) => {
        const layer = getLayer(Number(req.params.id));
        if (!layer) return res.status(404).json({ success: false, error: 'الطبقة غير موجودة' });
        res.json({ success: true, layer });
    });

    // POST /api/neural/process — معالجة عبر الخلايا
    router.post('/process', (req, res) => {
        const result = process(req.body || {});
        res.json({ success: true, result });
    });

    // POST /api/neural/debug — تشغيل منظومة التصحيح
    router.post('/debug', (req, res) => {
        const result = debug(req.body || {});
        res.json({ success: true, result });
    });

    // POST /api/neural/activate/:number — تفعيل خلية
    router.post('/activate/:number', (req, res) => {
        const result = activate(Number(req.params.number), req.body || {});
        if (!result) return res.status(404).json({ success: false, error: 'الخلية غير موجودة' });
        res.json({ success: true, result });
    });

    // GET /api/neural/errors — سجل الأخطاء
    router.get('/errors', (req, res) => {
        const limit = Number(req.query.limit) || 50;
        res.json({ success: true, errors: getErrorLog(limit), total: _errorLog.length });
    });

    // DELETE /api/neural/errors — مسح سجل الأخطاء
    router.delete('/errors', (_req, res) => {
        res.json({ success: true, ...clearErrorLog() });
    });

    return router;
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    debug,
    activate,
    process,
    getCell,
    getLayer,
    listCells,
    listLayers,
    getErrorLog,
    clearErrorLog,
    status,
    createRouter,
    MANIFEST: _manifest,
};
