#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const SheikhaCosmicEnablementEngine = require('../lib/sheikha-cosmic-enablement-engine');

function parseArgs() {
    const raw = process.argv.slice(2);
    const pick = key => {
        const found = raw.find(x => x.startsWith(`--${key}=`));
        return found ? found.split('=').slice(1).join('=') : '';
    };

    return {
        lcVolumeSar: Number(pick('lcVolumeSar') || 5000000),
        saasSubscriptionsSar: Number(pick('saasSubscriptionsSar') || 800000),
        metalsMarginSar: Number(pick('metalsMarginSar') || 1200000),
        sovereigntyFeeRate: Number(pick('sovereigntyFeeRate') || 0.01),
        barakahProfitRate: Number(pick('barakahProfitRate') || 0.025)
    };
}

function printSummary(report) {
    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ وثيقة التمكين الكوني - تقرير التنفيذ');
    console.log(`• structure: ${report.sovereignStructure.status}`);
    console.log(
        `• cloud-init: ${report.sovereignStructure.cloudReadiness.initialized ? 'yes' : 'no'}`
    );
    console.log(
        `• gross-revenue-sar: ${report.operationalBusinessModel.calculations.grossRevenueSar}`
    );
    console.log(
        `• barakah-allocation-sar: ${report.operationalBusinessModel.calculations.zakahAndBarakahSar}`
    );
    console.log(
        `• net-operational-sar: ${report.operationalBusinessModel.calculations.netOperationalSar}`
    );
    console.log(`• barakah-index: ${report.barakahTracker.barakahIndex}`);
    console.log(`• milestones-completion: ${report.barakahTracker.milestoneCompletionPercent}%`);
    console.log(`• activation-level: ${report.activationReadiness.level}`);
    console.log(`• combined-score: ${report.activationReadiness.combinedScore}`);
    console.log(`• microsoft-readiness: ${report.microsoftWindowsPlan.readiness.score}`);
    console.log(`• partnership-power: ${report.partnershipAccreditation.collaborationPowerScore}`);
    console.log('• report: data/cosmic-enablement-report.json');
    console.log('• tracker: data/barakah-field-tracker.json');
    console.log('• blueprint: data/cosmic-charter-blueprint.json');
    console.log('• alliance: data/microsoft-windows-alliance-plan.json');
    console.log('═════════════════════════════════════════════════════════════');
}

async function main() {
    const args = parseArgs();
    const engine = new SheikhaCosmicEnablementEngine();
    const report = await engine.activate(args);
    printSummary(report);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ فشل التفعيل:', error.message);
        process.exitCode = 1;
    });
}
