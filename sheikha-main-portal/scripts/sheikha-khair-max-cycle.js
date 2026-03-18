#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'sheikha-khair-max-production.json');
const REPORT_PATH = path.join(ROOT, 'data', 'sheikha-khair-max-cycle-report.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function getDayInTimeZone(timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        day: 'numeric'
    });
    return Number(formatter.format(new Date()));
}

function getWeekdayInTimeZone(timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long'
    });
    return String(formatter.format(new Date()));
}

function runScript(scriptName) {
    return spawnSync('npm', ['run', '-s', scriptName], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10
    });
}

function summarize(result) {
    return {
        status: result.status,
        ok: result.status === 0,
        stdout: (result.stdout || '').trim().split('\n').filter(Boolean).slice(-12),
        stderr: (result.stderr || '').trim().split('\n').filter(Boolean).slice(-12)
    };
}

function chooseMode(config) {
    if (process.argv.includes('--force-apply')) {
        return { mode: 'apply', trigger: 'forced-apply' };
    }

    if (process.argv.includes('--force-status')) {
        return { mode: 'status', trigger: 'forced-status' };
    }

    const temporal = (config.renewalPolicy || {}).temporal || {};
    const timeZone = temporal.timezone || 'Asia/Riyadh';
    const reviewDay = Number(temporal.reviewDayOfMonth || 1);
    const monthlyRenewal = Boolean(temporal.monthlyRenewal);
    const weeklyRenewal = Boolean(temporal.weeklyRenewal);
    const weeklyReviewWeekday = String(temporal.weeklyReviewWeekday || 'Friday');

    if (monthlyRenewal) {
        const today = getDayInTimeZone(timeZone);
        if (today === reviewDay) {
            return { mode: 'apply', trigger: 'monthly-renewal' };
        }
    }

    if (weeklyRenewal) {
        const weekday = getWeekdayInTimeZone(timeZone);
        if (weekday.toLowerCase() === weeklyReviewWeekday.toLowerCase()) {
            return { mode: 'apply', trigger: 'weekly-renewal' };
        }
    }

    return { mode: 'status', trigger: 'scheduled-status' };
}

function main() {
    const now = new Date().toISOString();
    const config = readJson(CONFIG_PATH);

    const decision = chooseMode(config);
    const mode = decision.mode;
    const scriptName = mode === 'apply' ? 'ops:khair:max:apply' : 'ops:khair:max:status';

    const result = runScript(scriptName);
    const summary = summarize(result);

    const report = {
        name: 'sheikha-khair-max-cycle',
        generatedAt: now,
        mode,
        trigger: decision.trigger,
        scriptName,
        ok: summary.ok,
        governance: {
            basis: config.governance?.basis,
            principle: config.governance?.principle,
            scope: config.governance?.scope
        },
        result: summary
    };

    writeJson(REPORT_PATH, report);

    console.log(JSON.stringify({
        success: true,
        message: mode === 'apply'
            ? 'تم تنفيذ تجديد khair-max بنجاح'
            : 'تم تنفيذ فحص khair-max الدوري بنجاح',
        data: {
            mode,
            trigger: decision.trigger,
            scriptName,
            reportPath: REPORT_PATH,
            ok: summary.ok
        },
        timestamp: now
    }, null, 4));

    if (!summary.ok) {
        process.exitCode = 1;
    }
}

main();
