'use strict';

const COMPLETION_CONTRACT = 'SHEIKHA_GOVERNED_COMPLETION_CONTRACT_V1';

const COMPLETION_PATTERNS = Object.freeze([
  /(?:نفذ|نفّذ|اكمل|أكمل|استمر)\s+(?:إلى|الى|حتى)\s+(?:النهاية|الاكتمال|الجاهزية)/iu,
  /(?:نفذ|نفّذ|اكمل|أكمل|اصلح|أصلح).{0,160}(?:النهاية|الاكتمال|الجاهزية|اختبارات|التحقق)/iu,
  /(?:اكمل|أكمل)\s+(?:كامل(?:اً|ا)?|للنهاية)/iu,
  /(?:complete|execute|finish|continue)\s+(?:to\s+the\s+end|end[- ]to[- ]end|fully)/iu
]);

const SCIENCE_PATTERNS = Object.freeze([
  /(?:علوم|علمي|منهج(?:ية)? علمية|بحث|تجربة|فرضية|science|scientific|research|experiment)/iu,
  /(?:حساب|رياضيات|معادلة|إحصاء|قياس|وحدات|math|calculation|equation|statistics|measurement)/iu
]);

const EDITORIAL_PATTERNS = Object.freeze([
  /(?:حرر|حرّر|تحرير|وثق|وثّق|توثيق|بحث|دراسة|تقرير|ديوان|وثيقة|مخطوط|edit|document|report|manuscript)/iu,
  /(?:برمجيات|كود|شفرة|مستودع|codebase|software|source code)/iu
]);

function isScientificCalculationRequested(message) {
  const text = String(message || '').trim();
  return Boolean(text) && SCIENCE_PATTERNS.some((pattern) => pattern.test(text));
}

function isEditorialProductionRequested(message) {
  const text = String(message || '').trim();
  return Boolean(text) && EDITORIAL_PATTERNS.some((pattern) => pattern.test(text));
}

function isGovernedCompletionRequested(message) {
  const text = String(message || '').trim();
  return Boolean(text) && COMPLETION_PATTERNS.some((pattern) => pattern.test(text));
}

