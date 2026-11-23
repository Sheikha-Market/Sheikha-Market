#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-open-markets-core');

function checkFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    const exists = fs.existsSync(filePath);
    return {
        file: rel,
        exists,
        size: exists ? fs.statSync(filePath).size : 0
    };
}

function main() {
    const checks = [
        checkFile(path.join(CORE_DIR, 'open-markets-core-spec.json')),
        checkFile(path.join(CORE_DIR, 'markets', 'specialization-framework.json')),
        checkFile(path.join(CORE_DIR, 'innovation', 'innovation-without-artificial-limits.json')),
        checkFile(path.join(CORE_DIR, 'projects', 'new-projects-blueprint.json')),
        checkFile(path.join(CORE_DIR, 'sharia', 'open-markets-sharia-filter.json')),
        checkFile(path.join(CORE_DIR, 'governance', 'open-markets-governance.json')),
        checkFile(path.join(ROOT, 'data', 'sheikha-open-markets.json'))
    ];

    const total = checks.length;
    const present = checks.filter((c) => c.exists).length;
    const ready = present === total;

    console.log(JSON.stringify({
        success: ready,
        data: {
            core: 'open-markets-core',
            total,
            present,
            ready,
            checks
        },
        message: ready ? 'نواة الأسواق المفتوحة جاهزة' : 'النواة غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));

    process.exit(ready ? 0 : 1);
}

main();
