'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA LLM NEURAL LAYER — طبقة الذكاء الاصطناعي العصبية الجذرية        ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  خوادم تعمل بالخلفية عبر شبكة خلايا عصبية جذرية:                         ║
 * ║   ① VS Code Bridge   — جسر VS Code عبر خادم شيخة-كوبايلوت (3091)         ║
 * ║   ② Ollama           — نماذج LLM محلية / Azure VM (11434)                 ║
 * ║   ③ OpenAI GPT       — GPT-4 / GPT-4o عبر OpenAI API                     ║
 * ║   ④ GitHub Copilot   — GitHub Copilot API                                 ║
 * ║   ⑤ Copilot Bridge   — خادم شيخة-كوبايلوت المحلي (3091)                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  المعمارية: SNRN (Sheikha Neural Root Network)                             ║
 * ║  «وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا» — البقرة ٣١                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const http   = require('http');
const https  = require('https');

// ─── إعدادات المزودين ─────────────────────────────────────────────────────────
const LLM_VERSION   = '2.0.0';
const START_TIME_MS = Date.now();

function getOllamaConfig() {
    return {
        baseUrl:  process.env.OLLAMA_BASE_URL || process.env.OLLAMA_AZURE_ENDPOINT || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
        model:    process.env.OLLAMA_MODEL    || 'llama3.1:8b',
        timeout:  parseInt(process.env.OLLAMA_TIMEOUT_MS || '5000', 10),
    };
}

function getOpenAIConfig() {
    return {
        apiKey:  process.env.OPENAI_API_KEY   || '',
        baseUrl: process.env.OPENAI_BASE_URL  || 'https://api.openai.com/v1',
        model:   process.env.OPENAI_MODEL     || 'gpt-4o',
        orgId:   process.env.OPENAI_ORG_ID    || '',
    };
}

function getGitHubCopilotConfig() {
    return {
        token:   process.env.GITHUB_COPILOT_TOKEN || process.env.GITHUB_TOKEN || '',
        baseUrl: process.env.GITHUB_COPILOT_API_URL || 'https://api.githubcopilot.com',
        model:   process.env.GITHUB_COPILOT_MODEL || 'gpt-4o',
    };
}

function getCopilotBridgeConfig() {
    const port = parseInt(process.env.COPILOT_SERVER_PORT || '3091', 10);
    return {
        baseUrl: process.env.COPILOT_SERVER_URL || `http://127.0.0.1:${port}`,
        port,
    };
}

function getVSCodeConfig() {
    return {
        bridgeUrl:   process.env.VSCODE_BRIDGE_URL  || getCopilotBridgeConfig().baseUrl,
        extensionId: process.env.VSCODER_EXTENSION_ID || 'sheikha.sheikha-copilot',
        workspacePath: process.env.VSCODE_WORKSPACE || process.cwd(),
    };
}

// ─── أداة HTTP خفيفة — بدون مكتبات خارجية ────────────────────────────────────
function httpGet(rawUrl, { timeoutMs = 4000, headers = {} } = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(rawUrl);
        const lib    = parsed.protocol === 'https:' ? https : http;
        const opts   = {
            hostname: parsed.hostname,
            port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
            path:     parsed.pathname + parsed.search,
            method:   'GET',
            headers:  { 'User-Agent': 'Sheikha-LLM-Neural/2.0', ...headers },
            timeout:  timeoutMs,
        };
        const req = lib.request(opts, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (c) => { body += c; });
            res.on('end',  () => resolve({ status: res.statusCode, body }));
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error',   reject);
        req.end();
    });
}

