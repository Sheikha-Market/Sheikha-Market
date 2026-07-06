#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

function parseEnv(text) {
    const out = {};
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        const idx = trimmed.indexOf('=');
        if (idx <= 0) {
            continue;
        }
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        out[key] = value;
    }
    return out;
}

function readEnvFile() {
    if (!fs.existsSync(envPath)) {
        return {};
    }
    return parseEnv(fs.readFileSync(envPath, 'utf8'));
}

function boolValue(v, fallback = false) {
    if (v === undefined || v === null || v === '') {
        return fallback;
    }
    const s = String(v).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function isLoopbackHost(host) {
    const normalized = String(host || '').trim().toLowerCase();
    return normalized === '127.0.0.1' || normalized === 'localhost';
}

function isValidHex64(input) {
    return /^[a-fA-F0-9]{64}$/.test(String(input || '').trim());
}

function getArgValue(name, fallback = '') {
    const prefix = `${name}=`;
    const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
    return found ? String(found.slice(prefix.length)).trim() : fallback;
}

function main() {
    const envFile = readEnvFile();
    const enforceProduction = process.argv.includes('--enforce-production');
    const explicitNodeEnv = getArgValue('--node-env', '');

    const nodeEnv = (
        explicitNodeEnv
        || process.env.NODE_ENV
        || envFile.NODE_ENV
        || 'development'
    ).trim();

    const isProduction = enforceProduction || nodeEnv === 'production';

    if (!isProduction) {
        console.log(`✅ SAFETY_GUARD: بيئة غير إنتاجية (${nodeEnv}) — لا يوجد إيقاف.`);
        return;
    }

    const mergedEnv = {
        ...envFile,
        ...process.env
    };

    const issues = [];

    const host = mergedEnv.HOST || '';
    if (isLoopbackHost(host)) {
        issues.push('HOST لا يجب أن يكون localhost/127.0.0.1 في بيئة الإنتاج');
    }

    const httpsEnforced = boolValue(mergedEnv.SECURITY_ENFORCE_HTTPS, true);
    if (!httpsEnforced) {
        issues.push('SECURITY_ENFORCE_HTTPS يجب أن يكون true في بيئة الإنتاج');
    }

    if ((mergedEnv.JWT_SECRET || '').length < 32) {
        issues.push('JWT_SECRET يجب ألا يقل عن 32 حرفًا');
    }

    if ((mergedEnv.PASSWORD_SALT || '').length < 10) {
        issues.push('PASSWORD_SALT يجب ألا يقل عن 10 أحرف');
    }

    const hasHex = isValidHex64(mergedEnv.DATA_ENCRYPTION_KEY_HEX);
    const hasRaw = isValidHex64(mergedEnv.DATA_ENCRYPTION_KEY);
    if (!hasHex && !hasRaw) {
        issues.push('DATA_ENCRYPTION_KEY_HEX أو DATA_ENCRYPTION_KEY يجب أن يكون 64 hex');
    }

    if (issues.length > 0) {
        console.error('❌ SAFETY_GUARD_BLOCKED: تم إيقاف التشغيل لحماية النظام من الضرر.');
        issues.forEach((issue, index) => {
            console.error(`  ${index + 1}. ${issue}`);
        });
        process.exit(1);
    }

    console.log('✅ SAFETY_GUARD_PASSED: إعدادات الإنتاج آمنة ومطابقة للحد الأدنى.');
}

main();
