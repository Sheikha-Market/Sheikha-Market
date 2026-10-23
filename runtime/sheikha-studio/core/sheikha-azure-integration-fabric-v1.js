'use strict';

const crypto = require('node:crypto');

const AZURE_CAPABILITIES = Object.freeze([
  { id: 'MICROSOFT_FOUNDRY', category: 'AI_LIFECYCLE', uses: ['agents', 'models', 'evaluation', 'optimization'] },
  { id: 'AZURE_OPENAI', category: 'MODEL_SERVING', uses: ['chat', 'embeddings', 'vision', 'image-generation'] },
  { id: 'FOUNDRY_FINE_TUNING', category: 'MODEL_TRAINING', uses: ['SFT', 'DPO', 'RFT', 'distillation'] },
  { id: 'FOUNDRY_MODEL_CATALOG', category: 'MODEL_DISCOVERY', uses: ['model-discovery', 'capacity', 'deployment'] },
  { id: 'AZURE_MACHINE_LEARNING', category: 'MODEL_TRAINING', uses: ['training-jobs', 'pipelines', 'registries', 'endpoints'] },
  { id: 'AI_SEARCH', category: 'KNOWLEDGE', uses: ['full-text', 'vector', 'hybrid', 'semantic-ranking'] },
  { id: 'AI_SPEECH', category: 'MULTIMODAL', uses: ['speech-to-text', 'text-to-speech', 'translation', 'diarization'] },
  { id: 'DOCUMENT_INTELLIGENCE', category: 'MULTIMODAL', uses: ['OCR', 'forms', 'tables', 'document-extraction'] },
  { id: 'AI_VISION', category: 'MULTIMODAL', uses: ['image-analysis', 'OCR', 'classification'] },
  { id: 'AI_CONTENT_SAFETY', category: 'GOVERNANCE', uses: ['content-filtering', 'risk-classification'] },
  { id: 'API_MANAGEMENT_AI_GATEWAY', category: 'GATEWAY', uses: ['rate-limits', 'semantic-cache', 'model-routing', 'MCP-protection'] },
  { id: 'AKS', category: 'COMPUTE', uses: ['GPU-inference', 'distributed-training', 'autoscaling'] },
  { id: 'AZURE_VM_VMSS_GPU', category: 'COMPUTE', uses: ['GPU-VM', 'scale-set', 'batch-training'] },
  { id: 'AZURE_BATCH', category: 'COMPUTE', uses: ['batch-jobs', 'parallel-workloads'] },
  { id: 'CONTAINER_APPS', category: 'COMPUTE', uses: ['serverless-containers', 'jobs', 'autoscaling'] },
  { id: 'CONTAINER_REGISTRY', category: 'DELIVERY', uses: ['images', 'artifacts', 'supply-chain'] },
  { id: 'AZURE_STORAGE', category: 'DATA', uses: ['blob', 'files', 'queues', 'data-lake'] },
  { id: 'COSMOS_DB', category: 'DATA', uses: ['document-data', 'vector-data', 'global-distribution'] },
  { id: 'AZURE_DATABASES', category: 'DATA', uses: ['PostgreSQL', 'SQL', 'MySQL', 'Redis'] },
  { id: 'EVENT_HUBS_SERVICE_BUS', category: 'MESSAGING', uses: ['streaming', 'queues', 'events'] },
  { id: 'KEY_VAULT_MANAGED_HSM', category: 'SECURITY', uses: ['secrets', 'keys', 'certificates', 'HSM'] },
  { id: 'MICROSOFT_ENTRA_ID', category: 'IDENTITY', uses: ['RBAC', 'managed-identity', 'workload-identity'] },
  { id: 'AZURE_POLICY_DEFENDER', category: 'SECURITY', uses: ['policy', 'posture', 'threat-protection'] },
  { id: 'PRIVATE_LINK_VNET', category: 'NETWORK', uses: ['private-endpoints', 'network-isolation'] },
  { id: 'AZURE_MONITOR_APP_INSIGHTS', category: 'OBSERVABILITY', uses: ['metrics', 'traces', 'logs', 'alerts'] },
  { id: 'LOG_ANALYTICS_DATA_EXPLORER', category: 'OBSERVABILITY', uses: ['KQL', 'telemetry', 'time-series'] },
  { id: 'COST_MANAGEMENT', category: 'FINOPS', uses: ['budgets', 'forecasts', 'cost-controls'] },
  { id: 'AZURE_DEVOPS_GITHUB_ACTIONS', category: 'DELIVERY', uses: ['CI', 'CD', 'workload-federation'] },
]);

