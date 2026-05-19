#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const reportDir = path.join(rootDir, 'reports', 'governance');
const packageJsonPath = path.join(rootDir, 'package.json');

const args = new Set(process.argv.slice(2));
const jsonOnly = args.has('--json');

function timestamp() {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function readPackageScripts() {
    const raw = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(raw);
    return pkg.scripts || {};
}

function detectExecutor(command) {
    if (/^node\s/.test(command)) return 'node';
    if (/^bash\s/.test(command)) return 'bash';
    if (/^pm2\s/.test(command)) return 'pm2';
    if (/^npm\s/.test(command)) return 'npm';
    return 'mixed';
}

function categorizeScript(name) {
    if (name.startsWith('ops:control')) return 'control-plane';
    if (name.startsWith('ops:repo:topology')) return 'repo-governance';
    if (name.startsWith('ops:runtime') || name.startsWith('ops:vps')) return 'runtime-deploy';
    if (name.startsWith('ops:server') || name.startsWith('server:')) return 'server-lifecycle';
    if (name.startsWith('ops:monitor') || name.startsWith('ops:health')) return 'monitoring';
    if (name.startsWith('ops:ai') || name.startsWith('ops:ollama') || name.startsWith('ollama:')) return 'ai-ops';
    if (name.startsWith('ops:activate') || name.startsWith('sovereign:')) return 'activation';
    if (name.startsWith('ops:dev') || name.startsWith('dev:')) return 'developer-experience';
    if (name.startsWith('release:')) return 'release';
    if (name.startsWith('start') || name === 'stop' || name === 'restart' || name === 'dev') return 'bootstrap';
    return 'general';
}

function interpretCommand(name, command) {
    if (name.startsWith('ops:repo:topology')) {
        return 'إدارة تكامل المستودعات وسياسات القراءة/الكتابة مع حماية المسارات الحساسة.';
    }
    if (name.startsWith('ops:runtime:check')) {
        return 'فحص صحة التشغيل والعمليات ونقاط API قبل/بعد أي تفعيل.';
    }
    if (name.startsWith('ops:vps:unified')) {
        return 'تفعيل نشر موحّد غير تفاعلي على VPS مع فحص وتشخيص بعد التنفيذ.';
    }
    if (name.startsWith('ops:control')) {
        return 'المسار الحاكم المركزي للتشغيل (stable/power/auto) ومتابعة الحالة والتقرير.';
    }
    if (/pm2/.test(command)) {
        return 'إدارة عمليات الخلفية واستمرارية الخدمة عبر PM2.';
    }
    if (/health|smoke/.test(name + ' ' + command)) {
        return 'فحص الجاهزية والصحة ومنع الانحراف التشغيلي.';
    }
    return 'سكربت تشغيلي ضمن المنظومة العامة ويحتاج وصفًا وظيفيًا أكثر دقة عند التوسعة.';
}

function shariaGovernanceTags(name, command) {
    const text = `${name} ${command}`;
    const tags = new Set();

    tags.add('الأمانة التقنية');

    if (/health|check|audit|verify|proof|status/.test(text)) {
        tags.add('التحقق والشفافية');
    }
    if (/guard|security|auth|strict|safe/.test(text)) {
        tags.add('دفع الضرر');
    }
    if (/monitor|report|logs|metrics/.test(text)) {
        tags.add('المحاسبة والانضباط');
    }
    if (/deploy|release|apply|activate/.test(text)) {
        tags.add('إتقان العمل');
    }
    if (/bank|profit|trade|market/.test(text)) {
        tags.add('مراجعة معاملات مالية');
    }

    return Array.from(tags);
}

function buildAliasGroups(entries) {
    const byCommand = new Map();

    for (const entry of entries) {
        const key = entry.command.trim();
        if (!byCommand.has(key)) byCommand.set(key, []);
        byCommand.get(key).push(entry.name);
    }

    const groups = [];
    for (const [command, names] of byCommand.entries()) {
        if (names.length > 1) {
            const canonical = names.slice().sort((a, b) => a.length - b.length)[0];
            groups.push({
                command,
                canonical,
                aliases: names.filter((name) => name !== canonical)
            });
        }
    }

    return groups.sort((a, b) => b.aliases.length - a.aliases.length);
}

function buildCriticalPath(entries) {
    const wanted = [
        'ops:control',
        'ops:repo:topology:audit',
        'ops:repo:topology:apply',
        'ops:runtime:check',
        'ops:vps:unified',
        'ops:vps:unified:push'
    ];

    return wanted
        .map((name) => entries.find((entry) => entry.name === name))
        .filter(Boolean);
}

function toMarkdown(report) {
    const lines = [];
    lines.push('# تقرير منظومة فهرسة وتفسير السكربتات');
    lines.push('');
    lines.push(`- وقت التوليد: ${report.generatedAt}`);
    lines.push(`- عدد السكربتات المفهرسة: ${report.summary.totalScripts}`);
    lines.push('');
    lines.push('## المقصد');
    lines.push('هذه المخرجات إطار حوكمة تشغيلي يساعد على الضبط والتوحيد وربط العمل التقني بقيم: الأمانة، التحقق، دفع الضرر، وإتقان العمل.');
    lines.push('هي أداة تنظيم ومراجعة تشغيلية وليست أداة فتوى شرعية.');
    lines.push('');

    lines.push('## المسار الحاكم الموحّد');
    for (const item of report.criticalPath) {
        lines.push(`- ${item.name}: ${item.command}`);
    }
    lines.push('');

    lines.push('## توزيعة الفئات');
    for (const [category, count] of Object.entries(report.summary.categories)) {
        lines.push(`- ${category}: ${count}`);
    }
    lines.push('');

    lines.push('## أعلى مجموعات التوحيد المقترحة');
    if (report.aliasGroups.length === 0) {
        lines.push('- لا توجد أسماء متعددة لنفس الأمر حاليًا.');
    } else {
        for (const group of report.aliasGroups.slice(0, 25)) {
            lines.push(`- canonical=${group.canonical}`);
            lines.push(`  command=${group.command}`);
            lines.push(`  aliases=${group.aliases.join(', ')}`);
        }
    }
    lines.push('');

    lines.push('## عينات تفسير');
    for (const sample of report.entries.slice(0, 30)) {
        lines.push(`- ${sample.name}`);
        lines.push(`  - التفسير: ${sample.interpretation}`);
        lines.push(`  - الوسوم: ${sample.shariaTags.join(' | ')}`);
    }
    lines.push('');

    return `${lines.join('\n')}\n`;
}

function main() {
    fs.mkdirSync(reportDir, { recursive: true });

    const scripts = readPackageScripts();
    const entries = Object.entries(scripts)
        .map(([name, command]) => ({
            name,
            command,
            category: categorizeScript(name),
            executor: detectExecutor(command),
            interpretation: interpretCommand(name, command),
            shariaTags: shariaGovernanceTags(name, command)
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    const categories = {};
    for (const entry of entries) {
        categories[entry.category] = (categories[entry.category] || 0) + 1;
    }

    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalScripts: entries.length,
            categories
        },
        criticalPath: buildCriticalPath(entries),
        aliasGroups: buildAliasGroups(entries),
        entries
    };

    const id = timestamp();
    const jsonPath = path.join(reportDir, `scripts-governance-index-${id}.json`);
    const latestJsonPath = path.join(reportDir, 'scripts-governance-index.latest.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(latestJsonPath, JSON.stringify(report, null, 2));

    if (!jsonOnly) {
        const mdPath = path.join(reportDir, `scripts-governance-index-${id}.md`);
        const latestMdPath = path.join(reportDir, 'scripts-governance-index.latest.md');
        const markdown = toMarkdown(report);
        fs.writeFileSync(mdPath, markdown);
        fs.writeFileSync(latestMdPath, markdown);
    }

    console.log(JSON.stringify({
        success: true,
        data: {
            generatedAt: report.generatedAt,
            reportDir,
            totalScripts: report.summary.totalScripts,
            aliasGroups: report.aliasGroups.length,
            latestJsonPath,
            latestMdPath: jsonOnly ? null : path.join(reportDir, 'scripts-governance-index.latest.md')
        },
        message: 'تم توليد فهرسة وتفسير السكربتات بنجاح',
        timestamp: new Date().toISOString()
    }, null, 2));
}

main();
