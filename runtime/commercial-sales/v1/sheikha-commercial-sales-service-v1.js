'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const revenue = require(
  '../../commercial-revenue-closure/v1/' +
  'sheikha-commercial-revenue-closure-v1'
);

const DEFAULT_DATA_DIR = path.join(
  os.homedir(),
  '.local',
  'share',
  'sheikha',
  'commercial-sales-v1'
);

function normalizeText(value, maxLength = 500) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
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
      stage: 'NEW',
      consentRecorded: true,
      source: normalizeText(
        input.source || 'WEBSITE_COMMERCIAL_V1',
        100
      ),
      createdAt: now.toISOString(),
      owner: 'Salman',
      paymentDataCollected: false,
      cardDataCollected: false
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
    defaultDataDir: DEFAULT_DATA_DIR,
    humanApprovalRequired: true
  };
}

module.exports = {
  DEFAULT_DATA_DIR,
  normalizeText,
  createLead,
  persistLead,
  createQuote,
  createOrder,
  createProformaPaymentRequest,
  evaluateWebsiteSalesReadiness,
  status
};
