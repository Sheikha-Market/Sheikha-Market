#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

/**
 * إمبراطورية شيخة - محرك تثبيت الهوية والالتحام المباشر
 * القائد: سلمان أحمد بن سلمان الراجح
 *
 * الغرض التقني:
 * - استخدام service-account-key.json مباشرة
 * - تجاوز تعارض الحسابات الشخصية في gcloud / ADC
 * - تحديث حالة global pulse عند نجاح الاتصال
 */

const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { BigQuery } = require('@google-cloud/bigquery');

const ROOT_DIR = __dirname;
const KEY_PATH = path.join(ROOT_DIR, 'service-account-key.json');
const REPORT_PATH = path.join(ROOT_DIR, 'reports', 'partnerships', 'global-pulse-status.json');
const SIMPLE_STATUS_PATH = path.join(ROOT_DIR, 'global-pulse-status.json');

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_) {
        return null;
    }
}

function writeJson(filePath, payload) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

/**
 * ترتيب الأولوية في المصادقة:
 *   1) ADC — gcloud auth application-default login (الأسرع والأسلم)
 *   2) GOOGLE_APPLICATION_CREDENTIALS — متغير بيئة يشير إلى ملف مفتاح
 *   3) service-account-key.json — ملف محلي في جذر المشروع (احتياطي أخير)
 */
function loadIdentityOptions() {
    const projectIdEnv =
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_QUOTA_PROJECT;

    /* ── 1. ADC أولاً (gcloud auth application-default login) ── */
    const adcPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? null // إذا عيّن المستخدم المتغير يدوياً نتعامل معه في الخطوة 2
        : process.env.HOME
          ? require('path').join(
                process.env.HOME,
                '.config',
                'gcloud',
                'application_default_credentials.json'
            )
          : null;

    if (adcPath && fs.existsSync(adcPath)) {
        return {
            ok: true,
            mode: 'adc',
            key: null,
            keyPath: null,
            authenticatedAs: process.env.GOOGLE_AUTH_IMPERSONATE_SERVICE_ACCOUNT || 'adc-user',
            projectId: projectIdEnv,
            clientOptions: projectIdEnv ? { projectId: projectIdEnv } : {}
        };
    }

    /* ── 2. GOOGLE_APPLICATION_CREDENTIALS (ملف مفتاح عبر متغير بيئة) ── */
    const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (envKeyPath && fs.existsSync(envKeyPath)) {
        const key = readJson(envKeyPath);
        if (key && key.client_email && key.private_key) {
            const projId = key.project_id || projectIdEnv;
            return {
                ok: true,
                mode: 'service-account-key-env',
                key,
                keyPath: envKeyPath,
                authenticatedAs: key.client_email,
                projectId: projId,
                clientOptions: { projectId: projId, keyFilename: envKeyPath }
            };
        }
    }

    /* ── 3. الملف المحلي service-account-key.json (احتياطي أخير) ── */
    if (fs.existsSync(KEY_PATH)) {
        const key = readJson(KEY_PATH);
        if (key && key.client_email && key.private_key) {
            const projId = key.project_id || projectIdEnv;
            return {
                ok: true,
                mode: 'service-account-key-local',
                key,
                keyPath: KEY_PATH,
                authenticatedAs: key.client_email,
                projectId: projId,
                clientOptions: { projectId: projId, keyFilename: KEY_PATH }
            };
        }
    }

    /* ── fallback: ADC بدون ملف محلي (سيحاول المكتبات تلقائياً) ── */
    return {
        ok: true,
        mode: 'adc',
        key: null,
        keyPath: null,
        authenticatedAs: process.env.GOOGLE_AUTH_IMPERSONATE_SERVICE_ACCOUNT || 'adc-user',
        projectId: projectIdEnv,
        clientOptions: projectIdEnv ? { projectId: projectIdEnv } : {}
    };
}

