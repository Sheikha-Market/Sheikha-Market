#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-global-compute-halal-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'global-compute-halal-core-spec.json', exists: exists('global-compute-halal-core-spec.json') },
        { name: 'catalog/global-compute-catalog.json', exists: exists('catalog/global-compute-catalog.json') },
        { name: 'integration/integration-blueprint.json', exists: exists('integration/integration-blueprint.json') },
        { name: 'contracts/digital-contracting-pack.json', exists: exists('contracts/digital-contracting-pack.json') },
        { name: 'governance/halal-governance-controls.json', exists: exists('governance/halal-governance-controls.json') }
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
            ? 'نواة التكامل العالمي للحوسبة الضخمة مفعلة بالكامل'
            : 'نواة التكامل العالمي للحوسبة الضخمة غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
