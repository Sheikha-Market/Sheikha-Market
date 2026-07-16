'use strict';

const express = require('express');

const integrativeAwarenessFabric = require(
  '../../core/integrative-awareness/sheikha-integrative-awareness-fabric-v1'
);

const router = express.Router();

const CONTRACT = 'SHEIKHA_INTEGRATIVE_AWARENESS_HTTP_ADAPTER_V1';

function setReadOnlyHeaders(res) {
  res.set('X-Sheikha-Contract', CONTRACT);
  res.set('Cache-Control', 'no-store, max-age=0');
  res.set('Pragma', 'no-cache');
}

function clonePayload(value) {
  return JSON.parse(JSON.stringify(value));
}

router.use((req, res, next) => {
  setReadOnlyHeaders(res);

  if (!['GET', 'HEAD'].includes(req.method)) {
    return res.status(405).json({
      schemaVersion: '1.0.0',
      system: CONTRACT,
      status: 'METHOD_NOT_ALLOWED',
      allowedMethods: ['GET', 'HEAD'],
      externalMutationPerformed: false
    });
  }

  return next();
});

router.get('/status', (_req, res) => {
  const status = integrativeAwarenessFabric
    .status();

  return res.status(200).json(
    clonePayload(status)
  );
});

router.get('/verify', (_req, res) => {
  const verification = integrativeAwarenessFabric
    .verify();

  return res.status(200).json(
    clonePayload(verification)
  );
});

router.use((_req, res) => res.status(404).json({
  schemaVersion: '1.0.0',
  system: CONTRACT,
  status: 'NOT_FOUND',
  externalMutationPerformed: false
}));

module.exports = router;
