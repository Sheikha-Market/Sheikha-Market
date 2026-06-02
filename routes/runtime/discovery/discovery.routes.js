const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

router.get('/status', async (_req, res) => {

  const discoveryPath = path.join(
    process.cwd(),
    'runtime/runtime-discovery/engine-discovery.json'
  );

  const discovery = JSON.parse(
    fs.readFileSync(discoveryPath, 'utf8')
  );

  return res.json({
    success: true,
    ...discovery,
    timestamp: new Date().toISOString()
  });

});

module.exports = router;
