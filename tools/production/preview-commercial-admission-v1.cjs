'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');

// A disposable preview must not read the portal .env or boot the monolithic runtime.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-admission-preview-'));
fs.chmodSync(dataDir, 0o700);
process.chdir(dataDir);
process.env.NODE_ENV = 'test';
const { mountCommercialSales } = require('../../routes/commercial-sales/sheikha-commercial-sales-mount-v1');
const app = express();
app.use((req, res, next) => {
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) {
    return res.sendStatus(403);
  }
  return next();
});
mountCommercialSales(app, { dataDir, previewOnly: true });
app.get('/', (req, res) => res.redirect('/commercial/checkout.html'));
const port = Number(process.argv[2] || 8111);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('INVALID_PREVIEW_PORT');
const server = app.listen(port, '127.0.0.1', () => {
  console.log(JSON.stringify({ previewOnly: true, url: `http://127.0.0.1:${port}/commercial/checkout.html`,
    dataDir, paymentCaptureEnabled: false, externalCallsEnabled: false }));
});
server.on('error', error => { console.error(error.code); process.exitCode = 1; });
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close());
