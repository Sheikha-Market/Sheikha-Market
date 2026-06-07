'use strict';

const http = require('http');

function postJson(path, payload) {
  const body = JSON.stringify(payload || {});

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success: false, raw: data }); }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Sheikha API timeout'));
    });

    req.write(body);
    req.end();
  });
}

async function askSheikha(prompt, context = {}) {
  const decision = await postJson('/api/sheikha/protocol/decision', {
    actor: 'sheikha-vscode-extension',
    action: 'assistant_request',
    target: 'universal_api'
  });

  if (!decision.success) {
    return 'تم منع الطلب بواسطة حوكمة شيخة: ' + JSON.stringify(decision.data?.governance?.violations || []);
  }

  return postJson('/api/sheikha/chat', { prompt, context });
}

module.exports = { askSheikha, postJson };
