const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadLayer() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/autonomous-runtime-coordination/sheikha-autonomous-runtime-coordination.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadLayer(),
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const data = loadLayer();
  return res.json({ success: true, coordinationLayers: data.coordinationLayers });
});

router.get('/boundaries', (_req, res) => {
  const data = loadLayer();
  return res.json({ success: true, boundaries: data.boundaries });
});

module.exports = router;
