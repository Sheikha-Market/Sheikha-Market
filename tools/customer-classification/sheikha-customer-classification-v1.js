'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/customer-classification/v1';

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

function write(relativePath, content) {
  fs.mkdirSync(path.dirname(resolvePath(relativePath)), { recursive: true });
  fs.writeFileSync(resolvePath(relativePath), content);
}

function hasAll(items, required) {
  return Array.isArray(items) && required.every((item) => items.includes(item));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-customer-classification-v1.json`);
const taxonomy = readJson(`${RUNTIME_DIR}/registries/customer-taxonomy-registry.json`);
const strategicSegments = readJson(`${RUNTIME_DIR}/registries/strategic-segments-registry.json`);
const sectors = readJson(`${RUNTIME_DIR}/registries/sector-registry.json`);
const productValueMap = readJson(`${RUNTIME_DIR}/registries/product-value-map.json`);
const dashboardRouting = readJson(`${RUNTIME_DIR}/registries/dashboard-routing-map.json`);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const route = fabric?.routes?.find((item) => item.name === 'customer-classification-v1');

const requiredSegments = ['B2G', 'B2B', 'B2C', 'D2C', 'B2B2C', 'B2B2G', 'G2B'];
const requiredTypes = [
  'GOVERNMENT_ENTITY',
  'MINISTRY',
  'MUNICIPALITY',
  'PUBLIC_COMPANY',
  'PRIVATE_COMPANY',
  'FACTORY',
  'SUPPLIER',
  'BUYER',
  'TRADER',
  'BROKER',
  'LOGISTICS_PROVIDER',
  'RECYCLING_COMPANY',
  'CONTRACTOR',
  'CONSULTANT',
  'INDIVIDUAL_CUSTOMER'
];
const requiredModels = [
  'SCRAP_TRADING',
  'METALS_TRADING',
  'INDUSTRIAL_SUPPLY',
  'GOVERNANCE_PLATFORM',
  'AI_SERVICE',
  'API_LICENSE',
  'ENTERPRISE_LICENSE',
  'MARKETPLACE',
  'LOGISTICS_SERVICE',
  'CONSULTING_SERVICE',
  'RECYCLING_SERVICE'
];
const requiredRoles = [
  'OWNER',
  'ADMIN',
  'SUPPLIER',
  'BUYER',
  'CUSTOMER',
  'PROVIDER',
  'PARTNER',
  'RESELLER',
  'INVESTOR',
  'GOVERNANCE_REVIEWER',
  'FINANCE_USER',
  'CONTRACT_USER'
];
const requiredVerification = [
  'UNVERIFIED',
  'EMAIL_VERIFIED',
  'PHONE_VERIFIED',
  'COMMERCIAL_RECORD_VERIFIED',
  'VAT_VERIFIED',
  'BANK_VERIFIED',
  'CONTRACT_VERIFIED',
  'APPROVED_CUSTOMER',
  'APPROVED_SUPPLIER',
  'STRATEGIC_PARTNER'
];
const requiredPriorities = [
  'LEAD',
  'QUALIFIED_LEAD',
  'OPPORTUNITY',
  'NEGOTIATION',
  'CONTRACT_READY',
  'ACTIVE_CUSTOMER',
  'ACTIVE_SUPPLIER',
  'REVENUE_CUSTOMER',
  'HIGH_VALUE_ACCOUNT',
  'STRATEGIC_ACCOUNT'
];
const requiredSectorCodes = [
  'GOV',
  'ECON',
  'TRADE',
  'SCM',
  'LOG',
  'IND',
  'ENERGY',
  'MINING',
  'COM',
  'SPACE',
  'AI',
  'DATA'
];

const strategicSegmentCodes = (strategicSegments?.segments || []).map((segment) => segment.code);
const sectorCodes = (sectors?.sectors || []).map((sector) => sector.code);
const dashboardRoutes = dashboardRouting?.routes || [];

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  flowComplete: hasAll(registry?.classification_flow, [
    'customer_segment',
    'customer_type',
    'business_model',
    'role',
    'verification_level',
    'commercial_priority',
    'sector',
    'dashboard_route',
    'contract_gate',
    'billing_gate'
  ]),
  taxonomyActive: taxonomy?.status === 'ACTIVE',
  customerSegmentsComplete: hasAll(taxonomy?.customerSegments, requiredSegments),
  customerTypesComplete: hasAll(taxonomy?.customerTypes, requiredTypes),
  businessModelsComplete: hasAll(taxonomy?.businessModels, requiredModels),
  rolesComplete: hasAll(taxonomy?.roles, requiredRoles),
  verificationComplete: hasAll(taxonomy?.verificationLevels, requiredVerification),
  prioritiesComplete: hasAll(taxonomy?.commercialPriorities, requiredPriorities),
  strategicSegmentsComplete: hasAll(strategicSegmentCodes, ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']),
  strategicAccessChannelsMapped: (strategicSegments?.segments || []).every((segment) =>
    Boolean(segment.accessChannel && segment.dashboard)
  ),
  sectorsComplete: hasAll(sectorCodes, requiredSectorCodes),
  productFamiliesMapped: (productValueMap?.productFamilies || []).length >= 6,
  valueTypesMapped: hasAll(productValueMap?.valueTypes, [
    'REGULATION',
    'OVERSIGHT',
    'GOVERNANCE',
    'OPERATIONS',
    'ANALYSIS',
    'TRADE',
    'ADVISORY',
    'LICENSING',
    'DATA',
    'AI',
    'AUTOMATION'
  ]),
  revenueStreamsMapped: (productValueMap?.revenueStreams || []).length >= 10,
  dashboardRoutingMapped: dashboardRoutes.length >= 6,
  dashboardRoutingHasGovernmentAndProvider: dashboardRoutes.some((item) =>
    item.dashboard === 'GOVERNANCE_AND_REGULATION_COMMAND_DASHBOARD'
  ) && dashboardRoutes.some((item) =>
    item.dashboard === 'PROVIDER_CONTRACT_LICENSE_BILLING_DASHBOARD'
  ),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.classification_is_not_contract_claim &&
    registry?.truthfulness?.classification_is_not_customer_acquisition_claim &&
    registry?.truthfulness?.classification_is_not_revenue_claim
  ),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/customers/classification' &&
    route.module === 'routes/customer-classification/status.routes.js'
  )
};

const missing = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);

const report = {
  system: 'SHEIKHA_CUSTOMER_CLASSIFICATION_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_CUSTOMER_CLASSIFICATION_GAPS' : 'CUSTOMER_CLASSIFICATION_ACTIVE_100',
  checks,
  missing,
  coverage: {
    customerSegments: taxonomy?.customerSegments?.length || 0,
    customerTypes: taxonomy?.customerTypes?.length || 0,
    businessModels: taxonomy?.businessModels?.length || 0,
    roles: taxonomy?.roles?.length || 0,
    verificationLevels: taxonomy?.verificationLevels?.length || 0,
    commercialPriorities: taxonomy?.commercialPriorities?.length || 0,
    strategicSegments: strategicSegments?.segments?.length || 0,
    sectors: sectors?.sectors?.length || 0,
    dashboardRoutes: dashboardRoutes.length,
    revenueStreams: productValueMap?.revenueStreams?.length || 0
  },
  routes: [
    '/api/customers/classification/status',
    '/api/customers/classification/taxonomy',
    '/api/customers/classification/segments',
    '/api/customers/classification/routing'
  ],
  nextActions: [
    'Bind registration forms to Customer Segment, Type, Business Model, Role, Verification, and Priority.',
    'Drive dashboards from dashboard-routing-map instead of one generic customer view.',
    'Gate strategic, government, supplier, revenue, and partner claims by evidence and contract status.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(`${RUNTIME_DIR}/sheikha-customer-classification-v1-report.json`, `${JSON.stringify(report, null, 2)}\n`);
write(
  `${RUNTIME_DIR}/sheikha-customer-classification-v1-report.md`,
  `# SHEIKHA_CUSTOMER_CLASSIFICATION_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- Customer Segments: ${report.coverage.customerSegments}
- Customer Types: ${report.coverage.customerTypes}
- Business Models: ${report.coverage.businessModels}
- Roles: ${report.coverage.roles}
- Verification Levels: ${report.coverage.verificationLevels}
- Commercial Priorities: ${report.coverage.commercialPriorities}
- Strategic Segments: ${report.coverage.strategicSegments}
- Sectors: ${report.coverage.sectors}
- Dashboard Routes: ${report.coverage.dashboardRoutes}
- Revenue Streams: ${report.coverage.revenueStreams}

## المسارات
${report.routes.map((item) => `- ${item}`).join('\n')}

## ضبط الصدق
التصنيف ليس عقدًا، وليس إثبات عميل فعلي، وليس إثبات إيراد. كل عميل استراتيجي أو حكومي أو مورّد أو شريك أو عميل إيرادي يحتاج دليله الخاص.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
