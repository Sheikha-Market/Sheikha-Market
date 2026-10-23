'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
    recordSelfTrainingSample,
    getSelfTrainingStatus,
    governanceEnvelope
} = require('./sheikha-core-self-training');

const LEARNING_DIR = process.env.SHEIKHA_PRIVATE_TRAINING_DIR ||
    path.join(
        os.homedir(),
        '.local',
        'share',
        'sheikha',
        'private-training-review-v1'
    );
const EVENTS_FILE = path.join(LEARNING_DIR, 'sheikha-continuous-learning.ndjson');
const DAILY_PLAN_FILE = path.join(LEARNING_DIR, 'sheikha-daily-learning-plan.json');
const LOCAL_TIMEZONE = process.env.SHEIKHA_TIMEZONE || 'Asia/Riyadh';

const DOMAINS = [
    {
        id: 'quran-sunnah-governance',
        nameAr: 'الكتاب والسنة والحوكمة',
        cadence: 'always',
        priority: 1,
        gate: 'sharia-human-review'
    },
    {
        id: 'programming-systems',
        nameAr: 'البرمجة والأنظمة',
        cadence: 'hourly',
        priority: 2,
        gate: 'tests-and-review'
    },
    {
        id: 'trade-markets',
        nameAr: 'التجارة والأسواق وسلاسل الإمداد',
        cadence: 'daily',
        priority: 3,
        gate: 'source-and-market-review'
    },
    {
        id: 'technology-news',
        nameAr: 'التقنيات والأخبار',
        cadence: 'daily',
        priority: 4,
        gate: 'trusted-source-required'
    },
    {
        id: 'calendar-history',
        nameAr: 'التقويم والتاريخ والسياق الزمني',
        cadence: 'daily',
        priority: 5,
        gate: 'date-source-check'
    },
    {
        id: 'security-privacy',
        nameAr: 'الأمن والخصوصية',
        cadence: 'always',
        priority: 2,
        gate: 'secret-and-privacy-scan'
    },
    {
        id: 'enterprise-operations',
        nameAr: 'التشغيل المؤسسي والنشر',
        cadence: 'on-change',
        priority: 3,
        gate: 'blueprint-guard-rwp'
    }
];

const SOURCE_REGISTRY = [
    {
        id: 'chat',
        type: 'live',
        nameAr: 'الشات',
        enabled: false,
        trust: 'separate-signed-opt-in-required',
        ingestMode: 'no-capture-by-default'
    },
    {
        id: 'workspace',
        type: 'local',
        nameAr: 'ملفات المشروع',
        enabled: true,
        trust: 'local-repository',
        ingestMode: 'blueprint-guard-first'
    },
    {
        id: 'runtime-signals',
        type: 'local',
        nameAr: 'إشارات التشغيل والفحوص',
        enabled: true,
        trust: 'runtime-health',
        ingestMode: 'status-summary'
    },
    {
        id: 'markets',
        type: 'connector',
        nameAr: 'الأسواق والتجارة',
        enabled: false,
        trust: 'requires-verified-provider',
        ingestMode: 'source-required'
    },
    {
        id: 'news',
        type: 'connector',
        nameAr: 'الأخبار اليومية',
        enabled: false,
        trust: 'requires-citation-and-date',
        ingestMode: 'source-required'
    },
    {
        id: 'calendar-history',
        type: 'connector',
        nameAr: 'التقويم والتاريخ',
        enabled: true,
        trust: 'system-date-and-approved-docs',
        ingestMode: 'date-aware-review'
    }
];

function ensureLearningDir() {
    fs.mkdirSync(LEARNING_DIR, {
        recursive: true,
        mode: 0o700
    });
    fs.chmodSync(LEARNING_DIR, 0o700);
}

function nowIso() {
    return new Date().toISOString();
}

function todayKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: LOCAL_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date).reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day}`;
}

function stableId(parts) {
    return crypto.createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 24);
}

function appendJsonLine(filePath, value) {
    ensureLearningDir();
    fs.appendFileSync(
        filePath,
        `${JSON.stringify(value)}\n`,
        {
            encoding: 'utf8',
            mode: 0o600
        }
    );
    fs.chmodSync(filePath, 0o600);
}

function countJsonLines(filePath) {
    try {
        if (!fs.existsSync(filePath)) return 0;
        return fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean).length;
    } catch {
        return 0;
    }
}

function buildDailyLearningPlan(input = {}) {
    const date = input.date || todayKey();
    const focus = Array.isArray(input.focus) && input.focus.length > 0
        ? input.focus
        : DOMAINS.map((domain) => domain.id);

    const plan = {
        success: true,
        status: 'active',
        name: 'Sheikha Daily Continuous Learning Plan',
        nameAr: 'خطة التعلم اليومي المستمر لشيخة',
        date,
        mode: 'local-first-governed-continuous-learning',
        timezone: LOCAL_TIMEZONE,
        focus,
        schedule: {
            immediate: [
                'عدم تسجيل محادثات Sheikha-Core افتراضيًا',
                'طلب تفويض تدريب منفصل وموقع قبل أي حفظ',
                'فحص الخصوصية والأسرار بعد التفويض وقبل الحفظ',
                'وسم المجال والمصدر والتاريخ'
            ],
            hourly: [
                'مراجعة إشارات التشغيل والاختبارات والحارس المعماري',
                'تلخيص تغييرات البرمجة والأنظمة'
            ],
            daily: [
                'مراجعة الأسواق والتقنيات والأخبار من مصادر موثقة فقط',
                'تحديث التقويم والسياق التاريخي بتاريخ واضح',
                'إنتاج قائمة اعتماد بشرية للعينات المؤهلة'
            ]
        },
        domains: DOMAINS,
        sources: SOURCE_REGISTRY,
        promotionRules: [
            'لا ترقية للنموذج من أي معلومة بلا مراجعة بشرية',
            'لا قبول خبر أو سوق أو سعر بلا مصدر وتاريخ',
            'لا حفظ أسرار أو بيانات شخصية أو مفاتيح',
            'لا اعتماد حكم شرعي بلا إحالة للكتاب والسنة ومراجعة أهل الاختصاص',
            'لا نشر ولا push ولا deploy بلا Blueprint Guard وRWP'
        ],
        governance: governanceEnvelope(),
        timestamp: nowIso()
    };

    ensureLearningDir();
    fs.writeFileSync(
        DAILY_PLAN_FILE,
        `${JSON.stringify(plan, null, 2)}\n`,
        {
            encoding: 'utf8',
            mode: 0o600
        }
    );
    fs.chmodSync(DAILY_PLAN_FILE, 0o600);
    return plan;
}

function normalizeLearningEvent(input = {}) {
    const source = input.source || 'manual';
    const domain = input.domain || 'general';
    const content = String(input.content || input.prompt || input.message || '').slice(0, 24000);
    const evidence = Array.isArray(input.evidence) ? input.evidence : [];
    const requiresSource = ['news', 'technology-news', 'trade-markets', 'markets'].includes(source)
        || ['technology-news', 'trade-markets'].includes(domain);
    const flags = [];

    if (!content.trim()) flags.push('empty-content');
    if (requiresSource && evidence.length === 0) flags.push('source-required');
    if (/api[_-]?key|secret|password|token|bearer|private key/i.test(content)) flags.push('secret-risk');
    if (/ربا|riba|fraud|غش|malware|deepfake|predict unseen|ادعاء الغيب|وعي آلي|conscious machine/i.test(content)) flags.push('policy-review');

    return {
        id: stableId([source, domain, content, nowIso(), Math.random().toString()]),
        type: 'sheikha-continuous-learning-event',
        source,
        domain,
        cadence: input.cadence || 'on-demand',
        status: flags.length ? 'blocked_for_review' : 'queued_for_human_review',
        content,
        evidence,
        metadata: {
            language: input.language || 'auto',
            date: input.date || todayKey(),
            priority: Number(input.priority || 3),
            submittedBy: input.submittedBy || 'system-or-user'
        },
        flags,
        governance: governanceEnvelope(),
        createdAt: nowIso()
    };
}

function ingestLearningEvent(input = {}, options = {}) {
    const event = normalizeLearningEvent(input);

    const training = recordSelfTrainingSample({
        prompt: `Continuous learning event: ${event.domain}`,
        output: event.content,
        source: `continuous-learning:${event.source}`,
        context: {
            source: event.source,
            mode: 'continuous-learning',
            language: event.metadata.language,
            domain: event.domain,
            evidenceCount: event.evidence.length,
            flags: event.flags
        },
        trainingResourceId: input.trainingResourceId,
        trainingGranteeId: input.trainingGranteeId,
        rightsHolderId: input.rightsHolderId,
        trainingPurpose: input.trainingPurpose,
        trainingAuthorization: input.trainingAuthorization
    }, options);

    if (!training.success) {
        return {
            success: false,
            status: training.status,
            stored: false,
            event: null,
            selfTraining: null,
            confidentialityDecision: training.decision,
            governance: governanceEnvelope(),
            message: training.message,
            timestamp: nowIso()
        };
    }

    appendJsonLine(EVENTS_FILE, event);

    return {
        success: true,
        status: event.status,
        event: {
            id: event.id,
            source: event.source,
            domain: event.domain,
            status: event.status,
            flags: event.flags,
            createdAt: event.createdAt
        },
        selfTraining: training.record,
        queueStorage: 'PRIVATE_DATA_DIR_OUTSIDE_GIT',
        governance: governanceEnvelope(),
        message: 'تم إدخال المعرفة في طابور التعلم المستمر المحكوم، وتحتاج مراجعة بشرية قبل أي ترقية.',
        timestamp: nowIso()
    };
}

function runLearningCycle(input = {}) {
    const plan = buildDailyLearningPlan(input);
    const cycleItems = [
        {
            source: 'runtime-signals',
            domain: 'enterprise-operations',
            cadence: 'cycle',
            content: 'Runtime, RWP, Blueprint Guard, and Sheikha-Core chat are monitored as governed learning signals.',
            evidence: [
                { type: 'local-api', ref: '/api/runtime-root/health' },
                { type: 'local-api', ref: '/api/sheikha/read-write-publish/status' },
                { type: 'local-api', ref: '/api/sheikha/core-chat/status' }
            ],
            priority: 2
        },
        {
            source: 'calendar-history',
            domain: 'calendar-history',
            cadence: 'daily',
            content: `Daily learning cycle for ${plan.date}. All date-sensitive knowledge requires explicit source date.`,
            evidence: [
                { type: 'system-date', ref: plan.date }
            ],
            priority: 3
        },
        {
            source: 'chat',
            domain: 'quran-sunnah-governance',
            cadence: 'always',
            content: 'All Sheikha learning remains a tool for analysis and organization. Allah alone is the Creator and Owner; no consciousness, no unseen claim, no independent authority.',
            evidence: [
                { type: 'registry', ref: 'docs/registry/ROOT-SOURCE-OF-TRUTH.md' }
            ],
            priority: 1
        }
    ];

    const decisions = cycleItems.map(
        (item) => ingestLearningEvent(item)
    );
    const ingested = decisions.filter(
        (item) => item.success
    );
    const blocked = decisions.filter(
        (item) => !item.success
    );

    return {
        success: blocked.length === 0,
        status: blocked.length
            ? 'monitoring_no_training'
            : 'authorized_events_queued_for_review',
        name: 'Sheikha Continuous Learning Cycle',
        nameAr: 'دورة التعلم المستمر لشيخة',
        mode: 'instant-and-daily-governed-learning',
        plan,
        ingested: ingested.map((item) => item.event),
        blockedCount: blocked.length,
        queues: {
            continuousLearning: {
                storage: 'PRIVATE_DATA_DIR_OUTSIDE_GIT',
                count: countJsonLines(EVENTS_FILE)
            },
            selfTraining: getSelfTrainingStatus()
        },
        governance: governanceEnvelope(),
        message: blocked.length
            ? 'اكتملت المراقبة دون حفظ بيانات تدريب؛ يلزم تفويض تدريب منفصل وموقع ومتحقق منه.'
            : 'حفظت الأحداث المأذونة في طابور خاص وتحتاج مراجعة بشرية قبل الترقية.',
        timestamp: nowIso()
    };
}

function getContinuousLearningStatus() {
    return {
        success: true,
        status: 'guarded_default_deny',
        name: 'Sheikha Continuous Learning Runtime',
        nameAr: 'تشغيل التعلم المستمر لشيخة',
        mode: 'instant-daily-governed-learning',
        queues: {
            continuousLearning: {
                storage: 'PRIVATE_DATA_DIR_OUTSIDE_GIT',
                count: countJsonLines(EVENTS_FILE),
                recentMetadataExposed: false
            },
            selfTraining: getSelfTrainingStatus()
        },
        domains: DOMAINS,
        sources: SOURCE_REGISTRY,
        dailyPlanStorage: 'PRIVATE_DATA_DIR_OUTSIDE_GIT',
        governance: governanceEnvelope(),
        message: 'التعلم المستمر يراقب ويخطط، لكنه لا يحفظ محادثات أو يدرب نموذجًا دون تفويض مستقل موقع ومتحقق منه.',
        timezone: LOCAL_TIMEZONE,
        timestamp: nowIso()
    };
}

module.exports = {
    getContinuousLearningStatus,
    buildDailyLearningPlan,
    ingestLearningEvent,
    runLearningCycle,
    domains: DOMAINS,
    sources: SOURCE_REGISTRY
};
