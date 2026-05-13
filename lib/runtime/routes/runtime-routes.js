const express = require('express');

function createRuntimeRouter(runtimeCore, observability) {
  const router = express.Router();

  router.get('/runtime', (req, res) => {
    res.json({
      success: true,
      runtime: runtimeCore,
      observability: observability.summary(),
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/observability/summary', (req, res) => {
    res.json({
      success: true,
      summary: observability.summary(),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = createRuntimeRouter;
