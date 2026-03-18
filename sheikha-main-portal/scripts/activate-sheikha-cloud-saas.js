#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const STRATEGY_PATH = path.join(ROOT_DIR, 'data', 'sheikha-blue-ocean-cloud-strategy.json');
const REPORT_DIR = path.join(ROOT_DIR, 'reports', 'cloud');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function runScript(scriptName) {
    try {
        execSync(`npm run -s ${scriptName}`, {
            cwd: ROOT_DIR,
            stdio: 'ignore'
        });
        return { script: scriptName, status: 'ok' };
    } catch (error) {
        return {
            script: scriptName,
            status: 'warning',
            message: error.message.split('\n')[0]
        };
    }
}

function now() {
    return new Date().toISOString();
}

function main() {
    const strategy = readJson(STRATEGY_PATH);

    const checks = [
        runScript('ops:readiness'),
        runScript('ops:org:full'),
        runScript('ops:server:pm2:start'),
        runScript('ops:monitor:start'),
        runScript('ops:health:check:dry')
    ];

    const okCount = checks.filter(item => item.status === 'ok').length;
    const cloudLikelyActive = checks.find(item => item.script === 'ops:health:check:dry')?.status === 'ok';

    const report = {
        title: 'Sheikha Cloud SaaS Activation Report',
        generatedAt: now(),
        strategy: {
            title: strategy._meta.title,
            vision: strategy.vision,
            platforms: strategy.platforms.map(platform => ({
                id: platform.id,
                name: platform.name,
                type: platform.type
            })),
            alliancePartners: strategy.multiCloudAlliance.partners.map(partner => partner.name),
            geoCoverage: strategy.geoCoverage,
            blueOceanPrograms: strategy.blueOceanPrograms,
            designIdentity: strategy.designIdentity,
            cntxtAnalysis: strategy.cntxtAnalysis
        },
        activationChecks: checks,
        status: {
            overall: okCount >= 4 ? 'activated-with-warnings' : okCount >= 2 ? 'partial' : 'needs-work',
            checksOk: okCount,
            checksTotal: checks.length,
            serverPm2: checks.find(item => item.script === 'ops:server:pm2:start')?.status || 'unknown',
            monitorPm2: checks.find(item => item.script === 'ops:monitor:start')?.status || 'unknown',
            cloudConnectivityLikely: cloudLikelyActive
        },
        recommendations: [
            'تفعيل ADC على البيئة المحلية لتأكيد الربط السحابي الكامل.',
            'تشغيل ops:gcloud:alliance:auto:pm2:start للمراقبة السحابية المستمرة.',
            'تطبيق capability packs للمناطق ذات النقص عبر multi-cloud federation.',
            'اعتماد واجهة بصرية موحدة لمنتجات Sheikha SaaS وفق هوية Sovereign Futurism.'
        ]
    };

    const stamp = now().replace(/[:.]/g, '-').slice(0, 19);
    const latestPath = path.join(REPORT_DIR, 'sheikha-cloud-saas-activation-latest.json');
    const snapshotPath = path.join(REPORT_DIR, `sheikha-cloud-saas-activation-${stamp}.json`);

    writeJson(latestPath, report);
    writeJson(snapshotPath, report);

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║      شيخة — تفعيل السحابة والسيرفر و SaaS          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`✅ فحوصات ناجحة: ${okCount}/${checks.length}`);
    console.log(`✅ حالة السيرفر PM2: ${report.status.serverPm2}`);
    console.log(`✅ حالة المراقبة PM2: ${report.status.monitorPm2}`);
    console.log(`✅ الترابط السحابي المحتمل: ${report.status.cloudConnectivityLikely ? 'متاح' : 'غير مكتمل'}`);
    console.log('📁 التقارير:');
    console.log('   → reports/cloud/sheikha-cloud-saas-activation-latest.json');
    console.log(`   → reports/cloud/sheikha-cloud-saas-activation-${stamp}.json`);
}

main();
