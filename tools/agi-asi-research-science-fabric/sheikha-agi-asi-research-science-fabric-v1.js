'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/agi-asi-research-science-fabric/v1';
const REPORT_JSON = `${RUNTIME_DIR}/sheikha-agi-asi-research-science-fabric-v1-report.json`;
const REPORT_MD = `${RUNTIME_DIR}/sheikha-agi-asi-research-science-fabric-v1-report.md`;

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function writeFile(relativePath, content) {
  const fullPath = resolvePath(relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function includesAll(values, requiredValues) {
  const available = new Set(values || []);
  return requiredValues.every((value) => available.has(value));
}

function routeMounted(routes) {
  return routes.find((route) => (
    route.name === 'agi-asi-research-science-fabric-v1' &&
    route.mount === '/api/research/agi-asi-science-fabric' &&
    route.module === 'routes/agi-asi-research-science-fabric/status.routes.js' &&
    route.priority >= 242
  ));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-agi-asi-research-science-fabric-v1.json`);
const frontier = readJson(`${RUNTIME_DIR}/registries/frontier-research-evidence-registry.json`);
const scientificCycle = readJson(`${RUNTIME_DIR}/registries/scientific-method-cycle-registry.json`);
const experimentGovernance = readJson(`${RUNTIME_DIR}/registries/experiment-and-evaluation-governance.json`);
const curriculum = readJson(`${RUNTIME_DIR}/registries/science-curriculum-production-registry.json`);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const route = routeMounted(fabric.routes || []);

const requiredCapabilities = [
  'agi_research_program_governance',
  'asi_risk_research_governance',
  'frontier_research_evidence_tracking',
  'scientific_method_cycle',
  'hypothesis_to_experiment_pipeline',
  'validated_vs_under_test_classification',
  'research_report_generation',
  'scientific_curriculum_development',
  'methodology_innovation',
  'experiment_reproducibility_gate',
  'safety_alignment_evaluation_gate',
  'quran_sunnah_truthfulness_itqan_governance',
  'sdk_fabric_mcp_research_tool_readiness'
];

const requiredCycle = [
  'moral_intention_and_no_harm_gate',
  'question_definition',
  'source_and_prior_art_review',
  'hypothesis_generation',
  'experiment_design',
  'risk_and_alignment_review',
  'tool_and_data_authorization',
  'experiment_execution',
  'measurement_and_evaluation',
  'reproducibility_check',
  'peer_or_expert_review',
  'validated_under_test_or_rejected_classification',
  'research_report_generation',
  'knowledge_registry_update',
  'curriculum_and_methodology_update',
  'next_iteration_planning'
];

const requiredExperimentTracks = [
  'agentic_long_horizon_tasks',
  'traditional_rag_grounding',
  'multi_agent_research_review',
  'algorithm_discovery_refinement_loop',
  'abstract_reasoning_generalization'
];

const requiredCurriculumTracks = [
  'foundations_of_truthfulness_and_no_harm',
  'ai_research_methodology',
  'rag_and_evidence_grounding',
  'agentic_ai_experimentation',
  'multi_agent_systems_governance',
  'agi_research_benchmarks',
  'asi_risk_governance',
  'alignment_and_safety_evaluation',
  'scientific_reporting_and_reproducibility',
  'industrial_and_commercial_ai_readiness'
];

const experimentTrackNames = (experimentGovernance.experiment_tracks || []).map((track) => track.name);
const sourceDatesComplete = (frontier.evidence_items || []).every((item) =>
  item.id &&
  item.title &&
  item.url &&
  item.status &&
  item.agi_asi_claim === false
);

const dependencies = {
  quranSunnahGovernance: exists('runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-v1.json'),
  intelligenceIntegrationFabric: exists('runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1-report.json'),
  rootKnowledgeAgenticFabric: exists('runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1-report.json'),
  platformFactories: exists('runtime/platform-factories/v1/sheikha-platform-factories-v1-report.json'),
  sdkFabricMcpIntegration: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  ugitAiControlPlane: exists('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'),
  runtimeAdmissionController: exists('tools/governance/runtime-admission-controller.js'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry.system === 'SHEIKHA_AGI_ASI_RESEARCH_SCIENCE_FABRIC_V1' &&
    registry.status === 'ACTIVE',
  capabilitiesComplete: includesAll(registry.capabilities, requiredCapabilities),
  truthfulnessPolicy: registry.truthfulness &&
    registry.truthfulness.architecture_and_readiness_only === true &&
    registry.truthfulness.no_actual_agi_claim === true &&
    registry.truthfulness.no_actual_asi_claim === true &&
    registry.truthfulness.no_consciousness_claim === true &&
    registry.truthfulness.no_superhuman_capability_claim === true &&
    registry.truthfulness.no_scientific_breakthrough_claim_without_peer_or_internal_review === true &&
    registry.truthfulness.no_latest_research_claim_without_source_date === true,
  quranSunnahGovernanceBound: registry.quran_sunnah_governance &&
    registry.quran_sunnah_governance.truthfulness === true &&
    registry.quran_sunnah_governance.no_harm === true &&
    registry.quran_sunnah_governance.itqan === true &&
    registry.quran_sunnah_governance.system_is_tool_not_religious_authority === true,
  frontierRegistryActive: frontier.status === 'ACTIVE',
  frontierEvidenceComplete: (frontier.evidence_items || []).length >= 6 &&
    sourceDatesComplete,
  frontierClassificationsSafe: frontier.classifications &&
    includesAll(frontier.classifications.not_claimed, [
      'actual_agi',
      'actual_asi',
      'machine_consciousness',
      'unrestricted_autonomous_scientific_authority'
    ]),
  scientificCycleActive: scientificCycle.status === 'ACTIVE',
  scientificCycleComplete: includesAll(scientificCycle.cycle, requiredCycle),
  scientificQualityGatesComplete: (scientificCycle.quality_gates || []).length >= 10,
  experimentGovernanceActive: experimentGovernance.status === 'ACTIVE',
  experimentTracksComplete: includesAll(experimentTrackNames, requiredExperimentTracks),
  experimentGatesSafe: experimentGovernance.evaluation_gates &&
    experimentGovernance.evaluation_gates.no_private_data_without_rights === true &&
    experimentGovernance.evaluation_gates.no_external_execution_without_authorization === true &&
    experimentGovernance.evaluation_gates.no_benchmark_claim_without_version === true &&
    experimentGovernance.evaluation_gates.no_improvement_claim_without_baseline === true &&
    experimentGovernance.evaluation_gates.no_release_without_safety_review === true &&
    experimentGovernance.evaluation_gates.human_review_for_agi_asi_language === true,
  curriculumRegistryActive: curriculum.status === 'ACTIVE',
  curriculumPipelineComplete: (curriculum.production_pipeline || []).length >= 10,
  curriculumTracksComplete: includesAll(curriculum.curriculum_tracks, requiredCurriculumTracks),
  curriculumReleaseGatesSafe: curriculum.release_gates &&
    curriculum.release_gates.education_content_reviewed === true &&
    curriculum.release_gates.scientific_claims_sourced === true &&
    curriculum.release_gates.agi_asi_claims_blocked === true &&
    curriculum.release_gates.public_release_requires_governance_approval === true,
  fabricRouteMounted: Boolean(route)
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missingChecks = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missing = [
  ...missingDependencies.map((key) => `dependency:${key}`),
  ...missingChecks.map((key) => `check:${key}`)
];

const report = {
  system: 'SHEIKHA_AGI_ASI_RESEARCH_SCIENCE_FABRIC_V1',
  status: missing.length === 0 ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5),
  decision: missing.length === 0
    ? 'AGI_ASI_RESEARCH_SCIENCE_FABRIC_ACTIVE_100'
    : 'AGI_ASI_RESEARCH_SCIENCE_FABRIC_REVIEW_REQUIRED',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    capabilities: (registry.capabilities || []).length,
    frontierEvidenceItems: (frontier.evidence_items || []).length,
    scientificCycleSteps: (scientificCycle.cycle || []).length,
    scientificQualityGates: (scientificCycle.quality_gates || []).length,
    experimentTracks: (experimentGovernance.experiment_tracks || []).length,
    resultStatuses: (experimentGovernance.result_statuses || []).length,
    curriculumPipelineSteps: (curriculum.production_pipeline || []).length,
    curriculumTracks: (curriculum.curriculum_tracks || []).length,
    improvementLoopSteps: (curriculum.improvement_loop || []).length
  },
  researchStatus: {
    actualAgiReached: false,
    actualAsiReached: false,
    currentState: 'RESEARCH_EXPERIMENTATION_AND_GOVERNED_READINESS',
    validatedOrReported: frontier.classifications.validated_or_reported,
    underTest: frontier.classifications.under_test,
    notClaimed: frontier.classifications.not_claimed
  },
  cycle: [
    'QURAN_SUNNAH_TRUTHFULNESS_NO_HARM_ITQAN',
    'QUESTION',
    'SOURCE_REVIEW',
    'HYPOTHESIS',
    'EXPERIMENT',
    'EVALUATION',
    'REPRODUCIBILITY',
    'EXPERT_REVIEW',
    'REPORT',
    'KNOWLEDGE_UPDATE',
    'CURRICULUM_UPDATE',
    'NEXT_ITERATION'
  ],
  route: route || null,
  nextActions: [
    'Turn each frontier evidence item into a Sheikha hypothesis card and experiment protocol.',
    'Create reproducibility notes for each internal experiment before any public claim.',
    'Connect validated findings to Science Factory, Education Factory, and Knowledge Engine.',
    'Keep AGI and ASI as research targets and risk-governance classifications until independently evidenced.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFile(
  REPORT_MD,
  `# SHEIKHA_AGI_ASI_RESEARCH_SCIENCE_FABRIC_V1

## Status
- System: ${report.system}
- Status: ${report.status}
- Score: ${report.score}
- Decision: ${report.decision}

## Research Position
- Actual AGI reached: no
- Actual ASI reached: no
- Current state: ${report.researchStatus.currentState}

## Scientific Cycle
${report.cycle.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Evidence Coverage
- Frontier evidence items: ${report.coverage.frontierEvidenceItems}
- Scientific cycle steps: ${report.coverage.scientificCycleSteps}
- Experiment tracks: ${report.coverage.experimentTracks}
- Curriculum tracks: ${report.coverage.curriculumTracks}

## Runtime Route
- \`/api/research/agi-asi-science-fabric/status\`

## Truthfulness
This fabric activates governed research, experimentation, reporting, curricula, and improvement toward AGI/ASI readiness. It does not claim actual AGI, ASI, consciousness, or superhuman capability.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
