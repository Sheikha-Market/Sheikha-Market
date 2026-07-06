'use strict';

const express = require('express');
const agentFabric = require('../runtime/enterprise-agent-fabric/enterprise-agent-fabric');
const dashboard = require('../runtime/admin-dashboard/enterprise-admin-dashboard');
const observability = require('../runtime/observability/enterprise/enterprise-observability');

const router = express.Router();

router.get('/api/enterprise/agent-fabric/status', (req, res) => {
  res.json({ success: true, data: agentFabric.status() });
});

router.get('/api/enterprise/agent-fabric/agents', (req, res) => {
  res.json({ success: true, data: agentFabric.listAgents() });
});

router.post('/api/enterprise/agent-fabric/route-task', (req, res) => {
  res.json({ success: true, data: agentFabric.routeTask(req.body || {}) });
});

router.get('/api/enterprise/admin-dashboard/status', (req, res) => {
  res.json({ success: true, data: dashboard.status() });
});

router.get('/api/enterprise/admin-dashboard/panels', (req, res) => {
  res.json({ success: true, data: dashboard.panels() });
});

router.get('/api/enterprise/observability/status', (req, res) => {
  res.json({ success: true, data: observability.status() });
});

router.get('/api/enterprise/observability/streams', (req, res) => {
  res.json({ success: true, data: observability.streams() });
});

module.exports = router;
