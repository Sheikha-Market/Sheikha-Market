#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'reports', 'servers');
const OUT_FILE = path.join(OUT_DIR, 'unified-server-covenant-latest.json');

const COVENANT = {
    title: 'ميثاق شيخة لتوحيد الخوادم',
    basis: 'الكتاب والسنة',
    declaration: 'التشغيل داخل البيئة المتاحة فقط، بلا ضرر ولا اعتداء ولا ادعاء تحكم عالمي.',
    principles: [
        { id: 'QS-001', name: 'الأمانة', evidence: 'النساء:58' },
        { id: 'QS-002', name: 'العدل', evidence: 'النحل:90' },
        { id: 'QS-003', name: 'الإتقان', evidence: 'حديث: إن الله يحب إذا عمل أحدكم عملا أن يتقنه' },
        { id: 'QS-004', name: 'لا ضرر', evidence: 'حديث: لا ضرر ولا ضرار' },
        { id: 'QS-005', name: 'الصدق والشفافية', evidence: 'الأحزاب:70' }
    ]
};

const NIYYAH_COVENANT = {
    hadith: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
    source: 'متفق عليه',
    declaration: 'توجيه جميع أعمال التشغيل والتطوير إلى الله ورسوله صلى الله عليه وسلم، التزامًا بالأمانة والعدل والإحسان.',
    operationalIntents: [
        {
            id: 'NIYYAH-001',
            title: 'الإخلاص',
            measure: 'توثيق نية العمل النافع في كل دورة تشغيل شهرية'
        },
        {
            id: 'NIYYAH-002',
            title: 'الإحسان والإتقان',
            measure: 'الحفاظ على جودة تشغيل 100/100 مع تدقيق مستمر'
        },
        {
            id: 'NIYYAH-003',
            title: 'المنفعة العامة',
            measure: 'تقديم خدمة مستقرة وآمنة للمستخدمين بلا ضرر'
        }
    ]
};

const SERVER_CATALOG = [
    {
        code: 'SRV-001',
        name: 'sheikha-api',
        port: 8080,
        role: 'الخادم الرئيسي للمنصة',
        principleId: 'QS-001',
        goalId: 'GOAL-001',
        goal: 'تمكين خدمات المنفعة العامة بشكل موثوق',
        cooperationNeeds: ['SRV-002', 'SRV-003', 'SRV-004', 'SRV-006']
    },
    {
        code: 'SRV-002',
        name: 'sheikha-health-monitor',
        port: 0,
        role: 'مراقبة الصحة والتقارير',
        principleId: 'QS-003',
        goalId: 'GOAL-002',
        goal: 'التحقق المستمر من الجاهزية ورفع الإنذار المبكر',
        cooperationNeeds: ['SRV-001', 'SRV-005']
    },
    {
        code: 'SRV-003',
        name: 'sheikha-bg-guard',
        port: 0,
        role: 'حارس العمليات الخلفية',
        principleId: 'QS-004',
        goalId: 'GOAL-003',
        goal: 'استمرارية المهام الآلية بلا تعارض أو ضرر',
        cooperationNeeds: ['SRV-001', 'SRV-002', 'SRV-005']
    },
    {
        code: 'SRV-004',
        name: 'sheikha-ai-guard',
        port: 0,
        role: 'حارس الأسرار والذكاء',
        principleId: 'QS-001',
        goalId: 'GOAL-004',
        goal: 'حوكمة الذكاء والأسرار بما يحقق الأمانة والعدل',
        cooperationNeeds: ['SRV-001', 'SRV-005', 'SRV-006']
    },
    {
        code: 'SRV-005',
        name: 'sheikha-protection-watch',
        port: 0,
        role: 'مراقبة الحماية المستمرة',
        principleId: 'QS-004',
        goalId: 'GOAL-005',
        goal: 'تقليل المخاطر ومنع الانحراف التشغيلي',
        cooperationNeeds: ['SRV-001', 'SRV-002', 'SRV-003', 'SRV-004']
    },
    {
        code: 'SRV-006',
        name: 'gcloud-adc-watch',
        port: 0,
        role: 'مراقبة اعتماد ADC',
        principleId: 'QS-005',
        goalId: 'GOAL-006',
        goal: 'ضمان اعتماد موثوق وشفاف للخدمات السحابية المصرح بها',
        cooperationNeeds: ['SRV-001', 'SRV-004']
    }
];

