'use strict';

const express = require('express');
const router = express.Router();
const { buildIndex, searchIndex } = require('../runtime/rag/sheikha-rag-indexer-v1');

router.use(express.json({ limit: '5mb' }));

router.get('/api/sheikha/rag/status', (req, res) => {
  const index = buildIndex();
  res.json({
    success: true,
    status: 'ACTIVE',
    index: index.name,
    documentCount: index.documentCount,
    sources: index.sources,
    builtAt: index.builtAt
  });
});

router.post('/api/sheikha/rag/search', (req, res) => {
  res.json({
    success: true,
    query: req.body?.query || '',
    ...searchIndex(req.body?.query || '', req.body?.limit || 5)
  });
});

module.exports = router;