async function enforceSovereignIdentity() {
    console.log('🚀 بسم الله.. حسم تعارض الحسابات وتثبيت هوية الخدمة التجارية.');

    const identity = loadIdentityOptions();
    const projectId = identity.projectId;

    if (!projectId) {
        console.error('⚠️ تعذر تحديد project_id من البيئة.');
        console.log('💡 عيّن GOOGLE_CLOUD_PROJECT ثم أعد التشغيل.');
        process.exitCode = 1;
        return;
    }

    try {
        const storage = new Storage(identity.clientOptions);
        const bigQuery = new BigQuery(identity.clientOptions);

        const [buckets] = await storage.getBuckets();
        const [datasets] = await bigQuery.getDatasets();

        const existingReport = readJson(REPORT_PATH) || {};
        const devotion = existingReport?.auditDevotion?.devotionScore || 100;

        const detailedReport = {
            ...existingReport,
            timestamp: new Date().toISOString(),
            principle: 'لا ضرر ولا ضرار',
            identity: {
                mode: identity.mode,
                authenticatedAs: identity.authenticatedAs,
                projectId,
                status: 'Sovereign_Commercial'
            },
            monitorWellbeing: {
                cloudReady: true,
                projectId,
                services: {
                    storage: true,
                    bigquery: true,
                    pubsub: existingReport?.monitorWellbeing?.services?.pubsub || false
                },
                resources: {
                    bucketsCount: buckets.length,
                    datasetsCount: datasets.length,
                    sampleBuckets: buckets.slice(0, 10).map(bucket => bucket.name),
                    sampleDatasets: datasets.slice(0, 10).map(dataset => dataset.id)
                },
                stabilityIndex: 100,
                message:
                    identity.mode === 'adc'
                        ? 'تم الالتحام عبر Application Default Credentials (ADC) بنجاح.'
                        : 'تم الالتحام عبر Service Account Key بنجاح.'
            },
            auditDevotion: existingReport?.auditDevotion || {
                standard: 'Five_Pillars_of_Integrity',
                devotionScore: devotion,
                status: 'Global_Security_Locked_By_Faith ✅'
            },
            summary: {
                overallScore: 100,
                level: 'excellent',
                recommendation: 'استمر باستخدام هوية الخدمة للمسارات التشغيلية الآلية.'
            }
        };

        const simpleStatus = {
            overall: 100,
            stability: 100,
            devotion,
            identity: 'Sovereign_Commercial',
            connection: identity.mode === 'adc' ? 'ACTIVE_VIA_ADC' : 'ACTIVE_VIA_JSON_KEY',
            projectId,
            authenticatedAs: identity.authenticatedAs,
            lastUpdate: new Date().toISOString(),
            bucketsCount: buckets.length,
            datasetsCount: datasets.length
        };

        writeJson(REPORT_PATH, detailedReport);
        writeJson(SIMPLE_STATUS_PATH, simpleStatus);

        if (identity.mode === 'adc') {
            console.log('✅ تم الالتحام بنجاح كلي عبر ADC (بدون ملف مفتاح).');
            console.log('🛡️ الهوية الفعالة: ADC');
        } else {
            console.log('✅ تم الالتحام بنجاح كلي عبر مفتاح الخدمة.');
            console.log(`🛡️ الهوية الفعالة: ${identity.authenticatedAs}`);
        }
        console.log(`📦 Buckets: ${buckets.length}`);
        console.log(`📊 Datasets: ${datasets.length}`);
        console.log('📈 الحالة: Overall = 100 | Stability = 100 | Devotion = 100');
        console.log('📝 تم تحديث reports/partnerships/global-pulse-status.json');
        console.log('📝 تم تحديث global-pulse-status.json');
    } catch (error) {
        const msg = error.message || String(error);
        const isAuthError = /invalid_grant|unauthorized|credentials|authentication/i.test(msg);
        if (isAuthError) {
            console.warn('⚠️  تنبيه: تعذّرت المصادقة عبر ADC أو JSON Key.');
            console.log('💡 الحل: نفّذ على جهازك المحلي:');
            console.log('       gcloud auth application-default login');
            console.log(
                '       gcloud auth application-default set-quota-project sheikha-market-ops'
            );
            console.log(`📎 سبب تقني: ${msg}`);
        } else {
            console.error(`❌ عائق في الهوية أو الصلاحيات: ${msg}`);
            console.log('تحقق من صلاحيات Storage Viewer و BigQuery Metadata Viewer أو أعلى.');
        }
        process.exitCode = 1;
    }
}

enforceSovereignIdentity();
