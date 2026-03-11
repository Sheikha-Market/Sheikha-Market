#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'ip-proof-guard.log');
const STATE_FILE = path.join(LOG_DIR, 'ip-proof-guard-state.json');
const DEFAULT_INTERVAL = Number(process.env.SHEIKHA_IP_PROOF_INTERVAL || 86400);
const ALERT_COOLDOWN_SEC = Number(process.env.SHEIKHA_IP_ALERT_COOLDOWN_SEC || 300);

const ALERTS = {
    webhookUrl: process.env.SHEIKHA_IP_ALERT_WEBHOOK_URL || process.env.ALERT_WEBHOOK_URL || '',
    telegramBotToken:
        process.env.SHEIKHA_IP_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.SHEIKHA_IP_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID || ''
};

function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {
        loop: false,
        strict: false,
        intervalSec: DEFAULT_INTERVAL,
        testAlert: false
    };

    for (const arg of args) {
        if (arg === '--loop') opts.loop = true;
        else if (arg === '--strict') opts.strict = true;
        else if (arg === '--test-alert') opts.testAlert = true;
        else if (arg.startsWith('--interval=')) {
            const value = Number(arg.split('=')[1]);
            if (Number.isFinite(value) && value >= 60) {
                opts.intervalSec = value;
            }
        }
    }

    return opts;
}

function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

function readState() {
    try {
        if (!fs.existsSync(STATE_FILE)) {
            return {
                lastRootHash: '',
                lastAlertAt: 0,
                lastRunAt: '',
                lastStatus: 'init'
            };
        }

        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return {
            lastRootHash: String(parsed.lastRootHash || ''),
            lastAlertAt: Number(parsed.lastAlertAt || 0),
            lastRunAt: String(parsed.lastRunAt || ''),
            lastStatus: String(parsed.lastStatus || 'init')
        };
    } catch {
        return {
            lastRootHash: '',
            lastAlertAt: 0,
            lastRunAt: '',
            lastStatus: 'init'
        };
    }
}

function writeState(state) {
    ensureLogDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function now() {
    return new Date().toISOString();
}

function log(message) {
    ensureLogDir();
    const line = `[${now()}] ${message}`;
    console.log(line);
    fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf8');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseRootHashFromStdout(output) {
    const text = String(output || '');
    const line = text
        .split('\n')
        .map(item => item.trim())
        .find(item => item.startsWith('- rootHash: '));

    if (!line) return '';
    return line.replace('- rootHash: ', '').trim();
}

async function notifyAlerts(message) {
    const text = `[Sheikha IP Guard] ${message}`;

    async function postWithRetry(url, payload, channel) {
        let attempt = 0;
        let waitMs = 1000;
        while (attempt < 3) {
            attempt += 1;
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) return true;

                const body = await res.text();
                log(
                    `WARN: ${channel} alert failed attempt=${attempt} status=${res.status} body=${body.slice(0, 120)}`
                );
            } catch (error) {
                log(`WARN: ${channel} alert error attempt=${attempt} ${error.message}`);
            }

            if (attempt < 3) {
                await sleep(waitMs);
                waitMs = Math.min(waitMs * 2, 8000);
            }
        }

        return false;
    }

    if (ALERTS.webhookUrl) {
        await postWithRetry(
            ALERTS.webhookUrl,
            {
                text,
                source: 'sheikha-ip-proof-guard'
            },
            'webhook'
        );
    }

    if (ALERTS.telegramBotToken && ALERTS.telegramChatId) {
        const tgUrl = `https://api.telegram.org/bot${ALERTS.telegramBotToken}/sendMessage`;
        await postWithRetry(
            tgUrl,
            {
                chat_id: ALERTS.telegramChatId,
                text
            },
            'telegram'
        );
    }
}

function runProof(strict) {
    const env = { ...process.env };
    if (strict) env.SHEIKHA_IP_STRICT = '1';

    const result = spawnSync(process.execPath, ['scripts/ip-ownership-proof.js'], {
        cwd: ROOT,
        env,
        stdio: 'pipe',
        encoding: 'utf8'
    });

    if (result.stdout) log(result.stdout.trim());
    if (result.stderr) log(result.stderr.trim());

    return {
        ok: result.status === 0,
        rootHash: parseRootHashFromStdout(result.stdout || ''),
        stdout: String(result.stdout || ''),
        stderr: String(result.stderr || '')
    };
}

async function handleCycle(opts) {
    const state = readState();
    const result = runProof(opts.strict);

    state.lastRunAt = now();

    if (!result.ok) {
        state.lastStatus = 'failed';
        writeState(state);
        log('فشل دورة الإثبات — سيعاد المحاولة في الدورة القادمة');
        return;
    }

    state.lastStatus = 'ok';

    const nextRootHash = String(result.rootHash || '');
    const prevRootHash = String(state.lastRootHash || '');

    if (nextRootHash && prevRootHash && nextRootHash !== prevRootHash) {
        const nowSec = Math.floor(Date.now() / 1000);
        const isCooldown = nowSec - Number(state.lastAlertAt || 0) < ALERT_COOLDOWN_SEC;

        log(`⚠️ تم رصد تغير في Root Hash: ${prevRootHash} -> ${nextRootHash}`);

        if (!isCooldown) {
            await notifyAlerts(
                `تم رصد تغير في البصمة الجذرية للملكية الرقمية\nold=${prevRootHash}\nnew=${nextRootHash}`
            );
            state.lastAlertAt = nowSec;
            log('📣 تم إرسال تنبيه التغير (إن كانت قنوات التنبيه مفعّلة)');
        } else {
            log('ℹ️ تم رصد تغير لكن التنبيه ضمن مهلة التهدئة (cooldown)');
        }
    }

    if (nextRootHash) {
        state.lastRootHash = nextRootHash;
    }

    writeState(state);
}

async function main() {
    const opts = parseArgs();

    if (opts.testAlert) {
        await notifyAlerts('اختبار تنبيه يدوي من حارس إثبات الملكية الرقمية.');
        log('✅ تم تنفيذ اختبار التنبيه اليدوي (تحقق من webhook/telegram إذا كانت مفعّلة)');
        process.exit(0);
    }

    if (!opts.loop) {
        const result = runProof(opts.strict);
        process.exit(result.ok ? 0 : 1);
    }

    log(`بدء الحارس الدوري لإثبات الملكية | interval=${opts.intervalSec}s | strict=${opts.strict}`);

    while (true) {
        await handleCycle(opts);

        await sleep(opts.intervalSec * 1000);
    }
}

main().catch(error => {
    log(`خطأ حرج في حارس إثبات الملكية: ${error.message}`);
    process.exit(1);
});
