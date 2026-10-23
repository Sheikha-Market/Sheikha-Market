'use strict';

const crypto = require('node:crypto');

const STUDIO_TOOLS = Object.freeze([
  { id: 'CODE_EDITOR', category: 'AUTHORING', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'FILE_EXPLORER', category: 'AUTHORING', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'TERMINAL', category: 'EXECUTION', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'TASK_RUNNER', category: 'EXECUTION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'DEBUGGER', category: 'QUALITY', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'TEST_EXPLORER', category: 'QUALITY', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'PROBLEMS_DIAGNOSTICS', category: 'QUALITY', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'GIT_SOURCE_CONTROL', category: 'COLLABORATION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'CODE_REVIEW', category: 'COLLABORATION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'SHEIKHA_LANGUAGE_LSP', category: 'LANGUAGE', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'MULTI_LANGUAGE_LSP', category: 'LANGUAGE', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'AI_CHAT', category: 'INTELLIGENCE', nativeState: 'RUNTIME_AVAILABLE' },
  { id: 'MODEL_ROUTER', category: 'INTELLIGENCE', nativeState: 'RUNTIME_AVAILABLE' },
  { id: 'CODING_AGENT', category: 'INTELLIGENCE', nativeState: 'RUNTIME_AVAILABLE' },
  { id: 'MCP_TOOLS', category: 'INTELLIGENCE', nativeState: 'RUNTIME_AVAILABLE' },
  { id: 'RAG_EXPLORER', category: 'KNOWLEDGE', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'DATABASE_EXPLORER', category: 'DATA', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'API_CLIENT', category: 'INTEGRATION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'CONTAINER_TOOLS', category: 'DELIVERY', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'DEPLOYMENT_CENTER', category: 'DELIVERY', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'OBSERVABILITY', category: 'OPERATIONS', nativeState: 'RUNTIME_AVAILABLE' },
  { id: 'ENTERPRISE_INSPECTOR', category: 'GOVERNANCE', nativeState: 'RUNTIME_AVAILABLE' },
  { id: 'SHEIKHA_GIT_LAB_HUB', category: 'COLLABORATION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'SDK_MANAGER', category: 'INTEGRATION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'CLI_MANAGER', category: 'EXECUTION', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'MCP_EXPLORER', category: 'INTELLIGENCE', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'LANGUAGE_CATALOG', category: 'LANGUAGE', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'PHP_TOOLCHAIN', category: 'LANGUAGE', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'AZURE_CLOUD_CENTER', category: 'DELIVERY', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'AZURE_AI_FOUNDRY', category: 'INTELLIGENCE', nativeState: 'GOVERNED_ADAPTER_REQUIRED' },
  { id: 'SHEIKHA_TRUST_TOOLS', category: 'GOVERNANCE', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'SHEIKHA_FOUNDRY', category: 'INTELLIGENCE', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'SHEIKHA_CLOUD', category: 'DELIVERY', nativeState: 'FOUNDATION_AVAILABLE' },
  { id: 'SHEIKHA_UNIFIED_ECOSYSTEM', category: 'GOVERNANCE', nativeState: 'FOUNDATION_AVAILABLE' },
]);

const TOOL_ADAPTERS = Object.freeze([
  {
    id: 'SHEIKHA_NATIVE_WEB_ADAPTER',
    role: 'PRIMARY_PRODUCT_SURFACE',
    dependency: 'INTERNAL',
    temporary: false,
  },
  {
    id: 'SHEIKHA_CLI_ADAPTER',
    role: 'PRIMARY_AUTOMATION_SURFACE',
    dependency: 'INTERNAL',
    temporary: false,
  },
  {
    id: 'VSCODE_EXTENSION_ADAPTER',
    role: 'TEMPORARY_TOOL_AND_RESOURCE_BRIDGE',
    dependency: 'OPTIONAL_EXTERNAL_HOST',
    temporary: true,
  },
  {
    id: 'CODER_REMOTE_WORKSPACE_ADAPTER',
    role: 'OPTIONAL_REMOTE_DEVELOPMENT_BRIDGE',
    dependency: 'OPTIONAL_EXTERNAL_HOST',
    temporary: true,
  },
  {
    id: 'VISUAL_STUDIO_COMPATIBILITY_ADAPTER',
    role: 'OPTIONAL_PROJECT_AND_DEBUG_BRIDGE',
    dependency: 'OPTIONAL_EXTERNAL_HOST',
    temporary: true,
  },
]);

function buildStudioProductStatus(input = {}) {
  const nativeToolCount = STUDIO_TOOLS.filter((tool) =>
    tool.nativeState !== 'GOVERNED_ADAPTER_REQUIRED').length;
  const adapterRequiredToolCount = STUDIO_TOOLS.length - nativeToolCount;
  const commercialGates = {
    editorRuntimeVerified: input.editorRuntimeVerified === true,
    terminalIsolationVerified: input.terminalIsolationVerified === true,
    debuggerVerified: input.debuggerVerified === true,
    extensionIndependentLaunchVerified: input.extensionIndependentLaunchVerified === true,
    persistenceAndRecoveryVerified: input.persistenceAndRecoveryVerified === true,
    loadAndSecurityVerified: input.loadAndSecurityVerified === true,
  };
  const blockers = Object.entries(commercialGates)
    .filter(([, passed]) => !passed)
    .map(([gate]) => gate);
  const base = {
    system: 'SHEIKHA_STUDIO_PRODUCT_V1',
    productName: 'Sheikha Studio',
    arabicName: 'شيخة ستوديو',
    identity: 'INDEPENDENT_GOVERNED_DEVELOPMENT_PRODUCT',
    status: blockers.length
      ? 'FOUNDATION_ACTIVE_ADAPTER_ASSISTED'
      : 'READY_FOR_CONTROLLED_COMMERCIAL_CANARY',
    coreDependency: {
      vscodeExtensionIsCore: false,
      vscodeExtensionRole: 'OPTIONAL_TEMPORARY_TOOL_ADAPTER',
      studioRunsAsIndependentRuntime: true,
      modelProviderReplaceable: true,
      editorHostReplaceable: true,
    },
    tools: STUDIO_TOOLS,
    adapters: TOOL_ADAPTERS,
    coverage: {
      totalTools: STUDIO_TOOLS.length,
      nativeOrRuntimeTools: nativeToolCount,
      adapterRequiredTools: adapterRequiredToolCount,
      nativeCoveragePercent: Number(((nativeToolCount / STUDIO_TOOLS.length) * 100).toFixed(2)),
    },
    commercialGates,
    blockers,
    commercialProductionApproved: false,
    migrationPolicy: {
      useAdaptersUntilNativeReplacementVerified: true,
      adapterRemovalRequiresContractParity: true,
      noExtensionStateAsCanonicalData: true,
      canonicalStateLocation: 'SHEIKHA_RUNTIME_AND_PROJECT_WORKSPACE',
    },
  };
  return {
    ...base,
    statusSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex'),
  };
}

function planStudioToolRoute(input = {}) {
  const toolId = String(input.toolId || '').trim().toUpperCase();
  const tool = STUDIO_TOOLS.find((candidate) => candidate.id === toolId);
  if (!tool) {
    return {
      system: 'SHEIKHA_STUDIO_TOOL_ROUTE_V1',
      status: 'UNKNOWN_TOOL',
      toolId: toolId || null,
      selectedAdapter: null,
      executionStarted: false,
    };
  }
  const nativeReady = tool.nativeState !== 'GOVERNED_ADAPTER_REQUIRED';
  const temporaryAdaptersAllowed = input.temporaryAdaptersAllowed !== false;
  return {
    system: 'SHEIKHA_STUDIO_TOOL_ROUTE_V1',
    status: nativeReady
      ? 'NATIVE_OR_RUNTIME_ROUTE_SELECTED'
      : temporaryAdaptersAllowed
        ? 'TEMPORARY_ADAPTER_ROUTE_SELECTED'
        : 'NATIVE_REPLACEMENT_REQUIRED',
    toolId,
    selectedAdapter: nativeReady
      ? 'SHEIKHA_NATIVE_WEB_ADAPTER'
      : temporaryAdaptersAllowed
        ? 'VSCODE_EXTENSION_ADAPTER'
        : null,
    canonicalStateOwnedByStudio: true,
    executionStarted: false,
    humanApprovalRequiredForHighImpact: input.highImpact === true,
  };
}

module.exports = {
  STUDIO_TOOLS,
  TOOL_ADAPTERS,
  buildStudioProductStatus,
  planStudioToolRoute,
};