const ACTIVATION_FRAMEWORK = {
    technicalMeans: [
        {
            id: 'TECH-001',
            name: 'حوكمة رقمية موحدة',
            description: 'تقارير موحدة + ختم رقمي + تحقق تلقائي لكل دورة تشغيل.'
        },
        {
            id: 'TECH-002',
            name: 'تشغيل موجه بالمهام',
            description: 'تنفيذ مركزي عبر npm/VS Code Tasks مع مراقبة حالة الخوادم.'
        },
        {
            id: 'TECH-003',
            name: 'استدامة ومرونة',
            description: 'PM2 + حراسة الخلفية + إنذار مبكر للحفاظ على الاستمرارية.'
        }
    ],
    partnershipModel: [
        {
            id: 'PARTNER-001',
            type: 'شراكة تشغيل',
            objective: 'تنسيق تشغيل API والمراقبة والحماية ضمن حدود الصلاحيات المصرح بها.'
        },
        {
            id: 'PARTNER-002',
            type: 'شراكة ثقة وتدقيق',
            objective: 'مشاركة أختام التحقق وتقارير السلامة لضمان الشفافية والمساءلة.'
        },
        {
            id: 'PARTNER-003',
            type: 'شراكة منفعة عامة',
            objective: 'ربط الأهداف التقنية بنتائج نافعة للمستخدمين والمجتمع دون ضرر.'
        }
    ]
};

const SHARED_GOALS = [
    { id: 'SG-001', title: 'الاستمرارية', measurableBy: 'نسبة الخوادم النشطة' },
    { id: 'SG-002', title: 'السلامة', measurableBy: 'نتائج الحماية والاختبارات اليومية' },
    { id: 'SG-003', title: 'الشفافية', measurableBy: 'توفر تقارير الختم والتحقق' },
    { id: 'SG-004', title: 'المنفعة العامة', measurableBy: 'استقرار الخدمات الأساسية للمستخدمين' }
];

function cmdSafe(command) {
    try {
        return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
    } catch {
        return '';
    }
}

function detectPortStatus(port) {
    if (!port) {
        return { listening: false, pid: null };
    }
    const pid = cmdSafe(`lsof -ti :${port} | head -1`);
    return { listening: Boolean(pid), pid: pid || null };
}

function detectProcess(name) {
    const pid = cmdSafe(`pgrep -f "${name}" | head -1`);
    return { running: Boolean(pid), pid: pid || null };
}

function detectPm2(name) {
    const out = cmdSafe(`pm2 describe ${name} 2>/dev/null | rg -i "status|online|stopped" || true`);
    if (!out) {
        return 'unknown';
    }
    if (/online/i.test(out)) {
        return 'online';
    }
    if (/stopped|errored/i.test(out)) {
        return 'not-online';
    }
    return 'unknown';
}

function buildServerStatus() {
    return SERVER_CATALOG.map((srv) => {
        const portInfo = detectPortStatus(srv.port);
        const procInfo = detectProcess(srv.name);
        const pm2 = detectPm2(srv.name);

        let state = 'inactive';
        if (srv.port > 0) {
            state = portInfo.listening ? 'active' : 'inactive';
        } else if (procInfo.running || pm2 === 'online') {
            state = 'active';
        }

        return {
            ...srv,
            state,
            portListening: portInfo.listening,
            pid: portInfo.pid || procInfo.pid,
            pm2Status: pm2
        };
    });
}

function buildSummary(servers) {
    const active = servers.filter((s) => s.state === 'active').length;
    const total = servers.length;
    return {
        active,
        total,
        ratio: total > 0 ? Math.round((active / total) * 100) : 0
    };
}

function buildCollaborationMatrix(servers) {
    return servers.map((srv) => ({
        serverCode: srv.code,
        goalId: srv.goalId,
        collaboratesWith: srv.cooperationNeeds,
        cooperationPath: srv.cooperationNeeds.map((peerCode) => ({
            peerCode,
            purpose: `تنسيق ${srv.code} مع ${peerCode} لتحقيق ${srv.goalId}`
        }))
    }));
}

