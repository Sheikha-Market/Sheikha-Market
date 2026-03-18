#!/usr/bin/env node
'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       شيخة — محرك إدارة المشاريع المتكامل                  ║
 * ║       Sheikha Integrated Project Management Engine          ║
 * ║                                                              ║
 * ║  المالك: سلمان أحمد بن سلمان الراجح                        ║
 * ║  المبدأ: الإتقان — إن الله يحب إذا عمل أحدكم عملاً أن يتقنه║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * الطبقات:
 *   Layer 1 — تسجيل المشاريع (Projects Registry)
 *   Layer 2 — تتبع المهام (Tasks Tracker)
 *   Layer 3 — قياس الأداء (KPI Engine)
 *   Layer 4 — تزامن Google Cloud (GCloud Sync)
 *   Layer 5 — لوحة التحكم (Dashboard)
 */

const fs = require('fs');
const path = require('path');

/* ─── ثوابت المسارات ──────────────────────────────────────── */
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data', 'projects');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'projects');

/* ─── تهيئة المجلدات ─────────────────────────────────────── */
[DATA_DIR, REPORTS_DIR].forEach(d => {
    if (!fs.existsSync(d)) {
        fs.mkdirSync(d, { recursive: true });
    }
});

/* ─── أدوات مساعدة ──────────────────────────────────────── */
function readJson(p) {
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}

function writeJson(p, data) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function now() {
    return new Date().toISOString();
}

function uuid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ═══════════════════════════════════════════════════════════════
   Layer 1 — تسجيل المشاريع
   ═══════════════════════════════════════════════════════════════ */
const REGISTRY_PATH = path.join(DATA_DIR, 'registry.json');

function loadRegistry() {
    return readJson(REGISTRY_PATH) || { projects: [], updatedAt: now() };
}

function saveRegistry(reg) {
    reg.updatedAt = now();
    writeJson(REGISTRY_PATH, reg);
}

/**
 * تسجيل مشروع جديد أو تحديث موجود
 * @param {Object} projectDef - تعريف المشروع
 */
function registerProject(projectDef) {
    const reg = loadRegistry();
    const existing = reg.projects.findIndex(p => p.id === projectDef.id);

    const project = {
        id: projectDef.id || uuid(),
        nameAr: projectDef.nameAr || projectDef.name,
        nameEn: projectDef.nameEn || projectDef.name,
        type: projectDef.type || 'operational', // operational | strategic | r&d | partnership
        status: projectDef.status || 'active', // active | paused | completed | archived
        priority: projectDef.priority || 'medium', // critical | high | medium | low
        owner: projectDef.owner || 'سلمان الراجح',
        team: projectDef.team || [],
        gcloudProject: projectDef.gcloudProject || null,
        gcloudBucket: projectDef.gcloudBucket || null,
        bqDataset: projectDef.bqDataset || null,
        tags: projectDef.tags || [],
        phases: projectDef.phases || [],
        createdAt: projectDef.createdAt || now(),
        updatedAt: now(),
        kpi: {
            completionRate: 0,
            tasksTotal: 0,
            tasksCompleted: 0,
            tasksPending: 0,
            tasksOverdue: 0,
            cloudSyncStatus: 'pending',
            overallScore: 0
        }
    };

    if (existing >= 0) {
        reg.projects[existing] = { ...reg.projects[existing], ...project };
    } else {
        reg.projects.push(project);
    }

    saveRegistry(reg);
    return project;
}

/* ═══════════════════════════════════════════════════════════════
   Layer 2 — تتبع المهام
   ═══════════════════════════════════════════════════════════════ */
function tasksPath(projectId) {
    return path.join(DATA_DIR, `tasks-${projectId}.json`);
}

function loadTasks(projectId) {
    return readJson(tasksPath(projectId)) || { projectId, tasks: [], updatedAt: now() };
}

function saveTasks(projectId, store) {
    store.updatedAt = now();
    writeJson(tasksPath(projectId), store);
}

