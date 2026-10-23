'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { buildUnifiedEcosystemStatus } = require('./sheikha-unified-ecosystem-v1');
const { buildCustomerExperience5DStatus } = require('./sheikha-customer-experience-5d-v1');
const { buildPossibilityPlan } = require('./sheikha-visual-fabric-v2-bridge');

const ROOT = path.resolve(__dirname, '../..');

const COMPONENTS = Object.freeze([
  ['STUDIO', 'بيئة التطوير', 'sheikha-studio/kernel/sheikha-unified-studio-kernel.js'],
  ['TRUST_TOOLS', 'أدوات الثقة', 'sheikha-studio/core/sheikha-trust-tools-v1.js'],
  ['FIRMWARE', 'هندسة Firmware', 'bare-metal/v3/firmware-platform/sheikha-firmware-platform-oem-odm-v1.json'],
  ['TPM', 'الثقة المادية TPM', 'governance/platform-trust/v1/sheikha-physical-platform-trust-v1.json'],
  ['SHEIKHA_LANGUAGE', 'لغة شيخة العربية', '../docs/sheikha-production-language/SHEIKHA-PRODUCTION-LANGUAGE-V1.md'],
  ['LMM', 'توجيه النماذج LMM', 'sheikha-studio/core/sheikha-lmm-dual-track-production-v1.js'],
  ['FOUNDRY', 'مصنع المنتجات والنماذج', 'sheikha-studio/core/sheikha-foundry-v1.js'],
  ['CLOUD', 'السحابة والاتحاد الاختياري', 'sheikha-studio/core/sheikha-cloud-v1.js'],
  ['BARE_METAL', 'الإقلاع والعتاد', 'bare-metal/v2/sheikha-sovereign-bare-metal-os-v2-program.json'],
  ['SAAS', 'منصة SaaS', '../docs/saas-platform-layer-v1/SHEIKHA-SAAS-PLATFORM-LAYER-V1.md'],
  ['SYSTEM_BUILDER', 'بناء الأنظمة', 'product-runtime/v1/contracts/sheikha-unified-product-runtime-v1-contract.json'],
  ['GIT_LAB_HUB', 'اتحاد المصدر', 'sheikha-studio/git-lab/sheikha-git-lab-federation.js'],
  ['SDK', 'حزمة التطوير', 'sheikha-studio/core/sheikha-studio-developer-ecosystem-v1.js'],
  ['CLI', 'سطر الأوامر', 'sheikha-studio/core/sheikha-studio-developer-ecosystem-v1.js'],
  ['MCP', 'بروتوكول الأدوات', 'mcp-unified-bridge/sheikha-mcp-unified-bridge.json'],
  ['PHP', 'تكامل PHP', 'sheikha-studio/core/sheikha-studio-developer-ecosystem-v1.js'],
  ['MODEL_SUBSCRIPTIONS', 'اشتراكات مزودي النماذج', 'sheikha-studio/core/sheikha-model-provider-subscription-v1.js'],
  ['OBSERVABILITY', 'القياس والرصد', '../docs/observability-mesh-fabric/SHEIKHA-OBSERVABILITY-MESH-FABRIC-V121.md'],
  ['SECURITY_TOOLING', 'أدوات الأمن الدفاعية', 'sheikha-studio/core/sheikha-studio-security-tooling-v1.js'],
  ['SHEIKHA_MARKET', 'سوق شيخة', '../docs/registry/market/SHEIKHA-MARKET-FABRIC.md'],
  ['GARDENS', 'نموذج الجنات الهندسي', '../docs/jannat-gardens-v4/SHEIKHA-PASTURES-ORCHARDS-CULTIVATION-OPERATING-MODEL-V1.md'],
  ['FARMS', 'المزارع والإنتاج', '../docs/jannat-gardens-v4/SHEIKHA-PASTURES-ORCHARDS-CULTIVATION-OPERATING-MODEL-V1.md'],
  ['PASTURES', 'المراعي والموارد المشتركة', '../docs/jannat-gardens-v4/SHEIKHA-PASTURES-ORCHARDS-CULTIVATION-OPERATING-MODEL-V1.md'],
  ['RESOURCE_RARITY', 'حوكمة الموارد والندرة', 'sheikha-studio/core/sheikha-unified-ecosystem-v1.js'],
  ['DEFENSIVE_EWAR', 'وعي ورصد دفاعي فقط', 'defensive-awareness/safe-response-policy.js'],
  ['DRAWING_MOTION', 'الرسم والحركة والمحاكاة', 'sheikha-studio/core/sheikha-visual-fabric-v2-bridge.js'],
  ['POSSIBILITY', 'تحويل الهدف إلى خطة', 'sheikha-possibility-realization-fabric-v1/planner.js'],
  ['COMMERCIAL_OS', 'الجدوى والتجارب والقرار', 'sheikha-studio/core/sheikha-commercial-operating-system-v1.js'],
]);

