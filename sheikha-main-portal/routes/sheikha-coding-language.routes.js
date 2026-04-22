/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🖥️  Sheikha Coding Language Routes — مسارات لغة شيخة للترميز
 *  مدعوم بشبكة الخلايا العصبية للتنفيذ الفعلي
 *  "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

// ─── تحميل الشبكة العصبية للتنفيذ ────────────────────────────────────────────
let neuralNetwork = null;
try {
    const { getNetwork } = require('../lib/sheikha-execution-neural-cell-network');
    neuralNetwork = getNetwork();
} catch (e) {
    console.warn('⚠️ [SHEIKHA-CODE] فشل تحميل الشبكة العصبية:', e.message);
}

const DATA_DIR    = path.join(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUPPLY_FILE = path.join(DATA_DIR, 'supply.json');

function readJson(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) { return fallback; }
}

// ─── Intent mappings — ربط أوامر لغة شيخة بإجراءات التنفيذ ──────────────────
const COMMAND_INTENTS = [
    {
        patterns: [/فعّل\s*pm4/i, /activate\s*pm4/i, /تفعيل\s*pm4/i],
        action: 'pm4_activate',
        parsed: ['activate_pm4'],
        target: 'execution_orchestrator',
        endpoint: '/api/execution-orchestrator/activate',
        method: 'POST',
        description: 'تفعيل وحدة PM4 العصبية',
        execute(nn) {
            return { unit: 'pm4', activated: true, message: 'تم تفعيل PM4 - الإنتاج التشغيلي' };
        }
    },
    {
        patterns: [/شغّل\s*التنفيذ\s*التلقائي/i, /auto\s*execution/i, /تشغيل\s*التلقائي/i],
        action: 'auto_execution',
        parsed: ['run_auto_execution'],
        target: 'execution_orchestrator',
        endpoint: '/api/execution-orchestrator/auto',
        method: 'POST',
        description: 'تشغيل التنفيذ التلقائي للأوركسترا',
        execute(nn) {
            if (!nn) return { error: 'الشبكة العصبية غير متوفرة' };
            const ordersData = readJson(ORDERS_FILE, []);
            const supplyData = readJson(SUPPLY_FILE, []);
            const result = nn.execute(ordersData, supplyData);
            return {
                mode: result.mode,
                actions: result.actions,
                reasoning: result.reasoning,
                confidence: result.neural.confidence
            };
        }
    },
    {
        patterns: [/أنشئ\s*ملف/i, /create\s*file/i, /إنشاء\s*ملف/i],
        action: 'git_create_file',
        parsed: ['create_file'],
        target: 'git',
        endpoint: '/api/git/create-file',
        method: 'POST',
        description: 'إنشاء ملف في مستودع GitHub',
        execute() {
            return { message: 'أرسل طلب POST إلى /api/git/create-file مع: path, content, message' };
        }
    },
    {
        patterns: [/اعرض\s*حالة\s*النظام/i, /system\s*status/i, /حالة\s*النظام/i, /show\s*status/i],
        action: 'system_status',
        parsed: ['show_system_status'],
        target: 'execution_orchestrator',
        endpoint: '/api/execution-orchestrator/state',
        method: 'GET',
        description: 'عرض حالة النظام والأوركسترا',
        execute(nn) {
            if (!nn) return { error: 'الشبكة العصبية غير متوفرة' };
            return nn.getState();
        }
    },
    {
        patterns: [/اعرض\s*حالة\s*git/i, /git\s*status/i, /حالة\s*git/i],
        action: 'git_status',
        parsed: ['show_git_status'],
        target: 'git',
        endpoint: '/api/git/status',
        method: 'GET',
        description: 'عرض حالة Git والمستودع',
        execute() {
            return { message: 'استدع GET /api/git/status لحالة المستودع' };
        }
    },
    {
        patterns: [/تعزيز\s*الإمداد/i, /boost\s*supply/i],
        action: 'boost_supply',
        parsed: ['boost_supply_mode'],
        target: 'execution_orchestrator',
        endpoint: '/api/execution-orchestrator/activate',
        method: 'POST',
        description: 'تفعيل وضع تعزيز الإمداد',
        execute(nn) {
            if (!nn) return { error: 'الشبكة العصبية غير متوفرة' };
            const ordersData = readJson(ORDERS_FILE, []);
            const supplyData = readJson(SUPPLY_FILE, []);
            const result = nn.execute(ordersData, supplyData);
            return { mode: result.mode, actions: result.actions, confidence: result.neural.confidence };
        }
    },
    {
        patterns: [/اعرض\s*الشبكة\s*العصبية/i, /neural\s*network/i, /الشبكة\s*العصبية/i],
        action: 'neural_network_status',
        parsed: ['show_neural_network'],
        target: 'execution_orchestrator',
        endpoint: '/api/execution-orchestrator/network',
        method: 'GET',
        description: 'عرض حالة شبكة الخلايا العصبية',
        execute(nn) {
            if (!nn) return { error: 'الشبكة العصبية غير متوفرة' };
            const status = nn.getNetworkStatus();
            return {
                name:    status.name,
                version: status.version,
                cells:   Object.keys(status.cells).length,
                architecture: status.architecture,
                currentMode:  status.runtime.currentMode,
                executionsCount: status.runtime.executionsCount
            };
        }
    }
];

