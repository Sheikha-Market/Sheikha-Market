'use strict';

const HUMAN_LANGUAGES = Object.freeze({
    ar: { name: 'العربية', nameEn: 'Arabic', dir: 'rtl', flag: '🇸🇦', code: 'ar', primary: true, locale: 'ar-SA' },
    en: { name: 'English', nameEn: 'English', dir: 'ltr', flag: '🇬🇧', code: 'en', locale: 'en-US' },
    fr: { name: 'Français', nameEn: 'French', dir: 'ltr', flag: '🇫🇷', code: 'fr', locale: 'fr-FR' },
    tr: { name: 'Türkçe', nameEn: 'Turkish', dir: 'ltr', flag: '🇹🇷', code: 'tr', locale: 'tr-TR' },
    ur: { name: 'اردو', nameEn: 'Urdu', dir: 'rtl', flag: '🇵🇰', code: 'ur', locale: 'ur-PK' },
    id: { name: 'Bahasa Indonesia', nameEn: 'Indonesian', dir: 'ltr', flag: '🇮🇩', code: 'id', locale: 'id-ID' },
    ms: { name: 'Bahasa Melayu', nameEn: 'Malay', dir: 'ltr', flag: '🇲🇾', code: 'ms', locale: 'ms-MY' },
    de: { name: 'Deutsch', nameEn: 'German', dir: 'ltr', flag: '🇩🇪', code: 'de', locale: 'de-DE' },
    zh: { name: '中文', nameEn: 'Chinese', dir: 'ltr', flag: '🇨🇳', code: 'zh-CN', locale: 'zh-CN' },
    es: { name: 'Español', nameEn: 'Spanish', dir: 'ltr', flag: '🇪🇸', code: 'es', locale: 'es-ES' },
    ru: { name: 'Русский', nameEn: 'Russian', dir: 'ltr', flag: '🇷🇺', code: 'ru', locale: 'ru-RU' },
    pt: { name: 'Português', nameEn: 'Portuguese', dir: 'ltr', flag: '🇧🇷', code: 'pt', locale: 'pt-BR' },
    hi: { name: 'हिन्दी', nameEn: 'Hindi', dir: 'ltr', flag: '🇮🇳', code: 'hi', locale: 'hi-IN' },
    ja: { name: '日本語', nameEn: 'Japanese', dir: 'ltr', flag: '🇯🇵', code: 'ja', locale: 'ja-JP' },
    ko: { name: '한국어', nameEn: 'Korean', dir: 'ltr', flag: '🇰🇷', code: 'ko', locale: 'ko-KR' },
    it: { name: 'Italiano', nameEn: 'Italian', dir: 'ltr', flag: '🇮🇹', code: 'it', locale: 'it-IT' },
    nl: { name: 'Nederlands', nameEn: 'Dutch', dir: 'ltr', flag: '🇳🇱', code: 'nl', locale: 'nl-NL' },
    pl: { name: 'Polski', nameEn: 'Polish', dir: 'ltr', flag: '🇵🇱', code: 'pl', locale: 'pl-PL' },
    fa: { name: 'فارسی', nameEn: 'Persian', dir: 'rtl', flag: '🇮🇷', code: 'fa', locale: 'fa-IR' },
    th: { name: 'ไทย', nameEn: 'Thai', dir: 'ltr', flag: '🇹🇭', code: 'th', locale: 'th-TH' },
    vi: { name: 'Tiếng Việt', nameEn: 'Vietnamese', dir: 'ltr', flag: '🇻🇳', code: 'vi', locale: 'vi-VN' },
    sw: { name: 'Kiswahili', nameEn: 'Swahili', dir: 'ltr', flag: '🇹🇿', code: 'sw', locale: 'sw-TZ' },
    uk: { name: 'Українська', nameEn: 'Ukrainian', dir: 'ltr', flag: '🇺🇦', code: 'uk', locale: 'uk-UA' },
    bn: { name: 'বাংলা', nameEn: 'Bengali', dir: 'ltr', flag: '🇧🇩', code: 'bn', locale: 'bn-BD' },
    tl: { name: 'Tagalog', nameEn: 'Tagalog', dir: 'ltr', flag: '🇵🇭', code: 'tl', locale: 'tl-PH' }
});

const PROGRAMMING_LANGUAGE_ALIASES = Object.freeze({
    js: 'javascript',
    ts: 'typescript',
    'c#': 'csharp',
    'c++': 'cpp',
    shell: 'bash',
    sh: 'bash',
    zsh: 'bash',
    ps1: 'powershell',
    golang: 'go',
    objc: 'objective-c',
    'objective-c++': 'objective-cpp',
    yml: 'yaml'
});

