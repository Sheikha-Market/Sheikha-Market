'use strict';

const {
  templateLibrary: compatibilityTemplateLibrary,
  resolveTemplate: resolveCompatibilityTemplate,
  applyTemplateToDna
} = require('../universal-template-engine/sheikha-universal-template-engine-v8');

const {
  universalTemplateLibrary,
  resolveTemplateName,
  buildFederationPackage,
  buildFederationTemplateEngineReport
} = require('../federation-template-engine/sheikha-federation-template-engine-v8');

const {
  buildUniversalGovernedFederationPlatformStatus
} = require('../universal-governed-federation-platform/sheikha-universal-governed-federation-platform-v10');

const compatibilityToCanonicalTemplate = Object.freeze({
  Linux: 'OperatingSystem',
  PostgreSQL: 'Database',
  Language: 'Language',
  AI: 'AI'
});

const defaultUnificationDna = Object.freeze({
  name: 'Sheikha Unified Template PostgreSQL Federation',
  family: 'PostgreSQL Family',
  blueprint: 'PostgreSQL',
  version: '1.0.0',
  actor: 'template-engine-unification-v11',
  reason: 'Unify compatibility template engine with canonical federation package engine'
});

function buildTemplateMapping() {
  return Object.entries(compatibilityToCanonicalTemplate).map(([compatibilityName, canonicalName]) => {
    const compatibilityTemplate = compatibilityTemplateLibrary[compatibilityName];
    const canonicalTemplate = universalTemplateLibrary[canonicalName];

    return {
      compatibilityName,
      canonicalName,
      compatibilityReady: Boolean(compatibilityTemplate),
      canonicalReady: Boolean(canonicalTemplate),
      capabilityOverlap: (compatibilityTemplate?.capabilities || []).filter((capability) =>
        (canonicalTemplate?.capabilities || []).includes(capability)
      ),
      status: compatibilityTemplate && canonicalTemplate ? 'MAPPED' : 'REVIEW'
    };
  });
}

function buildTemplateEngineUnificationReport() {
  const templateEngine = buildFederationTemplateEngineReport();
  const governedPlatform = buildUniversalGovernedFederationPlatformStatus();
  const mapping = buildTemplateMapping();
  const mapped = mapping.filter((item) => item.status === 'MAPPED').length;

  return {
    system: 'SHEIKHA_TEMPLATE_ENGINE_UNIFICATION_V11',
    status: mapped === mapping.length &&
      templateEngine.status === 'ACTIVE' &&
      governedPlatform.status === 'ACTIVE_100'
      ? 'ACTIVE'
      : 'REVIEW',
    mode: 'CANONICAL_TEMPLATE_ENGINE_WITH_COMPATIBILITY_LAYER',
    canonicalEngine: {
      system: 'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8',
      role: 'CANONICAL_PACKAGE_OPENAPI_SDK_DESCRIPTOR_ENGINE',
      status: templateEngine.status,
      templates: Object.keys(universalTemplateLibrary).length
    },
    compatibilityEngine: {
      system: 'SHEIKHA_UNIVERSAL_TEMPLATE_ENGINE_V8',
      role: 'COMPATIBILITY_TEMPLATE_EXPANSION_LAYER',
      status: 'ACTIVE',
      templates: Object.keys(compatibilityTemplateLibrary).length
    },
    platform: {
      system: governedPlatform.system,
      status: governedPlatform.status,
      readiness: governedPlatform.readiness
    },
    mapping,
    governance: {
      canonicalSourceOfTruth: 'SHEIKHA_FEDERATION_TEMPLATE_ENGINE_V8',
      compatibilityLayerPreserved: true,
      descriptorOnlySdkGeneration: true,
      noExternalMutation: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noHarm: true
    },
    nextActions: [
      'Use the canonical Federation Template Engine for new packages.',
      'Keep Universal Template Engine V8 as backward-compatible expansion support.',
      'Route package, OpenAPI, SDK descriptor, graph, event, and governance through V10.'
    ],
    timestamp: new Date().toISOString()
  };
}

function unifyTemplateExpansion(dna = defaultUnificationDna) {
  const compatibilityTemplate = resolveCompatibilityTemplate(dna.blueprint);
  const compatibilityExpansion = applyTemplateToDna(dna);
  const canonicalTemplateName = resolveTemplateName(dna, {
    type: dna.blueprint === 'PostgreSQL' ? 'DATABASE' : String(dna.blueprint || '').toUpperCase()
  });
  const canonicalPackage = buildFederationPackage(dna);
  const report = buildTemplateEngineUnificationReport();
  const committed = compatibilityExpansion.status === 'COMMITTED' &&
    canonicalPackage.status === 'COMMITTED';

  return {
    system: 'SHEIKHA_TEMPLATE_ENGINE_UNIFIED_EXPANSION_V11',
    status: committed ? 'COMMITTED' : 'REVIEW',
    mode: 'DUAL_ENGINE_COMPATIBILITY_CANONICAL_PACKAGE_EXPANSION',
    dna,
    compatibility: {
      templateFound: Boolean(compatibilityTemplate),
      templateVersion: compatibilityTemplate?.templateVersion || null,
      status: compatibilityExpansion.status,
      system: compatibilityExpansion.system
    },
    canonical: {
      templateName: canonicalTemplateName,
      status: canonicalPackage.status,
      packageId: canonicalPackage.package?.id || null,
      openapi: canonicalPackage.openapi?.openapi || null,
      sdkTargets: canonicalPackage.sdkBundle?.map((sdk) => sdk.target) || []
    },
    unification: {
      status: report.status,
      canonicalEngine: report.governance.canonicalSourceOfTruth,
      compatibilityLayerPreserved: true,
      noExternalMutation: true
    },
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noExternalMutation: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true
    }
  };
}

function getTemplateEngineUnificationStatus() {
  const report = buildTemplateEngineUnificationReport();

  return {
    system: report.system,
    status: report.status,
    mode: report.mode,
    canonicalTemplates: report.canonicalEngine.templates,
    compatibilityTemplates: report.compatibilityEngine.templates,
    mappings: report.mapping.length,
    mapped: report.mapping.filter((item) => item.status === 'MAPPED').length,
    governedPlatform: report.platform.status,
    governance: report.governance,
    timestamp: report.timestamp
  };
}

module.exports = {
  compatibilityToCanonicalTemplate,
  defaultUnificationDna,
  buildTemplateMapping,
  buildTemplateEngineUnificationReport,
  unifyTemplateExpansion,
  getTemplateEngineUnificationStatus
};
