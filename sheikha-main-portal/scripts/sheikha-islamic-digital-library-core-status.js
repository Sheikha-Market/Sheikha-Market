#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-islamic-digital-library-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'islamic-digital-library-core-spec.json', exists: exists('islamic-digital-library-core-spec.json') },
        { name: 'taxonomy/sharia-sciences-taxonomy.json', exists: exists('taxonomy/sharia-sciences-taxonomy.json') },
        { name: 'quran/quran-corpus-manifest.json', exists: exists('quran/quran-corpus-manifest.json') },
        { name: 'tafsir/tafsir-catalog-manifest.json', exists: exists('tafsir/tafsir-catalog-manifest.json') },
        { name: 'digitization/digitization-framework.json', exists: exists('digitization/digitization-framework.json') },
        { name: 'computing/computational-islamic-sciences.json', exists: exists('computing/computational-islamic-sciences.json') },
        { name: 'fusion/methodization-fusion-matrix.json', exists: exists('fusion/methodization-fusion-matrix.json') },
        { name: 'rights/privacy-and-rights-governance.json', exists: exists('rights/privacy-and-rights-governance.json') },
        { name: 'governance/scholarly-governance.json', exists: exists('governance/scholarly-governance.json') }
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
            ? 'نواة المكتبة الإسلامية الرقمية مفعلة بالكامل'
            : 'نواة المكتبة الإسلامية الرقمية غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
