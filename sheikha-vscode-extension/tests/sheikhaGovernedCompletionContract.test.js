'use strict';

const {
  COMPLETION_CONTRACT,
  buildGovernedCompletionContract,
  isGovernedCompletionRequested,
  isScientificCalculationRequested,
  isEditorialProductionRequested
} = require('../src/chat/sheikhaGovernedCompletionContract');

describe('Sheikha governed completion contract', () => {
  test.each([
    'نفّذ إلى النهاية',
    'اكمل حتى الجاهزية',
    'أكمل كاملاً',
    'finish end-to-end'
  ])('recognizes an explicit completion request: %s', (message) => {
    expect(isGovernedCompletionRequested(message)).toBe(true);
  });

  test('does not reinterpret ordinary chat as an execution request', () => {
    expect(isGovernedCompletionRequested('اشرح حالة المشروع')).toBe(false);
  });

  test.each([
    'حل هذه المسألة الحسابية مع الوحدات',
    'طبق المنهج العلمي على الفرضية',
    'verify this scientific experiment'
  ])('recognizes scientific or calculation work: %s', (message) => {
    expect(isScientificCalculationRequested(message)).toBe(true);
  });

  test('requires a reproducible ordered scientific calculation method', () => {
    const contract = buildGovernedCompletionContract(
      'أكمل التحليل العلمي والحساب إلى النهاية'
    );

    expect(contract.scientificCalculationRequested).toBe(true);
    expect(contract.scientificMethod.strictOrder).toBe(true);
    expect(contract.scientificMethod.lifecycle[0])
      .toBe('DEFINE_QUESTION_AND_SCOPE');
    expect(contract.scientificMethod.lifecycle.at(-1))
      .toBe('REPORT_RESULT_LIMITS_AND_EVIDENCE');
    expect(contract.scientificMethod.calculationRules)
      .toContain('never_invent_missing_measurements');
  });

  test.each([
    'حرر نتيجة البحث مع المصادر',
    'وثق الديوان البرمجي والاختبارات',
    'edit this software codebase report'
  ])('recognizes governed editorial production: %s', (message) => {
    expect(isEditorialProductionRequested(message)).toBe(true);
  });

  test('requires provenance and verification for documents and software', () => {
    const contract = buildGovernedCompletionContract(
      'أكمل تحرير البحث والديوان البرمجي إلى النهاية'
    );

    expect(contract.editorialProductionRequested).toBe(true);
    expect(contract.editorialProduction.strictOrder).toBe(true);
    expect(contract.editorialProduction.requiredSections)
      .toContain('revision_log');
    expect(contract.editorialProduction.requiredSections)
      .toContain('provenance');
    expect(contract.editorialProduction.softwareRules)
      .toContain('add_or_update_tests');
    expect(contract.editorialProduction.artifactFormats)
      .toContain('SOURCE_PATCH');
  });

  test('continues safe work without turning the phrase into broad approval', () => {
    const contract = buildGovernedCompletionContract('نفذ إلى النهاية');

    expect(contract).toMatchObject({
      contract: COMPLETION_CONTRACT,
      requested: true,
      safeContinuationAllowed: true,
      requestIsNotHighImpactApproval: true,
      defaultAuthorization: 'DENY',
      humanFinalDecision: true,
      automatedFatwaAllowed: false,
      completionClaimRequiresTerminalEvidence: true
    });
    expect(contract.lifecycle).toEqual([
      'DISCOVER',
      'PLAN',
      'IMPLEMENT_SCOPED_PATCH',
      'VERIFY',
      'REPORT_TERMINAL_STATE'
    ]);
    expect(contract.strictOrder).toBe(true);
    expect(contract.phaseGates.VERIFY).toEqual([
      'syntax',
      'targeted_tests',
      'lint_or_static_checks'
    ]);
    expect(contract.phaseGates.REPORT_TERMINAL_STATE)
      .toContain('remaining_limits');
    expect(contract.governanceValues).toEqual(expect.arrayContaining([
      'JUSTICE',
      'TRUSTWORTHINESS',
      'VERIFICATION',
      'NO_HARM'
    ]));
    expect(contract.allowedWithoutAdditionalApproval)
      .toContain('WRITE_SCOPED_WORKSPACE_PATCH');
    expect(contract.noGenericProgressOnlyAnswer).toBe(true);
    expect(contract.preserveUnrelatedChanges).toBe(true);
    expect(contract.allowedWithoutAdditionalApproval).toContain('RUN_ALREADY_APPROVED_TESTS');
    expect(contract.approvalRequired).toEqual(expect.arrayContaining([
      'ARBITRARY_SHELL',
      'INSTALL_SOFTWARE',
      'EXTERNAL_PUBLISH',
      'HIGH_IMPACT_SYSTEM_CHANGE'
    ]));
  });
});
