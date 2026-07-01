'use strict';

const express = require('express');
const {
  getProductKnowledgeFabric,
  normalizeProduct,
  validateProduct
} = require('../../core/product-knowledge/product-knowledge-fabric');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: getProductKnowledgeFabric(),
    message: 'Sheikha Product Knowledge Fabric is active'
  });
});

router.post('/normalize', (req, res) => {
  res.json({
    success: true,
    data: normalizeProduct(req.body || {}),
    message: 'Product normalized'
  });
});

router.post('/validate', (req, res) => {
  const validation = validateProduct(req.body || {});
  res.status(validation.valid ? 200 : 422).json({
    success: validation.valid,
    data: validation,
    message: validation.valid ? 'Product validation passed' : 'Product validation failed'
  });
});

module.exports = router;
