'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  languagePlan
} = require('../../runtime/arabic-language-cluster-fabric/v91/sheikha-arabic-language-cluster-fabric-v91');

router.get('/api/sheikha/arabic-language-cluster-fabric/v91/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/arabic-language-cluster-fabric/v91/demo', (_req, res) => res.json(languagePlan()));
router.post('/api/sheikha/arabic-language-cluster-fabric/v91/plan', (req, res) => res.json(languagePlan(req.body || {})));

module.exports = router;
