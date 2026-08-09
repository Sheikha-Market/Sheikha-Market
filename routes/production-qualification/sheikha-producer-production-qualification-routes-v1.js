'use strict';

const express = require('express');
const {
  authenticate,
  authorize
} = require('../../middleware/auth');
const {
  REQUIREMENTS,
  evaluateApplication,
  submitApplication,
  reviewApplication,
  issueInternalAuthorization,
  renewInternalAuthorization,
  suspendInternalAuthorization,
  authorizationIsEffective,
  applicationsRegistry,
  authorizationsRegistry,
  buildProductReadinessMatrix,
  buildQualificationStatus
} = require(
  '../../core/production-qualification/' +
  'sheikha-producer-production-qualification-v1'
);

const router = express.Router();

function statusCode(result) {
  if (result.ok === true || result.valid === true) return 200;
  if (/NOT_FOUND/.test(result.status || '')) return 404;
  if (/NOT_AUTHORIZED/.test(result.status || '')) return 403;
  if (/APPROVAL_REQUIRED/.test(result.status || '')) return 409;
  return 422;
}

function actor(req) {
  return {
    id: req.user?.id,
    role: req.user?.role
  };
}

router.get('/status', (_req, res) => {
  const data = buildQualificationStatus();
  res.set('Cache-Control', 'no-store');
  res.status(data.passed ? 200 : 503).json({
    ok: data.passed,
    data
  });
});

router.get('/requirements', (req, res) => {
  const family = String(req.query.family || '').trim().toUpperCase();
  const requirements = family
    ? REQUIREMENTS.filter((entry) => entry.family === family)
    : REQUIREMENTS;
  res.json({
    ok: true,
    data: {
      count: requirements.length,
      family: family || 'ALL',
      requirements,
      completionIsVerification: false,
      externalLicenseIssuedByThisEndpoint: false
    }
  });
});

router.get('/products', (_req, res) => {
  const products = buildProductReadinessMatrix();
  res.json({
    ok: true,
    data: {
      count: products.length,
      productionReadyCount:
        products.filter((entry) => entry.productionReady).length,
      products
    }
  });
});

router.get('/products/:id', (req, res) => {
  const product = buildProductReadinessMatrix()
    .find((entry) => entry.productId === req.params.id);
  if (!product) {
    return res.status(404).json({
      ok: false,
      error: 'PRODUCT_NOT_FOUND',
      message: 'المنتج غير مسجل في مصفوفة جاهزية الإنتاج.'
    });
  }
  return res.json({ ok: true, data: product });
});

router.post('/applications/evaluate', (req, res) => {
  const result = evaluateApplication(req.body || {});
  res.status(result.valid ? 200 : 422).json({
    ok: result.valid === true,
    data: result
  });
});

router.post(
  '/applications',
  authenticate,
  authorize('admin', 'operator', 'governance'),
  (req, res) => {
    const result = submitApplication(req.body || {}, actor(req));
    res.status(result.ok ? 201 : statusCode(result)).json({
      ok: result.ok === true,
      data: result
    });
  }
);

router.get(
  '/applications',
  authenticate,
  authorize('admin', 'operator', 'governance'),
  (_req, res) => {
    const registry = applicationsRegistry();
    const applications = registry.applications.map((application) => ({
      applicationId: application.applicationId,
      status: application.status,
      submittedAt: application.submittedAt,
      candidate: {
        id: application.candidate.id,
        legalName: application.candidate.legalName,
        jurisdiction: application.candidate.jurisdiction
      },
      product: application.product,
      assessment: application.assessment || null
    }));
    res.json({
      ok: true,
      data: {
        revision: registry.revision,
        count: applications.length,
        applications
      }
    });
  }
);

router.post(
  '/applications/:id/review',
  authenticate,
  authorize('admin', 'governance'),
  (req, res) => {
    const result = reviewApplication(
      req.params.id,
      req.body || {},
      actor(req)
    );
    res.status(statusCode(result)).json({
      ok: result.ok === true,
      data: result
    });
  }
);

router.post(
  '/applications/:id/authorize',
  authenticate,
  authorize('admin', 'governance'),
  (req, res) => {
    const result = issueInternalAuthorization(
      req.params.id,
      req.body || {},
      actor(req)
    );
    res.status(statusCode(result)).json({
      ok: result.ok === true,
      data: result
    });
  }
);

router.post(
  '/authorizations/:id/renew',
  authenticate,
  authorize('admin', 'governance'),
  (req, res) => {
    const result = renewInternalAuthorization(
      req.params.id,
      req.body || {},
      actor(req)
    );
    res.status(statusCode(result)).json({
      ok: result.ok === true,
      data: result
    });
  }
);

router.post(
  '/authorizations/:id/suspend',
  authenticate,
  authorize('admin', 'governance'),
  (req, res) => {
    const result = suspendInternalAuthorization(
      req.params.id,
      req.body || {},
      actor(req)
    );
    res.status(statusCode(result)).json({
      ok: result.ok === true,
      data: result
    });
  }
);

router.get(
  '/authorizations',
  authenticate,
  authorize('admin', 'governance'),
  (_req, res) => {
    const registry = authorizationsRegistry();
    res.json({
      ok: true,
      data: {
        revision: registry.revision,
        count: registry.authorizations.length,
        authorizations: registry.authorizations.map((entry) => ({
          ...entry,
          effective: authorizationIsEffective(entry)
        })),
        externalOfficialLicenses: 0
      }
    });
  }
);

module.exports = router;
