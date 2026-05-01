#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-foundation-governance');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'governance/charter.json', exists: exists('governance/charter.json') },
        { name: 'governance/axes.json', exists: exists('governance/axes.json') },
        { name: 'rules/foundational-rules.json', exists: exists('rules/foundational-rules.json') },
        { name: 'architecture/layers.json', exists: exists('architecture/layers.json') }
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
            ? 'طبقات الحوكمة الأساسية مفعلة بالكامل'
            : 'توجد عناصر ناقصة في طبقات الحوكمة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
