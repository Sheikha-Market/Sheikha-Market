'use strict';

const crypto = require('node:crypto');

const PRODUCTS = Object.freeze([
  { id: 'SHEIKHA_STUDIO', role: 'PRIMARY_DEVELOPMENT_ENVIRONMENT', maturity: 'LOCAL_PILOT', state: 'INTERACTIVE_LOCAL_SERVICE_ACTIVE', evidence: 'sheikha-studio-server.js' },
  { id: 'SHEIKHA_LANGUAGE', role: 'ARABIC_GOVERNED_PROGRAMMING_LANGUAGE', maturity: 'DEVELOPMENT', state: 'HOSTED_LANGUAGE_AND_LIMITED_NATIVE_BACKEND', evidence: 'docs/sheikha-production-language/SHEIKHA-PRODUCTION-LANGUAGE-V1.md' },
  { id: 'SHEIKHA_FOUNDRY', role: 'AI_AND_SYSTEM_PRODUCT_ENGINEERING', maturity: 'LOCAL_PILOT', state: 'CONTROL_PLANE_FOUNDATION_ACTIVE', evidence: 'runtime/sheikha-studio/core/sheikha-foundry-v1.js' },
  { id: 'SHEIKHA_LMM', role: 'GOVERNED_MODEL_ROUTER_AND_LOCAL_MODEL_FLEET', maturity: 'CONTROLLED_PILOT', state: 'ROUTER_AND_LOCAL_MODELS_ACTIVE_NOT_NEW_HYPERSCALE_MODEL', evidence: 'runtime/sheikha-studio/core/sheikha-lmm-dual-track-production-v1.js' },
  { id: 'SHEIKHA_GIT_LAB_HUB', role: 'GOVERNED_SOURCE_COLLABORATION_FEDERATION', maturity: 'LOCAL_PILOT', state: 'LOCAL_CONTRACTS_ACTIVE_EXTERNAL_ROUND_TRIP_REQUIRED', evidence: 'runtime/sheikha-studio/git-lab/sheikha-git-lab-federation.js' },
  { id: 'SHEIKHA_TPM', role: 'PLATFORM_TRUST_ATTESTATION_AND_KEY_CUSTODY', maturity: 'ENGINEERING_VALIDATION', state: 'READ_ONLY_TOOLS_ACTIVE_PHYSICAL_E2E_GATE_OPEN', evidence: 'runtime/sheikha-studio/core/sheikha-trust-tools-v1.js' },
  { id: 'SHEIKHA_FIRMWARE', role: 'UEFI_AND_PLATFORM_FIRMWARE_ENGINEERING', maturity: 'RESEARCH_AND_TRIAL', state: 'SAFE_TRIAL_ARTIFACTS_NOT_OEM_COMMERCIAL_RELEASE', evidence: 'docs/products/SHEIKHA-MSI-BARE-METAL-SAFE-BOOT-TRIAL-READINESS-REPORT-V1-AR.md' },
  { id: 'SHEIKHA_KERNEL', role: 'NATIVE_KERNEL_AND_ARABIC_LANGUAGE_HANDOFF', maturity: 'RESEARCH_AND_TRIAL', state: 'QEMU_AND_PHYSICAL_SAFE_TRIAL_NOT_GENERAL_PURPOSE_KERNEL', evidence: 'runtime/bare-metal/v2/sheikha-sovereign-bare-metal-os-v2-program.json' },
  { id: 'SHEIKHA_BARE_METAL', role: 'NATIVE_BOOT_AND_HARDWARE_INTEGRATION', maturity: 'PHYSICAL_SAFE_TRIAL', state: 'PHYSICAL_SAFE_TRIAL_VERIFIED_INSTALLER_DISABLED', evidence: 'docs/products/SHEIKHA-MSI-BARE-METAL-SAFE-BOOT-TRIAL-READINESS-REPORT-V1-AR.md' },
  { id: 'SHEIKHA_CLOUD', role: 'LOCAL_CLOUD_CONTROL_AND_PROVIDER_FEDERATION', maturity: 'LOCAL_PILOT', state: 'LOCAL_CONTROLLED_PILOT_ACTIVE_NOT_PUBLIC_DISTRIBUTED_CLOUD', evidence: 'runtime/sheikha-studio/core/sheikha-cloud-v1.js' },
  { id: 'SHEIKHA_SAAS', role: 'TENANT_APPLICATION_AND_SUBSCRIPTION_PLATFORM', maturity: 'FOUNDATION', state: 'FOUNDATION_AND_CONTRACTS_AVAILABLE', evidence: 'docs/saas-platform-layer-v1/SHEIKHA-SAAS-PLATFORM-LAYER-V1.md' },
  { id: 'SHEIKHA_SYSTEM_BUILDER', role: 'SYSTEM_PRODUCT_AND_CAPABILITY_COMPOSITION', maturity: 'FOUNDATION', state: 'FOUNDATION_ACTIVE', evidence: 'runtime/product-runtime/v1/contracts/sheikha-unified-product-runtime-v1-contract.json' },
  { id: 'SHEIKHA_MARKET', role: 'INDUSTRIAL_TRADE_SUPPLY_CHAIN_AND_MARKETPLACE', maturity: 'FOUNDATION', state: 'MARKET_RUNTIME_FOUNDATION_ACTIVE', evidence: 'docs/registry/market/SHEIKHA-MARKET-FABRIC.md' },
  { id: 'SHEIKHA_GARDENS', role: 'EARTHLY_ENGINEERING_PLANNING_MODEL', maturity: 'MODEL', state: 'MODEL_AND_DOCUMENTATION_ACTIVE', evidence: 'docs/jannat-gardens-v4/SHEIKHA-PASTURES-ORCHARDS-CULTIVATION-OPERATING-MODEL-V1.md' },
  { id: 'SHEIKHA_DEVELOPER_TOOLCHAIN', role: 'SDK_CLI_MCP_PHP_AND_LANGUAGE_TOOLING', maturity: 'LOCAL_PILOT', state: 'INTEGRATED_FOUNDATION_ACTIVE_RUNTIME_SUPPORT_VARIES_BY_TOOL', evidence: 'runtime/sheikha-studio/core/sheikha-studio-developer-ecosystem-v1.js' },
  { id: 'SHEIKHA_MODEL_SUBSCRIPTIONS', role: 'OPTIONAL_CUSTOMER_OWNED_MODEL_PROVIDER_ROUTING', maturity: 'CONTROLLED_PILOT', state: 'CONTRACT_AND_ROUTING_FOUNDATION_ACTIVE_PROVIDER_CREDENTIALS_OPTIONAL', evidence: 'runtime/sheikha-studio/core/sheikha-model-provider-subscription-v1.js' },
  { id: 'SHEIKHA_OBSERVABILITY', role: 'METRICS_LOGS_TRACES_ALERTS_AND_SLO', maturity: 'LOCAL_PILOT', state: 'LOCAL_OBSERVABILITY_ACTIVE_DISTRIBUTED_RETENTION_NOT_VERIFIED', evidence: 'docs/observability-mesh-fabric/SHEIKHA-OBSERVABILITY-MESH-FABRIC-V121.md' },
  { id: 'SHEIKHA_SECURITY_TOOLING', role: 'SECURITY_INSPECTION_POLICY_AND_EVIDENCE', maturity: 'LOCAL_PILOT', state: 'LOCAL_SECURITY_TOOLING_ACTIVE_EXTERNAL_AUDIT_REQUIRED', evidence: 'runtime/sheikha-studio/core/sheikha-studio-security-tooling-v1.js' },
  { id: 'SHEIKHA_RESOURCE_GOVERNANCE', role: 'RARITY_FAIR_ACCESS_AND_ANTI_CONCENTRATION_GOVERNANCE', maturity: 'MODEL', state: 'DETERMINISTIC_CLASSIFIER_ACTIVE_COMMERCIAL_ACTION_REQUIRES_REVIEW', evidence: 'runtime/sheikha-studio/core/sheikha-unified-ecosystem-v1.js' },
  { id: 'SHEIKHA_MODEL_TRAINING', role: 'BOUNDED_LOCAL_AND_EXTERNAL_TRAINING_ORCHESTRATION', maturity: 'CONTROLLED_PILOT', state: 'SCHEDULER_ACTIVE_COMMERCIAL_PROMOTION_REQUIRES_DATA_LICENSE_AND_EVALUATION', evidence: 'runtime/sheikha-ai-governor/v1/sheikha-training-scheduler-v1.js' },
  { id: 'SHEIKHA_VISUAL_FABRIC', role: 'GOVERNED_GRAPHICS_IMAGE_VIDEO_VISION_AR_VR_AND_SIMULATION', maturity: 'LOCAL_PILOT', state: 'LOCAL_VISUAL_PIPELINES_ACTIVE_AR_VR_AND_COMMERCIAL_RELEASE_GATED', evidence: 'runtime/sheikha-studio/core/sheikha-visual-intelligence-fabric-v1.js' },
  { id: 'SHEIKHA_360', role: 'MEASURED_REALITY_DIGITAL_TWIN_SIMULATION_AND_VERIFIED_ACTION_BRIDGE', maturity: 'LOCAL_PILOT', state: 'GOVERNED_PLANNING_ACTIVE_SENSOR_AND_PHYSICAL_ACTION_CONNECTIONS_GATED', evidence: 'runtime/sheikha-studio/core/sheikha-360-reality-bridge-v1.js' },
]);

