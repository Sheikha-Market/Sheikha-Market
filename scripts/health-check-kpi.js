#!/usr/bin/env node
'use strict';

/**
 * شيخة — مراقبة يومية للصحة والـ KPI
 * ════════════════════════════════════════════════════════
 *
 * يعمل مرة في اليوم عبر PM2 cron (أو يُشغَّل يدوياً):
 *
 *   1. التحقق من اتصال Google Cloud (Storage + BigQuery)
 *   2. قراءة حالة BigQuery datasets + table counts
 *   3. قراءة لوحة المشاريع الأخيرة
 *   4. كتابة لقطة KPI في reports/operations/kpi-snapshots/
 *   5. تحديث health-check-latest.json
 *   6. إدراج سجل في BigQuery (sheikha_analytics.kpi_snapshots) إذا أمكن
 *
 * الاستخدام:
 *   node scripts/health-check-kpi.js
 *   node scripts/health-check-kpi.js --verbose
 *   node scripts/health-check-kpi.js --dry-run   (لا يكتب في BigQuery)
 * ════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations', 'kpi-snapshots');
const LATEST_PATH = path.join(ROOT_DIR, 'reports', 'operations', 'health-check-latest.json');
const DASHBOARD_PATH = path.join(ROOT_DIR, 'reports', 'projects', 'dashboard.json');
const PULSE_PATH = path.join(ROOT_DIR, 'global-pulse-status.json');
const BOT_WELLBEING_PATH = path.join(
    ROOT_DIR,
    'reports',
    'operations',
    'bot-wellbeing',
    'bot-wellbeing-latest.json'
);
const SAFETY_OPS_PATH = path.join(
    ROOT_DIR,
    'reports',
    'operations',
    'safety',
    'safety-operations-latest.json'
);

const PROJECT_ID =
    process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'sheikha-market-ops';
const VERBOSE = process.argv.includes('--verbose');
const DRY_RUN = process.argv.includes('--dry-run');

/* ─── أدوات مساعدة ─────────────────────────────────── */

function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}
function info(msg) {
    if (VERBOSE) log(`ℹ️  ${msg}`);
}
function ok(msg) {
    log(`✅ ${msg}`);
}
function warn(msg) {
    log(`⚠️  ${msg}`);
}
function fail(msg) {
    log(`❌ ${msg}`);
}

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

function writeJson(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/* ─── بناء عميل Google Cloud بنفس منطق ADC → ENV → Local ── */

function buildClients() {
    const keyPath = path.join(ROOT_DIR, 'service-account-key.json');
    const envKey = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const adcFile = path.join(
        os.homedir(),
        '.config',
        'gcloud',
        'application_default_credentials.json'
    );

    try {
        const { Storage } = require('@google-cloud/storage');
        const { BigQuery } = require('@google-cloud/bigquery');

        /* 1. ADC (أولوية قصوى) */
        if (!envKey && fs.existsSync(adcFile)) {
            info('استخدام ADC للمصادقة');
            const opts = { projectId: PROJECT_ID };
            return { mode: 'adc', storage: new Storage(opts), bigQuery: new BigQuery(opts) };
        }

        /* 2. متغير البيئة */
        if (envKey && fs.existsSync(envKey)) {
            info(`استخدام JSON Key من ENV: ${envKey}`);
            return {
                mode: 'json-key-env',
                storage: new Storage({ keyFilename: envKey }),
                bigQuery: new BigQuery({ keyFilename: envKey })
            };
        }

        /* 3. الملف المحلي */
        if (fs.existsSync(keyPath)) {
            info('استخدام service-account-key.json المحلي');
            return {
                mode: 'json-key-local',
                storage: new Storage({ keyFilename: keyPath }),
                bigQuery: new BigQuery({ keyFilename: keyPath })
            };
        }

        /* 4. Fallback (سيحاول المكتبات تلقائياً) */
        info('fallback: سيحاول SDK تلقائياً');
        const opts = { projectId: PROJECT_ID };
        return { mode: 'adc-fallback', storage: new Storage(opts), bigQuery: new BigQuery(opts) };
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            return { mode: 'offline', storage: null, bigQuery: null };
        }
        throw err;
    }
}

