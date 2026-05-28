'use strict';

const express = require('express');
const router = express.Router();

const systems =
require('../../../core/root/systems/sheikha-root-systems-fabric');

router.get('/status', (_req, res) => res.json(systems.status()));
router.post('/activate', (_req, res) => res.json(systems.activate()));

module.exports = router;