const RARITY_LEVELS = Object.freeze([
  { id: 'NOT_RARE', min: 0, max: 24 },
  { id: 'MODERATELY_RARE', min: 25, max: 49 },
  { id: 'RARE', min: 50, max: 74 },
  { id: 'VERY_RARE', min: 75, max: 89 },
  { id: 'EXTREMELY_RARE', min: 90, max: 100 },
]);

function boundedMetric(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(0, number));
}

function classifyResourceRarity(input = {}) {
  const metrics = {
    supplyAvailability: boundedMetric(input.supplyAvailability),
    substitutability: boundedMetric(input.substitutability),
    supplierConcentration: boundedMetric(input.supplierConcentration),
    strategicCriticality: boundedMetric(input.strategicCriticality),
    regenerationDifficulty: boundedMetric(input.regenerationDifficulty),
  };
  const missingMetrics = Object.entries(metrics).filter(([, value]) => value === null).map(([name]) => name);
  if (missingMetrics.length) {
    return {
      system: 'SHEIKHA_RESOURCE_RARITY_DIAGNOSIS_V1',
      status: 'INSUFFICIENT_EVIDENCE',
      missingMetrics,
      score: null,
      level: null,
      commercialActionAllowed: false,
    };
  }
  const score = Number((
    ((100 - metrics.supplyAvailability) * 0.30)
    + ((100 - metrics.substitutability) * 0.20)
    + (metrics.supplierConcentration * 0.20)
    + (metrics.strategicCriticality * 0.20)
    + (metrics.regenerationDifficulty * 0.10)
  ).toFixed(2));
  const level = RARITY_LEVELS.find((candidate) => score >= candidate.min && score <= candidate.max)?.id;
  const concentrationRisk = metrics.supplierConcentration >= 70;
  return {
    system: 'SHEIKHA_RESOURCE_RARITY_DIAGNOSIS_V1',
    status: 'CLASSIFIED_WITH_DECLARED_INPUTS',
    resourceId: String(input.resourceId || '').trim() || null,
    specialization: String(input.specialization || '').trim() || null,
    metrics,
    weights: {
      supplyScarcity: 0.30,
      lackOfSubstitutes: 0.20,
      supplierConcentration: 0.20,
      strategicCriticality: 0.20,
      regenerationDifficulty: 0.10,
    },
    score,
    level,
    concentrationRisk,
    actions: concentrationRisk
      ? ['DIVERSIFY_SUPPLIERS', 'OPEN_FAIR_ACCESS', 'CAP_DOMINANT_ALLOCATION', 'AUDIT_PRICING_AND_INVENTORY']
      : ['PRESERVE_RESOURCE', 'DEVELOP_SPECIALISTS', 'EXPAND_RESPONSIBLE_SUPPLY', 'MONITOR_ACCESS_AND_PRICE'],
    limitations: ['RESULT_DEPENDS_ON_INPUT_EVIDENCE', 'RARITY_IS_NOT_A_LICENSE_TO_HOARD_OR_MANIPULATE_PRICE'],
    commercialActionAllowed: false,
  };
}

