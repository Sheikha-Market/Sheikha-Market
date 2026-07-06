'use strict';

const express = require('express');
const router = express.Router();

const architecture =
require('../../core/kernel/hardware-inspired/sheikha-ai-computer-architecture');

router.get('/status', (_req, res) => res.json(architecture.status()));

router.post('/blueprint', (_req, res) => res.json(architecture.writeBlueprint()));

module.exports = router;
