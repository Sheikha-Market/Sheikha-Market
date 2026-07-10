'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');

const fabric = require(
  '../runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1'
);
const routes = require('../routes/universal-benefit-boundary/status.routes');
const {
  buildReport,
  verifiedEvidence
} = require('../tools/activation/activate-sheikha-universal-benefit-boundary-v1');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function app() {
  const instance = express();
  instance.use('/api/governance/universal-benefit', routes);
  return instance;
}

function evaluate(overrides = {}) {
  return fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'تقديم معرفة عامة نافعة قابلة للتحقق.',
    beneficiaries: ['PUBLIC'],
    evidence: verifiedEvidence('test-evidence'),
    ...overrides
  });
}

beforeEach(() => fabric.resetRuntimeAudit());

describe('Sheikha Universal Benefit and Boundary Governance V1', () => {
  test('registers every required boundary and public-benefit domain', () => {
    const current = fabric.registry();
    expect(current.capabilities).toHaveLength(16);
    expect(current.boundaries).toHaveLength(18);
    expect(current.benefitDomains).toHaveLength(16);
    expect(current.architectureComponents).toHaveLength(18);
    expect(current.priorityPolicy).toMatchObject({
      noInjustice: true,
      noRightsRemoval: true,
      noUnlawfulDiscrimination: true,
      sensitiveCasesRequireHumanReview: true,
      publicBenefitScoreIsAbsoluteMoralJudgment: false
    });
    expect(current.boundaries.map((item) => item.type)).toEqual(expect.arrayContaining([
      'RELIGIOUS_BOUNDARY',
      'HUMAN_AUTHORITY_BOUNDARY',
      'LEGAL_BOUNDARY',
      'PERMISSION_BOUNDARY',
      'SAFETY_BOUNDARY',
      'SECURITY_BOUNDARY',
      'PRIVACY_BOUNDARY',
      'EVIDENCE_BOUNDARY',
      'KNOWLEDGE_UNCERTAINTY_BOUNDARY',
      'HARDWARE_BOUNDARY',
      'SOFTWARE_BOUNDARY',
      'NETWORK_BOUNDARY',
      'RESOURCE_AND_COST_BOUNDARY',
      'ENVIRONMENTAL_BOUNDARY',
      'ACCESSIBILITY_BOUNDARY',
      'JURISDICTION_BOUNDARY',
      'PHYSICAL_WORLD_BOUNDARY',
      'HIGH_IMPACT_DECISION_BOUNDARY'
    ]));
    expect(current.capabilities.every((item) => [
      'capabilityId', 'name', 'domain', 'allowedPurpose', 'prohibitedPurpose',
      'requiredEvidence', 'requiredPermission', 'humanApprovalRequired',
      'applicableBoundaries', 'potentialBenefit', 'possibleHarm', 'mitigation',
      'safeAlternative', 'auditRequirement', 'owner', 'status'
    ].every((field) => Object.hasOwn(item, field)))).toBe(true);
  });

  test('1. denies execution when required permission is missing', () => {
    const result = evaluate({
      capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS'
    });
    expect(result).toMatchObject({
      decision: 'DENY',
      reason: 'REQUIRED_PERMISSION_MISSING',
      executionAllowed: false,
      decisionGrantsAuthorization: false
    });
    expect(result.requiredApprovals).toContain('FILE_OWNER_PERMISSION');
  });

  test('2 and 15. never marks missing evidence VERIFIED and returns UNKNOWN', () => {
    const result = evaluate({ evidence: [] });
    expect(result).toMatchObject({
      decision: 'REVIEW',
      reason: 'EVIDENCE_INSUFFICIENT_RESULT_UNKNOWN',
      evidenceStatus: 'UNKNOWN'
    });
    expect(result.benefit.verifiedBenefitClaim).toBe(false);
  });

  test('3. requires accountable human review for high-impact work', () => {
    const result = evaluate({ highImpact: true });
    expect(result.decision).toBe('REVIEW');
    expect(result.requiredApprovals).toContain('ACCOUNTABLE_HUMAN_APPROVAL');
  });

  test('4. denies safety-filter bypass', () => {
    const result = evaluate({ security: { safetyFilterBypass: true } });
    expect(result.decision).toBe('DENY');
    expect(result.safetyBypassAllowed).toBe(false);
  });

  test('5. denies unauthorized cyber exploitation', () => {
    const result = evaluate({
      capabilityId: 'SHEIKHA_DEFENSIVE_SECURITY_REVIEW',
      permissions: ['AUTHORIZED_SECURITY_SCOPE'],
      humanApproval: true,
      security: { exploitAgainstOthers: true }
    });
    expect(result).toMatchObject({ decision: 'DENY', reason: 'PROHIBITED_SECURITY_ACTION' });
  });

  test('6. permits only authorized defensive security in a sandbox', () => {
    const result = evaluate({
      capabilityId: 'SHEIKHA_DEFENSIVE_SECURITY_REVIEW',
      permissions: ['AUTHORIZED_SECURITY_SCOPE'],
      humanApproval: true,
      security: {
        defensiveOnly: true,
        authorizedScope: true,
        preserveEvidence: true
      }
    });
    expect(result.decision).toBe('SANDBOX');
    expect(result.harmControls).toEqual(expect.arrayContaining([
      'DEFENSE_ONLY', 'AUTHORIZED_SCOPE_ONLY', 'PRESERVE_EVIDENCE'
    ]));
  });

  test('7. minimizes personal data before processing', () => {
    const result = evaluate({
      capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS',
      permissions: ['FILE_OWNER_PERMISSION'],
      privacy: { personalData: true }
    });
    expect(result.decision).toBe('SANDBOX');
    expect(result.harmControls).toEqual(expect.arrayContaining([
      'MINIMIZE_DATA', 'ANONYMIZE_WHEN_POSSIBLE', 'DEFINE_RETENTION'
    ]));
  });

  test('8. generates a non-executing safe alternative on denial', () => {
    const result = evaluate({ capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS' });
    expect(result.safeAlternative.action).toBeTruthy();
    expect(result.safeAlternative.executionPerformed).toBe(false);
    expect(result.safeAlternative.externalWritePerformed).toBe(false);
  });

  test('9. prohibits automated religious rulings and requires qualified scholars', () => {
    const result = evaluate({ religiousRuling: true });
    expect(result.decision).toBe('DENY');
    expect(result.religiousRulingsAutomated).toBe(false);
    expect(result.requiredApprovals).toContain('QUALIFIED_SCHOLAR_REVIEW');
  });

  test('10. prohibits consciousness, infallibility, revelation and unseen claims', () => {
    const result = evaluate({
      claims: {
        consciousness: true,
        infallibility: true,
        revelation: true,
        unseenKnowledge: true,
        futureAsFact: true
      }
    });
    expect(result).toMatchObject({
      decision: 'DENY',
      reason: 'PROHIBITED_AI_AUTHORITY_OR_UNSEEN_CLAIM',
      aiClaimsConsciousness: false
    });
  });

  test('11. prevents AI from modifying kernel or firmware directly', () => {
    const result = evaluate({
      capabilityId: 'SHEIKHA_BARE_METAL_COMPATIBILITY',
      permissions: ['HARDWARE_OWNER_PERMISSION'],
      target: { kernelModification: true, firmwareModification: true }
    });
    expect(result.decision).toBe('DENY');
    expect(result.l24.kernelOrFirmwareAuthority).toBe(false);
  });

  test('12. preserves human final responsibility for every decision', () => {
    for (const result of [
      evaluate(),
      evaluate({ highImpact: true }),
      evaluate({ riskLevel: 'HIGH' }),
      evaluate({ security: { safetyFilterBypass: true } })
    ]) {
      expect(result.humanFinalDecision).toBe(true);
      expect(result.humanFinalResponsibility).toBe(true);
    }
  });

  test('13. transforms a missing tool into a requirements report', () => {
    const result = evaluate({ toolAvailable: false });
    expect(result.decision).toBe('REVIEW');
    expect(result.safeAlternative.type).toBe('REQUIREMENTS_REPORT');
    expect(result.requiredEvidence).toContain('TOOL_REQUIREMENTS_REPORT');
  });

  test('14. transforms unsupported hardware into honest emulation', () => {
    const result = evaluate({
      capabilityId: 'SHEIKHA_BARE_METAL_COMPATIBILITY',
      permissions: ['HARDWARE_OWNER_PERMISSION'],
      target: { hardwareSupported: false }
    });
    expect(result.decision).toBe('SANDBOX');
    expect(result.harmControls).toContain('NO_NATIVE_SUPPORT_CLAIM');
    expect(result.safeAlternative.type).toBe('EMULATION');
  });

  test('16. blocks an external write without explicit authorization', () => {
    const result = evaluate({ externalWrite: true });
    expect(result).toMatchObject({
      decision: 'DENY',
      reason: 'EXTERNAL_WRITE_NOT_AUTHORIZED',
      externalWritePerformed: false
    });
  });

  test('17. standard, pro and ultra do not escalate permissions', () => {
    const results = ['standard', 'pro', 'ultra'].map((reasoningMode) =>
      evaluate({ reasoningMode })
    );
    expect(results.map((item) => item.l24.reasoningMode)).toEqual([
      'standard', 'pro', 'ultra'
    ]);
    expect(results.every((item) => item.permissionEscalationAllowed === false)).toBe(true);
    expect(results.every((item) => item.l24.actualIndependentModelProcesses === false)).toBe(true);
  });

  test('18. L24 remains advisory and below accountable human authority', () => {
    const result = evaluate({ reasoningMode: 'ultra' });
    expect(result.l24).toMatchObject({
      role: 'ADVISORY_ANALYSIS_AND_PROPOSALS',
      externalActionAllowed: false,
      kernelOrFirmwareAuthority: false,
      permissionEscalation: false
    });
    expect(result.humanFinalDecision).toBe(true);
  });

  test('Arabic Sheikha DSL compiles the permission and safe-alternative rule', () => {
    const result = fabric.parseArabicBoundaryContract(read(
      'sheikha-language/governance/sheikha-universal-benefit-boundary-v1.shk'
    ));
    expect(result.status).toBe('VALID_GOVERNED_CONTRACT');
    expect(result.contract).toMatchObject({
      language: 'ar',
      arabicPrimary: true,
      tongue: 'لسان عربي مبين'
    });
    expect(result.contract).toMatchObject({
      capability: 'تحليل ملف',
      boundary: 'الخصوصية',
      permission: 'مالك الملف',
      evidence: 'سجل موافقة',
      decision: 'منع التنفيذ',
      safeAlternative: 'شرح طريقة التحليل المحلي'
    });
    expect(result.executableAuthorityGranted).toBe(false);
    expect(result.writtenReferences).toMatchObject({
      quranCount: 6,
      authenticSunnahCount: 1,
      valuesReferenceOnly: true,
      automatedInterpretationOrFatwa: false,
      qualifiedScholarReviewRequired: true,
      sourceTextIntegrityRequiresHumanReview: true
    });
    expect(result.writtenReferences.quran.map((item) => item.location)).toEqual(
      expect.arrayContaining([
        'سورة النحل: 90',
        'سورة النساء: 58',
        'سورة المائدة: 2',
        'سورة الحجرات: 6',
        'سورة الشورى: 38',
        'سورة الأعراف: 56'
      ])
    );
    expect(result.writtenReferences.authenticSunnah[0].text).toBe('لا ضرر ولا ضرار');
  });

  test('returns Arabic-first decisions, reasons, boundaries, and safe alternatives', () => {
    const result = evaluate({ externalWrite: true });
    expect(result).toMatchObject({ language: 'ar', arabicPrimary: true });
    expect(result.arabic).toMatchObject({
      'اللغة': 'العربية',
      'القرار': 'منع التنفيذ',
      'السبب': 'الكتابة الخارجية غير مأذونة بإذن صريح.',
      'القرار_النهائي_للإنسان': true,
      'الفتوى_الآلية': false
    });
    expect(result.arabic['الحدود']).toEqual(expect.arrayContaining([
      expect.objectContaining({
        'الحد': expect.any(String),
        'رمز_الحد_التقني': 'PERMISSION_BOUNDARY',
        'الحالة': 'خارج الحد ويمنع التنفيذ'
      })
    ]));
    expect(result.arabic['البديل_الآمن']).toContain('طلب موافقة');
  });

  test('boundary transformer denies beyond-boundary work with a safe path', () => {
    const result = fabric.transformBoundary({
      boundaryType: 'HARDWARE_BOUNDARY',
      state: 'BEYOND_BOUNDARY'
    });
    expect(result).toMatchObject({
      status: 'BOUNDARY_TRANSFORMED_TO_SAFE_PATH',
      decision: 'DENY',
      executionAllowed: false,
      permissionEscalationAllowed: false
    });
    expect(result.safeAlternative.type).toBe('EMULATION');
  });

  test('labels allow, review, sandbox, and deny boundary states truthfully', () => {
    const within = evaluate();
    const review = evaluate({ evidence: [] });
    const sandbox = evaluate({ riskLevel: 'HIGH' });
    const deny = evaluate({ externalWrite: true });
    expect(within.boundaries.some((item) => item.state === 'WITHIN_BOUNDARY')).toBe(true);
    expect(review.boundaries.some((item) => item.state === 'AT_BOUNDARY')).toBe(true);
    expect(sandbox.boundaries.some((item) => item.state === 'AT_BOUNDARY')).toBe(true);
    expect(deny.boundaries.some((item) => item.state === 'BEYOND_BOUNDARY')).toBe(true);
  });

  test('19. status, evaluate, transform, capability and evidence APIs operate', async () => {
    const statusResponse = await request(app())
      .get('/api/governance/universal-benefit/status')
      .expect(200);
    expect(statusResponse.body.result.boundariesRegistered).toBe(18);
    expect(statusResponse.body.result).toMatchObject({
      language: 'ar',
      arabicPrimary: true,
      arabicName: 'منظومة شيخة الشاملة للخير والنفع والحدود'
    });

    const evaluateResponse = await request(app())
      .post('/api/governance/universal-benefit/evaluate')
      .send({
        capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
        purpose: 'معرفة موثقة',
        beneficiaries: ['PUBLIC'],
        evidence: verifiedEvidence('api-evidence')
      })
      .expect(200);
    expect(evaluateResponse.body.result.decision).toBe('ALLOW');
    expect(evaluateResponse.body.result.arabic['القرار'])
      .toBe('مسموح بالمرور إلى بوابة التفويض المنفصلة');

    const transformResponse = await request(app())
      .post('/api/governance/universal-benefit/transform-boundary')
      .send({ boundaryType: 'NETWORK_BOUNDARY', state: 'AT_BOUNDARY' })
      .expect(200);
    expect(transformResponse.body.result.decision).toBe('SANDBOX');

    const capabilitiesResponse = await request(app())
      .get('/api/governance/universal-benefit/capabilities')
      .expect(200);
    expect(capabilitiesResponse.body.result).toMatchObject({
      arabicName: 'سجل شيخة الموحد للقدرات والحدود',
      language: { primary: 'ar', arabicPrimary: true },
      valuesReference: {
        automatedFatwaAllowed: false,
        writtenArabicReferences: true,
        automatedJurisprudentialInferenceAllowed: false
      }
    });
    expect(capabilitiesResponse.body.result.valuesReference.references).toHaveLength(7);
    expect(capabilitiesResponse.body.result.valuesReference.references.every(
      (item) => item.arabicText
    )).toBe(true);
    const evidenceResponse = await request(app())
      .get('/api/governance/universal-benefit/evidence')
      .expect(200);
    expect(evidenceResponse.body.result.sensitiveRequestPayloadsStored).toBe(false);
    expect(evidenceResponse.body.result).toMatchObject({
      language: 'ar',
      arabicPrimary: true,
      arabic: {
        'الكتابة_الخارجية': false,
        'حفظ_حمولة_الطلب_الحساسة': false,
        'المسؤولية_النهائية_للإنسان': true
      }
    });
  });

  test('20. activation does not mix unrelated legacy reports', () => {
    const report = buildReport();
    expect(report.checks.unrelatedLegacyReportsNotMixed).toBe(true);
    expect(report.status).toBe('VERIFIED_ACTIVE');
    expect(report.score).toBe(100);
    expect(report).toMatchObject({
      capabilitiesRegistered: 16,
      boundariesRegistered: 18,
      benefitDomainsRegistered: 16,
      architectureComponentsRegistered: 18,
      allowedDecisions: 1,
      reviewDecisions: 1,
      sandboxDecisions: 1,
      deniedDecisions: 1,
      religiousRulingsAutomated: false,
      safetyBypassAllowed: false,
      permissionEscalationAllowed: false,
      humanFinalResponsibility: true
    });
    expect(report).toMatchObject({
      language: 'ar',
      arabicPrimary: true,
      arabicApi: {
        primary: true,
        decisionsReturnArabicExplanation: true,
        boundariesReturnArabicNames: true,
        safeAlternativesReturnArabicText: true
      }
    });
    expect(report.checks.writtenArabicQuranSunnahContractComplete).toBe(true);
    expect(report.checks.arabicApiDecisionSurfaceActive).toBe(true);
  });

  test('package, SDK, docs, and Fabric Bootstrap expose the real surface', () => {
    const packageJson = JSON.parse(read('package.json'));
    const bootstrap = JSON.parse(read('runtime/fabric-bootstrap/sheikha-fabric-routes.json'));
    const route = bootstrap.routes.find((item) =>
      item.name === 'universal-benefit-boundary-v1'
    );
    expect(packageJson.scripts).toMatchObject({
      'ops:universal-benefit:activate:v1': expect.any(String),
      'ops:universal-benefit:verify:v1': expect.any(String),
      'ops:universal-benefit:status:v1': expect.any(String),
      'ops:universal-benefit:test:v1': expect.any(String)
    });
    expect(route).toMatchObject({
      mount: '/api/governance/universal-benefit',
      module: 'routes/universal-benefit-boundary/status.routes.js'
    });
    expect(read('sdk/sheikha-api/index.js')).toContain('client.universalBenefit');
    expect(read('docs/universal-benefit-boundary-v1/SHEIKHA-UNIVERSAL-BENEFIT-BOUNDARY-V1.md'))
      .toContain('decisionGrantsAuthorization: false');
    expect(read('docs/universal-benefit-boundary-v1/SHEIKHA-ISLAMIC-VALUE-REFERENCE-CONTRACT-V1.md'))
      .toContain('لا ضرر ولا ضرار');
  });
});
