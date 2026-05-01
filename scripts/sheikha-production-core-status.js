#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const checks = [
    'infrastructure/sheikha-production-core/production-core-spec.json',
    'infrastructure/sheikha-production-core/deployment/deployment-blueprint.json',
    'infrastructure/sheikha-production-core/monitoring/health-monitoring-policy.json',
    'infrastructure/sheikha-production-core/load-balancing/load-balancing-spec.json',
    'infrastructure/sheikha-production-core/scaling/auto-scaling-framework.json',
    'infrastructure/sheikha-production-core/governance/production-governance.json'
];

function main() {
    const results = checks.map((c) => ({
        path: c,
        exists: fs.existsSync(path.join(ROOT, c))
    }));

    const score = Math.round((results.filter((r) => r.exists).length / results.length) * 100);

    console.log(JSON.stringify({
        success: true,
        message: score === 100 ? 'نواة الإنتاج مفعلة بالكامل' : 'نواة الإنتاج تحتاج استكمالاً',
        data: {
            core: 'sheikha-production-core',
            readinessScore: score,
            checks: results
        },
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
