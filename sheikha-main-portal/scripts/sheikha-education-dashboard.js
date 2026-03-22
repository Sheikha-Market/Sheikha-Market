#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'servers', 'academy-connectors');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-education-entities-registry.json');

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

function listLatestReports() {
    if (!fs.existsSync(REPORTS_DIR)) {
        return [];
    }
    return fs.readdirSync(REPORTS_DIR)
        .filter((f) => f.endsWith('-latest.json'))
        .sort();
}

function main() {
    const pm2 = readPm2();
    const sheikhaEducationApps = pm2.filter((p) => String(p.name || '').startsWith('Sheikha-'));
    const registry = readRegistry();
    const latestReports = listLatestReports();

    console.log('============================================================');
    console.log('SHEIKHA EDUCATION DASHBOARD');
    console.log('============================================================');
    console.log(`Active Sheikha apps     : ${sheikhaEducationApps.length}`);
    console.log(`Latest education reports: ${latestReports.length}`);
    if (registry?.data?.counts) {
        console.log(`Registry entities       : ${registry.data.counts.total}`);
        console.log(`Top10 / Top100 / Top1000: ${registry.data.counts.top10} / ${registry.data.counts.top100} / ${registry.data.counts.top1000}`);
    } else {
        console.log('Registry entities       : not generated yet');
    }
    console.log('------------------------------------------------------------');

    sheikhaEducationApps.slice(0, 20).forEach((app) => {
        const status = app.pm2_env?.status || 'unknown';
        const uptime = app.pm2_env?.pm_uptime ? `${Math.round((Date.now() - app.pm2_env.pm_uptime) / 1000)}s` : 'n/a';
        console.log(`${app.name} | ${status} | uptime=${uptime}`);
    });

    if (sheikhaEducationApps.length > 20) {
        console.log(`... +${sheikhaEducationApps.length - 20} more apps`);
    }

    console.log('============================================================');
}

main();
