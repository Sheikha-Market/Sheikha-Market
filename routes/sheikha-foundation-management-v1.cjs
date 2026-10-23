'use strict';
const express = require('express');
const foundation = require('../core/foundation/sheikha-foundation-management-v1.cjs');
const { authenticateRequest, redact } = require('../core/security/sheikha-sdk-mcp-governance.cjs');
const router = express.Router();
router.use(express.json({ limit: '8kb' }));
router.use((req, res, next) => {
  try {
    if (!authenticateRequest(req)) return res.status(401).json({ success: false, error: 'SCOPED_API_KEY_REQUIRED' });
    next();
  } catch (_) { res.status(503).json({ success: false, error: 'AUTHENTICATION_UNAVAILABLE' }); }
});
router.get('/language-production/status', (_req, res) => {
  try { res.json(redact(require('../core/foundation/sheikha-language-production-v1.cjs').status())); }
  catch (_) { res.status(503).json({ success: false, error: 'LANGUAGE_PRODUCTION_VERIFICATION_FAILED' }); }
});
router.get('/native-environment/status', (_req, res) => {
  res.json(require('../core/foundation/sheikha-native-environment-status-v1.cjs').status());
});
router.get('/status', (_req, res) => res.json(redact(foundation.status())));
router.get('/components/:component', (req, res) => {
  try { res.json(redact(foundation.inspect(req.params.component))); }
  catch (_) { res.status(404).json({ success: false, error: 'UNKNOWN_COMPONENT' }); }
});
router.post('/components/:component/activation-plan', (req, res) => {
  try {
    const result = foundation.activationPlan(req.params.component, req.body);
    res.status(result.decision.startsWith('ADMIT') ? 200 : 403).json(redact(result));
  } catch (_) { res.status(404).json({ success: false, error: 'UNKNOWN_COMPONENT' }); }
});
module.exports = router;
