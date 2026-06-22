'use strict';

const express = require('express');
const router = express.Router();

const {
  loadQuranicAtlas
} = require('../../runtime/quranic-atlas/sheikha-quranic-atlas-runtime');

router.get('/api/sheikha/quranic-atlas/v1/status', (_req, res) => {

  res.json({
    success: true,
    system: 'SHEIKHA_QURANIC_ARCHITECTURAL_ATLAS_V1',
    atlas: loadQuranicAtlas()
  });

});

module.exports = router;
