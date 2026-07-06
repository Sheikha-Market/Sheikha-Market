'use strict';

const fs = require('fs');
const path = require('path');
const kernelRegistry = require('../registry');
const providerRegistry = require('../../providers/provider-registry');

const ROOT = process.cwd();

const STATE_DIR = path.join(ROOT, 'runtime', 'state');
const LOCK_DIR = path.join(ROOT, 'runtime', 'locks');

function ensureRuntimeDirs() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(LOCK_DIR, { recursive: true });
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function boot() {
  ensureRuntimeDirs();

  const provider = providerRegistry.resolveProvider();
  const providerStatus =
    provider && typeof provider.status === 'function'
      ? provider.status()
      : { success: true, provider: 'unknown' };

  const state = {
    success: true,
    kernel: 'SHEIKHA_KERNEL_CONTROL_PLANE',
    runtime: kernelRegistry.runtime,
    governance: kernelRegistry.governance,
    canonical: true,
    deterministicRuntime: true,
    providerAbstraction: true,
    offlineSurvivability: true,
    selectedProvider: providerStatus.provider,
    providerStatus,
    lock: 'runtime/locks/canonical-runtime.lock',
    timestamp: new Date().toISOString()
  };

  writeJson(path.join(STATE_DIR, 'kernel-state.json'), state);
  fs.writeFileSync(
    path.join(LOCK_DIR, 'canonical-runtime.lock'),
    `SHEIKHA_CANONICAL_RUNTIME_LOCK=${state.timestamp}\n`
  );

  return state;
}

function status() {
  ensureRuntimeDirs();

  const stateFile = path.join(STATE_DIR, 'kernel-state.json');

  if (!fs.existsSync(stateFile)) {
    return boot();
  }

  return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
}

module.exports = {
  boot,
  status
};
