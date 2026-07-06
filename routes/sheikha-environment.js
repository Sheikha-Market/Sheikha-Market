'use strict';

const express = require('express');
const { execFile } = require('child_process');
const os = require('os');
const fs = require('fs');

const router = express.Router();
router.use(express.json());

const ROOT = '/opt/sheikha/current';

function run(cmd, args = [], cwd = ROOT) {
  return new Promise(resolve => {
    execFile(cmd, args, { cwd, timeout: 15000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: String(stdout || '').trim(),
        stderr: String(stderr || '').trim(),
        error: error?.message || null
      });
    });
  });
}

router.get('/api/sheikha/environment/scan', async (req, res) => {
  const [
    gitBranch,
    gitStatus,
    pm2Status,
    nodeVersion,
    npmVersion,
    ollamaModels,
    disk
  ] = await Promise.all([
    run('git', ['branch', '--show-current']),
    run('git', ['status', '--short']),
    run('pm2', ['jlist']),
    run('node', ['-v']),
    run('npm', ['-v']),
    run('curl', ['-s', 'http://127.0.0.1:11434/api/tags']),
    run('df', ['-h', ROOT])
  ]);

  let models = [];
  try {
    models = JSON.parse(ollamaModels.stdout).models?.map(m => ({
      name: m.name,
      size: m.size,
      digest: m.digest,
      family: m.details?.family,
      parameterSize: m.details?.parameter_size,
      quantization: m.details?.quantization_level
    })) || [];
  } catch {}

  let pm2 = [];
  try {
    pm2 = JSON.parse(pm2Status.stdout).map(p => ({
      name: p.name,
      pid: p.pid,
      status: p.pm2_env?.status,
      restarts: p.pm2_env?.restart_time,
      memory: p.monit?.memory,
      cpu: p.monit?.cpu
    }));
  } catch {}

  res.json({
    success: true,
    data: {
      runtime: {
        root: ROOT,
        cwd: process.cwd(),
        serverFile: fs.existsSync(`${ROOT}/server.js`) ? `${ROOT}/server.js` : null,
        routesDir: fs.existsSync(`${ROOT}/routes`) ? `${ROOT}/routes` : null
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        uptimeSeconds: os.uptime()
      },
      node: {
        nodeVersion: nodeVersion.stdout,
        npmVersion: npmVersion.stdout,
        env: process.env.NODE_ENV || null
      },
      git: {
        branch: gitBranch.stdout,
        statusShort: gitStatus.stdout
      },
      pm2,
      ollama: {
        url: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
        models
      },
      disk: disk.stdout,
      sheikha: {
        apiBase: 'https://api.sheikha.top',
        chatRoute: '/api/sheikha/ai-gateway/chat',
        programmingRoute: '/api/sheikha/programming/ask',
        cliRoute: '/api/sheikha/cli/run',
        ragRoute: '/api/sheikha/rag/search',
        graphicsRoute: '/api/sheikha/graphics/render',
        officialModel: process.env.SHEIKHA_CORE_MODEL || 'Sheikha-Core:latest',
        codingModel: process.env.SHEIKHA_CODE_REASONING_MODEL || 'qwen2.5-coder:14b'
      }
    }
  });
});

module.exports = router;
