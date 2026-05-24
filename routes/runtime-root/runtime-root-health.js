'use strict';

const express = require('express');
const router = express.Router();

const kernel = require('../../runtime/kernel/sheikha-runtime-kernel');

router.get('/health', (_req, res) => {
    res.json(kernel.health());
});

module.exports = router;