const BASE_PROGRAMMING_LANGUAGES = Object.freeze([
    'sheikha-sabil', 'php', 'javascript', 'typescript', 'python', 'go', 'rust', 'csharp', 'java', 'kotlin',
    'swift', 'dart', 'c', 'cpp', 'bash', 'powershell', 'sql', 'html', 'css', 'json', 'yaml', 'markdown',
    'ruby', 'lua', 'r', 'scala', 'elixir', 'erlang', 'haskell', 'perl', 'solidity', 'dockerfile', 'makefile',
    'assembly', 'matlab', 'julia', 'groovy', 'clojure', 'fsharp', 'ocaml', 'nim', 'zig', 'crystal', 'fortran',
    'cobol', 'vbnet', 'objective-c', 'objective-cpp', 'pascal', 'delphi', 'prolog', 'lisp', 'scheme',
    'common-lisp', 'smalltalk', 'elm', 'purescript', 'apl', 'ada', 'sas', 'abap', 'awk', 'sed', 'tcl',
    'verilog', 'vhdl', 'graphql', 'protobuf', 'toml', 'ini', 'xml', 'asm'
]);

const BASE_MARKUP_LANGUAGES = Object.freeze([
    'sheikha-bayan', 'html', 'xml', 'markdown', 'yaml', 'json', 'toml', 'ini', 'csv', 'svg',
    'rss', 'atom', 'graphql', 'protobuf', 'openapi', 'mermaid', 'plantuml', 'latex',
    'asciidoc', 'restructuredtext'
]);

const RUNTIME_PROFILES = Object.freeze({
    local: {
        id: 'local',
        name: 'Local',
        nodeEnv: 'development',
        host: '127.0.0.1',
        deployTarget: 'developer-workstation'
    },
    development: {
        id: 'development',
        name: 'Development',
        nodeEnv: 'development',
        host: '127.0.0.1',
        deployTarget: 'shared-dev'
    },
    staging: {
        id: 'staging',
        name: 'Staging',
        nodeEnv: 'production',
        host: '0.0.0.0',
        deployTarget: 'pre-production'
    },
    production: {
        id: 'production',
        name: 'Production',
        nodeEnv: 'production',
        host: '0.0.0.0',
        deployTarget: 'live'
    }
});

