#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-global-brain-core');

function exists(p) {
    return fs.existsSync(p);
}

function main() {
    const requiredDirs = [
        'governance',
        'knowledge',
        'intelligence-grid',
        'cloud-ai-core'
    ];

    const requiredFiles = [
        'global-brain-core-spec.json',
        path.join('governance', 'brain-governance.json'),
        path.join('intelligence-grid', 'intelligence-grid-spec.json')
    ];

    const dirs = requiredDirs.map((name) => ({ name, exists: exists(path.join(BASE_DIR, name)) }));
    const files = requiredFiles.map((name) => ({ name, exists: exists(path.join(BASE_DIR, name)) }));

    const checks = [exists(BASE_DIR), ...dirs.map((d) => d.exists), ...files.map((f) => f.exists)];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    console.log(JSON.stringify({
        success: true,
        data: {
            baseDir: BASE_DIR,
            readinessScore: score,
            directories: dirs,
            artifacts: files
        },
        message: score === 100
            ? 'شيخة العقل الأساسي العالمي مفعلة بالكامل'
            : 'التفعيل غير مكتمل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
