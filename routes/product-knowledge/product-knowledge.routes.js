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

const {
  registerProduct,
  getProductById,
  listProducts
} = require('../../core/product-knowledge/product-registry');
const { classifyProduct } = require('../../core/product-knowledge/product-classification-engine');
const { buildProductGraph } = require('../../core/product-knowledge/product-graph');
const { evaluateProductGovernance } = require('../../core/product-knowledge/product-governance-rules');
const { evaluateLifecycleTransition, applyLifecycleTransition } = require('../../core/product-knowledge/product-lifecycle-engine');
const { detectProductDuplicates } = require('../../core/product-knowledge/product-duplicate-detection');

const {
  recordProductAuditEvent,
  getProductAuditTrail,
  getProductVersionHistory,
  getProductVersionSnapshot
} = require('../../core/product-knowledge/product-audit-trail');
const {
  cleanPatch,
  createProductVersion
} = require('../../core/product-knowledge/product-versioning');

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






router.post('/duplicates/detect', (req, res) => {
  const result = detectProductDuplicates(req.body || {}, listProducts());

  res.json({
    success: true,
    data: result,
    message: 'Product duplicate detection completed'
  });
});


router.post('/lifecycle/evaluate', (req, res) => {
  const { currentState, nextState } = req.body || {};

  res.json({
    success: true,
    data: evaluateLifecycleTransition(currentState, nextState),
    message: 'Product lifecycle transition evaluated'
  });
});

router.post('/products/:id/lifecycle', (req, res) => {
  const current = getProductById(req.params.id);

  if (!current) {
    return res.status(404).json({
      success: false,
      error: 'PRODUCT_NOT_FOUND',
      id: req.params.id
    });
  }

  const { nextState, actor = 'system', reason = 'Lifecycle transition' } = req.body || {};
  const transition = applyLifecycleTransition(current, nextState);

  if (!transition.evaluation.allowed) {
    return res.status(422).json({
      success: false,
      data: transition.evaluation,
      message: 'Lifecycle transition blocked'
    });
  }

  const record = registerProduct(transition.record);

  recordProductAuditEvent({
    productId: record.id,
    action: `LIFECYCLE_${transition.evaluation.nextState}`,
    actor,
    before: current,
    after: record,
    reason
  });

  return res.json({
    success: true,
    data: {
      transition: transition.evaluation,
      record
    },
    message: 'Product lifecycle transitioned'
  });
});


router.post('/governance/evaluate', (req, res) => {
  res.json({
    success: true,
    data: evaluateProductGovernance(req.body || {}),
    message: 'Product governance evaluated'
  });
});


router.post('/decision', (req, res) => {
  try {
    if (typeof validateProduct !== 'function') throw new Error('VALIDATION_ENGINE_NOT_LOADED');
    if (typeof evaluateProductQuality !== 'function') throw new Error('QUALITY_ENGINE_NOT_LOADED');
    if (typeof evaluateProductPricing !== 'function') throw new Error('PRICING_ENGINE_NOT_LOADED');
    if (typeof evaluateProductStandards !== 'function') throw new Error('STANDARDS_ENGINE_NOT_LOADED');

    const product = req.body || {};
    console.log('[PRODUCT_DECISION]', JSON.stringify(product, null, 2));

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
    console.error('========== PRODUCT DECISION ==========');
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      error: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development'
        ? error.stack
        : undefined
    });
  }
});





router.get('/graph', (req, res) => {
  const graph = buildProductGraph(listProducts());

  res.json({
    success: true,
    data: graph,
    message: 'Enterprise product knowledge graph generated'
  });
});


router.get('/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const category = String(req.query.category || '').toLowerCase();

  const results = listProducts().filter((record) => {
    const haystack = [
      record.id,
      record.name,
      record.category,
      record.status,
      JSON.stringify(record.product || {})
    ].join(' ').toLowerCase();

    const matchesQuery = !q || haystack.includes(q);
    const matchesCategory = !category || String(record.category).toLowerCase() === category;

    return matchesQuery && matchesCategory;
  });

  res.json({
    success: true,
    data: {
      count: results.length,
      results
    },
    message: 'Product catalog searched'
  });
});


router.get('/products', (req, res) => {
  res.json({
    success: true,
    data: listProducts(),
    message: 'Products listed'
  });
});

router.post('/products', (req, res) => {
  const rawProduct = req.body || {};
  const force = rawProduct.force === true || req.query.force === 'true';

  const productPayload = cleanPatch(rawProduct);
  const duplicates = detectProductDuplicates(productPayload, listProducts());

  if (duplicates.duplicateSuspected && !force) {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_PRODUCT_SUSPECTED',
      data: duplicates,
      message: 'Duplicate product suspected. Use force=true to register anyway.'
    });
  }

  const record = registerProduct({
    ...productPayload,
    duplicateWarning: duplicates.duplicateSuspected ? duplicates : undefined
  });

  recordProductAuditEvent({
    productId: record.id,
    action: duplicates.duplicateSuspected ? 'CREATED_WITH_DUPLICATE_WARNING' : 'CREATED',
    actor: rawProduct?.actor || 'system',
    after: record,
    reason: duplicates.duplicateSuspected
      ? 'Product registered with duplicate warning'
      : 'Product registered'
  });

  return res.status(201).json({
    success: true,
    data: {
      record,
      duplicates
    },
    message: duplicates.duplicateSuspected
      ? 'Product registered with duplicate warning'
      : 'Product registered'
  });
});


router.patch('/products/:id', (req, res) => {
  const current = getProductById(req.params.id);

  if (!current) {
    return res.status(404).json({
      success: false,
      error: 'PRODUCT_NOT_FOUND',
      id: req.params.id
    });
  }

  const versionedProduct = createProductVersion(current, req.body || {});
  const record = registerProduct(versionedProduct);

  recordProductAuditEvent({
    productId: record.id,
    action: 'UPDATED',
    actor: req.body?.actor || 'system',
    before: current,
    after: record,
    reason: req.body?.reason || 'Product updated'
  });

  return res.json({
    success: true,
    data: record,
    message: 'Product updated with new version'
  });
});

router.get('/products/:id/audit', (req, res) => {
  res.json({
    success: true,
    data: getProductAuditTrail(req.params.id),
    message: 'Product audit trail'
  });
});

router.get('/products/:id/history', (req, res) => {
  res.json({
    success: true,
    data: getProductVersionHistory(req.params.id),
    message: 'Product version history'
  });
});

router.get('/products/:id/version/:version', (req, res) => {
  const snapshot = getProductVersionSnapshot(req.params.id, req.params.version);

  if (!snapshot) {
    return res.status(404).json({
      success: false,
      error: 'PRODUCT_VERSION_NOT_FOUND',
      id: req.params.id,
      version: req.params.version
    });
  }

  return res.json({
    success: true,
    data: snapshot,
    message: 'Product version snapshot'
  });
});


router.get('/products/:id', (req, res) => {
  const record = getProductById(req.params.id);
  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'PRODUCT_NOT_FOUND',
      id: req.params.id
    });
  }

  return res.json({
    success: true,
    data: record,
    message: 'Product found'
  });
});

router.post('/classify', (req, res) => {
  res.json({
    success: true,
    data: classifyProduct(req.body || {}),
    message: 'Product classified'
  });
});


module.exports = router;