/* ─── فحص Storage ──────────────────────────────────── */

async function checkStorage(storage) {
    if (!storage) {
        return {
            ok: false,
            error: 'offline — مكتبات Google Cloud غير مثبتة',
            bucketsCount: 0,
            buckets: []
        };
    }
    try {
        const [buckets] = await storage.getBuckets();
        ok(`Storage — Buckets: ${buckets.length}`);
        return { ok: true, bucketsCount: buckets.length, buckets: buckets.map(b => b.name) };
    } catch (err) {
        warn(`Storage check فشل: ${err.message}`);
        return { ok: false, error: err.message, bucketsCount: 0, buckets: [] };
    }
}

/* ─── فحص BigQuery ─────────────────────────────────── */

async function checkBigQuery(bq) {
    if (!bq) {
        return { ok: false, error: 'offline', datasetsCount: 0, datasets: [] };
    }
    try {
        const [datasets] = await bq.getDatasets();
        const details = [];
        for (const ds of datasets) {
            try {
                const [tables] = await ds.getTables();
                details.push({
                    id: ds.id,
                    tablesCount: tables.length,
                    tables: tables.map(t => t.id)
                });
                info(`  BigQuery ${ds.id}: ${tables.length} tables`);
            } catch (_) {
                details.push({ id: ds.id, tablesCount: -1 });
            }
        }
        ok(`BigQuery — Datasets: ${datasets.length}`);
        return { ok: true, datasetsCount: datasets.length, datasets: details };
    } catch (err) {
        warn(`BigQuery check فشل: ${err.message}`);
        return { ok: false, error: err.message, datasetsCount: 0, datasets: [] };
    }
}

/* ─── قراءة حالة المشاريع ─────────────────────────── */

function readProjectsState() {
    const dashboard = readJson(DASHBOARD_PATH);
    if (!dashboard) {
        return { ok: false, projects: 0, tasks: 0, avgCompletion: 0 };
    }
    return {
        ok: true,
        projects: dashboard.totalProjects || 0,
        activeProjects: dashboard.activeProjects || 0,
        tasks: dashboard.totalTasks || 0,
        completedTasks: dashboard.completedTasks || 0,
        avgCompletion: dashboard.avgCompletion || 0,
        healthScore: dashboard.totalHealthScore || 0
    };
}

function readBotWellbeingState() {
    const report = readJson(BOT_WELLBEING_PATH);
    if (!report) {
        return {
            ok: false,
            globalStatus: 'unknown',
            averageWellbeingScore: null,
            risk: null
        };
    }

    return {
        ok: true,
        globalStatus: report.summary?.globalStatus || 'unknown',
        averageWellbeingScore: report.summary?.averageWellbeingScore || 0,
        risk: report.summary?.risk || 0,
        watch: report.summary?.watch || 0,
        totalBots: report.summary?.totalBots || 0
    };
}

function readSafetyOpsState() {
    const report = readJson(SAFETY_OPS_PATH);
    if (!report) {
        return {
            ok: false,
            totalMinutes: 0,
            nonGreenFlags: 0,
            patrolsExecuted: 0
        };
    }

    return {
        ok: true,
        totalMinutes: report.summary?.totalMinutes || 0,
        nonGreenFlags: report.summary?.nonGreenFlags || 0,
        patrolsExecuted: report.summary?.patrolsExecuted || 0
    };
}

