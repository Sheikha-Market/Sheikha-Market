'use strict';

const express = require('express');
const router = express.Router();

const { loadRuntime } = require('../../runtime/loader/sheikha-runtime-loader');
const { discoverModules } = require('../../runtime/discovery/sheikha-module-discovery');

router.get('/api/sheikha/master-blueprint/v1/status', (_req, res) => {
  res.json({
    success: true,
    system: 'SHEIKHA_MASTER_BLUEPRINT_V1',
    runtime: loadRuntime()
  });
});


router.get('/api/sheikha/master-blueprint/v1/health', (_req, res) => {
  const runtime = loadRuntime();
  const modules = Object.values(runtime.modules || {});
  const activeModules = modules.filter((value) => value === 'ACTIVE').length;

  res.json({
    success: true,
    system: 'SHEIKHA_MASTER_BLUEPRINT_V1',
    status: activeModules === modules.length ? 'HEALTHY' : 'DEGRADED',
    modules: modules.length,
    activeModules,
    uptimeSeconds: Math.round(process.uptime())
  });
});

router.get('/api/sheikha/master-blueprint/v1/metrics', (_req, res) => {
  const memory = process.memoryUsage();

  res.json({
    success: true,
    system: 'SHEIKHA_MASTER_BLUEPRINT_V1',
    metrics: {
      uptimeSeconds: Math.round(process.uptime()),
      memory,
      pid: process.pid,
      nodeVersion: process.version
    }
  });
});

module.exports = router;
