#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-khair-max-production.json');
const REPORT_PATH = path.join(ROOT, 'data', 'sheikha-khair-max-production-report.json');
const PACKAGE_PATH = path.join(ROOT, 'package.json');

const APPLY = process.argv.includes('--apply');
const STATUS_ONLY = process.argv.includes('--status');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function hasCommand(command) {
    const result = spawnSync('bash', ['-lc', `command -v ${command}`], {
        cwd: ROOT,
        encoding: 'utf8'
    });
    return result.status === 0;
}

function runNpmScript(scriptName) {
    return spawnSync('npm', ['run', '-s', scriptName], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10
    });
}

function summarizeResult(result) {
    return {
        status: result.status,
        ok: result.status === 0,
        stdout: (result.stdout || '').trim().split('\n').filter(Boolean).slice(-12),
        stderr: (result.stderr || '').trim().split('\n').filter(Boolean).slice(-12)
    };
}

function detectCapabilities() {
    return {
        node: hasCommand('node'),
        npm: hasCommand('npm'),
        pm2: hasCommand('pm2'),
        python3: hasCommand('python3'),
        git: hasCommand('git'),
        docker: hasCommand('docker'),
        nvidiaSmi: hasCommand('nvidia-smi'),
        code: hasCommand('code')
    };
}

function main() {
    const config = readJson(CONFIG_PATH);
    const pkg = readJson(PACKAGE_PATH);
    const scripts = pkg.scripts || {};
    const capabilities = detectCapabilities();
    const now = new Date().toISOString();

    const oneShotPlan = (config.activation.oneShotScripts || []).map((name) => ({
        name,
        exists: Boolean(scripts[name])
    }));

    const backgroundPlan = (config.activation.backgroundPm2Scripts || []).map((name) => ({
        name,
        exists: Boolean(scripts[name]),
        requiresPm2: true,
        runnable: Boolean(scripts[name]) && capabilities.pm2
    }));

    const optionalPlan = (config.activation.optionalScripts || []).map((name) => ({
        name,
        exists: Boolean(scripts[name])
    }));

    const execution = {
        oneShot: [],
        background: [],
        optional: []
    };

    if (APPLY && !STATUS_ONLY) {
        for (const item of oneShotPlan) {
            if (!item.exists) {
                execution.oneShot.push({ name: item.name, ok: false, skipped: true, reason: 'script-not-found' });
                continue;
            }
            const result = runNpmScript(item.name);
            execution.oneShot.push({ name: item.name, ...summarizeResult(result) });
        }

        for (const item of backgroundPlan) {
            if (!item.exists) {
                execution.background.push({ name: item.name, ok: false, skipped: true, reason: 'script-not-found' });
                continue;
            }
            if (!capabilities.pm2) {
                execution.background.push({ name: item.name, ok: false, skipped: true, reason: 'pm2-not-available' });
                continue;
            }
            const result = runNpmScript(item.name);
            execution.background.push({ name: item.name, ...summarizeResult(result) });
        }

        for (const item of optionalPlan) {
            if (!item.exists) {
                execution.optional.push({ name: item.name, ok: false, skipped: true, reason: 'script-not-found' });
                continue;
            }
            const result = runNpmScript(item.name);
            execution.optional.push({ name: item.name, ...summarizeResult(result) });
        }
    }

    const report = {
        name: config.name,
        generatedAt: now,
        owner: config.owner,
        governance: config.governance,
        renewalPolicy: config.renewalPolicy,
        ecosystemTargets: config.ecosystemTargets,
        hardLimits: config.hardLimits,
        capabilities,
        plan: {
            oneShot: oneShotPlan,
            background: backgroundPlan,
            optional: optionalPlan
        },
        execution,
        summary: {
            mode: STATUS_ONLY ? 'status' : (APPLY ? 'apply' : 'plan'),
            ownedScopeOnly: true,
            activatedOneShot: execution.oneShot.filter((item) => item.ok).length,
            activatedBackground: execution.background.filter((item) => item.ok).length,
            optionalCompleted: execution.optional.filter((item) => item.ok).length
        }
    };

    writeJson(REPORT_PATH, report);
    console.log(JSON.stringify({
        success: true,
        message: APPLY ? 'تم تشغيل منظومة شيخة للإنتاج الأقصى ضمن النطاق المملوك أو المفوض' : 'تم إعداد خطة الإنتاج الأقصى الآمن لشيخة',
        data: {
            reportPath: REPORT_PATH,
            mode: report.summary.mode,
            activatedOneShot: report.summary.activatedOneShot,
            activatedBackground: report.summary.activatedBackground,
            optionalCompleted: report.summary.optionalCompleted,
            pm2Available: capabilities.pm2,
            safeguards: config.hardLimits
        },
        timestamp: now
    }, null, 4));
}

main();
