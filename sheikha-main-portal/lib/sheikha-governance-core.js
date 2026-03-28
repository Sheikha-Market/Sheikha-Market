const path = require('node:path');

const SHEIKHA_GOVERNANCE_PROFILE = {
    systemName: 'Sheikha Governance Core',
    version: '1.0.0',
    languageBase: 'ar',
    fallbackLanguage: 'en',
    directionBase: 'rtl',
    requiredEncoding: 'utf8',
    ownerAr: 'سلمان أحمد سلمان عبدالعزيز الراجح',
    ownerEn: 'Salman Ahmed Salman Abdulaziz Alrajeh',
    principlesAr: ['الصدق والأمانة في البيانات', 'العدل وعدم الضرر', 'الإتقان والجودة التشغيلية'],
    references: {
        quran: 'العدل والإحسان',
        sunnah: 'لا ضرر ولا ضرار'
    }
};

const RTL_LANGUAGES = new Set(['ar', 'fa', 'ur', 'he']);
const FORBIDDEN_ACTION_TAGS = new Set(['fraud', 'deception', 'harm', 'riba', 'gambling', 'abuse']);

function normalizeLocale(locale) {
    if (!locale || typeof locale !== 'string') {
        return SHEIKHA_GOVERNANCE_PROFILE.languageBase;
    }

    return (
        locale.trim().toLowerCase().replace('_', '-').split('-')[0] ||
        SHEIKHA_GOVERNANCE_PROFILE.languageBase
    );
}

function resolveDirection(locale) {
    const normalized = normalizeLocale(locale);
    return RTL_LANGUAGES.has(normalized) ? 'rtl' : 'ltr';
}

function isUtf8Buffer(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        return false;
    }

    // نتحقق من عدم وجود رمز الاستبدال الناتج عن فك ترميز غير صحيح
    const decoded = buffer.toString('utf8');
    return !decoded.includes('\uFFFD');
}

function assertUtf8Text(input, fieldName = 'input') {
    if (typeof input !== 'string') {
        throw new Error(`Field ${fieldName} must be a string.`);
    }

    const asBuffer = Buffer.from(input, 'utf8');
    if (!isUtf8Buffer(asBuffer)) {
        throw new Error(`Field ${fieldName} is not valid UTF-8 text.`);
    }

    return true;
}

function validatePayloadUtf8(payload, prefix = 'payload') {
    if (payload === null || payload === undefined) {
        return [];
    }

    const issues = [];

    if (typeof payload === 'string') {
        try {
            assertUtf8Text(payload, prefix);
        } catch (error) {
            issues.push(error.message);
        }
        return issues;
    }

    if (Array.isArray(payload)) {
        payload.forEach((item, index) => {
            issues.push(...validatePayloadUtf8(item, `${prefix}[${index}]`));
        });
        return issues;
    }

    if (typeof payload === 'object') {
        Object.entries(payload).forEach(([key, value]) => {
            issues.push(...validatePayloadUtf8(value, `${prefix}.${key}`));
        });
    }

    return issues;
}

function evaluateEthicalAction(action = {}) {
    const tags = Array.isArray(action.tags) ? action.tags : [];
    const blocked = tags.filter(tag => FORBIDDEN_ACTION_TAGS.has(String(tag).toLowerCase()));

    return {
        ok: blocked.length === 0,
        blockedTags: blocked,
        messageAr:
            blocked.length === 0
                ? 'العملية متوافقة مع مبادئ الحوكمة.'
                : 'تم رفض العملية لوجود وسوم غير متوافقة مع مبادئ الحوكمة.'
    };
}

function buildRequestContext({ locale, route = '/', actor = 'system' } = {}) {
    const normalizedLocale = normalizeLocale(locale);

    return {
        actor,
        route,
        locale: normalizedLocale,
        direction: resolveDirection(normalizedLocale),
        languageBase: SHEIKHA_GOVERNANCE_PROFILE.languageBase,
        fallbackLanguage: SHEIKHA_GOVERNANCE_PROFILE.fallbackLanguage,
        profile: SHEIKHA_GOVERNANCE_PROFILE,
        runtime: {
            cwd: process.cwd(),
            rootName: path.basename(process.cwd())
        }
    };
}

module.exports = {
    SHEIKHA_GOVERNANCE_PROFILE,
    normalizeLocale,
    resolveDirection,
    isUtf8Buffer,
    assertUtf8Text,
    validatePayloadUtf8,
    evaluateEthicalAction,
    buildRequestContext
};
