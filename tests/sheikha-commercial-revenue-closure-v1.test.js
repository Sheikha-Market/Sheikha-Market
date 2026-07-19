'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const revenue = require(
  '../runtime/commercial-revenue-closure/v1/' +
    'sheikha-commercial-revenue-closure-v1'
);

test('loads four controlled commercial offers', () => {
  const catalog = revenue.loadCatalog();

  assert.equal(catalog.offers.length, 4);
  assert.equal(catalog.currency, 'SAR');
  assert.equal(
    catalog.governance.noAutomaticRevenueRecognition,
    true
  );
});

test('calculates diagnostic quote without automatic VAT', () => {
  const quote = revenue.calculateQuote({
    offerId: 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1'
  });

  assert.equal(quote.success, true);
  assert.equal(quote.subtotalSar, 2500);
  assert.equal(quote.vatSar, 0);
  assert.equal(quote.totalSar, 2500);
});

test('calculates VAT only when explicitly applicable', () => {
  const quote = revenue.calculateQuote({
    offerId: 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1',
    vatRate: 0.15
  });

  assert.equal(quote.success, true);
  assert.equal(quote.subtotalSar, 2500);
  assert.equal(quote.vatSar, 375);
  assert.equal(quote.totalSar, 2875);
});

test('enforces minimum marketplace success fee', () => {
  const quote = revenue.calculateQuote({
    offerId: 'SOOQ_SHEIKHA_DEAL_FACILITATION_V1',
    dealValueSar: 100000
  });

  assert.equal(quote.success, true);
  assert.equal(quote.subtotalSar, 1500);
});

test('blocks checkout when commercial controls are missing', () => {
  const result = revenue.evaluateCheckoutReadiness({
    sellerIdentityVerified: true
  });

  assert.equal(result.ready, false);
  assert.ok(result.blockers.includes('termsPublished'));
  assert.equal(result.policy, 'DENY_BY_DEFAULT');
});

test('allows checkout only after all controls pass', () => {
  const result = revenue.evaluateCheckoutReadiness({
    sellerIdentityVerified: true,
    offerApprovedByOwner: true,
    termsPublished: true,
    privacyPolicyPublished: true,
    refundPolicyPublished: true,
    invoiceProcessReady: true,
    paymentChannelVerified: true,
    customerDataProtectionReady: true
  });

  assert.equal(result.ready, true);
  assert.deepEqual(result.blockers, []);
});

test('does not recognize revenue from payment alone', () => {
  const result = revenue.evaluateRevenueRecognition({
    signedAgreement: true,
    invoiceIssued: true,
    paymentEvidenceVerified: true
  });

  assert.equal(result.recognized, false);
  assert.ok(result.blockers.includes('serviceDelivered'));
  assert.ok(
    result.blockers.includes('customerAcceptanceRecorded')
  );
});

test('recognizes revenue only after complete closure', () => {
  const result = revenue.evaluateRevenueRecognition({
    signedAgreement: true,
    invoiceIssued: true,
    paymentEvidenceVerified: true,
    serviceDelivered: true,
    customerAcceptanceRecorded: true,
    activeRefund: false,
    activeDispute: false
  });

  assert.equal(result.recognized, true);
  assert.deepEqual(result.blockers, []);
});

test('reports service-led commercial readiness', () => {
  const result = revenue.status();

  assert.equal(result.success, true);
  assert.equal(result.offersCount, 4);
  assert.equal(
    result.primaryRevenuePath,
    'SERVICE_LED_REVENUE_BEFORE_FULL_SAAS_SCALE'
  );
});
