'use strict';

const express = require('express');

const router = express.Router();
const grammarEngine = require('../lib/sheikha-arabic-grammar-engine');
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');

function now() {
    return new Date().toISOString();
}

function isVisualCommand(command) {
    return /صورة|فيديو|شعار|تصميم|هوية|generate\s*(image|video)|create\s*(image|video|logo)/i.test(String(command || ''));
}

async function callInternalApi(endpoint, payload, method = 'POST') {
    const baseUrl = process.env.INTERNAL_API_BASE_URL || 'http://127.0.0.1:8080';
    const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: method === 'GET' ? undefined : JSON.stringify(payload || {})
    });

    const raw = await response.text();
    let data;
    try {
        data = raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('[sheikha-pipeline] invalid JSON response:', error.message);
        data = {
            success: false,
            message: 'تعذر تحليل استجابة JSON',
            raw
        };
    }

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

function emitPipelineEvent(command, stage, payload) {
    sheikhaRealtimeHub.emitEvent('sheikha.pipeline.completed', {
        command,
        stage,
        payload,
        timestamp: now()
    });
}

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            service: 'sheikha-command-pipeline',
            status: 'ready',
            route: '/api/sheikha-pipeline/command'
        },
        message: 'Pipeline الموحد جاهز',
        timestamp: now()
    });
});

router.post('/command', async (req, res) => {
    const command = req.body && (req.body.command || req.body.text);

    if (!command) {
        return res.status(400).json({
            success: false,
            data: null,
            message: 'الحقل command مطلوب',
            timestamp: now()
        });
    }

    let grammar = null;
    try {
        grammar = grammarEngine.analyze(command);
    } catch (error) {
        grammar = {
            engine: 'sheikha-arabic-grammar-engine',
            sentenceType: 'unknown',
            tokenCount: 0,
            tokens: [],
            error: error.message
        };
    }

    if (isVisualCommand(command)) {
        const visualExecution = await callInternalApi('/api/visual/job', {
            command,
            prompt: command,
            async: true,
            type: req.body?.type || 'image',
            priority: req.body?.priority || 'normal'
        }, 'POST');

        emitPipelineEvent(command, 'visual-queue', {
            status: visualExecution.status,
            ok: visualExecution.ok
        });

        return res.status(visualExecution.ok ? 200 : 502).json({
            success: visualExecution.ok,
            data: {
                pipeline: {
                    path: ['arabic-command', 'grammar', 'decision', 'visual-job-queue', 'realtime'],
                    selectedTarget: 'visual-job-queue'
                },
                grammar,
                decision: {
                    target: 'visual-job-queue',
                    operation: 'create_visual_job',
                    routedTo: '/api/visual/job'
                },
                execution: visualExecution.data
            },
            message: visualExecution.ok
                ? 'تم توجيه الأمر البصري وإدراجه في الطابور بنجاح'
                : 'فشل توجيه الأمر البصري إلى الطابور',
            timestamp: now()
        });
    }

    const decisionExecution = await callInternalApi('/api/sheikha-code-decision/command', {
        command,
        text: command,
        pipelineSource: 'sheikha-command-pipeline'
    }, 'POST');

    emitPipelineEvent(command, 'decision-execution', {
        status: decisionExecution.status,
        ok: decisionExecution.ok,
        target: decisionExecution.data?.data?.decision?.target || 'unknown'
    });

    return res.status(decisionExecution.ok ? 200 : decisionExecution.status || 502).json({
        success: decisionExecution.ok,
        data: {
            pipeline: {
                path: ['arabic-command', 'grammar', 'decision', 'cs-language-or-orchestrator', 'queue', 'realtime', 'dashboard'],
                selectedTarget: decisionExecution.data?.data?.decision?.target || 'unknown'
            },
            grammar,
            decisionExecution: decisionExecution.data
        },
        message: decisionExecution.ok
            ? 'تم تنفيذ Pipeline الكامل بنجاح'
            : 'فشل تنفيذ Pipeline الكامل',
        timestamp: now()
    });
});

module.exports = router;
module.exports.router = router;
