'use strict';
const express = require('express');
const language = require('../core/language/sheikha-managed-language-v1.cjs');
const { authenticateRequest, redact } = require('../core/security/sheikha-sdk-mcp-governance.cjs');
const router = express.Router();
router.use(express.json({ limit: '96kb' }));
router.use((req, res, next) => {
  try {
    if (!authenticateRequest(req)) return res.status(401).json({ success: false, error: 'SCOPED_API_KEY_REQUIRED' });
    next();
  } catch (_) { res.status(503).json({ success: false, error: 'AUTHENTICATION_UNAVAILABLE' }); }
});
router.get('/status', (_req, res) => res.json(language.status()));
for (const action of ['compile', 'run']) router.post('/' + action, (req, res) => {
  try {
    // No client runtime options are forwarded.
    if (!req.body || Object.keys(req.body).some(key => key !== 'source'))
      return res.status(400).json({ success: false, error: 'UNSUPPORTED_REQUEST_FIELDS' });
    const result = language[action](req.body.source);
    res.status(result.success ? 200 : 422).json(redact(result));
  } catch (_) { res.status(400).json({ success: false, error: 'LANGUAGE_INPUT_REJECTED' }); }
});
module.exports = router;
