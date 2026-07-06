'use strict';

const express = require('express');
const router = express.Router();

const runtime = require('../../core/runtime/unified/sheikha-unified-runtime');

const runtimeRegistry =
require('../../runtime/unified-runtime/registry/unified-runtime-registry.json');

const runtimePolicy =
require('../../runtime/unified-runtime/policy/unified-runtime-policy.json');

const controlPlane =
require('../../runtime/control-plane/registry/sheikha-unified-control-plane.json');

router.get('/health', (req, res) => {
  res.json(runtime.health());
});

router.get('/interfaces', (req, res) => {
  res.json(runtime.interfaces());
});

router.get('/runtime', (req, res) => {
  res.json({
    runtime: runtime.runtime,
    version: runtime.version,
    startedAt: runtime.startedAt
  });
});

router.get('/registry', (req, res) => {
  res.json(runtimeRegistry);
});

router.get('/policy', (req, res) => {
  res.json(runtimePolicy);
});

router.get('/control', (req, res) => {
  res.json(controlPlane);
});

module.exports = router;
