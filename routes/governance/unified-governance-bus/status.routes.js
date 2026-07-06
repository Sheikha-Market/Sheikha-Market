const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadBus() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/unified-governance-bus/sheikha-unified-governance-bus.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadBus(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
