'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const router = express.Router();
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/hardware-compatibility/v1'
);
const REGISTRY_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-compatibility-registry-v1.json'
);
const REPORT_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-universal-hardware-compatibility-v1-report.json'
);
const MATRIX_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-qualification-matrix-v1.json'
);
const GRAPH_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-compatibility-graph-v1.json'
);
const ROADMAP_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-hardware-porting-roadmap-v1.json'
);
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/contracts/' +
    'sheikha-universal-hardware-compatibility-fabric-v1-contract.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function unavailable(res, error) {
  res.status(503).json({
    ok: false,
    error: 'HARDWARE_COMPATIBILITY_EVIDENCE_UNAVAILABLE',
    message: error.message,
  });
}

function query(req, name) {
  return String(req.query[name] || '').trim().toUpperCase();
}

router.get('/status', (_req, res) => {
  try {
    const report = readJson(REPORT_PATH);
    res.json({
      ok: true,
      data: {
        system: report.system,
        status: report.status,
        driverAbi: report.driverAbi,
        coverage: report.coverage,
        activeFoundation: report.activeFoundation,
        historicalEvidence: report.historicalEvidence,
        controls: report.controls,
        claimBoundary: report.claimBoundary,
        nextExecutableGates: report.nextExecutableGates,
      },
    });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/architectures', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const qualification = query(req, 'qualification');
    const domain = query(req, 'domain');
    const architectures = registry.architectures.filter((item) =>
      (!qualification || item.qualification === qualification) &&
      (!domain || item.domains.some(
        (value) => value.toUpperCase() === domain
      ))
    );
    res.json({ ok: true, data: { total: architectures.length, architectures } });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/targets', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const domain = query(req, 'domain');
    const architecture = query(req, 'architecture');
    const qualification = query(req, 'qualification');
    const targets = registry.targets.filter((item) =>
      (!domain || item.domain === domain) &&
      (!architecture || item.architectures.some(
        (value) => value.toUpperCase() === architecture
      )) &&
      (!qualification || item.qualification === qualification)
    );
    res.json({ ok: true, data: { total: targets.length, targets } });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/targets/:id', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const id = String(req.params.id || '').trim().toLowerCase();
    const target = registry.targets.find((item) => item.id === id);
    if (!target) {
      res.status(404).json({
        ok: false,
        error: 'HARDWARE_TARGET_NOT_FOUND',
      });
      return;
    }
    const connectors = registry.connectors.filter((item) =>
      target.requiredConnectors.includes(item.id)
    );
    res.json({ ok: true, data: { target, connectors } });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/connectors', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const category = query(req, 'category');
    const qualification = query(req, 'qualification');
    const status = query(req, 'status');
    const highImpact = query(req, 'highImpact');
    const connectors = registry.connectors.filter((item) =>
      (!category || item.category === category) &&
      (!qualification || item.qualification === qualification) &&
      (!status || item.status.includes(status)) &&
      (!highImpact || String(item.highImpact).toUpperCase() === highImpact)
    );
    res.json({ ok: true, data: { total: connectors.length, connectors } });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/operating-environments', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const mode = query(req, 'mode');
    const qualification = query(req, 'qualification');
    const operatingEnvironments = registry.operatingEnvironments.filter(
      (item) =>
        (!mode || item.mode === mode) &&
        (!qualification || item.qualification === qualification)
    );
    res.json({
      ok: true,
      data: { total: operatingEnvironments.length, operatingEnvironments },
    });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/qualification', (_req, res) => {
  try {
    res.json({ ok: true, data: readJson(MATRIX_PATH) });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/architecture', (_req, res) => {
  try {
    res.json({ ok: true, data: readJson(GRAPH_PATH) });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/roadmap', (_req, res) => {
  try {
    res.json({ ok: true, data: readJson(ROADMAP_PATH) });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/contract', (_req, res) => {
  try {
    res.json({ ok: true, data: readJson(CONTRACT_PATH) });
  } catch (error) {
    unavailable(res, error);
  }
});

module.exports = router;
