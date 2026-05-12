#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_FINAL_DIR = path.join(ROOT_DIR, 'reports', 'final');
const TRACKING_FILE = path.join(DATA_DIR, 'tracking', 'sheikha-goal-progress-latest.json');
const ALERTS_FILE = path.join(DATA_DIR, 'notifications', 'sheikha-goal-alerts-latest.json');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath, fallback = null) {
    if (!fs.existsSync(filePath)) {
        return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function quarterFromDate(date) {
    const month = date.getUTCMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
}

function summarizeByOwner(goals) {
    const map = {};
    goals.forEach((goal) => {
        if (!map[goal.owner]) {
            map[goal.owner] = { owner: goal.owner, goals: 0, avgProgress: 0, behind: 0, overdue: 0 };
        }
        map[goal.owner].goals += 1;
        map[goal.owner].avgProgress += goal.progress.actualPercent;
        if (goal.progress.status === 'behind') map[goal.owner].behind += 1;
        if (goal.progress.status === 'overdue') map[goal.owner].overdue += 1;
    });

    return Object.values(map)
        .map((item) => ({
            ...item,
            avgProgress: Number((item.avgProgress / item.goals).toFixed(2))
        }))
        .sort((a, b) => b.avgProgress - a.avgProgress)
        .slice(0, 20);
}

function topRisks(goals) {
    return goals
        .filter((g) => g.progress.status === 'behind' || g.progress.status === 'overdue')
        .sort((a, b) => a.progress.gapPercent - b.progress.gapPercent)
        .slice(0, 15)
        .map((g) => ({
            goalId: g.goalId,
            title: g.title,
            owner: g.owner,
            layer: g.layer,
            status: g.progress.status,
            gapPercent: g.progress.gapPercent,
            deadline: g.deadline
        }));
}

function main() {
    ensureDir(REPORTS_FINAL_DIR);

    const progressPayload = readJson(TRACKING_FILE);
    if (!progressPayload) {
        console.error('Progress tracking file not found. Run ops:goals:track first.');
        process.exit(1);
    }

    const alertsPayload = readJson(ALERTS_FILE, { data: { totals: { all: 0, critical: 0, high: 0, medium: 0 } } });
    const goals = progressPayload.data.goals || [];

    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7);
    const quarter = quarterFromDate(now);

    const monthlyReport = {
        success: true,
        data: {
            period: {
                yearMonth,
                quarter,
                generatedAt: now.toISOString()
            },
            covenant: {
                basis: 'الكتاب والسنة',
                governance: ['العدل', 'الأمانة', 'المحاسبة', 'تحقيق المصلحة العامة']
            },
            executiveSummary: {
                totalGoals: progressPayload.data.summary.totals.total,
                avgProgress: progressPayload.data.summary.totals.avgProgress,
                completed: progressPayload.data.summary.totals.completed,
                onTrack: progressPayload.data.summary.totals.onTrack,
                behind: progressPayload.data.summary.totals.behind,
                overdue: progressPayload.data.summary.totals.overdue,
                alerts: alertsPayload.data.totals
            },
            byLayer: progressPayload.data.summary.byLayer,
            topPerformers: summarizeByOwner(goals),
            riskRegister: topRisks(goals),
            recommendations: [
                'تخصيص فرق تدخل سريع للأهداف الحرجة خلال 14 يومًا.',
                'رفع دورة المتابعة للأهداف المتأخرة إلى أسبوعية بدل شهرية.',
                'ربط مكافآت التنفيذ بمؤشرات الإنجاز الفعلية المعتمدة.'
            ]
        },
        message: 'تم توليد تقرير الأداء الشهري/الربعي للأهداف',
        timestamp: now.toISOString()
    };

    const monthPath = path.join(REPORTS_FINAL_DIR, `sheikha-goals-performance-monthly-${yearMonth}.json`);
    const quarterPath = path.join(REPORTS_FINAL_DIR, `sheikha-goals-performance-quarterly-${now.getUTCFullYear()}-${quarter}.json`);
    const latestPath = path.join(REPORTS_FINAL_DIR, 'sheikha-goals-performance-latest.json');

    fs.writeFileSync(monthPath, JSON.stringify(monthlyReport, null, 4), 'utf8');
    fs.writeFileSync(quarterPath, JSON.stringify(monthlyReport, null, 4), 'utf8');
    fs.writeFileSync(latestPath, JSON.stringify(monthlyReport, null, 4), 'utf8');

    console.log(`Performance report latest: ${latestPath}`);
    console.log(`Monthly report           : ${monthPath}`);
    console.log(`Quarterly report         : ${quarterPath}`);
}

main();
