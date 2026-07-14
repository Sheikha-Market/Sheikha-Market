'use strict';

const express = require('express');

const {
  getWebsitePrimaryRuntimeStatus,
  validateWebsitePrimaryRuntime,
} = require(
  '../../runtime/website-primary-runtime/v1/' +
  'sheikha-website-primary-runtime-v1'
);

const router = express.Router();

router.get('/status', (_req, res) => {
  const status = getWebsitePrimaryRuntimeStatus();
  const validation = validateWebsitePrimaryRuntime();

  res.status(validation.passed ? 200 : 503).json({
    ok: validation.passed,
    data: {
      status,
      validation,
    },
  });
});

router.get('/readiness', (_req, res) => {
  const validation = validateWebsitePrimaryRuntime();

  res.status(validation.passed ? 200 : 503).json({
    ok: validation.passed,
    ready: validation.passed,
    foundationPlatform: 'system-builder-platform',
    primarySurface: 'website',
    systemBuilderIsFoundation: true,
    websiteIsFoundation: false,
    websiteIsPrimaryProductSurface: true,
    websiteIsSystemBuilderSurface: true,
    vscodeIsToolOnly: true,
    editorRequiredForRuntime: false,
    extensionRequiredForRuntime: false,
    modelFailureStopsWebsite: false,
    validation,
  });
});

module.exports = router;
