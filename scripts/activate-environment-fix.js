#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const SheikhaEnvironmentFixEngine = require('../lib/sheikha-environment-fix-engine');

async function main() {
    console.log('🛠️ بدء تفعيل محرك تطهير البيئة وفك حظر الامتثال...');
    const engine = new SheikhaEnvironmentFixEngine();
    const report = await engine.activate();
    console.log('\n✅ اكتمل التفعيل المهني.');
    console.log(`• score: ${report.summary.score}`);
    console.log(`• level: ${report.summary.level}`);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ خطأ التشغيل:', error.message);
        process.exitCode = 1;
    });
}
