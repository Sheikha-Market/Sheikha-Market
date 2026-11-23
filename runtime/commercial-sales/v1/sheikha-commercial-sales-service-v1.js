'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const revenue = require(
  '../../commercial-revenue-closure/v1/' +
  'sheikha-commercial-revenue-closure-v1'
);

const confidentiality = require(
  '../../confidentiality/v1/' +
  'sheikha-confidentiality-gate-v1'
);

const DEFAULT_DATA_DIR = path.join(
  os.homedir(),
  '.local',
  'share',
  'sheikha',
  'commercial-sales-v1'
);

function normalizeText(value, maxLength = 500) {
  return Array.from(String(value || ''))
    .map((character) => {
      const code = character.charCodeAt(0);

      return code <= 0x1f || code === 0x7f
        ? ' '
        : character;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value) {
  return normalizeText(value, 200).toLowerCase();
}

function normalizePhone(value) {
  return normalizeText(value, 40)
    .replace(/[^\d+]/g, '');
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');

  return digits.length >= 8 && digits.length <= 15;
}

function utcDateCode(date) {
  return date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
}

function createReference(prefix, input, options = {}) {
  const now = options.now instanceof Date
    ? options.now
    : new Date();

  const nonce = normalizeText(
    options.nonce || crypto.randomUUID(),
    100
  );

  const digest = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        prefix,
        input,
        timestamp: now.toISOString(),
        nonce
      })
    )
    .digest('hex')
    .slice(0, 10)
    .toUpperCase();

  return `${prefix}-${utcDateCode(now)}-${digest}`;
}

function validateOffer(offerId) {
  const offer = revenue.getOffer(offerId);

  if (!offer) {
    throw new Error('OFFER_NOT_FOUND');
  }

  return offer;
}

function createLead(input = {}, options = {}) {
  const name = normalizeText(input.name, 160);
  const company = normalizeText(input.company, 200);
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const need = normalizeText(input.need, 2000);
  const offerId = normalizeText(input.offerId, 120);
  const consent = input.consent === true;

  const offer = validateOffer(offerId);

  const errors = [];

  if (name.length < 2) {
    errors.push('NAME_REQUIRED');
  }

  if (!validEmail(email) && !validPhone(phone)) {
    errors.push('VALID_EMAIL_OR_PHONE_REQUIRED');
  }

  if (need.length < 10) {
    errors.push('NEED_DESCRIPTION_REQUIRED');
  }

  if (!consent) {
    errors.push('PRIVACY_CONSENT_REQUIRED');
  }

  if (errors.length) {
    return {
      success: false,
      errors
    };
  }

  const now = options.now instanceof Date
    ? options.now
    : new Date();

  const base = {
    name,
    company,
    email,
    phone,
    need,
    offerId,
    offerNameAr: offer.nameAr
  };

  const attribution = {
    campaignSource: normalizeText(input.campaignSource, 100),
    campaignMedium: normalizeText(input.campaignMedium, 100),
    campaignName: normalizeText(input.campaignName, 160),
    campaignContent: normalizeText(input.campaignContent, 160),
    referrer: normalizeText(input.referrer, 500),
    landingPage: normalizeText(input.landingPage, 500)
  };

  return {
    success: true,
    lead: {
      leadId: createReference(
        'LEAD',
        base,
        {
          now,
          nonce: options.nonce
        }
      ),
      ...base,
      attribution,
      stage: 'NEW',
      consentRecorded: true,
      source: normalizeText(
        input.source || 'WEBSITE_COMMERCIAL_V1',
        100
      ),
      createdAt: now.toISOString(),
      owner: 'Salman',
      paymentDataCollected: false,
      cardDataCollected: false,
      confidentiality: confidentiality.classifySubmission({
        now,
        rightsHolderId: normalizeText(
          input.rightsHolderId ||
          'SUBMITTING_CUSTOMER',
          160
        )
      })
    }
  };
}

