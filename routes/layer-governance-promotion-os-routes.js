'use strict';

const express = require('express');
const engine = require('../runtime/layer-governance-promotion-os/v1/layer-governance-promotion-os-v1');
const apiKeys = require('../runtime/security/api-keys/api-key-manager');

const router = express.Router();
router.use(express.json({ limit: '256kb' }));

function contextFromRequest(req, requiredScope) {
  const humanApproved = String(req.get('x-sheikha-human-approved') || '').toLowerCase() === 'true';
  if (req.user?.id) {
    return {
      actorId: String(req.user.id), role: String(req.user.role || 'USER'),
      trusted: true, humanApproved
    };
  }
  const authorization = String(req.get('authorization') || '');
  const secret = authorization.match(/^(?:Sheikha|Bearer)\s+(skh_v2_\S+)$/i)?.[1];
  if (secret) {
    const authenticated = apiKeys.authenticate(secret, requiredScope);
    if (authenticated) return { ...authenticated, humanApproved };
  }
  const devAllowed = process.env.NODE_ENV !== 'production' ||
    process.env.SHEIKHA_ALLOW_DEV_IDENTITY_HEADERS === 'true';
  const actorId = String(req.get('x-sheikha-actor-id') || '').trim();
  if (devAllowed && actorId) {
    return {
      actorId,
      role: String(req.get('x-sheikha-role') || 'GOVERNANCE_REVIEWER'),
      trusted: true,
      humanApproved
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
      res.json({ success: true, data: await handler(req) });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.code || 'LAYER_GOVERNANCE_PROMOTION_OS_ERROR',
        message: error.message
      });
    }
  };
}

const base = '/api/sheikha/layer-governance/v1';
router.get(`${base}/status`, route(() => engine.status()));
router.get(`${base}/catalog`, route(() => engine.registry.snapshot()));
router.get(`${base}/registry`, route(req => {
  contextFromRequest(req, 'layers:read');
  return engine.snapshot();
}));
router.get(`${base}/audit`, route(req => {
  contextFromRequest(req, 'layers:audit');
  return engine.store.auditEntries(req.query.limit);
}));
router.post(`${base}/assess`, route(req => {
  contextFromRequest(req, 'layers:assess');
  return engine.assessLayer(req.body || {});
}));
router.post(`${base}/proposals`, route(req =>
  engine.createPromotionProposal(req.body || {}, contextFromRequest(req, 'layers:propose'))));
router.post(`${base}/proposals/:proposalId/ratify`, route(req =>
  engine.ratifyPromotion(
    String(req.params.proposalId),
    contextFromRequest(req, 'layers:promote')
  )));

module.exports = router;
