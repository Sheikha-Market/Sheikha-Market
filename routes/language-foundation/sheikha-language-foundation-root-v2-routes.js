'use strict';

const express = require('express');

const {
  buildFoundationStatus
} = require(
  '../../runtime/sheikha-language-foundation/v2/' +
  'sheikha-language-foundation-root-v2'
);

const router = express.Router();

function status() {
  return buildFoundationStatus();
}

function sendStatus(_req, res) {
  const data = status();
  res.set('Cache-Control', 'no-store');
  return res.status(data.passed ? 200 : 503).json({
    ok: data.passed,
    data
  });
}

router.get('/status', sendStatus);

router.get('/ai-roots', (_req, res) => {
  const data = status();
  res.set('Cache-Control', 'no-store');
  res.status(data.passed ? 200 : 503).json({
    ok: data.passed,
    data: {
      system: data.system,
      status: data.status,
      aiCapabilityRoots: data.aiCapabilityRoots,
      governance: data.governance
    }
  });
});

router.get('/system-adapters', (_req, res) => {
  const data = status();
  res.set('Cache-Control', 'no-store');
  res.status(data.passed ? 200 : 503).json({
    ok: data.passed,
    data: {
      system: data.system,
      status: data.status,
      systemToolAdapters: data.systemToolAdapters,
      implementationBoundary: data.implementationBoundary
    }
  });
});

router.get('/native-stack', (_req, res) => {
  const data = status();
  res.set('Cache-Control', 'no-store');
  res.status(data.passed ? 200 : 503).json({
    ok: data.passed,
    data: {
      system: data.system,
      status: data.status,
      nativeStack: data.nativeStack,
      implementationBoundary: data.implementationBoundary
    }
  });
});

module.exports = router;
