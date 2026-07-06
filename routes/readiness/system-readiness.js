'use strict';

const express = require('express');
const router = express.Router();

const readiness = require('../../core/kernel/readiness/sheikha-system-readiness');

router.get('/status', (_req, res) => res.json(readiness.status()));
router.post('/activate', (_req, res) => res.json(readiness.activate()));

module.exports = router;
