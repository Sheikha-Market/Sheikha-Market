#!/usr/bin/env node
'use strict';

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

function readJson(filePath, fallback = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.warn(`Unable to read ${filePath}: ${error.message}`);
        return fallback;
    }
}

function bar(value) {
    const width = Math.max(2, Math.min(100, Math.round(value)));
    return `<div class="bar"><span style="width:${width}%"></span><em>${value.toFixed(1)}%</em></div>`;
}

function renderHtml(progress, alerts, perf, integration) {
    const totals = progress?.data?.summary?.totals || {};
    const layers = progress?.data?.summary?.byLayer || {};
    const alertsTotals = alerts?.data?.totals || { all: 0, critical: 0, high: 0, medium: 0 };
    const top = perf?.data?.topPerformers || [];

    const layerRows = Object.keys(layers).map((layer) => `
        <tr>
            <td>${layer}</td>
            <td>${layers[layer].count}</td>
            <td>${bar(layers[layer].avgProgress)}</td>
            <td>${layers[layer].behind}</td>
            <td>${layers[layer].overdue}</td>
        </tr>
    `).join('');

    const topRows = top.slice(0, 10).map((item) => `
        <tr>
            <td>${item.owner}</td>
            <td>${item.goals}</td>
            <td>${bar(item.avgProgress)}</td>
            <td>${item.behind}</td>
            <td>${item.overdue}</td>
        </tr>
    `).join('');

    const integrationCount = integration?.data?.stats?.totalIntegratedEntities || 0;

    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>لوحة شيخة المتقدمة للأهداف</title>
<style>
:root {
    --bg: #f3efe7;
    --panel: #fffaf1;
    --ink: #1d2b24;
    --gold: #b88a2a;
    --copper: #9a5e2c;
    --green: #2f6f57;
    --danger: #9f2f2f;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Tajawal', sans-serif; background: radial-gradient(circle at 15% 20%, #f9f2dd, var(--bg)); color: var(--ink); }
.header { padding: 24px; background: linear-gradient(110deg, var(--gold), var(--copper)); color: #fff; }
.header h1 { margin: 0 0 8px; }
.container { padding: 20px; display: grid; gap: 16px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.card { background: var(--panel); border: 1px solid #e8dabb; border-radius: 14px; padding: 14px; box-shadow: 0 6px 18px rgba(80, 49, 16, 0.08); }
.card strong { display: block; font-size: 28px; color: var(--green); }
.panel { background: var(--panel); border: 1px solid #e8dabb; border-radius: 14px; padding: 14px; }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid #eadfc8; padding: 10px; text-align: right; vertical-align: middle; }
th { color: #593b1d; }
.bar { position: relative; min-width: 160px; padding-inline-end: 48px; }
.bar span { display: block; height: 10px; border-radius: 999px; background: linear-gradient(90deg, var(--green), var(--gold)); }
.bar em { position: absolute; inset-inline-end: 0; inset-block-start: -4px; font-style: normal; font-size: 12px; }
.badges { display: flex; gap: 8px; flex-wrap: wrap; }
.badge { border-radius: 999px; padding: 6px 10px; font-size: 12px; color: #fff; }
.critical { background: var(--danger); }
.high { background: #c05a1f; }
.medium { background: #8c7f2b; }
.footer { padding: 16px 20px 30px; color: #5f4d33; font-size: 14px; }
@media (max-width: 640px) {
    .header h1 { font-size: 22px; }
    th, td { font-size: 13px; padding: 8px; }
}
</style>
</head>
<body>
<header class="header">
    <h1>لوحة شيخة المتقدمة للأهداف</h1>
    <p>قياس الإنجاز، التنبيهات، التقارير، والتكامل متعدد القطاعات بمنهج الكتاب والسنة</p>
</header>
<main class="container">
    <section class="cards">
        <article class="card"><div>إجمالي الأهداف</div><strong>${totals.total || 0}</strong></article>
        <article class="card"><div>متوسط الإنجاز</div><strong>${(totals.avgProgress || 0).toFixed(1)}%</strong></article>
        <article class="card"><div>أهداف متأخرة</div><strong>${totals.behind || 0}</strong></article>
        <article class="card"><div>أهداف متجاوزة الموعد</div><strong>${totals.overdue || 0}</strong></article>
        <article class="card"><div>تكامل التعليم/الدولة</div><strong>${integrationCount}</strong></article>
    </section>

    <section class="panel">
        <h3>مؤشرات الطبقات</h3>
        <table>
            <thead>
                <tr><th>الطبقة</th><th>عدد الأهداف</th><th>متوسط الإنجاز</th><th>متأخر</th><th>متجاوز الموعد</th></tr>
            </thead>
            <tbody>${layerRows}</tbody>
        </table>
    </section>

    <section class="panel">
        <h3>الجهات الأعلى أداء</h3>
        <table>
            <thead>
                <tr><th>الجهة</th><th>الأهداف</th><th>متوسط الإنجاز</th><th>متأخر</th><th>متجاوز الموعد</th></tr>
            </thead>
            <tbody>${topRows}</tbody>
        </table>
    </section>

    <section class="panel">
        <h3>مستويات التنبيهات</h3>
        <div class="badges">
            <span class="badge critical">حرج: ${alertsTotals.critical}</span>
            <span class="badge high">عالٍ: ${alertsTotals.high}</span>
            <span class="badge medium">متوسط: ${alertsTotals.medium}</span>
            <span class="badge" style="background:#2f6f57">الإجمالي: ${alertsTotals.all}</span>
        </div>
    </section>
</main>
<footer class="footer">
    آخر تحديث: ${new Date().toISOString()} | المبدأ الحاكم: "العدل والإحسان والأمانة وتحقيق المصلحة العامة"
</footer>
</body>
</html>`;
}

function main() {
    ensureDir(REPORTS_DIR);

    const progress = readJson(path.join(DATA_DIR, 'tracking', 'sheikha-goal-progress-latest.json'), { data: { summary: { totals: {}, byLayer: {} } } });
    const alerts = readJson(path.join(DATA_DIR, 'notifications', 'sheikha-goal-alerts-latest.json'), { data: { totals: {} } });
    const perf = readJson(path.join(ROOT_DIR, 'reports', 'final', 'sheikha-goals-performance-latest.json'), { data: { topPerformers: [] } });
    const integration = readJson(path.join(DATA_DIR, 'sheikha-cross-sector-goal-integration.json'), { data: { stats: { totalIntegratedEntities: 0 } } });

    const html = renderHtml(progress, alerts, perf, integration);
    const htmlPath = path.join(REPORTS_DIR, 'sheikha-goals-advanced-dashboard.html');
    const jsonPath = path.join(REPORTS_DIR, 'sheikha-goals-dashboard-snapshot.json');

    fs.writeFileSync(htmlPath, html, 'utf8');
    fs.writeFileSync(jsonPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        progressSummary: progress?.data?.summary || {},
        alertsSummary: alerts?.data?.totals || {},
        integrationSummary: integration?.data?.stats || {}
    }, null, 4), 'utf8');

    console.log(`Advanced dashboard written: ${htmlPath}`);
    console.log(`Snapshot JSON written    : ${jsonPath}`);
}

main();
