'use strict';
const express = require('express');
const router = express.Router();
router.get('/api/marketplace-catalog-v2/status', (_req, res) => res.json({ system: 'MARKETPLACE_CATALOG_V2', status: 'ACTIVE' }));
module.exports = router;
