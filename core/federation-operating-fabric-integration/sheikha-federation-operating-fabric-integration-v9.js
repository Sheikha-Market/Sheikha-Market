'use strict';

const {
  getArchitectureStatus,
  getArchitectureRegistry,
  getArchitectureRelationshipGraph,
  validateEnterpriseArchitecture
} = require('../enterprise-architecture/sheikha-enterprise-architecture');

const {
  buildDynamicFederationRegistryV2Report,
  relationshipDictionary,
  expansionStages
} = require('../dynamic-federation-registry/sheikha-dynamic-federation-registry-v2');

const {
  listCapabilities,
  compatibilityMatrix
} = require('../capability-compatibility/sheikha-capability-compatibility-v1');

const {
  lifecycleStates,
  eventTypes
} = require('../universal-federation-engine/sheikha-universal-federation-engine-v5');

const {
  metaEngines
} = require('../meta-federation-orchestrator/sheikha-meta-federation-orchestrator-v6');

const {
  dnaSchema,
  universalBlueprints,
  validateDna
} = require('../federation-blueprint-engine/sheikha-federation-blueprint-engine-v7');

const {
  sdkTargets,
  universalTemplateLibrary,
  installFederationTemplatePackage,
  buildFederationTemplateEngineReport,
  buildPersistentRegistrySnapshot
} = require('../federation-template-engine/sheikha-federation-template-engine-v8');

const defaultIntegrationDna = Object.freeze({
  name: 'Sheikha Integration PostgreSQL Federation',
  family: 'PostgreSQL Family',
  blueprint: 'PostgreSQL',
  version: '1.0.0',
  actor: 'federation-operating-fabric-v9',
  reason: 'Integrated operating fabric readiness package'
});

function compactEngineTrace(packageResult) {
  const v7 = packageResult.expansion || {};
  const v6 = v7.result || {};
  const v5 = v6.result || {};
  const v4 = v5.expansion || {};

  return [
    {
      layer: 'Architecture Registry V2',
      system: 'SHEIKHA_ENTERPRISE_ARCHITECTURE_V2',
      status: validateEnterpriseArchitecture().valid ? 'ACTIVE' : 'BLOCKED',
      responsibility: 'canonical enterprise layer registry'
    },
    {
      layer: 'Dynamic Federation Registry V2',
      system: 'SHEIKHA_DYNAMIC_FEDERATION_REGISTRY_V2',
      status: buildDynamicFederationRegistryV2Report().status,
      responsibility: 'relationship dictionary and governed registry graph'
    },
    {
      layer: 'Federation Expansion Engine V4',
      system: v4.system || 'SHEIKHA_FEDERATION_EXPANSION_ENGINE_V4',
      status: v4.status || 'UNKNOWN',
      responsibility: 'governed DNA expansion into internal registries'
    },
    {
      layer: 'Universal Federation Engine V5',
      system: v5.system || 'SHEIKHA_UNIVERSAL_FEDERATION_ENGINE_V5',
      status: v5.status || 'UNKNOWN',
      responsibility: 'lifecycle, events, capability graph, and compatibility'
    },
    {
      layer: 'Meta Federation Orchestrator V6',
      system: v6.system || 'SHEIKHA_META_FEDERATION_ORCHESTRATOR_V6',
      status: v6.status || 'UNKNOWN',
      responsibility: 'meta orchestration over federation engines'
    },
    {
      layer: 'Federation Blueprint Engine V7',
      system: v7.system || 'SHEIKHA_FEDERATION_BLUEPRINT_ENGINE_V7',
      status: v7.status || 'UNKNOWN',
      responsibility: 'DNA schema validation and blueprint resolution'
    },
    {
      layer: 'Federation Template Engine V8',
      system: packageResult.system,
      status: packageResult.status,
      responsibility: 'template, package, OpenAPI, and SDK descriptors'
    }
  ];
}

function buildIntegrationReadiness(packageResult) {
  const architectureValidation = validateEnterpriseArchitecture();
  const dnaValidation = validateDna(defaultIntegrationDna);
  const templateReport = buildFederationTemplateEngineReport();
  const persistentRegistry = buildPersistentRegistrySnapshot();
  const engines = compactEngineTrace(packageResult);
  const allActive = engines.every((engine) =>
    ['ACTIVE', 'COMMITTED'].includes(engine.status)
  );

  return {
    architectureReady: architectureValidation.valid,
    dnaReady: dnaValidation.valid,
    dynamicRegistryReady: buildDynamicFederationRegistryV2Report().status === 'ACTIVE',
    templateLibraryReady: templateReport.status === 'ACTIVE',
    packageReady: packageResult.status === 'COMMITTED',
    openApiReady: packageResult.openapi?.openapi === '3.1.0',
    sdkDescriptorReady: Array.isArray(packageResult.sdkBundle) &&
      packageResult.sdkBundle.length === sdkTargets.length,
    persistentRegistryReady: persistentRegistry.status === 'ACTIVE',
    governedWriteBoundaryReady: packageResult.package?.policies?.internalRegistryWriteOnly === true,
    noExternalMutation: packageResult.safety?.noExternalMutation === true,
    noHarm: packageResult.safety?.noHarm === true,
    allEnginesLinked: allActive,
    overall: allActive && architectureValidation.valid
      ? 'FEDERATION_OPERATING_FABRIC_INTEGRATED'
      : 'FEDERATION_OPERATING_FABRIC_NEEDS_REVIEW'
  };
}

