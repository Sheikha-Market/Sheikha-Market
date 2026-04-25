'use strict';

const express = require('express');

const router = express.Router();

let languageLayer = null;
let supremeEngine = null;

try {
    languageLayer = require('../lib/sheikha-language-layer');
    supremeEngine = require('../lib/sheikha-supreme-cs-engine');
} catch (error) {
    console.warn('[cs-language] engine load warning:', error.message);
}

function now() {
    return new Date().toISOString();
}

function envelope(success, data, message, extra = {}) {
    return {
        success,
        data,
        message,
        timestamp: now(),
        ...extra
    };
}

function ensureEngines(res) {
    if (!languageLayer || !supremeEngine) {
        res.status(503).json(
            envelope(false, null, 'محرك اللغة أو محرك علوم الحاسب غير متاح حاليًا', {
                reason: 'engine_unavailable'
            })
        );
        return false;
    }
    return true;
}

function mapExecutePayload(body = {}) {
    const operation = String(body.operation || '').toLowerCase().trim();

    switch (operation) {
        case 'sort':
            return {
                command: 'sort',
                payload: {
                    values: Array.isArray(body.values) ? body.values : [],
                    algorithm: body.algorithm || 'quick'
                }
            };
        case 'search':
            return {
                command: 'search',
                payload: {
                    values: Array.isArray(body.values) ? body.values : [],
                    target: body.target,
                    algorithm: body.algorithm || 'binary'
                }
            };
        case 'hash':
            return {
                command: 'hash',
                payload: {
                    value: body.text ?? body.value ?? '',
                    mode: body.mode || 'sha256'
                }
            };
        case 'convert':
            return {
                command: 'convert',
                payload: {
                    value: body.text ?? body.value ?? '',
                    fromBase: Number(body.baseFrom ?? body.fromBase ?? 10),
                    toBase: Number(body.baseTo ?? body.toBase ?? 10)
                }
            };
        case 'zakat':
            return {
                command: 'zakat',
                payload: {
                    amount: Number(body.amount || 0)
                }
            };
        default:
            return null;
    }
}

router.get('/language/activate', (_req, res) => {
    if (!ensureEngines(res)) return;

    return res.json(
        envelope(true, languageLayer.activate(), 'تم تفعيل الطبقة اللغوية')
    );
});

router.get('/supreme/info', (_req, res) => {
    if (!ensureEngines(res)) return;

    return res.json(
        envelope(true, supremeEngine.info(), 'معلومات المحرك العلمي جاهزة')
    );
});

router.get('/unified', (_req, res) => {
    if (!ensureEngines(res)) return;

    return res.json(
        envelope(
            true,
            {
                language: languageLayer.activate(),
                supreme: supremeEngine.info(),
                runtimeReady: true
            },
            'التشغيل الموحد للطبقة اللغوية ومحرك علوم الحاسب جاهز'
        )
    );
});

router.get('/health', (_req, res) => {
    const enginesReady = Boolean(languageLayer && supremeEngine);

    return res.status(enginesReady ? 200 : 503).json(
        envelope(
            enginesReady,
            {
                service: 'cs-language',
                enginesReady,
                checks: {
                    languageLayer: Boolean(languageLayer),
                    supremeEngine: Boolean(supremeEngine)
                }
            },
            enginesReady ? 'الخدمة تعمل بشكل سليم' : 'الخدمة غير جاهزة حالياً',
            { reason: enginesReady ? 'ok' : 'engine_unavailable' }
        )
    );
});

router.post('/execute', (req, res) => {
    if (!ensureEngines(res)) return;

    const mapped = mapExecutePayload(req.body || {});

    if (!mapped) {
        return res.status(400).json(
            envelope(false, null, 'عملية غير مدعومة', {
                supported: ['sort', 'search', 'hash', 'convert', 'zakat']
            })
        );
    }

    const result = supremeEngine.execute(mapped.command, mapped.payload);
    const ok = Boolean(result && result.success !== false);

    return res.status(ok ? 200 : 400).json(
        envelope(
            ok,
            {
                operation: mapped.command,
                input: mapped.payload,
                result
            },
            ok ? 'تم التنفيذ بنجاح' : 'فشل التنفيذ'
        )
    );
});

module.exports = router;
module.exports.router = router;
