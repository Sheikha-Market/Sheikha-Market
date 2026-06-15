'use strict';

const express = require('express');
const commandPlane = require(
  '../runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1'
);
const apiKeys = require('../runtime/security/api-keys/api-key-manager');

const router = express.Router();
router.use(express.json({ limit: '256kb' }));

function booleanHeader(req, name) {
  return String(req.get(name) || '').toLowerCase() === 'true';
}

function contextFromRequest(req, requiredScope = null) {
  if (req.user?.id) {
    return {
      actorId: String(req.user.id),
      role: String(req.user.role || 'USER'),
      trusted: true,
      humanApproved: booleanHeader(req, 'x-sheikha-human-approved'),
      source: 'authenticated-user'
    };
  }

  const authorization = String(req.get('authorization') || '');
  const secret = authorization.match(/^(?:Sheikha|Bearer)\s+(skh_v2_\S+)$/i)?.[1];
  if (secret) {
    const authenticated = apiKeys.authenticate(secret, requiredScope);
    if (authenticated) {
      return {
        ...authenticated,
        humanApproved: booleanHeader(req, 'x-sheikha-human-approved')
      };
    }
  }

  const devHeadersAllowed = process.env.NODE_ENV !== 'production' ||
    process.env.SHEIKHA_ALLOW_DEV_IDENTITY_HEADERS === 'true';
  const actorId = String(req.get('x-sheikha-actor-id') || '').trim();
  if (devHeadersAllowed && actorId) {
    return {
      actorId,
      role: String(req.get('x-sheikha-role') || 'OPERATOR'),
      trusted: true,
      humanApproved: booleanHeader(req, 'x-sheikha-human-approved'),
      source: 'development-identity-headers'
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
      const data = await handler(req, res);
      if (!res.headersSent) res.json({ success: true, data });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.code || 'CIVILIZATION_COMMAND_PLANE_ERROR',
        message: error.message
      });
    }
  };
}

router.get('/api/sheikha/civilization-command/v1/status', route(() => commandPlane.status()));
router.get('/api/sheikha/civilization-command/v1/references', route(() =>
  commandPlane.references.status()));
router.get('/api/sheikha/civilization-command/v1/dashboard', route(req => {
  contextFromRequest(req, 'civilization:read');
  return commandPlane.dashboard();
}));
router.get('/api/sheikha/civilization-command/v1/registry', route(req => {
  contextFromRequest(req, 'civilization:read');
  return commandPlane.snapshot();
}));
router.get('/api/sheikha/civilization-command/v1/audit', route(req => {
  contextFromRequest(req, 'civilization:audit');
  return commandPlane.store.auditEntries(req.query.limit);
}));

router.post('/api/sheikha/civilization-command/v1/plans', route(req =>
  commandPlane.createPlan(req.body || {}, contextFromRequest(req, 'civilization:write'))));
router.post('/api/sheikha/civilization-command/v1/risks', route(req =>
  commandPlane.registerRisk(req.body || {}, contextFromRequest(req, 'civilization:write'))));
router.post('/api/sheikha/civilization-command/v1/plans/:planId/evaluate', route(req =>
  commandPlane.evaluatePlan(req.params.planId, contextFromRequest(req, 'civilization:write'))));
router.post('/api/sheikha/civilization-command/v1/twins', route(req =>
  commandPlane.registerTwin(req.body || {}, contextFromRequest(req, 'civilization:write'))));
router.post('/api/sheikha/civilization-command/v1/impacts', route(req =>
  commandPlane.recordImpact(req.body || {}, contextFromRequest(req, 'civilization:write'))));
router.post('/api/sheikha/civilization-command/v1/plans/:planId/dispatch', route(req =>
  commandPlane.dispatchPlan(req.params.planId, contextFromRequest(req, 'civilization:execute'))));

module.exports = router;
