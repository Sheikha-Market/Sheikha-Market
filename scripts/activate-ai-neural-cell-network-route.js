#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'server.js');
let s = fs.readFileSync(file, 'utf8');

const block = `
// ─────────────────────────────────────────────────────────────
// Sheikha AI Neural Cell Network API
// ─────────────────────────────────────────────────────────────
try {
    const {
        evaluateSheikhaAINetwork,
        SHEIKHA_AI_NEURAL_CELLS
    } = require('./core/neural/sheikha-ai-neural-cell-network');

    app.get('/api/sheikha/ai-neural-cell-network/status', (_req, res) => {
        res.json({
            success: true,
            status: 'active',
            network: 'sheikha-ai-neural-cell-network',
            cellsCount: Object.keys(SHEIKHA_AI_NEURAL_CELLS).length,
            mode: 'deterministic-governed-analysis',
            message: 'شبكة خلايا شيخة العصبية التحليلية مفعلة'
        });
    });

    app.post('/api/sheikha/ai-neural-cell-network/evaluate', express.json(), (req, res) => {
        res.json(evaluateSheikhaAINetwork(req.body || {}));
    });
} catch (err) {
    console.warn('⚠️ Sheikha AI Neural Cell Network route inactive:', err.message);
}

`;

if (!s.includes('/api/sheikha/ai-neural-cell-network/status')) {
    const marker = "app.use((req, res) => {";
    const idx = s.lastIndexOf(marker);
    if (idx === -1) throw new Error('لم أجد 404 النهائي');
    s = s.slice(0, idx) + block + s.slice(idx);
    fs.writeFileSync(file, s);
    console.log('ADDED');
} else {
    console.log('ALREADY_EXISTS');
}