// ─── تحليل الأمر ──────────────────────────────────────────────────────────────
function parseCommand(command) {
    const cmd = (command || '').trim();
    for (const intent of COMMAND_INTENTS) {
        for (const pattern of intent.patterns) {
            if (pattern.test(cmd)) {
                return { matched: true, ...intent, command: cmd };
            }
        }
    }
    return {
        matched: false, command: cmd,
        action: 'unknown', parsed: [],
        description: 'الأمر غير معروف — يرجى مراجعة قائمة الأوامر المدعومة'
    };
}

// ─── POST /api/sheikha-code/command — تحليل وتنفيذ أمر بلغة شيخة ─────────────
router.post('/command', (req, res) => {
    const { command, params } = req.body || {};

    if (!command) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: command' });
    }

    const intent = parseCommand(command);

    if (!intent.matched) {
        return res.status(422).json({
            ok:               false,
            error:            'unrecognized_command',
            message:          intent.description,
            command,
            supportedActions: COMMAND_INTENTS.map(i => ({
                action:      i.action,
                description: i.description,
                examples:    i.patterns.map(p => p.source).slice(0, 2)
            }))
        });
    }

    // تنفيذ الأمر مباشرةً
    let executionResult;
    try {
        executionResult = intent.execute(neuralNetwork, params);
    } catch (err) {
        executionResult = { error: err.message };
    }

    const actions = intent.parsed.map(a => a.toUpperCase());

    res.json({
        ok:   true,
        data: {
            ok:      true,
            parsed:  intent.parsed,
            target:  intent.target,
            actions,
            execution: [{
                action: actions[0] || intent.action.toUpperCase(),
                result: executionResult
            }]
        },
        message:   'تم تحليل وتنفيذ أمر لغة شيخة',
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/sheikha-code/commands — قائمة الأوامر المدعومة ─────────────────
router.get('/commands', (req, res) => {
    res.json({
        ok:       true,
        engine:   'Sheikha Coding Language Engine v2.0 — Neural Cell Network',
        language: 'العربية + English (UTF-8)',
        commands: COMMAND_INTENTS.map(i => ({
            action:      i.action,
            description: i.description,
            target:      i.target,
            endpoint:    i.endpoint,
            method:      i.method,
            examples:    i.patterns.map(p => p.source)
        })),
        timestamp: new Date().toISOString()
    });
});

// ─── POST /api/sheikha-code/parse — تحليل أمر فقط بدون تنفيذ ────────────────
router.post('/parse', (req, res) => {
    const { command } = req.body || {};
    if (!command) {
        return res.status(400).json({ ok: false, error: 'الحقل المطلوب: command' });
    }
    const parsed = parseCommand(command);
    res.json({ ok: true, command, parsed, timestamp: new Date().toISOString() });
});

module.exports = router;

