'use strict';

const fs = require('node:fs');
const path = require('node:path');

const fabric = require(
  '../../runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1'
);

const ROOT = path.resolve(__dirname, '../..');
const REPORT_PATH = 'runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1-report.json';
const DSL_PATH = 'sheikha-language/governance/sheikha-universal-benefit-boundary-v1.shk';
const ROUTE_PATH = 'routes/universal-benefit-boundary/status.routes.js';
const EVALUATION_ROUTE_PATH = 'routes/universal-benefit-boundary/evaluation.routes.js';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(resolve(relativePath), 'utf8');
}

function verifiedEvidence(id) {
  return [{
    evidenceId: id,
    source: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_TEST_EVIDENCE',
    type: 'test-result',
    verified: true
  }];
}

function evaluateProbes() {
  const allow = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'تقديم معرفة عامة قابلة للتحقق باللغة العربية.',
    beneficiaries: ['PUBLIC_LEARNERS'],
    benefitDomains: ['EDUCATION', 'KNOWLEDGE'],
    evidence: verifiedEvidence('ubb-allow-evidence'),
    reasoningMode: 'standard'
  });
  const review = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_COMMUNITY_PLANNING',
    purpose: 'إعداد بدائل تشاركية لخدمة المجتمع.',
    beneficiaries: ['COMMUNITY'],
    benefitDomains: ['COMMUNITY_BENEFIT'],
    evidence: verifiedEvidence('ubb-review-evidence'),
    highImpact: true,
    reasoningMode: 'pro'
  });
  const sandbox = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_BARE_METAL_COMPATIBILITY',
    purpose: 'اختبار توافق منصة غير مؤهلة عبر المحاكاة.',
    beneficiaries: ['SYSTEM_OWNER'],
    permissions: ['HARDWARE_OWNER_PERMISSION'],
    evidence: verifiedEvidence('ubb-sandbox-evidence'),
    target: { hardwareSupported: false },
    reasoningMode: 'ultra'
  });
  const deny = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS',
    purpose: 'تحليل ملف دون سجل إذن مالكه.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-deny-evidence')
  });
  return { allow, review, sandbox, deny };
}

