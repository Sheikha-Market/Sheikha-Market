'use strict';

const express = require('express');
const router = express.Router();

const {
  loadQuranicOperatingSystemAtlas
} = require('../../runtime/quranic-operating-system/sheikha-quranic-operating-system-atlas-runtime');

router.get('/api/sheikha/quranic-operating-system/v1/status', (_req, res) => {

  res.json({
    success: true,
    system: 'SHEIKHA_QURANIC_OPERATING_SYSTEM_ATLAS_OMEGA_V1',
    atlas: loadQuranicOperatingSystemAtlas()
  });

});

module.exports = router;
