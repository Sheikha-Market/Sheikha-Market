#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'infrastructure', 'sheikha-consent-communication-governance-core');

function exists(relPath) {
    return fs.existsSync(path.join(BASE_DIR, relPath));
}

function main() {
    const checks = [
        { name: 'consent-communication-governance-core-spec.json', exists: exists('consent-communication-governance-core-spec.json') },
        { name: 'communication/communication-catalog.json', exists: exists('communication/communication-catalog.json') },
        { name: 'consent/consent-policy.json', exists: exists('consent/consent-policy.json') },
        { name: 'consent/consent-log-schema.json', exists: exists('consent/consent-log-schema.json') },
        { name: 'governance/privacy-policy.json', exists: exists('governance/privacy-policy.json') },
        { name: 'governance/compliance-framework.json', exists: exists('governance/compliance-framework.json') },
        { name: 'defensive-monitoring/system-health-monitoring-policy.json', exists: exists('defensive-monitoring/system-health-monitoring-policy.json') },
        { name: 'defensive-monitoring/defensive-alert-playbook.json', exists: exists('defensive-monitoring/defensive-alert-playbook.json') },
        { name: 'partnerships/public-partnership-pages.json', exists: exists('partnerships/public-partnership-pages.json') },
        { name: 'partnerships/public-entity-catalog.json', exists: exists('partnerships/public-entity-catalog.json') },
        { name: 'partnerships/partner-transparency-model.json', exists: exists('partnerships/partner-transparency-model.json') }
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
            ? 'نواة التواصل والحوكمة والامتثال مفعلة بالكامل'
            : 'نواة التواصل والحوكمة والامتثال غير مكتملة',
        timestamp: new Date().toISOString()
    }, null, 4));
}

main();
