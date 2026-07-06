'use strict';

const BUILD_INTENT = /(?:ابن|أنشئ|انشئ|طور|طوّر|فعّل|فعل|أضف|اضف|اصلح|أصلح|build|create|develop|activate|implement|fix|patch)/i;

function status() {
  return {
    success: true,
    foundry: 'SHEIKHA_FOUNDRY_V3',
    status: 'ACTIVE',
    position: 'APEX_CONTROL_PLANE',
    apexLevel: 10,
    authority: 'CAPABILITY_BUILD_EVOLUTION_AND_RELEASE',
    governs: [
      'Capability Design',
      'Runtime Evolution',
      'Route Contracts',
      'Test Contracts',
      'SDK Fabric',
      'MCP Integration',
      'Extension Integration',
      'Observability',
      'Release Evidence'
    ],
    factories: {
      intentFactory: 'ACTIVE',
      capabilityFactory: 'ACTIVE',
      runtimeFactory: 'ACTIVE',
      routeFactory: 'ACTIVE',
      testFactory: 'ACTIVE',
      sdkMcpFactory: 'ACTIVE',
      extensionFactory: 'ACTIVE',
      observabilityFactory: 'ACTIVE',
      releaseFactory: 'ACTIVE'
    },
    governance: {
      constitutionalConstraint: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      governanceAdmissionRequired: true,
      planOnlyByDefault: true,
      humanApprovalRequiredForWrites: true,
      noDestructiveActionWithoutReview: true,
      evidenceRequired: true,
      principle: 'لا ضرر ولا ضرار'
    }
  };
}

function reviewRequest(input = {}) {
  const message = String(input.message || input.prompt || input.text || '').trim();
  const buildRequested = BUILD_INTENT.test(message);

  return {
    foundry: 'SHEIKHA_FOUNDRY_V3',
    status: 'REVIEWED',
    apexLevel: 10,
    buildRequested,
    disposition: buildRequested ? 'CAPABILITY_PLAN_REQUIRED' : 'RUNTIME_DISPATCH_ONLY',
    factories: buildRequested
      ? ['intentFactory', 'capabilityFactory', 'routeFactory', 'testFactory', 'observabilityFactory']
      : ['intentFactory', 'observabilityFactory'],
    executionPermission: 'PLAN_ONLY_UNTIL_GOVERNED_APPROVAL',
    evidenceRequired: true
  };
}

function forge(input = {}) {
  const name = String(input.name || 'sheikha-capability').trim();
  const review = reviewRequest(input);

  return {
    success: true,
    foundry: 'SHEIKHA_FOUNDRY_V3',
    position: 'APEX_CONTROL_PLANE',
    apexLevel: 10,
    capability: name,
    review,
    generatedPlan: {
      runtime: `runtime/capabilities/${name}`,
      registry: `runtime/capabilities/${name}/registry.json`,
      route: `/api/sheikha/capabilities/${name}`,
      test: `tests/${name}.test.js`,
      sdk: `sdk/${name}`,
      mcpTool: `mcp/tools/${name}`,
      evidence: `runtime/reports/${name}/latest.json`
    },
    lifecycle: [
      'Governance Admission',
      'Intent Review',
      'Capability Contract',
      'Runtime and Route Design',
      'Test Contract',
      'SDK and MCP Integration',
      'Observability and Evidence',
      'Human Release Approval'
    ],
    mutationPerformed: false
  };
}

module.exports = { forge, reviewRequest, status };
