const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadExchange() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'runtime/exchange/sheikha-exchange/sheikha-exchange-readiness.json'),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadExchange(),
    timestamp: new Date().toISOString()
  });
});

router.get('/markets', (_req, res) => {
  const data = loadExchange();
  return res.json({ success: true, markets: data.markets });
});

router.get('/authority-path', (_req, res) => {
  const data = loadExchange();
  return res.json({ success: true, authorityPath: data.authorityPath });
});

router.get('/controls', (_req, res) => {
  const data = loadExchange();
  return res.json({ success: true, controls: data.controls });
});

module.exports = router;