function buildGovernedCompletionContract(message) {
  const requested = isGovernedCompletionRequested(message);
  const scientificCalculationRequested =
    isScientificCalculationRequested(message);
  const editorialProductionRequested =
    isEditorialProductionRequested(message);
  return Object.freeze({
    contract: COMPLETION_CONTRACT,
    requested,
    mode: requested ? 'CONTINUE_SAFE_STEPS_TO_TERMINAL_EVIDENCE' : 'STANDARD_REQUEST',
    safeContinuationAllowed: requested,
    strictOrder: true,
    scientificCalculationRequested,
    editorialProductionRequested,
    lifecycle: Object.freeze([
      'DISCOVER',
      'PLAN',
      'IMPLEMENT_SCOPED_PATCH',
      'VERIFY',
      'REPORT_TERMINAL_STATE'
    ]),
    terminalStates: Object.freeze([
      'COMPLETED_WITH_EVIDENCE',
      'BLOCKED_WITH_EXACT_REQUIREMENT',
      'FAILED_WITH_DIAGNOSTIC_EVIDENCE'
    ]),
    phaseGates: Object.freeze({
      DISCOVER: Object.freeze(['workspace_context', 'existing_patterns', 'constraints']),
      PLAN: Object.freeze(['scope', 'files', 'verification']),
      IMPLEMENT_SCOPED_PATCH: Object.freeze(['scoped_changes', 'preserve_unrelated_changes']),
      VERIFY: Object.freeze(['syntax', 'targeted_tests', 'lint_or_static_checks']),
      REPORT_TERMINAL_STATE: Object.freeze([
        'terminal_state',
        'changed_files',
        'verification_evidence',
        'remaining_limits'
      ])
    }),
    scientificMethod: Object.freeze({
      strictOrder: true,
      lifecycle: Object.freeze([
        'DEFINE_QUESTION_AND_SCOPE',
        'IDENTIFY_VARIABLES_UNITS_AND_ASSUMPTIONS',
        'COLLECT_TRACEABLE_EVIDENCE',
        'DISTINGUISH_FACT_HYPOTHESIS_AND_INFERENCE',
        'SELECT_METHOD_AND_MODEL',
        'CALCULATE_WITH_DIMENSIONAL_CHECKS',
        'RECALCULATE_AND_CROSS_CHECK',
        'ANALYZE_UNCERTAINTY_AND_SENSITIVITY',
        'TEST_REPRODUCIBILITY_AND_FALSIFIABILITY',
        'INDEPENDENT_REVIEW',
        'REPORT_RESULT_LIMITS_AND_EVIDENCE'
      ]),
      calculationRules: Object.freeze([
        'declare_inputs_and_units',
        'show_formula_or_algorithm',
        'preserve_precision_until_final_rounding',
        'check_dimensions_and_bounds',
        'cross_check_with_independent_method_when_practical',
        'report_uncertainty_and_rounding',
        'never_invent_missing_measurements'
      ]),
      claimPolicy:
        'No claim of complete science or certain result without reproducible evidence and qualified review.'
    }),
    editorialProduction: Object.freeze({
      strictOrder: true,
      lifecycle: Object.freeze([
        'DEFINE_AUDIENCE_PURPOSE_AND_FORMAT',
        'INVENTORY_EXISTING_MATERIAL',
        'TRACE_SOURCES_FACTS_AND_LICENSES',
        'BUILD_LOGICAL_OUTLINE',
        'DRAFT_WITH_SCIENCE_AND_CALCULATION',
        'EDIT_STRUCTURE_LANGUAGE_AND_TERMINOLOGY',
        'VERIFY_CITATIONS_CALCULATIONS_AND_CODE',
        'RECORD_REVISIONS_AND_PROVENANCE',
        'PRODUCE_REVIEWABLE_ARTIFACT',
        'FINAL_HUMAN_REVIEW'
      ]),
      requiredSections: Object.freeze([
        'title_and_scope',
        'executive_summary',
        'question_and_method',
        'sources_and_evidence',
        'logic_and_calculations',
        'result',
        'limitations_and_uncertainty',
        'revision_log',
        'provenance'
      ]),
      softwareRules: Object.freeze([
        'identify_repository_files_and_ownership',
        'express_changes_as_scoped_patch',
        'document_interfaces_inputs_outputs_and_dependencies',
        'add_or_update_tests',
        'record_commands_and_results',
        'preserve_unrelated_work',
        'no_release_claim_without_build_and_runtime_evidence'
      ]),
      artifactFormats: Object.freeze([
        'MARKDOWN',
        'SOURCE_PATCH',
        'TEST_EVIDENCE',
        'CHANGELOG',
        'PROVENANCE_RECORD'
      ])
    }),
    allowedWithoutAdditionalApproval: Object.freeze([
      'ANALYZE',
      'READ_WORKSPACE_CONTEXT',
      'WRITE_SCOPED_WORKSPACE_PATCH',
      'RUN_READ_ONLY_VERIFICATION',
      'RUN_ALREADY_APPROVED_TESTS',
      'REPORT_EVIDENCE'
    ]),
    approvalRequired: Object.freeze([
      'ARBITRARY_SHELL',
      'WRITE_OUTSIDE_APPROVED_WORKSPACE',
      'INSTALL_SOFTWARE',
      'USE_PRIVILEGE_ESCALATION',
      'EXTERNAL_PUBLISH',
      'DELETE_OR_REVERT_USER_WORK',
      'ACCESS_OR_EXPOSE_SECRETS',
      'HIGH_IMPACT_SYSTEM_CHANGE'
    ]),
    requestIsNotHighImpactApproval: true,
    defaultAuthorization: 'DENY',
    humanFinalDecision: true,
    automatedFatwaAllowed: false,
    governanceValues: Object.freeze([
      'JUSTICE',
      'TRUSTWORTHINESS',
      'TRUTHFULNESS',
      'CONTRACT_FULFILMENT',
      'VERIFICATION',
      'NO_HARM'
    ]),
    completionClaimRequiresTerminalEvidence: true,
    noGenericProgressOnlyAnswer: requested,
    preserveUnrelatedChanges: true,
    reportChangedFilesAndVerification: true
  });
}

module.exports = {
  COMPLETION_CONTRACT,
  COMPLETION_PATTERNS,
  buildGovernedCompletionContract,
  isGovernedCompletionRequested,
  isScientificCalculationRequested,
  isEditorialProductionRequested
};
