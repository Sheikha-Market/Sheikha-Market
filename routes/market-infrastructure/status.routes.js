const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadMarketInfrastructure() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'runtime/market-infrastructure/sheikha-market-infrastructure.json'),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadMarketInfrastructure(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
