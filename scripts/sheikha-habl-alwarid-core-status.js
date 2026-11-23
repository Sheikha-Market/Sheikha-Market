#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-habl-alwarid-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'habl-alwarid-core-spec.json', exists: exists('habl-alwarid-core-spec.json') },
        { name: 'layers/near-layers.json', exists: exists('layers/near-layers.json') },
        { name: 'governance/habl-governance.json', exists: exists('governance/habl-governance.json') }
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
            ? 'شيخة حبل الوريد مفعلة بالكامل'
            : 'تفعيل شيخة حبل الوريد غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
