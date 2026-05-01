#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-islamic-ecosystem-alignment-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'islamic-ecosystem-alignment-core-spec.json', exists: exists('islamic-ecosystem-alignment-core-spec.json') },
        { name: 'entities/entity-catalog.json', exists: exists('entities/entity-catalog.json') },
        { name: 'analysis/goal-analysis-framework.json', exists: exists('analysis/goal-analysis-framework.json') },
        { name: 'shared-goals/shared-goals-matrix.json', exists: exists('shared-goals/shared-goals-matrix.json') },
        { name: 'improvement/improvement-framework.json', exists: exists('improvement/improvement-framework.json') },
        { name: 'governance/ecosystem-alignment-governance.json', exists: exists('governance/ecosystem-alignment-governance.json') }
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
            ? 'نواة مواءمة الجهات الإسلامية مفعلة بالكامل'
            : 'نواة مواءمة الجهات الإسلامية غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
