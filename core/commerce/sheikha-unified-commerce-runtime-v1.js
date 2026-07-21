'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  evaluateEvidenceDecision
} = require('../sheikha-logic/sheikha-logic-governance-engine-v1');
const {
  MARKET_SECTORS,
  SECTOR_CAPABILITIES
} = require(
  '../../runtime/sheikha-marketplace/sectors/' +
    'sheikha-universal-market-sector-runtime'
);

const ROOT = path.resolve(__dirname, '..', '..');

const FILES = Object.freeze({
  contract: 'runtime/commerce/v1/contracts/' +
    'sheikha-unified-commerce-runtime-v1-contract.json',
  commercialProducts: 'runtime/commercial-product-layer/v1/registries/' +
    'commercial-products-registry.json',
  customerProducts: 'runtime/customer-revenue-experience/v1/registries/' +
    'product-catalog.json',
  saasPlatform: 'runtime/saas-platform-layer-v1/v1/' +
    'sheikha-saas-platform-layer-v1.json',
  saasServices: 'runtime/saas-platform-layer-v1/v1/registries/' +
    'saas-services.json',
  saasRoles: 'runtime/saas-platform-layer-v1/v1/registries/' +
    'saas-roles.json',
  marketplace: 'runtime/marketplace-operating-system-v1/v1/' +
    'sheikha-marketplace-operating-system-v1.json',
  workflows: 'runtime/marketplace-operating-system-v1/v1/registries/' +
    'marketplace-workflows.json',
  supplyChain: 'runtime/supply-chain-control-tower-v2/v1/' +
    'sheikha-supply-chain-control-tower-v2.json',
  productRuntime: 'runtime/product-runtime/v1/' +
    'sheikha-unified-product-runtime-v1-report.json'
});

const SECTOR_LABELS = Object.freeze({
  commerce: 'التجارة',
  marketplaces: 'الأسواق',
  industry: 'الصناعة',
  construction: 'الإنشاءات',
  architecture: 'العمارة',
  energy: 'الطاقة',
  'oil-gas': 'النفط والغاز',
  electricity: 'الكهرباء',
  logistics: 'اللوجستيات',
  'supply-chain': 'سلاسل الإمداد',
  manufacturing: 'التصنيع',
  recycling: 'إعادة التدوير',
  metals: 'المعادن',
  'precious-metals': 'المعادن الثمينة',
  agriculture: 'الزراعة',
  food: 'الغذاء',
  healthcare: 'الصحة',
  education: 'التعليم',
  government: 'الجهات الحكومية',
  finance: 'المالية',
  'real-estate': 'العقار',
  transportation: 'النقل',
  telecom: 'الاتصالات',
  'cloud-saas': 'الخدمات السحابية SaaS',
  'ai-services': 'خدمات الذكاء الصناعي',
  cybersecurity: 'الأمن السيبراني',
  'media-without-living-beings': 'الإعلام غير المجسّد للأحياء',
  environment: 'البيئة',
  'smart-cities': 'المدن الذكية',
  'industrial-iot': 'إنترنت الأشياء الصناعي'
});

