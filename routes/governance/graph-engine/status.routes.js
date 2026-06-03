const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadGraph() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/graph-engine/sheikha-governance-graph-engine.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadGraph(),
    timestamp: new Date().toISOString()
  });
});

router.get('/nodes', (_req, res) => {
  const data = loadGraph();

  return res.json({
    success: true,
    nodes: data.nodes
  });
});

router.get('/edges', (_req, res) => {
  const data = loadGraph();

  return res.json({
    success: true,
    edges: data.edges
  });
});

module.exports = router;
