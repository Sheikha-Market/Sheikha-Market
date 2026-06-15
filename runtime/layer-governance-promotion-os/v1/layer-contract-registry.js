'use strict';

const manifest = require('../../../tools/activation/sheikha-unified-apex-manifest-v1.json');
const fabric = require('../../fabric-bootstrap/sheikha-fabric-routes.json');
const intelligenceLevels = require(
  '../../root-knowledge-agentic-fabric/v1/registries/intelligence-levels-registry.json'
);
const intelligenceModes = require(
  '../../governed-intelligence-execution-loop/v1/registries/intelligence-mode-execution-registry.json'
);

const LAWS = Object.freeze([
  'SGA-001: evidence before claim',
  'SGA-002: trusted identity and least privilege',
  'SGA-003: justice and accountable review',
  'SGA-004: no harm and rollback readiness',
  'SGA-005: purpose and append-only audit',
  'SGA-006: no self-elevation and governed continuity'
]);

function capabilitiesFor(layer) {
  const words = layer.system.toLowerCase().split('_').filter(Boolean);
  return Array.from(new Set([
    `${layer.authorityClass}-contract`,
    ...words.filter(word => word.length > 3).slice(0, 6)
  ]));
}

function canonicalLayers() {
  return manifest.canonicalOrder.map((layer, index, all) => ({
    id: `LAYER-${String(layer.order).padStart(3, '0')}`,
    system: layer.system,
    order: layer.order,
    authorityClass: layer.authorityClass,
    status: 'REGISTERED_ACTIVE_BASELINE',
    definition: `${layer.system} governed layer contract`,
    capabilities: capabilitiesFor(layer),
    properties: {
      indexed: true,
      evidenceRequired: true,
      auditable: true,
      rollbackRequired: true,
      selfPromotionAllowed: false
    },
    laws: LAWS,
    integration: {
      upstream: index === 0 ? null : all[index - 1].system,
      downstream: index === all.length - 1 ? null : all[index + 1].system,
      sdk: true,
      fabric: true,
      mcp: true,
      api: true
    },
    compatibility: {
      protocol: 'SHEIKHA_LAYER_CONTRACT_V1',
      mergePolicy: 'EVIDENCE_GATED_COMPATIBLE_ONLY',
      integrationPolicy: 'LEAST_PRIVILEGE_AND_EXPLICIT_CONTRACT'
    }
  }));
}

function intelligenceContracts() {
  const contracts = intelligenceLevels.levels.map(level => {
    const mode = intelligenceModes.modes.find(item => item.name === level.name) || null;
    const researchOnly = level.name === 'AGI' || level.name === 'ASI';
    return {
      id: level.id,
      name: level.name,
      definition: level.definition,
      status: mode?.status || level.claimStatus,
      executionClass: mode?.executionClass || level.allowedRuntimeMode,
      operational: !researchOnly,
      researchOnly,
      actualReached: researchOnly ? false : null,
      humanGate: level.humanGate,
      allowedActions: mode?.allowedActions || [],
      prohibitedClaims: mode?.prohibitedClaims || []
    };
  });
  intelligenceModes.modes.forEach(mode => {
    if (contracts.some(contract => contract.name === mode.name)) return;
    contracts.push({
      id: mode.id,
      name: mode.name,
      definition: `${mode.name} governed execution contract`,
      status: mode.status,
      executionClass: mode.executionClass,
      operational: mode.status === 'ACTIVE',
      researchOnly: mode.status === 'RESEARCH_ONLY',
      actualReached: mode.actualReached ?? null,
      humanGate: 'REQUIRED_WHEN_RISK_OR_IMPACT_IS_HIGH',
      allowedActions: mode.allowedActions || [],
      prohibitedClaims: mode.prohibitedClaims || []
    });
  });
  return contracts;
}

function snapshot() {
  const layers = canonicalLayers();
  const routes = fabric.routes.map(route => ({
    name: route.name,
    mount: route.mount,
    module: route.module,
    priority: route.priority
  }));
  return {
    registry: 'SHEIKHA_LAYER_CONTRACT_REGISTRY_V1',
    status: 'ACTIVE',
    protocol: 'SHEIKHA_LAYER_CONTRACT_V1',
    layerCount: layers.length,
    layers,
    fabric: {
      registry: fabric.bootstrap,
      routeCount: routes.length,
      routes
    },
    intelligence: {
      registry: intelligenceLevels.registry,
      modeRegistry: intelligenceModes.registry,
      contracts: intelligenceContracts(),
      boundaries: {
        noConsciousnessClaim: true,
        noActualAgiClaim: true,
        noActualAsiClaim: true,
        humanFinalAuthority: true
      }
    }
  };
}

module.exports = { LAWS, canonicalLayers, intelligenceContracts, snapshot };
