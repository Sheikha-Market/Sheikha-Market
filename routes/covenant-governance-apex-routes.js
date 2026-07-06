'use strict';

const express = require('express');
const covenant = require('../runtime/covenant-governance-apex/v1/covenant-governance-apex-v1');
const apiKeys = require('../runtime/security/api-keys/api-key-manager');

const router = express.Router();
router.use(express.json({ limit: '256kb' }));

function booleanHeader(req, name) {
  return String(req.get(name) || '').toLowerCase() === 'true';
}

function contextFromRequest(req, requiredScope) {
  if (req.user?.id) {
    return {
      actorId: String(req.user.id),
      role: String(req.user.role || 'USER'),
      trusted: true,
      humanApproved: booleanHeader(req, 'x-sheikha-human-approved')
    };
  }
  const authorization = String(req.get('authorization') || '');
  const secret = authorization.match(/^(?:Sheikha|Bearer)\s+(skh_v2_\S+)$/i)?.[1];
  if (secret) {
    const authenticated = apiKeys.authenticate(secret, requiredScope);
    if (authenticated) {
      return { ...authenticated, humanApproved: booleanHeader(req, 'x-sheikha-human-approved') };
    }
  }
  const devHeadersAllowed = process.env.NODE_ENV !== 'production' ||
    process.env.SHEIKHA_ALLOW_DEV_IDENTITY_HEADERS === 'true';
  const actorId = String(req.get('x-sheikha-actor-id') || '').trim();
  if (devHeadersAllowed && actorId) {
    return {
      actorId,
      role: String(req.get('x-sheikha-role') || 'GOVERNANCE_REVIEWER'),
      trusted: true,
      humanApproved: booleanHeader(req, 'x-sheikha-human-approved')
    };
  }
  const error = new Error('A trusted identity or scoped Sheikha API key is required.');
  error.code = 'TRUSTED_IDENTITY_REQUIRED';
  error.statusCode = 401;
  throw error;
}

function route(handler) {
  return async (req, res) => {
    try {
      const data = await handler(req);
      res.json({ success: true, data });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.code || 'COVENANT_GOVERNANCE_APEX_ERROR',
        message: error.message
      });
    }
  };
}

router.get('/api/sheikha/covenant-governance/v1/status', route(() => covenant.status()));
router.get('/api/sheikha/covenant-governance/v1/policies', route(() =>
  covenant.policyRegistry.status()));
router.get('/api/sheikha/covenant-governance/v1/registry', route(req => {
  contextFromRequest(req, 'covenant:read');
  return covenant.snapshot();
}));
router.get('/api/sheikha/covenant-governance/v1/audit', route(req => {
  contextFromRequest(req, 'covenant:audit');
  return covenant.store.auditEntries(req.query.limit);
}));
router.post('/api/sheikha/covenant-governance/v1/evaluate', route(req => {
  contextFromRequest(req, 'covenant:evaluate');
  return covenant.evaluateAction(req.body || {});
}));
router.post('/api/sheikha/covenant-governance/v1/promotions', route(req =>
  covenant.promoteLayer(req.body || {}, contextFromRequest(req, 'covenant:promote'))));

module.exports = router;