function addTask(projectId, taskDef) {
    const store = loadTasks(projectId);
    const task = {
        id: uuid(),
        title: taskDef.title,
        titleAr: taskDef.titleAr || taskDef.title,
        description: taskDef.description || '',
        status: taskDef.status || 'pending', // pending | in-progress | review | done | blocked
        priority: taskDef.priority || 'medium',
        assignee: taskDef.assignee || 'unassigned',
        tags: taskDef.tags || [],
        dueDate: taskDef.dueDate || null,
        phase: taskDef.phase || 1,
        effort: taskDef.effort || 'medium', // low | medium | high
        createdAt: now(),
        updatedAt: now(),
        completedAt: null
    };
    store.tasks.push(task);
    saveTasks(projectId, store);
    return task;
}

function updateTask(projectId, taskId, updates) {
    const store = loadTasks(projectId);
    const idx = store.tasks.findIndex(t => t.id === taskId);
    if (idx < 0) {
        return null;
    }
    store.tasks[idx] = { ...store.tasks[idx], ...updates, updatedAt: now() };
    if (updates.status === 'done') {
        store.tasks[idx].completedAt = now();
    }
    saveTasks(projectId, store);
    return store.tasks[idx];
}

/* ═══════════════════════════════════════════════════════════════
   Layer 3 — محرك KPI
   ═══════════════════════════════════════════════════════════════ */
