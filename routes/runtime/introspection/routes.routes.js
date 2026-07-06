const express = require('express');
const router = express.Router();

const {
  extractRoutes
} = require('../../../lib/runtime-introspection/runtime-route-inspector');

router.get('/routes', (req, res) => {
  const routes = extractRoutes(req.app);

  return res.json({
    success: true,
    total: routes.length,
    routes,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
