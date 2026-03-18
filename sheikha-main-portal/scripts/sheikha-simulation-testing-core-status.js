#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const checks = [
    'infrastructure/sheikha-simulation-testing-core/simulation-testing-core-spec.json',
    'infrastructure/sheikha-simulation-testing-core/scenarios/test-scenarios-catalog.json',
    'infrastructure/sheikha-simulation-testing-core/queries/rag-query-simulation-bank.json',
    'infrastructure/sheikha-simulation-testing-core/benchmarks/performance-benchmarks.json',
    'infrastructure/sheikha-simulation-testing-core/results/simulation-results-log.json',
    'infrastructure/sheikha-simulation-testing-core/governance/simulation-governance.json'
];

function main() {
    const results = checks.map((c) => ({
        path: c,
        exists: fs.existsSync(path.join(ROOT, c))
    }));

    const score = Math.round((results.filter((r) => r.exists).length / results.length) * 100);

    console.log(JSON.stringify({
        success: true,
        message: score === 100 ? 'نواة التجربة والمحاكاة مفعلة بالكامل' : 'نواة التجربة تحتاج استكمالاً',
        data: {
            core: 'sheikha-simulation-testing-core',
            readinessScore: score,
            checks: results
        },
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
