'use strict';

const https = require('https');

function call(method, path, payload) {
  return new Promise(resolve => {
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
      res.on('end', () => resolve(JSON.parse(data)));
    });
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log('=== CLI pwd ===');
  console.log(JSON.stringify(await call('POST', '/api/sheikha/cli/run', { command: 'pwd' }), null, 2));

  console.log('=== RAG search ===');
  console.log(JSON.stringify(await call('POST', '/api/sheikha/rag/search', { query: 'sheikha-runtime-chat' }), null, 2));

  console.log('=== Graphics render ===');
  console.log(JSON.stringify(await call('POST', '/api/sheikha/graphics/render', { kind: 'route-map' }), null, 2));
})();
