#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'server.js');
let s = fs.readFileSync(file, 'utf8');

const block = `
// ─────────────────────────────────────────────────────────────
// Sheikha AI Gateway API
// ─────────────────────────────────────────────────────────────
try {
    const { askSheikhaCore, DEFAULT_MODEL, OLLAMA_URL } = require('./core/ai-gateway/sheikha-ai-gateway');

    app.get('/api/sheikha/ai-gateway/status', (_req, res) => {
        res.json({
            success: true,
            status: 'active',
            gateway: 'Sheikha AI Gateway',
            defaultModel: DEFAULT_MODEL,
            localProvider: OLLAMA_URL,
            mode: 'local-first-governed-enterprise-ai'
        });
    });

    app.post('/api/sheikha/ai-gateway/ask', express.json(), async (req, res) => {
        const result = await askSheikhaCore(req.body || {});
        res.json(result);
    });
} catch (err) {
    console.warn('⚠️ Sheikha AI Gateway غير متوفر:', err.message);
}
`;

if (!s.includes('/api/sheikha/ai-gateway/status')) {
    const marker = "app.use((req, res) => {";
    const idx = s.lastIndexOf(marker);
    if (idx === -1) throw new Error('لم يتم العثور على 404 النهائي');
    s = s.slice(0, idx) + block + '\n' + s.slice(idx);
    fs.writeFileSync(file, s);
    console.log('ADDED');
} else {
    console.log('ALREADY_EXISTS');
}
