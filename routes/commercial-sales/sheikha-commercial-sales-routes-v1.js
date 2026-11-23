'use strict';

const express = require('express');
const {authenticate, requireAdmin} = require('../../middleware/auth');
const {buildFoundryCommercialPolicy, buildFoundryQuote} = require('../../core/foundry/sheikha-foundry-commercial-v1');
const {buildModelCompositionPlan} = require('../../runtime/sheikha-ai-governor/v1/sheikha-composite-model-v1');
const {buildTrainingResultIndex, reviewModelImprovement} = require('../../core/foundry/sheikha-foundry-evidence-v1');
const {buildByocPlan} = require('../../core/foundry/sheikha-byoc-plan-v1');
const {planReinvestment} = require('../../core/foundry/sheikha-reinvestment-v1');
const {compareTrainingSourcing, reviewTrainingExit} = require('../../core/foundry/sheikha-training-sourcing-v1');
const {buildStorageCustodyPlan} = require('../../core/foundry/sheikha-storage-custody-plan-v1');
const {planFoundryCapacity} = require('../../core/foundry/sheikha-foundry-capacity-v1');
const {buildPlatformReleaseCompatibility} = require('../../core/governance/sheikha-firmware-uefi-secure-boot-integration-v1');
const {
  assessCommercialCase,
  recommendChannels
} = require('../../runtime/commercial-economics/v1/sheikha-smart-commercial-engine-v1');

const {
  DEFAULT_DATA_DIR,
  createLead,
  persistLead,
  createQuote,
  createOrder,
  createProformaPaymentRequest,
  createSelfServiceCheckout,
  checkoutOffer,
  status
} = require(
  '../../runtime/commercial-sales/v1/' +
  'sheikha-commercial-sales-service-v1'
);
const { persistCheckout, getReceipt } = require('../../runtime/commercial-sales/v1/sheikha-checkout-store-v1');

const revenue = require(
  '../../runtime/commercial-revenue-closure/v1/' +
  'sheikha-commercial-revenue-closure-v1'
);

const trainingFunding = require(
  '../../runtime/commercial-sales/v1/' +
  'sheikha-subscription-funded-training-v1'
);

const confidentiality = require(
  '../../runtime/confidentiality/v1/' +
  'sheikha-confidentiality-gate-v1'
);

