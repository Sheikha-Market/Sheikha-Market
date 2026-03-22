#!/usr/bin/env node
'use strict';

/**
 * رقمنة فئات المجتمع الديني والثقافي
 * SHEIKHA - Faith & Community Digitalization (Quran/Sunnah aligned)
 *
 * ملاحظة حاكمة:
 * - هذا التصنيف للتوثيق المعرفي والخدمات العامة فقط.
 * - يُمنع استخدامه للتمييز أو الإقصاء أو انتقاص الحقوق.
 * - الكرامة الإنسانية والعدل أصل ثابت للجميع.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function safeBackupIfExists(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    ensureDir(BACKUPS_DIR);
    const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
    const backupName = `${path.basename(filePath)}.${stamp}.bak`;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
}

function sha256FromBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function buildModel() {
    const model = {
        generatedAt: new Date().toISOString(),
        title: 'سجل رقمنة فئات المجتمع الديني والثقافي',
        covenant: {
            basis: 'الكتاب والسنة',
            principles: [
                'العدل',
                'الرحمة',
                'حفظ الكرامة الإنسانية',
                'حرمة الدماء والأموال والأعراض',
                'الوفاء بالعقود والعهود',
            ],
            quranicReferences: [
                {
                    verse: 'الممتحنة:8',
                    text: 'لا ينهاكم الله عن الذين لم يقاتلوكم في الدين... أن تبروهم وتقسطوا إليهم',
                    governanceUse: 'البر والقسط مع غير المحاربين',
                },
                {
                    verse: 'الحجرات:13',
                    text: 'إنا خلقناكم من ذكر وأنثى وجعلناكم شعوباً وقبائل لتعارفوا',
                    governanceUse: 'التعارف والتكامل بين المجتمعات',
                },
                {
                    verse: 'النحل:90',
                    text: 'إن الله يأمر بالعدل والإحسان',
                    governanceUse: 'العدل معيار إلزامي في السياسات',
                },
            ],
            sunnahReferences: [
                {
                    source: 'صحيح البخاري',
                    text: 'من ظلم معاهداً أو انتقصه حقه... فأنا حجيجه يوم القيامة',
                    governanceUse: 'حماية غير المسلمين في المجتمع',
                },
                {
                    source: 'حديث عام في المقاصد',
                    text: 'لا ضرر ولا ضرار',
                    governanceUse: 'منع أي ضرر أو تمييز مؤسسي',
                },
            ],
        },
        categories: [
            {
                id: 'COMM-001',
                key: 'muslim',
                name: 'المسلمون',
                identityNotes: 'تحتها درجات الإيمان والإحسان كسياق تربوي لا تمييزي في الحقوق العامة.',
                serviceConsiderations: [
                    'تمكين التعليم الشرعي',
                    'برامج الأسرة والهوية',
                    'خدمات الوقف والزكاة وفق الأنظمة',
                ],
            },
            {
                id: 'COMM-002',
                key: 'ahl-al-kitab',
                name: 'أهل الكتاب (يهود/نصارى)',
                identityNotes: 'تصنيف معرفي شرعي/تاريخي، لا يجيز انتقاص الحقوق المدنية.',
                serviceConsiderations: [
                    'حماية دور العبادة وفق الأنظمة',
                    'ضمان الحقوق التعاقدية والاقتصادية',
                    'آليات حوار وتعايش مجتمعي',
                ],
            },
            {
                id: 'COMM-003',
                key: 'other-faiths',
                name: 'أصحاب الديانات والمعتقدات الأخرى',
                identityNotes: 'يعاملون بالعدل والكرامة الإنسانية وحفظ الأمن والسلم المجتمعي.',
                serviceConsiderations: [
                    'خدمات عامة دون تمييز',
                    'حماية من خطاب الكراهية والاعتداء',
                    'مشاركة في المبادرات المدنية المشتركة',
                ],
            },
            {
                id: 'COMM-004',
                key: 'muallaf-qulubuhum',
                name: 'المؤلفة قلوبهم',
                identityNotes: 'باب شرعي مقصوده الاستقرار الاجتماعي والتأليف على الخير.',
                serviceConsiderations: [
                    'برامج دعم اجتماعي وإرشاد',
                    'توعية معرفية متدرجة',
                    'رعاية مجتمعية تمنع الاستغلال',
                ],
            },
            {
                id: 'COMM-005',
                key: 'riqab-beneficiaries',
                name: 'في الرقاب (سياق معاصر: فك الكرب والتحرير من القيود القهرية)',
                identityNotes: 'تفعيل المقصد الشرعي المعاصر في مكافحة الاتجار بالبشر والاستعباد الحديث.',
                serviceConsiderations: [
                    'دعم قانوني ونفسي للضحايا',
                    'صناديق تحرير الديون القهرية المعتبرة نظاماً',
                    'إعادة إدماج اقتصادي كريم',
                ],
            },
        ],
        policyControls: {
            noHarmRule: {
                enabled: true,
                policy: 'لا ضرر ولا ضرار: أي استخدام يسبب أذى مباشر أو غير مباشر محظور.',
            },
            antiDiscrimination: {
                enabled: true,
                policy: 'يمنع التمييز في الخدمات الأساسية والعدالة والإجراءات الإدارية.',
            },
            dataProtection: {
                level: 'high',
                policy: 'بيانات الهوية الدينية/الثقافية حساسة وتستخدم بأقل قدر لازم.',
            },
            lawfulUseOnly: {
                enabled: true,
                policy: 'الاستخدام محصور في التخطيط الاجتماعي والخدمات والسياسات العامة.',
            },
            forbiddenUseCases: [
                'التحريض أو الكراهية',
                'الاستبعاد الوظيفي/الخدمي بسبب الانتماء الديني',
                'المراقبة غير المشروعة أو الوصم المجتمعي',
            ],
        },
        integrationBlueprint: {
            personIdentityLayers: [
                'هوية الدولة',
                'هوية الموطن/المنطقة',
                'هوية المجتمع المحلي',
                'الاحتياج الخدمي الفردي',
            ],
            matchingRules: [
                'تقديم الخدمة وفق الاحتياج لا وفق التصنيف العقدي فقط',
                'المرجعية الشرعية تضبط الأخلاق والسياسات لا تؤسس للظلم',
                'الاعتراف بالتنوع الثقافي ضمن وحدة السلم والعدل',
            ],
            outputs: [
                'خرائط احتياج مجتمعي لكل فئة',
                'برامج دعوية/تعريفية قائمة على الحكمة',
                'مؤشرات عدالة وتعايش شهرية',
            ],
        },
    };

    return model;
}

function renderHtml(model) {
    const rows = model.categories.map((category) => {
        const points = category.serviceConsiderations.map((item) => `<li>${item}</li>`).join('');
        return `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.identityNotes}</td>
                <td><ul>${points}</ul></td>
            </tr>
        `;
    }).join('');

    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>رقمنة فئات المجتمع الديني</title>
<style>
:root {
    --bg: #f5f1e8;
    --card: #fffaf1;
    --ink: #1b2a24;
    --gold: #b88a2a;
    --copper: #9a5e2c;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: 'Tajawal', sans-serif; }
header { padding: 22px; background: linear-gradient(120deg, var(--gold), var(--copper)); color: #fff; }
main { padding: 18px; display: grid; gap: 14px; }
.panel { background: var(--card); border: 1px solid #e7d9bb; border-radius: 14px; padding: 14px; }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid #ebdec5; padding: 10px; text-align: right; vertical-align: top; }
ul { margin: 0; padding-inline-start: 18px; }
.badge { display: inline-block; border-radius: 999px; padding: 5px 10px; background: rgba(184, 138, 42, 0.15); color: #6e4a16; font-size: 12px; margin-inline-end: 8px; }
</style>
</head>
<body>
<header>
    <h1>رقمنة فئات المجتمع الديني والثقافي</h1>
    <p>إطار معرفي وخدمي منضبط بالكتاب والسنة، مع عدل شامل وكرامة إنسانية للجميع</p>
</header>
<main>
    <section class="panel">
        <span class="badge">مبدأ: العدل</span>
        <span class="badge">مبدأ: الرحمة</span>
        <span class="badge">مبدأ: منع التمييز</span>
        <span class="badge">مبدأ: حماية البيانات</span>
    </section>

    <section class="panel">
        <h3>الفئات الرقمية</h3>
        <table>
            <thead>
                <tr>
                    <th>المعرف</th>
                    <th>الفئة</th>
                    <th>وصف تنظيمي</th>
                    <th>اعتبارات خدمة</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </section>

    <section class="panel">
        <h3>ضوابط إلزامية</h3>
        <ul>
            <li>يُمنع التحريض والكراهية والوصم.</li>
            <li>أي تصنيف لا يبرر انتقاص حق مدني أو اقتصادي أو قضائي.</li>
            <li>التوثيق غرضه التخطيط الخدمي، التعارف، والانسجام المجتمعي.</li>
        </ul>
    </section>
</main>
</body>
</html>`;
}

function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);
    ensureDir(BACKUPS_DIR);

    const model = buildModel();
    const jsonPath = path.join(DATA_DIR, 'sheikha-faith-communities-registry.json');
    const htmlPath = path.join(REPORTS_DIR, 'sheikha-faith-communities-report.html');

    const backupPath = safeBackupIfExists(jsonPath);
    const jsonBuffer = Buffer.from(JSON.stringify(model, null, 4), 'utf8');

    fs.writeFileSync(jsonPath, jsonBuffer);
    fs.writeFileSync(htmlPath, renderHtml(model), 'utf8');

    const manifestPath = path.join(REPORTS_DIR, 'sheikha-faith-communities-integrity-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        file: path.relative(ROOT_DIR, jsonPath),
        backupFile: backupPath ? path.relative(ROOT_DIR, backupPath) : null,
        sha256: sha256FromBuffer(jsonBuffer),
        controls: {
            noHarm: true,
            antiDiscrimination: true,
            lawfulUseOnly: true,
            dataProtection: true,
        },
    }, null, 4), 'utf8');

    console.log('✅ تم إنشاء سجل رقمنة فئات المجتمع الديني');
    console.log(`📁 JSON: ${jsonPath}`);
    console.log(`📁 HTML: ${htmlPath}`);
    console.log(`📁 MANIFEST: ${manifestPath}`);
    if (backupPath) {
        console.log(`📁 BACKUP: ${backupPath}`);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    buildModel,
    renderHtml,
};
