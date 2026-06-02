const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/status', (_req, res) => {
  try {
    const file = path.join(
      process.cwd(),
      'runtime/advisory-commercial/sheikha-advisory-commercial-layer.json'
    );

    const layer = JSON.parse(fs.readFileSync(file, 'utf8'));

    return res.json({
      success: true,
      ...layer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/licensing', (_req, res) => {
  return res.json({
    success: true,
    service: 'SHEIKHA_LICENSING',
    status: 'ACTIVE',
    rule: 'Licensing is client-facing and does not expose the internal runtime kernel.',
    timestamp: new Date().toISOString()
  });
});

router.get('/b2b', (_req, res) => {
  return res.json({
    success: true,
    service: 'SHEIKHA_B2B_ADVISORY',
    status: 'ACTIVE',
    scope: ['enterprise consulting', 'partner enablement', 'technology advisory', 'market organization'],
    timestamp: new Date().toISOString()
  });
});

router.get('/b2g', (_req, res) => {
  return res.json({
    success: true,
    service: 'SHEIKHA_B2G_ADVISORY',
    status: 'ACTIVE',
    scope: ['government advisory', 'digital transformation', 'policy support', 'sovereign governance consulting'],
    timestamp: new Date().toISOString()
  });
});

router.get('/advisory-apis', (_req, res) => {
  return res.json({
    success: true,
    service: 'SHEIKHA_ADVISORY_APIS',
    status: 'ACTIVE',
    boundary: 'External APIs are governed service interfaces, not direct kernel access.',
    timestamp: new Date().toISOString()
  });
});

router.get('/enterprise-partnerships', (_req, res) => {
  return res.json({
    success: true,
    service: 'SHEIKHA_ENTERPRISE_PARTNERSHIPS',
    status: 'ACTIVE',
    scope: ['technology companies', 'enterprises', 'governments', 'strategic partners'],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
