'use strict';

const express = require('express');
const router = express.Router();

const supreme =
require('../../core/root/supreme-governance/sheikha-supreme-islamic-governance');

router.get('/status', (_req, res) => res.json(supreme.status()));
router.post('/activate', (_req, res) => res.json(supreme.activate()));

module.exports = router;
