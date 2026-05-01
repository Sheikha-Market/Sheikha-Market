const express = require('express');
const router = express.Router();

const root = require('../lib/sheikha-root-neural-network');
const cells = require('../lib/sheikha-neural-cells');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'sheikha-neural-governance',
    status: 'operational'
  });
});

router.post('/process', (req, res) => {
  const result = root.process(req.body || {});
  const cellFlow = cells.execute(req.body || {});

  res.json({
    result,
    cells: cellFlow
  });
});

module.exports = router;
