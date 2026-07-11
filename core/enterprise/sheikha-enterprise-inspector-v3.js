'use strict';

const path = require('path');
const { collectControlTowerStatus } = require('./sheikha-enterprise-control-tower-v1');
const { getEnterpriseState } = require('./sheikha-enterprise-orchestrator-v1');
const { status: getExecutivePlatformStatus } = require('../executive-platform/sheikha-executive-platform-v2');
const { status: getLifeFabricStatus } = require('../life-fabric/sheikha-technical-life-operating-ecosystem-v1');
const { status: getLifeIntegrationStatus } = require('../life-fabric/integration/sheikha-life-fabric-integration-v2');
const runtimeFabricV5 = require('../../runtime/runtime-fabric-v5/runtime-fabric-v5');
const civilizationCommand = require(
  '../../runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1'
);
const civilizationStewardship = require(
  '../../runtime/civilization-stewardship-apex/v1/civilization-stewardship-apex-v1'
);
const covenantGovernance = require(
  '../../runtime/covenant-governance-apex/v1/covenant-governance-apex-v1'
);
const layerGovernance = require(
  '../../runtime/layer-governance-promotion-os/v1/layer-governance-promotion-os-v1'
);
const extensionExperience = require(
  '../../runtime/extension-experience-apex/v1/sheikha-vscode-extension-experience-apex-v1'
);
const enterpriseManagement = require(
  '../../runtime/enterprise-management-os/sheikha-enterprise-management-os-v1'
);
const debuggingApex = require(
  '../../runtime/debugging-apex/v1/sheikha-debugging-apex-v1'
);
const chatInterfaceApex = require(
  '../../runtime/chat-interface-apex/v1/sheikha-chat-interface-apex-v1'
);
const ideApex = require(
  '../../runtime/ide-apex/v1/sheikha-ide-apex-v1'
);
const technicalCapabilityApex = require(
  '../../runtime/technical-capability-apex/v1/sheikha-technical-capability-apex-v1'
);
const computingCognitiveApex = require(
  '../../runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1'
);
const streamingChatApex = require(
  '../../runtime/streaming-chat-apex/v1/sheikha-streaming-chat-apex-v1'
);
const extensionStreamingArtifactApex = require(
  '../../runtime/extension-streaming-artifact-apex/v1/sheikha-extension-streaming-artifact-apex-v1'
);
const cloudProductionDeploymentApex = require(
  '../../runtime/cloud-production-deployment-apex/v1/sheikha-cloud-production-deployment-apex-v1'
);
const distributionReleaseApex = require(
  '../../runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1'
);
const universalDeliveryV2 = require(
  '../../runtime/distribution/v2/sheikha-universal-delivery-v2-status'
);
const nativeDeliveryV3 = require(
  '../../runtime/distribution/v3/sheikha-native-delivery-v3-status'
);
const nativeDesktopV31 = require(
  '../../runtime/distribution/v3.1/sheikha-native-desktop-v31-status'
);
const publicBenefitCapabilityRouter = require(
  '../../runtime/governance-generator/v1/sheikha-public-benefit-capability-router-v1'
);
const nativeLanguageArchitecture = require(
  '../../runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json'
);

const MAX_DIAGNOSTIC_GROUPS = 30;
const MAX_DIAGNOSTICS_PER_GROUP = 20;
const INSPECTOR_CACHE_TTL_MS = 10000;

const INSPECTOR_RUNTIME_STATE = {
  extension: {
    source: 'SHEIKHA_VSCODE_TOOL_REGISTRY_V1',
    status: 'NOT_CONNECTED',
    workspace: {
      name: '',
      branch: '',
      changedFiles: [],
      activeFile: '',
      languageId: '',
      openEditors: []
    },
    diagnostics: [],
    lastHeartbeat: null
  }
};
const INSPECTOR_SNAPSHOT_CACHE = {
  snapshot: null,
  expiresAt: 0
};

function basename(value) {
  const text = String(value || '');
  return text ? path.basename(text) : '';
}

function normalizeExtensionStatus(inputStatus, toolStatus) {
  const raw = String(inputStatus || toolStatus || '').toUpperCase();

  if (raw === 'CONNECTED' || raw === 'ACTIVE') {
    return 'CONNECTED';
  }

  return 'NOT_CONNECTED';
}

