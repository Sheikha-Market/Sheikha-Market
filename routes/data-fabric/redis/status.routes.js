const express = require('express');
const router = express.Router();

const {
  health
} = require('../../../lib/database/redis/redis-connection-manager');

router.get('/status', async (_req, res) => {
  const result = await health();

  res.status(result.success ? 200 : 503).json({
    success: result.success,
    fabric: 'SHEIKHA_REDIS_NEURAL_CACHE',
    provider: 'redis',
    data: result,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
