const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadPEP() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/pep/sheikha-policy-enforcement-point.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadPEP(),
    timestamp: new Date().toISOString()
  });
});

router.get('/rules', (_req, res) => {
  const data = loadPEP();

  return res.json({
    success: true,
    rules: data.rules
  });
});

router.get('/actions', (_req, res) => {
  const data = loadPEP();

  return res.json({
    success: true,
    actions: data.actions
  });
});

module.exports = router;
