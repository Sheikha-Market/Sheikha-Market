/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🖥️  Sheikha Coding Language Routes — مسارات لغة شيخة للترميز
 *  "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── Intent mappings — ربط أوامر لغة شيخة بنقاط النهاية ─────────────────────
const COMMAND_INTENTS = [
    {
        patterns: [/فعّل\s*pm4/i, /activate\s*pm4/i, /تفعيل\s*pm4/i],
        action: 'pm4_activate',
        endpoint: '/api/pm-neural/pm4/activate',
        method: 'POST',
        description: 'تفعيل وحدة PM4 العصبية'
    },
    {
        patterns: [/شغّل\s*التنفيذ\s*التلقائي/i, /auto\s*execution/i, /تشغيل\s*التلقائي/i],
        action: 'auto_execution',
        endpoint: '/api/execution-orchestrator/auto',
        method: 'POST',
        description: 'تشغيل التنفيذ التلقائي للأوركسترا'
    },
    {
        patterns: [/أنشئ\s*ملف/i, /create\s*file/i, /إنشاء\s*ملف/i],
        action: 'git_create_file',
        endpoint: '/api/git/create-file',
        method: 'POST',
        description: 'إنشاء ملف في مستودع GitHub'
    },
    {
        patterns: [/اعرض\s*حالة\s*النظام/i, /system\s*status/i, /حالة\s*النظام/i, /show\s*status/i],
        action: 'system_status',
        endpoint: '/api/execution-orchestrator/state',
        method: 'GET',
        description: 'عرض حالة النظام والأوركسترا'
    },
    {
        patterns: [/اعرض\s*حالة\s*git/i, /git\s*status/i, /حالة\s*git/i],
        action: 'git_status',
        endpoint: '/api/git/status',
        method: 'GET',
        description: 'عرض حالة Git والمستودع'
    },
    {
        patterns: [/تعزيز\s*الإمداد/i, /boost\s*supply/i],
        action: 'boost_supply',
        endpoint: '/api/execution-orchestrator/activate',
        method: 'POST',
        description: 'تفعيل وضع تعزيز الإمداد'
    }
];

/**
 * Parse a Sheikha language command and identify its intent.
 */
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
        matched: false,
        command: cmd,
        action: 'unknown',
        description: 'الأمر غير معروف — يرجى مراجعة قائمة الأوامر المدعومة'
    };
}

// ─── POST /api/sheikha-code/command — تنفيذ أمر بلغة شيخة ───────────────────
router.post('/command', (req, res) => {
    const { command, params } = req.body || {};

    if (!command) {
        return res.status(400).json({
            success: false,
            error:   'الحقل المطلوب: command'
        });
    }

    const parsed = parseCommand(command);

    if (!parsed.matched) {
        return res.status(422).json({
            success:          false,
            error:            'unrecognized_command',
            message:          parsed.description,
            command,
            supportedActions: COMMAND_INTENTS.map(i => ({
                action:      i.action,
                description: i.description,
                examples:    i.patterns.map(p => p.source).slice(0, 2)
            }))
        });
    }

    res.json({
        success:     true,
        parsed:      true,
        command,
        action:      parsed.action,
        description: parsed.description,
        routing:     {
            endpoint: parsed.endpoint,
            method:   parsed.method,
            params:   params || null
        },
        message: `تم تحليل الأمر بنجاح — جاهز للتنفيذ على ${parsed.endpoint}`,
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/sheikha-code/commands — قائمة الأوامر المدعومة ─────────────────
router.get('/commands', (req, res) => {
    res.json({
        success: true,
        engine:  'Sheikha Coding Language Engine v1.0',
        language: 'العربية + English (UTF-8)',
        commands: COMMAND_INTENTS.map(i => ({
            action:      i.action,
            description: i.description,
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
        return res.status(400).json({ success: false, error: 'الحقل المطلوب: command' });
    }

    const parsed = parseCommand(command);
    res.json({
        success: true,
        command,
        parsed,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
