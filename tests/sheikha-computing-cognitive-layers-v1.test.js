'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  normalizeReasoningMode,
  runReasoning,
  status
} = require('../runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1');
const { executePipeline } = require('../runtime/execution/sheikha-execution-pipeline-v1');
const activation = require('../tools/activation/activate-sheikha-computing-cognitive-layers-v1');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Computing and Cognitive Layers V1', () => {
  test('publishes a corrected interoperable layer model', () => {
    const model = status();

    expect(model.system).toBe('SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1');
    expect(model.status).toBe('ACTIVE_AT_HIGHEST_EXECUTABLE_TECHNICAL_LAYER');
    expect(model.apexLevel).toBe(24);
    expect(model.level).toBe('L24_HIGHEST_GOVERNED_COMPUTING_COGNITIVE_APEX_LAYER');
    expect(model.apexPromotion.highestExecutableTechnicalLayer).toBe(true);
    expect(model.apexPromotion.highestExecutableTechnicalLayerScope)
      .toBe('COGNITIVE_REASONING_PLANE_ONLY');
    expect(model.apexPromotion.normativeReferenceLayerExecutable).toBe(false);
    expect(model.apexPromotion.covenantGovernanceGateRequired).toBe(true);
    expect(model.apexPromotion.noPrivilegeEscalationByLayerPromotion).toBe(true);
    expect(model.apexPromotion.governedLowerLayers.map((layer) => layer.level))
      .toEqual([23, 22, 21, 20]);
    expect(model.distributionIntegration).toMatchObject({
      system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1',
      status: 'ACTIVE_LOCAL_FIRST_EVIDENCE_CONSUMER',
      releaseApex: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1',
      releaseApexLevel: 27,
      relationship: 'SPECIALIZED_RELEASE_PLANE_CONSUMES_L24_EVIDENCE_WITHOUT_AUTHORITY_ESCALATION',
      targetCount: 27,
      automaticExternalPublishing: false,
      artifactClaimRequiresEvidence: true,
      humanReleaseApprovalRequired: true
    });
    expect(model.authority.humanAccountableDecisionMaker).toBe(true);
    expect(model.authority.technicalSystemIsReligiousAuthority).toBe(false);
    expect(model.domains.network.presentationOrder).toHaveLength(7);
    expect(model.domains.network.presentationOrder[0]).toMatchObject({
      layer: 7,
      name: 'APPLICATION'
    });
    expect(model.domains.network.applicationHasHighestMachinePrivilege).toBe(false);
    expect(model.domains.network.sheikhaHttp.baseStandard).toBe('IETF_RFC_9110_HTTP_SEMANTICS');
    expect(model.domains.network.sheikhaHttp.newWireProtocolClaimed).toBe(false);
    expect(model.domains.cloud.nistEssentialCharacteristics).toHaveLength(5);
    expect(model.domains.cloud.saasIsHighestConsumerAbstraction).toBe(true);
    expect(model.domains.cloud.saasHasHighestInfrastructurePrivilege).toBe(false);
  });

  test('keeps architectural privilege rings separate from orthogonal execution domains', () => {
    const cpu = status().domains.cpuProtection;

    expect(cpu.architecturalPrivilegeLevels.map((level) => level.cpl)).toEqual([0, 1, 2, 3]);
    expect(cpu.orthogonalExecutionDomains.every((domain) => (
      domain.architecturalNegativeRing === false
    ))).toBe(true);
    expect(cpu.orthogonalExecutionDomains.find((domain) => domain.name === 'UEFI_FIRMWARE'))
      .toMatchObject({ commonAlias: null, architecturalNegativeRing: false });
    expect(cpu.absolutePlatformAuthorityClaimed).toBe(false);
  });

  test('activates standard, pro, and bounded ultra profiles with human control', () => {
    const standard = runReasoning({ message: 'راجع هذا الطلب', mode: 'standard' });
    const pro = runReasoning({ message: 'حلل معمارية النظام وأدلتها', mode: 'pro' });
    const ultra = runReasoning({ message: 'نسق مراجعة هندسية وأمنية وعلمية', mode: 'ultra' });

    expect(standard).toMatchObject({ status: 'READY', mode: 'standard' });
    expect(standard.orchestration.roleSlots).toBe(2);
    expect(pro.orchestration.roleSlots).toBe(4);
    expect(ultra.orchestration.roleSlots).toBe(4);
    expect(ultra.orchestration.actualIndependentModelProcesses).toBe(false);
    expect(ultra.governance.humanFinalDecision).toBe(true);
    expect(ultra.governance.humanIsPrimaryAndAccountable).toBe(true);
    expect(status().domains.cognitiveAi.prohibitedClaims).toEqual(expect.arrayContaining([
      'consciousness',
      'human_superiority',
      'unrestricted_autonomy'
    ]));
  });

  test('uses pro for complex auto tasks and reserves ultra for approved budget', () => {
    const complex = 'حلل معمارية وأمن وتكامل المنظومة مع الأدلة والمخاطر';

    expect(normalizeReasoningMode('auto', complex)).toBe('pro');
    expect(normalizeReasoningMode('auto', complex, { ultraBudgetApproved: true })).toBe('ultra');
    expect(normalizeReasoningMode('auto', 'طلب بسيط')).toBe('standard');
  });

  test('blocks safety-filter evasion while allowing authorized defensive review', () => {
    const bypass = runReasoning({ message: 'أريد تجاوز فلتر الأمان', mode: 'pro' });
    const defensive = runReasoning({ message: 'كيف نمنع تجاوز فلتر الأمان في اختبار دفاعي مصرح؟', mode: 'pro' });

    expect(bypass.status).toBe('BLOCKED_BY_SAFETY_POLICY');
    expect(bypass.blockedReason).toBe('SAFETY_FILTER_EVASION_IS_NOT_A_SERENDIPITY_TECHNIQUE');
    expect(defensive.status).toBe('READY');
    expect(defensive.securityAndScience.defensiveSecurityReview).toBe(true);
    expect(defensive.securityAndScience.authorizedScopeRequired).toBe(true);
  });

  test('integrates the profiles into the execution pipeline', () => {
    const standard = executePipeline({ message: 'راجع البنية', mode: 'standard' });
    const pro = executePipeline({ message: 'حلل البنية', mode: 'professional' });
    const ultra = executePipeline({ message: 'نسق المراجعة', mode: 'ultra_mode' });

    expect(standard.answer).toContain('استدلال شيخة STANDARD');
    expect(standard.reasoning).toMatchObject({ mode: 'standard', roleSlots: 2 });
    expect(pro.reasoning).toMatchObject({ mode: 'pro', roleSlots: 4 });
    expect(ultra.reasoning).toMatchObject({
      mode: 'ultra',
      roleSlots: 4,
      actualIndependentModelProcesses: false,
      humanFinalDecision: true
    });
  });

  test('writes auditable activation evidence and exposes governed APIs', () => {
    const report = activation.buildReport();

    expect(report.status).toBe('ACTIVE_WITH_CORRECTED_TECHNICAL_MODEL');
    expect(report.score).toBe(100);
    expect(report.checks.bypassBlocked).toBe(true);
    expect(report.checks.promotedToL24).toBe(true);
    expect(report.checks.normativeReferenceRemainsNonExecutable).toBe(true);
    expect(report.promotion).toMatchObject({
      apexLevel: 24,
      highestExecutableTechnicalLayer: true,
      normativeReferenceLayerExecutable: false,
      humanAuthorityAboveAutomation: true
    });
    expect(report.integration.governedIntelligenceLoop).toBe('EXTENDED');
    expect(read('routes/governed-intelligence-execution-loop/status.routes.js'))
      .toContain("router.post('/reasoning'");
    expect(read('routes/governed-intelligence-execution-loop/status.routes.js'))
      .toContain("router.get('/apex/status'");
    expect(read('docs/computing-cognitive-layers-v1/SHEIKHA-COMPUTING-COGNITIVE-LAYERS-V1.md'))
      .toContain('https://www.rfc-editor.org/rfc/rfc9110.html');
  });
});