function sanitizeExtensionContext(input = {}) {
  const tools = input.vscodeTools || input.tools || {};
  const workspace = input.workspace || {};

  const diagnostics = Array.isArray(tools.diagnostics)
    ? tools.diagnostics.slice(0, MAX_DIAGNOSTIC_GROUPS).map((group) => ({
        file: basename(group.file),
        diagnostics: Array.isArray(group.diagnostics)
          ? group.diagnostics.slice(0, MAX_DIAGNOSTICS_PER_GROUP).map((item) => ({
              message: String(item.message || '').slice(0, 500),
              severity: Number(item.severity),
              line: Number(item.line) || 0,
              character: Number(item.character) || 0
            }))
          : []
      }))
    : [];

  return {
    source: input.source || tools.registry || 'SHEIKHA_VSCODE_TOOL_REGISTRY_V1',
    status: normalizeExtensionStatus(input.status, tools.status),
    workspace: {
      name: basename(tools.workspaceRoot || workspace.workspaceRoot),
      branch: String(tools.gitBranch || workspace.gitBranch || '').slice(0, 200),
      changedFiles: String(tools.gitStatus || workspace.gitStatus || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 100),
      activeFile: basename(tools.activeFile || workspace.activeFile),
      languageId: String(tools.languageId || workspace.languageId || '').slice(0, 100),
      openEditors: Array.isArray(tools.openEditors)
        ? tools.openEditors.slice(0, 50).map((editor) => ({
            file: basename(editor.file),
            languageId: String(editor.languageId || '').slice(0, 100),
            isDirty: Boolean(editor.isDirty)
          }))
        : []
    },
    diagnostics
  };
}

function updateExtensionHeartbeat(payload = {}) {
  const extension = sanitizeExtensionContext(payload);

  INSPECTOR_RUNTIME_STATE.extension = {
    ...extension,
    lastHeartbeat: new Date().toISOString()
  };
  INSPECTOR_SNAPSHOT_CACHE.expiresAt = 0;

  return INSPECTOR_RUNTIME_STATE.extension;
}

function getEnterpriseInspectorSnapshot(options = {}) {
  const now = Date.now();
  if (!options.force && INSPECTOR_SNAPSHOT_CACHE.snapshot && now < INSPECTOR_SNAPSHOT_CACHE.expiresAt) {
    return INSPECTOR_SNAPSHOT_CACHE.snapshot;
  }
  const snapshot = collectEnterpriseInspector(options.input || {});
  INSPECTOR_SNAPSHOT_CACHE.snapshot = snapshot;
  INSPECTOR_SNAPSHOT_CACHE.expiresAt = now + INSPECTOR_CACHE_TTL_MS;
  return snapshot;
}

function summarizeDiagnostics(groups = []) {
  const summary = { errors: 0, warnings: 0, information: 0, total: 0 };

  groups.forEach((group) => {
    (group.diagnostics || []).forEach((item) => {
      summary.total += 1;
      if (item.severity === 0) summary.errors += 1;
      else if (item.severity === 1) summary.warnings += 1;
      else summary.information += 1;
    });
  });

  return summary;
}

function getCurrentExtensionContext(input = {}) {
  if (INSPECTOR_RUNTIME_STATE.extension.lastHeartbeat) {
    return INSPECTOR_RUNTIME_STATE.extension;
  }

  return sanitizeExtensionContext(input);
}

