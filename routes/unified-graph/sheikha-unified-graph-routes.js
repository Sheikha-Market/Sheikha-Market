'use strict';

const express = require('express');
const router = express.Router();

const {
  loadUnifiedGraphFabric
} = require('../../runtime/unified-graph/sheikha-unified-graph-runtime');

router.get('/api/sheikha/unified-graph/v1/status', (_req, res) => {

  res.json({
    success: true,
    system: 'SHEIKHA_UNIFIED_GRAPH_FABRIC_V1',
    graph: loadUnifiedGraphFabric()
  });

});

module.exports = router;
