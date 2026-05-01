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
    const added = [];

    ensureSection(lines, '# Microsoft Windows Alliance Environment (auto-generated templates)');

    if (upsert(lines, envMap, 'MICROSOFT_TENANT_ID', 'CHANGE_ME_MICROSOFT_TENANT_ID')) {
        added.push('MICROSOFT_TENANT_ID');
    }
    if (
        upsert(
            lines,
            envMap,
            'MICROSOFT_PARTNER_NETWORK_ID',
            'CHANGE_ME_MICROSOFT_PARTNER_NETWORK_ID'
        )
    ) {
        added.push('MICROSOFT_PARTNER_NETWORK_ID');
    }
    if (upsert(lines, envMap, 'WINDOWS_APP_CENTER_APP', 'sheikha/windows-portal')) {
        added.push('WINDOWS_APP_CENTER_APP');
    }
    if (
        upsert(
            lines,
            envMap,
            'MICROSOFT_TEAMS_WEBHOOK_URL',
            'https://outlook.office.com/webhook/CHANGE_ME'
        )
    ) {
        added.push('MICROSOFT_TEAMS_WEBHOOK_URL');
    }
    if (upsert(lines, envMap, 'MICROSOFT_WINDOWS_RELEASE_RING', 'enterprise')) {
        added.push('MICROSOFT_WINDOWS_RELEASE_RING');
    }
    if (upsert(lines, envMap, 'MICROSOFT_PARTNERSHIP_MODE', 'co-innovation')) {
        added.push('MICROSOFT_PARTNERSHIP_MODE');
    }

    const next = `${lines.join('\n').replace(/\n*$/, '')}\n`;
    fs.writeFileSync(envPath, next);

    console.log('✅ Microsoft alliance env setup complete');
    console.log(`📁 File: ${envPath}`);
    console.log(`➕ Added keys: ${added.length}`);
    if (added.length > 0) {
        console.log(`   ${added.join(', ')}`);
    }
}

main();
