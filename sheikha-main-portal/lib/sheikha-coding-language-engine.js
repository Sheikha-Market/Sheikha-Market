'use strict';

/**
 * Sheikha Coding Language Runtime v2.0
 * لغة التشغيل العربية المتكاملة
 * 
 * Three Levels:
 * 1. Parser: فهم الأوامر العربية
 * 2. Compiler: تحويل إلى خطط التنفيذ
 * 3. Executor: ربط مع APIs الفعلية
 */

const {
    detectLanguage,
    normalizeText,
    extractRoot
} = require('./sheikha-arabic-utf8-neural-engine.js');

// ===== Level 1: Action Patterns =====
const ACTION_MAP = [
    { regex: /فع(ّل|ل)\s*pm1|تفعيل\s*pm1/i, action: 'ACTIVATE_PM1', domain: 'execution_orchestrator' },
    { regex: /فع(ّل|ل)\s*pm2|تفعيل\s*pm2/i, action: 'ACTIVATE_PM2', domain: 'execution_orchestrator' },
    { regex: /فع(ّل|ل)\s*pm3|تفعيل\s*pm3/i, action: 'ACTIVATE_PM3', domain: 'execution_orchestrator' },
    { regex: /فع(ّل|ل)\s*pm4|تفعيل\s*pm4/i, action: 'ACTIVATE_PM4', domain: 'execution_orchestrator' },
    { regex: /فع(ّل|ل)\s*pm5|تفعيل\s*pm5/i, action: 'ACTIVATE_PM5', domain: 'execution_orchestrator' },
    { regex: /شغ(ّ|)ل\s*التنفيذ\s*التلقائي|تشغيل\s*التنفيذ\s*التلقائي|auto/i, action: 'AUTO_EXECUTE', domain: 'execution_orchestrator' },
    { regex: /اربط\s*التوريد|مراجعة\s*التوريد|open\s*supply\s*review/i, action: 'OPEN_SUPPLY_REVIEW', domain: 'execution_orchestrator' },
    { regex: /حل(ّ|)ل\s*الطلبات|تحليل\s*الطلبات/i, action: 'ANALYZE_ORDERS', domain: 'execution_orchestrator' },
    { regex: /اعرض\s*حالة\s*(النظام|اللغة)|حالة\s*اللغة/i, action: 'SHOW_SYSTEM_STATUS', domain: 'execution_orchestrator' },
    { regex: /اعرض\s*فجوة\s*التوريد|فجوة\s*التوريد/i, action: 'SHOW_SUPPLY_GAP', domain: 'execution_orchestrator' },
    { regex: /استخرج\s*الجذر|جذر\s*الكلمة/i, action: 'EXTRACT_ROOT', domain: 'arabic_utf8' },
    { regex: /أنشئ\s*ملف(ًا|اً|ا)?\s*(في)?\s*github|انشئ\s*ملف(ا)?\s*(في)?\s*github|create\s*.*github\s*file/i, action: 'CREATE_GITHUB_FILE', domain: 'git_api' }
];

// ===== API Mapping =====
const API_ENDPOINTS = {
    'ACTIVATE_PM1': { api: '/api/pm-neural/pm1/activate', method: 'POST' },
    'ACTIVATE_PM2': { api: '/api/pm-neural/pm2/activate', method: 'POST' },
    'ACTIVATE_PM3': { api: '/api/pm-neural/pm3/activate', method: 'POST' },
    'ACTIVATE_PM4': { api: '/api/pm-neural/pm4/activate', method: 'POST' },
    'ACTIVATE_PM5': { api: '/api/pm-neural/pm5/activate', method: 'POST' },
    'AUTO_EXECUTE': { api: '/api/execution-orchestrator/auto', method: 'POST' },
    'OPEN_SUPPLY_REVIEW': { api: '/api/execution-orchestrator/state', method: 'GET' },
    'ANALYZE_ORDERS': { api: '/api/execution-orchestrator/state', method: 'GET' },
    'SHOW_SYSTEM_STATUS': { api: '/api/execution-orchestrator/state', method: 'GET' },
    'SHOW_SUPPLY_GAP': { api: '/api/execution-orchestrator/state', method: 'GET' },
    'EXTRACT_ROOT': { api: '/api/arabic-utf8/root', method: 'POST' },
    'CREATE_GITHUB_FILE': { api: '/api/git/create-file', method: 'POST' }
};

