'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  libraryPlan
} = require('../../runtime/arabic-standard-library-fabric/v94/sheikha-arabic-standard-library-fabric-v94');

router.get('/api/sheikha/arabic-standard-library-fabric/v94/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-standard-library-fabric/v94/demo', (_req, res) => res.json(libraryPlan()));
router.post('/api/sheikha/arabic-standard-library-fabric/v94/plan', (req, res) => res.json(libraryPlan(req.body || {})));

module.exports = router;
