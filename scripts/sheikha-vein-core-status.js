#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-vein-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'vein-core-spec.json', exists: exists('vein-core-spec.json') },
        { name: 'flows/vein-flows.json', exists: exists('flows/vein-flows.json') },
        { name: 'governance/vein-governance.json', exists: exists('governance/vein-governance.json') }
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
            ? 'شيخة وريد العالم والكون مفعلة بالكامل'
            : 'تفعيل شيخة وريد غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
