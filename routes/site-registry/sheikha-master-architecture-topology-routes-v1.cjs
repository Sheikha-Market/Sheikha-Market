'use strict';

const express = require('express');
const { validateTopology, loadTopology, getStatus, resolvePlannedHostname } = require(
  '../../core/site-registry/sheikha-master-architecture-topology-v1.cjs'
);

function createTopologyRoutes({ load = loadTopology, status = getStatus } = {}) {
  const router = express.Router();
  const readPlan = () => {
    const topology = load();
    if (!validateTopology(topology).valid) throw new Error('INVALID_TOPOLOGY');
    return topology;
  };
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/topology', (_req, res) => res.json({ ok: true, mode: 'PLAN_ONLY', data: readPlan() }));
  router.get('/status', (_req, res) => res.json({ ok: true, data: status(readPlan()) }));
  router.get('/resolve', (req, res) => {
    if (Object.keys(req.query).some(key => key !== 'hostname')) {
      return res.status(400).json({ ok: false, error: 'UNSUPPORTED_QUERY' });
    }
    const data = resolvePlannedHostname(req.query.hostname, readPlan());
    const code = data.found ? 200 : data.reason === 'INVALID_HOSTNAME' ? 400 : 404;
    return res.status(code).json({ ok: data.found, data });
  });
  router.use((error, _req, res, _next) => {
    res.status(503).json({ ok: false, error: 'TOPOLOGY_UNAVAILABLE' });
  });
  return router;
}

module.exports = { createTopologyRoutes };
