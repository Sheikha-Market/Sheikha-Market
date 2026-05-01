#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-strategic-partnerships-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'strategic-partnerships-core-spec.json', exists: exists('strategic-partnerships-core-spec.json') },
        { name: 'bands/partner-bands.json', exists: exists('bands/partner-bands.json') },
        { name: 'ecosystem/ecosystem-domains.json', exists: exists('ecosystem/ecosystem-domains.json') },
        { name: 'metrics/evaluation-metrics.json', exists: exists('metrics/evaluation-metrics.json') },
        { name: 'governance/partnership-governance.json', exists: exists('governance/partnership-governance.json') },
        { name: 'academia/target-universities.json', exists: exists('academia/target-universities.json') },
        { name: 'research/target-research-centers.json', exists: exists('research/target-research-centers.json') },
        { name: 'training/training-development-framework.json', exists: exists('training/training-development-framework.json') }
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
            ? 'منظومة الشركات والتعاون مفعلة بالكامل'
            : 'تفعيل منظومة الشركات والتعاون غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