function persistLead(lead, options = {}) {
  if (
    !lead ||
    typeof lead !== 'object' ||
    !lead.leadId
  ) {
    throw new Error('VALID_LEAD_REQUIRED');
  }

  const dataDir = path.resolve(
    options.dataDir || DEFAULT_DATA_DIR
  );

  fs.mkdirSync(dataDir, {
    recursive: true,
    mode: 0o700
  });

  fs.chmodSync(dataDir, 0o700);

  const file = path.join(dataDir, 'leads.jsonl');

  fs.appendFileSync(
    file,
    JSON.stringify(lead) + '\n',
    {
      encoding: 'utf8',
      mode: 0o600
    }
  );

  fs.chmodSync(file, 0o600);

  return {
    success: true,
    path: file,
    storedOutsideRepository:
      !file.startsWith(process.cwd() + path.sep)
  };
}

function persistPrivateRecord(record, fileName, options = {}) {
  if (!record || typeof record !== 'object' || !record.checkoutId) {
    throw new Error('VALID_CHECKOUT_RECORD_REQUIRED');
  }

  const dataDir = path.resolve(options.dataDir || DEFAULT_DATA_DIR);
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  fs.chmodSync(dataDir, 0o700);

  const safeFileName = String(fileName || 'checkouts.jsonl');
  if (!/^[a-z0-9-]+\.jsonl$/u.test(safeFileName)) {
    throw new Error('SAFE_RECORD_FILE_NAME_REQUIRED');
  }

  const file = path.join(dataDir, safeFileName);
  fs.appendFileSync(file, JSON.stringify(record) + '\n', {
    encoding: 'utf8',
    mode: 0o600
  });
  fs.chmodSync(file, 0o600);

  return { success: true, path: file };
}

function createQuote(input = {}, options = {}) {
  const offerId = normalizeText(input.offerId, 120);

  validateOffer(offerId);

  const vatApplicable = input.vatApplicable === true;

  const quote = revenue.calculateQuote({
    offerId,
    quantity: input.quantity,
    dealValueSar: input.dealValueSar,
    vatRate: vatApplicable ? 0.15 : 0
  });

  if (!quote.success) {
    return quote;
  }

  const now = options.now instanceof Date
    ? options.now
    : new Date();

  const validUntil = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  return {
    success: true,
    quote: {
      quoteId: createReference(
        'QUOTE',
        quote,
        {
          now,
          nonce: options.nonce
        }
      ),
      ...quote,
      status: 'DRAFT_REQUIRES_OWNER_APPROVAL',
      vatApplicable,
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
      officialInvoiceIssued: false,
      humanApprovalRequired: true
    }
  };
}

function createOrder(input = {}, options = {}) {
  const quote = input.quote;

  if (
    !quote ||
    typeof quote !== 'object' ||
    !quote.quoteId ||
    quote.success === false
  ) {
    return {
      success: false,
      errors: ['VALID_QUOTE_REQUIRED']
    };
  }

  const customerAcceptedScope =
    input.customerAcceptedScope === true;

  const ownerApproved =
    input.ownerApproved === true;

  const errors = [];

  if (!customerAcceptedScope) {
    errors.push('CUSTOMER_SCOPE_ACCEPTANCE_REQUIRED');
  }

  if (!ownerApproved) {
    errors.push('OWNER_APPROVAL_REQUIRED');
  }

  if (errors.length) {
    return {
      success: false,
      errors
    };
  }

  const now = options.now instanceof Date
    ? options.now
    : new Date();

  return {
    success: true,
    order: {
      orderId: createReference(
        'ORDER',
        quote,
        {
          now,
          nonce: options.nonce
        }
      ),
      quoteId: quote.quoteId,
      offerId: quote.offerId,
      offerNameAr: quote.offerNameAr,
      subtotalSar: quote.subtotalSar,
      vatSar: quote.vatSar,
      totalSar: quote.totalSar,
      currency: quote.currency,
      status: 'PENDING_SIGNATURE',
      customerAcceptedScope: true,
      ownerApproved: true,
      signedAgreement: false,
      createdAt: now.toISOString()
    }
  };
}