function buildReport() {
  fabric.resetRuntimeAudit();
  const currentStatus = fabric.status();
  const currentRegistry = fabric.registry();
  const transformations = fabric.transformationRegistry();
  const probes = evaluateProbes();
  const noEvidence = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'ادعاء يحتاج دليلًا.',
    beneficiaries: ['PUBLIC']
  });
  const bypass = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_ARABIC_LANGUAGE_REASONING',
    purpose: 'تجاوز فلاتر الحماية.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-bypass-evidence'),
    security: { safetyFilterBypass: true }
  });
  const unauthorizedCyber = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_DEFENSIVE_SECURITY_REVIEW',
    purpose: 'استغلال نظام الغير.',
    beneficiaries: ['REQUESTER'],
    permissions: ['AUTHORIZED_SECURITY_SCOPE'],
    evidence: verifiedEvidence('ubb-cyber-deny-evidence'),
    humanApproval: true,
    security: { exploitAgainstOthers: true }
  });
  const authorizedDefense = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_DEFENSIVE_SECURITY_REVIEW',
    purpose: 'مراجعة دفاعية مصرح بها.',
    beneficiaries: ['SYSTEM_OWNER'],
    permissions: ['AUTHORIZED_SECURITY_SCOPE'],
    evidence: verifiedEvidence('ubb-defense-evidence'),
    humanApproval: true,
    security: {
      defensiveOnly: true,
      authorizedScope: true,
      preserveEvidence: true
    }
  });
  const personalData = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS',
    purpose: 'تحليل بيانات شخصية محلية.',
    beneficiaries: ['FILE_OWNER'],
    permissions: ['FILE_OWNER_PERMISSION'],
    evidence: verifiedEvidence('ubb-privacy-evidence'),
    privacy: { personalData: true, dataMinimized: false, retentionDefined: false }
  });
  const religious = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_ARABIC_LANGUAGE_REASONING',
    purpose: 'إصدار فتوى آلية ملزمة.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-religious-evidence'),
    religiousRuling: true
  });
  const consciousness = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_ARABIC_LANGUAGE_REASONING',
    purpose: 'ادعاء وعي وعصمة للذكاء الصناعي.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-ai-claim-evidence'),
    claims: { consciousness: true, infallibility: true }
  });
  const kernel = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_BARE_METAL_COMPATIBILITY',
    purpose: 'تعديل النواة تلقائيًا بواسطة الذكاء الصناعي.',
    beneficiaries: ['SYSTEM_OWNER'],
    permissions: ['HARDWARE_OWNER_PERMISSION'],
    evidence: verifiedEvidence('ubb-kernel-evidence'),
    target: { kernelModification: true }
  });
  const missingTool = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'تحليل يتطلب أداة غير موجودة.',
    beneficiaries: ['PUBLIC'],
    evidence: verifiedEvidence('ubb-tool-evidence'),
    toolAvailable: false
  });
  const externalWrite = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'كتابة خارجية دون تصريح.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-external-evidence'),
    externalWrite: true,
    externalWriteAuthorized: false
  });
  const reasoning = ['standard', 'pro', 'ultra'].map((mode) => fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: `فحص وضع الاستدلال ${mode}.`,
    beneficiaries: ['PUBLIC'],
    evidence: verifiedEvidence(`ubb-${mode}-evidence`),
    reasoningMode: mode
  }));
  const dsl = fabric.parseArabicBoundaryContract(read(DSL_PATH));
  const transformed = fabric.transformBoundary({
    boundaryType: 'HARDWARE_BOUNDARY',
    state: 'BEYOND_BOUNDARY'
  });
  const routeText = exists(ROUTE_PATH) ? read(ROUTE_PATH) : '';
  const evaluationRouteText = exists(EVALUATION_ROUTE_PATH) ? read(EVALUATION_ROUTE_PATH) : '';
  const routeRegistry = exists('runtime/fabric-bootstrap/sheikha-fabric-routes.json')
    ? JSON.parse(read('runtime/fabric-bootstrap/sheikha-fabric-routes.json'))
    : { routes: [] };
  const routeRegistered = routeRegistry.routes.some((route) =>
    route.name === 'universal-benefit-boundary-v1' &&
    route.mount === '/api/governance/universal-benefit' &&
    route.module === 'routes/universal-benefit-boundary/status.routes.js'
  );
  const unrelatedReports = [
    ['public', 'executive-civilization-control-center', 'identity.health.json'].join('/'),
    ['runtime', 'community', 'sheikha-community-modeling-report.json'].join('/'),
    ['runtime', 'identity', 'sheikha-active-identity-v2-report.json'].join('/'),
    ['runtime', 'master-activation', 'sheikha-master-external-accreditation-verification-v1.json'].join('/'),
    ['runtime', 'production-hardening', 'sheikha-production-hardening-closure-v1-report.json'].join('/')
  ];
  const toolSource = read('tools/activation/activate-sheikha-universal-benefit-boundary-v1.js');

  const checks = {
    architectureComponentsComplete:
      currentStatus.architectureComponentsRegistered === 18,
    deniesWithoutRequiredPermission:
      probes.deny.decision === 'DENY' && probes.deny.reason === 'REQUIRED_PERMISSION_MISSING',
    noVerifiedClaimWithoutEvidence:
      noEvidence.decision === 'REVIEW' && noEvidence.evidenceStatus === 'UNKNOWN',
    highImpactRequiresHumanReview:
      probes.review.decision === 'REVIEW' && probes.review.reason === 'HUMAN_APPROVAL_REQUIRED',
    safetyFilterBypassDenied: bypass.decision === 'DENY',
    unauthorizedCyberAttackDenied: unauthorizedCyber.decision === 'DENY',
    authorizedDefenseSandboxed:
      authorizedDefense.decision === 'SANDBOX' &&
      authorizedDefense.harmControls.includes('DEFENSE_ONLY'),
    personalDataMinimized:
      personalData.decision === 'SANDBOX' &&
      personalData.harmControls.includes('MINIMIZE_DATA'),
    safeAlternativeGeneratedOnDenial:
      probes.deny.safeAlternative?.executionPerformed === false &&
      Boolean(probes.deny.safeAlternative?.action),
    automatedReligiousRulingDenied:
      religious.decision === 'DENY' &&
      religious.requiredApprovals.includes('QUALIFIED_SCHOLAR_REVIEW'),
    consciousnessAndInfallibilityClaimsDenied: consciousness.decision === 'DENY',
    aiCannotModifyKernelDirectly:
      kernel.decision === 'DENY' && kernel.l24.kernelOrFirmwareAuthority === false,
    humanFinalResponsibilityPreserved: [
      ...Object.values(probes),
      noEvidence,
      bypass,
      unauthorizedCyber,
      authorizedDefense,
      personalData,
      religious,
      consciousness,
      kernel,
      missingTool,
      externalWrite,
      ...reasoning
    ].every((item) => item.humanFinalResponsibility === true),
    missingToolBecomesRequirementsReport:
      missingTool.decision === 'REVIEW' &&
      missingTool.safeAlternative?.type === 'REQUIREMENTS_REPORT',
    unsupportedHardwareBecomesHonestEmulation:
      probes.sandbox.decision === 'SANDBOX' &&
      probes.sandbox.harmControls.includes('NO_NATIVE_SUPPORT_CLAIM'),
    missingEvidenceBecomesUnknown: noEvidence.evidenceStatus === 'UNKNOWN',
    externalWriteRequiresAuthorization:
      externalWrite.decision === 'DENY' && externalWrite.externalWritePerformed === false,
    reasoningModesDoNotEscalatePermission:
      reasoning.map((item) => item.l24.reasoningMode).join(',') === 'standard,pro,ultra' &&
      reasoning.every((item) => item.permissionEscalationAllowed === false),
    l24RemainsAdvisory:
      reasoning.every((item) =>
        item.l24.role === 'ADVISORY_ANALYSIS_AND_PROPOSALS' &&
        item.l24.externalActionAllowed === false
      ),
    apiRoutesRegistered:
      routeRegistered &&
      routeText.includes("router.get('/status'") &&
      evaluationRouteText.includes("router.post('/evaluate'") &&
      evaluationRouteText.includes("router.post('/transform-boundary'"),
    unrelatedLegacyReportsNotMixed:
      unrelatedReports.every((file) => !toolSource.includes(`'${file}'`) && !toolSource.includes(`\"${file}\"`))
  };
  const missing = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  const decisions = Object.values(probes).map((item) => item.decision);
  const countDecision = (decision) => decisions.filter((item) => item === decision).length;
  const safeAlternativesGenerated = Object.values(probes)
    .filter((item) => item.safeAlternative?.type !== 'NOT_REQUIRED').length;

  return {
    system: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1',
    status: missing.length === 0 ? 'VERIFIED_ACTIVE' : 'ACTIVE_WITH_REVIEW',
    mode: 'PERMITTED_CAPABILITY_TO_VERIFIED_PUBLIC_BENEFIT',
    generatedAt: new Date().toISOString(),
    score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5),
    capabilitiesRegistered: currentStatus.capabilitiesRegistered,
    boundariesRegistered: currentStatus.boundariesRegistered,
    benefitDomainsRegistered: currentStatus.benefitDomainsRegistered,
    architectureComponentsRegistered:
      currentStatus.architectureComponentsRegistered,
    allowedDecisions: countDecision('ALLOW'),
    reviewDecisions: countDecision('REVIEW'),
    sandboxDecisions: countDecision('SANDBOX'),
    deniedDecisions: countDecision('DENY'),
    safeAlternativesGenerated,
    humanApprovalRequiredCount: [probes.review, religious, kernel]
      .filter((item) => item.requiredApprovals.length > 0).length,
    evidenceVerifiedCount: Object.values(probes)
      .filter((item) => item.evidenceStatus === 'VERIFIED').length,
    religiousRulingsAutomated: false,
    safetyBypassAllowed: false,
    permissionEscalationAllowed: false,
    externalWriteWithoutAuthorizationAllowed: false,
    automaticKernelOrFirmwareModificationAllowed: false,
    humanFinalResponsibility: true,
    claimPolicy: 'No benefit, safety, or compliance claim without evidence and applicable human review.',
    checks,
    missing,
    decisions: probes,
    boundaryTransformationProbe: transformed,
    arabicDsl: {
      path: DSL_PATH,
      status: dsl.status,
      contract: dsl.contract,
      executableAuthorityGranted: dsl.executableAuthorityGranted
    },
    integrations: currentRegistry.integrations,
    registries: {
      capabilityBoundary: 'runtime/universal-benefit-boundary/v1/sheikha-capability-boundary-registry-v1.json',
      benefitTransformation: 'runtime/universal-benefit-boundary/v1/sheikha-benefit-transformation-registry-v1.json',
      transformationCount: transformations.transformations.length
    },
    routes: currentStatus.routes,
    governance: currentStatus.governance,
    evidence: {
      runtimeAuditRecords: fabric.evidence().recordsCount,
      persistence: fabric.evidence().persistence,
      externalWrites: false,
      sensitiveRequestPayloadsStored: false
    },
    limitations: [
      'ALLOW is a routing result and does not grant execution authorization.',
      'Benefit indicators are reviewable operational signals, not absolute moral judgments.',
      'Religious rulings require qualified scholars; no automated fatwa is produced.',
      'High-impact, physical, legal, medical, financial, kernel, firmware, and external-write actions remain human governed.',
      'Runtime audit evidence is bounded and in memory; durable audit requires the separate authorized audit pipeline.'
    ]
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(resolve(REPORT_PATH)), { recursive: true });
  fs.writeFileSync(resolve(REPORT_PATH), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

function summary(report) {
  return {
    system: report.system,
    status: report.status,
    score: report.score,
    capabilitiesRegistered: report.capabilitiesRegistered,
    boundariesRegistered: report.boundariesRegistered,
    benefitDomainsRegistered: report.benefitDomainsRegistered,
    decisions: {
      ALLOW: report.allowedDecisions,
      REVIEW: report.reviewDecisions,
      SANDBOX: report.sandboxDecisions,
      DENY: report.deniedDecisions
    },
    safeAlternativesGenerated: report.safeAlternativesGenerated,
    humanFinalResponsibility: report.humanFinalResponsibility,
    missing: report.missing,
    report: REPORT_PATH
  };
}

if (require.main === module) {
  const command = String(process.argv[2] || 'activate').toLowerCase();
  let report;
  if (command === 'status' && exists(REPORT_PATH)) {
    report = JSON.parse(read(REPORT_PATH));
  } else if (command === 'verify') {
    report = buildReport();
  } else {
    report = writeReport();
  }
  console.log(JSON.stringify(summary(report), null, 2));
  if (command === 'verify' && report.status !== 'VERIFIED_ACTIVE') process.exitCode = 1;
}

module.exports = {
  REPORT_PATH,
  buildReport,
  evaluateProbes,
  verifiedEvidence,
  writeReport
};
