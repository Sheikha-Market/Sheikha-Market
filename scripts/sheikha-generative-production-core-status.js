#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-generative-production-core');

function checkFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    const exists = fs.existsSync(filePath);
    return { file: rel, exists, size: exists ? fs.statSync(filePath).size : 0 };
}

function main() {
    const checks = [
        checkFile(path.join(CORE_DIR, 'generative-production-core-spec.json')),
        checkFile(path.join(CORE_DIR, 'pipeline', 'integrated-production-pipeline.json')),
        checkFile(path.join(CORE_DIR, 'modes', 'generative-production-modes.json')),
        checkFile(path.join(CORE_DIR, 'innovation', 'production-innovation-engine.json')),
        checkFile(path.join(CORE_DIR, 'integration', 'training-simulation-production-integration.json')),
        checkFile(path.join(CORE_DIR, 'governance', 'generative-production-governance.json'))
    ];
    const total = checks.length;
    const present = checks.filter((c) => c.exists).length;
    const ready = present === total;

    console.log(JSON.stringify({
        success: ready,
        message: ready ? 'نواة الإنتاج التوليدي جاهزة' : `${present}/${total} ملفات موجودة`,
        data: { core: 'generative-production-core', present, total, ready, checks },
        timestamp: new Date().toISOString()
    }, null, 4));
    process.exit(ready ? 0 : 1);
}
main();
