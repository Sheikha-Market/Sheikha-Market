const express = require('express');
const router = express.Router();

router.post('/decision', async (req, res) => {

  try {

    const { workload = 'general' } =
      req.body || {};

    let engine = 'sqlserver';

    if (workload === 'cache') {
      engine = 'redis';
    }

    if (workload === 'document') {
      engine = 'mongodb';
    }

    if (workload === 'relational') {
      engine = 'postgresql';
    }

    return res.json({
      success: true,
      routing: 'SHEIKHA_NEURAL_ROUTING',
      workload,
      selectedEngine: engine,
      governance: 'required',
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
