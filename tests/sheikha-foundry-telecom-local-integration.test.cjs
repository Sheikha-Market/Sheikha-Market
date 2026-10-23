'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { simulateFoundryTelecom } = require('../sdk/sheikha-js/foundry-telecom.cjs');
const { createSheikhaClient } = require('../sdk/sheikha-js');

const root = path.resolve(__dirname, '..');
const toolName = 'sheikha_foundry_telecom_simulation';

test('SDK completes the existing seven-cell simulation without claiming physical production', () => {
  const result = createSheikhaClient().simulateFoundryTelecom();
  assert.equal(result.mode, 'SIMULATION_ONLY');
  assert.equal(result.status, 'LOCAL_SIMULATION_COMPLETED');
  assert.equal(result.industrialNetwork.cells.length, 7);
  assert.ok(result.industrialNetwork.cells.every(cell => cell.state === 'COMPLETE'));
  assert.ok(result.industrialNetwork.tick <= 32);
  assert.equal(result.industrialNetwork.realProductionVerified, 'UNKNOWN');
  assert.deepEqual(result.boundaries, {
    physicalCommandSent: false, networkAccessPerformed: false,
    modelInferencePerformed: false, persistentStateWritten: false,
    productionReady: false, hardwareConnection: 'NOT_TESTED',
    internetConnectivity: 'NOT_TESTED', aiInference: 'NOT_TESTED'
  });
});

test('all five telecom profiles remain unauthenticated simulations', () => {
  const { telecom } = simulateFoundryTelecom();
  assert.equal(telecom.modules.length, 10);
  assert.deepEqual(telecom.profiles.map(profile => profile.profile), ['wire', 'wireless', 'iot', 'satellite', 'hybrid']);
  for (const profile of telecom.profiles) {
    assert.equal(profile.mode, 'SIMULATION_ONLY');
    assert.equal(profile.connected, false);
    assert.equal(profile.authenticatedDevice, false);
    assert.equal(profile.physicalActuationAllowed, false);
    assert.equal(profile.realConnection, 'UNKNOWN');
  }
});

test('caller cannot request a device, URL, secret, authority or custom scenario', () => {
  for (const input of [null, [], true, 'live', 1, new Date(),
    { url: 'https://example.invalid' }, { deviceId: 'PLC_01' },
    { humanApproved: true }, { live: true }, { token: 'do-not-echo' },
    { scenario: 'physical' }, Object.create({ live: true }),
    Object.defineProperty({}, 'live', { value: true }), { [Symbol('live')]: true }]) {
    assert.throws(() => simulateFoundryTelecom(input), /^Error: SIMULATION_ARGUMENTS_DENIED$/);
  }
  assert.equal(simulateFoundryTelecom(Object.create(null)).mode, 'SIMULATION_ONLY');
});

test('results are deterministic and callers cannot mutate the shared catalog', () => {
  const expected = simulateFoundryTelecom();
  const edited = simulateFoundryTelecom();
  edited.telecom.modules[0].status = 'PHYSICAL_ACTIVE';
  edited.telecom.profiles[0].connected = true;
  edited.industrialNetwork.cells[0].deps.push('unexpected');
  edited.boundaries.productionReady = true;
  assert.deepEqual(simulateFoundryTelecom(), expected);
});

test('simulation modules load with only their two local dependencies and no I/O APIs', () => {
  function isolatedModule(relativePath, dependencies = {}) {
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), {
      module, exports: module.exports,
      require(name) {
        assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
        return dependencies[name];
      }
    }, { timeout: 1000 });
    return module.exports;
  }
  const industrial = isolatedModule('core/robotics/sheikha-industrial-network-v1.js');
  const telecom = isolatedModule('core/robotics/sheikha-robotic-connectors-v1.cjs');
  const sdk = isolatedModule('sdk/sheikha-js/foundry-telecom.cjs', {
    '../../core/robotics/sheikha-industrial-network-v1': industrial,
    '../../core/robotics/sheikha-robotic-connectors-v1.cjs': telecom
  });
  assert.equal(sdk.simulateFoundryTelecom().status, 'LOCAL_SIMULATION_COMPLETED');
});

test('existing SDK compile and run entrypoints remain available', () => {
  const client = createSheikhaClient();
  for (const name of ['status', 'compile', 'run', 'simulateFoundryTelecom']) {
    assert.equal(typeof client[name], 'function');
  }
  assert.equal(client.version, '1.1.0');
});

test('real MCP stdio handshake, discovery, simulation and denial preserve existing catalogs', { timeout: 15000 }, async () => {
  const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
  const client = new Client({ name: 'sheikha-foundry-telecom-test', version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')],
    cwd: root,
    stderr: 'pipe'
  });
  transport.stderr?.resume();
  try {
    await client.connect(transport, { timeout: 5000 });
    const catalog = await client.listTools({}, { timeout: 5000 });
    const tool = catalog.tools.find(item => item.name === toolName);
    assert.ok(tool);
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.deepEqual(tool.annotations, {
      readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false
    });
    assert.deepEqual(catalog.tools.map(item => item.name).filter(name => name !== toolName), [
      'sheikha_environment_governance_status',
      'sheikha_federation_status', 'sheikha_runtime_status', 'sheikha_jannat_status', 'sheikha_catalog_evidence_status',
      'sheikha_natural_data_process', 'sheikha_sensory_interpret'
    ]);
    const resources = await client.listResources({}, { timeout: 5000 });
    assert.equal(resources.resources.length, 4);
    const reply = await client.callTool({ name: toolName, arguments: {} }, undefined, { timeout: 5000 });
    assert.notEqual(reply.isError, true);
    assert.deepEqual(JSON.parse(reply.content[0].text), simulateFoundryTelecom());
    const noArgs = await client.callTool({ name: toolName }, undefined, { timeout: 5000 });
    assert.notEqual(noArgs.isError, true);
    for (const args of [{ live: true }, { deviceId: 'PLC_01' }, { token: 'do-not-echo' }, { humanApproved: true }]) {
      const denied = await client.callTool({ name: toolName, arguments: args }, undefined, { timeout: 5000 });
      assert.equal(denied.isError, true);
      assert.equal(JSON.stringify(denied).includes('do-not-echo'), false);
    }
    const denied = await client.callTool({ name: 'sheikha_physical_start', arguments: {} }, undefined, { timeout: 5000 });
    assert.equal(denied.isError, true);
    assert.equal(denied.content[0].text, 'TOOL_NOT_ADMITTED');
  } finally {
    await client.close();
    await transport.close();
  }
});
