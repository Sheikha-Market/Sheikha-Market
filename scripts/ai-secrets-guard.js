#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'ai-secrets-guard.log');
const STATE_FILE = path.join(LOG_DIR, 'ai-secrets-guard-state.json');

const DEFAULTS = {
    intervalSec: Number(process.env.SHEIKHA_AI_GUARD_INTERVAL || 86400),
    timeoutMs: Number(process.env.SHEIKHA_AI_GUARD_TIMEOUT_MS || 10000),
    alertCooldownSec: Number(process.env.SHEIKHA_AI_GUARD_ALERT_COOLDOWN_SEC || 1800),
    alertRetryMax: Number(process.env.SHEIKHA_AI_GUARD_ALERT_RETRY_MAX || 3),
    loop: false,
    live: true,
    dryRun: false
};

const ALERTS = {
    webhookUrl: process.env.ALERT_WEBHOOK_URL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
};

function parseArgs() {
    const args = process.argv.slice(2);
    const opts = { ...DEFAULTS };

    for (const arg of args) {
        if (arg === '--loop') opts.loop = true;
        else if (arg === '--dry-run') opts.dryRun = true;
        else if (arg === '--no-live') opts.live = false;
        else if (arg.startsWith('--interval=')) {
            const v = Number(arg.split('=')[1]);
            if (Number.isFinite(v) && v >= 60) opts.intervalSec = v;
        }
    }

    return opts;
}

function ts() {
    return new Date().toISOString();
}

function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function appendLog(message) {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, `[${ts()}] ${message}\n`, 'utf8');
}

function readState() {
    try {
        if (!fs.existsSync(STATE_FILE)) {
            return {
                lastAlertAt: 0,
                lastIssueFingerprint: '',
                consecutiveFails: 0,
                lastStatus: 'ok'
            };
        }

        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return {
            lastAlertAt: Number(parsed.lastAlertAt || 0),
            lastIssueFingerprint: String(parsed.lastIssueFingerprint || ''),
            consecutiveFails: Number(parsed.consecutiveFails || 0),
            lastStatus: String(parsed.lastStatus || 'ok')
        };
    } catch {
        return {
            lastAlertAt: 0,
            lastIssueFingerprint: '',
            consecutiveFails: 0,
            lastStatus: 'ok'
        };
    }
}

function writeState(state) {
    ensureLogDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function log(message) {
    console.log(message);
    appendLog(message);
}

function redactKey(value) {
    if (!value) return 'empty';
    if (value.length <= 10) return '***';
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function isPlaceholder(value) {
    const v = String(value || '').trim().toLowerCase();
    return (
        !v ||
        v.includes('your-key') ||
        v.includes('example') ||
        v.includes('placeholder') ||
        v === 'changeme'
    );
}

function looksLikeUrl(value) {
    if (!value) return false;
    try {
        const u = new URL(String(value));
        return u.protocol === 'https:';
    } catch {
        return false;
    }
}

async function notifyAlerts(message, dryRun = false) {
    const text = `[Sheikha AI Guard] ${message}`;

    if (dryRun) {
        log(`[DRY-RUN] notify ${text}`);
        return;
    }

    async function postWithRetry(url, payload, retryMax, channel) {
        let attempt = 0;
        let waitMs = 1000;
        while (attempt < retryMax) {
            attempt += 1;
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) return true;

                const body = await res.text();
                log(`WARN: ${channel} notify failed attempt=${attempt} status=${res.status} body=${body.slice(0, 120)}`);
            } catch (e) {
                log(`WARN: ${channel} notify error attempt=${attempt} ${e.message}`);
            }

            if (attempt < retryMax) {
                await new Promise((resolve) => setTimeout(resolve, waitMs));
                waitMs = Math.min(waitMs * 2, 8000);
            }
        }
        return false;
    }

    if (ALERTS.webhookUrl) {
        await postWithRetry(
            ALERTS.webhookUrl,
            { text, source: 'ai-secrets-guard' },
            DEFAULTS.alertRetryMax,
            'webhook'
        );
    }

    if (ALERTS.telegramBotToken && ALERTS.telegramChatId) {
        try {
            const url = `https://api.telegram.org/bot${ALERTS.telegramBotToken}/sendMessage`;
            await postWithRetry(
                url,
                {
                    chat_id: ALERTS.telegramChatId,
                    text
                },
                DEFAULTS.alertRetryMax,
                'telegram'
            );
        } catch (e) {
            log(`WARN: telegram notify failed ${e.message}`);
        }
    }
}

