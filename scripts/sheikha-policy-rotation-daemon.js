#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');

const argv = new Set(process.argv.slice(2));
const once = argv.has('--once');
const intervalSec = Number(process.env.SHEIKHA_POLICY_ROTATION_INTERVAL_SEC || 86400);
const autoApply = String(process.env.SHEIKHA_POLICY_ROTATION_AUTO_APPLY || 'false').toLowerCase() === 'true';

function run(commandArgs) {
    return spawnSync(process.execPath, commandArgs, {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
    });
}

function runCycle() {
    const audit = run(['scripts/sheikha-policy-rotation-cycle.js']);
    if (audit.status === 3 && autoApply) {
        console.log('[POLICY-ROTATION-DAEMON] Rotation is due. Applying automatically.');
        const apply = run(['scripts/sheikha-policy-rotation-cycle.js', '--apply']);
        if (apply.status !== 0) {
            console.error('[POLICY-ROTATION-DAEMON] Auto-apply failed.');
        }
    }
}

runCycle();
if (once) {
    process.exit(0);
}

const timer = setInterval(runCycle, intervalSec * 1000);
if (typeof timer.unref === 'function') {
    timer.unref();
}