const RELEASE_GATES = Object.freeze([
  'SECURITY_DEPENDENCY_AUDIT', 'DATA_AND_MODEL_LICENSE_REVIEW', 'PRIVACY_AND_PII_REVIEW',
  'LOAD_SOAK_AND_RECOVERY_TEST', 'DISTRIBUTED_SECRET_AND_NONCE_STORE', 'EXTERNAL_APPEND_ONLY_AUDIT',
  'PRODUCT_OWNER_RELEASE_APPROVAL',
]);

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function inspectComponent([id, labelAr, evidence]) {
  const absolutePath = path.resolve(ROOT, evidence);
  const evidencePresent = fs.existsSync(absolutePath);
  return {
    id,
    labelAr,
    evidence,
    evidencePresent,
    status: evidencePresent ? 'SOURCE_EVIDENCE_PRESENT' : 'SOURCE_EVIDENCE_MISSING',
    productionReady: false,
  };
}

function readModelAdmission() {
  const file = path.resolve(ROOT, 'sheikha-ai-governor/v1/llm-training/llama-sheikha-governed-8b-admission.json');
  try {
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      model: report.technicalModelId,
      classification: report.classification,
      qualityGatePassed: report.evaluation?.qualityGatePassed === true,
      latencyGatePassed: report.evaluation?.latencyGatePassed === true,
      localEngineeringServingAllowed: report.admission?.localEngineeringServingAllowed === true,
      commercialProductionApproved: report.admission?.commercialProductionApproved === true,
      attribution: report.license?.attributionRequired,
      evidenceSha256: report.reportSha256,
    };
  } catch {
    return { status: 'MODEL_ADMISSION_EVIDENCE_MISSING' };
  }
}

function readIndependentModelProgram() {
  const file = path.resolve(
    ROOT,
    'sheikha-ai-governor/v1/llm-training/sheikha-rapid-independent-model-program-v1.json',
  );
  try {
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    const fromScratch = report.accelerationTracks?.independentFromScratch || {};
    const continuedPretraining = report.accelerationTracks?.continuedPretraining || {};
    return {
      status: report.status,
      servingModel: report.servingNow?.model,
      governedHybridActive: report.accelerationTracks?.governedHybrid?.active === true,
      continuedPretrainingAdmitted: continuedPretraining.admitted === true,
      continuedPretrainingBlockers: continuedPretraining.blockers || [],
      independentFromScratchAdmitted: fromScratch.admitted === true,
      targetParametersB: fromScratch.targetParametersB,
      targetTokens: fromScratch.targetTokens,
      independentFromScratchBlockers: fromScratch.blockers || [],
      betterThanGptOrCopilotClaimed: report.competitiveClaimGate?.betterThanGptOrCopilotClaimed === true,
      evidenceSha256: report.sha256,
    };
  } catch {
    return { status: 'INDEPENDENT_MODEL_PROGRAM_EVIDENCE_MISSING' };
  }
}

