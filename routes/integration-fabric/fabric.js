'use strict';

const express = require('express');
const router = express.Router();

const fabric =
require('../../core/kernel/integration-fabric/sheikha-integrated-system-fabric');

router.get('/status', (_req, res) => res.json(fabric.status()));
router.post('/blueprint', (_req, res) => res.json(fabric.writeBlueprint()));

module.exports = router;
