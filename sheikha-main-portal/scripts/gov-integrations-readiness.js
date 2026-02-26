'use strict';

const fs = require('fs');
const path = require('path');
const NationalAddressClient = require('../lib/connectors/national-address-client');

function loadPlans() {
    const p = path.join(__dirname, '..', 'config', 'gov-api-plans.json');
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
}

function printLine(label, value) {
    console.log(`${label}: ${value}`);
}

function main() {
    console.log('════════════════════════════════════════════════════');
    console.log('🧭 فحص جاهزية التكامل الحكومي — National Address');
    console.log('════════════════════════════════════════════════════');

    let plans;
    try {
        plans = loadPlans();
    } catch (e) {
        console.error('❌ تعذر قراءة config/gov-api-plans.json:', e.message);
        process.exit(1);
    }

    const client = new NationalAddressClient();
    const status = client.getReadiness();
    const planName = status.plan;
    const planCfg = plans.plans[planName] || null;

    printLine('المزود', status.provider);
    printLine('الباقة', planName);
    printLine('BASE_URL', status.configured.baseUrl ? '✅ مضبوط' : '❌ غير مضبوط');
    printLine('API_KEY', status.configured.apiKey ? '✅ مضبوط' : '⚠️ غير مضبوط');
    printLine('CLIENT_ID', status.configured.clientId ? '✅ مضبوط' : '⚠️ غير مضبوط');
    printLine('CLIENT_SECRET', status.configured.clientSecret ? '✅ مضبوط' : '⚠️ غير مضبوط');

    if (planCfg) {
        printLine('حد شهري', planCfg.monthlyCalls);
        printLine('حد بالثانية', planCfg.callsPerSecond);
        printLine('الفاصل الأدنى (ms)', planCfg.minIntervalMs);
    }

    const missingCritical = !status.configured.baseUrl;
    if (missingCritical) {
        console.log('\n❌ الجاهزية: غير مكتملة');
        console.log('السبب: NATIONAL_ADDRESS_BASE_URL مطلوب على الأقل.');
        process.exit(1);
    }

    console.log('\n✅ الجاهزية: أساسية مكتملة');
    console.log('ملاحظة: يُفضّل ضبط مفاتيح الاعتماد الرسمية قبل الإنتاج.');
}

main();