function buildOperatingMap(packageResult) {
  const architectureStatus = getArchitectureStatus();
  const architectureRegistry = getArchitectureRegistry();
  const relationshipGraph = getArchitectureRelationshipGraph();
  const dynamicRegistryReport = buildDynamicFederationRegistryV2Report();
  const templateReport = buildFederationTemplateEngineReport();

  return {
    architecture: {
      system: architectureStatus.system,
      version: architectureStatus.version,
      layers: architectureStatus.layers,
      activeLayers: architectureStatus.activeLayers,
      healthScore: architectureStatus.healthScore,
      registrySample: architectureRegistry.slice(0, 5),
      relationshipNodes: relationshipGraph.length
    },
    federation: {
      relationshipTypes: relationshipDictionary.length,
      expansionStages: expansionStages.length,
      lifecycleStates: lifecycleStates.length,
      eventTypes: eventTypes.length,
      metaEngines: metaEngines.length,
      blueprints: Object.keys(universalBlueprints).length,
      templates: Object.keys(universalTemplateLibrary).length
    },
    capability: {
      capabilities: listCapabilities().length,
      compatibilityRelations: compatibilityMatrix.length,
      packageCapabilities: packageResult.package?.capabilities?.length || 0
    },
    developerSurface: {
      openApiVersion: packageResult.openapi?.openapi || null,
      openApiPaths: Object.keys(packageResult.openapi?.paths || {}).length,
      sdkTargets: packageResult.sdkBundle?.length || 0,
      sdkDescriptorOnly: (packageResult.sdkBundle || []).every(
        (sdk) => sdk.writeScope === 'DESCRIPTOR_ONLY_NO_FILE_WRITE'
      )
    },
    registries: {
      dynamicRegistry: dynamicRegistryReport.system,
      templateRegistry: templateReport.persistentRegistry.system,
      persistentRecords: templateReport.persistentRegistry.summary.records
    }
  };
}

function buildFederationOperatingFabricIntegrationV9(dna = defaultIntegrationDna) {
  const packageResult = installFederationTemplatePackage({
    ...defaultIntegrationDna,
    ...dna
  });
  const readiness = buildIntegrationReadiness(packageResult);

  return {
    system: 'SHEIKHA_FEDERATION_OPERATING_FABRIC_INTEGRATION_V9',
    status: readiness.overall === 'FEDERATION_OPERATING_FABRIC_INTEGRATED'
      ? 'ACTIVE'
      : 'REVIEW',
    mode: 'GOVERNED_DATA_DRIVEN_FEDERATION_OPERATING_FABRIC',
    purpose:
      'Unify activated architecture, federation registry, expansion, orchestration, blueprint, template, package, OpenAPI, SDK descriptor, capability, and compatibility layers into one governed operating fabric.',
    integrationFlow: [
      'Architecture Registry',
      'Dynamic Federation Registry',
      'DNA Validation',
      'Blueprint Resolution',
      'Governed Expansion',
      'Universal Orchestration',
      'Meta Orchestration',
      'Template Selection',
      'Federation Package',
      'OpenAPI Descriptor',
      'SDK Descriptors',
      'Persistent Registry Snapshot',
      'Capability Graph',
      'Compatibility Matrix',
      'Inspector Evidence'
    ],
    engines: compactEngineTrace(packageResult),
    operatingMap: buildOperatingMap(packageResult),
    package: {
      id: packageResult.package?.id || null,
      name: packageResult.package?.name || null,
      template: packageResult.package?.template?.name || null,
      blueprint: packageResult.package?.blueprint?.name || null,
      status: packageResult.status,
      openapi: packageResult.openapi?.openapi || null,
      sdkTargets: (packageResult.sdkBundle || []).map((sdk) => sdk.target),
      writeScope: packageResult.persistentRecord?.writeScope || null
    },
    readiness,
    governance: {
      readAllowed: true,
      internalRegistryWriteAllowed: true,
      externalSystemWriteAllowed: false,
      descriptorOnlySdkGeneration: true,
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noExternalMutation: true,
      noHarm: true,
      humanReviewForExternalChange: true,
      principle: 'la darar wa la dirar'
    },
    nextActions: [
      'Expose this integration report to Enterprise Inspector as read-only evidence.',
      'Use Architecture Registry V2 as the canonical layer index.',
      'Use V8 package descriptors before generating any real SDK files.',
      'Keep all external system changes behind explicit human approval.'
    ],
    timestamp: new Date().toISOString()
  };
}

function buildFederationOperatingFabricStatus() {
  const report = buildFederationOperatingFabricIntegrationV9();

  return {
    system: report.system,
    status: report.status,
    mode: report.mode,
    readiness: report.readiness.overall,
    layers: {
      architecture: report.operatingMap.architecture.layers,
      relationshipTypes: report.operatingMap.federation.relationshipTypes,
      expansionStages: report.operatingMap.federation.expansionStages,
      templates: report.operatingMap.federation.templates,
      sdkTargets: report.operatingMap.developerSurface.sdkTargets
    },
    governance: report.governance,
    timestamp: report.timestamp
  };
}

module.exports = {
  defaultIntegrationDna,
  compactEngineTrace,
  buildIntegrationReadiness,
  buildOperatingMap,
  buildFederationOperatingFabricIntegrationV9,
  buildFederationOperatingFabricStatus
};