const WORKFLOWS = Object.freeze({
  TRAIN_MODEL: ['DATA_LICENSE_GATE', 'PRIVACY_REVIEW', 'GPU_CAPACITY', 'FOUNDRY_OR_AML_JOB', 'EVALUATION', 'HUMAN_PROMOTION'],
  SERVE_MODEL: ['MODEL_LICENSE_GATE', 'DEPLOYMENT', 'AI_GATEWAY', 'CONTENT_SAFETY', 'OBSERVABILITY', 'CANARY'],
  BUILD_RAG: ['DATA_SOURCE', 'DOCUMENT_INTELLIGENCE', 'EMBEDDINGS', 'AI_SEARCH', 'EVALUATION'],
  DEPLOY_AGENT: ['FOUNDRY_PROJECT', 'IDENTITY', 'TOOLS', 'EVALUATION', 'DEPLOYMENT', 'MONITORING'],
  DISTRIBUTED_GPU: ['QUOTA', 'REGION_CAPACITY', 'AKS_OR_VMSS', 'PRIVATE_NETWORK', 'CHECKPOINT_STORAGE', 'FAILOVER'],
});

function buildAzureReadiness(env = process.env) {
  const checks = {
    azureCliInstalled: env.SHEIKHA_AZURE_CLI_INSTALLED === 'true',
    azureDeveloperCliInstalled: env.SHEIKHA_AZD_INSTALLED === 'true',
    authenticatedSubscriptionConfigured: Boolean(env.AZURE_SUBSCRIPTION_ID),
    tenantConfigured: Boolean(env.AZURE_TENANT_ID),
    regionConfigured: Boolean(env.AZURE_LOCATION),
    budgetApproved: env.SHEIKHA_AZURE_BUDGET_APPROVED === 'true',
    trainingDataApproved: env.SHEIKHA_TRAINING_DATA_APPROVED === 'true',
  };
  const blockers = Object.entries(checks).filter(([, passed]) => !passed).map(([check]) => check);
  const base = {
    system: 'SHEIKHA_AZURE_INTEGRATION_FABRIC_V1',
    role: 'OPTIONAL_PAID_EXTERNAL_PROVIDER_ADAPTER',
    coreDependency: false,
    status: blockers.length ? 'CONTRACTS_ACTIVE_EXTERNAL_ACTIVATION_BLOCKED' : 'READY_FOR_SCOPED_EXTERNAL_PREFLIGHT',
    capabilities: AZURE_CAPABILITIES.map((capability) => ({
      ...capability,
      sheikhaAdapterId: `SHEIKHA_AZURE_${capability.id}_ADAPTER`,
      contractRegistered: true,
      externalResourceActivated: false,
    })),
    workflows: WORKFLOWS,
    checks,
    blockers,
    paidProvisioningExecuted: false,
    productionReady: false,
    governance: {
      managedIdentityPreferred: true,
      secretsInSourceDenied: true,
      budgetAndQuotaRequired: true,
      dataResidencyRequired: true,
      trainingLicenseAndPrivacyRequired: true,
      humanApprovalForPaidOrHighImpactActions: true,
      upstreamMicrosoftTermsPreserved: true,
      sheikhaCoreRunsWithoutAzure: true,
      providerOutputsNotTrainingDataByDefault: true,
    },
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

function planAzureWorkflow(input = {}) {
  const workflow = String(input.workflow || '').trim().toUpperCase();
  if (!WORKFLOWS[workflow]) {
    return { status: 'UNKNOWN_WORKFLOW', executionStarted: false, workflow: workflow || null };
  }
  const readiness = buildAzureReadiness(input.environment || process.env);
  return {
    system: 'SHEIKHA_AZURE_WORKFLOW_PLAN_V1',
    status: readiness.blockers.length ? 'PREFLIGHT_BLOCKED' : 'READY_FOR_HUMAN_AUTHORIZED_PREFLIGHT',
    workflow,
    stages: WORKFLOWS[workflow],
    requiredCapabilities: AZURE_CAPABILITIES.filter((capability) =>
      capability.uses.some((use) => WORKFLOWS[workflow].join(' ').includes(use.toUpperCase().replaceAll('-', '_')))),
    blockers: readiness.blockers,
    executionStarted: false,
    paidResourcesCreated: false,
    humanApprovalRequired: true,
  };
}

module.exports = { AZURE_CAPABILITIES, WORKFLOWS, buildAzureReadiness, planAzureWorkflow };
