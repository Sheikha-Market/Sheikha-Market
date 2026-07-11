'use strict';

const express = require('express');
const router = express.Router();

const {
  compactInspectorContext,
  getEnterpriseInspectorSnapshot,
  updateExtensionHeartbeat
} = require('../core/enterprise/sheikha-enterprise-inspector-v3');

router.get('/api/sheikha/enterprise-inspector/v3/status', (_req, res) => {
  res.json(getEnterpriseInspectorSnapshot());
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

router.get('/api/sheikha/enterprise-inspector/v3/context', (_req, res) => {
  res.json(compactInspectorContext(getEnterpriseInspectorSnapshot()));
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
