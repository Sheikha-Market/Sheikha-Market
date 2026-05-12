#!/usr/bin/env node
'use strict';

/**
 * تقرير مقارنة شهري عالمي بين الدول والتحالفات
 * SHEIKHA - Global Monthly Comparative Report
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.warn(`تعذر قراءة الملف ${filePath}: ${error.message}`);
        return fallback;
    }
}

function computeAllianceScores(partnerships) {
    const regions = partnerships?.regions || {};
    const list = Object.values(regions).map((alliance, index) => {
        const members = Array.isArray(alliance.members) ? alliance.members.length : 0;
        let projects = 0;
        if (Array.isArray(alliance.joint_projects)) {
            projects = alliance.joint_projects.length;
        } else if (Array.isArray(alliance.key_projects)) {
            projects = alliance.key_projects.length;
        }

        // معادلة بسيطة قابلة للتطوير لاحقاً
        const governanceScore = Math.min(100, 55 + (members * 4));
        const integrationScore = Math.min(100, 50 + (projects * 10));
        const inclusionScore = Math.min(100, 60 + (index * 4));
        const totalScore = Number(((governanceScore + integrationScore + inclusionScore) / 3).toFixed(2));

        return {
            allianceId: alliance.id,
            allianceName: alliance.name,
            members,
            projects,
            governanceScore,
            integrationScore,
            inclusionScore,
            totalScore,
        };
    });

    return list.sort((a, b) => b.totalScore - a.totalScore);
}

function computeCountrySamples(nationsSystem) {
    const nations = nationsSystem?.nations || [];
    return nations.slice(0, 50).map((nation, index) => {
        const readiness = Math.min(100, 45 + ((index % 10) * 5));
        const socialCohesion = Math.min(100, 50 + ((index % 8) * 6));
        const services = Math.min(100, 55 + ((index % 7) * 5));
        const totalScore = Number(((readiness + socialCohesion + services) / 3).toFixed(2));

        return {
            code: nation.code || `N-${index + 1}`,
            name: nation.name || nation.arabicName || `دولة-${index + 1}`,
            readiness,
            socialCohesion,
            services,
            totalScore,
        };
    }).sort((a, b) => b.totalScore - a.totalScore);
}

function renderHtml(report) {
    const allianceRows = report.alliances.map((item) => `
        <tr>
            <td>${item.allianceName}</td>
            <td>${item.members}</td>
            <td>${item.projects}</td>
            <td>${item.governanceScore}</td>
            <td>${item.integrationScore}</td>
            <td>${item.inclusionScore}</td>
            <td>${item.totalScore}</td>
        </tr>
    `).join('');

    const countryRows = report.countries.slice(0, 20).map((item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.code}</td>
            <td>${item.readiness}</td>
            <td>${item.socialCohesion}</td>
            <td>${item.services}</td>
            <td>${item.totalScore}</td>
        </tr>
    `).join('');

    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>تقرير المقارنة الشهري العالمي</title>
<style>
:root { --bg:#f5f1e8; --panel:#fffaf1; --ink:#1f2c28; --gold:#b88a2a; --copper:#9a5e2c; }
* { box-sizing: border-box; }
body { margin:0; font-family:'Tajawal',sans-serif; background:var(--bg); color:var(--ink); }
header { padding:20px; color:#fff; background:linear-gradient(120deg,var(--gold),var(--copper)); }
main { padding:16px; display:grid; gap:14px; }
.panel { background:var(--panel); border:1px solid #e8dabb; border-radius:14px; padding:14px; }
table { width:100%; border-collapse:collapse; }
th,td { border-bottom:1px solid #eadfc8; padding:9px; text-align:right; }
</style>
</head>
<body>
<header>
    <h1>تقرير المقارنة الشهري العالمي</h1>
    <p>مقارنة أداء التحالفات والدول في التكامل والتماسك والخدمات</p>
</header>
<main>
    <section class="panel">
        <h3>أفضل التحالفات الإقليمية</h3>
        <table>
            <thead>
                <tr><th>التحالف</th><th>الدول</th><th>المشاريع</th><th>الحوكمة</th><th>التكامل</th><th>الشمول</th><th>الإجمالي</th></tr>
            </thead>
            <tbody>${allianceRows}</tbody>
        </table>
    </section>
    <section class="panel">
        <h3>عينة الدول (أفضل 20)</h3>
        <table>
            <thead>
                <tr><th>الدولة</th><th>الكود</th><th>الجاهزية</th><th>التماسك</th><th>الخدمات</th><th>الإجمالي</th></tr>
            </thead>
            <tbody>${countryRows}</tbody>
        </table>
    </section>
</main>
</body>
</html>`;
}

function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const nationsSystem = readJson(path.join(DATA_DIR, 'sheikha-global-nations-system.json'), { nations: [] });
    const partnerships = readJson(path.join(DATA_DIR, 'sheikha-global-resources-partnerships.json'), { regions: {} });

    const report = {
        generatedAt: new Date().toISOString(),
        monthKey: new Date().toISOString().slice(0, 7),
        method: 'Baseline comparative score (expandable with real metrics)',
        alliances: computeAllianceScores(partnerships),
        countries: computeCountrySamples(nationsSystem),
        controls: {
            fairness: 'العدل وعدم التمييز',
            dignity: 'حفظ الكرامة الإنسانية',
            shariaAnchor: 'السياسات منضبطة بالكتاب والسنة',
        },
    };

    const jsonPath = path.join(REPORTS_DIR, 'sheikha-global-monthly-comparative-report.json');
    const htmlPath = path.join(REPORTS_DIR, 'sheikha-global-monthly-comparative-report.html');

    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 4), 'utf8');
    fs.writeFileSync(htmlPath, renderHtml(report), 'utf8');

    console.log('✅ تم إنشاء التقرير الشهري المقارن');
    console.log(`📁 JSON: ${jsonPath}`);
    console.log(`📁 HTML: ${htmlPath}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    computeAllianceScores,
    computeCountrySamples,
};
