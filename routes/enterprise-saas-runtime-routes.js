'use strict';

const express = require('express');
const readiness = require('../runtime/saas/enterprise-ready/saas-enterprise-readiness.json');
const { listCapabilities } = require('../runtime/registry/capabilities/capability-registry');
const { listServices } = require('../runtime/service-catalog/service-catalog');
const mcp = require('../runtime/mcp/mcp-fabric');
const cluster = require('../runtime/cluster/cluster-fabric');
const orchestrator = require('../runtime/orchestrator/orchestrator-fabric');

const router = express.Router();

router.get('/api/saas/enterprise/status', (req, res) => {
  res.json({ success: true, data: readiness });
});

router.get('/api/registry/capabilities', (req, res) => {
  res.json({ success: true, data: listCapabilities() });
});

router.get('/api/service-catalog', (req, res) => {
  res.json({ success: true, data: listServices() });
});

router.get('/api/mcp/status', (req, res) => {
  res.json({ success: true, data: mcp.status() });
});

router.get('/api/cluster/status', (req, res) => {
  res.json({ success: true, data: cluster.status() });
});

router.get('/api/orchestrator/status', (req, res) => {
  res.json({ success: true, data: orchestrator.status() });
});

module.exports = router;
