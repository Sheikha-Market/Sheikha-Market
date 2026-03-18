#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CORE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-network-fabric-core');

function checkFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    const exists = fs.existsSync(filePath);
    return { file: rel, exists, size: exists ? fs.statSync(filePath).size : 0 };
}

function main() {
    const checks = [
        checkFile(path.join(CORE_DIR, 'network-fabric-core-spec.json')),
        checkFile(path.join(CORE_DIR, 'physical', 'physical-network-layer.json')),
        checkFile(path.join(CORE_DIR, 'quantum', 'quantum-network-layer.json')),
        checkFile(path.join(CORE_DIR, 'neural', 'neural-network-layer.json')),
        checkFile(path.join(CORE_DIR, 'logical', 'logical-network-layer.json')),
        checkFile(path.join(CORE_DIR, 'subsecond', 'sub-second-engine.json')),
        checkFile(path.join(CORE_DIR, 'governance', 'network-fabric-governance.json'))
    ];
    const total = checks.length;
    const present = checks.filter((c) => c.exists).length;
    const ready = present === total;

    console.log(JSON.stringify({
        success: ready,
        message: ready ? 'نواة الشبكات الشاملة جاهزة (فيزيائية + كمية + عصبية + منطقية)' : `${present}/${total} ملفات موجودة`,
        data: { core: 'network-fabric-core', present, total, ready, layers: ['physical', 'quantum', 'neural', 'logical'], checks },
        timestamp: new Date().toISOString()
    }, null, 4));
    process.exit(ready ? 0 : 1);
}
main();
