#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'hyperscale');

function exists(p) {
    return fs.existsSync(p);
}

function main() {
    const requiredDomains = [
        'control-plane',
        'compute',
        'data',
        'network',
        'security',
        'observability',
        'disaster-recovery',
        'governance'
    ];

    const domainStatus = requiredDomains.map((name) => ({
        name,
        exists: exists(path.join(BASE_DIR, name))
    }));

    const artifacts = [
        'targets.json',
        'arabic-governance.json'
    ].map((name) => ({
        name,
        exists: exists(path.join(BASE_DIR, name))
    }));

    const checks = [
        exists(BASE_DIR),
        ...domainStatus.map((d) => d.exists),
        ...artifacts.map((a) => a.exists)
    ];

    const passed = checks.filter(Boolean).length;
    const readinessScore = Math.round((passed / checks.length) * 100);

    console.log(JSON.stringify({
        success: true,
        data: {
            baseDir: BASE_DIR,
            readinessScore,
            domainStatus,
            artifacts
        },
        message: readinessScore >= 90
            ? 'Hyperscale Foundation جاهزة للمرحلة التالية'
            : 'Hyperscale Foundation تحتاج إكمال التفعيل',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
