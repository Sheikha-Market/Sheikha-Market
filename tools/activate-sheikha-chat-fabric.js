#!/usr/bin/env node
'use strict';

const fs = require('fs');

const file = 'server.js';
let s = fs.readFileSync(file, 'utf8');

const block = `
// ─────────────────────────────────────────────────────────────
// Sheikha Unified Chat Control Fabric API
// ─────────────────────────────────────────────────────────────
try {
  app.use('/api/sheikha/chat-fabric', require('./routes/chat-fabric/sheikha-chat-fabric-routes'));
  console.log('✅ Sheikha Chat Fabric API mounted');
} catch (err) {
  console.error('⚠️ Sheikha Chat Fabric API mount failed:', err.message);
}
`;

if (s.includes('/api/sheikha/chat-fabric')) {
  console.log('EXISTS');
  process.exit(0);
}

const marker = "app.use((req, res)";
const idx = s.lastIndexOf(marker);

if (idx === -1) {
  throw new Error('لم يتم العثور على 404 النهائي في server.js');
}

s = s.slice(0, idx) + block + '\n' + s.slice(idx);
fs.writeFileSync(file, s);
console.log('ADDED');
