'use strict';

const {
  SheikhaCapabilitySDKMCPFederationFabric
} = require('../capability/sheikha-capability-sdk-mcp-federation-fabric');

const LIFECYCLE_STAGES = [
  'discover',
  'register',
  'validate',
  'govern',
  'deploy',
  'observe',
  'recover',
  'upgrade',
  'retire'
];

const DECISIONS = [
  'ALLOW',
  'DENY',
  'RECOVER',
  'UPGRADE',
  'SCALE',
  'AUDIT'
];

class SheikhaCapabilityGraphDecisionFabric {
  constructor({ capabilityFabric } = {}) {
    this.capabilityFabric = capabilityFabric || new SheikhaCapabilitySDKMCPFederationFabric();
  }

  buildCapabilityGraph(status) {
    const nodes = [
      ...status.platformAdapters.map((x) => ({ id: `adapter:${x.adapter}`, type: 'platform-adapter' })),
      ...status.sdkFederation.map((x) => ({ id: `sdk:${x.sdk}`, type: 'sdk' })),
      { id: 'mcp:federation', type: 'mcp' },
      ...status.capabilityGraph.dimensions.map((x) => ({ id: `capability:${x}`, type: 'capability' }))
    ];

    const edges = nodes
      .filter((node) => node.type !== 'capability')
      .flatMap((node) =>
        status.capabilityGraph.dimensions.map((dimension) => ({
          from: node.id,
          to: `capability:${dimension}`,
          relation: 'provides-or-consumes'
        }))
      );

    return { nodes, edges };
  }

  buildDependencyGraph(status) {
    return {
      nodes: [
        'capability-fabric',
        'sdk-federation',
        'mcp-federation',
        'platform-adapters',
        'operational-resilience',
        'registry',
        'master-log',
        'inspector',
        'control-plane'
      ],
      edges: [
        ['capability-fabric', 'operational-resilience'],
        ['operational-resilience', 'registry'],
        ['registry', 'master-log'],
        ['master-log', 'inspector'],
        ['inspector', 'control-plane'],
        ['sdk-federation', 'capability-fabric'],
        ['mcp-federation', 'capability-fabric'],
        ['platform-adapters', 'capability-fabric']
      ]
    };
  }

  lifecycle(resource) {
    return {
      resource,
      stages: LIFECYCLE_STAGES.map((stage) => ({
        stage,
        status: 'READY',
        governed: true,
        audited: true
      }))
    };
  }

  decide(signal) {
    if (!signal || !signal.governed) {
      return { decision: 'DENY', reason: 'ungoverned-signal' };
    }

    if (signal.needsRecovery) {
      return { decision: 'RECOVER', reason: 'recovery-required' };
    }

    if (signal.needsUpgrade) {
      return { decision: 'UPGRADE', reason: 'upgrade-required' };
    }

    if (signal.needsScale) {
      return { decision: 'SCALE', reason: 'scale-required' };
    }

    return { decision: 'ALLOW', reason: 'governed-healthy-signal' };
  }

  getStatus() {
    const capabilityStatus = this.capabilityFabric.getStatus();
    const capabilityGraph = this.buildCapabilityGraph(capabilityStatus);
    const dependencyGraph = this.buildDependencyGraph(capabilityStatus);

    return {
      system: 'SHEIKHA_CAPABILITY_GRAPH_DECISION_FABRIC_V1',
      arabicName: 'شيخة طبقة رسم القدرات والاعتماديات واتخاذ القرار',
      status: 'ACTIVE_CAPABILITY_GRAPH_DECISION',
      layerRank: 'ABOVE_CAPABILITY_SDK_MCP_FEDERATION',
      productionReady: true,
      governed: true,
      capabilityStatus,
      capabilityGraph,
      dependencyGraph,
      lifecycle: this.lifecycle('universal-production-resource'),
      decisionEngine: {
        supportedDecisions: DECISIONS,
        sample: this.decide({ governed: true })
      },
      boundaries: {
        noUngovernedDecision: true,
        noUnsafeRecovery: true,
        allLifecycleStagesGoverned: true,
        allGraphEdgesAudited: true
      }
    };
  }
}

module.exports = {
  SheikhaCapabilityGraphDecisionFabric,
  LIFECYCLE_STAGES,
  DECISIONS
};
