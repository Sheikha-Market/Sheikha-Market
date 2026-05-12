#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-public-sector-registry.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'public-sector');

function readRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function readPm2() {
    try {
        const raw = execSync('pm2 jlist', { cwd: ROOT_DIR, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function reportsCount() {
    if (!fs.existsSync(REPORTS_DIR)) {
        return 0;
    }
    return fs.readdirSync(REPORTS_DIR).filter((name) => name.endsWith('.json')).length;
}

function main() {
    const registry = readRegistry();
    const entities = registry?.data?.entities || [];
    const namesSet = new Set(entities.map((entity) => entity.sheikhaName));
    const pm2 = readPm2();

    const online = pm2.filter((proc) => namesSet.has(proc.name));

    console.log('============================================================');
    console.log('SHEIKHA PUBLIC SECTOR DASHBOARD');
    console.log('============================================================');
    console.log(`Public entities online   : ${online.length}`);
    console.log(`Public reports count     : ${reportsCount()}`);

    if (registry?.data?.counts) {
        console.log(`Registry entities        : ${registry.data.counts.total}`);
        Object.entries(registry.data.counts.byCategory || {}).forEach(([category, count]) => {
            console.log(`Category ${category.padEnd(15)}: ${count}`);
        });
    } else {
        console.log('Registry entities        : not generated');
    }

    console.log('------------------------------------------------------------');
    online.slice(0, 25).forEach((proc) => {
        const status = proc.pm2_env?.status || 'unknown';
        console.log(`${proc.name} | ${status}`);
    });

    if (online.length > 25) {
        console.log(`... +${online.length - 25} more entities`);
    }

    console.log('============================================================');
}

main();
