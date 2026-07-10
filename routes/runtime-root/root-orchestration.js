'use strict';

const express = require('express');
const router = express.Router();
const orchestrator = require('../../core/orchestration/sheikha-root-orchestrator');
const federation = require('../../core/runtime/federation/sheikha-runtime-federation');
const synchronizer = require('../../core/runtime/synchronization/sheikha-runtime-synchronizer');
const canonicalRuntime = require('../../core/runtime/governance/sheikha-canonical-runtime-loader');
const { getToolsetsStatus } = require('../../core/runtime/bus/sheikha-mcp-toolsets-registry');

router.get('/orchestration', (_req, res) => {
  res.json(orchestrator.status());
});

router.get('/toolsets', (_req, res) => {
  res.json(getToolsetsStatus());
});

router.get('/federation', (_req, res) => {
  res.json(federation.status());
});

router.get('/synchronization', (_req, res) => {
  res.json(synchronizer.status());
});

router.get('/distributed-root', (_req, res) => {
  const o = orchestrator.status();
  const canonical = canonicalRuntime.getCanonicalRuntimeStatus();
  res.json({
    success: o.success,
    status: o.orchestration ? 'active' : 'partial',
    orchestration: o.orchestration,
    distributedRoot: o.distributedRoot,
    layers: o.layers,
    canonicalRuntime: canonical,
    governance: {
      valuesReference: 'quran-and-authentic-sunnah',
      humanAuthority: true,
      halalOrHaramDeterminedBySoftware: false,
      qualifiedScholarReviewRequired: true
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/health', (_req, res) => {
  const o = orchestrator.status();
  const canonical = canonicalRuntime.getCanonicalRuntimeStatus();
  res.json({
    success: true,
    kernel: 'Sheikha Runtime Kernel',
    version: '1.0.0',
    status: 'active',
    layers: {
      governance: true,
      ai: true,
      memory: true,
      orchestration: o.orchestration,
      neural: true,
      gateway: true,
      runtimeBus: o.layers.runtimeBus,
      eventFabric: o.layers.eventFabric,
      recovery: o.layers.recoveryEngine,
      federation: o.layers.federation,
      synchronization: o.layers.synchronization,
      canonicalRuntime: o.layers.canonicalRuntimeLoader
    },
    orchestrationSummary: o.summary,
    optionalIntegrations: o.optionalIntegrations,
    offlineOperation: o.offlineOperation,
    canonicalRuntime: {
      runtime: canonical.runtime,
      governance: canonical.governance,
      duplicateRuntimeLoading: canonical.duplicateRuntimeLoading,
      autoBlueprintRuntimeLoading: canonical.autoBlueprintRuntimeLoading
    },
    distributedRoot: o.distributedRoot,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
