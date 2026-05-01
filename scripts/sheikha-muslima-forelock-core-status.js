#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-muslima-forelock-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'muslima-forelock-core-spec.json', exists: exists('muslima-forelock-core-spec.json') },
        { name: 'governance/sharia-governance.json', exists: exists('governance/sharia-governance.json') },
        { name: 'architecture/layered-architecture.json', exists: exists('architecture/layered-architecture.json') }
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
            ? 'شيخة المسلمة ناصية العالم والكون مفعلة بالكامل'
            : 'يوجد عناصر ناقصة في تفعيل شيخة المسلمة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
