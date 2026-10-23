'use strict';

const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const { ROOT, REGISTRY, inspectIntegrations } = require('./sheikha-repository-integration-v1');

// Both HTTP mounts share one worker; slow repositories never block the web event loop.
let active = null;
let cached = null;
function inspectIntegrationsAsync(options = {}) {
  const settings = { workspaceRoot: options.workspaceRoot || ROOT, registryFile: options.registryFile || REGISTRY };
  const key = JSON.stringify(settings);
  if (active) {
    return active.key === key ? active.promise : Promise.reject(new Error('REPOSITORY_INSPECTION_BUSY'));
  }
  if (cached?.key === key && Date.now() - cached.completedAt < 5000) return Promise.resolve(cached.data);
  const job = { key };
  active = job;
  job.promise = new Promise((resolve, reject) => {
    let worker;
    let timer;
    let settled = false;
    const finish = async (error, data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { if (worker) await worker.terminate(); } catch { error = true; }
      if (active === job) active = null;
      if (error) { reject(new Error('REPOSITORY_INSPECTION_UNAVAILABLE')); return; }
      cached = { key, data, completedAt: Date.now() };
      resolve(data);
    };
    try {
      worker = new Worker(__filename, { workerData: settings, env: {}, execArgv: [],
        resourceLimits: { maxOldGenerationSizeMb: 64 } });
      timer = setTimeout(() => { void finish(true); }, 15000);
      worker.once('message', message => { void finish(!message?.ok, message?.data); });
      worker.once('error', () => { void finish(true); });
      worker.once('exit', () => { void finish(true); });
    } catch { void finish(true); }
  });
  return job.promise;
}

if (!isMainThread) {
  try { parentPort.postMessage({ ok: true, data: inspectIntegrations(workerData) }); }
  catch { parentPort.postMessage({ ok: false }); }
}

module.exports = { inspectIntegrationsAsync };
