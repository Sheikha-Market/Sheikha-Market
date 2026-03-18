#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const path = require('path');

const rootPath = process.cwd();
const dataDir = path.join(rootPath, 'data');
const reportsDir = path.join(rootPath, 'reports', 'partnerships');
const alliancePath = path.join(dataDir, 'microsoft-windows-alliance-plan.json');
const cosmicPath = path.join(dataDir, 'cosmic-enablement-report.json');
const accessCharterPath = path.join(reportsDir, 'microsoft-alliance-access-charter.json');
const monthlyKpiPath = path.join(reportsDir, 'microsoft-alliance-monthly-kpi.json');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_error) {
        return null;
    }
}

function toStatus(current, target) {
    if (current >= target) {
        return 'on-track';
    }

    if (current >= target * 0.75) {
        return 'watch';
    }

    return 'needs-action';
}

function buildAccessCharter(owner, alliance) {
    return {
        timestamp: new Date().toISOString(),
        owner,
        charterId: `MS-ACCESS-${new Date().toISOString().slice(0, 10)}`,
        scope: 'Microsoft/Windows Strategic Partnership Governance',
        policy: {
            leastPrivilege: true,
            separationOfDuties: true,
            mandatoryAuditTrail: true,
            quarterlyAccessReview: true
        },
        roleMatrix: [
            {
                role: 'Alliance Executive Sponsor',
                permissions: ['approve-strategy', 'approve-budget', 'approve-risk-exception'],
                constraints: ['no-direct-secrets-access']
            },
            {
                role: 'Security & Compliance Lead',
                permissions: ['review-access', 'enforce-controls', 'approve-rotation-policy'],
                constraints: ['no-commercial-contract-signature']
            },
            {
                role: 'Platform Integration Lead',
                permissions: ['manage-ci-cd', 'manage-app-center', 'manage-webhook-integration'],
                constraints: ['requires-change-request-ticket']
            },
            {
                role: 'Operations Observer',
                permissions: ['read-kpi-dashboard', 'read-audit-logs'],
                constraints: ['read-only']
            }
        ],
        sharedControls: alliance?.microsoftWindowsPlan?.trustBoundaries || [
            'عدم مشاركة أي أسرار تشغيلية خارج القنوات المعتمدة',
            'توثيق كل صلاحية وصول وفق أقل امتياز',
            'اشتراط المراجعة الدورية للامتثال والأمن'
        ],
        enforcement: {
            incidentEscalationHours: 4,
            keyRotationDays: 90,
            mandatoryMfaForAdmin: true
        }
    };
}

function buildMonthlyKpi(owner, alliance, cosmic) {
    const kpis = alliance?.partnershipAccreditation?.framework?.jointKpis || [];
    const barakahIndex = Number(cosmic?.barakahTracker?.barakahIndex || 0);
    const combinedScore = Number(cosmic?.activationReadiness?.combinedScore || 0);

    const baseline = [
        {
            metric: 'Partnership Reliability Index',
            current: Number(
                kpis.find(x => x.metric === 'Partnership Reliability Index')?.current || 0
            ),
            target: Number(
                kpis.find(x => x.metric === 'Partnership Reliability Index')?.target || 90
            )
        },
        {
            metric: 'Joint Delivery Success Rate',
            current: Number(
                kpis.find(x => x.metric === 'Joint Delivery Success Rate')?.current || 0
            ),
            target: Number(kpis.find(x => x.metric === 'Joint Delivery Success Rate')?.target || 95)
        },
        {
            metric: 'Trusted Collaboration Coverage',
            current: Number(
                kpis.find(x => x.metric === 'Trusted Collaboration Coverage')?.current || 0
            ),
            target: Number(
                kpis.find(x => x.metric === 'Trusted Collaboration Coverage')?.target || 100
            )
        },
        {
            metric: 'Cosmic Combined Score',
            current: combinedScore,
            target: 95
        },
        {
            metric: 'Barakah Field Index',
            current: barakahIndex,
            target: 90
        }
    ];

    return {
        timestamp: new Date().toISOString(),
        owner,
        month: new Date().toISOString().slice(0, 7),
        dashboard: baseline.map(item => ({
            ...item,
            status: toStatus(item.current, item.target),
            gap: Number((item.target - item.current).toFixed(2))
        })),
        summary: {
            onTrack: baseline.filter(item => item.current >= item.target).length,
            total: baseline.length,
            partnershipPower: Number(
                alliance?.partnershipAccreditation?.collaborationPowerScore || 0
            ),
            activationLevel: cosmic?.activationReadiness?.level || 'unknown'
        },
        actions: [
            'اعتماد مراجعة شهرية ثابتة لمؤشرات التحالف.',
            'تدقيق صلاحيات الوصول وإقفال أي صلاحية غير مستخدمة.',
            'مراجعة فجوة الأداء للمؤشرات غير المحققة وإقرار خطة تصحيح.'
        ]
    };
}

function main() {
    ensureDir(reportsDir);

    const alliance = readJson(alliancePath) || {};
    const cosmic = readJson(cosmicPath) || {};

    const owner = cosmic.owner ||
        alliance.owner || {
            name: 'Sheikha Owner',
            auth: 'market@sheikha.top'
        };

    const accessCharter = buildAccessCharter(owner, alliance);
    const monthlyKpi = buildMonthlyKpi(owner, alliance, cosmic);

    fs.writeFileSync(accessCharterPath, JSON.stringify(accessCharter, null, 2));
    fs.writeFileSync(monthlyKpiPath, JSON.stringify(monthlyKpi, null, 2));

    console.log('✅ Microsoft alliance governance generated');
    console.log(`• access-charter: ${path.relative(rootPath, accessCharterPath)}`);
    console.log(`• monthly-kpi: ${path.relative(rootPath, monthlyKpiPath)}`);
    console.log(`• on-track: ${monthlyKpi.summary.onTrack}/${monthlyKpi.summary.total}`);
}

main();
