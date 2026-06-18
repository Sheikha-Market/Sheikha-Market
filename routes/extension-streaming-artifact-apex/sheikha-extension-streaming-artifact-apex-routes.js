'use strict';

const express = require('express');
const extensionStreamingArtifactApex = require(
  '../../runtime/extension-streaming-artifact-apex/v1/sheikha-extension-streaming-artifact-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/extension-streaming-artifact-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: extensionStreamingArtifactApex.status() });
});

module.exports = router;
