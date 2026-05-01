#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function getArg(flag, fallback = '') {
    const idx = args.indexOf(flag);
    if (idx === -1 || idx + 1 >= args.length) return fallback;
    return args[idx + 1];
}

function hasFlag(flag) {
    return args.includes(flag);
}

function printHelp() {
    console.log(`
مولد تطبيق إلكتروني سريع — Sheikha

الاستخدام:
  npm run dev:scaffold:app -- --name "my-app" --title "تطبيقي" [--with-api]

المعاملات:
  --name      اسم المجلد (مطلوب)
  --title     عنوان التطبيق في الواجهة
  --with-api  إضافة ملف API stub جاهز
  --help      عرض هذه المساعدة
`);
}

if (hasFlag('--help')) {
    printHelp();
    process.exit(0);
}

const appNameRaw = getArg('--name', '').trim();
if (!appNameRaw) {
    console.error('❌ يجب تحديد --name');
    process.exit(1);
}

const appName = appNameRaw.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
const appTitle = getArg('--title', appNameRaw).trim() || appNameRaw;
const withApi = hasFlag('--with-api');

const root = path.resolve(__dirname, '..');
const targetRoot = path.join(root, 'generated-apps', appName);
const publicRoot = path.join(targetRoot, 'public');
const srcRoot = path.join(targetRoot, 'src');
const apiRoot = path.join(targetRoot, 'api');

if (fs.existsSync(targetRoot)) {
    console.error(`❌ المسار موجود مسبقاً: ${targetRoot}`);
    process.exit(1);
}

fs.mkdirSync(publicRoot, { recursive: true });
fs.mkdirSync(srcRoot, { recursive: true });
if (withApi) fs.mkdirSync(apiRoot, { recursive: true });

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appTitle}</title>
    <link rel="stylesheet" href="./styles.css" />
</head>
<body>
    <main class="app">
        <h1>${appTitle}</h1>
        <p>تم إنشاء هذا التطبيق عبر مولد شيخة التطويري.</p>
        <button id="runBtn">تشغيل تجربة</button>
        <pre id="output">جاهز</pre>
    </main>
    <script src="./app.js"></script>
</body>
</html>
`;

const css = `:root {
    --bg: #0f172a;
    --card: #111827;
    --text: #f8fafc;
    --muted: #94a3b8;
    --gold: #d4af37;
}

* { box-sizing: border-box; }
body {
    margin: 0;
    font-family: Tajawal, system-ui, sans-serif;
    background: radial-gradient(circle at top, #1e293b 0%, var(--bg) 45%);
    color: var(--text);
}
.app {
    max-width: 780px;
    margin: 52px auto;
    padding: 24px;
    background: rgba(17, 24, 39, 0.85);
    border: 1px solid rgba(212, 175, 55, 0.18);
    border-radius: 14px;
}
h1 { margin-top: 0; color: var(--gold); }
button {
    border: 0;
    background: var(--gold);
    color: #111;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
}
pre {
    margin-top: 12px;
    padding: 12px;
    background: #020617;
    border-radius: 8px;
    color: var(--muted);
    min-height: 70px;
}
`;

const js = `const output = document.getElementById('output');
const runBtn = document.getElementById('runBtn');

runBtn.addEventListener('click', async () => {
    output.textContent = 'يتم تنفيذ التجربة...';
    const now = new Date().toLocaleString('ar-SA');
    output.textContent = '✅ التطبيق يعمل بنجاح — ' + now;
});
`;

const readme = `# ${appTitle}

تم إنشاء هذا التطبيق بواسطة:
\`npm run dev:scaffold:app -- --name "${appName}" --title "${appTitle}" ${withApi ? '--with-api' : ''}\`

## الهيكل
- public/index.html
- public/styles.css
- public/app.js
- src/
${withApi ? '- api/index.js' : ''}

## ملاحظات
- هذا قالب مبدئي سريع قابل للتوسعة.
- يمكن ربطه بواجهات \`/api/ai-core/*\` مباشرة.
`;

fs.writeFileSync(path.join(publicRoot, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(publicRoot, 'styles.css'), css, 'utf8');
fs.writeFileSync(path.join(publicRoot, 'app.js'), js, 'utf8');
fs.writeFileSync(path.join(targetRoot, 'README.md'), readme, 'utf8');
fs.writeFileSync(path.join(srcRoot, '.gitkeep'), '', 'utf8');

if (withApi) {
    const apiStub = `/**
 * API Stub — ${appTitle}
 */
module.exports = function register${appName.replace(/[-_]/g, '')}Api(app) {
    app.get('/api/generated/${appName}/health', (req, res) => {
        res.json({
            success: true,
            data: { app: '${appName}', status: 'ok' },
            message: 'واجهة التطبيق المولد جاهزة',
            timestamp: new Date().toISOString()
        });
    });
};
`;
    fs.writeFileSync(path.join(apiRoot, 'index.js'), apiStub, 'utf8');
}

console.log('✅ تم إنشاء التطبيق بنجاح:');
console.log(`📁 ${targetRoot}`);
console.log('🚀 يمكنك البدء بالتطوير فوراً داخل نفس البيئة.');
