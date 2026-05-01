#!/usr/bin/env node
/* eslint-disable no-console */

const SheikhaSovereignBankEngine = require('../lib/sheikha-sovereign-bank-engine');

function parseArgs() {
    const raw = process.argv.slice(2);
    const pick = key => {
        const found = raw.find(x => x.startsWith(`--${key}=`));
        return found ? found.split('=').slice(1).join('=') : '';
    };

    return {
        projectId: pick('project') || 'NATIONAL_MINING_PROJECT_2030',
        beneficiary: pick('beneficiary') || 'Saudi Government Procurement',
        amount: Number(pick('amount') || 1000000),
        type: pick('type') || 'initial',
        currency: pick('currency') || 'SAR',
        purpose: pick('purpose') || 'Tender guarantee for strategic metals project',
        tradeType: pick('tradeType') || 'Strategic_Mineral_Reserve',
        applicant: pick('applicant') || 'Sheikha Central Bank',
        lcBeneficiary: pick('lcBeneficiary') || pick('beneficiary') || 'Global Metals Supplier',
        lcAmount: Number(pick('lcAmount') || pick('amount') || 1000000),
        lcCurrency: pick('lcCurrency') || 'USD',
        collateralAsset: pick('collateralAsset') || 'Gold_Reserve_AlKhobar',
        lcPurpose: pick('lcPurpose') || 'Strategic metal trade coverage'
    };
}

function printSummary(report) {
    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ Sovereign Bank Activation - تقرير التشغيل');
    console.log(`• status: ${report.operationsStatus}`);
    console.log(
        `• central-bank-engine: ${report.centralBankReadiness.centralReady ? 'ready' : 'missing'}`
    );
    console.log(`• fund-engine: ${report.centralBankReadiness.fundReady ? 'ready' : 'missing'}`);
    console.log(`• etimad-ready: ${report.integrationReadiness.etimad.ready ? 'yes' : 'no'}`);
    console.log(
        `• app-licenses-ready: ${report.integrationReadiness.appLicenses.ready ? 'yes' : 'no'}`
    );
    console.log(`• guarantees-in-ledger: ${report.summary.guaranteesInLedger}`);
    console.log(`• lcs-in-ledger: ${report.summary.lcsInLedger}`);
    console.log(`• last-guarantee-id: ${report.summary.lastGuaranteeId || 'none'}`);
    console.log(`• last-lc-id: ${report.summary.lastLCId || 'none'}`);
    console.log(
        `• app-sync: ${report.appSovereignty.googlePlay.configured || report.appSovereignty.appleStore.configured ? 'configured' : 'needs-config'}`
    );
    console.log('• report: data/sovereign-bank-ops-report.json');
    console.log('═════════════════════════════════════════════════════════════');
}

async function main() {
    const args = parseArgs();
    const engine = new SheikhaSovereignBankEngine();
    const report = engine.activateOperations(args);
    printSummary(report);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ فشل التشغيل:', error.message);
        process.exitCode = 1;
    });
}
