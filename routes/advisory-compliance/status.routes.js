const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadLayer() {
  const file = path.join(
    process.cwd(),
    'runtime/advisory-compliance/sheikha-methodology-regulation-licensing.json'
  );

  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

router.get('/status', (_req, res) => {
  try {
    return res.json({
      success: true,
      ...loadLayer(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/methodology', (_req, res) => {
  const layer = loadLayer();
  return res.json({ success: true, methodology: layer.methodology });
});

router.get('/regulation', (_req, res) => {
  const layer = loadLayer();
  return res.json({ success: true, organization: layer.organization, governance: layer.governance });
});

router.get('/licenses', (_req, res) => {
  const layer = loadLayer();
  return res.json({ success: true, licenses: layer.licenses });
});

router.get('/certifications', (_req, res) => {
  const layer = loadLayer();
  return res.json({ success: true, certifications: layer.certifications });
});

module.exports = router;
