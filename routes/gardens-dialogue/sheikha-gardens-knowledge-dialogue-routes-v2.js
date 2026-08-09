'use strict';

const express = require('express');

const {
  buildGardensCatalog,
  getGarden,
  buildProductGuide,
  buildSectorGuide,
  buildMarketGuide,
  buildKnowledgeCatalog,
  listThoughtFrameworks,
  listReligiousMethodReferences,
  getThoughtFramework,
  buildDialoguePlan,
  buildIdeaIntegrityAssessment,
  buildPurposefulIdeaDraft,
  buildCommunityFlourishingProgram,
  buildStatus
} = require(
  '../../core/gardens-dialogue/' +
    'sheikha-gardens-knowledge-dialogue-runtime-v2'
);

const router = express.Router();

router.use(express.json({
  limit: '32kb',
  strict: true,
  type: 'application/json'
}));

function sendRead(res, operation) {
  try {
    return res.json({ ok: true, data: operation() });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'GARDENS_KNOWLEDGE_EVIDENCE_UNAVAILABLE',
      message: error.message
    });
  }
}

function sendEntity(res, entity, errorCode, message) {
  if (!entity) {
    return res.status(404).json({
      ok: false,
      error: errorCode,
      message
    });
  }
  return res.json({ ok: true, data: entity });
}

router.get('/status', (_req, res) => {
  sendRead(res, buildStatus);
});

router.get('/catalog', (_req, res) => {
  sendRead(res, buildKnowledgeCatalog);
});

router.get('/gardens', (_req, res) => {
  sendRead(res, buildGardensCatalog);
});

router.get('/gardens/:id', (req, res) => {
  try {
    return sendEntity(
      res,
      getGarden(req.params.id),
      'GARDEN_NOT_FOUND',
      'الحديقة غير موجودة في السجل المحكوم.'
    );
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'GARDEN_EVIDENCE_UNAVAILABLE',
      message: error.message
    });
  }
});

router.get('/products', (_req, res) => {
  sendRead(res, () => {
    const catalog = buildKnowledgeCatalog();
    return {
      count: catalog.coverage.products,
      products: catalog.resources.products,
      guideTemplate: '/products/:id/guide',
      source: '/api/sheikha/commerce/v1/catalog'
    };
  });
});

router.get('/products/:id/guide', (req, res) => {
  try {
    return sendEntity(
      res,
      buildProductGuide(req.params.id),
      'PRODUCT_NOT_FOUND',
      'المنتج غير موجود في سجل المنتجات.'
    );
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'PRODUCT_GUIDE_UNAVAILABLE',
      message: error.message
    });
  }
});

router.get('/sectors', (_req, res) => {
  sendRead(res, () => {
    const catalog = buildKnowledgeCatalog();
    return {
      count: catalog.coverage.sectors,
      sectors: catalog.resources.sectors,
      guideTemplate: '/sectors/:id/guide',
      source: '/api/sheikha/commerce/v1/sectors'
    };
  });
});

router.get('/sectors/:id/guide', (req, res) => {
  try {
    return sendEntity(
      res,
      buildSectorGuide(req.params.id),
      'SECTOR_NOT_FOUND',
      'القطاع غير موجود في سجل القطاعات.'
    );
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'SECTOR_GUIDE_UNAVAILABLE',
      message: error.message
    });
  }
});

router.get('/markets', (_req, res) => {
  sendRead(res, () => {
    const catalog = buildKnowledgeCatalog();
    return {
      count: catalog.coverage.markets,
      markets: catalog.resources.markets,
      guideTemplate: '/markets/:id/guide',
      source: '/api/sheikha/commerce/v1/status'
    };
  });
});

router.get('/markets/:id/guide', (req, res) => {
  try {
    return sendEntity(
      res,
      buildMarketGuide(req.params.id),
      'MARKET_NOT_FOUND',
      'السوق غير موجود في سجل الأسواق.'
    );
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'MARKET_GUIDE_UNAVAILABLE',
      message: error.message
    });
  }
});

router.get('/thought-frameworks', (_req, res) => {
  sendRead(res, listThoughtFrameworks);
});

router.get('/thought-frameworks/:id', (req, res) => {
  try {
    return sendEntity(
      res,
      getThoughtFramework(req.params.id),
      'THOUGHT_FRAMEWORK_NOT_FOUND',
      'الإطار الفكري غير موجود في السجل المنهجي.'
    );
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: 'THOUGHT_FRAMEWORK_UNAVAILABLE',
      message: error.message
    });
  }
});

router.get('/religious-method/references', (_req, res) => {
  sendRead(res, listReligiousMethodReferences);
});

function sendGeneratedPlan(res, operation, unavailableCode) {
  try {
    const data = operation();
    const denied = data.status === 'SAFE_REDIRECTION_REQUIRED';
    return res.status(denied ? 422 : 200).json({
      ok: !denied,
      data
    });
  } catch (error) {
    const invalidInput = [
      'UNKNOWN_THOUGHT_FRAMEWORK',
      'INVALID_COMMUNITY_SCOPE',
      'IDEA_CHALLENGE_REQUIRED'
    ].includes(error.code);
    return res.status(invalidInput ? 400 : 503).json({
      ok: false,
      error: invalidInput ? error.code : unavailableCode,
      message: error.message
    });
  }
}

router.post('/dialogue/plan', (req, res) => {
  return sendGeneratedPlan(
    res,
    () => buildDialoguePlan(req.body || {}),
    'DIALOGUE_PLAN_UNAVAILABLE'
  );
});

router.post('/ideas/assess', (req, res) => {
  return sendGeneratedPlan(
    res,
    () => buildIdeaIntegrityAssessment(req.body || {}),
    'IDEA_ASSESSMENT_UNAVAILABLE'
  );
});

router.post('/ideas/synthesize', (req, res) => {
  return sendGeneratedPlan(
    res,
    () => buildPurposefulIdeaDraft(req.body || {}),
    'PURPOSEFUL_IDEA_DRAFT_UNAVAILABLE'
  );
});

router.post('/community/program', (req, res) => {
  return sendGeneratedPlan(
    res,
    () => buildCommunityFlourishingProgram(req.body || {}),
    'COMMUNITY_PROGRAM_UNAVAILABLE'
  );
});

module.exports = router;
