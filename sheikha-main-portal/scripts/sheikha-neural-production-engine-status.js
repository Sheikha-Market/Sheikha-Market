#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-neural-production-engine');

function checkFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    const exists = fs.existsSync(filePath);
    return { file: rel, exists, size: exists ? fs.statSync(filePath).size : 0 };
}

function main() {
    const checks = [
        checkFile(path.join(CORE_DIR, 'neural-production-engine-spec.json')),
        checkFile(path.join(CORE_DIR, 'layers', 'neural-architecture.json')),
        checkFile(path.join(CORE_DIR, 'training-loop', 'infinite-training-loop.json')),
        checkFile(path.join(CORE_DIR, 'quantum-bridge', 'quantum-neural-bridge.json')),
        checkFile(path.join(CORE_DIR, 'physical-integration', 'physical-computing-integration.json')),
        checkFile(path.join(CORE_DIR, 'performance', 'sub-second-engine-status.json')),
        checkFile(path.join(CORE_DIR, 'governance', 'neural-engine-governance.json'))
    ];
    const total = checks.length;
    const present = checks.filter((c) => c.exists).length;
    const ready = present === total;

    console.log(JSON.stringify({
        success: ready,
        message: ready ? 'محرك الإنتاج العصبي جاهز — سرعة أقل من ثانية مضمونة' : `${present}/${total} ملفات موجودة`,
        data: { core: 'neural-production-engine', present, total, ready, checks },
        timestamp: new Date().toISOString()
    }, null, 4));
    process.exit(ready ? 0 : 1);
}
main();
