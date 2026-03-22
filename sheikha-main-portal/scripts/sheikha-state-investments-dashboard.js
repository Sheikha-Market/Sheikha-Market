#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-state-investments-registry.json');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'state-investments');

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
    return fs.readdirSync(REPORTS_DIR).filter((n) => n.endsWith('.json')).length;
}

function main() {
    const registry = readRegistry();
    const pm2 = readPm2();

    const stateApps = pm2.filter((p) => String(p.name || '').startsWith('Sheikha-') && ['Sheikha-PIF', 'Sheikha-Aramco', 'Sheikha-Sabic', 'Sheikha-CNTXT', 'Sheikha-Humain'].includes(p.name));

    console.log('============================================================');
    console.log('SHEIKHA STATE INVESTMENTS DASHBOARD');
    console.log('============================================================');
    console.log(`State apps online        : ${stateApps.length}`);
    console.log(`State reports count      : ${reportsCount()}`);
    if (registry?.data?.counts) {
        console.log(`Registry entities        : ${registry.data.counts.entities}`);
        console.log(`Subsidiaries registered  : ${registry.data.counts.subsidiariesTotal}`);
    } else {
        console.log('Registry entities        : not generated');
    }
    console.log('------------------------------------------------------------');
    stateApps.forEach((app) => {
        const status = app.pm2_env?.status || 'unknown';
        console.log(`${app.name} | ${status}`);
    });
    console.log('============================================================');
}

main();
