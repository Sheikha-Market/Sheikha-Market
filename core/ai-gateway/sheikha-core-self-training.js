'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const confidentiality = require(
    '../../runtime/confidentiality/v1/' +
    'sheikha-confidentiality-gate-v1'
);

const TRAINING_DIR = process.env.SHEIKHA_PRIVATE_TRAINING_DIR ||
    path.join(
        os.homedir(),
        '.local',
        'share',
        'sheikha',
        'private-training-review-v1'
    );
const QUEUE_FILE = path.join(TRAINING_DIR, 'sheikha-core-self-training.ndjson');

const SECRET_PATTERNS = [
    /(api[_-]?key|secret|password|passwd|token|bearer)\s*[:=]\s*["']?[^"'\s]+/gi,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    /\b[A-Za-z0-9_=-]{24,}\.[A-Za-z0-9_=-]{12,}\.[A-Za-z0-9_=-]{12,}\b/g
];

const BLOCKED_TERMS = [
    'riba',
    'ربا',
    'fraud',
    'غش',
    'malware',
    'deepfake',
    'predict unseen',
    'ادعاء الغيب',
    'conscious machine',
    'وعي آلي'
];

function governanceEnvelope() {
    return {
        tawheed: true,
        quranAndSunnahGoverned: true,
        halalScopeOnly: true,
        noRiba: true,
        noFraud: true,
        noHarm: true,
        noGhaybPrediction: true,
        noConsciousnessClaim: true,
        noCreationClaim: true,
        privacy: true,
        humanReviewRequired: true,
        trainingPromotionRequiresApproval: true
    };
}

function redactSensitiveText(value) {
    let text = String(value || '');
    for (const pattern of SECRET_PATTERNS) {
        text = text.replace(pattern, '[REDACTED]');
    }
    return text.slice(0, 24000);
}

function findPolicyFlags(...parts) {
    const text = parts.map((part) => String(part || '').toLowerCase()).join('\n');
    return BLOCKED_TERMS.filter((term) => text.includes(term.toLowerCase()));
}

function normalizeTrainingSample(input = {}) {
    const prompt = redactSensitiveText(input.prompt || input.message || '');
    const output = redactSensitiveText(input.output || input.reply || '');
    const context = input.context && typeof input.context === 'object' ? input.context : {};
    const flags = findPolicyFlags(prompt, output, JSON.stringify(context));
    const id = crypto
        .createHash('sha256')
        .update(`${prompt}\n${output}\n${Date.now()}\n${Math.random()}`)
        .digest('hex')
        .slice(0, 24);

    return {
        id,
        type: 'sheikha-core-chat-sample',
        status: flags.length ? 'blocked_for_review' : 'queued_for_human_review',
        promotion: 'manual-review-required',
        source: input.source || context.source || 'sheikha-core-chat',
        model: input.model || 'Sheikha-Core',
        prompt,
        output,
        context: {
            source: context.source || 'unknown',
            language: context.language || input.language || 'auto',
            mode: context.mode || 'chat',
            codeContextPresent: Boolean(context.codeContext),
            historyCount: Array.isArray(context.history) ? context.history.length : 0
        },
        flags,
        governance: governanceEnvelope(),
        createdAt: new Date().toISOString()
    };
}

function appendJsonLine(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), {
        recursive: true,
        mode: 0o700
    });
    fs.chmodSync(path.dirname(filePath), 0o700);
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

function countSamples() {
    try {
        if (!fs.existsSync(QUEUE_FILE)) {
            return 0;
        }
        return fs.readFileSync(QUEUE_FILE, 'utf8').split('\n').filter(Boolean).length;
    } catch {
        return 0;
    }
}

function buildTrainingResourceBinding(input = {}) {
    const content = JSON.stringify({
        prompt: String(input.prompt || input.message || ''),
        output: String(input.output || input.reply || ''),
        source: String(input.source || 'sheikha-core-chat'),
        model: String(input.model || 'Sheikha-Core')
    });
    const sha256 = crypto
        .createHash('sha256')
        .update(content)
        .digest('hex');

    return {
        resourceId: String(
            input.trainingResourceId ||
            `TRAINING-SAMPLE-${sha256.slice(0, 24)}`
        ),
        sha256
    };
}

