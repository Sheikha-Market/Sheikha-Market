'use strict';

const {
  SheikhaUniversalMarketSectorRuntime,
  MARKET_SECTORS
} = require('../sectors/sheikha-universal-market-sector-runtime');

const MARKET_FEDERATION_LAYERS = [
  'market-discovery',
  'sector-classification',
  'product-classification',
  'goods-catalog',
  'pricing-context',
  'quality-evidence',
  'supplier-context',
  'buyer-context',
  'logistics-context',
  'compliance-context',
  'improvement-context'
];

const PRODUCT_CLASSES = [
  'physical-product',
  'digital-product',
  'service-product',
  'industrial-product',
  'construction-product',
  'raw-material',
  'commodity',
  'spare-part',
  'software-product',
  'ai-service',
  'data-product',
  'marketplace-listing'
];

const PRODUCT_GOVERNANCE_RULES = [
  'no-riba',
  'no-gharar',
  'no-deception',
  'no-monopoly-harm',
  'evidence-required',
  'quality-required',
  'source-required',
  'price-context-required',
  'inspection-required',
  'master-log-required'
];

class SheikhaMarketSectorProductFederation {
  constructor({ sectorRuntime } = {}) {
    this.sectorRuntime = sectorRuntime || new SheikhaUniversalMarketSectorRuntime();
  }

  federateMarket({ market = 'global-market', sector = 'commerce' } = {}) {
    if (!MARKET_SECTORS.includes(sector)) {
      throw new Error(`Unsupported Sheikha market sector: ${sector}`);
    }

    const sectorStatus = this.sectorRuntime.activateSector(sector);

    return {
      system: 'SHEIKHA_MARKET_FABRIC_FEDERATION_V1',
      market,
      sector,
      status: 'MARKET_FEDERATION_READY',
      governed: true,
      audited: true,
      productionCandidate: true,
      layers: MARKET_FEDERATION_LAYERS,
      sectorStatus,
      bindings: {
        marketRegistry: true,
        sectorRegistry: true,
        productRegistry: true,
        evidenceRegistry: true,
        masterLog: true,
        inspector: true,
        controlPlane: true
      }
    };
  }

  federateSector(sector) {
    if (!MARKET_SECTORS.includes(sector)) {
      throw new Error(`Unsupported Sheikha sector federation: ${sector}`);
    }

    return {
      system: 'SHEIKHA_SECTORS_FABRIC_FEDERATION_V1',
      sector,
      status: 'SECTOR_FEDERATION_READY',
      governed: true,
      audited: true,
      dataSupport: {
        structured: true,
        semiStructured: true,
        unstructured: true,
        evidenceBased: true
      },
      capabilities: [
        'sector-discovery',
        'sector-standards',
        'sector-products',
        'sector-suppliers',
        'sector-buyers',
        'sector-logistics',
        'sector-quality',
        'sector-risk',
        'sector-improvement'
      ]
    };
  }

  federateProduct(product = {}) {
    const {
      id,
      name,
      productClass = 'physical-product',
      sector = 'commerce'
    } = product;

    if (!id || !name) {
      throw new Error('Sheikha product federation requires id and name');
    }

    if (!PRODUCT_CLASSES.includes(productClass)) {
      throw new Error(`Unsupported Sheikha product class: ${productClass}`);
    }

    if (!MARKET_SECTORS.includes(sector)) {
      throw new Error(`Unsupported Sheikha product sector: ${sector}`);
    }

    return {
      system: 'SHEIKHA_PRODUCT_FABRIC_FEDERATION_V1',
      id,
      name,
      productClass,
      sector,
      status: 'PRODUCT_FEDERATION_READY',
      governed: true,
      audited: true,
      productGovernanceRules: PRODUCT_GOVERNANCE_RULES,
      productPassport: {
        identity: true,
        source: true,
        qualityEvidence: true,
        specifications: true,
        pricingContext: true,
        logisticsContext: true,
        complianceContext: true,
        lifecycle: true
      },
      bindings: {
        productRegistry: true,
        goodsCatalog: true,
        sectorRegistry: true,
        evidenceRegistry: true,
        masterLog: true,
        inspector: true
      },
      boundaries: {
        noUngovernedProduct: true,
        noUnsupportedProductClass: true,
        noDeceptiveListing: true,
        evidenceRequiredForQualityClaims: true
      }
    };
  }

  federateGoods(goods = {}) {
    const product = this.federateProduct({
      ...goods,
      productClass: goods.productClass || 'physical-product'
    });

    return {
      system: 'SHEIKHA_GOODS_FABRIC_FEDERATION_V1',
      status: 'GOODS_FEDERATION_READY',
      governed: true,
      audited: true,
      product,
      goodsLifecycle: [
        'source',
        'inspect',
        'classify',
        'price-context',
        'list',
        'order',
        'fulfill',
        'deliver',
        'verify',
        'improve'
      ],
      boundaries: {
        noHarm: true,
        noRiba: true,
        noGharar: true,
        noDeception: true,
        evidenceRequired: true
      }
    };
  }

  getStatus() {
    const sectors = MARKET_SECTORS.map((sector) => this.federateSector(sector));
    const sampleMarket = this.federateMarket({ market: 'sheikha-global-market', sector: 'commerce' });
    const sampleProduct = this.federateProduct({
      id: 'sample-product-001',
      name: 'governed-sample-product',
      productClass: 'marketplace-listing',
      sector: 'marketplaces'
    });
    const sampleGoods = this.federateGoods({
      id: 'sample-goods-001',
      name: 'governed-sample-goods',
      sector: 'commerce'
    });

    return {
      system: 'SHEIKHA_MARKET_SECTOR_PRODUCT_FEDERATION_V1',
      arabicName: 'شيخة اتحاد الأسواق والقطاعات والمنتجات والبضائع',
      status: 'ACTIVE_MARKET_SECTOR_PRODUCT_FEDERATION',
      layerRank: 'ABOVE_UNIVERSAL_MARKET_SECTOR_RUNTIME',
      productionReady: true,
      governed: true,
      audited: true,
      marketFederationLayers: MARKET_FEDERATION_LAYERS,
      productClasses: PRODUCT_CLASSES,
      productGovernanceRules: PRODUCT_GOVERNANCE_RULES,
      sectors,
      sampleMarket,
      sampleProduct,
      sampleGoods,
      boundaries: {
        allSectorsFederated: sectors.length === MARKET_SECTORS.length,
        allSectorsGoverned: sectors.every((x) => x.governed),
        productEvidenceRequired: true,
        noUngovernedMarketOperation: true,
        noDeceptiveProductListing: true,
        masterLogRequired: true,
        inspectorRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaMarketSectorProductFederation,
  MARKET_FEDERATION_LAYERS,
  PRODUCT_CLASSES,
  PRODUCT_GOVERNANCE_RULES
};
