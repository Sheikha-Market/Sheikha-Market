#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'background-processes.log');

const DEFAULTS = {
  mainName: process.env.SHEIKHA_MAIN_NAME || 'sheikha-api',
  marketName: process.env.SHEIKHA_MARKET_NAME || 'sheikha-market-3030',
  mainPort: Number(process.env.SHEIKHA_MAIN_PORT || 8080),
  marketPort: Number(process.env.SHEIKHA_MARKET_PORT || 3030),
  intervalSec: Number(process.env.SHEIKHA_GUARD_INTERVAL || 60),
  timeoutMs: Number(process.env.SHEIKHA_GUARD_TIMEOUT_MS || 4500),
  loop: false,
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
    else if (arg.startsWith('--interval=')) {
      const v = Number(arg.split('=')[1]);
      if (Number.isFinite(v) && v >= 5) opts.intervalSec = v;
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

function log(message) {
  console.log(message);
  appendLog(message);
}

async function notifyAlerts(message) {
  const text = `[Sheikha Guard] ${message}`;

  if (ALERTS.webhookUrl) {
    try {
      await fetch(ALERTS.webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, source: 'background-processes-guard' })
      });
    } catch (e) {
      log(`WARN: webhook notify failed ${e.message}`);
    }
  }

  if (ALERTS.telegramBotToken && ALERTS.telegramChatId) {
    try {
      const url = `https://api.telegram.org/bot${ALERTS.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: ALERTS.telegramChatId,
          text
        })
      });
    } catch (e) {
      log(`WARN: telegram notify failed ${e.message}`);
    }
  }
}

function runShell(cmd, dryRun = false) {
  if (dryRun) {
    log(`[DRY-RUN] ${cmd}`);
    return '';
  }
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function readPm2List(dryRun = false) {
  if (dryRun) return [];
  try {
    const out = runShell('pm2 jlist');
    return JSON.parse(out);
  } catch {
    return [];
  }
}

function findProcess(pm2List, name) {
  return pm2List.find((p) => p && p.name === name);
}

async function health(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body: body.slice(0, 180) };
  } catch (e) {
    return { ok: false, status: 0, body: e.message };
  } finally {
    clearTimeout(timer);
  }
}

function ensureProcessRunning(name, port, dryRun = false) {
  const pm2List = readPm2List(dryRun);
  const proc = findProcess(pm2List, name);
  const online = Boolean(proc && proc.pm2_env && proc.pm2_env.status === 'online');

  if (!proc) {
    log(`MISS: ${name} not found, starting on ${port}`);
    runShell(`PORT=${port} NODE_ENV=production pm2 start server.js --name "${name}" --time --update-env`, dryRun);
    return true;
  }

  if (!online) {
    log(`DOWN: ${name} exists but not online, restarting on ${port}`);
    runShell(`PORT=${port} NODE_ENV=production pm2 restart "${name}" --update-env`, dryRun);
    return true;
  }

  return false;
}

function hardRestart(name, port, dryRun = false) {
  log(`HEAL: hard restart ${name} on ${port}`);
  runShell(`pm2 delete "${name}"`, dryRun);
  runShell(`PORT=${port} NODE_ENV=production pm2 start server.js --name "${name}" --time --update-env`, dryRun);
}

function cleanupLegacyMain(opts) {
  const legacyName = 'sheikha-main-portal';
  if (opts.mainName === legacyName) return false;

  const pm2List = readPm2List(opts.dryRun);
  const legacyProc = findProcess(pm2List, legacyName);
  if (!legacyProc) return false;

  log(`CLEANUP: deleting legacy process ${legacyName}`);
  runShell(`pm2 delete "${legacyName}"`, opts.dryRun);
  return true;
}

async function runCycle(opts) {
  let changed = false;

  changed = cleanupLegacyMain(opts) || changed;

  changed = ensureProcessRunning(opts.mainName, opts.mainPort, opts.dryRun) || changed;
  changed = ensureProcessRunning(opts.marketName, opts.marketPort, opts.dryRun) || changed;

  const mainUrl = `http://127.0.0.1:${opts.mainPort}/api/health`;
  const marketUrl = `http://127.0.0.1:${opts.marketPort}/api/health`;

  const [mainHealth, marketHealth] = await Promise.all([
    health(mainUrl, opts.timeoutMs),
    health(marketUrl, opts.timeoutMs)
  ]);

  if (!mainHealth.ok) {
    log(`WARN: ${opts.mainName} health failed (${mainHealth.status}) ${mainHealth.body}`);
    await notifyAlerts(`${opts.mainName} health failed on ${opts.mainPort}. Auto-heal started.`);
    hardRestart(opts.mainName, opts.mainPort, opts.dryRun);
    changed = true;
  } else {
    log(`OK: ${opts.mainName} ${mainUrl} -> ${mainHealth.status}`);
  }

  if (!marketHealth.ok) {
    log(`WARN: ${opts.marketName} health failed (${marketHealth.status}) ${marketHealth.body}`);
    await notifyAlerts(`${opts.marketName} health failed on ${opts.marketPort}. Auto-heal started.`);
    hardRestart(opts.marketName, opts.marketPort, opts.dryRun);
    changed = true;
  } else {
    log(`OK: ${opts.marketName} ${marketUrl} -> ${marketHealth.status}`);
  }

  if (changed) {
    runShell('pm2 save', opts.dryRun);
    log('SYNC: pm2 process list saved');
    await notifyAlerts('PM2 process list updated after auto-heal.');
  }
}

async function main() {
  const opts = parseArgs();
  log(
    `START: background-processes guard (loop=${opts.loop}, interval=${opts.intervalSec}s, dryRun=${opts.dryRun})`
  );

  if (!opts.loop) {
    await runCycle(opts);
    return;
  }

  await runCycle(opts);
  setInterval(() => {
    runCycle(opts).catch((e) => log(`ERROR: cycle failure ${e.message}`));
  }, opts.intervalSec * 1000);
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