// ─── فحص Ollama ──────────────────────────────────────────────────────────────
async function checkOllamaStatus() {
    const cfg = getOllamaConfig();
    try {
        const res  = await httpGet(`${cfg.baseUrl}/api/tags`, { timeoutMs: cfg.timeout });
        const ok   = res.status === 200;
        let models = [];
        if (ok) {
            try {
                const j = JSON.parse(res.body);
                models  = (j.models || []).map(m => m.name);
            } catch (_) { /* ignore */ }
        }
        return {
            id:        'ollama',
            nameAr:    'أولاما — نماذج محلية',
            connected: ok,
            status:    ok ? 'online' : 'offline',
            baseUrl:   cfg.baseUrl,
            model:     cfg.model,
            models,
            httpStatus: res.status,
        };
    } catch (err) {
        return {
            id:        'ollama',
            nameAr:    'أولاما — نماذج محلية',
            connected: false,
            status:    'offline',
            baseUrl:   cfg.baseUrl,
            model:     cfg.model,
            models:    [],
            error:     err.message,
        };
    }
}

// ─── فحص OpenAI GPT ───────────────────────────────────────────────────────────
async function checkOpenAIStatus() {
    const cfg = getOpenAIConfig();
    const hasKey = cfg.apiKey && cfg.apiKey.length > 8;
    if (!hasKey) {
        return {
            id:        'openai-gpt',
            nameAr:    'GPT — OpenAI',
            connected: false,
            status:    'no-key',
            model:     cfg.model,
            note:      'مفتاح OPENAI_API_KEY غير مُعيَّن',
        };
    }
    try {
        const res = await httpGet(`${cfg.baseUrl}/models`, {
            timeoutMs: 5000,
            headers: {
                Authorization: `Bearer ${cfg.apiKey}`,
                ...(cfg.orgId ? { 'OpenAI-Organization': cfg.orgId } : {}),
            },
        });
        const ok = res.status === 200;
        return {
            id:        'openai-gpt',
            nameAr:    'GPT — OpenAI',
            connected: ok,
            status:    ok ? 'online' : 'auth-error',
            model:     cfg.model,
            baseUrl:   cfg.baseUrl,
            httpStatus: res.status,
        };
    } catch (err) {
        return {
            id:        'openai-gpt',
            nameAr:    'GPT — OpenAI',
            connected: false,
            status:    'offline',
            model:     cfg.model,
            error:     err.message,
        };
    }
}

// ─── فحص GitHub Copilot ──────────────────────────────────────────────────────
async function checkGitHubCopilotStatus() {
    const cfg = getGitHubCopilotConfig();
    const hasToken = cfg.token && cfg.token.length > 8;
    if (!hasToken) {
        return {
            id:        'github-copilot',
            nameAr:    'GitHub Copilot',
            connected: false,
            status:    'no-token',
            model:     cfg.model,
            note:      'مفتاح GITHUB_COPILOT_TOKEN غير مُعيَّن',
        };
    }
    try {
        // فحص عبر GitHub API للتحقق من الرمز
        const res = await httpGet('https://api.github.com/user', {
            timeoutMs: 5000,
            headers: {
                Authorization: `token ${cfg.token}`,
                Accept:        'application/vnd.github.v3+json',
            },
        });
        const ok = res.status === 200;
        let login = '';
        if (ok) {
            try { login = JSON.parse(res.body).login; } catch (_) {}
        }
        return {
            id:        'github-copilot',
            nameAr:    'GitHub Copilot',
            connected: ok,
            status:    ok ? 'online' : 'auth-error',
            model:     cfg.model,
            apiUrl:    cfg.baseUrl,
            login:     login || undefined,
            httpStatus: res.status,
        };
    } catch (err) {
        return {
            id:        'github-copilot',
            nameAr:    'GitHub Copilot',
            connected: false,
            status:    'offline',
            model:     cfg.model,
            error:     err.message,
        };
    }
}

