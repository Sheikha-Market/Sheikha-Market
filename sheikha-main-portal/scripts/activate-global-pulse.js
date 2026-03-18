#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const SheikhaGlobalPulseEngine = require('../lib/sheikha-global-pulse-engine');

async function main() {
    console.log('🛡️ بدء تفعيل محرك رصد التحالف والصلح الآمن...');
    const engine = new SheikhaGlobalPulseEngine();
    const report = await engine.activate();

    console.log('\n✅ اكتمل التفعيل بلا ضرر ولا ضرار.');
    console.log(`• alliance: ${report.alliance}`);
    console.log(`• overall: ${report.summary.overallScore}`);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ خطأ التشغيل:', error.message);
        process.exitCode = 1;
    });
}
