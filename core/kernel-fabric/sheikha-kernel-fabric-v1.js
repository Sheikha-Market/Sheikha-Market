'use strict';

const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

function safeRead(command, fallback = null) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
}

function readDistro() {
  try {
    const data = fs.readFileSync('/etc/os-release', 'utf8');
    return Object.fromEntries(
      data.split('\n')
        .filter((line) => line.includes('='))
        .map((line) => {
          const [key, ...rest] = line.split('=');
          return [key, rest.join('=').replace(/^"|"$/g, '')];
        })
    );
  } catch {
    return {};
  }
}

function inspectKernelFabric() {
  const distro = readDistro();
  const pm2Json = safeRead('pm2 jlist', '[]');

  let pm2 = [];
  try { pm2 = JSON.parse(pm2Json); } catch { pm2 = []; }

  return {
    system: 'SHEIKHA_KERNEL_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_MEASUREMENT',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noSysctlModification: true,
      noServiceRestart: true,
      noHarm: true
    },
    os: {
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
      arch: os.arch(),
      hostname: os.hostname(),
      distroName: distro.NAME || null,
      distroVersion: distro.VERSION || null,
      prettyName: distro.PRETTY_NAME || null
    },
    compute: {
      cpus: os.cpus().length,
      model: os.cpus()[0]?.model || null,
      loadavg: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem()
    },
    disk: {
      root: safeRead("df -h / | tail -1 | awk '{print $2,$3,$4,$5}'", null)
    },
    pm2: pm2.map((proc) => ({
      name: proc.name,
      status: proc.pm2_env?.status,
      pid: proc.pid,
      memory: proc.monit?.memory,
      cpu: proc.monit?.cpu
    })),
    governance: {
      humanReviewRequired: true,
      productionSafe: true
    }
  };
}

module.exports = { inspectKernelFabric };
