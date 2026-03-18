#!/usr/bin/env node
'use strict';

/**
 * شيخة — تزويد موارد Google Cloud
 * ════════════════════════════════════════════════════════
 * ينشئ البنية التحتية السحابية لمشروع sheikha-market-ops:
 *
 *   Storage Buckets:
 *     gs://sheikha-market-data       — بيانات السوق الرئيسية
 *     gs://sheikha-market-reports    — التقارير والتحليلات
 *     gs://sheikha-market-backups    — النسخ الاحتياطية
 *
 *   BigQuery Datasets:
 *     sheikha_market                 — بيانات السوق والمعادن
 *     sheikha_analytics              — التحليلات والمؤشرات
 *     sheikha_operations             — العمليات والسجلات
 *
 * الاستخدام:
 *   node scripts/provision-gcloud-resources.js              (معاينة فقط)
 *   node scripts/provision-gcloud-resources.js --apply      (تطبيق فعلي)
 *   GCLOUD_PROJECT=my-proj node ... --apply                 (مشروع مخصص)
 * ════════════════════════════════════════════════════════
 */

const PROJECT_ID =
    process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'sheikha-market-ops';

/* ─── المناطق المفضلة: ME-CENTRAL2 الرياض → ME-CENTRAL1 → US-CENTRAL1 ─── */
const LOCATION = process.env.GCLOUD_LOCATION || 'ME-CENTRAL2';
const BQ_LOCATION = process.env.GCLOUD_BQ_LOCATION || 'ME-CENTRAL1';
const LOCATION_FALLBACK = ['ME-CENTRAL2', 'ME-CENTRAL1', 'US-CENTRAL1'];
const APPLY = process.argv.includes('--apply');
const SILENT_FAIL = process.env.GCLOUD_SILENT_FALLBACK === 'true';

/* ─── خطة الموارد ─────────────────────────────────────── */
const BUCKETS = [
    {
        name: 'sheikha-market-data',
        purpose: 'بيانات السوق الرئيسية (Listings, Prices, Traders)',
        storageClass: 'STANDARD',
        lifecycle: { age: 365, action: 'NEARLINE' },
        labels: { env: 'production', owner: 'sheikha', type: 'market-data' }
    },
    {
        name: 'sheikha-market-reports',
        purpose: 'تقارير التحليلات والمؤشرات',
        storageClass: 'STANDARD',
        lifecycle: { age: 730, action: 'COLDLINE' },
        labels: { env: 'production', owner: 'sheikha', type: 'reports' }
    },
    {
        name: 'sheikha-market-backups',
        purpose: 'النسخ الاحتياطية اليومية',
        storageClass: 'NEARLINE',
        lifecycle: { age: 90, action: 'DELETE' },
        labels: { env: 'production', owner: 'sheikha', type: 'backups' }
    }
];

const DATASETS = [
    {
        id: 'sheikha_market',
        purpose: 'بيانات سوق المعادن والسكراب',
        tables: [
            { id: 'listings', description: 'قوائم المنتجات والعروض', partitionField: 'created_at' },
            {
                id: 'prices',
                description: 'أسعار المعادن اللحظية والتاريخية',
                partitionField: 'recorded_at'
            },
            {
                id: 'traders',
                description: 'بيانات التجار والشركات',
                partitionField: 'registered_at'
            },
            {
                id: 'transactions',
                description: 'المعاملات والصفقات',
                partitionField: 'transacted_at'
            },
            { id: 'rfq', description: 'طلبات الأسعار (RFQ)', partitionField: 'submitted_at' }
        ]
    },
    {
        id: 'sheikha_analytics',
        purpose: 'مؤشرات التحليلات وKPIs',
        tables: [
            { id: 'market_index', description: 'مؤشر شيخة اليومي', partitionField: 'date' },
            { id: 'user_activity', description: 'نشاط المستخدمين', partitionField: 'event_date' },
            {
                id: 'kpi_snapshots',
                description: 'لقطات KPI الدورية',
                partitionField: 'snapshot_date'
            }
        ]
    },
    {
        id: 'sheikha_operations',
        purpose: 'سجلات العمليات والأنظمة',
        tables: [
            { id: 'audit_log', description: 'سجل التدقيق والأمان', partitionField: 'logged_at' },
            { id: 'api_events', description: 'أحداث API والطلبات', partitionField: 'event_date' },
            { id: 'errors', description: 'سجل الأخطاء والتحذيرات', partitionField: 'occurred_at' }
        ]
    }
];