function buildUnifiedEcosystemStatus() {
  const maturityCounts = PRODUCTS.reduce((counts, product) => {
    counts[product.maturity] = (counts[product.maturity] || 0) + 1;
    return counts;
  }, {});
  const base = {
    system: 'SHEIKHA_UNIFIED_ECOSYSTEM_V1',
    status: 'INTEGRATION_CONTRACT_ACTIVE_PRODUCTS_HAVE_INDEPENDENT_GATES',
    products: PRODUCTS,
    productCount: PRODUCTS.length,
    maturityCounts,
    integrationFlow: [
      'SHEIKHA_LANGUAGE', 'SHEIKHA_STUDIO_AND_CLI', 'SHEIKHA_SYSTEM_BUILDER',
      'SHEIKHA_LMM_AND_FOUNDRY', 'SHEIKHA_TPM_AND_FIRMWARE', 'SHEIKHA_KERNEL_AND_BARE_METAL',
      'SHEIKHA_CLOUD', 'SHEIKHA_SAAS',
      'SHEIKHA_MARKET', 'SHEIKHA_DEVELOPER_TOOLCHAIN', 'SHEIKHA_MODEL_SUBSCRIPTIONS',
      'SHEIKHA_OBSERVABILITY_AND_SECURITY_TOOLING', 'SHEIKHA_RESOURCE_GOVERNANCE',
      'SHEIKHA_MODEL_TRAINING', 'EVIDENCE_IMPACT_AND_CONTINUOUS_IMPROVEMENT',
      'SHEIKHA_VISUAL_FABRIC_LANGUAGE_LMM_AND_GARDENS',
      'SHEIKHA_360_REALITY_EVIDENCE_TWIN_SIMULATION_AND_VERIFICATION',
    ],
    gardensModel: {
      boundary: 'EARTHLY_ENGINEERING_METAPHOR_ONLY',
      soil: 'FOUNDATIONS_DATA_AND_INFRASTRUCTURE',
      seeds: 'IDEAS_REQUIREMENTS_AND_SOURCE',
      irrigation: 'BOUNDED_COMPUTE_KNOWLEDGE_AND_MAINTENANCE',
      orchards: 'PRODUCT_PORTFOLIOS',
      fruits: 'VERIFIED_BENEFICIAL_OUTCOMES',
      pastures: 'SHARED_REUSABLE_CAPABILITIES',
    },
    faithBoundary: {
      quranAndAuthenticSunnahAreMoralReference: true,
      qualifiedHumanReviewForSpecificReligiousRulings: true,
      afterlifeAndHighestFirdawsAreNotModeledOrSimulatedAsEngineeringAssets: true,
      wording: 'The Hereafter and al-Firdaws are matters of faith and supplication, not technical products or measurable system claims.',
    },
    fairResourcePolicy: {
      monopolyAndArtificialScarcityDenied: true,
      hoardingForPriceManipulationDenied: true,
      rareResourcesPreserved: true,
      fairAccessAndTransparentAllocationRequired: true,
      specialistDevelopmentRequired: true,
      regenerationReuseAndSubstitutionInvestmentRequired: true,
      ownerPropertyAndUpstreamLicensesPreserved: true,
      highImpactAllocationRequiresHumanReview: true,
    },
    rarityLevels: RARITY_LEVELS,
    productionClaim: 'EACH_PRODUCT_RETAINS_ITS_OWN_EVIDENCE_AND_RELEASE_GATE',
    commercialRelease: {
      status: 'PRODUCT_SPECIFIC_GATES_REQUIRED',
      automaticGlobalRelease: false,
      firmwareReleaseAllowed: false,
      hyperscaleModelClaimAllowed: false,
      publicDistributedCloudClaimAllowed: false,
    },
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { PRODUCTS, RARITY_LEVELS, classifyResourceRarity, buildUnifiedEcosystemStatus };
