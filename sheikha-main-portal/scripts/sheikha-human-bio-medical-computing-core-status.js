#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-human-bio-medical-computing-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'human-bio-medical-core-spec.json', exists: exists('human-bio-medical-core-spec.json') },
        { name: 'lifecycle/human-lifecycle-framework.json', exists: exists('lifecycle/human-lifecycle-framework.json') },
        { name: 'medical/medical-sciences-map.json', exists: exists('medical/medical-sciences-map.json') },
        { name: 'blood/blood-computing-framework.json', exists: exists('blood/blood-computing-framework.json') },
        { name: 'cells/cellular-computing-framework.json', exists: exists('cells/cellular-computing-framework.json') },
        { name: 'behavior/behavior-education-framework.json', exists: exists('behavior/behavior-education-framework.json') },
        { name: 'fusion/cross-science-human-fusion.json', exists: exists('fusion/cross-science-human-fusion.json') },
        { name: 'governance/human-dignity-governance.json', exists: exists('governance/human-dignity-governance.json') }
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
            ? 'نواة حوسبة الإنسان والطب مفعلة بالكامل'
            : 'نواة حوسبة الإنسان والطب غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();