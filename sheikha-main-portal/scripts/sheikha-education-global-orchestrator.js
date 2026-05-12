#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-education-entities-registry.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'education');

const intervalSeconds = Math.max(30, Number(process.env.GLOBAL_EDU_INTERVAL_SECONDS || 120));

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function ensureRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
        return;
    }

    const result = spawnSync('node', ['scripts/sheikha-education-registry-build.js'], {
        cwd: ROOT_DIR,
        stdio: 'inherit'
    });

    if (result.status !== 0) {
        throw new Error('Failed to generate education registry.');
    }
}

function readRegistry() {
    ensureRegistry();
    const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(raw);
}

function nowIso() {
    return new Date().toISOString();
}

function buildSummary(registry) {
    const entities = registry?.data?.entities || [];
    const byType = entities.reduce((acc, entity) => {
        const key = entity.type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    return {
        totalEntities: entities.length,
        top10: registry?.data?.counts?.top10 || 0,
        top100: registry?.data?.counts?.top100 || 0,
        top1000: registry?.data?.counts?.top1000 || 0,
        categories: byType
    };
}

function buildSnapshot(registry) {
    const summary = buildSummary(registry);

    return {
        success: true,
        data: {
            orchestrator: {
                name: 'Sheikha-Global-Education-Orchestrator',
                mode: 'single-background-service',
                intervalSeconds,
                status: 'online'
            },
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'رقمنة المنظومة التعليمية العالمية بالإحسان والإتقان، بلا ضرر ولا اعتداء.',
                principles: [
                    'إنما الأعمال بالنيات',
                    'إن الله يأمر بالعدل والإحسان',
                    'لا ضرر ولا ضرار'
                ]
            },
            globalDigitalization: {
                scope: 'world-and-beyond',
                activatedBatch: 'all-in-one',
                summary
            },
            timestamp: nowIso()
        },
        message: 'تم تشغيل الرقمنة التعليمية العالمية دفعة واحدة عبر خدمة شيخة الموحّدة',
        timestamp: nowIso()
    };
}

function writeSnapshot(snapshot) {
    ensureDir(REPORTS_DIR);

    const latestPath = path.join(REPORTS_DIR, 'sheikha-global-education-latest.json');
    const stampPath = path.join(REPORTS_DIR, `sheikha-global-education-${nowIso().replaceAll(':', '-').replaceAll('.', '-')}.json`);

    fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 4), 'utf8');
    fs.writeFileSync(stampPath, JSON.stringify(snapshot, null, 4), 'utf8');
}

function tick() {
    const registry = readRegistry();
    const snapshot = buildSnapshot(registry);
    writeSnapshot(snapshot);

    const total = snapshot.data.globalDigitalization.summary.totalEntities;
    console.log(`[${nowIso()}] Sheikha-Global-Education-Orchestrator online entities=${total} mode=all-in-one`);
}

function main() {
    tick();
    setInterval(tick, intervalSeconds * 1000);
}

main();
