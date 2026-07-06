const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadPDP() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/pdp/sheikha-policy-decision-point.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadPDP(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
