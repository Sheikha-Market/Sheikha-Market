#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-quranic-science-integration-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'quranic-science-integration-core-spec.json', exists: exists('quranic-science-integration-core-spec.json') },
        { name: 'contemplation/quran-contemplation-cases.json', exists: exists('contemplation/quran-contemplation-cases.json') },
        { name: 'methodology/hujjah-burhan-istidlal-bayan-framework.json', exists: exists('methodology/hujjah-burhan-istidlal-bayan-framework.json') },
        { name: 'fusion/science-fusion-domains.json', exists: exists('fusion/science-fusion-domains.json') },
        { name: 'sustainability/sustainable-barakah-framework.json', exists: exists('sustainability/sustainable-barakah-framework.json') },
        { name: 'governance/quranic-science-governance.json', exists: exists('governance/quranic-science-governance.json') }
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
            ? 'نواة التكامل القرآني العلمي مفعلة بالكامل'
            : 'نواة التكامل القرآني العلمي غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