const MARKET_GROUPS = Object.freeze([
  {
    id: 'trade-markets',
    nameAr: 'التجارة والأسواق',
    benefitAr: 'وضوح العرض والطلب، مقارنة موثقة، وتبادل منظم بلا ادعاء سعر حي.',
    sectors: ['commerce', 'marketplaces', 'metals', 'precious-metals', 'finance']
  },
  {
    id: 'industry-built-environment',
    nameAr: 'الصناعة والعمران',
    benefitAr: 'ربط المادة والمصنع والمشروع والجودة في سجل تشغيلي واحد.',
    sectors: [
      'industry', 'manufacturing', 'construction', 'architecture',
      'recycling', 'real-estate'
    ]
  },
  {
    id: 'supply-logistics',
    nameAr: 'الإمداد واللوجستيات',
    benefitAr: 'تتبّع الطلب والمخزون والنقل والتسليم والأدلة عبر دورة موحدة.',
    sectors: ['logistics', 'supply-chain', 'transportation', 'industrial-iot']
  },
  {
    id: 'energy-environment',
    nameAr: 'الطاقة والبيئة',
    benefitAr: 'قياس الموارد والمخاطر والكفاءة والأثر قبل اعتماد القرار.',
    sectors: ['energy', 'oil-gas', 'electricity', 'environment']
  },
  {
    id: 'agriculture-food',
    nameAr: 'الزراعة والغذاء',
    benefitAr: 'تتبّع المصدر والجودة والتخزين والتوزيع وحفظ سلامة البيانات.',
    sectors: ['agriculture', 'food']
  },
  {
    id: 'public-human-services',
    nameAr: 'الخدمات العامة والإنسانية',
    benefitAr: 'تنظيم الخدمة والمعرفة والموافقات مع إبقاء القرار البشري مسؤولًا.',
    sectors: ['healthcare', 'education', 'government', 'smart-cities']
  },
  {
    id: 'digital-technology',
    nameAr: 'التقنية والاقتصاد الرقمي',
    benefitAr: 'تشغيل خدمات رقمية محكومة، قابلة للقياس والعزل والتدقيق.',
    sectors: [
      'telecom', 'cloud-saas', 'ai-services', 'cybersecurity',
      'media-without-living-beings'
    ]
  }
]);

const WORKFLOW_PRESENTATION = Object.freeze({
  SUPPLIER_ONBOARDING: ['تأهيل المورد', false],
  BUYER_ONBOARDING: ['تأهيل المشتري', false],
  PRODUCT_LISTING: ['إدراج المنتج', true],
  RFQ_CREATION: ['إنشاء طلب عرض سعر', false],
  QUOTATION_SUBMISSION: ['تقديم عرض السعر', true],
  NEGOTIATION: ['التفاوض', true],
  CONTRACT_GENERATION: ['إعداد العقد', true],
  ORDER_CREATION: ['إنشاء الطلب', true],
  SHIPMENT_TRACKING: ['تتبّع الشحنة', false],
  INVOICE_ISSUANCE: ['إصدار الفاتورة', true],
  PERFORMANCE_REVIEW: ['مراجعة الأداء', false],
  AUDIT_REVIEW: ['مراجعة التدقيق', true]
});

