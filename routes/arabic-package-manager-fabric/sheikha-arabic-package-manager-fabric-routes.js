'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  packagePlan
} = require('../../runtime/arabic-package-manager-fabric/v96/sheikha-arabic-package-manager-fabric-v96');

router.get('/api/sheikha/arabic-package-manager-fabric/v96/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-package-manager-fabric/v96/demo', (_req, res) => res.json(packagePlan()));
router.post('/api/sheikha/arabic-package-manager-fabric/v96/plan', (req, res) => res.json(packagePlan(req.body || {})));

module.exports = router;
