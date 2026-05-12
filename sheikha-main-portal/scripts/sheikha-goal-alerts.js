#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TRACKING_FILE = path.join(DATA_DIR, 'tracking', 'sheikha-goal-progress-latest.json');
const ALERTS_DIR = path.join(DATA_DIR, 'notifications');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function daysUntil(deadline) {
    const end = new Date(`${deadline}T23:59:59Z`).getTime();
    if (!Number.isFinite(end)) {
        return null;
    }
    return Math.floor((end - Date.now()) / (1000 * 60 * 60 * 24));
}

function severityFor(goal, remainingDays) {
    if (goal.progress.status === 'overdue') {
        return 'critical';
    }
    if (goal.progress.status === 'behind' && remainingDays !== null && remainingDays <= 30) {
        return 'high';
    }
    if (goal.progress.status === 'behind') {
        return 'medium';
    }
    if (remainingDays !== null && remainingDays <= 21 && goal.progress.actualPercent < 85) {
        return 'medium';
    }
    return null;
}

function recommendationFor(goal, severity) {
    const base = {
        basis: 'الكتاب والسنة',
        controls: ['العدل', 'الأمانة', 'الإحسان', 'لا ضرر ولا ضرار']
    };

    if (severity === 'critical') {
        return {
            ...base,
            action: 'تصعيد فوري مع خطة إنقاذ 14 يومًا وتخصيص فريق متابعة يومي.'
        };
    }
    if (severity === 'high') {
        return {
            ...base,
            action: 'اجتماع تصحيحي خلال 48 ساعة مع إعادة جدولة المعالم الحرجة.'
        };
    }
    return {
        ...base,
        action: 'تحديث خطة التنفيذ وتحسين الموارد ورفع تقرير أسبوعي حتى الاستقرار.'
    };
}

function buildAlerts(progressPayload) {
    const goals = progressPayload?.data?.goals || [];
    const alerts = [];

    goals.forEach((goal) => {
        const remainingDays = daysUntil(goal.deadline);
        const severity = severityFor(goal, remainingDays);
        if (!severity) {
            return;
        }

        alerts.push({
            id: `ALERT-${goal.goalId}`,
            severity,
            goalId: goal.goalId,
            goalTitle: goal.title,
            owner: goal.owner,
            layer: goal.layer,
            deadline: goal.deadline,
            remainingDays,
            actualProgress: goal.progress.actualPercent,
            expectedProgress: goal.progress.expectedPercent,
            gapPercent: goal.progress.gapPercent,
            status: goal.progress.status,
            shariaGuidance: recommendationFor(goal, severity),
            timestamp: new Date().toISOString()
        });
    });

    return alerts.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2 };
        return (order[a.severity] - order[b.severity]) || (a.remainingDays - b.remainingDays);
    });
}

function main() {
    ensureDir(ALERTS_DIR);
    ensureDir(REPORTS_DIR);

    const progressPayload = readJson(TRACKING_FILE);
    if (!progressPayload) {
        console.error('Progress tracking file not found. Run ops:goals:track first.');
        process.exit(1);
    }

    const alerts = buildAlerts(progressPayload);
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10);

    const payload = {
        success: true,
        data: {
            generatedAt: now.toISOString(),
            covenant: {
                basis: 'الكتاب والسنة',
                declaration: 'التنبيه المبكر أمانة إدارية لمنع التأخير وتحقيق المصلحة العامة.'
            },
            totals: {
                all: alerts.length,
                critical: alerts.filter((a) => a.severity === 'critical').length,
                high: alerts.filter((a) => a.severity === 'high').length,
                medium: alerts.filter((a) => a.severity === 'medium').length
            },
            alerts
        },
        message: 'تم توليد تنبيهات الأهداف المتأخرة والمعرضة للتأخير',
        timestamp: now.toISOString()
    };

    const latestPath = path.join(ALERTS_DIR, 'sheikha-goal-alerts-latest.json');
    const datedPath = path.join(ALERTS_DIR, `sheikha-goal-alerts-${dateStamp}.json`);
    const reportPath = path.join(REPORTS_DIR, 'sheikha-goal-alerts-report.json');

    fs.writeFileSync(latestPath, JSON.stringify(payload, null, 4), 'utf8');
    fs.writeFileSync(datedPath, JSON.stringify(payload, null, 4), 'utf8');
    fs.writeFileSync(reportPath, JSON.stringify(payload, null, 4), 'utf8');

    console.log(`Alerts written          : ${latestPath}`);
    console.log(`Total alerts            : ${payload.data.totals.all}`);
    console.log(`Critical/High/Medium    : ${payload.data.totals.critical}/${payload.data.totals.high}/${payload.data.totals.medium}`);
}

main();