const PRODUCT_PRESENTATION = Object.freeze({
  'PROD-GOV-001': {
    nameAr: 'محرك شيخة للحوكمة',
    summaryAr: 'يحكم قرارات الذكاء والمراجعة والدمج والتشغيل والسياسات وفق الأدلة والموافقات.',
    primarySector: 'government',
    targetSectors: ['government', 'commerce', 'cybersecurity']
  },
  'PROD-STAB-001': {
    nameAr: 'محرك شيخة للاستقرار',
    summaryAr: 'يقيس الاستقرار ويمنع الانحراف ويفرض الاختبارات وبوابات الجودة.',
    primarySector: 'cloud-saas',
    targetSectors: ['cloud-saas', 'ai-services', 'cybersecurity']
  },
  'PROD-DEC-001': {
    nameAr: 'سجل شيخة للقرارات',
    summaryAr: 'يحوّل المعرفة المحكومة إلى قرارات قابلة للتتبع بالأدلة والقياسات.',
    primarySector: 'commerce',
    targetSectors: ['commerce', 'government', 'ai-services']
  },
  'PROD-CAP-001': {
    nameAr: 'سجل شيخة للقدرات',
    summaryAr: 'يسجل قدرات الذكاء والهندسة ويحكم صلاحيات تفعيلها واستخدامها.',
    primarySector: 'ai-services',
    targetSectors: ['ai-services', 'cloud-saas', 'industry']
  },
  'PROD-ENG-001': {
    nameAr: 'أدوات شيخة للمراجعة الهندسية',
    summaryAr: 'تساند مراجعة الشفرة والاستعداد للدمج والتحقق من العقود التشغيلية.',
    primarySector: 'cloud-saas',
    targetSectors: ['cloud-saas', 'ai-services', 'industry']
  },
  'PROD-AICL-001': {
    nameAr: 'نسيج شيخة لمسارات عناقيد الذكاء الصناعي',
    summaryAr: 'ينظم مسارات البيانات والنماذج والأدوات والنشر والرصد والوكلاء ضمن نطاق محكوم.',
    primarySector: 'ai-services',
    targetSectors: ['ai-services', 'cloud-saas', 'industry']
  },
  'PROD-UGITAI-001': {
    nameAr: 'مستوى شيخة للتحكم في الذكاء الصناعي',
    summaryAr: 'يوحد التحكم المحكوم في العناقيد والسحابة والبيانات والوكلاء وتحويل القدرات إلى منتجات.',
    primarySector: 'cloud-saas',
    targetSectors: ['cloud-saas', 'ai-services', 'commerce', 'supply-chain']
  },
  'PROD-SUPPLY-CHAIN': {
    nameAr: 'منصة شيخة لسلاسل الإمداد',
    primarySector: 'supply-chain',
    targetSectors: ['supply-chain', 'logistics', 'industry', 'manufacturing']
  },
  'PROD-ENERGY': {
    nameAr: 'ذكاء شيخة لسلاسل إمداد الطاقة',
    primarySector: 'energy',
    targetSectors: ['energy', 'oil-gas', 'electricity', 'government']
  },
  'PROD-MARKETPLACE': {
    nameAr: 'سوق شيخة الصناعي',
    primarySector: 'marketplaces',
    targetSectors: ['marketplaces', 'commerce', 'industry', 'metals']
  },
  'PROD-RIYADH-ALJANNAH': {
    nameAr: 'جنات وأشجار شيخة للمعرفة والابتكار',
    primarySector: 'education',
    targetSectors: ['education', 'agriculture', 'environment', 'ai-services']
  },
  'PROD-INNOVATION-LAB': {
    nameAr: 'مختبر شيخة لتحويل المسائل إلى منتجات',
    primarySector: 'industry',
    targetSectors: ['industry', 'education', 'ai-services', 'government']
  }
});

const ROLE_PRESENTATION = Object.freeze({
  owner: {
    nameAr: 'المالك',
    focus: ['المنتجات', 'القطاعات', 'المخاطر', 'القرارات']
  },
  operator: {
    nameAr: 'التشغيل',
    focus: ['الموافقات', 'الطلبات', 'الإمداد', 'التدقيق']
  },
  supplier: {
    nameAr: 'المورد',
    focus: ['الإدراج', 'طلبات الأسعار', 'العروض', 'الشحنات']
  },
  buyer: {
    nameAr: 'المشتري',
    focus: ['الاكتشاف', 'المقارنة', 'طلبات الأسعار', 'الطلبات']
  },
  governance: {
    nameAr: 'الحوكمة',
    focus: ['الأدلة', 'المراجعات', 'العقود', 'الأثر']
  }
});

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function localEvidence(id, source, verified, detail) {
  return {
    id,
    source,
    kind: 'LOCAL_REPOSITORY_EVIDENCE',
    verified: verified === true,
    supports: true,
    detail
  };
}

function marketGroupForSector(sector) {
  return MARKET_GROUPS.find((group) => group.sectors.includes(sector));
}

function pricingPolicy() {
  return {
    mode: 'REQUEST_QUOTE',
    amount: null,
    currency: null,
    livePriceClaimed: false
  };
}

function normalizeCommercialProduct(product) {
  const presentation = PRODUCT_PRESENTATION[product.id];
  return {
    id: product.id,
    nameAr: presentation.nameAr,
    nameEn: product.name,
    summaryAr: presentation.summaryAr,
    summaryEn: product.value,
    kind: 'COMMERCIAL_DIGITAL_PRODUCT',
    primarySector: presentation.primarySector,
    targetSectors: presentation.targetSectors,
    commercialModels: product.commercialModels,
    availability: product.sellable ? 'CATALOG_READY' : 'DISCOVERY_READY',
    salesAction: 'REQUEST_QUOTE',
    pricing: pricingPolicy(),
    evidence: product.evidence,
    source: FILES.commercialProducts,
    transactionReady: false,
    externalAccreditationClaimed: false
  };
}

