/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  💻 sheikha-cli-engine.js — محرك واجهة سطر الأوامر
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const VERSION = '1.4.0';

const COMMANDS = {
    'status':                 { group: 'status',     desc: 'حالة المنظومة' },
    'market live':            { group: 'market',     desc: 'أسعار المعادن اللحظية' },
    'market prices':          { group: 'market',     desc: 'سعر معدن محدد' },
    'market offers':          { group: 'market',     desc: 'قائمة العروض' },
    'contracts inspect':      { group: 'contracts',  desc: 'فحص عقد' },
    'contracts list':         { group: 'contracts',  desc: 'قائمة العقود' },
    'contracts create':       { group: 'contracts',  desc: 'إنشاء عقد' },
    'contracts approve':      { group: 'contracts',  desc: 'الموافقة على عقد' },
    'supply sync':            { group: 'supply',     desc: 'مزامنة الإمداد' },
    'supply track':           { group: 'supply',     desc: 'تتبع شحنة' },
    'supply suppliers':       { group: 'supply',     desc: 'قائمة الموردين' },
    'governance check':       { group: 'governance', desc: 'فحص الامتثال' },
    'governance audit':       { group: 'governance', desc: 'سجل الأثر' },
    'governance policies':    { group: 'governance', desc: 'السياسات النشطة' },
    'sdk list':               { group: 'sdk',        desc: 'قائمة SDK' },
    'sdk keys':               { group: 'sdk',        desc: 'مفاتيح API' },
    'sdk test':               { group: 'sdk',        desc: 'اختبار endpoint' },
    'mcp health':             { group: 'mcp',        desc: 'صحة MCP' },
    'mcp tools':              { group: 'mcp',        desc: 'أدوات MCP' },
    'mcp connect':            { group: 'mcp',        desc: 'الاتصال بعقدة' },
    'git status':             { group: 'git',        desc: 'حالة Git' },
    'git branches':           { group: 'git',        desc: 'قائمة الفروع' },
    'git sync':               { group: 'git',        desc: 'مزامنة Git' },
    'git report':             { group: 'git',        desc: 'تقرير نشاط Git' },
};

function getVersion()  { return VERSION; }
function listCommands(group) {
    const entries = Object.entries(COMMANDS);
    if (group) return Object.fromEntries(entries.filter(([, v]) => v.group === group));
    return COMMANDS;
}

/**
 * محاكاة تنفيذ أمر CLI
 */
function executeCommand(cmd, args = {}) {
    const key = cmd.replace(/^sheikha\s+/, '').trim();

    const mock = {
        'status':           () => `SHEIKHA v${VERSION}\n✅ market: active\n✅ contracts: active\n✅ supply: active\n✅ governance: active`,
        'market live':      () => `🥇 الذهب   285.40 SAR/g  ▲ +1.2%\n🥈 الفضة    3.12 SAR/g   ▲ +0.8%\n🔴 النحاس   42.80 SAR/kg ▼ -0.3%`,
        'governance check': () => `✅ الامتثال 100% | 0 انتهاكات | الميثاق مُفعَّل`,
        'git report':       () => `📊 GitHub: ✓ متزامن | 3 فروع نشطة\n📊 Commits اليوم: 14 | النشر: مستقر`,
        'sdk list':         () => `⚡ Core SDK v2.4.1 — stable\n🏪 Market SDK v1.9.0 — stable\n📋 Contract SDK v1.5.2 — stable`,
        'mcp health':       () => `✅ 7/8 عقد نشطة | uptime: 99.7% | latency: 48ms`,
    };

    const fn = mock[key];
    return {
        command:  cmd,
        output:   fn ? fn() : `[${key}] — جاري التنفيذ...`,
        exit_code: 0,
        at:       new Date().toISOString()
    };
}

module.exports = { getVersion, listCommands, executeCommand, VERSION, COMMANDS };
console.log(`✅ [CLI-ENGINE] sheikha-cli v${VERSION} — جاهز`);
