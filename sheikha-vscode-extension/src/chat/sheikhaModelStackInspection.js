'use strict';

const http = require('node:http');
const ENDPOINTS = Object.freeze({ vllm: { port: 8000, route: '/v1/models' }, litellm: { port: 4000, route: '/v1/models' } });

function inspectEndpoint(id, signal) {
  if (!Object.hasOwn(ENDPOINTS, id)) return Promise.reject(Error('MODEL_STACK_ENDPOINT_DENIED'));
  if (signal?.aborted) return Promise.reject(Error('CANCELLED'));
  const { port, route } = ENDPOINTS[id];
  return new Promise((resolve, reject) => {
    let settled = false; let timer;
    const finish = (error, data) => {
      if (settled) return; settled = true;
      clearTimeout(timer); signal?.removeEventListener('abort', abort); request.destroy();
      if (error) reject(Error(error)); else resolve(data);
    };
    const abort = () => finish('CANCELLED');
    const request = http.request({ hostname: '127.0.0.1', port, path: route, method: 'GET', agent: false,
      headers: { Accept: 'application/json' } }, response => {
      if (response.statusCode !== 200 || !/^application\/json(?:;|$)/i.test(response.headers['content-type'] || '')) return finish('CATALOG_UNAVAILABLE');
      const chunks = []; let size = 0;
      response.on('data', chunk => { size += chunk.length; if (size > 128 * 1024) finish('CATALOG_LIMIT'); else chunks.push(chunk); });
      response.on('error', () => finish('CATALOG_UNAVAILABLE'));
      response.on('aborted', () => finish('CATALOG_UNAVAILABLE'));
      response.on('end', () => {
        let value;
        try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return finish('CATALOG_INVALID'); }
        if (!Array.isArray(value?.data) || value.data.length > 128 || value.data.some(m => typeof m?.id !== 'string' || !m.id || m.id.length > 160)) return finish('CATALOG_INVALID');
        finish(null, { modelCount: value.data.length, protocol: 'OPENAI_COMPATIBLE_CATALOG', vendorIdentityVerified: false });
      });
    });
    request.on('error', () => finish('CATALOG_UNAVAILABLE'));
    timer = setTimeout(() => finish('CATALOG_TIMEOUT'), 3000);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) return abort();
    request.end();
  });
}

async function inspectModelStack({ modelAdapter, signal, probe = inspectEndpoint, resolve = require.resolve }) {
  const components = [];
  try {
    const result = await modelAdapter.inspect(signal);
    components.push({ id: 'ollama', status: 'CATALOG_REACHABLE', modelCount: result.models.length, inferenceTested: false });
  } catch { components.push({ id: 'ollama', status: 'UNAVAILABLE_OR_REJECTED' }); }
  for (const id of Object.keys(ENDPOINTS)) {
    if (signal?.aborted) throw Error('CANCELLED');
    try { components.push({ id, status: 'CATALOG_REACHABLE_NOT_INFERENCE', ...await probe(id, signal), inferenceEnabled: false }); }
    catch { components.push({ id, status: 'UNAVAILABLE_OR_REJECTED', inferenceEnabled: false }); }
  }
  let langgraph = false;
  try { resolve('@langchain/langgraph'); langgraph = true; } catch { /* Optional package, never installed or imported by a health probe. */ }
  components.push({ id: 'langgraph', status: langgraph ? 'PACKAGE_RESOLVABLE_NOT_EXECUTED' : 'NOT_INSTALLED', executionEnabled: false });
  return { schema: 'SHEIKHA_MODEL_STACK_INSPECTION_V1', checkedAt: new Date().toISOString(), components,
    activeOrchestrator: 'SHEIKHA_TASK_ENGINE_SERIAL_COGNITIVE_CYCLE',
    localGatewayMayForwardExternally: true, localEndpointIsNotEgressAttestation: true,
    externalProviderActivated: false, secretsSent: false, workspaceContentSent: false, modelsDownloaded: false,
    trainingExecuted: false, networkScope: 'LOOPBACK_CATALOG_ONLY', commercialProductionReady: false };
}

module.exports = { inspectEndpoint, inspectModelStack };
