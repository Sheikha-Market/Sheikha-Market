const express = require('express');
const router = express.Router();

const root = require('../lib/sheikha-root-neural-network');
const cells = require('../lib/sheikha-neural-cells');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'sheikha-neural-governance',
    status: 'operational',
    root: root.status()
  });
});

router.post('/process', async (req, res) => {
  try {
    await root.ensureBooted();
    const result = root.process(req.body || {});
    const cellFlow = cells.execute(req.body || {});

    res.json({
      result,
      cells: cellFlow
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orchestrate', async (req, res) => {
  try {
    await root.ensureBooted();
    res.json({
      success: true,
      data: root.orchestrate(req.body || {}),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
