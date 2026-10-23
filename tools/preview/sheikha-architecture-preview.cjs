'use strict';

// Local read-only preview: do not boot the platform's operational server.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { getEnterpriseArchitecture, validateEnterpriseArchitecture } = require('../../core/enterprise-architecture/sheikha-enterprise-architecture');
const publicRoot = path.resolve(__dirname, '../../public');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

function createPreviewServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      if (pathname === '/api/enterprise-architecture/full') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ success: true, data: { architecture: getEnterpriseArchitecture(), validation: validateEnterpriseArchitecture() } }));
        return;
      }
      if (pathname.startsWith('/api/') || pathname.includes('\0') || pathname.split('/').some(segment => segment.startsWith('.'))) {
        res.writeHead(404); res.end(); return;
      }
      const candidate = path.resolve(publicRoot, `.${pathname}`);
      if (!candidate.startsWith(publicRoot + path.sep) && candidate !== publicRoot) {
        res.writeHead(404); res.end(); return;
      }
      const stat = await fs.stat(candidate);
      const file = await fs.realpath(stat.isDirectory() ? path.join(candidate, 'index.html') : candidate);
      if (!file.startsWith(publicRoot + path.sep)) { res.writeHead(404); res.end(); return; }
      const data = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'application/octet-stream'}${/\.(html|css|js|mjs|json)$/.test(file) ? '; charset=utf-8' : ''}` });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {
      res.writeHead(404); res.end();
    }
  });
}

if (require.main === module) {
  const requestedPort = Number(process.env.PORT || 4188);
  if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw new Error('Invalid PORT');
  const server = createPreviewServer();
  let retried = false;
  server.on('error', error => {
    if (error.code === 'EADDRINUSE' && !retried) { retried = true; server.listen(0, '127.0.0.1'); }
    else { console.error(error.message); process.exitCode = 1; }
  });
  server.on('listening', () => console.log(`Architecture preview: http://127.0.0.1:${server.address().port}/architecture-explorer/ (PID ${process.pid})`));
  server.listen(requestedPort, '127.0.0.1');
}
module.exports = { createPreviewServer };
