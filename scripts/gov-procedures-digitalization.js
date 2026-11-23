#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');
const STATE_PATH = path.join(ROOT, 'data', 'gov-services-state.json');
const WORKFLOW_PATH = path.join(ROOT, 'config', 'gov-procedures-workflow.json');
const OUT_PATH = path.join(ROOT, 'data', 'gov-procedures-state.json');
const AUTOFIX = process.env.SHEIKHA_AUTOFIX === '1';

function readJson(p) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

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

function stageStatus(stage, facts) {
    const req = stage.requiredFlags || [];
    const ok = req.every(f => !!facts[f]);
    if (ok) return 'done';
    if (req.some(f => !!facts[f])) return 'in_progress';
    return 'pending';
}

function inferNextAction(service, stageRows) {
    const next = stageRows.find(s => s.status !== 'done');
    if (!next) return 'monitor_production';

    if (next.id === 'legal_intake') return `set ${service.approvedKey}=true بعد الموافقة الرسمية`;
    if (next.id === 'technical_setup') return `املأ المتغيرات الناقصة: ${service.missingEnv.join(', ')}`;
    if (next.id === 'sandbox_validation') return `اختبر endpoint للسيرفس ${service.id} في sandbox`;
    if (next.id === 'go_live') return `فعّل ${service.enabledKey}=true بعد اجتياز الاختبارات`;
    return 'راقب الامتثال والتنبيهات';
}

function main() {
    if (!fs.existsSync(STATE_PATH)) {
        console.error('CRITICAL: data/gov-services-state.json not found. Run: npm run ops:gov:auto');
        process.exit(1);
    }
    if (!fs.existsSync(WORKFLOW_PATH)) {
        console.error('CRITICAL: config/gov-procedures-workflow.json not found.');
        process.exit(1);
    }

    const state = readJson(STATE_PATH);
    const workflow = readJson(WORKFLOW_PATH);
    const services = Array.isArray(state.services) ? state.services : [];
    const stages = Array.isArray(workflow.stages) ? workflow.stages : [];

    let envText = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
    const env = parseEnv(envText);

    const rows = services.map(svc => {
        const facts = {
            approval: !!svc.approved,
            credentials: !!svc.configured
        };
        const stageRows = stages.map(st => ({
            id: st.id,
            name: st.name,
            status: stageStatus(st, facts),
            description: st.description
        }));

        const done = stageRows.filter(s => s.status === 'done').length;
        const progress = stages.length > 0 ? Math.round((done / stages.length) * 100) : 0;
        const nextAction = inferNextAction(svc, stageRows);
        const procedureKey = `${svc.id}_PROCEDURE_PROGRESS`;

        if (AUTOFIX) {
            envText = ensureEnvVar(envText, procedureKey, String(progress));
        }

        return {
            id: svc.id,
            name: svc.name,
            priority: svc.priority,
            currentStatus: svc.status,
            procedureProgress: progress,
            procedureKey,
            nextAction,
            stages: stageRows
        };
    });

    if (AUTOFIX) fs.writeFileSync(ENV_PATH, envText, 'utf8');

    const p0 = rows.filter(r => r.priority === 'P0');
    const out = {
        success: true,
        timestamp: new Date().toISOString(),
        mode: AUTOFIX ? 'AUTOFIX' : 'READONLY',
        workflow: workflow.workflowName,
        summary: {
            total: rows.length,
            avgProgress: rows.length ? Math.round(rows.reduce((a, b) => a + b.procedureProgress, 0) / rows.length) : 0,
            p0AverageProgress: p0.length ? Math.round(p0.reduce((a, b) => a + b.procedureProgress, 0) / p0.length) : 0
        },
        services: rows
    };

    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

    console.log('════════════════════════════════════════════════════');
    console.log('🧾 Digital Procedures — Government Services');
    console.log('════════════════════════════════════════════════════');
    console.log(`Mode: ${out.mode}`);
    console.log(`Total services: ${out.summary.total}`);
    console.log(`Average procedure progress: ${out.summary.avgProgress}%`);
    console.log(`P0 average progress: ${out.summary.p0AverageProgress}%`);
    console.log(`Output: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