/* ─── مخطط الجداول (BigQuery Schema) ─────────────────── */
const TABLE_SCHEMAS = {
    listings: [
        { name: 'id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'title_ar', type: 'STRING', mode: 'REQUIRED' },
        { name: 'title_en', type: 'STRING', mode: 'NULLABLE' },
        { name: 'metal_type', type: 'STRING', mode: 'REQUIRED' },
        { name: 'hs_code', type: 'STRING', mode: 'NULLABLE' },
        { name: 'quantity_kg', type: 'FLOAT64', mode: 'NULLABLE' },
        { name: 'price_sar', type: 'FLOAT64', mode: 'NULLABLE' },
        { name: 'trader_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'location_city', type: 'STRING', mode: 'NULLABLE' },
        { name: 'status', type: 'STRING', mode: 'REQUIRED' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ],
    prices: [
        { name: 'id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'metal_type', type: 'STRING', mode: 'REQUIRED' },
        { name: 'price_sar_kg', type: 'FLOAT64', mode: 'REQUIRED' },
        { name: 'price_usd_kg', type: 'FLOAT64', mode: 'NULLABLE' },
        { name: 'source', type: 'STRING', mode: 'NULLABLE' },
        { name: 'recorded_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ],
    market_index: [
        { name: 'date', type: 'DATE', mode: 'REQUIRED' },
        { name: 'index_value', type: 'FLOAT64', mode: 'REQUIRED' },
        { name: 'base_metals', type: 'FLOAT64', mode: 'NULLABLE' },
        { name: 'scrap_grade', type: 'FLOAT64', mode: 'NULLABLE' },
        { name: 'volume_sar', type: 'FLOAT64', mode: 'NULLABLE' },
        { name: 'transactions', type: 'INT64', mode: 'NULLABLE' }
    ]
};

/* ─── دوال التنفيذ ────────────────────────────────────── */
async function provisionBuckets(storage) {
    const results = [];
    for (const def of BUCKETS) {
        const bucket = storage.bucket(def.name);
        try {
            const [exists] = await bucket.exists();
            if (exists) {
                console.log(`   ✅ موجود مسبقًا: gs://${def.name}`);
                results.push({ name: def.name, status: 'already-exists' });
                continue;
            }
            if (!APPLY) {
                console.log(
                    `   📋 سيُنشأ: gs://${def.name} [${def.storageClass}] — ${def.purpose}`
                );
                results.push({ name: def.name, status: 'plan-create' });
                continue;
            }
            let created = false;
            let lastErr;
            for (const loc of LOCATION_FALLBACK) {
                try {
                    await storage.createBucket(def.name, {
                        location: loc,
                        storageClass: def.storageClass,
                        labels: def.labels
                    });
                    console.log(`   🪣 تم إنشاء: gs://${def.name} [${loc}]`);
                    results.push({ name: def.name, status: 'created', location: loc });
                    created = true;
                    break;
                } catch (locErr) {
                    lastErr = locErr;
                    console.warn(
                        `   ↩️  فشل في ${loc}: ${locErr.message.slice(0, 80)} — جارٍ تجربة منطقة بديلة...`
                    );
                }
            }
            if (!created) {
                throw lastErr;
            }
        } catch (err) {
            const msg = err.message || err.toString();
            if (SILENT_FAIL) {
                console.warn(`   ⚠️ تجاوز: ${def.name} — ${msg}`);
                results.push({ name: def.name, status: 'skipped', error: msg });
            } else {
                console.error(`   ❌ فشل: ${def.name} — ${msg}`);
                results.push({ name: def.name, status: 'error', error: msg });
            }
        }
    }
    return results;
}

async function provisionDatasets(bq) {
    const results = [];
    for (const def of DATASETS) {
        const ds = bq.dataset(def.id);
        try {
            const [exists] = await ds.exists();
            if (exists) {
                console.log(`   ✅ موجود مسبقًا: ${def.id}`);
                results.push({ id: def.id, status: 'already-exists' });
            } else if (!APPLY) {
                console.log(`   📋 سيُنشأ: ${def.id} — ${def.purpose}`);
                results.push({ id: def.id, status: 'plan-create' });
            } else {
                await bq.createDataset(def.id, { location: BQ_LOCATION });
                console.log(`   📦 تم إنشاء Dataset: ${def.id}`);
                results.push({ id: def.id, status: 'created' });
            }

            /* إنشاء الجداول */
            for (const tbl of def.tables) {
                await provisionTable(bq, def.id, tbl);
            }
        } catch (err) {
            const msg = err.message || err.toString();
            console.error(`   ❌ فشل Dataset: ${def.id} — ${msg}`);
            results.push({ id: def.id, status: 'error', error: msg });
        }
    }
    return results;
}

async function provisionTable(bq, datasetId, tblDef) {
    if (!APPLY) {
        console.log(`      📋 جدول سيُنشأ: ${datasetId}.${tblDef.id}`);
        return;
    }
    try {
        const schema = TABLE_SCHEMAS[tblDef.id];
        const ds = bq.dataset(datasetId);
        const tbl = ds.table(tblDef.id);
        const [exists] = await tbl.exists();
        if (exists) {
            console.log(`      ✅ جدول موجود: ${datasetId}.${tblDef.id}`);
            return;
        }
        const opts = { description: tblDef.description };
        if (schema) {
            opts.schema = schema;
            opts.timePartitioning = { type: 'DAY', field: tblDef.partitionField };
        }
        await ds.createTable(tblDef.id, opts);
        console.log(`      🗂️  تم إنشاء جدول: ${datasetId}.${tblDef.id}`);
    } catch (err) {
        console.warn(`      ⚠️ تجاوز جدول: ${datasetId}.${tblDef.id} — ${err.message}`);
    }
}

/* ─── حفظ تقرير التزويد ──────────────────────────────── */
function saveReport(buckets, datasets) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, '..', 'reports', 'operations');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const report = {
        title: 'تقرير تزويد Google Cloud Resources',
        timestamp: new Date().toISOString(),
        projectId: PROJECT_ID,
        location: LOCATION,
        applied: APPLY,
        buckets,
        datasets,
        summary: {
            bucketsCreated: buckets.filter(b => b.status === 'created').length,
            datasetsCreated: datasets.filter(d => d.status === 'created').length,
            alreadyExisting: [...buckets, ...datasets].filter(r => r.status === 'already-exists')
                .length,
            errors: [...buckets, ...datasets].filter(r => r.status === 'error').length
        }
    };
    const outPath = path.join(dir, 'gcloud-provision-report.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 التقرير: reports/operations/gcloud-provision-report.json`);
    return report;
}

/* ─── نقطة الدخول ────────────────────────────────────── */
async function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log(`║   شيخة — تزويد موارد Google Cloud                   ║`);
    console.log(`║   المشروع: ${PROJECT_ID.padEnd(42)}║`);
    console.log(`║   الوضع:  ${(APPLY ? 'تطبيق فعلي ✅' : 'معاينة فقط 📋').padEnd(42)}║`);
    console.log('╚══════════════════════════════════════════════════════╝');

    if (!APPLY) {
        console.log('\n💡 لتطبيق التغييرات فعلياً: npm run ops:gcloud:provision:apply\n');
    }

    let buckResults = BUCKETS.map(b => ({ name: b.name, status: 'skipped-no-cloud' }));
    let dsResults = DATASETS.map(d => ({ id: d.id, status: 'skipped-no-cloud' }));

    try {
        const { Storage } = require('@google-cloud/storage');
        const { BigQuery } = require('@google-cloud/bigquery');

        const opts = { projectId: PROJECT_ID };
        const storage = new Storage(opts);
        const bq = new BigQuery(opts);

        console.log('\n🪣 Storage Buckets:');
        buckResults = await provisionBuckets(storage);

        console.log('\n📦 BigQuery Datasets & Tables:');
        dsResults = await provisionDatasets(bq);
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.warn('\n⚠️  مكتبات Google Cloud غير موجودة. تشغيل في وضع التقرير فقط.');
            BUCKETS.forEach(b => console.log(`   📋 Bucket: gs://${b.name}`));
            DATASETS.forEach(d => {
                console.log(`   📋 Dataset: ${d.id}`);
                d.tables.forEach(t => console.log(`      📋 Table: ${d.id}.${t.id}`));
            });
        } else {
            console.error(`\n❌ خطأ: ${err.message}`);
        }
    }

    const report = saveReport(buckResults, dsResults);

    console.log('\n┌─────────────────────────────────────────────────────┐');
    console.log('│                ملخص التزويد                        │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│  Buckets مطلوبة:      ${String(BUCKETS.length).padEnd(30)}│`);
    console.log(`│  Datasets مطلوبة:     ${String(DATASETS.length).padEnd(30)}│`);
    console.log(
        `│  جداول مطلوبة:        ${String(DATASETS.reduce((s, d) => s + d.tables.length, 0)).padEnd(30)}│`
    );
    console.log(
        `│  تم إنشاؤها:          ${String(report.summary.bucketsCreated + report.summary.datasetsCreated).padEnd(30)}│`
    );
    console.log(`│  موجودة مسبقًا:       ${String(report.summary.alreadyExisting).padEnd(30)}│`);
    console.log('└─────────────────────────────────────────────────────┘');

    if (!APPLY) {
        console.log('\nنفّذ على جهازك المحلي:');
        console.log('  export PATH="$HOME/google-cloud-sdk/bin:$PATH"');
        console.log('  cd /home/sheikha/Projects/sheikha/sheikha-main-portal');
        console.log('  export GOOGLE_CLOUD_PROJECT="sheikha-market-ops"');
        console.log('  npm run ops:gcloud:provision:apply');
    }
}

main().catch(err => {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
});
