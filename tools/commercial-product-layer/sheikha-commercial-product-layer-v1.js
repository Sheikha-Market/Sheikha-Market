'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMMERCIAL_DIR = 'runtime/commercial-product-layer/v1';

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(relativePath, value) {
  fs.writeFileSync(resolvePath(relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function hasEntries(value) {
  return Array.isArray(value) && value.length > 0;
}

const mainRegistry = readJson(`${COMMERCIAL_DIR}/sheikha-commercial-product-layer-v1.json`);
const products = readJson(`${COMMERCIAL_DIR}/registries/commercial-products-registry.json`);
const readiness = readJson(`${COMMERCIAL_DIR}/registries/commercial-readiness-registry.json`);
const productSheets = readJson(`${COMMERCIAL_DIR}/registries/product-sheets-registry.json`);
const valueProof = readJson(`${COMMERCIAL_DIR}/registries/commercial-value-proof-registry.json`);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const productItems = products?.products || [];
const sheetItems = productSheets?.products || [];
const proofTargets = valueProof?.proofTargets || [];
const productIds = new Set(productItems.map((product) => product.id));
const sheetProductIds = new Set(sheetItems.map((sheet) => sheet.productId));

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistryV2: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  licensingEngineV1: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const fabricRoute = fabric?.routes?.find((route) => route.name === 'commercial-product-layer-v1');

const registryChecks = {
  mainRegistryActive: mainRegistry?.status === 'ACTIVE',
  productsRegistry: productItems.length >= 5,
  allProductsSellable: productItems.every((product) => product.sellable === true),
  allProductsHaveValue: productItems.every((product) => (
    Boolean(product.value) &&
    hasEntries(product.evidence) &&
    hasEntries(product.commercialModels)
  )),
  readinessRegistry: Boolean(readiness?.readinessCriteria),
  productSheetsRegistry: sheetItems.length >= productItems.length,
  productSheetsCoverProducts: productItems.every((product) => sheetProductIds.has(product.id)),
  allProductSheetsHaveDocsTestsKpis: sheetItems.every((sheet) => (
    productIds.has(sheet.productId) &&
    sheet.technicalDocumentation === true &&
    hasEntries(sheet.tests) &&
    hasEntries(sheet.kpis) &&
    hasEntries(sheet.licenseModels)
  )),
  valueProofRegistry: proofTargets.length >= 5,
  externalClaimsBlockedWithoutEvidence: proofTargets.every((proof) => proof.externalClaimAllowed === false),
  noFalsePartnershipClaim: readiness?.readinessCriteria?.noFalsePartnershipClaim === true,
  noFalseCustomerClaim: readiness?.readinessCriteria?.noFalseCustomerClaim === true,
  legalReviewRequired: readiness?.readinessCriteria?.externalLegalReviewRequired === true,
  signedContractRequired: readiness?.readinessCriteria?.signedContractRequiredBeforeActivation === true,
  truthfulnessPolicy: Boolean(
    mainRegistry?.commercial_truthfulness_policy?.official_partner_claim === false &&
    mainRegistry?.commercial_truthfulness_policy?.official_customer_claim === false &&
    mainRegistry?.commercial_truthfulness_policy?.external_sale_requires_legal_review === true &&
    mainRegistry?.commercial_truthfulness_policy?.external_license_requires_signed_contract === true
  ),
  licensingEngineGated: mainRegistry?.next_layer === 'SHEIKHA_LICENSING_ENGINE_V1',
  fabricRouteMounted: Boolean(
    fabricRoute &&
    fabricRoute.mount === '/api/commercial/product-layer' &&
    fabricRoute.module === 'routes/commercial-product-layer/status.routes.js'
  )
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missingRegistryChecks = Object.entries(registryChecks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missing = [...missingDependencies, ...missingRegistryChecks];

const commercialModels = new Set(
  productItems.flatMap((product) => product.commercialModels || [])
);

const report = {
  system: 'SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_COMMERCIAL_PRODUCT_LAYER_GAPS' : 'COMMERCIAL_PRODUCT_LAYER_ACTIVE_100',
  commercialTruthfulness: {
    productPackagingOnly: true,
    partnerClaim: false,
    customerClaim: false,
    externalSaleRequiresLegalReview: true,
    externalLicenseRequiresSignedContract: true
  },
  dependencies,
  checks: registryChecks,
  registryChecks,
  missing,
  missingDependencies,
  missingRegistryChecks,
  coverage: {
    products: productItems.length,
    sellableProducts: productItems.filter((product) => product.sellable === true).length,
    productSheets: sheetItems.length,
    commercialModels: commercialModels.size,
    proofTargets: proofTargets.length,
    publicClaimsAllowed: proofTargets.filter((proof) => proof.externalClaimAllowed === true).length
  },
  nextActions: [
    'Activate Licensing Engine V1 only through legal review and signed contract workflow.',
    'Create customer-facing product sheets after legal and IP review.',
    'Measure product KPIs before making public performance claims.',
    'Do not claim OpenAI, any AI company, or any enterprise as a customer or partner without a signed agreement.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

fs.mkdirSync(resolvePath(COMMERCIAL_DIR), { recursive: true });

writeJson(`${COMMERCIAL_DIR}/sheikha-commercial-product-layer-v1-report.json`, report);

fs.writeFileSync(
  resolvePath(`${COMMERCIAL_DIR}/sheikha-commercial-product-layer-v1-report.md`),
  `# SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## الصدق التجاري
- تفعيل منتجات فقط: نعم
- ادعاء شراكة رسمية: لا
- ادعاء عميل رسمي: لا
- البيع الخارجي يتطلب مراجعة قانونية: نعم
- الترخيص الخارجي يتطلب عقدًا موقعًا: نعم

## التغطية
- المنتجات: ${report.coverage.products}
- المنتجات القابلة للبيع: ${report.coverage.sellableProducts}
- product sheets: ${report.coverage.productSheets}
- نماذج البيع: ${report.coverage.commercialModels}
- مؤشرات إثبات القيمة: ${report.coverage.proofTargets}
- ادعاءات عامة مسموحة بلا دليل: ${report.coverage.publicClaimsAllowed}

## الفحوص
${Object.entries(registryChecks).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## الاعتماديات
${Object.entries(dependencies).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## التالي
${report.nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