function readNeuralComparisonState() {
    try {
        const { generateNeuralComparisonReport } = require('./analyze-neural-flow-quality');
        const result = generateNeuralComparisonReport();
        if (!result.ok) {
            return {
                ok: false,
                flowScore: null,
                qualityScore: null,
                balanceIndex: null,
                winner: 'unknown'
            };
        }

        return {
            ok: true,
            flowScore: result.flowScore,
            qualityScore: result.qualityScore,
            balanceIndex: result.balanceIndex,
            winner: result.winner,
            liveAlert: result.balanceIndex < 85 || result.flowScore < 80 || result.qualityScore < 80
                ? 'warning'
                : 'healthy'
        };
    } catch (_) {
        return {
            ok: false,
            flowScore: null,
            qualityScore: null,
            balanceIndex: null,
            winner: 'unknown'
        };
    }
}

/* ─── كتابة لقطة KPI في BigQuery ────────────────────── */

async function insertKpiSnapshot(bq, snapshot) {
    if (!bq || DRY_RUN) {
        info(DRY_RUN ? 'dry-run: تخطي كتابة BigQuery' : 'offline: تخطي كتابة BigQuery');
        return false;
    }
    try {
        const table = bq.dataset('sheikha_analytics').table('kpi_snapshots');
        const [exists] = await table.exists();
        if (!exists) {
            warn('جدول kpi_snapshots غير موجود بعد — تخطي الإدراج');
            return false;
        }
        const row = {
            snapshot_date: new Date().toISOString().split('T')[0],
            overall_score: snapshot.overallScore,
            stability_index: snapshot.stabilityIndex,
            storage_ok: snapshot.storage.ok ? 1 : 0,
            bigquery_ok: snapshot.bigquery.ok ? 1 : 0,
            buckets_count: snapshot.storage.bucketsCount,
            datasets_count: snapshot.bigquery.datasetsCount,
            projects_count: snapshot.projects.projects || 0,
            tasks_count: snapshot.projects.tasks || 0,
            credential_mode: snapshot.credentialMode
        };
        await table.insert([row]);
        ok('تم إدراج لقطة KPI في BigQuery sheikha_analytics.kpi_snapshots');
        return true;
    } catch (err) {
        warn(`فشل إدراج BigQuery: ${err.message}`);
        return false;
    }
}

/* ─── نقطة الدخول الرئيسية ───────────────────────── */

