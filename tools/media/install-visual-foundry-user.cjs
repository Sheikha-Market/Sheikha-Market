#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { safePath } = require('../../core/foundry/sheikha-visual-foundry.cjs');
const root = path.resolve(__dirname, '../..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/sheikha-visual-foundry.json'), 'utf8'));
const q = value => '"' + value.replace(/%/g, '%%').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const unitPath = value => value.replace(/%/g, '%%');
const command = mode => `${q(process.execPath)} ${q(path.join(root, 'tools/media/sheikha-visual-foundry.cjs'))} ${mode}`;
const userDir = path.join(os.homedir(), '.config/systemd/user');
const common = 'UMask=0077\nNoNewPrivileges=true\nNice=10\nMemoryMax=512M\nCPUQuota=25%\n';
if (/[\r\n]/.test(root + process.execPath) || config.timezone !== 'Asia/Riyadh' || !/^\d{2}:\d{2}$/.test(config.dailyTime)) throw Error('INVALID_UNIT_CONFIGURATION');
const files = {
  'sheikha-visual-foundry-daily.service.d/50-local-pipeline.conf': `[Unit]\nDescription=Sheikha local visual and UI review packages\nConditionPathExists=\nConditionPathExists=${unitPath(path.join(root, 'config/sheikha-visual-foundry.json'))}\n[Service]\nExecStart=\nExecStart=${command('daily')}\nWorkingDirectory=${unitPath(root)}\nTimeoutStartSec=180\n${common}`,
  'sheikha-visual-foundry-daily.timer.d/50-local-pipeline.conf': `[Timer]\nOnCalendar=\nOnCalendar=*-*-* ${config.dailyTime}:00 Asia/Riyadh\nPersistent=true\nAccuracySec=30s\n`,
  'sheikha-visual-foundry-guard.service.d/50-local-pipeline.conf': `[Unit]\nDescription=Sheikha original and archive integrity guard\nConditionPathExists=\nConditionPathExists=${unitPath(path.join(root, 'config/sheikha-visual-foundry.json'))}\n[Service]\nExecStart=\nExecStart=${command('guard')}\nWorkingDirectory=${unitPath(root)}\nTimeoutStartSec=180\n${common}`,
  'sheikha-visual-foundry-watch.service': `[Unit]\nDescription=Sheikha local visual source event watcher\n[Service]\nType=simple\nExecStart=${command('watch')}\nWorkingDirectory=${unitPath(root)}\nRestart=on-failure\nRestartSec=10\nTimeoutStopSec=30\n${common}[Install]\nWantedBy=default.target\n`
};
function systemctl(args) {
  const result = spawnSync('systemctl', ['--user', ...args], { encoding: 'utf8', timeout: 30000 });
  if (result.status !== 0) throw Error(result.stderr || result.error?.message || 'SYSTEMD_FAILED');
  return result.stdout;
}
if (process.argv[2] !== '--install') {
  console.log(JSON.stringify({ mode: 'PREVIEW_ONLY', userDir, files, activation: 'Use --install to install scoped overrides and enable the existing timers plus the new watcher.' }, null, 2));
} else {
  for (const name of ['sheikha-visual-foundry-daily.service', 'sheikha-visual-foundry-daily.timer', 'sheikha-visual-foundry-guard.service', 'sheikha-visual-foundry-guard.timer']) {
    if (!fs.existsSync(safePath(path.join(userDir, name)))) throw Error('EXISTING_BASE_UNIT_REQUIRED: ' + name);
  }
  const marker = '# Managed by tools/media/install-visual-foundry-user.cjs\n';
  for (const name of Object.keys(files)) {
    const file = safePath(path.join(userDir, name));
    if (fs.existsSync(file) && !fs.readFileSync(file, 'utf8').startsWith(marker)) throw Error('UNOWNED_OVERRIDE_EXISTS: ' + name);
  }
  for (const [name, contents] of Object.entries(files)) {
    const file = safePath(path.join(userDir, name));
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    const temp = file + '.new'; safePath(temp);
    fs.writeFileSync(temp, marker + contents, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temp, file);
  }
  systemctl(['daemon-reload']);
  systemctl(['enable', '--now', 'sheikha-visual-foundry-daily.timer', 'sheikha-visual-foundry-guard.timer', 'sheikha-visual-foundry-watch.service']);
  systemctl(['restart', 'sheikha-visual-foundry-daily.timer']);
  console.log(systemctl(['show', 'sheikha-visual-foundry-daily.timer', 'sheikha-visual-foundry-guard.timer', 'sheikha-visual-foundry-watch.service', '--property=Id,ActiveState,SubState,NextElapseUSecRealtime,MainPID']));
}
