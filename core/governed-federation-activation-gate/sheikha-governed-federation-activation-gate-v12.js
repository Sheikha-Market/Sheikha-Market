'use strict';

const {
  buildTemplateEngineUnificationReport,
  defaultUnificationDna,
  getTemplateEngineUnificationStatus,
  unifyTemplateExpansion
} = require('../template-engine-unification/sheikha-template-engine-unification-v11');

const {
  buildUniversalGovernedFederationPlatformStatus
} = require('../universal-governed-federation-platform/sheikha-universal-governed-federation-platform-v10');

const writeScopes = Object.freeze({
  readOnly: 'READ_ONLY_MEASUREMENT',
  internalPlan: 'GOVERNED_INTERNAL_WRITE_PLAN',
  internalWrite: 'GOVERNED_INTERNAL_WRITE_ALLOWED_AFTER_APPROVAL',
  humanReview: 'HUMAN_REVIEW_REQUIRED',
  externalBlocked: 'EXTERNAL_CHANGE_BLOCKED'
});

const externalMutationFields = Object.freeze([
  'externalChange',
  'systemMutation',
  'kernelMutation',
  'bootMutation',
  'firmwareMutation',
  'serviceRestart',
  'packageInstall',
  'databaseWrite',
  'shellExecution',
  'privilegeEscalation'
]);

const governedActivationFlow = Object.freeze([
  'READ',
  'VALIDATE',
  'TEMPLATE_UNIFICATION',
  'POLICY_EVALUATION',
  'INSPECTOR_REVIEW',
  'APPROVE_INTERNAL_PLAN',
  'AUDIT',
  'PUBLISH_EVENT'
]);

