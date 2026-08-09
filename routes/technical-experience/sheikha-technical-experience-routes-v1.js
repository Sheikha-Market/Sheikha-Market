'use strict';

const express = require('express');
const { optionalAuth } = require('../../middleware/auth');
const {
  buildArchitectureModel,
  buildTechnologyStatus,
  buildRuntimeTelemetry,
  buildProductPreview,
  listProductPreviews,
  buildProductDossier,
  resolveDocumentationEntitlement
} = require(
  '../../core/technical-experience/' +
  'sheikha-technical-experience-runtime-v1'
);

const router = express.Router();

function sendInputError(res, error) {
  const unsupported = /Unsupported knowledge level/.test(error.message);
  return res.status(unsupported ? 400 : 500).json({
    ok: false,
    error: unsupported ? 'INVALID_KNOWLEDGE_LEVEL' : 'TECHNICAL_EXPERIENCE_ERROR',
    message: error.message
  });
}

router.get('/status', (_req, res) => {
  res.json({ ok: true, data: buildTechnologyStatus() });
});

router.get('/telemetry', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, data: await buildRuntimeTelemetry() });
  } catch (error) {
    sendInputError(res, error);
  }
});

router.get('/architecture', (_req, res) => {
  res.json({ ok: true, data: buildArchitectureModel() });
});

router.get('/products', (req, res) => {
  try {
    const products = listProductPreviews({ level: req.query.level });
    res.json({ ok: true, data: { count: products.length, products } });
  } catch (error) {
    sendInputError(res, error);
  }
});

router.get('/products/:id/preview', (req, res) => {
  try {
    const preview = buildProductPreview(req.params.id, { level: req.query.level });
    if (!preview) {
      return res.status(404).json({
        ok: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'المنتج غير موجود في الكتالوج التقني.'
      });
    }
    return res.json({ ok: true, data: preview });
  } catch (error) {
    return sendInputError(res, error);
  }
});

router.get('/products/:id/entitlement', optionalAuth, (req, res) => {
  const entitlement = resolveDocumentationEntitlement({
    subjectId: req.user?.id,
    productId: req.params.id
  });
  res.status(entitlement.authorized ? 200 : 403).json({
    ok: entitlement.authorized,
    data: entitlement
  });
});

router.get('/products/:id/dossier', optionalAuth, (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        ok: false,
        error: 'AUTHENTICATED_SUBJECT_REQUIRED',
        message: 'يلزم تسجيل الدخول للتحقق من استحقاق الملف التقني.'
      });
    }

    const result = buildProductDossier(req.params.id, {
      subjectId: req.user.id,
      level: req.query.level
    });
    if (!result) {
      return res.status(404).json({
        ok: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'المنتج غير موجود في الكتالوج التقني.'
      });
    }
    if (!result.authorized) {
      return res.status(403).json({
        ok: false,
        error: result.entitlement.status,
        message: 'الملف الكامل يتطلب شراءً أو عقدًا موثقًا واستحقاقًا مسجلًا على الخادم.',
        data: { entitlement: result.entitlement }
      });
    }
    return res.json({ ok: true, data: result.dossier });
  } catch (error) {
    return sendInputError(res, error);
  }
});

module.exports = router;
