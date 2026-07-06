'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const temporaryData = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-runtime-fabric-v5-test-'));
process.env.SHEIKHA_RUNTIME_FABRIC_V5_DATA_DIR = temporaryData;

const fabric = require('../runtime/runtime-fabric-v5/runtime-fabric-v5');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');
const { ALLOWED_SCOPES } = require('../runtime/security/api-keys/api-key-manager');

const owner = Object.freeze({
  actorId: 'runtime-fabric-test-owner',
  role: 'OWNER',
  trusted: true,
  humanApproved: true,
  source: 'jest'
});

afterAll(() => {
  delete process.env.SHEIKHA_RUNTIME_FABRIC_V5_DATA_DIR;
  fs.rmSync(temporaryData, { recursive: true, force: true });
});

describe('Sheikha Runtime Fabric V5', () => {
  test('is operational below Orchestrator L11 without false distributed claims', () => {
    const status = fabric.status();

    expect(status.fabric).toBe('SHEIKHA_RUNTIME_FABRIC_V5');
    expect(status.status).toBe('ACTIVE_SINGLE_NODE_OPERATIONAL');
    expect(status.position).toBe('UNDER_SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11');
    expect(status.cluster.multiNode.active).toBe(false);
    expect(status.cluster.multiNode.kubernetesConnected).toBe(false);
    expect(status.cluster.multiNode.redisConnected).toBe(false);
    expect(status.boundaries.arbitraryCodeExecution).toBe(false);
    expect(status.capabilities.policyEnforcement).toBe('ACTIVE');
    expect(status.storage.singleHostMultiProcessLock).toBe(true);
    expect(status.executionFlow).toContain('sdk-mcp-capability-resolution');
    expect(fabric.services.list()).toContainEqual(expect.objectContaining({
      system: 'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1'
    }));
  });

  test('blocks writes without human approval and records the governance decision', () => {
    expect(() => fabric.submitIssue({ issue: 'Review a governed runtime issue.' }, {
      ...owner,
      humanApproved: false
    })).toThrow('Human approval');

    const events = fabric.eventBus.recent(10);
    expect(events).toContainEqual(expect.objectContaining({ type: 'GOVERNANCE_BLOCKED' }));
  });

  test('queues idempotently and completes the governed evidence pipeline', async () => {
    const input = {
      issue: 'Analyze a supply chain capacity risk.',
      requestedOutcome: 'governed-plan',
      idempotencyKey: 'runtime-fabric-v5-test-issue'
    };
    const first = fabric.submitIssue(input, owner);
    const duplicate = fabric.submitIssue(input, owner);

    expect(first.status).toBe('QUEUED');
    expect(duplicate.job.id).toBe(first.job.id);
    expect(duplicate.job.idempotentReplay).toBe(true);
    expect(fabric.queue.list({ status: 'QUEUED' })).toHaveLength(1);

    const drained = await fabric.drain({ limit: 10 }, owner);
    const completed = drained.jobs.find(job => job.id === first.job.id);

    expect(completed.status).toBe('COMPLETED');
    expect(completed.result.stages).toHaveLength(fabric.PIPELINE_STAGES.length);
    expect(completed.result.externalActionExecuted).toBe(false);
    expect(completed.result.humanDecisionRequired).toBe(true);
  });

  test('schedules only registered work through an explicit governed tick', async () => {
    const scheduled = fabric.createSchedule({
      type: 'runtime.health.snapshot',
      runAt: new Date(Date.now() - 1000).toISOString()
    }, owner);
    const ticked = fabric.tick(owner);

    expect(scheduled.status).toBe('SCHEDULED');
    expect(ticked.triggered).toBe(1);

    const drained = await fabric.drain({ limit: 10 }, owner);
    expect(drained.jobs).toContainEqual(expect.objectContaining({
      type: 'runtime.health.snapshot',
      status: 'COMPLETED'
    }));
  });

  test('rejects arbitrary job types and restricts worker operations by role', async () => {
    expect(() => fabric.queue.enqueue({ type: 'shell.execute', payload: {} }, owner))
      .toThrow('registered Runtime Fabric job types');
    await expect(fabric.drain({}, { ...owner, role: 'VIEWER' }))
      .rejects.toThrow('operational Runtime Fabric role');
  });

  test('mounts governed routes once and documents the activation surface', () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const routes = fs.readFileSync(path.join(root, 'routes/runtime-fabric-v5-routes.js'), 'utf8');
    const docs = fs.readFileSync(
      path.join(root, 'docs/runtime-fabric/SHEIKHA-RUNTIME-FABRIC-V5.md'),
      'utf8'
    );
    const packageJson = require('../package.json');
    const report = JSON.parse(fs.readFileSync(path.join(
      root,
      'runtime/runtime-fabric-v5/sheikha-runtime-fabric-v5-report.json'
    ), 'utf8'));
    const mount = "app.use(require('./routes/runtime-fabric-v5-routes'));";

    expect(server.split(mount).length - 1).toBe(1);
    expect(routes).toContain("'/api/sheikha/runtime-fabric/v5/issues'");
    expect(routes).toContain('x-sheikha-human-approved');
    expect(routes).toContain("'runtime:execute'");
    expect(docs).toContain('does not claim Redis');
    expect(packageJson.scripts['ops:runtime-fabric:v5']).toContain('runtime-fabric-v5');
    expect(report.decision).toBe('RUNTIME_FABRIC_V5_SINGLE_NODE_OPERATIONAL_100');
    expect(ALLOWED_SCOPES).toContain('runtime:audit');
  });

  test('exposes Runtime Fabric through the JavaScript SDK', async () => {
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

    await client.runtimeFabric.submitIssue({ issue: 'SDK governed issue' });

    expect(requests[0].url).toBe('https://example.test/api/sheikha/runtime-fabric/v5/issues');
    expect(requests[0].options.headers.Authorization).toBe('Sheikha skh_v2_test');
    expect(requests[0].options.headers['x-sheikha-human-approved']).toBe('true');
  });

  test('produces audit and runtime measurements', () => {
    const metrics = fabric.observability.snapshot();
    const audit = fabric.store.auditEntries(100);

    expect(metrics.counters.admitted).toBeGreaterThan(0);
    expect(metrics.counters.blocked).toBeGreaterThan(0);
    expect(metrics.counters.jobsCompleted).toBeGreaterThan(0);
    expect(audit).toContainEqual(expect.objectContaining({ action: 'JOB_COMPLETED' }));
  });
});
