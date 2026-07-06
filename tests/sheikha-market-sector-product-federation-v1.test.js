'use strict';

const {
  SheikhaMarketSectorProductFederation,
  MARKET_FEDERATION_LAYERS,
  PRODUCT_CLASSES,
  PRODUCT_GOVERNANCE_RULES
} = require('../runtime/sheikha-marketplace/federation/sheikha-market-sector-product-federation');

test('activates market sector product and goods federation', () => {
  const federation = new SheikhaMarketSectorProductFederation();
  const status = federation.getStatus();

  expect(status.status).toBe('ACTIVE_MARKET_SECTOR_PRODUCT_FEDERATION');
  expect(status.layerRank).toBe('ABOVE_UNIVERSAL_MARKET_SECTOR_RUNTIME');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.marketFederationLayers).toEqual(MARKET_FEDERATION_LAYERS);
  expect(status.productClasses).toEqual(PRODUCT_CLASSES);
  expect(status.productGovernanceRules).toEqual(PRODUCT_GOVERNANCE_RULES);

  expect(status.sampleMarket.status).toBe('MARKET_FEDERATION_READY');
  expect(status.sampleProduct.status).toBe('PRODUCT_FEDERATION_READY');
  expect(status.sampleGoods.status).toBe('GOODS_FEDERATION_READY');

  expect(status.boundaries.allSectorsFederated).toBe(true);
  expect(status.boundaries.productEvidenceRequired).toBe(true);
  expect(status.boundaries.noDeceptiveProductListing).toBe(true);
});

test('federates governed product passport for any supported product class', () => {
  const federation = new SheikhaMarketSectorProductFederation();

  const product = federation.federateProduct({
    id: 'steel-001',
    name: 'steel-product',
    productClass: 'commodity',
    sector: 'metals'
  });

  expect(product.status).toBe('PRODUCT_FEDERATION_READY');
  expect(product.productClass).toBe('commodity');
  expect(product.productPassport.qualityEvidence).toBe(true);
  expect(product.bindings.productRegistry).toBe(true);
  expect(product.boundaries.evidenceRequiredForQualityClaims).toBe(true);
});

test('federates goods lifecycle with Islamic commercial boundaries', () => {
  const federation = new SheikhaMarketSectorProductFederation();

  const goods = federation.federateGoods({
    id: 'goods-001',
    name: 'market-goods',
    sector: 'commerce'
  });

  expect(goods.status).toBe('GOODS_FEDERATION_READY');
  expect(goods.goodsLifecycle).toContain('inspect');
  expect(goods.goodsLifecycle).toContain('verify');
  expect(goods.boundaries.noRiba).toBe(true);
  expect(goods.boundaries.noGharar).toBe(true);
  expect(goods.boundaries.noDeception).toBe(true);
});

test('rejects invalid product and sector definitions', () => {
  const federation = new SheikhaMarketSectorProductFederation();

  expect(() => federation.federateProduct({ id: 'missing-name' }))
    .toThrow('Sheikha product federation requires id and name');

  expect(() => federation.federateProduct({
    id: 'x',
    name: 'bad',
    productClass: 'unknown-class'
  })).toThrow('Unsupported Sheikha product class');

  expect(() => federation.federateSector('unknown-sector'))
    .toThrow('Unsupported Sheikha sector federation');
});
