'use strict';

const express = require('express');
const router = express.Router();

const {
  status
} = require('../../runtime/quality-safety-fabric/v71/sheikha-quality-safety-fabric-v71');

router.get(
  '/api/sheikha/quality-safety-fabric/v71/status',
  (_req, res) => res.json(status())
);

module.exports = router;
