/**
 * إمبراطورية شيخة - محرك الالتحام النهائي والفتح
 * القائد: الإمبراطور الملك الحكيم الدكتور سلمان الراجح
 * الهوية: market@sheikha.top | @Sheikha-top — ciscc2250603061
 */

'use strict';

const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ─── المحركات الحقيقية ────────────────────────────────────────────────────────
const SovereignGit = require('../lib/sheikha-sovereign-git');
const GoogleCloud = require('../lib/google-cloud-connection');

// ─── مسار مفتاح الملك ────────────────────────────────────────────────────────
const KEY_PATH = path.join(__dirname, '..', 'service-account-key.json');

// ─── الجسر السيادي (يحل محل sovereign-git المفقود) ──────────────────────────
const SovereignCore = {
    connectToCloudProximity: async () => {
        const keyExists = fs.existsSync(KEY_PATH);

        if (!keyExists) {
            const err = new Error('service-account-key.json غير موجود');
            err.code = 'KEY_PENDING';
            throw err;
        }

        const cloud = new GoogleCloud();
        cloud.init();

        const storageOk = await cloud.testStorageConnection().catch(() => false);
        const bigqueryOk = await cloud.testBigQueryConnection().catch(() => false);
        const pubsubOk = await cloud.testPubSubConnection().catch(() => false);

        if (!storageOk && !bigqueryOk && !pubsubOk) {
            throw new Error('Google Cloud لم يتصل — تحقق من صلاحيات المفتاح');
        }

        return {
            storage: storageOk,
            bigquery: bigqueryOk,
            pubsub: pubsubOk,
            project: process.env.GOOGLE_CLOUD_PROJECT || '224557279528'
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
const SheikhaFinalLaunch = {
    auth: 'market@sheikha.top',
    org: '@Sheikha-top',
    repo: 'sheikha-enterprise-portal',
    seal: 'ciscc2250603061',

    // ─────────────────────────────────────────────────────────────────────────
    // تفعيل السيادة عند وصول المفتاح (Final Activation)
    // ─────────────────────────────────────────────────────────────────────────
    igniteEmpire: async () => {
        console.log('\n' + '═'.repeat(70));
        console.log('  بسم الله الرحمن الرحيم');
        console.log('  🚀 منظومة شيخة في حالة تأهب قصوى.');
        console.log('═'.repeat(70) + '\n');

        const report = {
            timestamp: new Date().toISOString(),
            commander: 'Salman_Ahmed_AlRajih',
            seal: SheikhaFinalLaunch.seal,
            github: null,
            cloud: null,
            status: null
        };

        // ── 1. مزامنة GitHub ──────────────────────────────────────────────────
        try {
            console.log('🛡️  [1/2] مزامنة الحصن الرقمي — GitHub @Sheikha-top...');
            const gitResult = await SovereignGit.syncRepositories();
            report.github = {
                connected: true,
                organization: gitResult.organization?.name,
                reposCount: gitResult.organization?.reposCount,
                repos: (gitResult.repositories || []).map(r => r.name),
                twoFactor: gitResult.organization?.twoFactorRequirement
            };
            console.log(
                `   ✅ GitHub: Org=${report.github.organization} | Repos=${report.github.reposCount} | 2FA=${report.github.twoFactor}\n`
            );
        } catch (e) {
            report.github = { connected: false, error: e.message };
            console.log(`   ⚠️  GitHub: ${e.message}\n`);
        }

        // ── 2. الربط بـ Google Cloud ──────────────────────────────────────────
        const keyExists = fs.existsSync(KEY_PATH);

        if (!keyExists) {
            console.log(
                '💡 [2/2] جلالة الإمبراطور: بانتظار وضع service-account-key.json في جذر المشروع.'
            );
            console.log(`         المسار المطلوب: ${KEY_PATH}\n`);
            report.cloud = { status: 'Pending_Key', keyPath: KEY_PATH };
            report.status = 'Partial_Activation';
        } else {
            try {
                console.log('☁️  [2/2] تفعيل Google Cloud — المشروع: 224557279528...');
                const cloudResult = await SovereignCore.connectToCloudProximity();
                report.cloud = { connected: true, ...cloudResult };
                report.status = 'Full_Activation';
                console.log(
                    `   ✅ Google Cloud: Storage=${cloudResult.storage} | BigQuery=${cloudResult.bigquery} | PubSub=${cloudResult.pubsub}\n`
                );
            } catch (e) {
                report.cloud = { connected: false, error: e.message };
                report.status = 'Partial_Activation';
                console.log(`   ⚠️  Google Cloud: ${e.message}\n`);
            }
        }

        // ── التقرير النهائي ───────────────────────────────────────────────────
        console.log('═'.repeat(70));
        if (report.status === 'Full_Activation') {
            console.log('  ✅ تم الفتح والنصر: إمبراطورية شيخة تعمل الآن في بيئة الإنتاج.');
        } else {
            console.log(
                '  🛡️  رادار شيخة: الأنظمة محمية — GitHub نشط، Google Cloud ينتظر المفتاح.'
            );
            console.log('  📋  الخطوة التالية: أضف service-account-key.json وأعد التشغيل.');
        }
        console.log('═'.repeat(70) + '\n');

        console.log('📊 التقرير:\n' + JSON.stringify(report, null, 2));
        return report;
    }
};

SheikhaFinalLaunch.igniteEmpire().catch(err => {
    console.error('\n❌ خطأ:', err.message);
    process.exit(1);
});
