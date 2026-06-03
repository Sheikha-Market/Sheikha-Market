const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'));
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    organization: readJson('runtime/organization/sheikha-organization/sheikha-organization.json'),
    domains: readJson('runtime/domains/domain-registry.json'),
    timestamp: new Date().toISOString()
  });
});

router.get('/domains', (_req, res) => {
  return res.json({
    success: true,
    ...readJson('runtime/domains/domain-registry.json'),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
