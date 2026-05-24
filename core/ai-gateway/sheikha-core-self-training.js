'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TRAINING_DIR = path.join(ROOT, 'data', 'training');
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

function ensureTrainingDir() {
    fs.mkdirSync(TRAINING_DIR, { recursive: true });
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
    ensureTrainingDir();
    fs.appendFileSync(filePath, `${JSON.stringify(value)}\n`, 'utf8');
}

function readRecentSamples(limit = 5) {
    try {
        if (!fs.existsSync(QUEUE_FILE)) {
            return [];
        }
        const lines = fs.readFileSync(QUEUE_FILE, 'utf8').trim().split('\n').filter(Boolean);
        return lines.slice(-Math.max(1, limit)).map((line) => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(Boolean);
    } catch {
        return [];
    }
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

function recordSelfTrainingSample(input = {}) {
    const sample = normalizeTrainingSample(input);
    appendJsonLine(QUEUE_FILE, sample);
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
        queueFile: path.relative(ROOT, QUEUE_FILE),
        governance: governanceEnvelope(),
        message: 'تم تسجيل عينة تدريب ذاتي محكومة وتحتاج مراجعة بشرية قبل أي ترقية.',
        timestamp: new Date().toISOString()
    };
}

function getSelfTrainingStatus() {
    const recent = readRecentSamples(5);
    return {
        success: true,
        status: 'active',
        name: 'Sheikha-Core Governed Self-Training',
        mode: 'governed-human-reviewed-self-training',
        queueFile: path.relative(ROOT, QUEUE_FILE),
        queueCount: countSamples(),
        recent: recent.map((sample) => ({
            id: sample.id,
            status: sample.status,
            source: sample.source,
            model: sample.model,
            flags: sample.flags,
            createdAt: sample.createdAt
        })),
        lifecycle: [
            'chat-capture',
            'privacy-redaction',
            'sharia-policy-check',
            'human-review',
            'approved-dataset-export',
            'manual-model-training'
        ],
        governance: governanceEnvelope(),
        message: 'التدريب الذاتي مفعل كطابور تعلم محكوم، وليس ترقية تلقائية غير مراجعة للنموذج.',
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
    governanceEnvelope
};
