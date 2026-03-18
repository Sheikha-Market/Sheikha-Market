#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-ecosystem-segmentation-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'ecosystem-segmentation-core-spec.json', exists: exists('ecosystem-segmentation-core-spec.json') },
        { name: 'taxonomy/sector-taxonomy.json', exists: exists('taxonomy/sector-taxonomy.json') },
        { name: 'clusters/specialist-communities.json', exists: exists('clusters/specialist-communities.json') },
        { name: 'contracts/electronic-contracting-framework.json', exists: exists('contracts/electronic-contracting-framework.json') },
        { name: 'automation/digital-integration-workflow.json', exists: exists('automation/digital-integration-workflow.json') },
        { name: 'governance/ecosystem-governance.json', exists: exists('governance/ecosystem-governance.json') }
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
            ? 'منظومة التقسيم والتجمعات مفعلة بالكامل'
            : 'تفعيل منظومة التقسيم والتجمعات غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
