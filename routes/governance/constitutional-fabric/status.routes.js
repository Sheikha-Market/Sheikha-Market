const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/status', (_req, res) => {
  try {
    const file = path.join(
      process.cwd(),
      'runtime/governance/constitutional-fabric/sheikha-constitutional-fabric.json'
    );

    const fabric = JSON.parse(fs.readFileSync(file, 'utf8'));

    return res.json({
      success: true,
      ...fabric,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