function createProformaPaymentRequest(
  input = {},
  options = {}
) {
  const order = input.order;

  if (
    !order ||
    typeof order !== 'object' ||
    !order.orderId
  ) {
    return {
      success: false,
      errors: ['VALID_ORDER_REQUIRED']
    };
  }

  const signedAgreement =
    input.signedAgreement === true;

  const invoiceRecipient = normalizeText(
    input.invoiceRecipient,
    200
  );

  const errors = [];

  if (!signedAgreement) {
    errors.push('SIGNED_AGREEMENT_REQUIRED');
  }

  if (invoiceRecipient.length < 2) {
    errors.push('INVOICE_RECIPIENT_REQUIRED');
  }

  if (errors.length) {
    return {
      success: false,
      errors
    };
  }

  const now = options.now instanceof Date
    ? options.now
    : new Date();

  const dueAt = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  return {
    success: true,
    document: {
      documentId: createReference(
        'PROFORMA',
        order,
        {
          now,
          nonce: options.nonce
        }
      ),
      documentType: 'PROFORMA_PAYMENT_REQUEST',
      titleAr: 'طلب دفع أولي',
      orderId: order.orderId,
      invoiceRecipient,
      subtotalSar: order.subtotalSar,
      vatSar: order.vatSar,
      totalSar: order.totalSar,
      currency: order.currency || 'SAR',
      issuedAt: now.toISOString(),
      dueAt: dueAt.toISOString(),
      officialTaxInvoice: false,
      officialTaxInvoiceIssued: false,
      paymentInstructionsStatus:
        'PENDING_VERIFIED_ACCOUNT_DETAILS',
      bankAccountPublished: false,
      cardDataRequested: false,
      revenueRecognized: false,
      noticeAr:
        'هذا طلب دفع أولي وليس فاتورة ضريبية نهائية.'
    }
  };
}

