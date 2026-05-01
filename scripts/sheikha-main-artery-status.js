#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-main-artery');

function exists(p) {
    return fs.existsSync(p);
}

function main() {
    const requiredDirs = [
        'layers',
        'governance',
        'cloud-saas',
        'knowledge-rd'
    ];

    const requiredFiles = [
        'main-artery-spec.json',
        path.join('governance', 'islamic-governance.json'),
        path.join('cloud-saas', 'hyperscale-cloud-saas-spec.json')
    ];

    const dirStatus = requiredDirs.map((name) => ({
        name,
        exists: exists(path.join(BASE_DIR, name))
    }));

    const fileStatus = requiredFiles.map((name) => ({
        name,
        exists: exists(path.join(BASE_DIR, name))
    }));

    const checks = [
        exists(BASE_DIR),
        ...dirStatus.map((item) => item.exists),
        ...fileStatus.map((item) => item.exists)
    ];

    const passed = checks.filter(Boolean).length;
    const readinessScore = Math.round((passed / checks.length) * 100);

    console.log(JSON.stringify({
        success: true,
        data: {
            baseDir: BASE_DIR,
            readinessScore,
            directories: dirStatus,
            artifacts: fileStatus
        },
        message: readinessScore === 100
            ? 'شيخة الشريان والعصب الرئيسي مفعلة بالكامل'
            : 'يوجد عناصر ناقصة وتحتاج استكمال التفعيل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
