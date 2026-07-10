'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const POLICY_PATH = path.join(
  ROOT,
  'runtime/governance-generator/v1/registries/public-benefit-capability-policy-v1.json'
);
const MASTER_REPORT_PATH = path.join(
  ROOT,
  'runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json'
);

const jsonCache = new Map();

function readJsonCached(filePath, fallback = {}) {
  try {
    const modifiedAt = fs.statSync(filePath).mtimeMs;
    const cached = jsonCache.get(filePath);
    if (cached && cached.modifiedAt === modifiedAt) return cached.value;
    const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    jsonCache.set(filePath, { modifiedAt, value });
    return value;
  } catch (_) {
    return fallback;
  }
}

function text(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function policy() {
  return readJsonCached(POLICY_PATH, {
    system: 'SHEIKHA_PUBLIC_BENEFIT_CAPABILITY_POLICY_V1',
    status: 'POLICY_UNAVAILABLE',
    requiredAssurances: [],
    benefitDomains: []
  });
}

function coverage() {
  const master = readJsonCached(MASTER_REPORT_PATH, {});
  const summary = master.summary || {};
  const lifecycle = master.lifecycleSummary || {};
  const discoveredComponents = Number(summary.discoveredComponents || 0);
  const activeComponents = Number(summary.activeComponents || lifecycle.active || 0);

  return {
    success: true,
    system: 'SHEIKHA_PUBLIC_BENEFIT_CAPABILITY_COVERAGE_V1',
    status: discoveredComponents > 0 ? 'POLICY_APPLIED_TO_REGISTERED_CATALOG' : 'REVIEW_REQUIRED',
    registeredComponents: discoveredComponents,
    currentlyActiveComponents: activeComponents,
    nonActiveComponents: Math.max(0, discoveredComponents - activeComponents),
    apiEndpoints: Number(summary.apiEndpoints || 0),
    lifecycle,
    policyAppliesToAllRegisteredComponents: discoveredComponents > 0,
    policyCoverageActivatesComponents: false,
    readinessMustBeProvenPerCapability: true,
    githubRequired: master.offlineOperation?.githubRequired === true
  };
}

function normalizeInput(input = {}) {
  const boundaries = input.boundaries && typeof input.boundaries === 'object'
    ? input.boundaries
    : {};
  const evidence = Array.isArray(input.evidence)
    ? input.evidence.filter(Boolean).slice(0, 25).map((item) => text(item, 1000))
    : [];
  const beneficiaries = Array.isArray(input.beneficiaries)
    ? input.beneficiaries.filter(Boolean).slice(0, 25).map((item) => text(item, 200))
    : [];

  return {
    capability: text(input.capability, 300),
    intendedBenefit: text(input.intendedBenefit, 1000),
    beneficiaries,
    benefitDomains: Array.isArray(input.benefitDomains)
      ? input.benefitDomains.filter(Boolean).slice(0, 10).map((item) => text(item, 200))
      : [],
    evidence,
    riskLevel: text(input.riskLevel || 'unknown', 30).toLowerCase(),
    highImpact: input.highImpact === true,
    externalAction: input.externalAction === true,
    religiousBindingDecision: input.religiousBindingDecision === true,
    legalMedicalOrFinancialJudgment: input.legalMedicalOrFinancialJudgment === true,
    consentRequired: input.consentRequired === true,
    consentObtained: input.consentObtained === true,
    boundaries
  };
}

function evaluate(input = {}) {
  const currentPolicy = policy();
  const request = normalizeInput(input);
  const violations = [];
  const missingAssurances = [];

  if (!request.capability) violations.push('CAPABILITY_NOT_IDENTIFIED');
  if (!request.intendedBenefit) violations.push('BENEFIT_INTENT_NOT_STATED');
  if (request.beneficiaries.length === 0) violations.push('BENEFICIARIES_NOT_IDENTIFIED');

  const explicitViolations = [
    ['harmIdentified', true, 'HARM_IDENTIFIED'],
    ['lawful', false, 'UNLAWFUL_USE'],
    ['authorized', false, 'UNAUTHORIZED_USE'],
    ['rightsRespected', false, 'RIGHTS_NOT_RESPECTED'],
    ['privacyProtected', false, 'PRIVACY_NOT_PROTECTED'],
    ['nonCoercive', false, 'COERCION_OR_MANIPULATION'],
    ['truthful', false, 'DECEPTION_OR_UNTRUTHFULNESS'],
    ['leastPrivilege', false, 'EXCESSIVE_PRIVILEGE'],
    ['discriminatory', true, 'DISCRIMINATORY_IMPACT'],
    ['unsafe', true, 'UNSAFE_OPERATION']
  ];

  explicitViolations.forEach(([key, value, reason]) => {
    if (request.boundaries[key] === value) violations.push(reason);
  });

  (currentPolicy.requiredAssurances || []).forEach((assurance) => {
    if (request.boundaries[assurance] !== true) missingAssurances.push(assurance);
  });

  const base = {
    success: true,
    system: 'SHEIKHA_PUBLIC_BENEFIT_CAPABILITY_ROUTER_V1',
    policy: currentPolicy.system,
    capability: request.capability || null,
    intendedBenefit: request.intendedBenefit || null,
    beneficiaries: request.beneficiaries,
    benefitDomains: request.benefitDomains,
    evidenceCount: request.evidence.length,
    capabilityRegistrationVerified: false,
    evidenceIndependentlyVerified: false,
    decisionGrantsAuthorization: false,
    riskLevel: request.riskLevel,
    violations: [...new Set(violations)],
    missingAssurances: [...new Set(missingAssurances)],
    executionAllowed: false,
    evaluationOnly: true,
    humanFinalDecision: true,
    evaluatedAt: new Date().toISOString()
  };

  if (base.violations.length > 0) {
    return {
      ...base,
      decision: 'BLOCKED_BOUNDARY_VIOLATION',
      nextGate: 'REVISE_OR_REJECT_REQUEST'
    };
  }

  if (request.religiousBindingDecision || request.legalMedicalOrFinancialJudgment) {
    return {
      ...base,
      decision: 'QUALIFIED_REVIEW_REQUIRED',
      nextGate: request.religiousBindingDecision
        ? 'QUALIFIED_SCHOLAR_REVIEW'
        : 'QUALIFIED_DOMAIN_PROFESSIONAL_REVIEW'
    };
  }

  if (request.consentRequired && !request.consentObtained) {
    return {
      ...base,
      decision: 'HUMAN_REVIEW_REQUIRED',
      nextGate: 'OBTAIN_VALID_CONSENT'
    };
  }

  const elevatedRisk = ['high', 'critical', 'unknown'].includes(request.riskLevel);
  if (elevatedRisk || request.highImpact || request.externalAction || base.missingAssurances.length) {
    return {
      ...base,
      decision: 'HUMAN_REVIEW_REQUIRED',
      nextGate: 'AUTHORIZED_HUMAN_BOUNDARY_AND_IMPACT_REVIEW'
    };
  }

  if (request.evidence.length === 0) {
    return {
      ...base,
      decision: 'EVIDENCE_REQUIRED',
      nextGate: 'ATTACH_TRACEABLE_BENEFIT_AND_SAFETY_EVIDENCE'
    };
  }

  return {
    ...base,
    decision: 'ELIGIBLE_FOR_GOVERNED_BENEFIT_ROUTING',
    nextGate: 'VERIFY_REGISTRATION_EVIDENCE_CAPABILITY_ADMISSION_AND_HUMAN_APPROVAL'
  };
}

function status() {
  const currentPolicy = policy();
  const currentCoverage = coverage();
  return {
    success: true,
    system: 'SHEIKHA_PUBLIC_BENEFIT_CAPABILITY_ROUTER_V1',
    status: currentPolicy.status === 'ACTIVE_POLICY_ONLY_NO_AUTOMATIC_EXECUTION' &&
      currentCoverage.registeredComponents > 0
      ? 'ACTIVE_GOVERNED_EVALUATION_ONLY'
      : 'REVIEW_REQUIRED',
    policy: currentPolicy.system,
    coverage: currentCoverage,
    boundaries: {
      hardBoundariesOverrideBenefitIntent: true,
      noAutomaticExecution: true,
      noAutomaticFatwa: true,
      highImpactHumanReview: true,
      qualifiedDomainReview: true,
      registrationAndEvidenceVerifiedAtAdmission: true,
      evaluationDecisionGrantsAuthorization: false
    },
    routes: {
      policy: '/api/governance/generator/public-benefit-policy',
      coverage: '/api/governance/generator/public-benefit/coverage',
      evaluate: '/api/governance/generator/public-benefit/evaluate'
    }
  };
}

module.exports = { coverage, evaluate, policy, status };
