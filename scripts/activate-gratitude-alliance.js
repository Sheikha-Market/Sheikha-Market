#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const SheikhaGratitudeEngine = require('../lib/sheikha-gratitude-engine');

async function main() {
    console.log('🛡️ بسم الله.. بدء تفعيل الالتحام مع Microsoft/Windows + Google Cloud');
    const engine = new SheikhaGratitudeEngine();
    const report = await engine.activate();

    console.log('\n✅ اكتمل التفعيل بنجاح.');
    console.log(`• status: ${report.alliance.status}`);
    console.log(`• level: ${report.summary.level}`);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ فشل تشغيل محرك الالتحام:', error.message);
        process.exitCode = 1;
    });
}
