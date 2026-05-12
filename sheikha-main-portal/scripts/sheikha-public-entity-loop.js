#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-public-sector-registry.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'public-sector');

const entityName = process.env.PUBLIC_ENTITY_NAME || 'Sheikha-Royal-Court';
const intervalSeconds = Math.max(30, Number(process.env.PUBLIC_ENTITY_INTERVAL_SECONDS || 120));

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function nowIso() {
    return new Date().toISOString();
}

function readRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        throw new Error('Public sector registry not found. Run ops:public:registry:build first.');
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function findEntity(registry) {
    const entities = registry?.data?.entities || [];
    return entities.find((entity) => entity.sheikhaName === entityName) || null;
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '');
}

function writeSnapshot(snapshot) {
    ensureDir(REPORTS_DIR);
    const slug = slugify(entityName);
    const latestPath = path.join(REPORTS_DIR, `${slug}-latest.json`);
    const stampPath = path.join(REPORTS_DIR, `${slug}-${nowIso().replaceAll(':', '-').replaceAll('.', '-')}.json`);

    fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 4), 'utf8');
    fs.writeFileSync(stampPath, JSON.stringify(snapshot, null, 4), 'utf8');
}

function buildSnapshot(entity) {
    return {
        success: true,
        data: {
            entity: {
                sheikhaName: entity.sheikhaName,
                sourceNameArabic: entity.sourceNameArabic,
                category: entity.category,
                subtype: entity.subtype,
                ownerClass: entity.ownerClass,
                parent: entity.parent,
                status: 'active',
                mode: 'background-loop'
            },
            delegationPath: entity.delegationPath,
            identity: entity.identity,
            goals: entity.goals,
            governance: entity.governance,
            telemetry: {
                heartbeat: 'ok',
                readiness: 'pass',
                publicBenefitMode: 'enabled'
            },
            timestamp: nowIso()
        },
        message: `تم تشغيل ${entity.sheikhaName} بالخلفية وفق مسار التفويض النظامي والمنفعة العامة`,
        timestamp: nowIso()
    };
}

function tick() {
    const registry = readRegistry();
    const entity = findEntity(registry);

    if (!entity) {
        throw new Error(`Entity not found in registry: ${entityName}`);
    }

    const snapshot = buildSnapshot(entity);
    writeSnapshot(snapshot);

    console.log(`[${nowIso()}] ${entityName} heartbeat=ok category=${entity.category} owner=${entity.ownerClass}`);
}

function main() {
    tick();
    setInterval(tick, intervalSeconds * 1000);
}

main();
