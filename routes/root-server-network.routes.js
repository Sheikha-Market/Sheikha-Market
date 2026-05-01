const express = require('express');
const router = express.Router();
const network = require('../lib/sheikha-root-server-neural-network');

router.get('/health', async (req, res) => {
  const result = await network.status();
  res.status(result.success ? 200 : 503).json(result);
});

module.exports = router;