async function main() {
    const startTime = Date.now();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    log('╔══════════════════════════════════════════════════════╗');
    log('║   شيخة — مراقبة يومية: Health Check + KPI Snapshot   ║');
    log(`║   ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' }).padEnd(51)}║`);
    log('╚══════════════════════════════════════════════════════╝');

    /* بناء العملاء */
    let clients;
    try {
        clients = buildClients();
        info(`وضع المصادقة: ${clients.mode}`);
    } catch (err) {
        fail(`تعذّر بناء العملاء: ${err.message}`);
        process.exitCode = 1;
        return;
    }

    /* تنفيذ الفحوصات */
    log('\n🔍 جارٍ فحص Google Cloud...');
    const [storageResult, bqResult] = await Promise.all([
        checkStorage(clients.storage),
        checkBigQuery(clients.bigQuery)
    ]);

    log('\n📋 جارٍ قراءة حالة المشاريع...');
    const projectsState = readProjectsState();
    const wellbeingState = readBotWellbeingState();
    const safetyState = readSafetyOpsState();
    const neuralState = readNeuralComparisonState();
    if (projectsState.ok) {
        ok(
            `المشاريع: ${projectsState.projects} | المهام: ${projectsState.tasks} | الإنجاز: ${projectsState.avgCompletion}%`
        );
    } else {
        warn('لوحة المشاريع غير متوفرة محلياً — نفّذ: npm run ops:projects');
    }

    /* قراءة Pulse الأخير */
    const lastPulse = readJson(PULSE_PATH);

    /* بناء اللقطة */
    const cloudOk = storageResult.ok || bqResult.ok;
    const overallScore = cloudOk ? 100 : 50;
    const snapshot = {
        timestamp: new Date().toISOString(),
        projectId: PROJECT_ID,
        credentialMode: clients.mode,
        overallScore,
        stabilityIndex: cloudOk ? 100 : 70,
        cloud: {
            connected: cloudOk,
            projectId: PROJECT_ID
        },
        storage: storageResult,
        bigquery: bqResult,
        projects: projectsState,
        botWellbeing: wellbeingState,
        safetyOperations: safetyState,
        neuralComparison: neuralState,
        lastPulse: lastPulse
            ? {
                  overall: lastPulse.overall,
                  identity: lastPulse.identity,
                  lastUpdate: lastPulse.lastUpdate
              }
            : null,
        system: {
            hostname: os.hostname(),
            platform: os.platform(),
            nodeVersion: process.version,
            uptimeSeconds: os.uptime(),
            memFreeGB: (os.freemem() / 1024 ** 3).toFixed(2)
        },
        elapsedMs: Date.now() - startTime
    };

    /* حفظ اللقطة */
    const snapshotFile = path.join(REPORTS_DIR, `kpi-${dateStr}.json`);
    writeJson(snapshotFile, snapshot);
    writeJson(LATEST_PATH, snapshot);
    ok(`\nاللقطة محفوظة: reports/operations/kpi-snapshots/kpi-${dateStr}.json`);
    ok(`أحدث نسخة:      reports/operations/health-check-latest.json`);

    /* إدراج في BigQuery */
    log('\n☁️  جارٍ إرسال لقطة KPI إلى BigQuery...');
    await insertKpiSnapshot(clients.bigQuery, snapshot);

    /* طباعة ملخص */
    log('\n┌─────────────────────────────────────────────────────┐');
    log('│                  ملخص الصحة اليومي                │');
    log('├─────────────────────────────────────────────────────┤');
    log(
        `│  Storage:        ${storageResult.ok ? '✅ متصل' : '❌ غير متصل'}${' '.repeat(storageResult.ok ? 33 : 31)}│`
    );
    log(
        `│  BigQuery:       ${bqResult.ok ? '✅ متصل' : '❌ غير متصل'}${' '.repeat(bqResult.ok ? 33 : 31)}│`
    );
    log(`│  Datasets:       ${String(bqResult.datasetsCount).padEnd(36)}│`);
    log(`│  Buckets:        ${String(storageResult.bucketsCount).padEnd(36)}│`);
    log(`│  المشاريع:       ${String(projectsState.projects || 'غ.م').padEnd(36)}│`);
    log(`│  Wellbeing:      ${String((wellbeingState.averageWellbeingScore ?? 'غ.م') + '/100').padEnd(36)}│`);
    log(`│  Safety Flags:   ${String(safetyState.nonGreenFlags ?? 'غ.م').padEnd(36)}│`);
    log(`│  Neural Balance: ${String((neuralState.balanceIndex ?? 'غ.م') + '/100').padEnd(36)}│`);
    log(`│  النقاط الكلية:  ${String(overallScore).padEnd(36)}│`);
    log(`│  وضع المصادقة:   ${clients.mode.padEnd(36)}│`);
    log(
        `│  زمن الفحص:      ${String(Date.now() - startTime) + 'ms'}${' '.repeat(Math.max(0, 35 - String(Date.now() - startTime + 'ms').length))}│`
    );
    log('└─────────────────────────────────────────────────────┘');

    if (!cloudOk) {
        log('\n💡 الاتصال بالسحابة غير كامل. لإعادة التفعيل:');
        log('   gcloud auth application-default login');
        log('   gcloud auth application-default set-quota-project sheikha-market-ops');
    }

    if (neuralState.ok && neuralState.liveAlert === 'warning') {
        log('\n🚨 تنبيه حي: هبوط في توازن التدفقات/الجودة.');
        log(`   flow=${neuralState.flowScore} | quality=${neuralState.qualityScore} | balance=${neuralState.balanceIndex}`);
    }
}

main().catch(err => {
    fail(err.message);
    process.exitCode = 1;
});
