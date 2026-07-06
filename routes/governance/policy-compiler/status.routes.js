const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadCompiler() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/policy-compiler/sheikha-policy-compiler.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadCompiler(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