const INTEGRATION_SPECS = Object.freeze([
    { id: 'openai', envFlag: 'OPENAI_ENABLED', requiredKeys: ['OPENAI_API_KEY'] },
    { id: 'anthropic', envFlag: 'ANTHROPIC_ENABLED', requiredKeys: ['ANTHROPIC_API_KEY'] },
    { id: 'humain', envFlag: 'HUMAIN_ENABLED', requiredKeys: ['HUMAIN_API_KEY'] },
    { id: 'ollama', envFlag: 'OLLAMA_ENABLED', requiredKeys: ['OLLAMA_HOST'] },
    { id: 'stripe', envFlag: 'STRIPE_ENABLED', requiredKeys: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'] },
    { id: 'figma', envFlag: 'FIGMA_ENABLED', requiredKeys: ['FIGMA_ACCESS_TOKEN'] },
    { id: 'nvidia', envFlag: 'NVIDIA_ENABLED', requiredKeys: ['NVIDIA_API_KEY'] },
    { id: 'sentry', envFlag: 'SENTRY_ENABLED', requiredKeys: ['SENTRY_DSN'] },
    { id: 'linear', envFlag: 'LINEAR_ENABLED', requiredKeys: ['LINEAR_API_KEY'] },
    { id: 'google', envFlag: 'GOOGLE_ENABLED', requiredKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
    { id: 'gitlab', envFlag: 'GITLAB_ENABLED', requiredKeys: ['GITLAB_TOKEN'] },
    { id: 'cloudSync', envFlag: 'CLOUD_SYNC_ENABLED', requiredKeys: ['CLOUD_SYNC_URL'] }
]);

function normalizeLanguageIdentifier(value) {
    const normalized = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    return PROGRAMMING_LANGUAGE_ALIASES[normalized] || normalized;
}

function parseExtraLanguages(value) {
    return String(value || '')
        .split(/[,\n]/)
        .map(normalizeLanguageIdentifier)
        .filter(Boolean);
}

function dedupe(values) {
    const seen = new Set();
    const out = [];

    for (const value of values) {
        if (!value || seen.has(value)) {
            continue;
        }

        seen.add(value);
        out.push(value);
    }

    return out;
}

function getHumanLanguageCatalog() {
    return { ...HUMAN_LANGUAGES };
}

function getHumanLanguageCodes() {
    return Object.keys(HUMAN_LANGUAGES);
}

function getDefaultHumanLanguage() {
    return 'ar';
}

function getHumanLanguageDirection(languageCode) {
    const normalized = normalizeLanguageIdentifier(languageCode);
    const exact = HUMAN_LANGUAGES[normalized];

    if (exact) {
        return exact.dir;
    }

    const baseCode = normalized.split('-')[0];
    return (HUMAN_LANGUAGES[baseCode] || {}).dir || 'ltr';
}

function getSupportedProgrammingLanguages(env = process.env) {
    return dedupe([
        ...BASE_PROGRAMMING_LANGUAGES,
        ...parseExtraLanguages(env.SHEIKHA_EXTRA_PROGRAMMING_LANGUAGES)
    ]);
}

function getSupportedMarkupLanguages(env = process.env) {
    return dedupe([
        ...BASE_MARKUP_LANGUAGES,
        ...parseExtraLanguages(env.SHEIKHA_EXTRA_MARKUP_LANGUAGES)
    ]);
}

function isUnknownProgrammingLanguageSupportEnabled(env = process.env) {
    return String(env.SHEIKHA_ALLOW_UNKNOWN_PROGRAMMING_LANGUAGES || 'true') !== 'false';
}

function isProgrammingLanguageSupported(language, env = process.env) {
    const normalized = normalizeLanguageIdentifier(language);

    if (!normalized) {
        return false;
    }

    return getSupportedProgrammingLanguages(env).includes(normalized) || isUnknownProgrammingLanguageSupportEnabled(env);
}

function getRuntimeProfiles() {
    return { ...RUNTIME_PROFILES };
}

function getRuntimeProfile(profileName, env = process.env) {
    const requested = String(profileName || env.APP_ENV || env.NODE_ENV || 'development').trim().toLowerCase();
    const aliases = {
        dev: 'development',
        stage: 'staging',
        prod: 'production',
        test: 'local'
    };
    const resolvedId = aliases[requested] || requested;

    return RUNTIME_PROFILES[resolvedId] || RUNTIME_PROFILES.development;
}

function hasValue(value) {
    return String(value || '').trim().length > 0;
}

function getIntegrationStatus(env = process.env) {
    const mergedEnv = { ...env };

    return INTEGRATION_SPECS.reduce((acc, spec) => {
        const requiredKeysPresent = spec.requiredKeys.every((key) => hasValue(mergedEnv[key]));
        const explicitFlag = mergedEnv[spec.envFlag];
        const explicitlyDisabled = explicitFlag === 'false';
        const explicitlyEnabled = explicitFlag === 'true';
        const enabled = explicitlyDisabled ? false : (explicitlyEnabled || requiredKeysPresent);

        acc[spec.id] = {
            enabled,
            ready: enabled && requiredKeysPresent,
            envFlag: spec.envFlag,
            requiredKeys: spec.requiredKeys
        };

        return acc;
    }, {});
}

function getLanguageFamilies(env = process.env) {
    return {
        programming: getSupportedProgrammingLanguages(env),
        markup: getSupportedMarkupLanguages(env),
        natural: getHumanLanguageCodes(),
        data: ['structured', 'semi-structured', 'unstructured'],
        policy: isUnknownProgrammingLanguageSupportEnabled(env)
            ? 'Any declared programming language identifier is accepted through governed routing; registered languages receive richer hints and safer defaults.'
            : 'Only registered language identifiers are accepted until they are mapped and reviewed.'
    };
}

module.exports = {
    HUMAN_LANGUAGES,
    BASE_PROGRAMMING_LANGUAGES,
    BASE_MARKUP_LANGUAGES,
    normalizeLanguageIdentifier,
    getHumanLanguageCatalog,
    getHumanLanguageCodes,
    getDefaultHumanLanguage,
    getHumanLanguageDirection,
    getSupportedProgrammingLanguages,
    getSupportedMarkupLanguages,
    isUnknownProgrammingLanguageSupportEnabled,
    isProgrammingLanguageSupported,
    getRuntimeProfiles,
    getRuntimeProfile,
    getIntegrationStatus,
    getLanguageFamilies
};
