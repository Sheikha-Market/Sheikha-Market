const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadMesh() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/runtime-federation-mesh/sheikha-runtime-federation-mesh.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadMesh(),
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const data = loadMesh();

  return res.json({
    success: true,
    meshLayers: data.meshLayers
  });
});

router.get('/nodes', (_req, res) => {
  const data = loadMesh();

  return res.json({
    success: true,
    runtimeNodes: data.runtimeNodes
  });
});

module.exports = router;
