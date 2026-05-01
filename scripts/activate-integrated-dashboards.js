#!/usr/bin/env node

/**
 * 🎯 سكربت تشغيل تحليل وتفعيل المعمارية المتكاملة
 * يطبع التقرير الشامل لكل لوحات التحكم والتقنيات
 */

const SheikhaIntegratedDashboards = require('../lib/sheikha-integrated-dashboards-analytics');

async function main() {
    try {
        const report = SheikhaIntegratedDashboards.printReport();

        // حفظ التقرير في ملف
        const fs = require('fs');
        const path = require('path');

        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // تأكد من أن report هو كائن صحيح
        const reportData = report || {};
        const reportPath = path.join(dataDir, 'sheikha-integrated-dashboards-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

        console.log(`\n📄 تم حفظ التقرير الكامل: ${reportPath}`);

        process.exitCode = 0;
    } catch (error) {
        console.error('❌ خطأ في تشغيل السكربت:');
        console.error(error.message);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
