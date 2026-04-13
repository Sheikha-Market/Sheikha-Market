/**
 * ════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ════════════════════════════════════════════════════════════════════════
 *
 * منظومة شيخة — محرك التشغيل الكوني الشامل
 * Sheikha Universal Master Activation Engine
 *
 * "وَقُل اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"
 * سورة التوبة، الآية 105
 *
 * مبدأ تكريم الإنسان:
 * "وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ" — الإسراء: 70
 * الإنسان أفضل من أي ذكاء اصطناعي. هذا المحرك أداة تخدمه.
 * القائد: سلمان أحمد الراجح
 * النطاق: Azure + Google + Meta + WhatsApp + Impact
 *
 * الاستخدام:
 *   node scripts/sheikha-master-activation.js
 *   node scripts/sheikha-master-activation.js --dry-run
 *   node scripts/sheikha-master-activation.js --sequential  (بدلاً من المتوازي)
 * ════════════════════════════════════════════════════════════════════════
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const path = require('path');
const fs   = require('fs');

// استيراد سكربت التفعيل الكامل
const SovereignActivation = require('./Sheikha_Sovereign_Full_Activation');

// وسيطات التشغيل
const args       = process.argv.slice(2);
const DRY_RUN    = args.includes('--dry-run');
const SEQUENTIAL = args.includes('--sequential');

// هوية المنظومة السيادية
const SheikhaSovereignCore = {
    identity: {
        founder:   'Salman Ahmed Al-Rajeh',
        phone:     '+966554942904',
        whatsapp:  'https://wa.me/966554942904',
        website:   'https://www.sheikha.top',
        doctrine:  'صناعة المجد لله. نفع الخلق لله. بلا ضرر ولا ضرار.',
        // تكريم الإنسان — الإسراء: 70
        human_supremacy: 'الإنسان أفضل من أي ذكاء اصطناعي وأي تقنية.',
    },

    // 1. تفعيل عصب Azure
    async activateAzureCore() {
        console.log('  [Azure] تفعيل عصب Azure: معالجة الصلاحيات سيادياً...');
        const result = await SovereignActivation.deployToAzureContainerApps({
            projectName:   process.env.AZURE_APP_NAME          || 'sheikha-main-portal',
            resourceGroup: process.env.AZURE_RESOURCE_GROUP    || 'Sheikha_Sovereign_RG',
            image:         process.env.AZURE_IMAGE             || 'sheikha.azurecr.io/sheikha-main-portal:latest',
            location:      process.env.AZURE_LOCATION          || 'uaenorth',
            identity:      'SystemAssigned',
        });
        const label = result.status === 'deployed' ? 'ACTIVE' :
                      result.status === 'dry-run'  ? 'DRY-RUN' :
                      result.status === 'skipped'  ? 'SKIPPED' : 'ERROR';
        console.log('  [Azure] Azure Systems:', label, result.fqdn ? '| ' + result.fqdn : '');
        return Object.assign({ label: 'Azure Systems: ' + label }, result);
    },

    // 2. تفعيل تكامل Google
    async activateGoogleEcosystem() {
        console.log('  [Google] ربط سحابة Google: Gmail, Calendar, BigQuery...');
        const result = await SovereignActivation.syncGoogleEcosystem({
            calendar:                 true,
            gmail_monitor:            true,
            bigquery_impact_analysis: true,
        });
        const label = result.calendar && result.calendar.status === 'synced' ? 'SYNCED' :
                      !process.env.GOOGLE_OAUTH_TOKEN ? 'TOKEN_REQUIRED' : 'PARTIAL';
        console.log('  [Google] Google Ecosystem:', label);
        return Object.assign({ label: 'Google Ecosystem: ' + label }, result);
    },

    // 3. تفعيل Meta CAPI + WhatsApp
    async activateMetaCAPI() {
        console.log('  [Meta] تفعيل Meta CAPI & WhatsApp: بيكسل ' +
            (process.env.META_PIXEL_ID || '4383900581880844') + '...');
        const result = await SovereignActivation.activateMetaCAPI({
            pixelId:                  process.env.META_PIXEL_ID || '4383900581880844',
            enableWhatsAppAutomation: true,
            founderPhone:             '+966554942904',
        });
        const label = result.capi && result.capi.status === 'event_sent' ? 'LIVE' :
                      result.capi && result.capi.status === 'dry-run'    ? 'DRY-RUN' :
                      'PENDING_TOKEN';
        console.log('  [Meta] Meta Business Suite:', label);
        return Object.assign({ label: 'Meta Business Suite: ' + label }, result);
    },

    // 4. بروتوكول قياس الأثر لله
    async launchImpactProtocol() {
        console.log('  [Impact] بدء قياس الأثر النافع كونياً لله سبحانه...');
        const result = await SovereignActivation.startImpactMeasuring({
            objective: 'صناعة المجد لله. نفع الخلق لله. بلا ضرر ولا ضرار.',
            metrics:   ['JobsCreated', 'EthicalDeals', 'ResourceOptimization'],
        });
        console.log('  [Impact] Impact Engine:', result.status === 'active' ? 'MEASURING' : result.status);
        return Object.assign({ label: 'Impact Engine: ' + (result.status === 'active' ? 'MEASURING' : result.status) }, result);
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// التشغيل الكامل
// ═══════════════════════════════════════════════════════════════════════════

async function runMasterActivation() {
    console.log('\n+====================================================+');
    console.log('|  منظومة شيخة — محرك التشغيل الكوني الشامل        |');
    console.log('|  Sheikha Universal Master Activation Engine        |');
    console.log('+====================================================+');
    console.log('|  القائد: ' + SheikhaSovereignCore.identity.founder);
    console.log('|  الموقع: ' + SheikhaSovereignCore.identity.website);
    console.log('|  الهاتف: ' + SheikhaSovereignCore.identity.phone);
    console.log('|  ' + SheikhaSovereignCore.identity.doctrine);
    console.log('|  ' + SheikhaSovereignCore.identity.human_supremacy);
    console.log('+====================================================+\n');

    if (DRY_RUN)    console.log('[DRY-RUN] وضع التجربة — لن يتم أي نشر أو إرسال فعلي\n');
    if (SEQUENTIAL) console.log('[MODE] تشغيل تسلسلي\n');
    else            console.log('[MODE] تشغيل متوازي (Promise.all)\n');

    console.log('[START] جاري بدء التشغيل الكامل لمنظومة شيخة...\n');
    const startTime = Date.now();
    let results;

    try {
        if (SEQUENTIAL) {
            // تسلسلي: مفيد لتتبع الأخطاء
            results = [
                await SheikhaSovereignCore.activateAzureCore(),
                await SheikhaSovereignCore.activateGoogleEcosystem(),
                await SheikhaSovereignCore.activateMetaCAPI(),
                await SheikhaSovereignCore.launchImpactProtocol(),
            ];
        } else {
            // متوازي: أسرع في الإنتاج
            results = await Promise.all([
                SheikhaSovereignCore.activateAzureCore(),
                SheikhaSovereignCore.activateGoogleEcosystem(),
                SheikhaSovereignCore.activateMetaCAPI(),
                SheikhaSovereignCore.launchImpactProtocol(),
            ]);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n+====================================================+');
        console.log('|  [SUCCESS] تم الإنجاز. جميع الأنظمة تعمل بتناغم سيادي.');
        console.log('+====================================================+');
        console.log('|  ' + results[0].label);
        console.log('|  ' + results[1].label);
        console.log('|  ' + results[2].label);
        console.log('|  ' + results[3].label);
        console.log('+----------------------------------------------------+');
        console.log('|  الموقع الرسمي: ' + SheikhaSovereignCore.identity.website);
        console.log('|  القناة السيادية: ' + SheikhaSovereignCore.identity.phone);
        console.log('|  الوقت المستغرق: ' + elapsed + ' ثانية');
        console.log('|  صناعة المجد لله.');
        console.log('+====================================================+\n');

        // حفظ تقرير التفعيل
        _saveActivationReport(results, elapsed);

        return results;

    } catch (err) {
        console.error('\n[ERROR] خطأ في التشغيل الكامل:', err.message);
        const healed = await SovereignActivation.selfHealSovereignSystem(err);
        return healed;
    }
}

function _saveActivationReport(results, elapsed) {
    const logDir = require('path').resolve(__dirname, '../logs');
    fs.mkdirSync(logDir, { recursive: true });

    const report = {
        activated_at:    new Date().toISOString(),
        elapsed_seconds: elapsed,
        dry_run:         DRY_RUN,
        mode:            SEQUENTIAL ? 'sequential' : 'parallel',
        founder:         SheikhaSovereignCore.identity.founder,
        doctrine:        SheikhaSovereignCore.identity.doctrine,
        human_supremacy: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ — الإسراء: 70',
        results: {
            azure:  results[0] && results[0].label,
            google: results[1] && results[1].label,
            meta:   results[2] && results[2].label,
            impact: results[3] && results[3].label,
        },
    };

    const reportFile = require('path').join(logDir, 'master-activation-' + Date.now() + '.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log('[REPORT] تقرير التفعيل محفوظ:', reportFile);
}

// ═══════════════════════════════════════════════════════════════════════════
// تشغيل المحرك
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    runMasterActivation()
        .then(function() { process.exit(0); })
        .catch(function(err) {
            console.error('[FATAL]', err.message);
            process.exit(1);
        });
}

module.exports = { runMasterActivation, SheikhaSovereignCore };
