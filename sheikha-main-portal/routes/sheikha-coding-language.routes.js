'use strict';

const express = require('express');
const router = express.Router();

const {
    GRAMMAR,
    parseCommand,
    compileCommand,
    examples,
    extractRootFromText
} = require('../lib/sheikha-coding-language-engine.js');
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');
let bridgeToCsLanguage = null;
try {
    bridgeToCsLanguage = require('../lib/sheikha-code-cs-bridge.js');
} catch (error) {
    console.warn('[sheikha-code] cs bridge unavailable:', error.message);
}

const { orchestrator } = require('./execution-orchestrator.routes.js');

const ok = (res, data, message = 'نجح') => {
    res.json({ ok: true, data, message, timestamp: new Date().toISOString() });
};

const fail = (res, message = 'فشل الطلب', code = 400) => {
    res.status(code).json({ ok: false, message, timestamp: new Date().toISOString() });
};

async function callInternalApi(endpoint, method = 'GET', payload = null) {
    const baseUrl = process.env.INTERNAL_API_BASE_URL || 'http://127.0.0.1:8080';
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (payload && method !== 'GET') {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const raw = await response.text();

    let data;
    try {
        data = raw ? JSON.parse(raw) : null;
    } catch (error) {
        data = {
            raw,
            parseError: true,
            parseErrorMessage: error.message
        };
    }

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

async function executeActions(actions, context = {}) {
    const outputs = [];

    for (const action of actions) {
        if (action === 'AUTO_EXECUTE') {
            const out = await callInternalApi('/api/execution-orchestrator/auto', 'POST', {});
            outputs.push({ action, result: out });
            continue;
        }

        if (action === 'SHOW_SYSTEM_STATUS') {
            outputs.push({ action, result: orchestrator.getStatus() });
            continue;
        }

        if (action === 'SHOW_SUPPLY_GAP') {
            const systemState = await orchestrator.readSystemState({});
            outputs.push({ action, result: { supplyGap: systemState.supplyGap, orders: systemState.orders, supply: systemState.supply } });
            continue;
        }

        if (action === 'ANALYZE_ORDERS') {
            const systemState = await orchestrator.readSystemState({});
            outputs.push({ action, result: { orders: systemState.orders, contracts: systemState.contracts, alerts: systemState.alertCount } });
            continue;
        }

        if (action === 'OPEN_SUPPLY_REVIEW') {
            const systemState = await orchestrator.readSystemState({});
            outputs.push({ action, result: { review: 'supply', supplyGap: systemState.supplyGap } });
            continue;
        }

        if (action === 'EXTRACT_ROOT') {
            const rootResult = extractRootFromText(context.command || context.text || '');
            outputs.push({ action, result: rootResult });
            continue;
        }

        // PM actions are forwarded directly to orchestrator executeAction
        if (action.startsWith('ACTIVATE_PM')) {
            const pmMatch = action.match(/ACTIVATE_PM(\d+)/);
            const pmLevel = pmMatch ? pmMatch[1] : null;

            if (pmLevel) {
                const out = await callInternalApi(`/api/pm-neural/pm${pmLevel}/activate`, 'POST', {});
                outputs.push({ action, result: out });
                continue;
            }

            const fallback = await orchestrator.executeAction(action);
            outputs.push({ action, result: fallback });
            continue;
        }

        if (action === 'CREATE_GITHUB_FILE') {
            const payload = {
                path: 'docs/sheikha-auto-generated.md',
                content: `# ملف مولد من لغة شيخة\n\n${context.command || context.text || 'Sheikha command execution'}`,
                message: 'إنشاء ملف تلقائي عبر لغة شيخة'
            };
            const out = await callInternalApi('/api/git/create-file', 'POST', payload);
            outputs.push({ action, result: out });
            continue;
        }

        if (action === 'GENERATE_VISUAL') {
            const prompt = context.command || context.text || 'تصميم بصري من لغة شيخة';
            const out = await callInternalApi('/api/visual/generate', 'POST', {
                prompt,
                type: 'image'
            });
            outputs.push({ action, result: out });
            continue;
        }

        outputs.push({ action, result: { status: 'skipped', reason: 'unsupported action' } });
    }

    return outputs;
}

router.get('/health', (req, res) => {
    ok(res, {
        engine: 'Sheikha Coding Language Runtime',
        status: 'healthy',
        grammarVersion: GRAMMAR.version,
        integratedWith: [
            '/api/execution-orchestrator/*',
            '/api/pm-neural/*',
            '/api/phnae/*',
            '/api/arabic-utf8/*'
        ]
    }, 'محرك لغة شيخة يعمل بكفاءة');
});

router.get('/grammar', (req, res) => {
    ok(res, GRAMMAR, 'قواعد لغة شيخة');
});

router.get('/examples', (req, res) => {
    ok(res, examples(), 'أمثلة لغة شيخة');
});

router.post('/parse', (req, res) => {
    const { command } = req.body;
    if (!command) return fail(res, 'مطلوب الحقل command');
    ok(res, parseCommand(command), 'تم تحليل الأمر');
});

router.post('/compile', (req, res) => {
    const { command, options } = req.body;
    if (!command) return fail(res, 'مطلوب الحقل command');
    ok(res, compileCommand(command, options || {}), 'تم تحويل الأمر إلى JSON');
});

router.post('/execute', async (req, res) => {
    try {
        const { command, actions, text } = req.body;
        const parsed = command ? parseCommand(command) : null;
        let finalActions = [];
        if (Array.isArray(actions) && actions.length) {
            finalActions = actions;
        } else if (parsed && Array.isArray(parsed.actions)) {
            finalActions = parsed.actions;
        }

        if (!finalActions.length) return fail(res, 'لا توجد إجراءات قابلة للتنفيذ');

        const executed = await executeActions(finalActions, { command, text });
        ok(res, {
            command: command || null,
            actions: finalActions,
            executed
        }, 'تم تنفيذ الأمر');
    } catch (error) {
        fail(res, error.message, 500);
    }
});

router.post('/command', async (req, res) => {
    try {
        const { command, text } = req.body;
        if (!command) return fail(res, 'مطلوب الحقل command');

        // جسر مباشر: تحويل الأوامر الحسابية/المنطقية إلى cs-language
        const bridgeResult = typeof bridgeToCsLanguage === 'function'
            ? bridgeToCsLanguage({ text: command })
            : null;
        if (bridgeResult) {
            const execution = await callInternalApi(bridgeResult.target, 'POST', bridgeResult.payload);

            if (!execution.ok) {
                return fail(
                    res,
                    `فشل تنفيذ أمر cs-language (HTTP ${execution.status})`,
                    execution.status || 502
                );
            }

            sheikhaRealtimeHub.emitEvent('sheikha.command.executed', {
                command,
                actions: [],
                target: 'cs-language',
                routedTo: bridgeResult.target,
                success: true
            });

            return ok(res, {
                source: 'sheikha-code',
                routedTo: 'cs-language',
                target: bridgeResult.target,
                payload: bridgeResult.payload,
                execution: execution.data
            }, 'تم توجيه الأمر إلى cs-language وتنفيذه بنجاح');
        }

        const parsed = parseCommand(command);
        const containsVisualIntent = command.includes('صورة') || command.includes('تصميم');

        let finalActions = Array.isArray(parsed.actions) ? [...parsed.actions] : [];
        if (containsVisualIntent && !finalActions.includes('GENERATE_VISUAL')) {
            finalActions.push('GENERATE_VISUAL');
        }

        const executed = await executeActions(finalActions, { command, text });

        sheikhaRealtimeHub.emitEvent('sheikha.command.executed', {
            command,
            actions: finalActions,
            target: parsed.target,
            success: true
        });

        ok(res, {
            ok: true,
            parsed: parsed.parsed,
            target: parsed.target,
            actions: finalActions,
            execution: executed
        }, 'تم تحليل وتنفيذ أمر لغة شيخة');
    } catch (error) {
        fail(res, error.message, 500);
    }
});

module.exports = { router };
module.exports = router;
module.exports.router = router;
