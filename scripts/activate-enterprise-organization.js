#!/usr/bin/env node
'use strict';

const { generateEnterpriseOrganizationReport } = require('../lib/sheikha-enterprise-org-engine');

async function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   شيخة — تفعيل الهيكلة الإدارية والتشغيلية          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    const report = await generateEnterpriseOrganizationReport();
    const s = report.summary;

    console.log('📚 تم بناء الدراسة التشغيلية والتنظيمية بنجاح.');
    console.log('');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│          ملخص الهيكلة الإدارية والتشغيلية          │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│  عدد الأقسام:          ${String(s.totalDepartments).padEnd(28, ' ')}│`);
    console.log(`│  عدد الموظفين المخطط:  ${String(s.totalEmployees).padEnd(28, ' ')}│`);
    console.log(`│  الأقسام المدعومة ببوت: ${String(s.departmentsWithBots).padEnd(27, ' ')}│`);
    console.log(`│  المسارات الهندسية:    ${String(s.engineeringTracks).padEnd(28, ' ')}│`);
    console.log(`│  القطاعات الكبرى:      ${String(s.domainsCount).padEnd(28, ' ')}│`);
    console.log(`│  الوحدات التفصيلية:    ${String(s.domainUnitsCount).padEnd(28, ' ')}│`);
    console.log(`│  طبقات التعافي الآلي:  ${String(s.autonomousLayersCount).padEnd(28, ' ')}│`);
    console.log(`│  وكلاء التشغيل الذاتي: ${String(s.autonomousAgentsCount).padEnd(28, ' ')}│`);
    console.log(`│  مناطق الشبكة الداخلية: ${String(s.internalNetworkZones).padEnd(27, ' ')}│`);
    console.log(`│  قنوات الشبكة الخارجية: ${String(s.externalNetworkChannels).padEnd(27, ' ')}│`);
    console.log(`│  منصات المؤسسة الرقمية: ${String(s.enterprisePlatforms).padEnd(27, ' ')}│`);
    console.log(`│  وحدات جودة المنتج:     ${String(s.qualityUnits).padEnd(27, ' ')}│`);
    console.log(
        `│  متوسط تقييم الأقسام:  ${String(s.averageDepartmentRating + '/100').padEnd(28, ' ')}│`
    );
    console.log('└─────────────────────────────────────────────────────┘');
    console.log('');
    console.log('📁 الملفات الناتجة:');
    console.log('   → reports/organization/enterprise-organization-report.json');
    console.log('   → reports/organization/enterprise-organization-summary.json');
    console.log('   → reports/organization/engineering-structure.json');
    console.log('   → reports/organization/market-community-infrastructure.json');
    console.log('   → reports/organization/autonomous-self-healing-framework.json');
    console.log('   → reports/organization/network-flow-archiving-system.json');
    console.log('   → reports/organization/digital-enterprise-stack.json');
    console.log('   → reports/organization/product-quality-digital-division.json');
    console.log('   → reports/organization/bot-performance-governance.json');
    console.log('');
    console.log('✅ تم تفعيل الهيكل المؤسسي بنجاح.');
}

main().catch(error => {
    console.error(`❌ خطأ: ${error.message}`);
    process.exitCode = 1;
});
