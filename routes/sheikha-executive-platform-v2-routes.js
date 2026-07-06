'use strict';

const express = require('express');
const router = express.Router();
const { status } = require('../core/executive-platform/sheikha-executive-platform-v2');
const {
  collectEnterpriseInspector,
  compactInspectorContext
} = require('../core/enterprise/sheikha-enterprise-inspector-v3');

router.get('/api/sheikha/executive-platform/v2/status', (_req, res) => {
  res.json(status());
});

router.get('/api/sheikha/inspector/v2/status', (_req, res) => {
  const snapshot = collectEnterpriseInspector();
  const executive = status({ runtime: snapshot.runtime, git: snapshot.git });

  res.json({
    success: true,
    status: snapshot.status,
    inspector: {
      ...executive.inspector,
      engine: snapshot.inspector
    },
    runtime: snapshot.runtime,
    git: snapshot.git,
    governance: snapshot.governance,
    ai: executive.ai,
    enterpriseInspector: compactInspectorContext(snapshot)
  });
});

module.exports = router;
