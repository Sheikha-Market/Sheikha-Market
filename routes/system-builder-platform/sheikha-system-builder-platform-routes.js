'use strict';

const express = require('express');

const {
  getSystemBuilderPlatformStatus,
} = require(
  '../../tools/system-builder-fabric/' +
  'sheikha-system-builder-platform-hierarchy-v1'
);

const router = express.Router();

router.get('/status', (_req, res) => {
  try {
    const result = getSystemBuilderPlatformStatus();

    res.status(result.passed ? 200 : 503).json({
      ok: result.passed,
      data: result,
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      system:
        'SHEIKHA_SYSTEM_BUILDER_PLATFORM_HIERARCHY_V1',
      error: error.message,
    });
  }
});

router.get('/hierarchy', (_req, res) => {
  try {
    const result = getSystemBuilderPlatformStatus();

    res.status(result.passed ? 200 : 503).json({
      ok: result.passed,
      hierarchy: {
        foundation: result.foundation,
        coreFabric: result.coreFabric,
        developmentPlatform:
          result.developmentPlatform,
        productSurface: result.productSurface,
        optionalAdapters: result.optionalAdapters,
      },
      lifecycle: result.systemBuildingLifecycle,
      governance: result.governance,
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;