function scoreServerQuality(server) {
    let score = 0;
    const notes = [];
    const hasRuntimeEvidence = Boolean(server.pid) || server.pm2Status === 'online';

    if (server.state === 'active') {
        score += 50;
    } else {
        notes.push('الخادم غير نشط ويحتاج إحياء فوري');
    }

    if (server.pm2Status === 'online' || (server.pm2Status === 'unknown' && hasRuntimeEvidence)) {
        score += 25;
    } else {
        notes.push('حالة PM2 ليست online');
    }

    if (server.port > 0) {
        if (server.portListening) {
            score += 25;
        } else {
            notes.push(`المنفذ ${server.port} غير مستمع`);
        }
    } else if (hasRuntimeEvidence) {
        score += 25;
    } else {
        notes.push('لا يوجد PID واضح للخادم');
    }

    let qualityLevel = 'needs-improvement';
    if (score >= 90) {
        qualityLevel = 'excellent';
    } else if (score >= 70) {
        qualityLevel = 'good';
    }

    return {
        serverCode: server.code,
        serverName: server.name,
        goalId: server.goalId,
        score,
        qualityLevel,
        status: server.state,
        notes
    };
}

function buildQualityAssessment(servers, summary) {
    const perServer = servers.map((srv) => scoreServerQuality(srv));
    const totalScore = perServer.reduce((acc, row) => acc + row.score, 0);
    const averageScore = perServer.length > 0 ? Math.round(totalScore / perServer.length) : 0;

    const qualityGate = {
        reliability: summary.ratio >= 90 ? 'pass' : 'review',
        transparency: 'pass',
        safety: perServer.some((row) => row.qualityLevel === 'needs-improvement') ? 'review' : 'pass'
    };

    const improvementActions = [];
    perServer.forEach((row) => {
        if (row.qualityLevel === 'needs-improvement') {
            improvementActions.push({
                serverCode: row.serverCode,
                priority: 'high',
                action: `رفع جودة ${row.serverName} بإغلاق ملاحظات التشغيل المرتبطة بـ ${row.goalId}`,
                expectedBenefit: 'تحسين الاستمرارية وتقليل التعطل'
            });
        }
    });

    if (improvementActions.length === 0) {
        improvementActions.push({
            serverCode: 'ALL',
            priority: 'medium',
            action: 'الاستمرار على تدقيق يومي للختم والتحقق مع اختبار تعافي أسبوعي',
            expectedBenefit: 'الحفاظ على الجودة ومنع التراجع'
        });
    }

    return {
        averageScore,
        qualityGate,
        perServer,
        improvementActions,
        publicBenefitIndex: Math.round((summary.ratio * 0.6) + (averageScore * 0.4)),
        maqasidAlignment: {
            noHarm: qualityGate.safety,
            trust: qualityGate.transparency,
            continuity: qualityGate.reliability
        }
    };
}

function main() {
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const servers = buildServerStatus();
    const summary = buildSummary(servers);
    const collaborationMatrix = buildCollaborationMatrix(servers);
    const qualityAssessment = buildQualityAssessment(servers, summary);
    const now = new Date().toISOString();

    const report = {
        success: true,
        data: {
            covenant: COVENANT,
            niyyahCovenant: NIYYAH_COVENANT,
            servers,
            summary,
            qualityAssessment,
            sharedGoals: SHARED_GOALS,
            collaborationMatrix,
            activationFramework: ACTIVATION_FRAMEWORK,
            scope: 'local-environment-only'
        },
        message: 'Unified server covenant generated successfully',
        timestamp: now
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 4) + '\n', 'utf8');

    console.log('============================================================');
    console.log('SHEIKHA UNIFIED SERVER COVENANT');
    console.log('============================================================');
    console.log(`Basis      : ${COVENANT.basis}`);
    console.log(`Niyyah     : إلى الله ورسوله - عمل باتباع الحديث`);
    console.log(`Scope      : local-environment-only`);
    console.log(`Active     : ${summary.active}/${summary.total} (${summary.ratio}%)`);
    console.log(`Quality    : ${qualityAssessment.averageScore}/100`);
    console.log(`BenefitIdx : ${qualityAssessment.publicBenefitIndex}/100`);
    console.log(`Report     : ${OUT_FILE}`);
    console.log('============================================================');
}

main();
