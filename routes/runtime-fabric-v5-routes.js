'use strict';

const express = require('express');
const fabric = require('../runtime/runtime-fabric-v5/runtime-fabric-v5');

const router = express.Router();
router.use(express.json({ limit: '256kb' }));

function booleanHeader(req, name) {
  return String(req.get(name) || '').toLowerCase() === 'true';
}

function contextFromRequest(req) {
  if (req.user?.id) {
    return {
      actorId: String(req.user.id),
      role: String(req.user.role || 'USER'),
      trusted: true,
      humanApproved: booleanHeader(req, 'x-sheikha-human-approved'),
      source: 'authenticated-user'
    };
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

  const error = new Error('A trusted authenticated identity is required.');
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
        error: error.code || 'RUNTIME_FABRIC_V5_ERROR',
        message: error.message
      });
    }
  };
}

router.get('/api/sheikha/runtime-fabric/v5/status', route(() => fabric.status()));
router.get('/api/sheikha/runtime-fabric/v5/services', route(req => {
  contextFromRequest(req);
  return fabric.services.status();
}));
router.get('/api/sheikha/runtime-fabric/v5/events', route(req => {
  contextFromRequest(req);
  return fabric.eventBus.recent(req.query.limit);
}));
router.get('/api/sheikha/runtime-fabric/v5/queue', route(req => {
  contextFromRequest(req);
  return {
    status: fabric.queue.status(),
    jobs: fabric.queue.list({ status: req.query.status, limit: req.query.limit })
  };
}));
router.get('/api/sheikha/runtime-fabric/v5/schedules', route(req => {
  contextFromRequest(req);
  return fabric.scheduler.list(req.query.limit);
}));
router.get('/api/sheikha/runtime-fabric/v5/metrics', route(req => {
  contextFromRequest(req);
  return fabric.observability.snapshot();
}));
router.get('/api/sheikha/runtime-fabric/v5/cluster', route(req => {
  contextFromRequest(req);
  return fabric.status().cluster;
}));
router.get('/api/sheikha/runtime-fabric/v5/audit', route(req => {
  contextFromRequest(req);
  return fabric.store.auditEntries(req.query.limit);
}));

router.post('/api/sheikha/runtime-fabric/v5/issues', route((req) =>
  fabric.submitIssue(req.body || {}, contextFromRequest(req))));
router.post('/api/sheikha/runtime-fabric/v5/workers/drain', route((req) =>
  fabric.drain(req.body || {}, contextFromRequest(req))));
router.post('/api/sheikha/runtime-fabric/v5/schedules', route((req) =>
  fabric.createSchedule(req.body || {}, contextFromRequest(req))));
router.post('/api/sheikha/runtime-fabric/v5/scheduler/tick', route((req) =>
  fabric.tick(contextFromRequest(req))));

module.exports = router;
