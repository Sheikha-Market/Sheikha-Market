'use strict';

const express = require('express');

const {
  DEFAULT_DATA_DIR,
  createLead,
  persistLead,
  createQuote,
  createOrder,
  createProformaPaymentRequest,
  status
} = require(
  '../../runtime/commercial-sales/v1/' +
  'sheikha-commercial-sales-service-v1'
);

const revenue = require(
  '../../runtime/commercial-revenue-closure/v1/' +
  'sheikha-commercial-revenue-closure-v1'
);

function buildRouter(options = {}) {
  const router = express.Router();

  const dataDir =
    options.dataDir ||
    process.env.SHEIKHA_COMMERCIAL_DATA_DIR ||
    DEFAULT_DATA_DIR;

  router.get('/status', (req, res) => {
    res.json({
      ...status(),
      routeMounted: true,
      paymentCaptureEnabled: false,
      officialTaxInvoiceEnabled: false
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
        deliverables: offer.deliverables
      }))
    });
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

  router.post('/orders', (req, res) => {
    const result = createOrder(req.body || {});

    return res
      .status(result.success ? 201 : 400)
      .json(result);
  });

  router.post('/proforma', (req, res) => {
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
