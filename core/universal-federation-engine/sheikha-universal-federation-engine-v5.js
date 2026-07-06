'use strict';

const {
  expandFederationFromDna,
  installFederationPackage,
  governanceLevels
} = require('../federation-expansion-v4/sheikha-federation-expansion-v4');

const {
  listCapabilities,
  buildCapabilityGraph,
  evaluateCompatibility
} = require('../capability-compatibility/sheikha-capability-compatibility-v1');

const lifecycleStates = Object.freeze([
  'DRAFT',
  'VALIDATED',
  'BLUEPRINT_GENERATED',
  'CAPABILITY_GENERATED',
  'GOVERNANCE_APPROVED',
  'PUBLISHED',
  'INSTALLED',
  'OBSERVED',
  'ARCHIVED'
]);

const eventTypes = Object.freeze([
  'FEDERATION_CREATED',
  'FAMILY_CREATED',
  'BLUEPRINT_CREATED',
  'CAPABILITY_REGISTERED',
  'COMPATIBILITY_EVALUATED',
  'GOVERNANCE_APPROVED',
  'MARKETPLACE_INSTALLED',
  'FEDERATION_OBSERVED'
]);

function createEvent(type, payload = {}) {
  return {
    type,
    payload,
    at: new Date().toISOString(),
    governed: true,
    noHarm: true
  };
}

function buildFederationLifecycle(status = 'DRAFT') {
  return {
    system: 'SHEIKHA_FEDERATION_LIFECYCLE_V5',
    current: status,
    states: lifecycleStates,
    allowed: lifecycleStates.includes(status)
  };
}

function resolveFederationDependencies(request = {}) {
  const dependencies = [];

  for (const capability of request.capabilities || []) {
    dependencies.push({
      capability,
      required: true,
      registered: Boolean(listCapabilities().find((item) => item.id === capability))
    });
  }

  return {
    system: 'SHEIKHA_FEDERATION_DEPENDENCY_RESOLVER_V5',
    status: dependencies.every((item) => item.registered) ? 'RESOLVED' : 'PARTIAL',
    dependencies
  };
}

function runUniversalFederationEngine(request = {}) {
  const expansion = request.marketplacePackage
    ? installFederationPackage(request.marketplacePackage, {
        actor: request.actor || 'universal-engine',
        governanceLevel: request.governanceLevel || governanceLevels.LEVEL_2_INTERNAL_WRITE,
        policies: request.policies || {}
      })
    : expandFederationFromDna({
        ...request,
        actor: request.actor || 'universal-engine'
      });

  if (expansion.status !== 'COMMITTED') {
    return {
      system: 'SHEIKHA_UNIVERSAL_FEDERATION_ENGINE_V5',
      status: expansion.status,
      expansion,
      safety: {
        noExternalMutation: true,
        noHarm: true
      }
    };
  }

  const federation =
    expansion.expansion?.baseExpansion?.federation ||
    expansion.expansion?.baseExpansion?.baseExpansion?.federation ||
    null;

  const capabilityGraph = buildCapabilityGraph({
    id: federation?.id || request.name || 'unknown-federation',
    name: federation?.name || request.name,
    capabilities: expansion.dna?.capabilities || request.capabilities || []
  });

  const compatibility = request.compatibility
    ? evaluateCompatibility(request.compatibility.from, request.compatibility.to)
    : null;

  const dependencyResolution = resolveFederationDependencies({
    capabilities: expansion.dna?.capabilities || request.capabilities || []
  });

  const events = [
    createEvent('FEDERATION_CREATED', { name: expansion.dna?.name || request.name }),
    createEvent('BLUEPRINT_CREATED', { type: expansion.dna?.type || request.type }),
    createEvent('CAPABILITY_REGISTERED', { count: capabilityGraph.summary.capabilities }),
    createEvent('GOVERNANCE_APPROVED', { level: expansion.dna?.governanceLevel }),
    createEvent('FEDERATION_OBSERVED', { advisoryOnly: true })
  ];

  return {
    system: 'SHEIKHA_UNIVERSAL_FEDERATION_ENGINE_V5',
    status: 'COMMITTED',
    mode: 'GOVERNED_UNIVERSAL_FEDERATION_ORCHESTRATION',
    writeScope: 'SHEIKHA_INTERNAL_REGISTRY_GRAPH_EVENTS_ONLY',
    lifecycle: buildFederationLifecycle('OBSERVED'),
    expansion,
    capabilityGraph,
    compatibility,
    dependencyResolution,
    events,
    registries: {
      federation: true,
      family: true,
      blueprint: true,
      capability: true,
      compatibility: true,
      governance: true,
      inspector: true,
      marketplace: true,
      observability: true
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

module.exports = {
  lifecycleStates,
  eventTypes,
  createEvent,
  buildFederationLifecycle,
  resolveFederationDependencies,
  runUniversalFederationEngine
};
