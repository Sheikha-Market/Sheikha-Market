'use strict';

const https = require('https');

function request(method, path, payload) {
  return new Promise((resolve) => {
    const body = payload ? JSON.stringify(payload) : '';
    const req = https.request({
      hostname: 'api.sheikha.top',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success:false, raw:data }); }
      });
    });

    req.on('error', e => resolve({ success:false, error:e.message }));
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log('=== TOOLS STATUS ===');
  console.log(JSON.stringify(await request('GET', '/api/sheikha/tools/status'), null, 2));

  console.log('\n=== CLI PWD ===');
  console.log(JSON.stringify(await request('POST', '/api/sheikha/cli/run', { command: 'pwd' }), null, 2));

  console.log('\n=== RAG SEARCH ===');
  console.log(JSON.stringify(await request('POST', '/api/sheikha/rag/search', { query: 'sheikha-runtime-chat' }), null, 2));

  console.log('\n=== MCP TOOLS ===');
  console.log(JSON.stringify(await request('GET', '/api/sheikha/mcp/tools'), null, 2));

  console.log('\n=== SDK REGISTRY ===');
  console.log(JSON.stringify(await request('GET', '/api/sheikha/sdk/registry'), null, 2));
})();
