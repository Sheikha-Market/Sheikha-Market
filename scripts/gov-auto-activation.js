#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');
const CATALOG_PATH = path.join(ROOT, 'config', 'gov-services-catalog.json');
const OUT_PATH = path.join(ROOT, 'data', 'gov-services-state.json');
const AUTOFIX = process.env.SHEIKHA_AUTOFIX === '1';

function parseEnv(text) {
    const out = {};
    for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i <= 0) continue;
        out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
    return out;
}

function ensureEnvVar(fileText, key, value) {
    const rx = new RegExp(`^${key}=.*$`, 'm');
    if (rx.test(fileText)) return fileText.replace(rx, `${key}=${value}`);
    const suffix = fileText.endsWith('\n') || fileText.length === 0 ? '' : '\n';
    return `${fileText}${suffix}${key}=${value}\n`;
}

function envTruthy(v) {
    const s = String(v || '').trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

function safeReadJson(p) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function evaluateService(svc, env) {
    const missing = [];
    for (const key of svc.requiredEnv || []) {
        if (!env[key] || String(env[key]).trim() === '') {
            missing.push(key);
        }
    }

    const approvedKey = `${svc.id}_APPROVED`;
    const enabledKey = `${svc.id}_ENABLED`;
    const isApproved = svc.requiresApproval ? envTruthy(env[approvedKey]) : true;
    const hasCredentials = missing.length === 0;

    let status = 'pending_credentials';
    if (hasCredentials && !isApproved) status = 'pending_approval';
    if (hasCredentials && isApproved) status = 'active';

    return {
        id: svc.id,
        name: svc.name,
        priority: svc.priority || 'P2',
        requiresApproval: !!svc.requiresApproval,
        enabledKey,
        approvedKey,
        configured: hasCredentials,
        approved: isApproved,
        status,
        missingEnv: missing
    };
}

function main() {
    if (!fs.existsSync(CATALOG_PATH)) {
        console.error('CRITICAL: config/gov-services-catalog.json not found');
        process.exit(1);
    }

    let envText = '';
    if (fs.existsSync(ENV_PATH)) envText = fs.readFileSync(ENV_PATH, 'utf8');
    const env = parseEnv(envText);
    const catalog = safeReadJson(CATALOG_PATH);
    const services = Array.isArray(catalog.services) ? catalog.services : [];

    const results = services.map(svc => evaluateService(svc, env));

    let active = 0;
    let pendingCreds = 0;
    let pendingApproval = 0;
    let updatedEnvText = envText;

    for (const r of results) {
        if (r.status === 'active') active++;
        if (r.status === 'pending_credentials') pendingCreds++;
        if (r.status === 'pending_approval') pendingApproval++;

        if (AUTOFIX) {
            // تفعيل تلقائي للخدمات الجاهزة فقط
            updatedEnvText = ensureEnvVar(updatedEnvText, r.enabledKey, r.status === 'active' ? 'true' : 'false');
        }
    }

    if (AUTOFIX) {
        fs.writeFileSync(ENV_PATH, updatedEnvText, 'utf8');
    }

    const state = {
        success: true,
        timestamp: new Date().toISOString(),
        mode: AUTOFIX ? 'AUTOFIX' : 'READONLY',
        summary: {
            total: results.length,
            active,
            pendingCredentials: pendingCreds,
            pendingApproval
        },
        services: results
    };

    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(state, null, 2), 'utf8');

    console.log('════════════════════════════════════════════════════');
    console.log('⚙️  Auto Activation — Government Services');
    console.log('════════════════════════════════════════════════════');
    console.log(`Mode: ${state.mode}`);
    console.log(`Total: ${state.summary.total}`);
    console.log(`Active: ${state.summary.active}`);
    console.log(`Pending Credentials: ${state.summary.pendingCredentials}`);
    console.log(`Pending Approval: ${state.summary.pendingApproval}`);
    console.log(`State file: ${path.relative(ROOT, OUT_PATH)}`);

    // غير فاشل: الهدف تشغيل آلي تدريجي وليس منع التشغيل
    process.exit(0);
}

main();