function unique(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function detectExternalMutationRequest(dna = {}) {
  return externalMutationFields.filter((field) => Boolean(dna[field]));
}

function classifyActivationRisk(dna = {}) {
  const blockedFields = detectExternalMutationRequest(dna);
  const requiresHumanReview = Boolean(dna.highImpact || dna.production || dna.customerFacing);

  if (blockedFields.length) {
    return {
      level: 'BLOCKED',
      writeScope: writeScopes.externalBlocked,
      blockedFields,
      requiresHumanReview: true
    };
  }

  if (requiresHumanReview) {
    return {
      level: 'CONTROLLED',
      writeScope: writeScopes.humanReview,
      blockedFields,
      requiresHumanReview: true
    };
  }

  return {
    level: 'SAFE_INTERNAL',
    writeScope: writeScopes.internalPlan,
    blockedFields,
    requiresHumanReview: false
  };
}

function buildActivationAuditEvent(type, payload = {}) {
  return {
    type,
    system: 'SHEIKHA_GOVERNED_FEDERATION_ACTIVATION_GATE_V12',
    payload,
    governed: true,
    noExternalMutation: true,
    noHarm: true,
    timestamp: new Date().toISOString()
  };
}

function buildGovernedFederationActivationPlan(dna = defaultUnificationDna) {
  const risk = classifyActivationRisk(dna);
  const unification = buildTemplateEngineUnificationReport();
  const platform = buildUniversalGovernedFederationPlatformStatus();
  const expansion = risk.level === 'BLOCKED'
    ? null
    : unifyTemplateExpansion(dna);
  const templateUnified = unification.status === 'ACTIVE';
  const platformReady = platform.status === 'ACTIVE_100';
  const expansionReady = expansion?.status === 'COMMITTED';
  const approvedInternalPlan = risk.level !== 'BLOCKED' &&
    templateUnified &&
    platformReady &&
    expansionReady;
  const status = approvedInternalPlan
    ? 'APPROVED_INTERNAL_PLAN'
    : 'BLOCKED_REVIEW';

  return {
    system: 'SHEIKHA_GOVERNED_FEDERATION_ACTIVATION_GATE_V12',
    status,
    mode: 'GOVERNED_READ_WRITE_WITH_EXTERNAL_MUTATION_BLOCK',
    dna,
    flow: governedActivationFlow,
    risk,
    readiness: {
      templateEngineUnified: templateUnified,
      governedPlatformReady: platformReady,
      expansionReady,
      externalMutationBlocked: risk.blockedFields.length > 0,
      internalPlanReady: approvedInternalPlan,
      overall: approvedInternalPlan
        ? 'GOVERNED_FEDERATION_ACTIVATION_READY'
        : 'GOVERNED_FEDERATION_ACTIVATION_REVIEW'
    },
    decision: {
      approved: approvedInternalPlan,
      writeScope: approvedInternalPlan ? writeScopes.internalWrite : risk.writeScope,
      externalChangeAllowed: false,
      requiresHumanReview: risk.requiresHumanReview,
      reason: approvedInternalPlan
        ? 'SAFE_INTERNAL_REGISTRY_GRAPH_EVENT_PLAN_ONLY'
        : unique([
          ...risk.blockedFields.map((field) => `BLOCKED_${field.toUpperCase()}`),
          !templateUnified ? 'TEMPLATE_UNIFICATION_NOT_ACTIVE' : null,
          !platformReady ? 'GOVERNED_PLATFORM_NOT_READY' : null,
          expansion && !expansionReady ? 'EXPANSION_NOT_COMMITTED' : null,
          !expansion ? 'EXPANSION_NOT_EXECUTED' : null
        ])
    },
    artifacts: {
      canonicalEngine: unification.canonicalEngine.system,
      compatibilityEngine: unification.compatibilityEngine.system,
      governedPlatform: platform.system,
      mappedTemplates: unification.mapping.filter((item) => item.status === 'MAPPED').length,
      canonicalPackageId: expansion?.canonical?.packageId || null,
      openapi: expansion?.canonical?.openapi || null,
      sdkTargets: expansion?.canonical?.sdkTargets || []
    },
    audit: [
      buildActivationAuditEvent('GOVERNED_ACTIVATION_REQUESTED', {
        name: dna.name,
        blueprint: dna.blueprint,
        risk: risk.level
      }),
      buildActivationAuditEvent('GOVERNED_ACTIVATION_DECIDED', {
        status,
        writeScope: approvedInternalPlan ? writeScopes.internalWrite : risk.writeScope
      })
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له',
      readAllowed: true,
      governedInternalWriteAllowed: approvedInternalPlan,
      externalSystemWriteAllowed: false,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noShellExecution: true,
      noPrivilegeEscalation: true,
      noUnauthorizedAccess: true,
      noHarm: true
    },
    timestamp: new Date().toISOString()
  };
}

function buildGovernedFederationActivationGateReport() {
  const status = getTemplateEngineUnificationStatus();
  const samplePlan = buildGovernedFederationActivationPlan();
  const blockedProbe = buildGovernedFederationActivationPlan({
    ...defaultUnificationDna,
    name: 'Blocked External Mutation Probe',
    serviceRestart: true
  });

  return {
    system: 'SHEIKHA_GOVERNED_FEDERATION_ACTIVATION_GATE_V12',
    status: samplePlan.status === 'APPROVED_INTERNAL_PLAN' &&
      blockedProbe.status === 'BLOCKED_REVIEW'
      ? 'ACTIVE'
      : 'REVIEW',
    mode: 'SAFE_GOVERNED_ACTIVATION_GATE_ABOVE_TEMPLATE_UNIFICATION',
    linkedLayers: {
      templateEngineUnificationV11: status.status,
      canonicalTemplates: status.canonicalTemplates,
      compatibilityTemplates: status.compatibilityTemplates,
      governedPlatform: status.governedPlatform
    },
    writeScopes,
    externalMutationFields,
    samplePlan,
    blockedProbe: {
      status: blockedProbe.status,
      blockedFields: blockedProbe.risk.blockedFields,
      decision: blockedProbe.decision
    },
    governance: {
      readWriteModel: 'READ_VALIDATE_POLICY_APPROVE_AUDIT',
      internalWriteOnlyAfterApproval: true,
      externalMutationBlockedByDefault: true,
      humanReviewForHighImpact: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    timestamp: new Date().toISOString()
  };
}

function getGovernedFederationActivationGateStatus() {
  const report = buildGovernedFederationActivationGateReport();

  return {
    system: report.system,
    status: report.status,
    mode: report.mode,
    linkedLayers: report.linkedLayers,
    approvedSample: report.samplePlan.status,
    blockedProbe: report.blockedProbe.status,
    writeScopes: Object.keys(report.writeScopes).length,
    externalMutationFields: report.externalMutationFields.length,
    governance: report.governance,
    timestamp: report.timestamp
  };
}

module.exports = {
  writeScopes,
  externalMutationFields,
  governedActivationFlow,
  detectExternalMutationRequest,
  classifyActivationRisk,
  buildActivationAuditEvent,
  buildGovernedFederationActivationPlan,
  buildGovernedFederationActivationGateReport,
  getGovernedFederationActivationGateStatus
};
