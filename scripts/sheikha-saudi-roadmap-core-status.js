#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-saudi-roadmap-core');

function check(rel) {
    const abs = path.join(ROOT, rel);
    const exists = fs.existsSync(abs);
    return { path: rel, exists, size: exists ? fs.statSync(abs).size : 0 };
}

function main() {
    const checks = [
        check('infrastructure/sheikha-saudi-roadmap-core/saudi-roadmap-core-spec.json'),
        check('infrastructure/sheikha-saudi-roadmap-core/timeline/timeline-phases.json'),
        check('infrastructure/sheikha-saudi-roadmap-core/projects/project-governance.json'),
        check('infrastructure/sheikha-saudi-roadmap-core/meetings/meetings-framework.json'),
        check('infrastructure/sheikha-saudi-roadmap-core/systems/systems-catalog-framework.json'),
        check('infrastructure/sheikha-saudi-roadmap-core/governance/saudi-roadmap-governance.json'),
        check('data/sheikha-saudi-roadmap-sync.json')
    ];

    const total = checks.length;
    const present = checks.filter((c) => c.exists).length;
    const ready = present === total;

    console.log(JSON.stringify({
        success: ready,
        data: { core: 'sheikha-saudi-roadmap-core', total, present, ready, checks },
        message: ready ? 'نواة الرزنامة السعودية جاهزة' : 'نواة الرزنامة السعودية غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));

    process.exit(ready ? 0 : 1);
}

main();