function computeProjectKPI(projectId) {
    const store = loadTasks(projectId);
    const tasks = store.tasks;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inprogress = tasks.filter(t => t.status === 'in-progress').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const overdue = tasks.filter(t => {
        if (!t.dueDate || t.status === 'done') {
            return false;
        }
        return new Date(t.dueDate) < new Date();
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const healthScore = Math.max(0, completionRate - overdue * 10 - blocked * 5);

    return {
        tasksTotal: total,
        tasksCompleted: completed,
        tasksInProgress: inprogress,
        tasksPending: tasks.filter(t => t.status === 'pending').length,
        tasksBlocked: blocked,
        tasksOverdue: overdue,
        completionRate,
        healthScore,
        overallScore: Math.min(100, healthScore + (inprogress > 0 ? 5 : 0))
    };
}

/* ═══════════════════════════════════════════════════════════════
   Layer 4 — تزامن Google Cloud
   ═══════════════════════════════════════════════════════════════ */
async function syncGCloud(project) {
    const result = {
        projectId: project.id,
        gcloudProject: project.gcloudProject,
        storage: { status: 'skipped', bucketName: project.gcloudBucket },
        bigquery: { status: 'skipped', dataset: project.bqDataset },
        timestamp: now()
    };

    if (!project.gcloudProject) {
        result.storage.status = 'no-gcloud-project';
        result.bigquery.status = 'no-gcloud-project';
        return result;
    }

    try {
        const { Storage } = require('@google-cloud/storage');
        const { BigQuery } = require('@google-cloud/bigquery');

        const opts = { projectId: project.gcloudProject };
        const storage = new Storage(opts);
        const bq = new BigQuery(opts);

        if (project.gcloudBucket) {
            const bucket = storage.bucket(project.gcloudBucket);
            const [exists] = await bucket.exists();
            result.storage.status = exists ? 'exists' : 'not-found';
            result.storage.exists = exists;
        }

        if (project.bqDataset) {
            const ds = bq.dataset(project.bqDataset);
            const [exists] = await ds.exists();
            result.bigquery.status = exists ? 'exists' : 'not-found';
            result.bigquery.exists = exists;
        }

        result.overallCloudStatus = 'connected';
    } catch (err) {
        result.error = err.message;
        result.overallCloudStatus = 'error';
    }

    return result;
}

/* ═══════════════════════════════════════════════════════════════
   Layer 5 — لوحة التحكم الشاملة
   ═══════════════════════════════════════════════════════════════ */
async function generateDashboard({ syncCloud = false } = {}) {
    const reg = loadRegistry();
    const projects = reg.projects;

    const enriched = await Promise.all(
        projects.map(async p => {
            const kpi = computeProjectKPI(p.id);
            const cloud = syncCloud ? await syncGCloud(p) : { overallCloudStatus: 'sync-skipped' };

            return {
                ...p,
                kpi,
                cloudSync: cloud
            };
        })
    );

    /* إحصاءات المنظومة الكاملة */
    const globalStats = {
        totalProjects: enriched.length,
        activeProjects: enriched.filter(p => p.status === 'active').length,
        completedProjects: enriched.filter(p => p.status === 'completed').length,
        criticalProjects: enriched.filter(p => p.priority === 'critical').length,
        totalTasks: enriched.reduce((s, p) => s + p.kpi.tasksTotal, 0),
        completedTasks: enriched.reduce((s, p) => s + p.kpi.tasksCompleted, 0),
        overdueTasksGlobal: enriched.reduce((s, p) => s + p.kpi.tasksOverdue, 0),
        avgCompletionRate:
            enriched.length > 0
                ? Math.round(
                      enriched.reduce((s, p) => s + p.kpi.completionRate, 0) / enriched.length
                  )
                : 0,
        globalHealthScore:
            enriched.length > 0
                ? Math.round(enriched.reduce((s, p) => s + p.kpi.healthScore, 0) / enriched.length)
                : 100
    };

    const dashboard = {
        title: 'شيخة — لوحة إدارة المشاريع',
        generatedAt: now(),
        owner: 'سلمان أحمد بن سلمان الراجح',
        principle: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',
        globalStats,
        projects: enriched
    };

    /* حفظ التقارير */
    const dashPath = path.join(REPORTS_DIR, 'dashboard.json');
    const summPath = path.join(REPORTS_DIR, 'summary.json');

    writeJson(dashPath, dashboard);
    writeJson(summPath, { globalStats, generatedAt: now() });

    return dashboard;
}

/* ═══════════════════════════════════════════════════════════════
   المشاريع الافتراضية — تهيئة المنظومة
   ═══════════════════════════════════════════════════════════════ */
function bootstrapDefaultProjects() {
    const defaults = [
        {
            id: 'sheikha-market-ops',
            nameAr: 'عمليات سوق شيخة',
            nameEn: 'Sheikha Market Operations',
            type: 'operational',
            status: 'active',
            priority: 'critical',
            gcloudProject: 'sheikha-market-ops',
            gcloudBucket: 'sheikha-market-data',
            bqDataset: 'sheikha_market',
            tags: ['cloud', 'market', 'google-cloud'],
            phases: [
                { id: 1, nameAr: 'البنية التحتية', nameEn: 'Infrastructure', status: 'active' },
                { id: 2, nameAr: 'المعالجة', nameEn: 'Processing', status: 'pending' },
                { id: 3, nameAr: 'التحليل', nameEn: 'Analytics', status: 'pending' }
            ]
        },
        {
            id: 'sheikha-portal',
            nameAr: 'بوابة شيخة الرئيسية',
            nameEn: 'Sheikha Main Portal',
            type: 'strategic',
            status: 'active',
            priority: 'critical',
            tags: ['portal', 'web', 'pwa'],
            phases: [
                { id: 1, nameAr: 'البنية الأساسية', nameEn: 'Core', status: 'completed' },
                { id: 2, nameAr: 'الاندماج', nameEn: 'Integration', status: 'active' },
                { id: 3, nameAr: 'الإطلاق', nameEn: 'Launch', status: 'pending' }
            ]
        },
        {
            id: 'sheikha-scrap-market',
            nameAr: 'سوق المعادن والسكراب',
            nameEn: 'Scrap & Metals Market',
            type: 'strategic',
            status: 'active',
            priority: 'high',
            tags: ['market', 'metals', 'scrap', 'halal'],
            phases: [
                { id: 1, nameAr: 'قوائم المنتجات', nameEn: 'Listings', status: 'active' },
                { id: 2, nameAr: 'طلبات الشراء', nameEn: 'RFQ', status: 'active' },
                { id: 3, nameAr: 'مؤشر شيخة', nameEn: 'Index', status: 'active' },
                { id: 4, nameAr: 'المدفوعات', nameEn: 'Payments', status: 'pending' }
            ]
        },
        {
            id: 'sheikha-google-alliance',
            nameAr: 'تحالف Google Cloud',
            nameEn: 'Google Cloud Alliance',
            type: 'partnership',
            status: 'active',
            priority: 'high',
            gcloudProject: 'sheikha-market-ops',
            tags: ['google', 'cloud', 'alliance'],
            phases: [
                { id: 1, nameAr: 'المصادقة', nameEn: 'Auth & Identity', status: 'completed' },
                { id: 2, nameAr: 'الموارد', nameEn: 'Resources', status: 'active' },
                { id: 3, nameAr: 'التحليلات', nameEn: 'Analytics', status: 'pending' }
            ]
        },
        {
            id: 'sheikha-microsoft-alliance',
            nameAr: 'تحالف Microsoft',
            nameEn: 'Microsoft Alliance',
            type: 'partnership',
            status: 'active',
            priority: 'high',
            tags: ['microsoft', 'azure', 'alliance'],
            phases: [
                { id: 1, nameAr: 'الحوكمة', nameEn: 'Governance', status: 'active' },
                { id: 2, nameAr: 'التكامل', nameEn: 'Integration', status: 'pending' }
            ]
        },
        {
            id: 'sheikha-shariah-engine',
            nameAr: 'محرك الشريعة الإسلامية',
            nameEn: 'Shariah Compliance Engine',
            type: 'r&d',
            status: 'active',
            priority: 'critical',
            tags: ['shariah', 'halal', 'compliance'],
            phases: [
                { id: 1, nameAr: 'مرجع الأحكام', nameEn: 'Reference', status: 'active' },
                { id: 2, nameAr: 'حاسبة الزكاة', nameEn: 'Zakat Calc', status: 'active' },
                { id: 3, nameAr: 'الفتوى الذكية', nameEn: 'Smart Fatwa', status: 'pending' }
            ]
        }
    ];

    defaults.forEach(def => registerProject(def));
    return defaults;
}

/* ═══════════════════════════════════════════════════════════════
   المهام الافتراضية لمشروع sheikha-market-ops
   ═══════════════════════════════════════════════════════════════ */
function bootstrapMarketOpsTasks() {
    const projectId = 'sheikha-market-ops';
    const store = loadTasks(projectId);
    if (store.tasks.length > 0) {
        return;
    }

    const tasks = [
        {
            titleAr: 'إنشاء Storage Bucket: sheikha-market-data',
            priority: 'critical',
            status: 'pending',
            phase: 1,
            effort: 'low',
            tags: ['gcloud', 'storage']
        },
        {
            titleAr: 'إنشاء BigQuery Dataset: sheikha_market',
            priority: 'critical',
            status: 'pending',
            phase: 1,
            effort: 'low',
            tags: ['gcloud', 'bigquery']
        },
        {
            titleAr: 'إنشاء جداول BigQuery للمعادن',
            priority: 'high',
            status: 'pending',
            phase: 2,
            effort: 'medium',
            tags: ['bigquery', 'schema']
        },
        {
            titleAr: 'ربط التخزين السحابي بـ server.js',
            priority: 'high',
            status: 'pending',
            phase: 2,
            effort: 'medium',
            tags: ['integration']
        },
        {
            titleAr: 'إعداد Pub/Sub topics للأسعار اللحظية',
            priority: 'medium',
            status: 'pending',
            phase: 2,
            effort: 'medium',
            tags: ['pubsub', 'realtime']
        },
        {
            titleAr: 'تفعيل Cloud Logging',
            priority: 'medium',
            status: 'pending',
            phase: 1,
            effort: 'low',
            tags: ['logging']
        },
        {
            titleAr: 'ربط BigQuery بلوحة تحليلات السوق',
            priority: 'medium',
            status: 'pending',
            phase: 3,
            effort: 'high',
            tags: ['analytics']
        },
        {
            titleAr: 'إعداد تنبيهات Cloud Monitoring',
            priority: 'low',
            status: 'pending',
            phase: 3,
            effort: 'medium',
            tags: ['monitoring']
        }
    ];

    tasks.forEach(t => addTask(projectId, { ...t, title: t.titleAr }));
}

/* ─── نقطة الدخول السريعة ─────────────────────────────────── */
module.exports = {
    registerProject,
    loadRegistry,
    addTask,
    updateTask,
    loadTasks,
    computeProjectKPI,
    syncGCloud,
    generateDashboard,
    bootstrapDefaultProjects,
    bootstrapMarketOpsTasks
};
