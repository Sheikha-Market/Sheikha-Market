const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadRegistry() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/capability-execution-registry/sheikha-capability-execution-registry.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadRegistry(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
