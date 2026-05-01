#!/usr/bin/env node
'use strict';
// بسم الله الرحمن الرحيم
// SHEIKHA OS DASHBOARD — لوحة النظام الرئيسية

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const latestReport = path.join(ROOT, 'reports', 'os', 'sheikha-os-report-latest.json');

const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const green = (t) => `${C.bold}${C.green}${t}${C.reset}`;
const yellow = (t) => `${C.bold}${C.yellow}${t}${C.reset}`;
const red = (t) => `${C.bold}${C.red}${t}${C.reset}`;
const cyan = (t) => `${C.bold}${C.cyan}${t}${C.reset}`;
const bold = (t) => `${C.bold}${t}${C.reset}`;

function statusColor(status) {
    if (['PASS', 'ACTIVE', 'RUNNING', 'SECURED', 'CALCULATED'].includes(status)) {
        return green(status);
    }
    if (['PARTIAL', 'LIMITED', 'STANDBY'].includes(status)) {
        return yellow(status);
    }
    return red(status || 'UNKNOWN');
}

function printLine(title, value) {
    const key = `${title}`.padEnd(20);
    console.log(`  ${cyan(key)} : ${value}`);
}

function printCapabilities(modules) {
    const capabilities = [
        {
            id: 'SOV-SEC-01',
            name: 'الحوكمة الشرعية الكاملة',
            ok: modules.security?.score >= 95,
            detail: 'لا ربا/لا غرر/لا غش + تدقيق شرعي'
        },
        {
            id: 'SOV-AI-01',
            name: 'محرك ذكاء اصطناعي متعدد',
            ok: modules.ai?.score >= 40,
            detail: 'Ollama + OpenAI/Claude/Gemini'
        },
        {
            id: 'SOV-CLD-01',
            name: 'طبقة سحابية هجينة',
            ok: modules.saas?.score >= 80,
            detail: 'Vercel + GCP + Self-Hosted'
        },
        {
            id: 'SOV-CTR-01',
            name: 'عقود رقمية موقعة',
            ok: modules.partnerships?.signedCount > 0,
            detail: 'Seal + Verify + Audit Hash'
        },
        {
            id: 'SOV-MKT-01',
            name: 'سوق رقمي حي',
            ok: modules.market?.status === 'ACTIVE',
            detail: 'Listings + RFQ + مؤشر شيخة'
        },
        {
            id: 'SOV-ZKT-01',
            name: 'محرك الزكاة الذكي',
            ok: modules.zakat?.status === 'ACTIVE',
            detail: '2.5% + توزيع الأصناف الثمانية'
        }
    ];

    console.log('\n' + bold('  القدرات الكبرى للنظام'));
    console.log('  ------------------------------------------------------------');
    capabilities.forEach((cap) => {
        const mark = cap.ok ? green('READY') : yellow('PLAN');
        console.log(`  [${cap.id}] ${cap.name} -> ${mark}`);
        console.log(`      ${cap.detail}`);
    });
}

function main() {
    if (!fs.existsSync(latestReport)) {
        console.error(red('لم يتم العثور على تقرير النظام. شغّل أولاً: npm run -s ops:os:boot'));
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(latestReport, 'utf8'));
    const modules = report.modules || {};

    console.log('');
    console.log(bold('============================================================'));
    console.log(bold('SHEIKHA OS CLOUD - COMMAND DASHBOARD'));
    console.log(bold('============================================================'));

    printLine('System', report.system || 'Sheikha OS Cloud');
    printLine('Version', report.version || '1.0.0-cloud');
    printLine('Status', statusColor(report.status || 'UNKNOWN'));
    printLine('Overall Score', cyan(String(report.overallScore || 0) + '/100'));
    printLine('Grade', cyan(report.grade || 'N/A'));
    printLine('Barakah', cyan(`${report.barakahScore || 0}/100 (${report.barakahGrade || 'N/A'})`));
    printLine('Domain', report.domain || 'sheikha.top');
    printLine('Booted At', report.bootedAt || 'N/A');

    console.log('\n' + bold('  حالة الطبقات الأساسية'));
    console.log('  ------------------------------------------------------------');
    const rows = [
        ['Kernel', modules.kernel],
        ['Security', modules.security],
        ['Partnerships', modules.partnerships],
        ['SaaS', modules.saas],
        ['AI', modules.ai],
        ['Barakah', modules.barakah],
        ['Zakat', modules.zakat],
        ['Market', modules.market],
        ['Audit', modules.audit]
    ];

    rows.forEach(([name, data]) => {
        const status = statusColor(data?.status || 'UNKNOWN');
        const score = `${data?.score ?? 0}`.padStart(3) + '%';
        console.log(`  ${name.padEnd(14)}  ${status.toString().padEnd(20)}  ${cyan(score)}`);
    });

    printCapabilities(modules);

    console.log('\n' + bold('  أوامر التحكم السريع'));
    console.log('  ------------------------------------------------------------');
    console.log('  npm run -s ops:os:boot              # تشغيل نواة Sheikha OS');
    console.log('  npm run -s ops:os:dashboard         # عرض لوحة القيادة');
    console.log('  npm run -s ops:os:verify            # تحقق العقود الرقمية');
    console.log('  npm run -s ops:os:max-power         # تشغيل كامل: أمن + سحابة + OS');

    console.log('\n' + green('لوحة النظام جاهزة')); 
}

main();
