'use strict';

const express = require('express');
const router = express.Router();

const graph =
require('../../../core/root/knowledge-graph/root-civilization-graph');

router.get('/status', (_req, res) => res.json(graph.status()));
router.post('/activate', (_req, res) => res.json(graph.activate()));

module.exports = router;