const GRAMMAR = {
    language: 'Sheikha Coding Language v2.0',
    version: '2.0.0',
    commandVocabulary: [
        'فعّل PM1', 'فعّل PM2', 'فعّل PM3', 'فعّل PM4', 'فعّل PM5',
        'حلّل الطلبات', 'اربط التوريد', 'شغّل التنفيذ التلقائي',
        'اعرض حالة اللغة', 'اعرض حالة النظام', 'اعرض فجوة التوريد',
        'استخرج الجذر', 'نفّذ الأمر'
    ],
    decisionVocabulary: ['قرار', 'تنبيه', 'وضع', 'أولوية', 'تنفيذ'],
    dataVocabulary: ['طلبات', 'توريد', 'عقود', 'فجوة', 'جودة'],
    apiVocabulary: ['json', 'api', 'endpoint', 'compile', 'parse', 'execute']
};

// ===== LEVEL 1: Parser =====
function splitCommandSegments(command) {
    return String(command || '')
        .split(/\s*(?:و|ثم|\+|,|،|;|؛)\s*/)
        .map(s => s.trim())
        .filter(Boolean);
}

function parseCommand(command) {
    const raw = String(command || '').trim();
    const normalized = normalizeText(raw);
    const segments = splitCommandSegments(raw);

    const actions = [];
    const tokens = [];

    for (const segment of segments) {
        const hit = ACTION_MAP.find(rule => rule.regex.test(segment));
        if (hit) {
            actions.push(hit.action);
            tokens.push({ segment, action: hit.action, domain: hit.domain });
        } else {
            tokens.push({ segment, action: 'UNKNOWN', domain: 'unknown' });
        }
    }

    const uniqueActions = [...new Set(actions)];
    const domain = uniqueActions.includes('EXTRACT_ROOT') && uniqueActions.length === 1
        ? 'arabic_utf8'
        : 'execution_orchestrator';

    return {
        ok: true,
        raw,
        normalized,
        language: detectLanguage(raw),
        segments,
        tokens,
        parsed: uniqueActions.map(a => a.toLowerCase()),
        actions: uniqueActions,
        target: domain
    };
}

// ===== LEVEL 2: Compiler =====
function compileCommand(command, options = {}) {
    const parsed = parseCommand(command);

    // Build execution plan with API details
    const executionPlan = parsed.actions.map((action, idx) => ({
        sequence: idx + 1,
        action: action,
        api: API_ENDPOINTS[action]?.api || '/api/unknown',
        method: API_ENDPOINTS[action]?.method || 'GET',
        payload: { action: action.toLowerCase(), timestamp: new Date().toISOString() }
    }));

    return {
        ok: true,
        source: parsed.raw,
        target: parsed.target,
        ast: {
            type: 'SheikhaCommand',
            nodes: parsed.tokens
        },
        json: {
            command: parsed.raw,
            parsed: parsed.parsed,
            actions: parsed.actions,
            target: parsed.target,
            options,
            executionPlan
        }
    };
}

// ===== LEVEL 3: Executor =====
function buildExecutionPlan(command) {
    const compiled = compileCommand(command);
    
    return {
        ok: true,
        commandId: `cmd_${Date.now()}`,
        command: command,
        compiled: compiled,
        executionPlan: compiled.json.executionPlan || [],
        status: 'prepared',
        createdAt: new Date().toISOString()
    };
}

// ===== Examples & Documentation =====
function examples() {
    return [
        {
            input: 'فعّل PM4 واربط التوريد وشغّل التنفيذ التلقائي',
            output: {
                ok: true,
                parsed: ['activate_pm4', 'open_supply_review', 'auto_execute'],
                target: 'execution_orchestrator',
                actions: ['ACTIVATE_PM4', 'OPEN_SUPPLY_REVIEW', 'AUTO_EXECUTE']
            }
        },
        {
            input: 'حلّل الطلبات واعرض فجوة التوريد',
            output: {
                ok: true,
                parsed: ['analyze_orders', 'show_supply_gap'],
                target: 'execution_orchestrator',
                actions: ['ANALYZE_ORDERS', 'SHOW_SUPPLY_GAP']
            }
        },
        {
            input: 'استخرج الجذر كلمة البرمجة',
            output: {
                ok: true,
                parsed: ['extract_root'],
                target: 'arabic_utf8',
                actions: ['EXTRACT_ROOT']
            }
        },
        {
            input: 'اعرض حالة النظام',
            output: {
                ok: true,
                parsed: ['show_system_status'],
                target: 'execution_orchestrator',
                actions: ['SHOW_SYSTEM_STATUS']
            }
        }
    ];
}

function extractRootFromText(text) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const targetWord = words[words.length - 1] || '';
    return extractRoot(targetWord);
}

function getGrammarDocumentation() {
    return {
        language: GRAMMAR,
        actionMap: ACTION_MAP,
        apiEndpoints: API_ENDPOINTS,
        examples: examples()
    };
}

module.exports = {
    GRAMMAR,
    ACTION_MAP,
    API_ENDPOINTS,
    parseCommand,
    compileCommand,
    buildExecutionPlan,
    examples,
    extractRootFromText,
    getGrammarDocumentation
};
