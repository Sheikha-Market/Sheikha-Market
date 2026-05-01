#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-data-fabric-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'data-fabric-core-spec.json', exists: exists('data-fabric-core-spec.json') },
        { name: 'domains/data-domains.json', exists: exists('domains/data-domains.json') },
        { name: 'pipeline/improvement-pipeline.json', exists: exists('pipeline/improvement-pipeline.json') },
        { name: 'governance/data-governance.json', exists: exists('governance/data-governance.json') }
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
            ? 'منظومة البيانات مفعلة بالكامل'
            : 'تفعيل منظومة البيانات غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
