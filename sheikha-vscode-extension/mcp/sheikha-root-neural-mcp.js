#!/usr/bin/env node
'use strict';

const http = require('http');
const readline = require('readline');

const SHEIKHA_API = process.env.SHEIKHA_API || 'http://127.0.0.1:8080';

function requestJson(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SHEIKHA_API);
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (_) {
          resolve({ success: false, output: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const tools = [
  {
    name: 'sheikha.rootNeuralStatus',
    description: 'Return Sheikha root neural integration status.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'sheikha.publishPlan',
    description: 'Create a governed Sheikha read/write/publish plan.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string' },
        platform: { type: 'string' }
      }
    }
  }
];

async function handle(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'sheikha-root-neural-mcp', version: '1.0.0' }
      }
    };
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools } };
  }

  if (method === 'tools/call') {
    const name = params && params.name;
    const args = params && params.arguments ? params.arguments : {};
    const result = name === 'sheikha.publishPlan'
      ? await requestJson('/api/sheikha/read-write-publish/plan', 'POST', {
        action: 'publish',
        target: args.target || 'working-tree',
        platform: args.platform || 'local-git'
      })
      : await requestJson('/api/sheikha/root-neural-integration/status');

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          { type: 'text', text: JSON.stringify(result, null, 2) }
        ]
      }
    };
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } };
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', async line => {
  if (!line.trim()) return;
  try {
    const response = await handle(JSON.parse(line));
    process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: error.message || String(error) }
    })}\n`);
  }
});
