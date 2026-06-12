'use strict';

const express = require('express');
const router = express.Router();
const {
  collectEnterpriseInspector,
  compactInspectorContext
} = require('../core/enterprise/sheikha-enterprise-inspector-v3');

router.use(express.json({ limit: '256kb' }));

router.get('/api/sheikha/enterprise-inspector/v3/status', (_req, res) => {
  res.json(collectEnterpriseInspector());
});

router.post('/api/sheikha/enterprise-inspector/v3/context', (req, res) => {
  res.json(collectEnterpriseInspector(req.body || {}));
});

router.get('/api/sheikha/enterprise-inspector/v3/architecture', (_req, res) => {
  const snapshot = collectEnterpriseInspector();
  res.json({
    success: true,
    status: snapshot.status,
    inspector: snapshot.inspector,
    architecture: snapshot.architecture,
    surfaces: snapshot.surfaces,
    governance: snapshot.governance
  });
});

router.get('/api/sheikha/enterprise-inspector/v2/status', (_req, res) => {
  res.json(compactInspectorContext(collectEnterpriseInspector()));
});

module.exports = router;
