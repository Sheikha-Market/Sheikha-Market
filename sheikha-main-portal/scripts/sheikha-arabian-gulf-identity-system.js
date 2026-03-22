#!/usr/bin/env node
'use strict';

/**
 * منظومة هوية الجزيرة العربية والخليج العربي
 * رقمنة بالكتاب والسنة مع حفظ الكرامة ومنع الضرر
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

function buildArabianGulfIdentity() {
    return {
        generatedAt: new Date().toISOString(),
        title: 'منظومة هوية الجزيرة العربية والخليج العربي',
        foundation: {
            basis: 'الكتاب والسنة',
            objective: 'وحدة هوية حضارية رحيمة عادلة، خادمة للإنسان، موحدة لله',
            principles: [
                'التوحيد والعبودية لله',
                'العدل والإحسان',
                'حفظ النفس والمال والعرض',
                'لا ضرر ولا ضرار',
                'صون التنوع الثقافي العربي والخليجي',
            ],
            references: [
                { type: 'Quran', text: 'واعتصموا بحبل الله جميعاً ولا تفرقوا (آل عمران:103)' },
                { type: 'Quran', text: 'إن الله يأمر بالعدل والإحسان (النحل:90)' },
                { type: 'Sunnah', text: 'لا ضرر ولا ضرار' },
            ],
        },
        systems: {
            arabianPeninsulaSystem: {
                id: 'ARABIA-SYS-001',
                name: 'منظومة الجزيرة العربية',
                regions: ['الحجاز', 'نجد', 'عسير', 'اليمن', 'عُمان التاريخية', 'الأحساء', 'البحرين التاريخية'],
                countriesCore: ['SA', 'YE', 'OM'],
                identityAxes: [
                    'اللغة العربية',
                    'الإرث الإسلامي',
                    'القيم القبلية المنضبطة بالشرع',
                    'التكافل المجتمعي',
                ],
            },
            gulfSystem: {
                id: 'GULF-SYS-001',
                name: 'منظومة الخليج العربي',
                gccCountries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
                identityAxes: [
                    'الهوية الخليجية العربية',
                    'فقه التعايش والتعاون',
                    'حماية البيئة البحرية والبرية',
                    'اقتصاد تكاملي خالٍ من الضرر',
                ],
                councilAlignment: {
                    name: 'دول مجلس التعاون الخليجي',
                    integrationTracks: [
                        'التعليم والهوية',
                        'الاقتصاد والتجارة',
                        'الخدمات الرقمية العابرة للحدود',
                        'المعايير الشرعية المشتركة',
                    ],
                },
            },
        },
        identityProfiles: {
            arabIdentity: {
                masculine: 'العربي',
                feminine: 'العربية',
                values: ['الفصاحة', 'الوفاء', 'النجدة', 'العدل'],
            },
            gulfIdentity: {
                masculine: 'الخليجي',
                feminine: 'الخليجية',
                values: ['الترابط', 'الضيافة', 'الاستقرار', 'خدمة المجتمع'],
            },
        },
        safeguards: {
            noHarmPolicy: {
                enabled: true,
                text: 'أي تكامل أو قرار يجب أن يُراجع ضد معيار لا ضرر ولا ضرار.',
            },
            informationPreservation: {
                enabled: true,
                text: 'حفظ السجلات، النسخ الاحتياطي، ومنع فقد البيانات.',
            },
            antiMisuse: [
                'منع الوصم المجتمعي',
                'منع خطاب الكراهية',
                'منع أي تمييز سلبي بالخدمات',
            ],
        },
    };
}

function renderHtml(model) {
    const gccList = model.systems.gulfSystem.gccCountries.map((country) => `<li>${country}</li>`).join('');
    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>منظومة هوية الجزيرة العربية والخليج</title>
<style>
:root{--bg:#f4efe5;--panel:#fffaf1;--ink:#1f2f28;--gold:#b88a2a;--copper:#9a5e2c}
body{margin:0;font-family:'Tajawal',sans-serif;background:var(--bg);color:var(--ink)}
header{padding:20px;color:#fff;background:linear-gradient(120deg,var(--gold),var(--copper))}
main{padding:16px;display:grid;gap:12px}.panel{background:var(--panel);border:1px solid #e7d9bb;border-radius:12px;padding:12px}
</style>
</head>
<body>
<header><h1>منظومة هوية الجزيرة العربية والخليج العربي</h1><p>رقمنة هوية عربية/خليجية منضبطة بالكتاب والسنة ووحدة لله</p></header>
<main>
<section class="panel"><h3>هوية العرب</h3><p>${model.identityProfiles.arabIdentity.masculine} / ${model.identityProfiles.arabIdentity.feminine}</p></section>
<section class="panel"><h3>هوية الخليج</h3><p>${model.identityProfiles.gulfIdentity.masculine} / ${model.identityProfiles.gulfIdentity.feminine}</p></section>
<section class="panel"><h3>دول مجلس التعاون الخليجي</h3><ul>${gccList}</ul></section>
<section class="panel"><h3>الضوابط</h3><ul><li>لا ضرر ولا ضرار</li><li>حفظ المعلومات والنسخ الاحتياطي</li><li>منع التمييز والوصم</li></ul></section>
</main>
</body>
</html>`;
}

function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const model = buildArabianGulfIdentity();
    const jsonPath = path.join(DATA_DIR, 'sheikha-arabian-gulf-identity-system.json');
    const htmlPath = path.join(REPORTS_DIR, 'sheikha-arabian-gulf-identity-report.html');

    fs.writeFileSync(jsonPath, JSON.stringify(model, null, 4), 'utf8');
    fs.writeFileSync(htmlPath, renderHtml(model), 'utf8');

    console.log('✅ تم تفعيل منظومة الجزيرة العربية والخليج العربي');
    console.log(`📁 JSON: ${jsonPath}`);
    console.log(`📁 HTML: ${htmlPath}`);
}

if (require.main === module) {
    main();
}

module.exports = { buildArabianGulfIdentity };
