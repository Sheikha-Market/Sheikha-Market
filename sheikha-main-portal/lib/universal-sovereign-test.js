#!/usr/bin/env node

/**
 * وحدة اختبار المحرك الموحد (Universal Sovereign Test)
 * تتيح الاختبار الكامل بدون الحاجة لملف service-account-key.json
 */

const UniversalSovereign = require('./universal-sovereign-integration');

async function runFullTest() {
    console.log('\n🧪 وحدة اختبار المحرك الموحد\n');
    
    // تشغيل كل محرك على حدة
    try {
        console.log('⏳ جاري تشغيل المحركات للاختبار...\n');
        
        // 1. محرك الحوكمة
        await UniversalSovereign.logisticsGovernanceEngine.activate();
        
        // 2. محرك القضاء على الفقر
        await UniversalSovereign.povertyEradicationEngine.activate();
        
        // 3. محرك السيادة التقنية
        await UniversalSovereign.technicalSovereigntyEngine.activate();
        
        // 4. محرك التجارة الحلال
        await UniversalSovereign.halalTradeEngine.activate();
        
        console.log('\n✅ اجتيازت جميع المحركات الاختبار بنجاح!\n');
        
    } catch (error) {
        console.error('\n❌ خطأ في الاختبار:', error.message);
        process.exit(1);
    }
}

// تشغيل
if (require.main === module) {
    runFullTest();
}

module.exports = runFullTest;
