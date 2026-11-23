'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const sales = require(
  '../runtime/commercial-sales/v1/' +
  'sheikha-commercial-sales-service-v1'
);

const FIXED_NOW = new Date(
  '2026-07-19T01:00:00.000Z'
);

test('reports commercial sales capabilities', () => {
  const result = sales.status();

  assert.equal(result.success, true);
  assert.equal(result.offersCount, 11);
  assert.equal(result.leadCaptureSupported, true);
  assert.equal(
    result.officialTaxInvoiceGenerationSupported,
    false
  );
  assert.equal(result.paymentCaptureSupported, false);
});

test('offers low-entry chat pilots without automatic renewal', () => {
  const revenue = require('../runtime/commercial-revenue-closure/v1/sheikha-commercial-revenue-closure-v1');
  const professional = revenue.getOffer('SHEIKHA_CHAT_PRO_PILOT_V1');
  const business = revenue.getOffer('SHEIKHA_CHAT_BUSINESS_PILOT_V1');

  assert.equal(professional.pricing.amountSar, 299);
  assert.equal(business.pricing.amountSar, 1500);
  assert.match(professional.paymentTerms, /NO_AUTOMATIC_RENEWAL/);
  assert.match(business.paymentTerms, /NO_AUTOMATIC_RENEWAL/);
});

test('visual offers retain their governed license identifier', () => {
  const offer = require('../runtime/commercial-revenue-closure/v1/sheikha-commercial-revenue-closure-v1')
    .getOffer('SHEIKHA_VISUAL_PROVENANCE_PACK_V1');
  assert.equal(offer.licenseId, 'SHEIKHA-VISUAL-GOVERNED-USE-1.0');
});

test('creates a valid website lead', () => {
  const result = sales.createLead(
    {
      name: 'عميل تجريبي',
      company: 'شركة تجريبية',
      email: 'buyer@example.com',
      phone: '',
      offerId:
        'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
      need:
        'نحتاج تشخيص اختناقات سلسلة الإمداد الحالية.',
      consent: true,
      campaignSource: 'linkedin',
      campaignMedium: 'outbound',
      campaignName: 'first-10-customers',
      referrer: 'https://www.linkedin.com/',
      landingPage:
        'https://www.sheikha.top/commercial/request.html'
    },
    {
      now: FIXED_NOW,
      nonce: 'lead-test'
    }
  );

  assert.equal(result.success, true);
  assert.match(
    result.lead.leadId,
    /^LEAD-20260719-[A-F0-9]{10}$/
  );
  assert.equal(
    result.lead.paymentDataCollected,
    false
  );
  assert.equal(result.lead.cardDataCollected, false);
  assert.equal(
    result.lead.confidentiality.classification,
    'CONFIDENTIAL_RESTRICTED'
  );
  assert.equal(
    result.lead.confidentiality.modelTrainingAllowed,
    false
  );
  assert.equal(
    result.lead.confidentiality.externalDisclosureAllowed,
    false
  );
  assert.equal(
    result.lead.confidentiality.publicDisclosureAllowed,
    false
  );
  assert.deepEqual(result.lead.attribution, {
    campaignSource: 'linkedin',
    campaignMedium: 'outbound',
    campaignName: 'first-10-customers',
    campaignContent: '',
    referrer: 'https://www.linkedin.com/',
    landingPage:
      'https://www.sheikha.top/commercial/request.html'
  });
});

test('rejects lead without contact or consent', () => {
  const result = sales.createLead({
    name: 'عميل',
    offerId:
      'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
    need: 'تفاصيل حاجة تشغيلية واضحة.',
    consent: false
  });

  assert.equal(result.success, false);
  assert.ok(
    result.errors.includes(
      'VALID_EMAIL_OR_PHONE_REQUIRED'
    )
  );
  assert.ok(
    result.errors.includes(
      'PRIVACY_CONSENT_REQUIRED'
    )
  );
});

test('persists lead outside repository with private mode', () => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'sheikha-lead-test-')
  );

  try {
    const leadResult = sales.createLead(
      {
        name: 'عميل حفظ',
        email: 'lead@example.com',
        offerId:
          'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
        need:
          'نحتاج تقرير تشخيصي لسلسلة الإمداد.',
        consent: true
      },
      {
        now: FIXED_NOW,
        nonce: 'persist-test'
      }
    );

    const stored = sales.persistLead(
      leadResult.lead,
      { dataDir: tempDir }
    );

    assert.equal(stored.success, true);
    assert.equal(fs.existsSync(stored.path), true);

    const mode =
      fs.statSync(stored.path).mode & 0o777;

    assert.equal(mode, 0o600);

    const lines = fs
      .readFileSync(stored.path, 'utf8')
      .trim()
      .split('\n');

    assert.equal(lines.length, 1);
  } finally {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });
  }
});

