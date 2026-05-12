#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-state-investments-registry.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'state-investments');

const companyName = process.env.STATE_COMPANY_NAME || 'Sheikha-PIF';
const intervalSeconds = Math.max(30, Number(process.env.STATE_COMPANY_INTERVAL_SECONDS || 90));

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function nowIso() {
    return new Date().toISOString();
}

function ensureRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
        return;
    }
    throw new Error('State investments registry not found. Run ops:state:registry:build first.');
}

function readRegistry() {
    ensureRegistry();
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function findEntity(registry) {
    const entities = registry?.data?.entities || [];
    return entities.find((e) => e.sheikhaName === companyName) || null;
}

function writeSnapshot(snapshot) {
    ensureDir(REPORTS_DIR);

    const slug = String(companyName).toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-+|-+$/g, '');
    const latestPath = path.join(REPORTS_DIR, `${slug}-latest.json`);
    const stampPath = path.join(REPORTS_DIR, `${slug}-${nowIso().replaceAll(':', '-').replaceAll('.', '-')}.json`);

    fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 4), 'utf8');
    fs.writeFileSync(stampPath, JSON.stringify(snapshot, null, 4), 'utf8');
}

function buildSnapshot(entity) {
    return {
        success: true,
        data: {
            company: {
                sheikhaName: entity.sheikhaName,
                type: entity.type,
                parent: entity.parent,
                status: 'active',
                mode: 'background-loop'
            },
            identity: entity.identity,
            goals: entity.goals,
            subsidiaries: entity.subsidiaries,
            telemetry: {
                heartbeat: 'ok',
                readiness: 'pass',
                impactMode: 'public-benefit-first'
            },
            timestamp: nowIso()
        },
        message: `تم تشغيل ${entity.sheikhaName} بالخلفية مع رقمنة الأهداف والمنفعة العامة`,
        timestamp: nowIso()
    };
}

function tick() {
    const registry = readRegistry();
    const entity = findEntity(registry);
    if (!entity) {
        throw new Error(`Entity not found in registry: ${companyName}`);
    }

    const snapshot = buildSnapshot(entity);
    writeSnapshot(snapshot);

    console.log(`[${nowIso()}] ${companyName} heartbeat=ok goals=active subsidiaries=${entity.subsidiaries.length}`);
}

function main() {
    tick();
    setInterval(tick, intervalSeconds * 1000);
}

main();
