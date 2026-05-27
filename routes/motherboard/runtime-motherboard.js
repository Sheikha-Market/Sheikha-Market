'use strict';

const express = require('express');
const router = express.Router();

const motherboard =
require('../../core/kernel/motherboard/sheikha-runtime-motherboard');

router.get('/status', (_req, res) => res.json(motherboard.status()));
router.post('/activate', (_req, res) => res.json(motherboard.activate()));

module.exports = router;
