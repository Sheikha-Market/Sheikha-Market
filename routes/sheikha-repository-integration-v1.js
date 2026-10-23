'use strict';

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { probeVisualRuntime } = require('../runtime/repository-integration/v1/sheikha-repository-integration-v1');
const { inspectIntegrationsAsync } = require('../runtime/repository-integration/v1/inspection-service-v1');

function buildRepositoryIntegrationRouter(options = {}) {
  const router = express.Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/status', authenticate, requireAdmin, async (req, res) => {
    if (Object.keys(req.query).length) return res.status(400).json({ success: false, error: 'QUERY_OVERRIDES_NOT_ALLOWED' });
    try {
      const data = await inspectIntegrationsAsync(options);
      return res.json({ success: true, data });
    } catch {
      return res.status(503).json({ success: false, error: 'REPOSITORY_INSPECTION_UNAVAILABLE' });
    }
  });
  router.get('/visual-health', authenticate, requireAdmin, async (req, res) => {
    if (Object.keys(req.query).length) return res.status(400).json({ success: false, error: 'QUERY_OVERRIDES_NOT_ALLOWED' });
    const data = await probeVisualRuntime();
    return res.status(data.contractVerified ? 200 : 503).json({ success: data.contractVerified, data });
  });
  return router;
}

module.exports = { buildRepositoryIntegrationRouter };
