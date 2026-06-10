'use strict';

const vscode = require('vscode');
const http = require('http');
const cp = require('child_process');

function getJson(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:8080${path}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success: false, message: data }); }
      });
    });
    req.on('error', e => resolve({ success: false, error: e.message }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
  });
}

class SheikhaInspectorProvider {
  resolveWebviewView(view) {
    view.webview.options = { enableScripts: true };
    const render = async () => {
      const health = await getJson('/api/health');
      const protocol = await getJson('/api/sheikha/protocol/status');
      const pm2 = cp.execSync('pm2 jlist 2>/dev/null || echo "[]"', { encoding: 'utf8' });
      const docker = cp.execSync('docker ps --format "{{.Names}} | {{.Status}} | {{.Ports}}" 2>/dev/null || true', { encoding: 'utf8' });

      view.webview.html = `
      <html><body style="font-family:Arial;padding:12px;background:#0b1110;color:#e8fff3">
        <h2>Sheikha Inspector</h2>
        <button onclick="location.reload()">Refresh</button>
        <h3>Runtime Health</h3>
        <pre>${escapeHtml(JSON.stringify(health, null, 2))}</pre>
        <h3>Governance / Decision</h3>
        <pre>${escapeHtml(JSON.stringify(protocol, null, 2))}</pre>
        <h3>PM2</h3>
        <pre>${escapeHtml(pm2)}</pre>
        <h3>Docker</h3>
        <pre>${escapeHtml(docker)}</pre>
      </body></html>`;
    };
    render();
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

module.exports = { SheikhaInspectorProvider };
