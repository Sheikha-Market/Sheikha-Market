'use strict';

const express = require('express');
const experience = require(
  '../runtime/extension-experience-apex/v1/sheikha-vscode-extension-experience-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/extension-experience/v1/status', (_req, res) => {
  res.json({ success: true, data: experience.status() });
});

module.exports = router;