test('creates diagnostic quote without automatic VAT', () => {
  const result = sales.createQuote(
    {
      offerId:
        'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
      vatApplicable: false
    },
    {
      now: FIXED_NOW,
      nonce: 'quote-test'
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.quote.totalSar, 2500);
  assert.equal(result.quote.vatSar, 0);
  assert.equal(
    result.quote.officialInvoiceIssued,
    false
  );
});

test('applies VAT only when explicitly marked applicable', () => {
  const result = sales.createQuote(
    {
      offerId:
        'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
      vatApplicable: true
    },
    {
      now: FIXED_NOW,
      nonce: 'vat-test'
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.quote.totalSar, 2875);
  assert.equal(result.quote.vatSar, 375);
});

test('blocks order without both approvals', () => {
  const quoteResult = sales.createQuote(
    {
      offerId:
        'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1'
    },
    {
      now: FIXED_NOW,
      nonce: 'order-quote'
    }
  );

  const order = sales.createOrder({
    quote: quoteResult.quote,
    customerAcceptedScope: true,
    ownerApproved: false
  });

  assert.equal(order.success, false);
  assert.ok(
    order.errors.includes('OWNER_APPROVAL_REQUIRED')
  );
});

test('creates controlled order after approvals', () => {
  const quoteResult = sales.createQuote(
    {
      offerId:
        'SHEIKHA_ENERGY_SUPPLY_CHAIN_REPORT_V1'
    },
    {
      now: FIXED_NOW,
      nonce: 'approved-quote'
    }
  );

  const order = sales.createOrder(
    {
      quote: quoteResult.quote,
      customerAcceptedScope: true,
      ownerApproved: true
    },
    {
      now: FIXED_NOW,
      nonce: 'approved-order'
    }
  );

  assert.equal(order.success, true);
  assert.equal(order.order.totalSar, 7500);
  assert.equal(
    order.order.status,
    'PENDING_SIGNATURE'
  );
});

test('creates proforma only after signed agreement', () => {
  const order = {
    orderId: 'ORDER-20260719-1234567890',
    offerId:
      'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
    offerNameAr:
      'تشخيص سلسلة الإمداد التنفيذي',
    subtotalSar: 2500,
    vatSar: 0,
    totalSar: 2500,
    currency: 'SAR'
  };

  const blocked =
    sales.createProformaPaymentRequest({
      order,
      signedAgreement: false,
      invoiceRecipient: 'شركة العميل'
    });

  assert.equal(blocked.success, false);

  const result =
    sales.createProformaPaymentRequest(
      {
        order,
        signedAgreement: true,
        invoiceRecipient: 'شركة العميل'
      },
      {
        now: FIXED_NOW,
        nonce: 'proforma-test'
      }
    );

  assert.equal(result.success, true);
  assert.equal(
    result.document.documentType,
    'PROFORMA_PAYMENT_REQUEST'
  );
  assert.equal(
    result.document.officialTaxInvoice,
    false
  );
  assert.equal(
    result.document.bankAccountPublished,
    false
  );
  assert.equal(
    result.document.revenueRecognized,
    false
  );
});

test('creates a self-service request without approving its commercial terms', () => {
  const result = sales.createSelfServiceCheckout({
    name: 'عميل ذاتي',
    email: 'self@example.com',
    offerId: 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
    need: 'تشخيص سلسلة الإمداد ضمن النطاق المنشور.',
    scopeAccepted: true,
    termsAccepted: true,
    privacyConsent: true,
    paymentObligationAccepted: true,
    offerDigest: sales.checkoutOffer('SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1').offerDigest
  }, { now: FIXED_NOW, nonce: 'self-service' });

  assert.equal(result.success, true);
  assert.equal(result.checkout.quote.subtotalSar, 2500);
  assert.equal(result.checkout.quote.totalSar, null);
  assert.equal(result.checkout.order.ownerApproved, false);
  assert.equal(result.checkout.payment.captured, false);
  assert.equal(result.checkout.customerDataTrainingAllowed, false);
});

test('blocks self-service checkout for scoped offers and missing acceptance', () => {
  const result = sales.createSelfServiceCheckout({
    name: 'عميل ذاتي',
    email: 'self@example.com',
    offerId: 'SHEIKHA_ENTERPRISE_PILOT_30D_V1',
    need: 'تجربة مؤسسية تحتاج إلى تحديد نطاق.',
    privacyConsent: true
  });
  assert.equal(result.success, false);
  assert.ok(result.errors.includes('OFFER_REQUIRES_SCOPE_REVIEW'));
  assert.ok(result.errors.includes('TERMS_ACCEPTANCE_REQUIRED'));
});

test('public sales readiness denies incomplete setup', () => {
  const result =
    sales.evaluateWebsiteSalesReadiness({
      offerPagesPublished: true,
      termsPublished: true,
      privacyPublished: true,
      refundPolicyPublished: true,
      leadStorageWritable: true
    });

  assert.equal(result.readyForLocalAdmission, true);
  assert.equal(result.readyForPublicSales, false);
  assert.ok(
    result.blockers.includes(
      'commercialRouteMounted'
    )
  );
  assert.ok(
    result.blockers.includes(
      'verifiedPaymentAccountConfigured'
    )
  );
});
