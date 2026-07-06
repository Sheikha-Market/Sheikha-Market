const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadKernel() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/execution-kernel/sheikha-execution-governance-kernel.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadKernel(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
