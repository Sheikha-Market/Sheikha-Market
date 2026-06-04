'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function resolvePath(p) {
  return path.join(ROOT, p);
}

function exists(p) {
  return fs.existsSync(resolvePath(p));
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(resolvePath(p), 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(resolvePath(p)), { recursive: true });
  fs.writeFileSync(resolvePath(p), JSON.stringify(value, null, 2));
}

function writeText(p, value) {
  fs.mkdirSync(path.dirname(resolvePath(p)), { recursive: true });
  fs.writeFileSync(resolvePath(p), value);
}

const decisionRegistry = readJson('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json');
const decisionItems = readJson('runtime/decision-registry/v2/registries/decision-registry-items.json');

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistryV2: decisionRegistry?.status === 'ACTIVE' && decisionRegistry?.score === 100,
  apiContractRegistryV2: exists('runtime/api-contract-registry/v2/sheikha-api-contract-registry-v2.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  policyCompiler: exists('runtime/governance/policy-compiler/sheikha-policy-compiler.json'),
  policyDecisionPoint: exists('runtime/governance/policy-decision-point/sheikha-pdp.json'),
  policyEnforcementPoint: exists('runtime/governance/policy-enforcement-point/sheikha-pep.json'),
  capabilityTokens: exists('runtime/governance/capability-tokens/sheikha-capability-tokens.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const knownDecisionIds = new Set((decisionItems?.items || []).map((item) => item.id));

const capabilities = [
  {
    id: 'CAP-CODEX-001',
    name: 'Governed Codex Analysis',
    arabicName: 'تحليل كودكس المحكوم',
    domain: 'codex',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-001', 'DRV2-002'],
    policyRefs: ['root_authority_required', 'source_knowledge_required', 'measurement_required'],
    scopes: ['repository_analysis', 'architecture_review', 'risk_discovery'],
    executionMode: 'assistive_read_write_with_human_review',
    measurement: 'analysis_outputs_have_evidence_and_trace',
    guardrails: ['no_unverified_claims', 'no_raw_merge', 'no_secret_exposure']
  },
  {
    id: 'CAP-CODEX-002',
    name: 'Governed Code Generation And Patching',
    arabicName: 'توليد وتصحيح الكود المحكوم',
    domain: 'codex',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-002', 'DRV2-004'],
    policyRefs: ['tests_required', 'stability_score_100', 'no_drift'],
    scopes: ['code_patch', 'tooling_patch', 'test_patch'],
    executionMode: 'patch_only_with_verification',
    measurement: 'node_check_jest_lint_admission_no_drift',
    guardrails: ['apply_patch_required', 'bounded_scope', 'no_destructive_commands']
  },
  {
    id: 'CAP-CODEX-003',
    name: 'Runtime Governance And Policy Binding',
    arabicName: 'ربط الحوكمة والسياسات بالتشغيل',
    domain: 'governance',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-001', 'DRV2-005'],
    policyRefs: ['pdp_required', 'pep_required', 'policy_compiler_required'],
    scopes: ['policy_registry', 'admission_control', 'runtime_enforcement'],
    executionMode: 'policy_first_runtime_binding',
    measurement: 'admission_controller_active_blocked_zero',
    guardrails: ['human_review_for_high_risk', 'audit_required', 'rollback_required']
  },
  {
    id: 'CAP-CODEX-004',
    name: 'API Contract And Extension Compatibility',
    arabicName: 'عقود API وتوافق الإضافة',
    domain: 'api',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-003'],
    policyRefs: ['success_data_meta_required', 'live_extension_tests_gated'],
    scopes: ['api_contracts', 'response_envelopes', 'extension_compatibility'],
    executionMode: 'contract_wrapped_compatibility',
    measurement: 'api_contract_v2_score_100',
    guardrails: ['no_flat_contract_drift', 'live_tests_explicit_only']
  },
  {
    id: 'CAP-CODEX-005',
    name: 'Knowledge Capture And Decision Trace',
    arabicName: 'التقاط المعرفة وتتبع القرار',
    domain: 'knowledge',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-002', 'DRV2-006'],
    policyRefs: ['knowledge_evidence_required', 'decision_trace_required'],
    scopes: ['lessons_learned', 'decision_registry', 'report_generation'],
    executionMode: 'evidence_backed_knowledge_capture',
    measurement: 'knowledge_links_resolvable',
    guardrails: ['no_decision_without_knowledge', 'no_execution_without_decision']
  },
  {
    id: 'CAP-CODEX-006',
    name: 'PR And Merge Governance',
    arabicName: 'حوكمة PR والدمج',
    domain: 'source_control',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-005'],
    policyRefs: ['checks_required', 'admission_required', 'curated_review_required'],
    scopes: ['pull_request_review', 'ci_monitoring', 'merge_readiness'],
    executionMode: 'curated_human_review_required',
    measurement: 'github_checks_green_and_merge_state_clean',
    guardrails: ['no_raw_merge', 'no_failed_checks_merge']
  },
  {
    id: 'CAP-CODEX-007',
    name: 'Runtime Introspection And Drift Control',
    arabicName: 'استبطان التشغيل ومنع الانجراف',
    domain: 'runtime',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-004'],
    policyRefs: ['no_drift', 'stability_score_100'],
    scopes: ['runtime_introspection', 'drift_detection', 'stability_reports'],
    executionMode: 'measure_before_activation',
    measurement: 'no_drift_git_clean_true',
    guardrails: ['no_activation_with_dirty_tree', 'protected_runtime_audit']
  },
  {
    id: 'CAP-CODEX-008',
    name: 'Provider Neutral AI Gateway',
    arabicName: 'بوابة ذكاء مزود-محايدة',
    domain: 'ai',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-003', 'DRV2-004'],
    policyRefs: ['provider_truthfulness_required', 'api_contract_required', 'fallback_required'],
    scopes: ['openai_compatible_gateway', 'local_ai_gateway', 'multi_provider_routing'],
    executionMode: 'provider_neutral_governed_gateway',
    measurement: 'provider_availability_is_checked_not_assumed',
    guardrails: ['do_not_claim_unverified_model', 'quota_errors_reported', 'human_final_authority']
  },
  {
    id: 'CAP-CODEX-009',
    name: 'Architecture And Capability Planning',
    arabicName: 'تخطيط المعمارية والقدرات',
    domain: 'architecture',
    status: 'ACTIVE',
    decisionRefs: ['DRV2-001', 'DRV2-006'],
    policyRefs: ['architecture_freeze_required', 'capability_registry_required'],
    scopes: ['roadmap_generation', 'architecture_docs', 'capability_mapping'],
    executionMode: 'registry_first_architecture_planning',
    measurement: 'capabilities_map_to_decisions_and_policies',
    guardrails: ['no_execution_fabric_until_ready', 'no_scope_expansion_without_registry']
  },
  {
    id: 'CAP-CODEX-010',
    name: 'Execution Fabric V2 Gate',
    arabicName: 'بوابة منع تنفيذ Execution Fabric V2',
    domain: 'execution',
    status: 'GATED',
    decisionRefs: ['DRV2-007'],
    policyRefs: ['capability_registry_v2_required', 'execution_fabric_blocked_until_ready'],
    scopes: ['execution_fabric_v2'],
    executionMode: 'blocked_until_capability_registry_ready',
    measurement: 'execution_fabric_v2_not_active_until_gate_passes',
    guardrails: ['no_raw_execution', 'no_execution_without_capability_registry']
  }
];

const registry = {
  system: 'SHEIKHA_CAPABILITY_REGISTRY_V2',
  status: 'ACTIVE',
  arabic_name: 'سجل قدرات شيخة V2',
  purpose: 'Activate all available Codex, AI, governance, architecture, policy, runtime, and delivery capabilities through governed capability registration.',
  requested_activation_label: 'SHEIKHA_CODEX_AI_FULL_CAPABILITIES_REQUEST',
  truthfulness_policy: {
    capability_activation_only: true,
    model_pull_requested: false,
    provider_model_download_requested: false,
    external_model_activation_claim: false,
    model_name_is_not_asserted: true,
    provider_availability_must_be_verified: true,
    actual_activation_scope: 'governed_capability_registry_and_codex_runtime_policies'
  },
  position: 'UNDER_DECISION_REGISTRY_BEFORE_EXECUTION_FABRIC',
  governed_by: [
    'SHEIKHA_HEART_CORE_V1',
    'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
    'SHEIKHA_KNOWLEDGE_ENGINE_V2',
    'SHEIKHA_DECISION_REGISTRY_V2'
  ],
  dependencies,
  capabilities,
  policies: {
    no_unverified_model_claims: true,
    no_execution_without_capability: true,
    no_execution_without_decision: true,
    no_raw_merge: true,
    no_drift_required: true,
    tests_required: true,
    api_contract_required: true,
    pdp_required: true,
    pep_required: true,
    audit_required: true,
    human_review_for_high_risk: true
  },
  next_layer: 'SHEIKHA_EXECUTION_FABRIC_V2',
  next_layer_status: 'GATED_UNTIL_CAPABILITY_REGISTRY_V2_ACTIVE_100',
  principle: 'ولا حول ولا قوة إلا بالله'
};

const capabilityChecks = {
  dependenciesReady: Object.values(dependencies).every(Boolean),
  decisionRegistryReady: dependencies.decisionRegistryV2 === true,
  capabilityCountReady: capabilities.length >= 10,
  everyCapabilityHasDecisionRefs: capabilities.every((capability) =>
    Array.isArray(capability.decisionRefs) && capability.decisionRefs.length > 0
  ),
  everyDecisionRefResolvable: capabilities.every((capability) =>
    capability.decisionRefs.every((decisionId) => knownDecisionIds.has(decisionId))
  ),
  everyCapabilityHasPolicyRefs: capabilities.every((capability) =>
    Array.isArray(capability.policyRefs) && capability.policyRefs.length > 0
  ),
  everyCapabilityHasGuardrails: capabilities.every((capability) =>
    Array.isArray(capability.guardrails) && capability.guardrails.length > 0
  ),
  everyCapabilityMeasured: capabilities.every((capability) => Boolean(capability.measurement)),
  codexCapabilitiesActive: capabilities.filter((capability) => capability.domain === 'codex' && capability.status === 'ACTIVE').length >= 2,
  aiGatewayGoverned: capabilities.some((capability) => capability.id === 'CAP-CODEX-008' && capability.status === 'ACTIVE'),
  executionFabricGated: capabilities.some((capability) => capability.id === 'CAP-CODEX-010' && capability.status === 'GATED'),
  noUnverifiedModelClaim: registry.truthfulness_policy.external_model_activation_claim === false,
  noModelPullRequested:
    registry.truthfulness_policy.model_pull_requested === false &&
    registry.truthfulness_policy.provider_model_download_requested === false,
  capabilityActivationOnly: registry.truthfulness_policy.capability_activation_only === true
};

const missing = Object.entries(capabilityChecks).filter(([, ok]) => !ok).map(([key]) => key);

const report = {
  system: 'SHEIKHA_CAPABILITY_REGISTRY_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  arabicName: 'سجل قدرات شيخة V2',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_CAPABILITY_REGISTRY_GAPS' : 'CAPABILITY_REGISTRY_V2_ACTIVE_100',
  checks: capabilityChecks,
  missing,
  coverage: {
    capabilities: capabilities.length,
    activeCapabilities: capabilities.filter((capability) => capability.status === 'ACTIVE').length,
    gatedCapabilities: capabilities.filter((capability) => capability.status === 'GATED').length,
    codexCapabilities: capabilities.filter((capability) => capability.domain === 'codex').length,
    policyRefs: new Set(capabilities.flatMap((capability) => capability.policyRefs)).size,
    decisionRefs: new Set(capabilities.flatMap((capability) => capability.decisionRefs)).size
  },
  nextActions: [
    'Keep Execution Fabric V2 gated until this registry remains ACTIVE with score 100.',
    'Route every new AI or Codex operation through capability id, policy refs, and decision refs.',
    'Verify provider/model availability before making any external model claim.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson('runtime/capability-registry/v2/sheikha-capability-registry-v2.json', registry);
writeJson('runtime/capability-registry/v2/registries/capability-items.json', {
  registry: 'SHEIKHA_CAPABILITY_ITEMS_REGISTRY_V2',
  status: 'ACTIVE',
  items: capabilities
});
writeJson('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json', report);
writeText(
  'runtime/capability-registry/v2/sheikha-capability-registry-v2-report.md',
  `# SHEIKHA_CAPABILITY_REGISTRY_V2

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- القدرات: ${report.coverage.capabilities}
- القدرات النشطة: ${report.coverage.activeCapabilities}
- القدرات المحجوبة: ${report.coverage.gatedCapabilities}
- قدرات Codex: ${report.coverage.codexCapabilities}
- مراجع السياسات: ${report.coverage.policyRefs}
- مراجع القرارات: ${report.coverage.decisionRefs}

## الفحوص
${Object.entries(capabilityChecks).map(([key, value]) => `- ${value ? '✅' : '❌'} ${key}`).join('\n')}

## التالي
${report.nextActions.map((item, index) => `${index + 1}. ${item}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