async function checkAnthropicLive(timeoutMs) {
    const key = process.env.ANTHROPIC_API_KEY || '';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch('https://api.anthropic.com/v1/models', {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'content-type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01'
            }
        });

        if (res.ok) {
            return { ok: true, status: res.status, body: 'ok' };
        }

        const body = await res.text();
        return { ok: false, status: res.status, body: body.slice(0, 180) };
    } catch (e) {
        return { ok: false, status: 0, body: e.message };
    } finally {
        clearTimeout(timer);
    }
}

async function runCycle(opts) {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    const webhookUrl = process.env.ALERT_WEBHOOK_URL || '';

    const issues = [];

    if (isPlaceholder(anthropicKey) || !anthropicKey.startsWith('sk-ant-')) {
        issues.push('ANTHROPIC_API_KEY invalid/placeholder');
    }

    if (isPlaceholder(webhookUrl) || !looksLikeUrl(webhookUrl)) {
        issues.push('ALERT_WEBHOOK_URL invalid/placeholder');
    }

    log(`CHECK: ANTHROPIC_API_KEY=${redactKey(anthropicKey)} ALERT_WEBHOOK_URL=${looksLikeUrl(webhookUrl) ? 'https-ok' : 'invalid'}`);

    if (issues.length === 0 && opts.live) {
        const live = await checkAnthropicLive(opts.timeoutMs);
        if (!live.ok) {
            issues.push(`Anthropic live check failed (${live.status}) ${live.body}`);
        } else {
            log('OK: Anthropic live check passed');
        }
    }

    if (issues.length > 0) {
        const state = readState();
        const issueFingerprint = issues.join('|');
        const now = Date.now();
        const cooldownMs = opts.alertCooldownSec * 1000;
        const isNewIssue = issueFingerprint !== state.lastIssueFingerprint;
        const cooldownPassed = now - state.lastAlertAt >= cooldownMs;

        const msg = `FAIL: ${issues.join(' | ')}`;
        log(msg);

        state.consecutiveFails += 1;
        state.lastStatus = 'fail';

        if (isNewIssue || cooldownPassed) {
            await notifyAlerts(`${msg} | count=${state.consecutiveFails}`, opts.dryRun);
            state.lastAlertAt = now;
            state.lastIssueFingerprint = issueFingerprint;
        } else {
            log(`SKIP: alert suppressed by cooldown (${opts.alertCooldownSec}s)`);
        }

        writeState(state);
        return false;
    }

    const state = readState();
    if (state.lastStatus === 'fail' || state.consecutiveFails > 0) {
        await notifyAlerts('RECOVERY: AI keys/webhook check is healthy again', opts.dryRun);
    }
    writeState({
        lastAlertAt: state.lastAlertAt,
        lastIssueFingerprint: '',
        consecutiveFails: 0,
        lastStatus: 'ok'
    });

    const okMsg = 'OK: AI keys/webhook are valid';
    log(okMsg);
    return true;
}

async function main() {
    const opts = parseArgs();
    log(`START: ai-secrets-guard (loop=${opts.loop}, interval=${opts.intervalSec}s, live=${opts.live}, dryRun=${opts.dryRun})`);

    const first = await runCycle(opts);
    if (!opts.loop) {
        process.exit(first ? 0 : 1);
    }

    setInterval(() => {
        runCycle(opts).catch((e) => log(`ERROR: cycle failure ${e.message}`));
    }, opts.intervalSec * 1000);
}

main().catch((err) => {
    log(`FATAL: ${err.message}`);
    process.exit(1);
});
