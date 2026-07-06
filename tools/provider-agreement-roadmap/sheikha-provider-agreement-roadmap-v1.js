'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/provider-agreement-roadmap/v1';

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

function isExecutable(relativePath) {
  try {
    return Boolean(fs.statSync(resolvePath(relativePath)).mode & 0o111);
  } catch {
    return false;
  }
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-provider-agreement-roadmap-v1.json`);
const agreementPaths = readJson(`${RUNTIME_DIR}/registries/agreement-paths-registry.json`);
const subscriptions = readJson(`${RUNTIME_DIR}/registries/subscription-options-registry.json`);
const resources = readJson(`${RUNTIME_DIR}/registries/resource-options-registry.json`);
const scripts = readJson(`${RUNTIME_DIR}/registries/activation-scripts-registry.json`);
const providers = readJson('runtime/provider-registry/v1/registries/providers.json');
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const packageJson = readJson('package.json');

const route = fabric?.routes?.find((item) => item.name === 'provider-agreement-roadmap-v1');
const providerIds = (providers?.providers || []).map((provider) => provider.id);
const subscriptionProviderIds = (subscriptions?.options || []).map((option) => option.providerId);
const agreementTypes = (agreementPaths?.paths || []).map((pathItem) => pathItem.type);
const scriptCommands = (scripts?.scripts || []).map((script) => script.command);

const requiredAgreementTypes = [
  'API_SUBSCRIPTION',
  'GPU_RENTAL',
  'RESERVED_GPU_CAPACITY',
  'ENTERPRISE_CLOUD_CONTRACT',
  'RESELLER_AGREEMENT',
  'PRIVATE_GPU_FARM_PURCHASE_OR_LEASE',
  'HYBRID_CLOUD_OPERATING_AGREEMENT',
  'VPS_CONTROL_PLANE'
];
const requiredProviderIds = [
  'PROV-AWS',
  'PROV-AZURE',
  'PROV-GCP',
  'PROV-OCI',
  'PROV-ALIBABA',
  'PROV-COREWEAVE',
  'PROV-LAMBDA',
  'PROV-CRUSOE',
  'PROV-HOSTINGER',
  'PROV-LOCAL',
  'PROV-OLLAMA',
  'PROV-OPENAI',
  'PROV-ANTHROPIC',
  'PROV-GITHUB-MODELS'
];
const requiredScriptCommands = [
  'npm run ops:provider-compute-fabric:v1',
  'npm run ops:commercial-real-activation:v1',
  'npm run ops:multi-supercomputer-cloud-fabric:v1',
  'npm run ops:ai-supercomputer-cloud-cluster-pipeline-fabric:v1',
  'npm run ops:customer-classification:v1',
  'npm run ops:provider-agreement-roadmap:v1',
  'npm run ops:compute-integration-readiness:v1'
];

const optionItems = subscriptions?.options || [];
const resourceItems = resources?.options || [];

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  lifecycleComplete: hasAll(registry?.lifecycle, [
    'compute_need',
    'governance_review',
    'budget_ceiling',
    'provider_shortlist',
    'terms_and_region_review',
    'subscription_or_contract_request',
    'security_and_data_review',
    'payment_or_purchase_order_gate',
    'credential_vault_gate',
    'proof_of_capability_workload',
    'cost_monitoring',
    'production_promotion'
  ]),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.roadmap_is_not_signed_contract &&
    registry?.truthfulness?.roadmap_is_not_active_subscription &&
    registry?.truthfulness?.roadmap_is_not_gpu_ownership_claim &&
    registry?.truthfulness?.roadmap_is_not_supercomputer_ownership_claim
  ),
  providerRegistryLinked: exists('runtime/provider-registry/v1/registries/providers.json'),
  providerIdsComplete: hasAll(providerIds, requiredProviderIds),
  agreementPathsComplete: hasAll(agreementTypes, requiredAgreementTypes),
  agreementPathsEvidenceGated: (agreementPaths?.paths || []).every((pathItem) =>
    pathItem.evidenceRequired && pathItem.evidenceRequired.length > 0
  ),
  subscriptionOptionsComplete: hasAll(subscriptionProviderIds, requiredProviderIds),
  noSignedContractsClaimed: optionItems.every((option) =>
    option.contractStatus === 'NOT_SIGNED' ||
    option.contractStatus === 'INTERNAL_ONLY'
  ),
  noActiveSubscriptionsClaimed: optionItems.every((option) =>
    option.subscriptionStatus === 'NOT_ACTIVE' ||
    option.subscriptionStatus === 'INTERNAL_ONLY'
  ),
  noApprovedBudgetsClaimed: optionItems.every((option) => option.budgetApproved === false),
  noPaymentMethodClaimed: optionItems.every((option) => option.paymentMethodConfigured === false),
  noGpuAvailabilityClaimed: optionItems.every((option) => option.gpuAvailable === false),
  resourceOptionsComplete: resourceItems.length >= 9,
  resourceOptionsEvidenceGated: resourceItems.every((option) =>
    option.productionReadyWithoutEvidence === false
  ),
  activationScriptsMapped: hasAll(scriptCommands, requiredScriptCommands),
  activationScriptExists: exists('tools/activate-sheikha-compute-integration-readiness.sh'),
  activationScriptExecutable: isExecutable('tools/activate-sheikha-compute-integration-readiness.sh'),
  packageScriptsMounted: Boolean(
    packageJson?.scripts?.['ops:provider-agreement-roadmap:v1'] ===
      'node tools/provider-agreement-roadmap/sheikha-provider-agreement-roadmap-v1.js' &&
    packageJson?.scripts?.['ops:compute-integration-readiness:v1'] ===
      'bash tools/activate-sheikha-compute-integration-readiness.sh'
  ),
  providerComputeFabricLinked: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  commercialRealActivationLinked: exists('runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'),
  multiSupercomputerLinked: exists('runtime/multi-supercomputer-cloud-fabric/v1/sheikha-multi-supercomputer-cloud-fabric-v1-report.json'),
  aiSupercomputerPipelineLinked: exists(
    'runtime/ai-supercomputer-cloud-cluster-pipeline-fabric/v1/sheikha-ai-supercomputer-cloud-cluster-pipeline-fabric-v1-report.json'
  ),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/provider/agreement-roadmap' &&
    route.module === 'routes/provider-agreement-roadmap/status.routes.js'
  )
};

const missing = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);

const report = {
  system: 'SHEIKHA_PROVIDER_AGREEMENT_ROADMAP_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_PROVIDER_AGREEMENT_ROADMAP_GAPS' : 'PROVIDER_AGREEMENT_ROADMAP_ACTIVE_100',
  checks,
  missing,
  coverage: {
    providers: providerIds.length,
    subscriptionOptions: optionItems.length,
    agreementPaths: agreementPaths?.paths?.length || 0,
    resourceOptions: resourceItems.length,
    activationScripts: scripts?.scripts?.length || 0,
    signedContracts: optionItems.filter((option) => option.contractStatus === 'SIGNED').length,
    activeSubscriptions: optionItems.filter((option) => option.subscriptionStatus === 'ACTIVE').length,
    approvedBudgets: optionItems.filter((option) => option.budgetApproved === true).length,
    configuredPayments: optionItems.filter((option) => option.paymentMethodConfigured === true).length,
    gpuAvailableClaims: optionItems.filter((option) => option.gpuAvailable === true).length
  },
  routes: [
    '/api/provider/agreement-roadmap/status',
    '/api/provider/agreement-roadmap/agreements',
    '/api/provider/agreement-roadmap/subscriptions',
    '/api/provider/agreement-roadmap/resources',
    '/api/provider/agreement-roadmap/scripts'
  ],
  activationCommand: 'npm run ops:compute-integration-readiness:v1',
  nextActions: [
    'Choose a low-risk first provider path: API-first, VPS control plane, or on-demand GPU proof-of-capability.',
    'Approve a budget ceiling before any paid provider activation.',
    'Store provider credentials only in a vault or environment, never in repository files.',
    'Promote to production only after monitoring, billing evidence, SLA review, and customer contract gates.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(`${RUNTIME_DIR}/sheikha-provider-agreement-roadmap-v1-report.json`, `${JSON.stringify(report, null, 2)}\n`);
write(
  `${RUNTIME_DIR}/sheikha-provider-agreement-roadmap-v1-report.md`,
  `# SHEIKHA_PROVIDER_AGREEMENT_ROADMAP_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- Providers: ${report.coverage.providers}
- Subscription Options: ${report.coverage.subscriptionOptions}
- Agreement Paths: ${report.coverage.agreementPaths}
- Resource Options: ${report.coverage.resourceOptions}
- Activation Scripts: ${report.coverage.activationScripts}
- Signed Contracts: ${report.coverage.signedContracts}
- Active Subscriptions: ${report.coverage.activeSubscriptions}
- Approved Budgets: ${report.coverage.approvedBudgets}
- Configured Payments: ${report.coverage.configuredPayments}
- GPU Availability Claims: ${report.coverage.gpuAvailableClaims}

## سكربت التفعيل
\`${report.activationCommand}\`

## المسارات
${report.routes.map((item) => `- ${item}`).join('\n')}

## خريطة القرار
Compute Need -> Governance Review -> Budget Ceiling -> Provider Shortlist -> Terms Review -> Subscription or Contract -> Security Review -> Credential Vault -> Proof Workload -> Monitoring -> Production Promotion.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