function normalizeCustomerProduct(product) {
  const presentation = PRODUCT_PRESENTATION[product.id];
  return {
    id: product.id,
    nameAr: presentation.nameAr,
    nameEn: product.name,
    summaryAr: 'منتج مسجل للاستكشاف والتكامل وفق عقده التشغيلي.',
    kind: product.id === 'PROD-RIYADH-ALJANNAH'
      ? 'KNOWLEDGE_COMMUNITY_PRODUCT'
      : 'PLATFORM_PRODUCT',
    primarySector: presentation.primarySector,
    targetSectors: presentation.targetSectors,
    customerSegments: product.customerSegments,
    commercialModels: product.revenueModel,
    availability: 'DISCOVERY_READY',
    salesAction: product.id === 'PROD-RIYADH-ALJANNAH'
      ? 'EXPLORE_PRODUCT'
      : 'REQUEST_DISCOVERY',
    route: product.id === 'PROD-RIYADH-ALJANNAH'
      ? '/riyadh-aljannah-community/'
      : null,
    pricing: pricingPolicy(),
    evidence: [product.id, 'SHEIKHA_PRODUCT_CATALOG_V1'],
    source: FILES.customerProducts,
    transactionReady: false,
    externalAccreditationClaimed: false
  };
}

function buildCloudSaasProduct(services, roles) {
  return {
    id: 'PROD-CLOUD-SAAS',
    nameAr: 'خدمة شيخة السحابية SaaS',
    nameEn: 'Sheikha Cloud SaaS',
    summaryAr: 'مساحة تشغيل متعددة المستأجرين للسوق والإمداد والعمل والمعرفة.',
    kind: 'SAAS_PRODUCT',
    primarySector: 'cloud-saas',
    targetSectors: [...MARKET_SECTORS],
    commercialModels: ['SAAS_SUBSCRIPTION', 'ENTERPRISE', 'API'],
    availability: 'CATALOG_READY',
    salesAction: 'REQUEST_ACTIVATION',
    pricing: pricingPolicy(),
    services: [...services.services],
    roles: [...roles.roles],
    evidence: [services.registry, roles.registry, 'SHEIKHA_SAAS_PLATFORM_LAYER_V1'],
    source: FILES.saasPlatform,
    transactionReady: false,
    tenantProvisioningAutomatic: false,
    externalAccreditationClaimed: false
  };
}

function buildWorkflows(workflowRegistry) {
  return workflowRegistry.workflows.map((id, index) => {
    const presentation = WORKFLOW_PRESENTATION[id];
    return {
      id,
      order: index + 1,
      nameAr: presentation[0],
      highImpact: presentation[1],
      executionMode: 'PLAN_AND_HUMAN_GATE',
      source: FILES.workflows
    };
  });
}

function buildSectors(catalog) {
  return MARKET_SECTORS.map((id) => {
    const group = marketGroupForSector(id);
    return {
      id,
      nameAr: SECTOR_LABELS[id],
      groupId: group.id,
      groupNameAr: group.nameAr,
      benefitAr: group.benefitAr,
      status: 'CONTRACT_READY',
      productCount: catalog.filter((product) =>
        product.targetSectors.includes(id)
      ).length,
      capabilities: [...SECTOR_CAPABILITIES],
      liveConnectionClaimed: false
    };
  });
}

