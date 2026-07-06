'use strict';

const express = require('express');
const router = express.Router();

const rootGovernance =
require('../../core/root/islamic-governance/sheikha-islamic-root-governance');

router.get('/status', (_req, res) => {
  return res.json(rootGovernance.status());
});

router.post('/activate', (_req, res) => {
  return res.json(rootGovernance.activate());
});

module.exports = router;