function recordSelfTrainingSample(input = {}, options = {}) {
    const binding = buildTrainingResourceBinding(input);
    const trainingDecision =
        confidentiality.evaluateConfidentialityAction(
            {
                action: 'TRAIN_AI',
                resourceId: binding.resourceId,
                resourceSha256: binding.sha256,
                granteeId: input.trainingGranteeId,
                rightsHolderId: input.rightsHolderId,
                purpose: input.trainingPurpose,
                authorization: input.trainingAuthorization
            },
            {
                now: options.now,
                trustedAuthorizationVerification:
                    options.trustedAuthorizationVerification,
                verifiedAuthorizationSha256:
                    options.verifiedAuthorizationSha256,
                verifiedRightsHolderId:
                    options.verifiedRightsHolderId
            }
        );

    if (!trainingDecision.allowed) {
        return {
            success: false,
            status: 'NO_TRAINING_CONFIDENTIAL_BY_DEFAULT',
            record: null,
            stored: false,
            resourceId: binding.resourceId,
            resourceSha256: binding.sha256,
            decision: trainingDecision,
            governance: governanceEnvelope(),
            message:
                'لم تحفظ المحادثة للتدريب؛ يلزم تفويض تدريب منفصل وموقع ومتحقق منه.'
        };
    }

    const sample = normalizeTrainingSample(input);
    const queueFile = options.queueFile || QUEUE_FILE;
    appendJsonLine(queueFile, sample);
    return {
        success: true,
        mode: 'governed-human-reviewed-self-training',
        record: {
            id: sample.id,
            status: sample.status,
            promotion: sample.promotion,
            flags: sample.flags,
            createdAt: sample.createdAt
        },
        queueStorage: 'PRIVATE_DATA_DIR_OUTSIDE_GIT',
        confidentialityDecision: trainingDecision,
        governance: governanceEnvelope(),
        message: 'تم تسجيل عينة تدريب ذاتي محكومة وتحتاج مراجعة بشرية قبل أي ترقية.',
        timestamp: new Date().toISOString()
    };
}

function getSelfTrainingStatus() {
    const queueCount = countSamples();
    return {
        success: true,
        status: 'guarded_default_deny',
        name: 'Sheikha-Core Governed Self-Training',
        mode: 'governed-human-reviewed-self-training',
        queueStorage: 'PRIVATE_DATA_DIR_OUTSIDE_GIT',
        queueCount,
        recentMetadataExposed: false,
        automaticChatCapture: false,
        customerDataTrainingAllowedByDefault: false,
        legacyQueueRequiresPrivacyReview: queueCount > 0,
        lifecycle: [
            'separate-signed-training-opt-in',
            'privacy-redaction',
            'sharia-policy-check',
            'human-review',
            'approved-dataset-export',
            'manual-model-training'
        ],
        governance: governanceEnvelope(),
        message: 'التدريب محجوب افتراضيًا. لا تحفظ محادثة إلا بتفويض تدريب منفصل وموقع ومتحقق منه، ولا توجد ترقية تلقائية للنموذج.',
        timestamp: new Date().toISOString()
    };
}

function buildTrainingReviewPlan(input = {}) {
    const target = input.target || 'sheikha-core-self-training.ndjson';
    return {
        success: true,
        status: 'review_required',
        target,
        steps: [
            'مراجعة الخصوصية وحذف أي أسرار أو بيانات شخصية',
            'فحص الالتزام بالكتاب والسنة ومنع الضرر والغش والربا',
            'اعتماد الإنسان للعينة أو رفضها',
            'تصدير العينات المعتمدة فقط إلى dataset مستقل',
            'تشغيل التدريب اليدوي أو RAG بعد الاعتماد'
        ],
        blockedAutomation: [
            'لا ترقية تلقائية للنموذج من الشات مباشرة',
            'لا استخدام لبيانات حساسة أو غير مأذونة',
            'لا نشر أو دفع تغييرات بدون مراجعة'
        ],
        governance: governanceEnvelope(),
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    recordSelfTrainingSample,
    getSelfTrainingStatus,
    buildTrainingReviewPlan,
    normalizeTrainingSample,
    buildTrainingResourceBinding,
    governanceEnvelope
};
