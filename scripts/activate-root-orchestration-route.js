#!/usr/bin/env node
'use strict';

const fs = require('fs');
const file = 'server.js';
let s = fs.readFileSync(file, 'utf8');

const block = `
// ─────────────────────────────────────────────────────────────
// Sheikha Root Orchestration API
// ─────────────────────────────────────────────────────────────
try {
    app.use('/api/runtime-root', require('./routes/runtime-root/root-orchestration'));
    console.log('✅ Sheikha Root Orchestration API active');
} catch (error) {
    console.warn('⚠️ Sheikha Root Orchestration API unavailable:', error.message);
}
`;

if (!s.includes("Sheikha Root Orchestration API")) {
  const idx = s.lastIndexOf("app.use((req, res)");
  if (idx === -1) throw new Error('لم أجد 404 النهائي داخل server.js');
  s = s.slice(0, idx) + block + '\n' + s.slice(idx);
  fs.writeFileSync(file, s);
  console.log('ADDED');
} else {
  console.log('ALREADY_EXISTS');
}
