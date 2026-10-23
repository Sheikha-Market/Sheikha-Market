'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { processNaturalData, getNaturalDataInputSchema } = require('../core/natural-data/sheikha-natural-data-v1.cjs');
const example = require('../docs/examples/sheikha-natural-data.synthetic.json');

test('MCP discovers and processes local natural data with SDK parity and rejects scope expansion', { timeout: 15000 }, async () => {
  const root = path.resolve(__dirname, '..');
  const client = new Client({ name: 'sheikha-natural-data-test', version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(root, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')],
    cwd: root, stderr: 'pipe'
  });
  transport.stderr?.resume();
  try {
    await client.connect(transport, { timeout: 5000 });
    const catalog = await client.listTools({}, { timeout: 5000 });
    const tool = catalog.tools.find(item => item.name === 'sheikha_natural_data_process');
    assert.ok(tool);
    assert.deepEqual(tool.inputSchema, getNaturalDataInputSchema());
    assert.deepEqual(tool.annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
    const call = args => client.callTool({ name: tool.name, arguments: args }, undefined, { timeout: 5000 });
    const response = await call(example);
    assert.notEqual(response.isError, true);
    assert.deepEqual(JSON.parse(response.content[0].text), processNaturalData(example));
    for (const input of [{}, { ...example, url: 'https://example.invalid/do-not-echo' },
      { ...example, token: 'do-not-echo' }, { ...example, productionEnabled: true },
      { ...example, observations: [{ ...example.observations[0], value: null }] }]) {
      const rejected = await call(input);
      assert.equal(rejected.isError, true);
      assert.equal(JSON.stringify(rejected).includes('do-not-echo'), false);
    }
    const noArgs = await client.callTool({ name: tool.name }, undefined, { timeout: 5000 });
    assert.equal(noArgs.isError, true);
    const afterRejection = await call(example);
    assert.deepEqual(afterRejection, response);
    assert.equal((await client.listResources({}, { timeout: 5000 })).resources.length, 4);
  } finally {
    await client.close();
    await transport.close();
  }
});
