'use strict';

const express = require('express');
const router = express.Router();

const {
  compactInspectorContext,
  getFreshEnterpriseInspectorSnapshot,
  getEnterpriseInspectorSnapshot,
  updateExtensionHeartbeat
} = require('../core/enterprise/sheikha-enterprise-inspector-v3');

router.get('/api/sheikha/enterprise-inspector/v3/status', async (_req, res, next) => {
  try {
    res.json(await getFreshEnterpriseInspectorSnapshot());
  } catch (error) {
    next(error);
  }
});

router.post('/api/sheikha/enterprise-inspector/v3/context', express.json(), (req, res) => {
  const extension = updateExtensionHeartbeat(req.body || {});
  res.json({
    success: true,
    inspector: 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
    status: 'CONTEXT_ACCEPTED',
    extension: {
      source: extension.source,
      status: extension.status,
      lastHeartbeat: extension.lastHeartbeat
    }
  });
});

router.get('/api/sheikha/enterprise-inspector/v3/context', async (_req, res, next) => {
  try {
    const snapshot = await getFreshEnterpriseInspectorSnapshot();
    res.json(compactInspectorContext(snapshot));
  } catch (error) {
    next(error);
  }
});

router.get('/api/sheikha/enterprise-inspector/v3/architecture', (_req, res) => {
  const snapshot = getEnterpriseInspectorSnapshot();
  res.json({
    success: true,
    inspector: snapshot.inspector,
    architecture: snapshot.architecture,
    surfaces: snapshot.surfaces,
    orchestration: snapshot.orchestration
  });
});

module.exports = router;
