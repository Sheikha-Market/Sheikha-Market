#!/usr/bin/env node
 

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT_DIR = path.join(__dirname, '..');
const STATUS_PATH = path.join(ROOT_DIR, 'global-pulse-status.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'global-pulse-guard.log');
const STATE_FILE = path.join(LOG_DIR, 'global-pulse-guard-state.json');
const FIX_SCRIPT = path.join(ROOT_DIR, 'fix-sovereign-pulse.js');
const DEFAULT_INTERVAL_SEC = Number(process.env.SHEIKHA_GLOBAL_PULSE_GUARD_INTERVAL || 3600);
const DEFAULT_MAX_AGE_HOURS = Number(process.env.SHEIKHA_GLOBAL_PULSE_MAX_AGE_HOURS || 48);

const ALERTS = {
    webhookUrl: process.env.ALERT_WEBHOOK_URL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
};

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function ts() {
    return new Date().toISOString();
}

function log(message) {
    ensureDir(LOG_DIR);
    console.log(message);
    fs.appendFileSync(LOG_FILE, `[${ts()}] ${message}\n`, 'utf8');
}

function parseArgs() {
    const opts = {
        loop: false,
        dryRun: false,
        intervalSec: DEFAULT_INTERVAL_SEC,
        maxAgeHours: DEFAULT_MAX_AGE_HOURS
    };

    for (const arg of process.argv.slice(2)) {
        if (arg === '--loop') opts.loop = true;
        else if (arg === '--dry-run') opts.dryRun = true;
        else if (arg.startsWith('--interval=')) {
            const value = Number(arg.split('=')[1]);
            if (Number.isFinite(value) && value >= 60) opts.intervalSec = value;
        } else if (arg.startsWith('--max-age-hours=')) {
            const value = Number(arg.split('=')[1]);
            if (Number.isFinite(value) && value >= 1) opts.maxAgeHours = value;
        }
    }

    return opts;
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

function readState() {
    return readJson(STATE_FILE) || { lastStatus: 'ok', lastIssue: '', lastAlertAt: 0 };
}

function writeState(state) {
    ensureDir(LOG_DIR);
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function looksHealthy(status, maxAgeHours) {
    const issues = [];

    if (!status || typeof status !== 'object') {
        issues.push('status-missing');
        return issues;
    }

    if (!Number.isFinite(Number(status.overall))) issues.push('overall-invalid');
    if (!Number.isFinite(Number(status.stability))) issues.push('stability-invalid');
    if (!Number.isFinite(Number(status.devotion))) issues.push('devotion-invalid');
    if (!status.identity) issues.push('identity-missing');
    if (!status.connection) issues.push('connection-missing');
    if (!status.governance?.basis || status.governance.basis !== 'الكتاب والسنة') issues.push('governance-missing');
    if (!status.governance?.owner) issues.push('owner-missing');
    if (!status.integrity?.seal) issues.push('integrity-seal-missing');

    const lastUpdate = Date.parse(status.lastUpdate || 0);
    if (!lastUpdate) {
        issues.push('last-update-missing');
    } else {
        const ageMs = Date.now() - lastUpdate;
        if (ageMs > maxAgeHours * 60 * 60 * 1000) {
            issues.push('status-stale');
        }
    }

    return issues;
}

async function notifyAlerts(message, dryRun) {
    const text = `[Sheikha Global Pulse Guard] ${message}`;
    if (dryRun) {
        log(`[DRY-RUN] ${text}`);
        return;
    }

    async function post(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`${response.status} ${body.slice(0, 120)}`);
        }
    }

    try {
        if (ALERTS.webhookUrl) {
            await post(ALERTS.webhookUrl, { text, source: 'global-pulse-guard' });
        }
        if (ALERTS.telegramBotToken && ALERTS.telegramChatId) {
            await post(`https://api.telegram.org/bot${ALERTS.telegramBotToken}/sendMessage`, {
                chat_id: ALERTS.telegramChatId,
                text
            });
        }
    } catch (error) {
        log(`WARN: alert send failed ${error.message}`);
    }
}

function runRepair() {
    execFileSync(process.execPath, [FIX_SCRIPT], { cwd: ROOT_DIR, stdio: 'inherit' });
}

async function runCycle(opts) {
    const state = readState();
    const before = readJson(STATUS_PATH);
    const issues = looksHealthy(before, opts.maxAgeHours);

    if (issues.length === 0) {
        log('OK: global pulse healthy');
        if (state.lastStatus === 'fail') {
            await notifyAlerts('RECOVERY: global pulse healthy again', opts.dryRun);
        }
        writeState({ lastStatus: 'ok', lastIssue: '', lastAlertAt: state.lastAlertAt });
        return true;
    }

    log(`WARN: global pulse invalid -> ${issues.join(', ')}`);
    try {
        if (!opts.dryRun) {
            runRepair();
        }
    } catch (error) {
        log(`ERROR: repair command failed ${error.message}`);
    }

    const after = readJson(STATUS_PATH);
    const remaining = looksHealthy(after, opts.maxAgeHours);
    if (remaining.length === 0) {
        log('OK: global pulse repaired successfully');
        await notifyAlerts(`REPAIRED: global pulse fixed after issues ${issues.join(', ')}`, opts.dryRun);
        writeState({ lastStatus: 'ok', lastIssue: '', lastAlertAt: Date.now() });
        return true;
    }

    const issueFingerprint = remaining.join(',');
    const shouldAlert = issueFingerprint !== state.lastIssue || Date.now() - Number(state.lastAlertAt || 0) > 1800000;
    if (shouldAlert) {
        await notifyAlerts(`FAIL: global pulse still unhealthy -> ${issueFingerprint}`, opts.dryRun);
    }
    writeState({ lastStatus: 'fail', lastIssue: issueFingerprint, lastAlertAt: shouldAlert ? Date.now() : state.lastAlertAt });
    return false;
}

async function main() {
    const opts = parseArgs();
    log(`START: global-pulse-guard loop=${opts.loop} interval=${opts.intervalSec}s maxAgeHours=${opts.maxAgeHours} dryRun=${opts.dryRun}`);

    const ok = await runCycle(opts);
    if (!opts.loop) {
        process.exit(ok ? 0 : 1);
    }

    setInterval(() => {
        runCycle(opts).catch(error => log(`ERROR: cycle failed ${error.message}`));
    }, opts.intervalSec * 1000);
}

main().catch(error => {
    log(`FATAL: ${error.message}`);
    process.exit(1);
});