function buildUnifiedCommerceRuntime(options = {}) {
  const contract = readJson(FILES.contract);
  const commercialProducts = readJson(FILES.commercialProducts);
  const customerProducts = readJson(FILES.customerProducts);
  const saasPlatform = readJson(FILES.saasPlatform);
  const saasServices = readJson(FILES.saasServices);
  const saasRoles = readJson(FILES.saasRoles);
  const marketplace = readJson(FILES.marketplace);
  const workflowRegistry = readJson(FILES.workflows);
  const supplyChain = readJson(FILES.supplyChain);
  const productRuntime = readJson(FILES.productRuntime);

  const catalog = [
    ...commercialProducts.products.map(normalizeCommercialProduct),
    ...customerProducts.products.map(normalizeCustomerProduct),
    buildCloudSaasProduct(saasServices, saasRoles)
  ];
  const workflows = buildWorkflows(workflowRegistry);
  const sectors = buildSectors(catalog);
  const catalogIds = catalog.map((product) => product.id);
  const groupedSectors = MARKET_GROUPS.flatMap((group) => group.sectors);

  const evidenceDecision = evaluateEvidenceDecision({
    id: 'unified-commerce-local-evidence',
    proposition: 'The local commerce catalog and orchestration contracts are active.',
    evidence: [
      localEvidence('contract', FILES.contract, contract.status === 'ACTIVE_CONTRACT', contract.system),
      localEvidence(
        'commercial-products',
        FILES.commercialProducts,
        commercialProducts.status === 'ACTIVE',
        commercialProducts.registry
      ),
      localEvidence(
        'customer-products',
        FILES.customerProducts,
        customerProducts.status === 'ACTIVE',
        customerProducts.registry
      ),
      localEvidence('saas-platform', FILES.saasPlatform, saasPlatform.status === 'ACTIVE', saasPlatform.system),
      localEvidence('saas-services', FILES.saasServices, saasServices.status === 'ACTIVE', saasServices.registry),
      localEvidence('marketplace', FILES.marketplace, marketplace.status === 'ACTIVE', marketplace.system),
      localEvidence('workflows', FILES.workflows, workflowRegistry.status === 'ACTIVE', workflowRegistry.registry),
      localEvidence('supply-chain', FILES.supplyChain, supplyChain.status === 'ACTIVE', supplyChain.system),
      localEvidence('product-runtime', FILES.productRuntime, productRuntime.passed === true, productRuntime.status)
    ],
    requiredEvidenceIds: [
      'contract', 'commercial-products', 'customer-products', 'saas-platform',
      'saas-services', 'marketplace', 'workflows', 'supply-chain',
      'product-runtime'
    ],
    minimumEvidence: 9,
    noHarm: true
  });

  const checks = {
    localEvidenceVerified: evidenceDecision.verified,
    catalogNotEmpty: catalog.length > 0,
    catalogIdsUnique: new Set(catalogIds).size === catalogIds.length,
    cloudSaasPresent: catalog.some((product) =>
      product.id === 'PROD-CLOUD-SAAS' && product.services.length > 0
    ),
    gardensPresent: catalog.some((product) =>
      product.id === 'PROD-RIYADH-ALJANNAH'
    ),
    allSectorsMapped: sectors.length === MARKET_SECTORS.length &&
      sectors.every((sector) => sector.nameAr && sector.groupId),
    sectorGroupsExact: groupedSectors.length === MARKET_SECTORS.length &&
      new Set(groupedSectors).size === MARKET_SECTORS.length &&
      MARKET_SECTORS.every((sector) => groupedSectors.includes(sector)),
    workflowsMapped: workflows.length === workflowRegistry.workflows.length &&
      workflows.every((workflow) => workflow.nameAr),
    pricesAreBounded: catalog.every((product) =>
      product.pricing.mode === 'REQUEST_QUOTE' &&
      product.pricing.livePriceClaimed === false
    ),
    transactionsNotAutoExecuted: catalog.every((product) =>
      product.transactionReady === false
    ),
    defaultAuthorizationDeny:
      contract.governance.defaultAuthorization === 'DENY',
    noAutomatedFatwa: contract.governance.automatedFatwa === false,
    noExternalAccreditationClaim:
      contract.commercialPolicy.externalAccreditationClaimed === false
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);
  const passed = failedChecks.length === 0;

  return {
    schemaVersion: '1.0.0',
    system: contract.system,
    generatedAt: options.generatedAt || new Date().toISOString(),
    status: passed
      ? 'ACTIVE_WITH_GOVERNED_CATALOG'
      : 'REVIEW_REQUIRED',
    identity: contract.identity,
    routes: contract.routes,
    governance: contract.governance,
    catalog,
    sectors,
    marketGroups: MARKET_GROUPS,
    workflows,
    coverage: {
      products: catalog.length,
      catalogReady: catalog.filter((product) =>
        product.availability === 'CATALOG_READY'
      ).length,
      discoveryReady: catalog.filter((product) =>
        product.availability === 'DISCOVERY_READY'
      ).length,
      saasServices: saasServices.services.length,
      saasRoles: saasRoles.roles.length,
      sectors: sectors.length,
      marketGroups: MARKET_GROUPS.length,
      workflows: workflows.length
    },
    integration: {
      marketplace: marketplace.modules,
      supplyChain: supplyChain.modules,
      saas: saasPlatform.modules,
      productRuntimeStatus: productRuntime.status,
      commonFlow: contract.sharedOperationFlow
    },
    evidenceDecision,
    checks,
    failedChecks,
    passed,
    claimBoundary: {
      livePricesVerified: false,
      liveInventoryVerifiedByThisRuntime: false,
      transactionExecutionEnabled: false,
      paymentExecutionEnabled: false,
      externalAccreditationClaimed: false,
      automatedReligiousRuling: false,
      merchantListingsAreSeparateLiveFeed: true
    },
    sourceFiles: FILES,
    claimPolicy: contract.claimPolicy
  };
}

