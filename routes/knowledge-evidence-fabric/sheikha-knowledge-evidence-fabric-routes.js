'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createEvidenceRecord
} = require('../../runtime/knowledge-evidence-fabric/v1/sheikha-knowledge-evidence-fabric-v1');

router.get('/api/sheikha/knowledge-evidence-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/knowledge-evidence-fabric/v1/record', (req, res) => {
  res.json(createEvidenceRecord(req.body || {}));
});

module.exports = router;
