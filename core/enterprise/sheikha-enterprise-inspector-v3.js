'use strict';

const path = require('path');
const { collectControlTowerStatus } = require('./sheikha-enterprise-control-tower-v1');
const { getEnterpriseState } = require('./sheikha-enterprise-orchestrator-v1');
const { status: getExecutivePlatformStatus } = require('../executive-platform/sheikha-executive-platform-v2');
const { status: getLifeFabricStatus } = require('../life-fabric/sheikha-technical-life-operating-ecosystem-v1');
const { status: getLifeIntegrationStatus } = require('../life-fabric/integration/sheikha-life-fabric-integration-v2');

const MAX_DIAGNOSTIC_GROUPS = 30;
const MAX_DIAGNOSTICS_PER_GROUP = 20;

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

  return INSPECTOR_RUNTIME_STATE.extension;
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
      architecture: '/api/sheikha/enterprise-inspector/v3/architecture'
    },
    architecture: {
      root: 'SHEIKHA_ROOT',
      nodes: [
        'Root Authority',
        'Governance Center',
        'Enterprise Orchestrator',
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
  sanitizeExtensionContext,
  summarizeDiagnostics,
  updateExtensionHeartbeat,
  INSPECTOR_RUNTIME_STATE
};