function listCommerceCatalog(filters = {}) {
  const runtime = buildUnifiedCommerceRuntime(filters.options);
  const search = String(filters.search || '').trim().toLowerCase();
  const sector = String(filters.sector || '').trim();
  const kind = String(filters.kind || '').trim().toUpperCase();
  let products = runtime.catalog;

  if (search) {
    products = products.filter((product) => [
      product.id,
      product.nameAr,
      product.nameEn,
      product.summaryAr
    ].join(' ').toLowerCase().includes(search));
  }
  if (sector) {
    products = products.filter((product) =>
      product.targetSectors.includes(sector)
    );
  }
  if (kind) {
    products = products.filter((product) => product.kind === kind);
  }

  return {
    products,
    count: products.length,
    filters: { search, sector, kind },
    claimBoundary: runtime.claimBoundary
  };
}

function buildCommerceDashboard(options = {}) {
  const runtime = buildUnifiedCommerceRuntime(options.runtimeOptions);
  const role = String(options.role || 'owner').toLowerCase();
  const sector = String(options.sector || 'all').toLowerCase();

  if (!ROLE_PRESENTATION[role]) {
    throw new Error(`Unsupported dashboard role: ${role}`);
  }
  if (sector !== 'all' && !MARKET_SECTORS.includes(sector)) {
    throw new Error(`Unsupported dashboard sector: ${sector}`);
  }

  const products = sector === 'all'
    ? runtime.catalog
    : runtime.catalog.filter((product) =>
      product.targetSectors.includes(sector)
    );
  const sectors = sector === 'all'
    ? runtime.sectors
    : runtime.sectors.filter((item) => item.id === sector);

  return {
    system: 'SHEIKHA_UNIFIED_COMMERCE_DASHBOARD_V1',
    generatedAt: options.generatedAt || new Date().toISOString(),
    status: runtime.passed ? 'ACTIVE' : 'REVIEW_REQUIRED',
    role: { id: role, ...ROLE_PRESENTATION[role] },
    selectedSector: sector,
    summary: {
      products: products.length,
      catalogReady: products.filter((product) =>
        product.availability === 'CATALOG_READY'
      ).length,
      saasServices: runtime.coverage.saasServices,
      sectors: sectors.length,
      workflows: runtime.workflows.length,
      liveTransactions: null,
      verifiedMerchantListings: null
    },
    dataState: {
      catalog: 'LOCAL_EVIDENCE_VERIFIED',
      liveTransactions: 'NOT_CONNECTED',
      verifiedMerchantListings: 'SEPARATE_LIVE_FEED',
      prices: 'REQUEST_QUOTE_ONLY'
    },
    products,
    sectors,
    marketGroups: runtime.marketGroups,
    workflows: runtime.workflows,
    integration: runtime.integration,
    governance: runtime.governance,
    claimBoundary: runtime.claimBoundary
  };
}

