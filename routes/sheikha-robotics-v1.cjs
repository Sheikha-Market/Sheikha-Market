'use strict';
const express = require('express');
const robot = require('../core/robotics/sheikha-robot-language-v1.cjs');
const { runScenario } = require('../core/robotics/sheikha-digital-robot-v1');
const { authenticateRequest } = require('../core/security/sheikha-sdk-mcp-governance.cjs');
const router = express.Router(); router.use(express.json({ limit: '8kb' }));
router.use((req, res, next) => {
  try { if (!authenticateRequest(req)) return res.status(401).json({ success: false, error: 'SCOPED_API_KEY_REQUIRED' }); next(); }
  catch (_) { res.status(503).json({ success: false, error: 'AUTHENTICATION_UNAVAILABLE' }); }
});
router.get('/status', (_req, res) => {
  try { res.json(robot.activateDigitalRobot()); }
  catch (_) { res.status(503).json({ success: false, status: 'UNKNOWN' }); }
});
router.get('/hardware-plan', (_req, res) => res.json(robot.hardwareIntegrationPlan()));
router.post('/simulate', (req, res) => {
  if (!req.body || Object.keys(req.body).some(k => k !== 'mission')) return res.status(400).json({ success: false, error: 'SIMULATION_FIELDS_ONLY' });
  try { res.json(runScenario(req.body.mission)); }
  catch (_) { res.status(400).json({ success: false, error: 'MISSION_NOT_ADMITTED' }); }
});
router.post('/physical-command', (_req, res) => res.status(403).json({ success: false, error: 'PHYSICAL_DRIVER_NOT_CONFIGURED', commandSent: false }));
module.exports = router;
