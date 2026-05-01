#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const requiredFiles = [
    '.env.example',
    'scripts/install.sh',
    'scripts/uninstall.sh',
    'docs/security/سياسة-أمن-المعلومات-شيخة.md',
    'docs/security/دليل-الاستجابة-للحوادث-شيخة.md',
    'public/download.html'
];

const requiredEnvKeys = [
    'JWT_SECRET=',
    'DATA_ENCRYPTION_KEY_HEX=',
    'HSTS_ENABLED=',
    'SENTRY_DSN='
];

let failed = false;

for (const rel of requiredFiles) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
        console.error(`❌ Missing required file: ${rel}`);
        failed = true;
    }
}

const envExamplePath = path.join(root, '.env.example');
if (fs.existsSync(envExamplePath)) {
    const envText = fs.readFileSync(envExamplePath, 'utf8');
    for (const key of requiredEnvKeys) {
        if (!envText.includes(key)) {
            console.error(`❌ Missing required env key in .env.example: ${key}`);
            failed = true;
        }
    }
}

const installPath = path.join(root, 'scripts/install.sh');
if (fs.existsSync(installPath)) {
    const installText = fs.readFileSync(installPath, 'utf8');
    if (!installText.includes('NoNewPrivileges=true')) {
        console.error('❌ install.sh missing hardened systemd setting: NoNewPrivileges=true');
        failed = true;
    }
}

if (failed) {
    process.exit(1);
}

console.log('✅ Release gate passed');
