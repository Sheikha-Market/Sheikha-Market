#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-advanced-computing-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'advanced-computing-core-spec.json', exists: exists('advanced-computing-core-spec.json') },
        { name: 'computing/computing-fabric.json', exists: exists('computing/computing-fabric.json') },
        { name: 'quantum/quantum-computing-stack.json', exists: exists('quantum/quantum-computing-stack.json') },
        { name: 'physical/physical-computing-stack.json', exists: exists('physical/physical-computing-stack.json') },
        { name: 'neural/neural-network-stack.json', exists: exists('neural/neural-network-stack.json') },
        { name: 'branches/computing-branches-catalog.json', exists: exists('branches/computing-branches-catalog.json') },
        { name: 'branches/precision-vertical-horizontal-branches.json', exists: exists('branches/precision-vertical-horizontal-branches.json') },
        { name: 'integration/cross-computing-integration-links.json', exists: exists('integration/cross-computing-integration-links.json') },
        { name: 'fusion/science-fusion-matrix.json', exists: exists('fusion/science-fusion-matrix.json') },
        { name: 'sharia/quran-sunnah-digitization-framework.json', exists: exists('sharia/quran-sunnah-digitization-framework.json') },
        { name: 'autogenesis/branch-autogenesis-system.json', exists: exists('autogenesis/branch-autogenesis-system.json') },
        { name: 'governance/advanced-computing-governance.json', exists: exists('governance/advanced-computing-governance.json') }
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
            ? 'نواة الحوسبة المتقدمة مفعلة بالكامل'
            : 'نواة الحوسبة المتقدمة غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
