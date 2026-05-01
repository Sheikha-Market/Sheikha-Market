#!/usr/bin/env node

const SheikhaSovereignTwinEngine = require('../lib/sheikha-sovereign-twin-engine');

function parseArgs() {
    const rawArgs = process.argv.slice(2);
    const hasFlag = flag => rawArgs.includes(flag);
    const getValue = prefix => {
        const item = rawArgs.find(arg => arg.startsWith(`${prefix}=`));
        return item ? item.substring(prefix.length + 1) : '';
    };

    return {
        apply: hasFlag('--apply'),
        location: getValue('--location') || 'Al-Khobar_Warehouses'
    };
}

function printSummary(report) {
    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ Sovereign Twin Activation - تقرير التفعيل');
    console.log(`• mode: ${report.mode}`);
    console.log(`• location: ${report.twinState.location}`);
    console.log(`• twin: ${report.twinState.status}`);
    console.log(`• blocks: ${report.blockchain.totalBlocks}`);
    console.log(`• report: data/sovereign-twin-report.json`);
    console.log('═════════════════════════════════════════════════════════════');
}

async function main() {
    const args = parseArgs();
    const engine = new SheikhaSovereignTwinEngine();
    const report = engine.runFullActivation(args);
    printSummary(report);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ فشل التفعيل:', error.message);
        process.exitCode = 1;
    });
}
