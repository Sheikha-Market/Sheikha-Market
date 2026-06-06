const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Development Functions Fabric V1', () => {
  test('runtime activates all ten governed development functions', () => {
    const runtime = readJson(
      'runtime/development-functions-fabric/v1/sheikha-development-functions-fabric-v1.json'
    );

    expect(runtime.system).toBe('SHEIKHA_DEVELOPMENT_FUNCTIONS_FABRIC_V1');
    expect(runtime.status).toBe('ACTIVE');
    expect(runtime.modules).toEqual(expect.arrayContaining([
      'RUNTIME_CREATION',
      'REGISTRY_CREATION',
      'TOOL_CREATION',
      'ROUTE_CREATION',
      'TEST_CREATION',
      'NPM_TEST_EXECUTION',
      'LINT_EXECUTION',
      'NO_DRIFT_VERIFICATION',
      'GIT_COMMIT',
      'GIT_PUSH',
      'SDK_FABRIC_MCP_INTEGRATION',
      'EXTENSION_CHAT_TOOLS'
    ]));
    expect(runtime.flow).toEqual(expect.arrayContaining([
      'CREATE_RUNTIME',
      'CREATE_REGISTRY',
      'CREATE_TOOL',
      'CREATE_ROUTE',
      'CREATE_TESTS',
      'RUN_NPM_TEST',
      'RUN_LINT',
      'VERIFY_NO_DRIFT',
      'GIT_COMMIT',
      'GIT_PUSH'
    ]));
    expect(runtime.truthfulness.no_hidden_execution).toBe(true);
    expect(runtime.truthfulness.no_destructive_git_without_explicit_user_request).toBe(true);
    expect(runtime.truthfulness.no_push_without_tests_or_user_override).toBe(true);
    expect(runtime.governanceReference.system_is_tool_not_religious_authority).toBe(true);
  });

  test('workflow registry maps every development function to MCP and extension chat tools', () => {
    const workflow = readJson(
      'runtime/development-functions-fabric/v1/registries/development-workflow-registry.json'
    );
    const sdkMap = readJson(
      'runtime/development-functions-fabric/v1/registries/sdk-fabric-mcp-development-map.json'
    );
    const extensionTools = readJson(
      'runtime/development-functions-fabric/v1/registries/extension-chat-tool-registry.json'
    );

    const stepNames = workflow.steps.map((step) => step.name);
    const mcpTools = workflow.steps.map((step) => step.mcpTool);
    const buttons = workflow.steps.map((step) => step.extensionButton);

    expect(workflow.status).toBe('ACTIVE');
    expect(workflow.steps).toHaveLength(10);
    expect(stepNames).toEqual(expect.arrayContaining([
      'CREATE_RUNTIME',
      'CREATE_REGISTRY',
      'CREATE_TOOL',
      'CREATE_ROUTE',
      'CREATE_TESTS',
      'RUN_NPM_TEST',
      'RUN_LINT',
      'VERIFY_NO_DRIFT',
      'GIT_COMMIT',
      'GIT_PUSH'
    ]));
    expect(mcpTools).toEqual(expect.arrayContaining(sdkMap.mcpToolContracts));
    expect(buttons).toEqual(expect.arrayContaining(sdkMap.extensionChatTools));
    expect(extensionTools.tools.map((tool) => tool.label)).toEqual(
      expect.arrayContaining(sdkMap.extensionChatTools)
    );
    expect(sdkMap.safety.system_is_tool_not_religious_authority).toBe(true);
  });

  test('sdk fabric mcp integration contains development tools and fabric target', () => {
    const mcp = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json'
    );
    const sdkFabric = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json'
    );

    expect(mcp.tools).toEqual(expect.arrayContaining([
      'create_runtime_contract',
      'create_registry_contract',
      'create_tool_contract',
      'create_route_contract',
      'create_tests_contract',
      'run_npm_test_gate',
      'run_lint_gate',
      'verify_no_drift_gate',
      'prepare_git_commit_gate',
      'prepare_git_push_gate'
    ]));
    expect(sdkFabric.fabricTargets).toEqual(expect.arrayContaining([
      'development_functions_fabric'
    ]));
  });

  test('route script docs and extension chat tools are wired', () => {
    const packageJson = readJson('package.json');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'development-functions-fabric-v1');
    const docs = readText(
      'docs/development-functions-fabric/SHEIKHA-DEVELOPMENT-FUNCTIONS-FABRIC-V1.md'
    );
    const extension = readText('sheikha-vscode-extension/extension.js');

    expect(packageJson.scripts['ops:development-functions-fabric:v1']).toBe(
      'node tools/development-functions-fabric/sheikha-development-functions-fabric-v1.js'
    );
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/development/functions-fabric',
      module: 'routes/development-functions-fabric/status.routes.js',
      priority: 245
    }));
    expect(docs).toContain('/api/development/functions-fabric/status');

    [
      'Runtime',
      'Registry',
      'Tool',
      'Route',
      'Tests',
      'Test',
      'Lint',
      'Drift',
      'Commit',
      'Push'
    ].forEach((label) => expect(extension).toContain(`>${label}<`));
    expect(extension).toContain('/api/development/functions-fabric/status');
  });

  test('generated report is active with complete coverage', () => {
    const report = readJson(
      'runtime/development-functions-fabric/v1/sheikha-development-functions-fabric-v1-report.json'
    );

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('DEVELOPMENT_FUNCTIONS_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.workflowSteps).toBe(10);
    expect(report.coverage.mcpToolContracts).toBe(10);
    expect(report.coverage.extensionChatTools).toBe(10);
  });
});
