const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadControlPlane() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'runtime/control-plane/sheikha-sovereign-control-plane.json'),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadControlPlane(),
    timestamp: new Date().toISOString()
  });
});

router.get('/systems', (_req, res) => {
  const data = loadControlPlane();
  return res.json({ success: true, managedSystems: data.managedSystems });
});

router.get('/layers', (_req, res) => {
  const data = loadControlPlane();
  return res.json({ success: true, controlLayers: data.controlLayers });
});

module.exports = router;