function collectEnterpriseInspector(input = {}) {
  const controlTower = collectControlTowerStatus();
  const orchestrator = getEnterpriseState(controlTower);
  const executive = getExecutivePlatformStatus(controlTower);
  const extension = getCurrentExtensionContext(input);
  const diagnostics = summarizeDiagnostics(extension.diagnostics);
  const runtimeFabric = runtimeFabricV5.status();
  const runtimeFabricMetrics = runtimeFabricV5.observability.snapshot();
  const civilizationCommandStatus = civilizationCommand.status();
  const civilizationStewardshipStatus = civilizationStewardship.status();
  const covenantGovernanceStatus = covenantGovernance.status();
  const layerGovernanceStatus = layerGovernance.status();
  const extensionExperienceStatus = extensionExperience.status();
  const enterpriseManagementStatus = enterpriseManagement.status();
  const debuggingApexStatus = debuggingApex.status();
  const chatInterfaceApexStatus = chatInterfaceApex.status();
  const ideApexStatus = ideApex.status();
  const technicalCapabilityApexStatus = technicalCapabilityApex.status();
  const computingCognitiveApexStatus = computingCognitiveApex.status();
  const streamingChatApexStatus = streamingChatApex.status();
  const extensionStreamingArtifactApexStatus = extensionStreamingArtifactApex.status();
  const cloudProductionDeploymentApexStatus = cloudProductionDeploymentApex.status();
  const distributionReleaseApexStatus = distributionReleaseApex.status();
  const universalDeliveryV2Status = universalDeliveryV2.status();
  const nativeDeliveryV3Status = nativeDeliveryV3.status();
  const nativeDesktopV31Status = nativeDesktopV31.status();
  const publicBenefitCapabilityRouterStatus = publicBenefitCapabilityRouter.status();

  const changedFiles = String(controlTower.git.status || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    success: true,
    inspector: 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
    status: diagnostics.errors > 0 ? 'ATTENTION' : 'ACTIVE',
    generatedAt: new Date().toISOString(),
    scope: 'runtime-git-governance-chat-extension-observability-architecture',
    governance: {
      status: 'ACTIVE',
      policies: controlTower.governance.policies,
      capabilityTokens: controlTower.governance.capabilityTokens,
      executionContracts: controlTower.governance.executionContracts,
      contextPolicy: 'MINIMUM_NECESSARY_NO_SECRETS',
      humanReviewForHighImpactActions: true,
      externalWritesRequireAuthorization: true
    },
    health: {
      overall: diagnostics.errors > 0 ? 'ATTENTION' : 'HEALTHY',
      runtime: 'ACTIVE',
      governance: 'ACTIVE',
      unifiedChat: 'ACTIVE',
      runtimeFabricV5: runtimeFabric.status,
      civilizationCommand: civilizationCommandStatus.status,
      civilizationStewardship: civilizationStewardshipStatus.status,
      covenantGovernance: covenantGovernanceStatus.status,
      layerGovernance: layerGovernanceStatus.status,
      extensionExperience: extensionExperienceStatus.status,
      enterpriseManagement: enterpriseManagementStatus.status,
      debuggingApex: debuggingApexStatus.status,
      chatInterfaceApex: chatInterfaceApexStatus.status,
      ideApex: ideApexStatus.status,
      technicalCapabilityApex: technicalCapabilityApexStatus.status,
      computingCognitiveApex: computingCognitiveApexStatus.status,
      streamingChatApex: streamingChatApexStatus.status,
      extensionStreamingArtifactApex: extensionStreamingArtifactApexStatus.status,
      cloudProductionDeploymentApex: cloudProductionDeploymentApexStatus.status,
      distributionReleaseApex: distributionReleaseApexStatus.status,
      universalDeliveryV2: universalDeliveryV2Status.status,
      nativeDeliveryV3: nativeDeliveryV3Status.status,
      nativeDesktopV31: nativeDesktopV31Status.status,
      publicBenefitCapabilityRouter: publicBenefitCapabilityRouterStatus.status,
      nativeLanguageArchitecture: nativeLanguageArchitecture.status,
      extension: extension.status,
      diagnostics
    },
    runtime: controlTower.runtime,
    git: {
      ...controlTower.git,
      clean: changedFiles.length === 0,
      changedFileCount: changedFiles.length
    },
    workspace: extension.workspace,
    extension: {
      source: extension.source,
      status: extension.status,
      lastHeartbeat: extension.lastHeartbeat,
      diagnostics: extension.diagnostics
    },
    intelligence: {
      provider: executive.ai.provider,
      route: executive.ai.route,
      timeline: executive.ai.timeline,
      modes: {
        runtime: ['smart', 'generative', 'rag', 'agentic', 'multi-agent', 'mcp', 'sdk', 'cli', 'graphics'],
        researchOnly: ['agi-research', 'asi-research'],
        actualAgiReached: false,
        actualAsiReached: false
      }
    },
    surfaces: {
      conversationEngine: '/api/sheikha/conversation-engine/v1/chat',
      generalChat: '/api/sheikha/chat',
      unifiedChat: '/api/sheikha/unified-chat',
      extensionChat: '/api/sheikha/extension/chat',
      inspectorStatus: '/api/sheikha/enterprise-inspector/v3/status',
      inspectorContext: '/api/sheikha/enterprise-inspector/v3/context',
      architecture: '/api/sheikha/enterprise-inspector/v3/architecture',
      runtimeFabric: '/api/sheikha/runtime-fabric/v5/status',
      runtimeFabricMetrics: '/api/sheikha/runtime-fabric/v5/metrics',
      civilizationStewardship: '/api/sheikha/civilization-stewardship/v1/status',
      civilizationStewardshipDashboard:
        '/api/sheikha/civilization-stewardship/v1/dashboard',
      covenantGovernance: '/api/sheikha/covenant-governance/v1/status',
      covenantGovernancePolicies: '/api/sheikha/covenant-governance/v1/policies',
      layerGovernance: '/api/sheikha/layer-governance/v1/status',
      layerCatalog: '/api/sheikha/layer-governance/v1/catalog',
      extensionExperience: '/api/sheikha/extension-experience/v1/status',
      debuggingApex: '/api/sheikha/debugging-apex/v1/status',
      chatInterfaceApex: '/api/sheikha/chat-interface-apex/v1/status',
      ideApex: '/api/sheikha/ide-apex/v1/status',
      technicalCapabilityApex: '/api/sheikha/technical-capability-apex/v1/status',
      streamingChatApex: '/api/sheikha/streaming-chat-apex/v1/status',
      streamingChatStream: '/api/sheikha/streaming-chat-apex/v1/stream',
      extensionStreamingArtifactApex:
        '/api/sheikha/extension-streaming-artifact-apex/v1/status',
      cloudProductionDeploymentApex:
        '/api/sheikha/cloud-production-deployment-apex/v1/status',
      cloudProductionDeploymentPlan:
        '/api/sheikha/cloud-production-deployment-apex/v1/plan',
      distributionReleaseApex: '/api/sheikha/distribution-apex/v1/status',
      distributionReleaseMatrix: '/api/sheikha/distribution-apex/v1/matrix',
      distributionReleaseIndex: '/api/sheikha/distribution-apex/v1/release-index',
      universalDeliveryV2: '/api/sheikha/distribution-apex/v2/status',
      universalDeliveryV2Matrix: '/api/sheikha/distribution-apex/v2/matrix',
      universalDeliveryV2ReleaseIndex: '/api/sheikha/distribution-apex/v2/release-index',
      publicBenefitPolicy: '/api/governance/generator/public-benefit-policy',
      publicBenefitCoverage: '/api/governance/generator/public-benefit/coverage',
      publicBenefitEvaluation: '/api/governance/generator/public-benefit/evaluate',
      nativeLanguageArchitecture:
        '/api/governance/generator/sheikha-language-architecture',
      enterpriseManagement: '/api/sheikha/enterprise-management-os/status',
      civilizationCommand: '/api/sheikha/civilization-command/v1/status',
      civilizationDashboard: '/api/sheikha/civilization-command/v1/dashboard'
    },
    architecture: {
      root: 'SHEIKHA_ROOT',
      nodes: [
        'Root Authority',
        'Governance Center',
        'Enterprise Orchestrator',
        'Covenant Governance Apex',
        'Layer Governance and Promotion OS',
        'VS Code Extension Experience Apex',
        'Extension Streaming Artifact Apex',
        'Streaming Multilingual Chat Apex',
        'Cloud Production Deployment Apex',
        'Universal Distribution Release Apex',
        'Universal Delivery and Installer Fabric V2',
        'Public Benefit Capability Router',
        'Native Sheikha Language Architecture Foundation',
        'Technical Capability Apex',
        'Debugging Apex',
        'Chat Interface Apex',
        'IDE Apex',
        'Enterprise Management OS',
        'Civilization Stewardship Apex',
        'Civilization Command & Intelligence Plane',
        'Runtime Fabric V5',
        'Runtime Control Tower',
        'Knowledge Fabric',
        'Decision Registry',
        'Capability Registry',
        'Unified Chat Fabric',
        'Enterprise Inspector',
        'VS Code Extension'
      ],
      flow: [
        'Intent Classification',
        'Governance Review',
        'Capability Resolution',
        'Context Minimization',
        'Execution Pipeline',
        'Verification',
        'Arabic Executive Response',
        'Audit Evidence'
      ]
    },
    runtimeFabric: {
      status: runtimeFabric.status,
      position: runtimeFabric.position,
      managementPlane: runtimeFabric.managementPlane,
      cluster: runtimeFabric.cluster,
      metrics: runtimeFabricMetrics
    },
    civilizationCommand: {
      status: civilizationCommandStatus.status,
      level: civilizationCommandStatus.level,
      governanceAuthority: civilizationCommandStatus.governanceAuthority,
      operationalAuthority: civilizationCommandStatus.operationalAuthority,
      storage: civilizationCommandStatus.storage
    },
    civilizationStewardship: {
      status: civilizationStewardshipStatus.status,
      level: civilizationStewardshipStatus.level,
      apexLevel: civilizationStewardshipStatus.apexLevel,
      governanceAuthority: civilizationStewardshipStatus.governanceAuthority,
      delegatedCommandPlane: civilizationStewardshipStatus.delegatedCommandPlane,
      storage: civilizationStewardshipStatus.storage
    },
    covenantGovernance: {
      status: covenantGovernanceStatus.status,
      level: covenantGovernanceStatus.level,
      apexLevel: covenantGovernanceStatus.apexLevel,
      governanceAuthority: covenantGovernanceStatus.governanceAuthority,
      governedStewardshipLayer: covenantGovernanceStatus.governedStewardshipLayer,
      policyCount: covenantGovernanceStatus.policyRegistry.policies.length,
      storage: covenantGovernanceStatus.storage
    },
    layerGovernance: {
      status: layerGovernanceStatus.status,
      level: layerGovernanceStatus.level,
      apexLevel: layerGovernanceStatus.apexLevel,
      governanceAuthority: layerGovernanceStatus.governanceAuthority,
      indexedLayers: layerGovernanceStatus.indexedLayers,
      indexedFabricRoutes: layerGovernanceStatus.indexedFabricRoutes,
      automation: layerGovernanceStatus.automation,
      boundaries: layerGovernanceStatus.boundaries,
      storage: layerGovernanceStatus.storage
    },
    extensionExperience: extensionExperienceStatus,
    extensionStreamingArtifactApex: extensionStreamingArtifactApexStatus,
    streamingChatApex: streamingChatApexStatus,
    cloudProductionDeploymentApex: cloudProductionDeploymentApexStatus,
    distributionReleaseApex: distributionReleaseApexStatus,
    universalDeliveryV2: universalDeliveryV2Status,
    nativeDeliveryV3: nativeDeliveryV3Status,
    nativeDesktopV31: nativeDesktopV31Status,
    publicBenefitCapabilityRouter: publicBenefitCapabilityRouterStatus,
    nativeLanguageArchitecture,
    technicalCapabilityApex: technicalCapabilityApexStatus,
    computingCognitiveApex: computingCognitiveApexStatus,
    chatInterfaceApex: chatInterfaceApexStatus,
    ideApex: ideApexStatus,
    enterpriseManagement: enterpriseManagementStatus,
    lifeFabric: getLifeFabricStatus(),
    lifeIntegration: getLifeIntegrationStatus(),
    orchestration: {
      engine: orchestrator.orchestrator,
      status: orchestrator.status,
      layers: orchestrator.layers
    }
  };
}

function compactInspectorContext(snapshot = {}) {
  return {
    success: snapshot.success === true,
    inspector: snapshot.inspector || 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
    status: snapshot.status || 'UNKNOWN',
    generatedAt: snapshot.generatedAt || null,
    health: snapshot.health || {},
    runtime: snapshot.runtime || {},
    git: snapshot.git || {},
    workspace: snapshot.workspace || {},
    extension: snapshot.extension || {},
    governance: snapshot.governance || {},
    architecture: snapshot.architecture || {},
    surfaces: snapshot.surfaces || {}
  };
}

module.exports = {
  collectEnterpriseInspector,
  compactInspectorContext,
  getEnterpriseInspectorSnapshot,
  sanitizeExtensionContext,
  summarizeDiagnostics,
  updateExtensionHeartbeat,
  INSPECTOR_RUNTIME_STATE,
  INSPECTOR_SNAPSHOT_CACHE
};
