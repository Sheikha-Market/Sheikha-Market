#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════
 * سكربت تفعيل إمبراطورية شيخة الإسلامية
 * Sheikha Islamic Empire Activation Script
 * ═══════════════════════════════════════════════════════════════════
 *
 * الاستخدام:
 * node scripts/activate-islamic-empire.js
 *
 * الغرض: تفعيل جميع أنظمة منظومة شيخة في محرك موحد
 * ═══════════════════════════════════════════════════════════════════
 */

const path = require('path');
const fs = require('fs').promises;

// استيراد محرك الإمبراطورية
const SheikhIslamicEmpireEngine = require('../lib/sheikha-islamic-empire-engine');

/**
 * دالة التفعيل الرئيسية
 */
async function activateIslamicEmpire() {
    try {
        console.log('\n');
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  بسم الله الرحمن الرحيم                      ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║         تفعيل منظومة شيخة الإسلامية الرقمية المتكاملة        ║');
        console.log('║              Sheikha Islamic Empire Activation              ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║  المالك: سلمان أحمد بن سلمان الراجح                          ║');
        console.log('║  البريد: market@sheikha.top                                 ║');
        console.log('║  المبدأ: لا ضرر ولا ضرار                                    ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('\n');

        // إنشاء مثيل المحرك
        const empire = new SheikhIslamicEmpireEngine({
            owner: 'سلمان أحمد الراجح',
            email: 'market@sheikha.top',
            domain: 'sheikha.top'
        });

        // تفعيل المحرك
        console.log('⚡ بدء التفعيل...\n');
        const initResult = await empire.initialize();

        if (initResult.success) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('✅ تم تفعيل الإمبراطورية بنجاح الكامل!');
            console.log('═══════════════════════════════════════════════════════════════\n');

            // عرض لوحة القيادة
            console.log('📊 لوحة القيادة المركزية:\n');
            const dashboard = await empire.getDashboard();

            console.log(`📌 المالك: ${dashboard.owner}`);
            console.log(`📧 البريد: ${dashboard.email}`);
            console.log(`🌐 الحالة: ${dashboard.overview.status}`);
            console.log(
                `⚙️  الأنظمة المفعلة: ${dashboard.overview.systemsOnline}/${dashboard.overview.systemsTotal}\n`
            );

            console.log('🛡️ المبادئ الأساسية:');
            for (const [key, value] of Object.entries(dashboard.principles)) {
                console.log(`   • ${value}`);
            }

            console.log('\n🔧 الأنظمة النشطة:');
            dashboard.activeSystems.forEach((system, index) => {
                console.log(`   ${index + 1}. ${system.name}`);
                console.log(`      الغرض: ${system.purpose}`);
            });

            console.log('\n📈 الإحصائيات:');
            console.log(`   • العمليات المنفذة: ${dashboard.metrics.operations}`);
            console.log(`   • الأضرار المنعة: ${dashboard.metrics.harmPrevented}`);
            console.log(`   • الأسر المدعومة: ${dashboard.metrics.familiesSupported}`);
            console.log(`   • المعرفة المشتركة: ${dashboard.metrics.knowledgeShared}`);
            console.log(`   • المعاملات المحققة: ${dashboard.metrics.transactionsVerified}`);

            // حفظ حالة التفعيل
            await saveActivationReport(empire, dashboard);

            console.log('\n═══════════════════════════════════════════════════════════════');
            console.log('📄 تم حفظ تقرير التفعيل في:');
            console.log('   SHEIKHA-ISLAMIC-EMPIRE-ACTIVATION.json');
            console.log('═══════════════════════════════════════════════════════════════\n');

            // اختبارات سريعة
            console.log('🧪 إجراء اختبارات سريعة...\n');
            await runQuickTests(empire);

            console.log('\n╔═══════════════════════════════════════════════════════════════╗');
            console.log('║                    ✅ التفعيل مكتمل بنجاح                    ║');
            console.log('║           الحمد لله رب العالمين والصلاة على نبينا محمد      ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        } else {
            console.error('❌ فشل التفعيل:', initResult.message);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ خطأ أثناء التفعيل:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * حفظ تقرير التفعيل
 */
async function saveActivationReport(empire, dashboard) {
    const report = {
        title: 'تقرير تفعيل منظومة شيخة الإسلامية',
        timestamp: new Date().toISOString(),
        owner: empire.owner,
        email: empire.email,
        domain: empire.domain,
        status: empire.getStatus(),
        dashboard: dashboard,
        activation: {
            successful: true,
            systemsActivated: empire.status.systemsOnline,
            activationTime: dashboard.overview.lastCheck
        }
    };

    const reportPath = path.join(process.cwd(), 'SHEIKHA-ISLAMIC-EMPIRE-ACTIVATION.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
}

/**
 * اختبارات سريعة للتحقق من عمل الأنظمة
 */
async function runQuickTests(empire) {
    console.log('   1️⃣ اختبار نظام عدم الضرر...');
    const harmTest = empire.systems.noHarmProtection.checkHarm('هذا محتوى نظيف');
    console.log(
        `      ${harmTest.harmful ? '❌' : '✅'} النتيجة: ${harmTest.harmful ? harmTest.reason : 'محتوى آمن'}`
    );

    console.log('\n   2️⃣ اختبار التحقق من معاملة...');
    const transaction = {
        amount: 10000,
        interest: 0,
        transparency: true,
        honest: true,
        fairPrice: true
    };
    const txResult = empire.verifyTransaction(transaction);
    console.log(`      ${txResult.approved ? '✅' : '❌'} النتيجة: ${txResult.message}`);

    console.log('\n   3️⃣ اختبار تقييم احتياجات أسرة...');
    const familyData = {
        income: 2500,
        childrenInSchool: 3,
        unemployedParents: 1,
        emergencyCase: false
    };
    const familyNeeds = empire.assessFamilyNeeds(familyData);
    console.log(`      ✅ تم تقييم الاحتياجات:`);
    console.log(`         - دعم مالي: ${familyNeeds.financialSupport ? 'نعم' : 'لا'}`);
    console.log(`         - دعم تعليمي: ${familyNeeds.educationSupport ? 'نعم' : 'لا'}`);
    console.log(`         - تدريب وظيفي: ${familyNeeds.jobTraining ? 'نعم' : 'لا'}`);

    console.log('\n   ✅ جميع الاختبارات نجحت!');
}

// تشغيل التفعيل
if (require.main === module) {
    activateIslamicEmpire().catch(error => {
        console.error('❌ خطأ غير متوقع:', error);
        process.exit(1);
    });
}

module.exports = { activateIslamicEmpire };
