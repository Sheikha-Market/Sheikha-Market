'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const commandData = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-command-plane-test-'));
const runtimeData = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-runtime-fabric-command-test-'));
process.env.SHEIKHA_CIVILIZATION_COMMAND_DATA_DIR = commandData;
process.env.SHEIKHA_RUNTIME_FABRIC_V5_DATA_DIR = runtimeData;

const commandPlane = require(
  '../runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1'
);
const runtimeFabric = require('../runtime/runtime-fabric-v5/runtime-fabric-v5');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');
const { ALLOWED_SCOPES } = require('../runtime/security/api-keys/api-key-manager');

const owner = Object.freeze({
  actorId: 'civilization-command-test-owner',
  role: 'OWNER',
  trusted: true,
  humanApproved: true,
  source: 'jest'
});

afterAll(() => {
  delete process.env.SHEIKHA_CIVILIZATION_COMMAND_DATA_DIR;
  delete process.env.SHEIKHA_RUNTIME_FABRIC_V5_DATA_DIR;
  fs.rmSync(commandData, { recursive: true, force: true });
  fs.rmSync(runtimeData, { recursive: true, force: true });
});

describe('Sheikha Civilization Command & Intelligence Plane V1', () => {
  test('is operational without bypassing governance or claiming autonomous authority', () => {
    const result = commandPlane.status();

    expect(result.system).toBe('SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1');
    expect(result.status).toBe('ACTIVE_SINGLE_HOST_OPERATIONAL');
    expect(result.governanceAuthority).toBe('SHEIKHA_CIVILIZATION_GOVERNANCE_V2');
    expect(result.operationalAuthority).toBe('SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11');
    expect(result.boundaries.noAutonomousFinalJudgment).toBe(true);
    expect(result.storage.singleHostMultiProcessLock).toBe(true);
    expect(commandPlane.dashboard().masterLogCenter.system).toBe('SHEIKHA_MASTER_LOG_CENTER_V1');
  });

  test('keeps numbered references bounded by scholarly human review', () => {
    const registry = commandPlane.references.status();

    expect(registry.references).toContainEqual(expect.objectContaining({ id: 'QURAN-49-006' }));
    expect(registry.references).toContainEqual(expect.objectContaining({ id: 'SUNNAH-NAWAWI-032' }));
    expect(registry.boundaries.noAutomatedFatwa).toBe(true);
    expect(registry.boundaries.humanScholarlyReviewForReligiousInterpretation).toBe(true);
  });

  test('requires explicit human approval for mutations', () => {
    expect(() => commandPlane.createPlan({
      title: 'Unapproved plan',
      vision: 'Test',
      objectives: ['Test objective']
    }, { ...owner, humanApproved: false })).toThrow('explicit human approval');
  });

  test('plans, evaluates risk, and retains final human authority', () => {
    const blockedPlan = commandPlane.createPlan({
      title: 'High-risk infrastructure program',
      vision: 'Improve governed capacity',
      objectives: ['Increase resilience']
    }, owner);
    commandPlane.registerRisk({
      planId: blockedPlan.id,
      description: 'Unmitigated production dependency',
      severity: 'HIGH'
    }, owner);
    const blockedDecision = commandPlane.evaluatePlan(blockedPlan.id, owner);

    expect(blockedDecision.status).toBe('REQUIRES_MITIGATION');
    expect(blockedDecision.finalAuthority).toBe('HUMAN_RETAINED');
  });

  test('dispatches only an admitted plan into bounded Runtime Fabric execution', async () => {
    const plan = commandPlane.createPlan({
      title: 'Supply resilience program',
      vision: 'Improve evidence-based supply resilience',
      objectives: ['Reduce verified capacity gaps'],
      kpis: ['verified-gap-count']
    }, owner);
    commandPlane.registerRisk({
      planId: plan.id,
      description: 'Supplier delay',
      severity: 'MEDIUM',
      mitigation: 'Dual-source verified suppliers'
    }, owner);
    const decision = commandPlane.evaluatePlan(plan.id, owner);
    const dispatched = commandPlane.dispatchPlan(plan.id, owner);
    const drained = await runtimeFabric.drain({ limit: 5 }, owner);

    expect(decision.status).toBe('APPROVED_FOR_HUMAN_DECISION');
    expect(dispatched.status).toBe('QUEUED');
    expect(drained.jobs[0].status).toBe('COMPLETED');
    expect(drained.jobs[0].result.externalActionExecuted).toBe(false);
  });

  test('registers provenance-bound twins and evidence-linked impact without causal claims', () => {
    const twin = commandPlane.registerTwin({
      type: 'facility',
      name: 'Test Smelter',
      provenance: 'owner-declared-test-record',
      attributes: { region: 'test-region' }
    }, owner);
    const impact = commandPlane.recordImpact({
      metric: 'verified-throughput',
      baseline: 10,
      current: 14,
      unit: 'tons',
      source: 'test-measurement'
    }, owner);

    expect(twin.verification).toBe('SOURCE_DECLARED_NOT_INDEPENDENTLY_VERIFIED');
    expect(impact.delta).toBe(4);
    expect(impact.causalityClaimed).toBe(false);
    expect(commandPlane.snapshot().evidenceLinks).toHaveLength(1);
  });

  test('exposes API, SDK, Inspector, docs, report, and activation script', async () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const inspector = fs.readFileSync(
      path.join(root, 'core/enterprise/sheikha-enterprise-inspector-v3.js'),
      'utf8'
    );
    const script = fs.readFileSync(
      path.join(root, 'tools/activate-sheikha-civilization-command-plane.sh'),
      'utf8'
    );
    const unifiedScript = fs.readFileSync(
      path.join(root, 'tools/activate-sheikha-unified-apex-v1.sh'),
      'utf8'
    );
    const report = JSON.parse(fs.readFileSync(path.join(
      root,
      'runtime/civilization-command-intelligence-plane/',
      'sheikha-civilization-command-intelligence-plane-v1-report.json'
    ), 'utf8'));
    const requests = [];
    const client = createSheikhaApiClient({
      baseUrl: 'https://example.test',
      apiKey: 'skh_v2_test',
      humanApproved: true,
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      }
    });

    await client.civilizationCommand.createPlan({ title: 'SDK plan' });

    expect(server).toContain("app.use(require('./routes/civilization-command-intelligence-plane-routes'));" );
    expect(inspector).toContain('/api/sheikha/civilization-command/v1/dashboard');
    expect(script).toContain('activate-sheikha-unified-apex-v1.sh');
    expect(unifiedScript).toContain('verify-sheikha-unified-apex-v1.sh');
    expect(ALLOWED_SCOPES).toContain('civilization:execute');
    expect(requests[0].url).toBe('https://example.test/api/sheikha/civilization-command/v1/plans');
    expect(report.decision).toBe('CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1_OPERATIONAL_100');
  });
});
