#!/usr/bin/env node
'use strict';

const fs = require('fs');
const file = 'server.js';
let s = fs.readFileSync(file, 'utf8');

const block = `
// ─────────────────────────────────────────────────────────────
// Sheikha Runtime Root Health API
// ─────────────────────────────────────────────────────────────
app.get('/api/runtime-root/health', (_req, res) => {
    res.json({
        success: true,
        name: 'Sheikha Runtime Root',
        status: 'active',
        mode: 'root-governed-runtime',
        layers: {
            editor: true,
            ide: true,
            runtime: true,
            aiGateway: true,
            ollama: true,
            enterprise: true,
            osLayer: true,
            unifiedApi: true,
            rootNeuralControlPlane: true
        },
        ports: {
            root: 8080,
            companion: 8082,
            universalApi: 9191,
            localAI: 11434
        },
        governance: {
            tawheed: true,
            quranAndSunnahGoverned: true,
            noRiba: true,
            noFraud: true,
            noHarm: true,
            noGhaybPrediction: true,
            noConsciousnessClaim: true,
            humanAuthority: true,
            auditRequired: true
        },
        message: 'نواة Runtime Root مفعلة ومحكومة بالكتاب والسنة',
        timestamp: new Date().toISOString()
    });
});
`;

if (!s.includes('/api/runtime-root/health')) {
    const marker = "app.use((req, res) => {";
    const idx = s.lastIndexOf(marker);
    if (idx === -1) throw new Error('لم يتم العثور على 404 النهائي');
    s = s.slice(0, idx) + block + '\n' + s.slice(idx);
    fs.writeFileSync(file, s);
    console.log('ADDED');
} else {
    console.log('EXISTS');
}
