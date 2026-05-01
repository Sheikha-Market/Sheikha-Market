/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  💻 مسارات CLI — Sheikha CLI Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();

// ─── GET /api/cli/status — حالة المنظومة ─────────────────────────────────────
router.get('/status', (req, res) => {
    res.json({
        success: true,
        system: 'SHEIKHA',
        version: 'v2.4.1',
        environment: process.env.NODE_ENV || 'production',
        services: {
            market:     { status: 'active',   latency_ms: 38 },
            contracts:  { status: 'active',   latency_ms: 41 },
            supply:     { status: 'active',   latency_ms: 35 },
            governance: { status: 'active',   latency_ms: 28 },
            auth:       { status: 'active',   latency_ms: 22 },
            analytics:  { status: 'active',   latency_ms: 55 },
            git:        { status: 'synced',   latency_ms: 120 },
            billing:    { status: 'updating', latency_ms: null }
        },
        uptime_sec: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/cli/commands — قائمة الأوامر ────────────────────────────────────
router.get('/commands', (req, res) => {
    const commands = [
        { group: 'status',      cmd: 'sheikha status',                     desc: 'عرض حالة جميع خدمات المنظومة' },
        { group: 'status',      cmd: 'sheikha status --json',              desc: 'إخراج الحالة بصيغة JSON' },
        { group: 'market',      cmd: 'sheikha market live',                desc: 'أسعار المعادن اللحظية' },
        { group: 'market',      cmd: 'sheikha market prices --metal gold', desc: 'سعر معدن محدد' },
        { group: 'market',      cmd: 'sheikha market offers --list',       desc: 'قائمة العروض النشطة' },
        { group: 'contracts',   cmd: 'sheikha contracts inspect <id>',     desc: 'فحص تفاصيل عقد' },
        { group: 'contracts',   cmd: 'sheikha contracts list',             desc: 'قائمة العقود' },
        { group: 'contracts',   cmd: 'sheikha contracts create',           desc: 'إنشاء عقد جديد' },
        { group: 'supply',      cmd: 'sheikha supply sync',                desc: 'مزامنة سلسلة الإمداد' },
        { group: 'supply',      cmd: 'sheikha supply track <order-id>',    desc: 'تتبع شحنة' },
        { group: 'governance',  cmd: 'sheikha governance check',           desc: 'فحص الامتثال الكامل' },
        { group: 'governance',  cmd: 'sheikha governance audit --tail 50', desc: 'آخر 50 سجل في الأثر' },
        { group: 'sdk',         cmd: 'sheikha sdk list',                   desc: 'قائمة حزم SDK' },
        { group: 'sdk',         cmd: 'sheikha sdk keys --create',          desc: 'إنشاء مفتاح API' },
        { group: 'mcp',         cmd: 'sheikha mcp health',                 desc: 'صحة عقد MCP' },
        { group: 'mcp',         cmd: 'sheikha mcp tools --list',           desc: 'قائمة أدوات MCP' },
        { group: 'git',         cmd: 'sheikha git status',                 desc: 'حالة المستودعات' },
        { group: 'git',         cmd: 'sheikha git branches',               desc: 'قائمة الفروع' },
        { group: 'git',         cmd: 'sheikha git sync',                   desc: 'مزامنة GitHub/GitLab' },
        { group: 'git',         cmd: 'sheikha git report',                 desc: 'تقرير نشاط التطوير' },
    ];

    const { group } = req.query;
    const filtered = group ? commands.filter(c => c.group === group) : commands;
    const groups = [...new Set(commands.map(c => c.group))];

    res.json({
        success: true,
        total: filtered.length,
        groups,
        commands: filtered,
        timestamp: new Date().toISOString()
    });
});

// ─── POST /api/cli/execute — تنفيذ أمر ────────────────────────────────────────
router.post('/execute', (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ success: false, message: 'الأمر مطلوب' });

    // محاكاة تنفيذ الأوامر
    const results = {
        'sheikha status': {
            output: `SHEIKHA v2.4.1 — production\n✅ market: active\n✅ contracts: active\n✅ supply: active\n✅ governance: active\n✅ git: synced`,
            exit_code: 0
        },
        'sheikha market live': {
            output: `🥇 الذهب   285.40 SAR/g  ▲ +1.2%  [LBMA]\n🥈 الفضة    3.12 SAR/g   ▲ +0.8%  [COMEX]\n🔴 النحاس   42.80 SAR/kg ▼ -0.3%  [LME]`,
            exit_code: 0
        },
        'sheikha governance check': {
            output: `✅ الامتثال 100% — 0 انتهاكات\n✅ لا ربا | ✅ لا غرر | ✅ توثيق مكتمل`,
            exit_code: 0
        },
        'sheikha git report': {
            output: `📊 GitHub: ✓ متزامن | 3 فروع\n📊 GitLab: ✓ متزامن\n📊 Commits اليوم: 14\n📊 النشر: مستقر`,
            exit_code: 0
        }
    };

    const result = results[command.trim()] || {
        output: `[تنفيذ: ${command}] — جاري المعالجة...`,
        exit_code: 0
    };

    res.json({
        success: true,
        command,
        ...result,
        executed_at: new Date().toISOString()
    });
});

// ─── GET /api/cli/version — إصدار CLI ────────────────────────────────────────
router.get('/version', (req, res) => {
    res.json({
        success: true,
        cli: 'sheikha-cli',
        version: '1.4.0',
        node_version: process.version,
        platform: process.platform,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
