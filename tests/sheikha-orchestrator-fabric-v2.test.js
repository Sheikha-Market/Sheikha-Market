'use strict';

const fs = require('fs');
const path = require('path');
const {
  orchestrate,
  status
} = require('../runtime/orchestrator/orchestrator-fabric');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Orchestrator Fabric V2', () => {
  test('is the highest operational layer above the L10 control plane', () => {
    expect(status()).toMatchObject({
      fabric: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2',
      status: 'ACTIVE',
      position: 'HIGHEST_OPERATIONAL_LAYER',
      apexLevel: 11,
      lowerControlPlane: {
        name: 'SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1',
        level: 10
      }
    });
    expect(Object.values(status().components).every((value) => value === 'ACTIVE')).toBe(true);
  });

  test('wraps Foundry and Supreme Orchestrator in the mandatory L11 envelope', () => {
    const result = orchestrate({ message: 'طور قدرة محكومة' }, {
      engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      status: 'APPROVED',
      allowed: true
    });

    expect(result.status).toBe('ADMITTED');
    expect(result.apexLevel).toBe(11);
    expect(result.executionEnvelope.apexLevel).toBe(10);
    expect(result.executionEnvelope.foundry.foundry).toBe('SHEIKHA_FOUNDRY_V3');
    expect(result.dispatch.target).toBe('SHEIKHA_CONVERSATION_ENGINE_V1');
    expect(result.executionOrder[1]).toBe('ORCHESTRATOR_FABRIC_V2_L11');
    expect(result.mutationAuthorized).toBe(false);
  });

  test('blocks dispatch when governance admission fails', () => {
    const result = orchestrate({ message: 'blocked' }, {
      status: 'BLOCKED',
      allowed: false
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.dispatch.target).toBeNull();
  });

  test('authorizes only approved writes or named append-only telemetry policy', () => {
    const approvedWrite = orchestrate({ mutationRequested: true }, {
      status: 'APPROVED', allowed: true, humanApproved: true
    });
    const telemetry = orchestrate({
      mutationRequested: true, mutationClass: 'APPEND_ONLY_TELEMETRY'
    }, {
      status: 'APPROVED', allowed: true, preApprovedPolicy: 'USAGE_METER_APPEND_ONLY'
    });
    const unapproved = orchestrate({ mutationRequested: true }, {
      status: 'APPROVED', allowed: true
    });

    expect(approvedWrite.mutationAuthorized).toBe(true);
    expect(telemetry.mutationAuthorized).toBe(true);
    expect(unapproved.mutationAuthorized).toBe(false);
  });

  test('has route, activation tool, package script, and truthful SaaS state', () => {
    const route = read('routes/sheikha-orchestrator-fabric-v2-routes.js');
    const packageJson = JSON.parse(read('package.json'));
    const readiness = JSON.parse(read('runtime/saas/enterprise-ready/saas-enterprise-readiness.json'));

    expect(route).toContain('/api/sheikha/orchestrator-fabric/v2/status');
    expect(route).toContain('/api/sheikha/orchestrator-fabric/v2/orchestrate');
    expect(packageJson.scripts['ops:orchestrator-fabric:v2']).toBe(
      'node tools/orchestrator-fabric/sheikha-orchestrator-fabric-v2.js'
    );
    expect(readiness.layers.orchestratorFabric).toBe('ACTIVE_HIGHEST_LAYER_L11');
  });
});
