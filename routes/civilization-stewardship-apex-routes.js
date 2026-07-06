'use strict';

const express = require('express');
const stewardship = require(
  '../runtime/civilization-stewardship-apex/v1/civilization-stewardship-apex-v1'
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
      role: String(req.get('x-sheikha-role') || 'GOVERNANCE_REVIEWER'),
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
        error: error.code || 'CIVILIZATION_STEWARDSHIP_APEX_ERROR',
        message: error.message
      });
    }
  };
}

router.get('/api/sheikha/civilization-stewardship/v1/status', route(() => stewardship.status()));
router.get('/api/sheikha/civilization-stewardship/v1/dashboard', route(req => {
  contextFromRequest(req, 'stewardship:read');
  return stewardship.dashboard();
}));
router.get('/api/sheikha/civilization-stewardship/v1/registry', route(req => {
  contextFromRequest(req, 'stewardship:read');
  return stewardship.snapshot();
}));
router.get('/api/sheikha/civilization-stewardship/v1/audit', route(req => {
  contextFromRequest(req, 'stewardship:audit');
  return stewardship.store.auditEntries(req.query.limit);
}));

router.post('/api/sheikha/civilization-stewardship/v1/mandates', route(req =>
  stewardship.registerMandate(req.body || {}, contextFromRequest(req, 'stewardship:write'))));
router.post('/api/sheikha/civilization-stewardship/v1/mandates/:mandateId/evidence', route(req =>
  stewardship.attachEvidence(
    req.params.mandateId,
    req.body || {},
    contextFromRequest(req, 'stewardship:write')
  )));
router.post('/api/sheikha/civilization-stewardship/v1/mandates/:mandateId/review', route(req =>
  stewardship.reviewMandate(
    req.params.mandateId,
    contextFromRequest(req, 'stewardship:write')
  )));
router.post('/api/sheikha/civilization-stewardship/v1/mandates/:mandateId/ratify', route(req =>
  stewardship.ratifyAndDelegate(
    req.params.mandateId,
    req.body || {},
    contextFromRequest(req, 'stewardship:ratify')
  )));

module.exports = router;
