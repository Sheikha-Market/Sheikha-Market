#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-public-sector-registry.json');
const REGISTRY_BUILDER = path.join(ROOT_DIR, 'scripts', 'sheikha-public-sector-registry-build.js');
const LOOP_SCRIPT = path.join(ROOT_DIR, 'scripts', 'sheikha-public-entity-loop.js');

function parseArgs(argv) {
    const out = {};
    argv.forEach((arg) => {
        if (!arg.startsWith('--')) {
            return;
        }
        const [key, value] = arg.slice(2).split('=');
        out[key] = value === undefined ? true : value;
    });
    return out;
}

function run(command, args, extraEnv, allowFailure = false) {
    const result = spawnSync(command, args, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env, ...extraEnv }
    });

    if (result.status !== 0 && !allowFailure) {
        process.exit(result.status || 1);
    }
}

function ensureRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
        return;
    }
    run('node', [REGISTRY_BUILDER], {});
}

function readRegistry() {
    ensureRegistry();
    const payload = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    return payload?.data?.entities || [];
}

function startEntity(name, intervalSeconds) {
    run('pm2', ['delete', name], {}, true);
    run(
        'pm2',
        ['start', LOOP_SCRIPT, '--name', name],
        {
            NODE_ENV: 'production',
            PUBLIC_ENTITY_NAME: name,
            PUBLIC_ENTITY_INTERVAL_SECONDS: String(intervalSeconds)
        }
    );
}

function actionAll(action, entities, lines, intervalSeconds) {
    if (action === 'start-all') {
        entities.forEach((entity) => startEntity(entity.sheikhaName, intervalSeconds));
        run('pm2', ['save'], {});
        return;
    }

    if (action === 'stop-all') {
        entities.forEach((entity) => run('pm2', ['delete', entity.sheikhaName], {}, true));
        run('pm2', ['save'], {});
        return;
    }

    if (action === 'status-all') {
        entities.forEach((entity) => run('pm2', ['describe', entity.sheikhaName], {}, true));
        return;
    }

    if (action === 'logs-all') {
        const names = entities.map((entity) => entity.sheikhaName);
        if (names.length === 0) {
            return;
        }
        run('pm2', ['logs', ...names, '--lines', String(lines), '--nostream'], {}, true);
        return;
    }

    console.error(`Unsupported all-action: ${action}`);
    process.exit(1);
}

function actionSingle(action, name, lines, intervalSeconds) {
    if (action === 'start') {
        startEntity(name, intervalSeconds);
        run('pm2', ['save'], {});
        return;
    }

    if (action === 'stop') {
        run('pm2', ['delete', name], {}, true);
        run('pm2', ['save'], {});
        return;
    }

    if (action === 'status') {
        run('pm2', ['describe', name], {}, true);
        return;
    }

    if (action === 'logs') {
        run('pm2', ['logs', name, '--lines', String(lines), '--nostream'], {}, true);
        return;
    }

    console.error(`Unsupported action: ${action}`);
    process.exit(1);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const action = String(args.action || 'start-all');
    const name = String(args.name || 'Sheikha-Royal-Court');
    const lines = Math.max(20, Number(args.lines || 120));
    const intervalSeconds = Math.max(30, Number(args.interval || 120));

    const allActions = new Set(['start-all', 'stop-all', 'status-all', 'logs-all']);
    if (allActions.has(action)) {
        const entities = readRegistry();
        actionAll(action, entities, lines, intervalSeconds);
        return;
    }

    actionSingle(action, name, lines, intervalSeconds);
}

main();
