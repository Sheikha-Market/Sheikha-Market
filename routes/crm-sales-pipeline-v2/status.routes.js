'use strict';
const express = require('express');
const router = express.Router();
router.get('/api/crm-sales-pipeline-v2/status', (_req, res) => res.json({ system: 'CRM_SALES_PIPELINE_V2', status: 'ACTIVE' }));
module.exports = router;
