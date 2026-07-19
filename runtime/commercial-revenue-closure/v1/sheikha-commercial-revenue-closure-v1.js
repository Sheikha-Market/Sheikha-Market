'use strict';

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.resolve(
  __dirname,
  '../../../commercial/revenue/v1/' +
    'sheikha-first-revenue-offers-v1.json'
);

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function loadCatalog() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(raw);

  if (
    !catalog ||
    catalog.system !== 'SHEIKHA_FIRST_REVENUE_OFFERS_V1' ||
    !Array.isArray(catalog.offers)
  ) {
    throw new Error('Invalid Sheikha revenue catalog');
  }

  return catalog;
}

function getOffer(offerId) {
  const catalog = loadCatalog();

  return (
    catalog.offers.find((offer) => offer.id === offerId) ||
    null
  );
}

function calculateQuote({
  offerId,
  quantity = 1,
  dealValueSar = 0,
  vatRate = 0
} = {}) {
  const offer = getOffer(offerId);

  if (!offer) {
    return {
      success: false,
      reason: 'OFFER_NOT_FOUND'
    };
  }

  const pricing = offer.pricing || {};
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  let subtotalSar = 0;

  if (pricing.type === 'FIXED') {
    subtotalSar =
      Number(pricing.amountSar || 0) * normalizedQuantity;
  } else if (pricing.type === 'SUCCESS_FEE') {
    const value = Number(dealValueSar || 0);

    if (!(value > 0)) {
      return {
        success: false,
        reason: 'DEAL_VALUE_REQUIRED',
        offer
      };
    }

    const calculated =
      value * (Number(pricing.rateBasisPoints || 0) / 10000);

    subtotalSar = Math.max(
      calculated,
      Number(pricing.minimumAmountSar || 0)
    );
  } else {
    return {
      success: false,
      reason: 'UNSUPPORTED_PRICING_TYPE',
      offer
    };
  }

  const normalizedVatRate = Math.max(
    0,
    Number(vatRate || 0)
  );

  const vatSar = roundMoney(
    subtotalSar * normalizedVatRate
  );

  subtotalSar = roundMoney(subtotalSar);

  return {
    success: true,
    currency: 'SAR',
    offerId: offer.id,
    offerNameAr: offer.nameAr,
    subtotalSar,
    vatRate: normalizedVatRate,
    vatSar,
    totalSar: roundMoney(subtotalSar + vatSar),
    taxPolicy:
      'VAT_APPLIED_ONLY_WHEN_LEGALLY_APPLICABLE',
    humanApprovalRequired: true
  };
}

function evaluateCheckoutReadiness(input = {}) {
  const checks = {
    sellerIdentityVerified:
      input.sellerIdentityVerified === true,

    offerApprovedByOwner:
      input.offerApprovedByOwner === true,

    termsPublished:
      input.termsPublished === true,

    privacyPolicyPublished:
      input.privacyPolicyPublished === true,

    refundPolicyPublished:
      input.refundPolicyPublished === true,

    invoiceProcessReady:
      input.invoiceProcessReady === true,

    paymentChannelVerified:
      input.paymentChannelVerified === true,

    customerDataProtectionReady:
      input.customerDataProtectionReady === true
  };

  const blockers = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    ready: blockers.length === 0,
    checks,
    blockers,
    policy: 'DENY_BY_DEFAULT'
  };
}

function evaluateRevenueRecognition(transaction = {}) {
  const checks = {
    signedAgreement:
      transaction.signedAgreement === true,

    invoiceIssued:
      transaction.invoiceIssued === true,

    paymentEvidenceVerified:
      transaction.paymentEvidenceVerified === true,

    serviceDelivered:
      transaction.serviceDelivered === true,

    customerAcceptanceRecorded:
      transaction.customerAcceptanceRecorded === true,

    noActiveRefund:
      transaction.activeRefund !== true,

    noActiveDispute:
      transaction.activeDispute !== true
  };

  const blockers = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  return {
    recognized: blockers.length === 0,
    checks,
    blockers,
    policy:
      'NO_REVENUE_CLAIM_WITHOUT_CONTRACT_INVOICE_PAYMENT_DELIVERY_ACCEPTANCE'
  };
}

function status() {
  const catalog = loadCatalog();

  return {
    success: true,
    system: 'SHEIKHA_COMMERCIAL_REVENUE_CLOSURE_V1',
    status: 'COMMERCIAL_PACKAGE_READY_FOR_CONTROLLED_SALE',
    offersCount: catalog.offers.length,
    offerableNowCount: catalog.offers.filter(
      (offer) => offer.status === 'OFFERABLE_NOW'
    ).length,
    primaryRevenuePath:
      'SERVICE_LED_REVENUE_BEFORE_FULL_SAAS_SCALE',
    paymentMode:
      'MANUAL_INVOICE_FIRST_GATEWAY_SECOND',
    accountingControl:
      'REVENUE_RECOGNITION_SEPARATED_FROM_PAYMENT_RECEIPT',
    authority: 'HUMAN_ONLY',
    defaultPolicy: 'DENY_BY_DEFAULT'
  };
}

module.exports = {
  loadCatalog,
  getOffer,
  calculateQuote,
  evaluateCheckoutReadiness,
  evaluateRevenueRecognition,
  status
};
