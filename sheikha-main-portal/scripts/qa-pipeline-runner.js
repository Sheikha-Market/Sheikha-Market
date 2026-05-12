#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'reports', 'qa');

const steps = [
    { key: 'unit', cmd: 'npm run -s qa:unit', softFail: false },
    { key: 'ui', cmd: 'npm run -s qa:ui', softFail: false },
    { key: 'load', cmd: 'npm run -s qa:load', softFail: false },
    { key: 'lint', cmd: 'npm run -s qa:lint', softFail: false },
    { key: 'security', cmd: 'npm run -s qa:security', softFail: true }
];

function run(cmd) {
    return spawnSync(cmd, {
        cwd: root,
        shell: true,
        encoding: 'utf8',
        timeout: 10 * 60 * 1000
    });
}

function ensure(dirPath) {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

const report = {
    startedAt: new Date().toISOString(),
    steps: []
};

let failed = false;
for (const step of steps) {
    const r = run(step.cmd);
    const ok = r.status === 0;
    report.steps.push({
        key: step.key,
        command: step.cmd,
        ok,
        exitCode: r.status,
        softFail: step.softFail,
        stdout: (r.stdout || '').slice(-6000),
        stderr: (r.stderr || '').slice(-6000)
    });

    if (!ok && !step.softFail) {
        failed = true;
        break;
    }
}

report.finishedAt = new Date().toISOString();
report.success = !failed;

ensure(outDir);
const file = path.join(outDir, 'latest-qa-report.json');
fs.writeFileSync(file, JSON.stringify(report, null, 4));

console.log(JSON.stringify({
    success: report.success,
    reportFile: file,
    startedAt: report.startedAt,
    finishedAt: report.finishedAt
}, null, 4));

process.exit(report.success ? 0 : 1);
