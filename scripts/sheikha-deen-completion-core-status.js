#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-deen-completion-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'deen-completion-core-spec.json', exists: exists('deen-completion-core-spec.json') },
        { name: 'layers/completion-layers.json', exists: exists('layers/completion-layers.json') },
        { name: 'governance/completion-governance.json', exists: exists('governance/completion-governance.json') }
    ];

    const score = Math.round((checks.filter((c) => c.exists).length / checks.length) * 100);

    console.log(JSON.stringify({
        success: true,
        data: {
            baseDir: BASE_DIR,
            readinessScore: score,
            checks
        },
        message: score === 100
            ? 'شيخة إكمال الدين مفعلة بالكامل'
            : 'تفعيل شيخة إكمال الدين غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
