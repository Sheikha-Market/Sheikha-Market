#!/usr/bin/env node

const SheikhaSovereignAuthEngine = require('../lib/sheikha-sovereign-auth-engine');

function printSummary(report) {
    const core = report.auth.overall;
    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ Sovereign Auth Activation - تقرير التفعيل');
    console.log(`• protocol: ${report.protocol}`);
    console.log(`• core-auth: ${core.coreReady ? 'ready' : 'needs-configuration'}`);
    console.log(`• providers: ${core.enabledProviders}/${core.totalProviders}`);
    console.log(`• payments-ready: ${report.mobileSuite.status.paymentsReady ? 'yes' : 'no'}`);
    console.log('• report: data/sovereign-auth-report.json');
    console.log('═════════════════════════════════════════════════════════════');
}

async function main() {
    const engine = new SheikhaSovereignAuthEngine();
    const report = engine.activate();
    printSummary(report);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ فشل التفعيل:', error.message);
        process.exitCode = 1;
    });
}