// ─── فحص خادم Copilot Bridge (3091) ─────────────────────────────────────────
async function checkCopilotBridgeStatus() {
    const cfg = getCopilotBridgeConfig();
    try {
        const res = await httpGet(`${cfg.baseUrl}/health`, { timeoutMs: 3000 });
        const ok  = res.status === 200;
        let info  = {};
        if (ok) {
            try { info = JSON.parse(res.body); } catch (_) {}
        }
        return {
            id:        'copilot-bridge',
            nameAr:    'خادم كوبايلوت Bridge (3091)',
            connected: ok,
            status:    ok ? 'online' : 'offline',
            port:      cfg.port,
            baseUrl:   cfg.baseUrl,
            protocol:  info.protocol || 'MCP+HTTP',
            httpStatus: res.status,
        };
    } catch (err) {
        return {
            id:        'copilot-bridge',
            nameAr:    'خادم كوبايلوت Bridge (3091)',
            connected: false,
            status:    'offline',
            port:      cfg.port,
            baseUrl:   cfg.baseUrl,
            error:     err.message,
            note:      'شغّل: pm2 start ecosystem.config.js --only sheikha-copilot',
        };
    }
}

// ─── فحص VS Code Bridge ──────────────────────────────────────────────────────
async function checkVSCodeBridgeStatus() {
    const cfg    = getVSCodeConfig();
    // VS Code نفسه لا يوفر HTTP endpoint — نفحصه عبر copilot-bridge
    const bridge = await checkCopilotBridgeStatus();
    let vscodeBridge = { connected: false, status: 'offline' };
    if (bridge.connected) {
        try {
            const res = await httpGet(`${cfg.bridgeUrl}/copilot/vscode-bridge`, { timeoutMs: 3000 });
            const ok  = res.status === 200;
            vscodeBridge = { connected: ok, status: ok ? 'online' : 'offline', httpStatus: res.status };
        } catch (_) { /* bridge offline */ }
    }
    return {
        id:          'vscode-bridge',
        nameAr:      'VS Code Bridge',
        connected:   vscodeBridge.connected,
        status:      vscodeBridge.connected ? 'online' : (bridge.connected ? 'bridge-up-no-vscode' : 'offline'),
        extensionId: cfg.extensionId,
        bridgeUrl:   cfg.bridgeUrl,
        bridgeOnline: bridge.connected,
        httpStatus:  vscodeBridge.httpStatus,
    };
}

// ─── بناء شبكة الخلايا العصبية الجذرية — SNRN ───────────────────────────────
async function buildLLMNeuralMesh() {
    const [ollama, openai, ghCopilot, copilotBridge, vsCode] = await Promise.all([
        checkOllamaStatus(),
        checkOpenAIStatus(),
        checkGitHubCopilotStatus(),
        checkCopilotBridgeStatus(),
        checkVSCodeBridgeStatus(),
    ]);

    const providers    = [ollama, openai, ghCopilot, copilotBridge, vsCode];
    const onlineCount  = providers.filter(p => p.connected).length;
    const offlineCount = providers.length - onlineCount;

    // تحديد أفضل مزود نشط لإرسال الطلبات
    const preferred = providers.find(p => p.connected && p.id === 'ollama')
        || providers.find(p => p.connected && p.id === 'github-copilot')
        || providers.find(p => p.connected && p.id === 'openai-gpt')
        || providers.find(p => p.connected)
        || null;

    return {
        id:      'SHEIKHA_LLM_NEURAL_MESH',
        version: LLM_VERSION,
        architecture: 'SNRN — Sheikha Neural Root Network',
        ayah: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا — البقرة ٣١',
        posture:   onlineCount > 0 ? 'active' : 'standby',
        online:    onlineCount,
        offline:   offlineCount,
        total:     providers.length,
        preferred: preferred ? preferred.id : null,
        providers,
        uptime: Math.floor((Date.now() - START_TIME_MS) / 1000),
        timestamp: new Date().toISOString(),
    };
}