function readFoundationBootstrap() {
  const file = path.resolve(
    ROOT,
    'sheikha-ai-governor/v1/llm-training/sheikha-foundation-bootstrap-v1.json',
  );
  try {
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      status: report.status,
      servingModel: report.architecture?.servingModel,
      capabilityCount: report.architecture?.foundationCapabilities?.length || 0,
      trainingAdmitted: report.training?.admitted === true,
      blockers: report.training?.blockers || [],
      onlineProductionWeightMutationAllowed: report.architecture?.productionWeightsMutableOnline === true,
      evidenceSha256: report.sha256,
    };
  } catch {
    return { status: 'FOUNDATION_BOOTSTRAP_EVIDENCE_MISSING' };
  }
}

function buildUnifiedRuntimeStatus() {
  const components = COMPONENTS.map(inspectComponent);
  const evidencePresentCount = components.filter((item) => item.evidencePresent).length;
  const ecosystem = buildUnifiedEcosystemStatus();
  const base = {
    system: 'SHEIKHA_UNIFIED_RUNTIME_V1',
    status: evidencePresentCount === components.length
      ? 'LOCAL_INTEGRATION_ACTIVE_PRODUCT_GATES_RETAINED'
      : 'LOCAL_INTEGRATION_EVIDENCE_INCOMPLETE',
    componentCount: components.length,
    evidencePresentCount,
    components,
    ecosystem: { productCount: ecosystem.productCount, status: ecosystem.status },
    modelRuntime: readModelAdmission(),
    independentModelProgram: readIndependentModelProgram(),
    foundationBootstrap: readFoundationBootstrap(),
    customerExperience5D: buildCustomerExperience5DStatus(),
    release: {
      commercialPilotAllowed: true,
      generalAvailabilityAllowed: false,
      productSpecificApprovalRequired: true,
      gates: RELEASE_GATES,
    },
    defensiveEwarBoundary: {
      mode: 'DEFENSIVE_MONITORING_SIMULATION_AND_RESILIENCE_ONLY',
      offensiveOperationsAllowed: false,
      unauthorizedAccessAllowed: false,
    },
    physicalBoundaries: {
      tpmAccessPerformed: false,
      firmwareMutationPerformed: false,
      secureBootMutationPerformed: false,
      networkOperationPerformed: false,
    },
  };
  return { ...base, sha256: digest(base) };
}

function buildSourceBoundContinuation(input = {}) {
  const possibility = buildPossibilityPlan(input);
  const runtime = buildUnifiedRuntimeStatus();
  const base = {
    system: 'SHEIKHA_SOURCE_BOUND_CONTINUATION_V1',
    status: possibility.status === 'BOUNDED_PLAN_READY'
      ? 'SOURCE_BOUND_SEQUENCE_READY_FOR_HUMAN_REVIEW'
      : 'CONCRETE_GOAL_EVIDENCE_REQUIRED',
    temporaryDownloadScriptRequired: false,
    previousErrorResolvedByDesign: 'EXACT_POSSIBILITY_SCRIPT_NOT_FOUND',
    stages: [
      { id: 'POSSIBILITY_PLAN', status: possibility.status, evidenceSha256: possibility.sha256 },
      { id: 'UNIFIED_RUNTIME', status: runtime.status, evidenceSha256: runtime.sha256 },
      { id: 'TPM_V3_POLICY_DESIGN', status: 'DESIGN_ONLY_NOT_EXECUTED' },
    ],
    execution: {
      performed: false,
      tpmAccessPerformed: false,
      firmwareMutationPerformed: false,
      externalNetworkUsed: false,
    },
  };
  return { ...base, sha256: digest(base) };
}

module.exports = { COMPONENTS, RELEASE_GATES, buildUnifiedRuntimeStatus, buildSourceBoundContinuation };
