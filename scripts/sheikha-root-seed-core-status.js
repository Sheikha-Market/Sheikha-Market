#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-root-seed-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'root-seed-core-spec.json', exists: exists('root-seed-core-spec.json') },
        { name: 'seed/seed-layers.json', exists: exists('seed/seed-layers.json') },
        { name: 'root/root-layers.json', exists: exists('root/root-layers.json') },
        { name: 'governance/book-and-sunnah-governance.json', exists: exists('governance/book-and-sunnah-governance.json') }
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
            ? 'نواة البذر والجذر مفعلة بالكامل'
            : 'نواة البذر والجذر تحتاج استكمال',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
