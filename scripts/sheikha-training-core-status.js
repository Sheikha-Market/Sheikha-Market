#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const checks = [
    'infrastructure/sheikha-training-core/training-core-spec.json',
    'infrastructure/sheikha-training-core/sessions/training-sessions-catalog.json',
    'infrastructure/sheikha-training-core/datasets/training-datasets-manifest.json',
    'infrastructure/sheikha-training-core/pipelines/training-pipeline.json',
    'infrastructure/sheikha-training-core/evaluation/training-evaluation-framework.json',
    'infrastructure/sheikha-training-core/governance/training-governance.json'
];

function main() {
    const results = checks.map((c) => ({
        path: c,
        exists: fs.existsSync(path.join(ROOT, c))
    }));

    const score = Math.round((results.filter((r) => r.exists).length / results.length) * 100);

    console.log(JSON.stringify({
        success: true,
        message: score === 100 ? 'نواة التدريب مفعلة بالكامل' : 'نواة التدريب تحتاج استكمالاً',
        data: {
            core: 'sheikha-training-core',
            readinessScore: score,
            checks: results
        },
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
