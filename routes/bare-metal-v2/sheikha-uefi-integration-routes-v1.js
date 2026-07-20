'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const router = express.Router();
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/uefi-integration/v1'
);
const REGISTRY_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-uefi-capability-registry-v1.json'
);
const REPORT_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-uefi-integration-v1-report.json'
);
const GRAPH_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-uefi-architecture-graph-v1.json'
);
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/contracts/' +
    'sheikha-uefi-integration-fabric-v1-contract.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function unavailable(res, error) {
  res.status(503).json({
    ok: false,
    error: 'UEFI_INTEGRATION_EVIDENCE_UNAVAILABLE',
    message: error.message,
  });
}

router.get('/status', (_req, res) => {
  try {
    const report = readJson(REPORT_PATH);
    const registry = readJson(REGISTRY_PATH);
    res.json({
      ok: true,
      data: {
        system: report.system,
        status: report.status,
        specification: report.specification,
        coverage: report.coverage,
        controls: report.controls,
        claimBoundary: registry.claimBoundary,
        activeFoundation: report.activeFoundation,
        roadmap: report.roadmap,
      },
    });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/capabilities', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const kind = String(req.query.kind || '').toUpperCase();
    const activation = String(req.query.activation || '').toUpperCase();
    const verification = String(req.query.verification || '').toUpperCase();
    const capabilities = registry.capabilities.filter((item) =>
      (!kind || item.kind === kind) &&
      (!activation || item.activation.includes(activation)) &&
      (!verification || (
        verification === 'VERIFIED'
          ? item.verificationStatus.endsWith('QEMU_VERIFIED') ||
            item.verificationStatus === 'SOURCE_VERIFIED'
          : item.verificationStatus.includes(verification)
      ))
    );
    res.json({
      ok: true,
      data: {
        specification: registry.specification,
        total: capabilities.length,
        capabilities,
      },
    });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/capabilities/:id', (req, res) => {
  try {
    const registry = readJson(REGISTRY_PATH);
    const id = String(req.params.id || '').toUpperCase();
    const capability = registry.capabilities.find((item) => item.id === id);
    if (!capability) {
      res.status(404).json({
        ok: false,
        error: 'UEFI_CAPABILITY_NOT_FOUND',
      });
      return;
    }
    res.json({ ok: true, data: capability });
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

router.get('/contract', (_req, res) => {
  try {
    res.json({ ok: true, data: readJson(CONTRACT_PATH) });
  } catch (error) {
    unavailable(res, error);
  }
});

module.exports = router;
