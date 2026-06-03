const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadGrid() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/execution-orchestration-grid/sheikha-execution-orchestration-grid.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadGrid(),
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const data = loadGrid();
  return res.json({ success: true, orchestrationLayers: data.orchestrationLayers });
});

router.get('/targets', (_req, res) => {
  const data = loadGrid();
  return res.json({ success: true, executionTargets: data.executionTargets });
});

module.exports = router;
