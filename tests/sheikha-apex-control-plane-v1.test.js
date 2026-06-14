'use strict';

const fs = require('fs');
const path = require('path');
const { forge, reviewRequest, status: foundryStatus } = require('../core/foundry/sheikha-foundry-v3');
const {
  createExecutionEnvelope,
  status: apexStatus
} = require('../core/orchestration/sheikha-supreme-orchestrator-v1');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('Sheikha Foundry Orchestration Apex V1', () => {
  test('places Foundry V3 and Supreme Orchestrator at the governed operational apex', () => {
    const apex = apexStatus();
    const foundry = foundryStatus();

    expect(apex).toMatchObject({
      controlPlane: 'SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1',
      status: 'ACTIVE',
      position: 'HIGHEST_OPERATIONAL_CONTROL_PLANE',
      apexLevel: 10,
      constitutionalConstraint: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1'
    });
    expect(foundry).toMatchObject({
      foundry: 'SHEIKHA_FOUNDRY_V3',
      position: 'APEX_CONTROL_PLANE',
      apexLevel: 10
    });
    expect(apex.controls.governanceAdmissionRequired).toBe(true);
    expect(apex.controls.humanAuthorityRetained).toBe(true);
  });

  test('reviews build intent before the orchestrator dispatches to runtime L1-L8', () => {
    const envelope = createExecutionEnvelope({
      message: 'طور شات شيخة وأضف الاختبارات',
      channel: 'extension-chat'
    }, {
      engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      status: 'APPROVED',
      allowed: true
    });

    expect(envelope.status).toBe('ADMITTED');
    expect(envelope.foundry.buildRequested).toBe(true);
    expect(envelope.foundry.disposition).toBe('CAPABILITY_PLAN_REQUIRED');
    expect(envelope.orchestrator.target).toBe('SHEIKHA_CONVERSATION_ENGINE_V1');
    expect(envelope.executionOrder).toEqual([
      'GOVERNANCE_ADMISSION',
      'FOUNDRY_V3_REVIEW',
      'SUPREME_ORCHESTRATOR_ENVELOPE',
      'RUNTIME_STACK_L1_L8',
      'EVIDENCE_AND_AUDIT'
    ]);
    expect(envelope.mutationAuthorized).toBe(false);
  });

  test('blocks orchestration when governance admission is denied', () => {
    const envelope = createExecutionEnvelope({ message: 'blocked request' }, {
      engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      status: 'BLOCKED',
      allowed: false
    });

    expect(envelope.status).toBe('BLOCKED');
    expect(envelope.orchestrator.target).toBeNull();
    expect(envelope.governanceAdmission.allowed).toBe(false);
  });

  test('Foundry V3 produces a governed plan without claiming mutation', () => {
    expect(reviewRequest({ message: 'اشرح حالة النظام' }).disposition).toBe('RUNTIME_DISPATCH_ONLY');
    expect(forge({ name: 'supplier-intelligence', message: 'أنشئ القدرة' })).toMatchObject({
      foundry: 'SHEIKHA_FOUNDRY_V3',
      apexLevel: 10,
      mutationPerformed: false
    });
  });

  test('server mounts the apex before orchestrator, conversation, and fallback routes', () => {
    const server = read('server.js');
    const apexMount = "app.use(require('./routes/sheikha-apex-control-plane-v1-routes'));";
    const enterpriseMount = "app.use(require('./routes/sheikha-enterprise-orchestrator-routes'));";
    const conversationMount = "app.use(require('./routes/sheikha-conversation-engine-v1-routes'));";
    const fallbackMount = "app.use(require('./routes/sheikha-unified-chat-fabric'));";

    expect(server.split(apexMount).length - 1).toBe(1);
    expect(server.indexOf(apexMount)).toBeLessThan(server.indexOf(enterpriseMount));
    expect(server.indexOf(apexMount)).toBeLessThan(server.indexOf(conversationMount));
    expect(server.indexOf(apexMount)).toBeLessThan(server.indexOf(fallbackMount));
  });

  test('legacy enterprise orchestrator declares the apex as its parent', () => {
    const { getEnterpriseState } = require('../core/enterprise/sheikha-enterprise-orchestrator-v1');
    const enterprise = getEnterpriseState({
      runtime: { cpuLoad1m: 0, ramUsedPercent: 0, heapUsedMb: 0, heapTotalMb: 0, uptimeSeconds: 0 },
      git: { branch: 'test', status: '', aheadBehind: '0 0' }
    });

    expect(enterprise.position).toBe('UNDER_SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1');
    expect(enterprise.parentControlPlane).toBe('SHEIKHA_FOUNDRY_ORCHESTRATION_APEX_V1');
    expect(enterprise.apis.apexControlPlane).toBe('/api/sheikha/apex-control-plane/v1/status');
  });

  test('registry, route, tool, docs, and package activation script are present', () => {
    const registry = JSON.parse(read('runtime/apex-control-plane/v1/sheikha-apex-control-plane-v1.json'));
    const packageJson = JSON.parse(read('package.json'));

    expect(registry.apexLevel).toBe(10);
    expect(registry.peerAuthorities.map((item) => item.name)).toEqual([
      'SHEIKHA_FOUNDRY_V3',
      'SHEIKHA_SUPREME_ORCHESTRATOR_V1'
    ]);
    expect(read('routes/sheikha-apex-control-plane-v1-routes.js')).toContain(
      '/api/sheikha/apex-control-plane/v1/status'
    );
    expect(read('docs/architecture/SHEIKHA-FOUNDRY-ORCHESTRATION-APEX-V1.md')).toContain(
      'Governance Admission -> Foundry V3 Review -> Supreme Orchestrator'
    );
    expect(packageJson.scripts['ops:apex-control-plane:v1']).toBe(
      'node tools/apex-control-plane/sheikha-apex-control-plane-v1.js'
    );
  });
});