function buildRouter(options = {}) {
  const router = express.Router();

  router.get('/foundry/policy', authenticate, requireAdmin, (req, res) => {
    res.set('Cache-Control', 'no-store').json(buildFoundryCommercialPolicy());
  });
  const foundryPreviews = {
    '/foundry/quotes/preview': buildFoundryQuote,
    '/foundry/composition/plan': buildModelCompositionPlan,
    '/foundry/training-results/index-preview': buildTrainingResultIndex,
    '/foundry/improvement/preview': reviewModelImprovement,
    '/foundry/byoc/plan': buildByocPlan,
    '/foundry/reinvestment/preview': planReinvestment,
    '/foundry/sourcing/preview': compareTrainingSourcing,
    '/foundry/exit/preview': reviewTrainingExit,
    '/foundry/storage/preview': buildStorageCustodyPlan,
    '/foundry/capacity/preview': planFoundryCapacity,
    '/foundry/platform-release/preview': buildPlatformReleaseCompatibility,
  };
  for (const [path, preview] of Object.entries(foundryPreviews)) {
    router.post(path, authenticate, requireAdmin, (req, res) => {
      res.set('Cache-Control', 'no-store');
      try {
        return res.json({success: true, data: preview(req.body)});
      } catch {
        return res.status(400).json({success: false, error: 'FOUNDRY_PREVIEW_INPUT_INVALID'});
      }
    });
  }

  const dataDir =
    options.dataDir ||
    process.env.SHEIKHA_COMMERCIAL_DATA_DIR ||
    DEFAULT_DATA_DIR;

  router.get('/status', (req, res) => {
    const publicStatus = status();
    delete publicStatus.defaultDataDir;
    res.json({
      ...publicStatus,
      status: 'LOCAL_ORDER_ADMISSION_PAYMENT_NOT_CONNECTED',
      routeMounted: true,
      publicOfferPageActive: true,
      leadCaptureActive: true,
      firstRevenuePathActive: false,
      commercialProductionReady: false,
      firstRevenuePath:
        'LEAD_TO_APPROVED_QUOTE_TO_SIGNED_ORDER_TO_PROFORMA_TO_VERIFIED_BANK_TRANSFER',
      paymentCaptureEnabled: false,
      paymentMode: 'NOT_CONNECTED',
      officialTaxInvoiceEnabled: false,
      officialTaxInvoiceRequirement:
        'SELLER_LEGAL_AND_TAX_IDENTITY_CONFIGURATION_REQUIRED'
    });
  });

  router.get('/offers', (req, res) => {
    const catalog = revenue.loadCatalog();

    res.json({
      success: true,
      currency: catalog.currency,
      offers: catalog.offers.map((offer) => ({
        id: offer.id,
        nameAr: offer.nameAr,
        status: offer.status,
        deliveryDays: offer.deliveryDays,
        pricing: offer.pricing,
        paymentTerms: offer.paymentTerms,
        licenseId: offer.licenseId || null,
        deliverables: offer.deliverables
      }))
    });
  });

  router.post('/economics/preview', (req, res) => {
    try {
      return res.json({
        success: true,
        assessment: assessCommercialCase(req.body || {}),
        recommendation: recommendChannels(req.body || {})
      });
    } catch (_error) {
      return res.status(400).json({
        success: false,
        error: 'COMMERCIAL_ECONOMICS_INPUT_INVALID'
      });
    }
  });

  router.get('/training-funding-policy', (req, res) => {
    res.json({
      success: true,
      ...trainingFunding.fundingPolicy()
    });
  });

  router.get('/confidentiality-policy', (req, res) => {
    res.json(confidentiality.status());
  });

  router.post('/confidentiality/decision', (req, res) => {
    const decision =
      confidentiality.evaluateConfidentialityAction(
        req.body || {},
        {
          // Public HTTP input can never self-assert a trusted signature.
          trustedAuthorizationVerification: false
        }
      );

    res.status(decision.allowed ? 200 : 403).json({
      success: decision.allowed,
      ...decision
    });
  });

  router.post('/training-budget-preview', (req, res) => {
    try {
      res.json({
        success: true,
        ...trainingFunding.allocateCollectedCash(req.body || {})
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  router.post('/leads', (req, res) => {
    try {
      const result = createLead(req.body || {});

      if (!result.success) {
        return res.status(400).json(result);
      }

      const persistence = persistLead(
        result.lead,
        { dataDir }
      );

      return res.status(201).json({
        success: true,
        leadId: result.lead.leadId,
        stage: result.lead.stage,
        stored: persistence.success,
        paymentDataCollected: false,
        confidentiality:
          result.lead.confidentiality.classification,
        modelTrainingAllowed: false,
        externalDisclosureAllowed: false,
        messageAr:
          'تم استلام الطلب وسيتم التواصل بعد المراجعة.'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'LEAD_CAPTURE_FAILED',
        messageAr:
          'تعذر تسجيل الطلب حاليًا.'
      });
    }
  });

  router.post('/self-service-checkouts', (req, res) => {
    try {
      const result = persistCheckout(req.body || {}, req.get('Idempotency-Key'), {
        dataDir, create: createSelfServiceCheckout
      });
      if (!result.success) return res.status(400).json(result);
      return res.status(result.replayed ? 200 : 201).json(result);
    } catch (error) {
      const validation = ['IDEMPOTENCY_KEY_REQUIRED', 'OFFER_NOT_FOUND'];
      const conflict = error.message === 'IDEMPOTENCY_CONFLICT';
      return res.status(conflict ? 409 : validation.includes(error.message) ? 400 : 503).json({
        success: false,
        error: conflict ? 'IDEMPOTENCY_CONFLICT' : validation.includes(error.message)
          ? error.message : 'CHECKOUT_STORAGE_UNAVAILABLE',
        paymentCaptured: false
      });
    }
  });

  router.get('/self-service-offers', (req, res) => {
    try {
      const offers = revenue.loadCatalog().offers
        .filter(offer => offer.status === 'OFFERABLE_NOW' && offer.pricing?.type === 'FIXED')
        .map(offer => checkoutOffer(offer.id));
      return res.json({ success: true, offers, previewOnly: options.previewOnly === true, paymentCaptureEnabled: false });
    } catch {
      return res.status(503).json({ success: false, error: 'OFFER_SNAPSHOT_UNAVAILABLE' });
    }
  });

  router.get('/receipts/:id', (req, res) => {
    try {
      const token = /^Bearer ([a-f0-9]{64})$/.exec(req.get('Authorization') || '')?.[1];
      const result = getReceipt(req.params.id, token, { dataDir });
      return result ? res.json(result) : res.status(404).json({ success: false, error: 'RECEIPT_NOT_FOUND' });
    } catch {
      return res.status(503).json({ success: false, error: 'RECEIPT_UNAVAILABLE' });
    }
  });

  router.post('/quotes', (req, res) => {
    try {
      const result = createQuote(req.body || {});

      return res
        .status(result.success ? 201 : 400)
        .json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  router.post('/orders', authenticate, requireAdmin, (req, res) => {
    const result = createOrder(req.body || {});

    return res
      .status(result.success ? 201 : 400)
      .json(result);
  });

  router.post('/proforma', authenticate, requireAdmin, (req, res) => {
    const result = createProformaPaymentRequest(
      req.body || {}
    );

    return res
      .status(result.success ? 201 : 400)
      .json(result);
  });

  return router;
}

module.exports = {
  buildRouter
};
