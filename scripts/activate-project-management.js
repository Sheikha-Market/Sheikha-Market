#!/usr/bin/env node
'use strict';

/**
 * شيخة — تفعيل محرك إدارة المشاريع المتكامل
 * المالك: سلمان أحمد بن سلمان الراجح
 */

const {
    bootstrapDefaultProjects,
    bootstrapMarketOpsTasks,
    generateDashboard
} = require('../lib/sheikha-project-management-engine');

const SYNC_CLOUD = process.argv.includes('--sync-cloud');

async function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   شيخة — محرك إدارة المشاريع المتكامل               ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    /* 1. تسجيل المشاريع الافتراضية */
    console.log('📋 [1/3] تسجيل المشاريع...');
    bootstrapDefaultProjects();
    console.log('   ✅ تم تسجيل 6 مشاريع في السجل');

    /* 2. تهيئة مهام sheikha-market-ops */
    console.log('📝 [2/3] تهيئة مهام سوق العمليات...');
    bootstrapMarketOpsTasks();
    console.log('   ✅ تم إضافة 8 مهام لمشروع sheikha-market-ops');

    /* 3. توليد لوحة التحكم */
    console.log(`📊 [3/3] توليد لوحة التحكم${SYNC_CLOUD ? ' + مزامنة GCloud' : ''}...`);
    const dashboard = await generateDashboard({ syncCloud: SYNC_CLOUD });

    const s = dashboard.globalStats;
    console.log('');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│               لوحة إدارة المشاريع                  │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│  المشاريع الكلية:     ${String(s.totalProjects).padEnd(30, ' ')}│`);
    console.log(`│  المشاريع النشطة:     ${String(s.activeProjects).padEnd(30, ' ')}│`);
    console.log(`│  المشاريع الحرجة:     ${String(s.criticalProjects).padEnd(30, ' ')}│`);
    console.log(`│  إجمالي المهام:       ${String(s.totalTasks).padEnd(30, ' ')}│`);
    console.log(`│  المهام المكتملة:     ${String(s.completedTasks).padEnd(30, ' ')}│`);
    console.log(`│  متوسط الإنجاز:       ${String(s.avgCompletionRate + '%').padEnd(30, ' ')}│`);
    console.log(`│  نقاط الصحة الكلية:   ${String(s.globalHealthScore + '/100').padEnd(30, ' ')}│`);
    console.log('└─────────────────────────────────────────────────────┘');
    console.log('');
    console.log('📁 التقارير:');
    console.log('   → reports/projects/dashboard.json');
    console.log('   → reports/projects/summary.json');
    console.log('   → data/projects/registry.json');
    console.log('');
    console.log('✅ محرك إدارة المشاريع جاهز.');
}

main().catch(err => {
    console.error(`❌ خطأ: ${err.message}`);
    process.exitCode = 1;
});
