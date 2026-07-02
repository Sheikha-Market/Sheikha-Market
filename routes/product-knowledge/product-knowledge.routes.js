'use strict';

const express = require('express');
const {
  getProductKnowledgeFabric,
  normalizeProduct,
  validateProduct
} = require('../../core/product-knowledge/product-knowledge-fabric');

const { evaluateProductQuality } = require('../../core/product-knowledge/product-quality-engine');
const { evaluateProductPricing } = require('../../core/product-knowledge/product-pricing-engine');
const { evaluateProductStandards } = require('../../core/product-knowledge/product-standards-engine');

const router = express.Router();

router.use(express.json({ limit: '2mb' }));
router.use(express.urlencoded({ extended: true }));

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
  try {
    const validation = validateProduct(req.body || {});
    return res.status(validation.valid ? 200 : 422).json({
      success: validation.valid,
      data: validation,
      message: validation.valid ? 'Product validation passed' : 'Product validation failed'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'PRODUCT_VALIDATION_ERROR',
      message: error.message
    });
  }
});


router.post('/quality', (req, res) => {
  res.json({
    success: true,
    data: evaluateProductQuality(req.body || {}),
    message: 'Product quality evaluated'
  });
});

router.post('/pricing', (req, res) => {
  res.json({
    success: true,
    data: evaluateProductPricing(req.body || {}),
    message: 'Product pricing evaluated'
  });
});

router.post('/standards', (req, res) => {
  res.json({
    success: true,
    data: evaluateProductStandards(req.body || {}),
    message: 'Product standards evaluated'
  });
});



router.post('/decision', (req, res) => {
  try {
    const product = req.body || {};
    const validation = validateProduct(product);
    const quality = evaluateProductQuality(product);
    const pricing = evaluateProductPricing(product);
    const standards = evaluateProductStandards(product);

    const approved =
      validation.valid === true &&
      quality.passed === true &&
      pricing.pricingValid === true &&
      standards.standardsValid === true;

    return res.json({
      success: true,
      data: {
        finalDecision: approved ? 'APPROVED' : 'REVIEW_REQUIRED',
        validation,
        quality,
        pricing,
        standards
      },
      message: 'Product decision evaluated'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'PRODUCT_DECISION_ERROR',
      message: error.message
    });
  }
});


module.exports = router;