// ─── طلب دردشة ذكي — يختار أفضل مزود متاح ──────────────────────────────────
async function smartChat({ prompt, model, provider: preferredProvider } = {}) {
    if (!prompt) throw new Error('prompt مطلوب');

    // جمع الحالة أولاً
    const mesh = await buildLLMNeuralMesh();

    // اختيار المزود
    let target = null;
    if (preferredProvider) {
        target = mesh.providers.find(p => p.id === preferredProvider && p.connected);
    }
    if (!target) {
        // ترتيب الأولوية: ollama → github-copilot → openai-gpt → copilot-bridge
        const priority = ['ollama', 'github-copilot', 'openai-gpt', 'copilot-bridge'];
        for (const id of priority) {
            target = mesh.providers.find(p => p.id === id && p.connected);
            if (target) break;
        }
    }

    if (!target) {
        throw new Error('لا يوجد مزود LLM متاح حالياً — تحقق من الخوادم الخلفية');
    }

    // توجيه الطلب
    if (target.id === 'ollama') {
        return chatViaOllama(prompt, model || target.model);
    }
    if (target.id === 'copilot-bridge') {
        return chatViaCopilotBridge(prompt, model);
    }
    // fallback
    return {
        provider: target.id,
        response: 'المزود متصل لكن chat غير مدعوم مباشرةً — استخدم /copilot/completions',
        model: model || target.model,
    };
}

// ─── إرسال طلب إلى Ollama ────────────────────────────────────────────────────
function chatViaOllama(prompt, model) {
    return new Promise((resolve, reject) => {
        const cfg    = getOllamaConfig();
        const parsed = new URL(`${cfg.baseUrl}/api/generate`);
        const lib    = parsed.protocol === 'https:' ? https : http;
        const body   = JSON.stringify({ model: model || cfg.model, prompt, stream: false });
        const opts   = {
            hostname: parsed.hostname,
            port:     parsed.port || 80,
            path:     parsed.pathname,
            method:   'POST',
            headers:  {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(body),
                'User-Agent':     'Sheikha-LLM-Neural/2.0',
            },
            timeout: 30000,
        };
        const req = lib.request(opts, (res) => {
            let raw = '';
            res.setEncoding('utf8');
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                try {
                    const j = JSON.parse(raw);
                    resolve({ provider: 'ollama', model: j.model || model, response: j.response || raw });
                } catch (_) {
                    resolve({ provider: 'ollama', model, response: raw });
                }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('Ollama timeout')); });
        req.on('error',   reject);
        req.write(body);
        req.end();
    });
}

// ─── إرسال طلب إلى Copilot Bridge (3091) ────────────────────────────────────
function chatViaCopilotBridge(prompt, model) {
    return new Promise((resolve, reject) => {
        const cfg    = getCopilotBridgeConfig();
        const parsed = new URL(`${cfg.baseUrl}/copilot/chat`);
        const lib    = parsed.protocol === 'https:' ? https : http;
        const body   = JSON.stringify({ message: prompt, model });
        const opts   = {
            hostname: parsed.hostname,
            port:     parsed.port || 3091,
            path:     parsed.pathname,
            method:   'POST',
            headers:  {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(body),
                'User-Agent':     'Sheikha-LLM-Neural/2.0',
            },
            timeout: 20000,
        };
        const req = lib.request(opts, (res) => {
            let raw = '';
            res.setEncoding('utf8');
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                try {
                    const j = JSON.parse(raw);
                    resolve({ provider: 'copilot-bridge', model: model || 'copilot', response: j.content || j.message || raw });
                } catch (_) {
                    resolve({ provider: 'copilot-bridge', model, response: raw });
                }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('CopilotBridge timeout')); });
        req.on('error',   reject);
        req.write(body);
        req.end();
    });
}

// ─── الصادرات ─────────────────────────────────────────────────────────────────
module.exports = {
    LLM_VERSION,
    buildLLMNeuralMesh,
    smartChat,
    checkOllamaStatus,
    checkOpenAIStatus,
    checkGitHubCopilotStatus,
    checkCopilotBridgeStatus,
    checkVSCodeBridgeStatus,
    getOllamaConfig,
    getOpenAIConfig,
    getGitHubCopilotConfig,
    getCopilotBridgeConfig,
    getVSCodeConfig,
};
