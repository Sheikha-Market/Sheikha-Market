#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-mudgha-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'mudgha-core-spec.json', exists: exists('mudgha-core-spec.json') },
        { name: 'heart/heart-layers.json', exists: exists('heart/heart-layers.json') },
        { name: 'governance/governance-controls.json', exists: exists('governance/governance-controls.json') }
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
            ? 'شيخة مضغة العالم والكون مفعلة بالكامل'
            : 'تفعيل مضغة شيخة غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
