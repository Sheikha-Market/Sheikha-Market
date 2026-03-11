#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checks = [
    { name: 'server.js', file: path.join(root, 'server.js') },
    { name: 'package.json', file: path.join(root, 'package.json') },
    { name: '.env (optional)', file: path.join(root, '.env'), optional: true },
    { name: '.vscode/settings.json', file: path.join(root, '.vscode', 'settings.json') },
    { name: '.vscode/tasks.json', file: path.join(root, '.vscode', 'tasks.json') },
    { name: '.vscode/launch.json', file: path.join(root, '.vscode', 'launch.json') },
    { name: '.vscode/extensions.json', file: path.join(root, '.vscode', 'extensions.json') },
    { name: '.vscode/sheikha.code-snippets', file: path.join(root, '.vscode', 'sheikha.code-snippets') },
    { name: '.prettierrc', file: path.join(root, '.prettierrc') },
    { name: '.devcontainer/devcontainer.json', file: path.join(root, '.devcontainer', 'devcontainer.json') }
];

function statusLine(ok, label, note) {
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} ${label}${note ? ` — ${note}` : ''}`);
}

// فحص نسخة Node مقابل .nvmrc
const nvmrcPath = path.join(root, '.nvmrc');
let nvmrcVersion = null;
if (fs.existsSync(nvmrcPath)) {
    nvmrcVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
}
const currentMajor = process.version.replace(/^v/, '').split('.')[0];
const expectedMajor = nvmrcVersion ? nvmrcVersion.split('.')[0] : null;
const nodeMismatch = expectedMajor && currentMajor !== expectedMajor;

console.log('🔍 فحص جاهزية بيئة VS Code لمنظومة شيخة');
console.log('='.repeat(56));
console.log(`Node.js: ${process.version}${nodeMismatch ? ' ⚠️' : ''}`);
if (nodeMismatch) {
    console.log(`   .nvmrc يطلب: ${nvmrcVersion} — نفّذ: nvm use`);
}
console.log(`Workspace: ${root}`);
console.log('-'.repeat(56));

let failed = 0;
for (const item of checks) {
    const exists = fs.existsSync(item.file);
    if (exists) {
        statusLine(true, item.name);
    } else if (item.optional) {
        statusLine(true, item.name, 'غير موجود (اختياري)');
    } else {
        statusLine(false, item.name, 'ملف مطلوب غير موجود');
        failed += 1;
    }
}

console.log('-'.repeat(56));
if (failed > 0 || nodeMismatch) {
    if (nodeMismatch) {
        console.log(`⚠️ نسخة Node غير مطابقة — نفّذ: nvm use`);
    }
    if (failed > 0) {
        console.log(`⚠️ النتيجة: يوجد ${failed} عنصر يحتاج معالجة قبل التشغيل الكامل.`);
    }
    process.exitCode = 1;
} else {
    console.log('🚀 النتيجة: البيئة جاهزة لتطوير قوي عبر VS Code.');
}
