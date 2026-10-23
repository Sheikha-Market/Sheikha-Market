'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const port = Number(process.env.SHEIKHA_STUDIO_PORT || 8091);
const host = process.env.SHEIKHA_STUDIO_HOST || '127.0.0.1';
const startedAt = Date.now();

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.get('/health', (_req, res) => res.json({
  ok: true,
  system: 'SHEIKHA_STUDIO_STANDALONE_SERVER_V1',
  uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  writeEnabled: process.env.SHEIKHA_STUDIO_WRITE_ENABLED === 'true',
}));
app.use('/api/sheikha/studio/v1', require('./routes/sheikha-studio-product-v1'));
app.use('/api/apex/v2', require('./routes/sheikha-runtime-apex-v2'));
app.use('/ide', express.static(path.join(__dirname, 'public/ide'), {
  index: 'index.html',
  etag: false,
  lastModified: false,
  setHeaders(res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  },
}));
app.get('/', (_req, res) => res.redirect('/ide/'));

const server = app.listen(port, host, () => {
  process.stdout.write(`SHEIKHA_STUDIO_READY=http://${host}:${port}/ide/\n`);
});

function shutdown(signal) {
  server.close(() => {
    process.stdout.write(`SHEIKHA_STUDIO_STOPPED=${signal}\n`);
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, server };
