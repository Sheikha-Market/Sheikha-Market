const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadFabric() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/federated-knowledge-fabric/sheikha-federated-knowledge-fabric.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadFabric(),
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const data = loadFabric();

  return res.json({
    success: true,
    knowledgeLayers: data.knowledgeLayers
  });
});

router.get('/domains', (_req, res) => {
  const data = loadFabric();

  return res.json({
    success: true,
    knowledgeDomains: data.knowledgeDomains
  });
});

module.exports = router;
