'use strict';

const https = require('https');

function call(method, path, payload) {
  return new Promise(resolve => {
    const body = payload ? JSON.stringify(payload) : '';
    const req = https.request({
      hostname: 'api.sheikha.top',
      path,
      method,
      headers: {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}
    }, res => {
      let data='';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log(await call('GET', '/api/sheikha/software-registry/status'));
  console.log(await call('POST', '/api/sheikha/software-registry/search', {query:'vscode'}));
})();