function buildCommerceOperationPlan(input = {}, options = {}) {
  const runtime = buildUnifiedCommerceRuntime(options.runtimeOptions);
  const sector = String(input.sector || '').trim().toLowerCase();
  const workflowId = String(input.workflow || '').trim().toUpperCase();
  const productId = String(input.productId || '').trim();
  const intent = String(input.intent || '').trim().slice(0, 500);
  const workflow = runtime.workflows.find((item) => item.id === workflowId);
  const product = productId
    ? runtime.catalog.find((item) => item.id === productId)
    : null;

  if (!MARKET_SECTORS.includes(sector)) {
    throw new Error(`Unsupported operation sector: ${sector || 'missing'}`);
  }
  if (!workflow) {
    throw new Error(`Unsupported operation workflow: ${workflowId || 'missing'}`);
  }
  if (productId && !product) {
    throw new Error(`Unsupported operation product: ${productId}`);
  }
  if (!intent) {
    throw new Error('Operation intent is required');
  }

  const evidence = [
    localEvidence('sector-contract', FILES.contract, true, sector),
    localEvidence('workflow-contract', FILES.workflows, true, workflow.id)
  ];
  const requiredEvidenceIds = ['sector-contract', 'workflow-contract'];
  if (product) {
    evidence.push(localEvidence('product-contract', product.source, true, product.id));
    requiredEvidenceIds.push('product-contract');
  }

  const decision = evaluateEvidenceDecision({
    id: `commerce-${workflow.id.toLowerCase()}`,
    proposition: `Create a bounded ${workflow.id} plan for ${sector}.`,
    evidence,
    requiredEvidenceIds,
    highImpact: workflow.highImpact,
    qualifiedHumanReview: false,
    noHarm: true
  });
  const generatedAt = options.generatedAt || new Date().toISOString();
  const planId = crypto.createHash('sha256')
    .update([sector, workflowId, productId, intent, generatedAt].join('|'))
    .digest('hex')
    .slice(0, 20);

  return {
    system: 'SHEIKHA_COMMERCE_OPERATION_PLAN_V1',
    planId: `SHEIKHA-COMMERCE-${planId}`,
    generatedAt,
    status: workflow.highImpact
      ? 'HUMAN_APPROVAL_REQUIRED'
      : 'PLAN_READY',
    sector: runtime.sectors.find((item) => item.id === sector),
    workflow,
    product: product ? {
      id: product.id,
      nameAr: product.nameAr,
      availability: product.availability
    } : null,
    intent,
    decision,
    execution: {
      requested: false,
      authorized: false,
      performed: false,
      mode: 'PLAN_ONLY'
    },
    nextSteps: workflow.highImpact
      ? ['مراجعة بشرية', 'التحقق من الأطراف والأدلة', 'اعتماد نطاق التنفيذ منفصلًا']
      : ['مراجعة الخطة', 'استكمال بيانات الطرف', 'طلب موافقة منفصلة عند الانتقال للتنفيذ'],
    boundaries: {
      noAutomaticContract: true,
      noAutomaticOrder: true,
      noAutomaticInvoice: true,
      noAutomaticPayment: true,
      noAutomatedReligiousRuling: true
    }
  };
}

module.exports = {
  FILES,
  MARKET_GROUPS,
  ROLE_PRESENTATION,
  SECTOR_LABELS,
  WORKFLOW_PRESENTATION,
  buildUnifiedCommerceRuntime,
  listCommerceCatalog,
  buildCommerceDashboard,
  buildCommerceOperationPlan
};
