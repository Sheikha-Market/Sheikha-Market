'use strict';

const express = require('express');
const router = express.Router();

const {
  collectEnterpriseInspector,
  compactInspectorContext,
  updateExtensionHeartbeat
} = require('../core/enterprise/sheikha-enterprise-inspector-v3');

router.get('/api/sheikha/enterprise-inspector/v3/status', (_req, res) => {
  res.json(collectEnterpriseInspector());
});

router.post('/api/sheikha/enterprise-inspector/v3/context', express.json(), (req, res) => {
  updateExtensionHeartbeat(req.body || {});
  res.json(collectEnterpriseInspector());
});

router.get('/api/sheikha/enterprise-inspector/v3/context', (_req, res) => {
  res.json(compactInspectorContext(collectEnterpriseInspector()));
});

router.get('/api/sheikha/enterprise-inspector/v3/architecture', (_req, res) => {
  const snapshot = collectEnterpriseInspector();
  res.json({
    success: true,
    inspector: snapshot.inspector,
    architecture: snapshot.architecture,
    surfaces: snapshot.surfaces,
    orchestration: snapshot.orchestration
  });
});

module.exports = router;