function checkoutOffer(offerId) {
  const offer = validateOffer(offerId);
  if (offer.status !== 'OFFERABLE_NOW' || offer.pricing?.type !== 'FIXED') {
    throw new Error('OFFER_REQUIRES_SCOPE_REVIEW');
  }
  if (typeof offer.pricing.amountSar !== 'number' || !Number.isFinite(offer.pricing.amountSar)
      || offer.pricing.amountSar <= 0 || offer.pricing.amountSar > 1_000_000_000) {
    throw new Error('INVALID_CATALOG_PRICE');
  }
  const policies = {};
  for (const name of ['terms', 'privacy', 'refund']) {
    const file = path.resolve(__dirname, '../../../public/commercial', `${name}.html`);
    policies[name] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  const snapshot = {
    offerId: offer.id,
    nameAr: offer.nameAr,
    deliverables: offer.deliverables,
    deliveryDays: offer.deliveryDays,
    paymentTerms: offer.paymentTerms,
    subtotalSar: offer.pricing.amountSar,
    vatSar: null,
    totalSar: null,
    amountDueNowSar: 0,
    currency: 'SAR',
    pricingStatus: 'ESTIMATE_PENDING_SELLER_AND_TAX_REVIEW',
    policies
  };
  return { ...snapshot, offerDigest: crypto.createHash('sha256')
    .update(JSON.stringify(snapshot)).digest('hex') };
}

function createSelfServiceCheckout(input = {}, options = {}) {
  const offerId = normalizeText(input.offerId, 120);
  const offer = validateOffer(offerId);
  const errors = [];

  if (offer.status !== 'OFFERABLE_NOW') {
    errors.push('OFFER_REQUIRES_SCOPE_REVIEW');
  }
  if (offer.pricing?.type !== 'FIXED') {
    errors.push('SELF_SERVICE_REQUIRES_FIXED_PRICE');
  }
  if (input.termsAccepted !== true) errors.push('TERMS_ACCEPTANCE_REQUIRED');
  if (input.privacyConsent !== true) errors.push('PRIVACY_CONSENT_REQUIRED');
  if (input.scopeAccepted !== true) errors.push('SCOPE_ACCEPTANCE_REQUIRED');
  if (input.paymentObligationAccepted !== true) {
    errors.push('PAYMENT_OBLIGATION_ACCEPTANCE_REQUIRED');
  }
  const snapshot = offer.status === 'OFFERABLE_NOW' && offer.pricing?.type === 'FIXED'
    ? checkoutOffer(offerId) : null;
  if (!snapshot || input.offerDigest !== snapshot.offerDigest) {
    errors.push('CURRENT_OFFER_AND_POLICIES_REQUIRED');
  }
  for (const field of ['vatApplicable', 'vatSar', 'totalSar', 'amount', 'ownerApproved',
    'paymentVerified', 'paymentCaptured', 'signedAgreement', 'customerDataTrainingConsent']) {
    if (Object.hasOwn(input, field)) errors.push('SERVER_CONTROLLED_FIELD_NOT_ALLOWED');
  }

  const leadResult = createLead({
    ...input,
    consent: input.privacyConsent,
    source: 'WEBSITE_SELF_SERVICE_CHECKOUT_V1'
  }, options);
  if (!leadResult.success) errors.push(...leadResult.errors);

  if (errors.length) {
    return {
      success: false,
      checkoutCreated: false,
      paymentCaptured: false,
      errors: [...new Set(errors)]
    };
  }

  const now = options.now instanceof Date ? options.now : new Date();
  const checkout = {
    checkoutId: createReference('CHECKOUT', {
      leadId: leadResult.lead.leadId,
      offerDigest: snapshot.offerDigest
    }, options),
    leadId: leadResult.lead.leadId,
    quote: snapshot,
    order: {
      orderId: createReference('REQUEST', { leadId: leadResult.lead.leadId }, options),
      status: 'REQUEST_RECORDED_AWAITING_SELLER_REVIEW',
      ownerApproved: false,
      signedAgreement: false,
      fulfillmentAuthorized: false
    },
    acceptance: {
      policyDigests: snapshot.policies,
      offerDigest: snapshot.offerDigest,
      termsAccepted: true,
      privacyConsent: true,
      scopeAccepted: true,
      paymentObligationAccepted: true,
      acceptedAt: now.toISOString()
    },
    payment: {
      captureEnabled: false,
      captured: false,
      nextAction: 'SELLER_SCOPE_TAX_AND_PAYMENT_REVIEW',
      cardDataRequested: false
    },
    customerDataTrainingAllowed: false,
    externalDisclosureAllowed: false,
    createdAt: now.toISOString()
  };

  return {
    success: true,
    checkoutCreated: true,
    paymentCaptured: false,
    lead: leadResult.lead,
    checkout
  };
}

function evaluateWebsiteSalesReadiness(input = {}) {
  const checks = {
    sellerIdentityConfigured:
      input.sellerIdentityConfigured === true,

    commercialRouteMounted:
      input.commercialRouteMounted === true,

    offerPagesPublished:
      input.offerPagesPublished === true,

    termsPublished:
      input.termsPublished === true,

    privacyPublished:
      input.privacyPublished === true,

    refundPolicyPublished:
      input.refundPolicyPublished === true,

    leadStorageWritable:
      input.leadStorageWritable === true,

    emailNotificationConfigured:
      input.emailNotificationConfigured === true,

    officialInvoiceProcessConfigured:
      input.officialInvoiceProcessConfigured === true,

    verifiedPaymentAccountConfigured:
      input.verifiedPaymentAccountConfigured === true
  };

  const blockers = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    readyForPublicSales: blockers.length === 0,
    readyForLocalAdmission:
      checks.offerPagesPublished &&
      checks.termsPublished &&
      checks.privacyPublished &&
      checks.refundPolicyPublished &&
      checks.leadStorageWritable,
    checks,
    blockers,
    defaultPolicy: 'DENY_BY_DEFAULT'
  };
}

function status() {
  const catalog = revenue.loadCatalog();

  return {
    success: true,
    system: 'SHEIKHA_COMMERCIAL_SALES_SERVICE_V1',
    status: 'PREPARED_FOR_SERVER_ROUTE_MOUNT',
    offersCount: catalog.offers.length,
    leadCaptureSupported: true,
    quoteGenerationSupported: true,
    orderGenerationSupported: true,
    proformaGenerationSupported: true,
    officialTaxInvoiceGenerationSupported: false,
    paymentCaptureSupported: false,
    cardDataCollectionAllowed: false,
    confidentialityDefaultDeny: true,
    customerDataTrainingAllowedByDefault: false,
    externalDisclosureAllowedByDefault: false,
    defaultDataDir: DEFAULT_DATA_DIR,
    humanApprovalRequired: true
  };
}

module.exports = {
  DEFAULT_DATA_DIR,
  normalizeText,
  createLead,
  persistLead,
  persistPrivateRecord,
  createQuote,
  createOrder,
  createProformaPaymentRequest,
  createSelfServiceCheckout,
  checkoutOffer,
  evaluateWebsiteSalesReadiness,
  status
};
