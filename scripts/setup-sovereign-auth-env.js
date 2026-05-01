#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const rootPath = process.cwd();
const envPath = path.join(rootPath, '.env');

function parseEnv(text) {
    const result = {};
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const separator = trimmed.indexOf('=');
        if (separator <= 0) {
            continue;
        }

        const key = trimmed.slice(0, separator).trim();
        const value = trimmed.slice(separator + 1).trim();
        result[key] = value;
    }
    return result;
}

function stringifyEntry(key, value) {
    return `${key}=${value}`;
}

function ensureSection(lines, title) {
    const exists = lines.some(line => line.trim() === title);
    if (!exists) {
        if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
            lines.push('');
        }
        lines.push(title);
    }
}

function upsert(lines, envMap, key, value) {
    if (envMap[key]) {
        return false;
    }

    lines.push(stringifyEntry(key, value));
    envMap[key] = value;
    return true;
}

function main() {
    let original = '';
    if (fs.existsSync(envPath)) {
        original = fs.readFileSync(envPath, 'utf8');
    }

    const lines = original ? original.split(/\r?\n/) : [];
    const envMap = parseEnv(original);

    ensureSection(lines, '# Sovereign Auth Environment (auto-generated templates)');

    const added = [];

    if (upsert(lines, envMap, 'BASE_URL', 'https://sheikha.top')) {
        added.push('BASE_URL');
    }

    if (upsert(lines, envMap, 'MICROSOFT_CLIENT_ID', 'CHANGE_ME_MICROSOFT_CLIENT_ID')) {
        added.push('MICROSOFT_CLIENT_ID');
    }
    if (upsert(lines, envMap, 'MICROSOFT_CLIENT_SECRET', 'CHANGE_ME_MICROSOFT_CLIENT_SECRET')) {
        added.push('MICROSOFT_CLIENT_SECRET');
    }

    if (upsert(lines, envMap, 'APPLE_CLIENT_ID', 'CHANGE_ME_APPLE_CLIENT_ID')) {
        added.push('APPLE_CLIENT_ID');
    }
    if (upsert(lines, envMap, 'APPLE_CLIENT_SECRET', 'CHANGE_ME_APPLE_CLIENT_SECRET')) {
        added.push('APPLE_CLIENT_SECRET');
    }

    if (upsert(lines, envMap, 'NAFATH_CLIENT_ID', 'CHANGE_ME_NAFATH_CLIENT_ID')) {
        added.push('NAFATH_CLIENT_ID');
    }
    if (upsert(lines, envMap, 'NAFATH_CLIENT_SECRET', 'CHANGE_ME_NAFATH_CLIENT_SECRET')) {
        added.push('NAFATH_CLIENT_SECRET');
    }

    if (upsert(lines, envMap, 'APP_BRAND_NAME', 'Sheikha Sovereign Portal')) {
        added.push('APP_BRAND_NAME');
    }
    if (upsert(lines, envMap, 'AUTH_SUPPORT_EMAIL', 'market@sheikha.top')) {
        added.push('AUTH_SUPPORT_EMAIL');
    }
    if (upsert(lines, envMap, 'PRIVACY_POLICY_URL', 'https://sheikha.top/privacy-policy')) {
        added.push('PRIVACY_POLICY_URL');
    }
    if (upsert(lines, envMap, 'TERMS_URL', 'https://sheikha.top/terms')) {
        added.push('TERMS_URL');
    }

    const next = `${lines.join('\n').replace(/\n*$/, '')}\n`;
    fs.writeFileSync(envPath, next);

    console.log('✅ Sovereign auth env setup complete');
    console.log(`📁 File: ${envPath}`);
    console.log(`➕ Added keys: ${added.length}`);
    if (added.length > 0) {
        console.log(`   ${added.join(', ')}`);
    }
}

main();
