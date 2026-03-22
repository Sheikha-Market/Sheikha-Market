#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const LOOP_SCRIPT = path.join(ROOT_DIR, 'scripts', 'sheikha-academic-connectors-loop.js');

function parseArgs(argv) {
    const result = {};
    argv.forEach((arg) => {
        if (!arg.startsWith('--')) {
            return;
        }
        const [key, value] = arg.slice(2).split('=');
        result[key] = value === undefined ? true : value;
    });
    return result;
}

function slugify(value) {
    return String(value || '')
        .trim()
    .replaceAll(/[^a-zA-Z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/-{2,}/g, '-');
}

function runPm2(args, extraEnv, allowFailure = false) {
    const result = spawnSync('pm2', args, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env, ...extraEnv }
    });

    if (result.status !== 0 && !allowFailure) {
        process.exit(result.status || 1);
    }
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const action = args.action || 'start';
    const entityName = args.name || 'Generic-Education-Entity';
    const entityType = args.type || 'education-place';
    const displayName = args.displayName || entityName;
    const processName = `Sheikha-${slugify(entityName)}`;
    const interval = String(args.interval || 60);
    const maxUniversities = String(args.maxUniversities || 1000);

    if (action === 'start') {
        runPm2(['delete', processName], {}, true);
        runPm2(
            ['start', LOOP_SCRIPT, '--name', processName],
            {
                NODE_ENV: 'production',
                CONNECTOR_NAME: processName,
                CONNECTOR_DISPLAY_NAME: displayName,
                CONNECTOR_TYPE: entityType,
                CONNECTOR_CODE: args.code || 'ACD-GEN',
                CONNECTOR_INTERVAL_SECONDS: interval,
                ACADEMIC_MAX_UNIVERSITIES: maxUniversities
            }
        );
        runPm2(['save'], {});
        return;
    }

    if (action === 'stop') {
        runPm2(['delete', processName], {}, true);
        runPm2(['save'], {});
        return;
    }

    if (action === 'status') {
        runPm2(['describe', processName], {});
        return;
    }

    if (action === 'logs') {
        runPm2(['logs', processName, '--lines', String(args.lines || 120), '--nostream'], {});
        return;
    }

    console.error(`Unsupported action: ${action}`);
    process.exit(1);
}

main();