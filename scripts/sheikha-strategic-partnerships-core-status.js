#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function inspect(root = process.cwd()) {
    const BASE_DIR = path.join(root, 'infrastructure', 'sheikha-strategic-partnerships-core');
    const exists = relPath => fs.existsSync(path.join(BASE_DIR, relPath));
    const checks = [
        { name: 'strategic-partnerships-core-spec.json', exists: exists('strategic-partnerships-core-spec.json') },
        { name: 'bands/partner-bands.json', exists: exists('bands/partner-bands.json') },
        { name: 'ecosystem/ecosystem-domains.json', exists: exists('ecosystem/ecosystem-domains.json') },
        { name: 'metrics/evaluation-metrics.json', exists: exists('metrics/evaluation-metrics.json') },
        { name: 'governance/partnership-governance.json', exists: exists('governance/partnership-governance.json') },
        { name: 'academia/target-universities.json', exists: exists('academia/target-universities.json') },
        { name: 'research/target-research-centers.json', exists: exists('research/target-research-centers.json') },
        { name: 'training/training-development-framework.json', exists: exists('training/training-development-framework.json') }
    ];

    const score = Math.round((checks.filter((c) => c.exists).length / checks.length) * 100);

    // File presence measures configuration coverage, not signed partnerships.
    let declaredPartnerRecordCount = null;
    let registryReadable = false;
    try {
        const registry = JSON.parse(fs.readFileSync(path.join(root, 'runtime/partner-registry/v1/sheikha-partner-registry-v1.json'), 'utf8'));
        if (Array.isArray(registry.partners)) {
            registryReadable = true;
            declaredPartnerRecordCount = registry.partners.length;
        }
    } catch { /* Missing or invalid registry is not evidence of a relationship. */ }

    return {
        success: true,
        data: {
            baseDir: BASE_DIR,
            readinessScore: score,
            readinessScoreMeaning: 'CONFIGURATION_FILE_PRESENCE_ONLY',
            registryReadable,
            declaredPartnerRecordCount,
            verifiedPartnerCount: null,
            operationalReadinessVerified: false,
            checks
        },
        message: score === 100
            ? 'ملفات إعداد الشراكات مكتملة؛ العقود والتشغيل والنتائج لم تتحقق بهذا الفحص'
            : 'ملفات إعداد الشراكات غير مكتملة؛ لا يثبت هذا الفحص جاهزية التشغيل',
        timestamp: new Date().toISOString()
    };
}

if (require.main === module) console.log(JSON.stringify(inspect(), null, 4));
module.exports = { inspect };
