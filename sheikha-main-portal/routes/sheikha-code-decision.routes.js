'use strict';

const express = require('express');

const router = express.Router();
const bridgeToCsLanguage = require('../lib/sheikha-code-cs-bridge');
const grammarEngine = require('../lib/sheikha-arabic-grammar-engine');
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');

function now() {
    return new Date().toISOString();
}

function normalizeVerb(verb) {
    return String(verb || '')
    .replaceAll(/[ًٌٍَُِّْـ]/g, '')
    .replaceAll(/[أإآ]/g, 'ا')
    .replaceAll('ى', 'ي')
        .trim()
        .toLowerCase();
}

function extractNumbers(text) {
    const matches = String(text || '').match(/-?\d+(?:\.\d+)?/g) || [];
    return matches.map(Number).filter((value) => Number.isFinite(value));
}

function findVerb(grammar, command) {
    const detectedVerb = grammar?.tokens?.find((token) => token.role === 'verb')?.token;
    if (detectedVerb) {
        return normalizeVerb(detectedVerb);
    }
    const firstToken = String(command || '').trim().split(/\s+/)[0] || '';
    return normalizeVerb(firstToken);
}

function buildGovernanceTrace(command, decision, executionStatus) {
    const hasRiskyIntent = /(احذف\s+كل|دمر|خرّب|اتلف|wipe|drop\s+database)/i.test(String(command || ''));

    return {
        principle: 'إِنِ الْحُكْمُ إِلَّا لِلَّهِ',
        references: {
            quran: ['الأنعام:57', 'هود:88'],
            sunnah: ['لا ضرر ولا ضرار']
        },
        controls: [
            {
                id: 'NO_HARM',
                text: 'لا ضرر ولا ضرار',
                status: hasRiskyIntent ? 'blocked' : 'passed'
            },
            {
                id: 'TRUST_AND_CLARITY',
                text: 'الصدق والأمانة في القرار والتنفيذ',
                status: executionStatus ? 'passed' : 'fallback'
            },
            {
                id: 'RESPONSIBLE_AUTOMATION',
                text: 'التنفيذ الآلي المنضبط ضمن مسارات معروفة',
                status: decision?.target ? 'passed' : 'review'
            }
        ],
        decisionSummary: {
            target: decision?.target || 'unknown',
            operation: decision?.operation || 'unknown'
        }
    };
}

function buildWorkflowTrail(command, grammar, decision, execution, governance, trace) {
    return {
        input: {
            command,
            timestamp: now()
        },
        analysis: {
            sentenceType: grammar?.sentenceType || 'unknown',
            verb: grammar?.tokens?.find((token) => token.role === 'verb')?.token || null,
            tokenCount: grammar?.tokenCount || 0
        },
        decision,
        execution,
        governance,
        trace
    };
}

function getQueuedJobId(queued) {
    return queued?.data?.job?.id || null;
}

function buildJobQueueResponse(queued, lifecycle) {
    const finalJob = lifecycle?.finalize?.data?.job || lifecycle?.run?.data?.job || queued?.data?.job || null;

    return {
        ok: queued?.ok || false,
        status: queued?.status || 0,
        response: {
            success: queued?.data?.success || false,
            job: finalJob
        },
        lifecycle
    };
}

function emitRealtimeDecision(payload) {
    try {
        sheikhaRealtimeHub.emitEvent('sheikha.command.executed', payload);
        sheikhaRealtimeHub.emitEvent('decision.workflow.completed', payload);
    } catch (error) {
        console.warn('[sheikha-code-decision] realtime emit failed:', error.message);
    }
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

    let data;
    try {
        data = await response.json();
    } catch (error) {
        console.warn('[sheikha-code-decision] invalid JSON response:', error.message);
        data = {
            success: false,
            message: 'تعذر قراءة استجابة JSON من الخدمة الداخلية'
        };
    }

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

async function executeViaOrchestrator(command, grammar) {
    const payload = {
        command,
        grammar,
        source: 'sheikha-code-decision'
    };

    return callInternalApi('/api/execution-orchestrator/auto', payload, 'POST');
}

async function enqueueDecisionJob(workflowTrail) {
    return callInternalApi('/api/jobs/enqueue', {
        type: 'sheikha-decision-workflow',
        status: 'queued',
        payload: workflowTrail
    }, 'POST');
}

async function advanceJobLifecycle(queued, lifecycle = {}) {
    const jobId = getQueuedJobId(queued);
    if (!jobId) {
        return {
            jobId: null,
            run: null,
            finalize: null
        };
    }

    const run = await callInternalApi(`/api/jobs/run/${jobId}`, {}, 'POST');
    let finalize;

    if (lifecycle.success) {
        finalize = await callInternalApi(`/api/jobs/done/${jobId}`, {
            result: lifecycle.result || {}
        }, 'POST');
    } else {
        finalize = await callInternalApi(`/api/jobs/fail/${jobId}`, {
            error: lifecycle.error || 'workflow_failed'
        }, 'POST');
    }

    return {
        jobId,
        run,
        finalize
    };
}

async function handleBlockedCommand(command) {
    const governance = buildGovernanceTrace(command, null, false);
    const workflowTrail = buildWorkflowTrail(
        command,
        null,
        { target: 'blocked', operation: 'denied' },
        { status: 403, routed: null },
        governance,
        [{ step: 'governance', ok: false, reason: 'no_harm_violation' }]
    );
    const queued = await enqueueDecisionJob(workflowTrail);
    const lifecycle = await advanceJobLifecycle(queued, {
        success: false,
        error: 'no_harm_violation'
    });

    emitRealtimeDecision({
        command,
        target: 'blocked',
        operation: 'denied',
        success: false,
        reason: 'no_harm_violation',
        jobId: lifecycle.jobId,
        timestamp: now()
    });

    return {
        status: 403,
        body: {
            success: false,
            data: {
                governance,
                workflowTrail,
                jobQueue: buildJobQueueResponse(queued, lifecycle)
            },
            message: 'تم رفض الأمر لمخالفة قاعدة لا ضرر ولا ضرار',
            timestamp: now()
        }
    };
}

async function executeDecisionFlow(command, grammar, bridgeResult, trace) {
    if (bridgeResult) {
        const execution = await callInternalApi(bridgeResult.target, bridgeResult.payload, 'POST');
        trace.push({
            step: 'cs-language',
            ok: execution.ok,
            status: execution.status,
            endpoint: bridgeResult.target
        });

        if (execution.ok) {
            const decisionSnapshot = bridgeResult.decision || {
                target: 'cs-language',
                operation: bridgeResult.payload.operation,
                routedTo: bridgeResult.target
            };
            const governance = buildGovernanceTrace(command, decisionSnapshot, true);
            const workflowTrail = buildWorkflowTrail(
                command,
                grammar,
                decisionSnapshot,
                {
                    status: execution.status,
                    routed: bridgeResult.target,
                    response: execution.data
                },
                governance,
                trace
            );
            const queued = await enqueueDecisionJob(workflowTrail);
            const lifecycle = await advanceJobLifecycle(queued, {
                success: true,
                result: {
                    decision: decisionSnapshot,
                    executionStatus: execution.status
                }
            });

            emitRealtimeDecision({
                command,
                target: decisionSnapshot.target,
                operation: decisionSnapshot.operation,
                success: true,
                jobId: lifecycle.jobId,
                timestamp: now()
            });
            const executionTargetName = decisionSnapshot.target === 'execution-orchestrator'
                ? 'execution-orchestrator'
                : 'cs-language';

            return {
                status: 200,
                body: {
                    success: true,
                    data: {
                        decision: decisionSnapshot,
                        grammar,
                        execution: {
                            status: execution.status,
                            routed: bridgeResult.target,
                            response: execution.data
                        },
                        trace,
                        governance,
                        workflowTrail,
                        jobQueue: buildJobQueueResponse(queued, lifecycle)
                    },
                    message: `تم اتخاذ القرار والتنفيذ عبر ${executionTargetName} بنجاح`,
                    timestamp: now()
                }
            };
        }
    } else {
        trace.push({
            step: 'cs-language',
            ok: false,
            status: 422,
            endpoint: '/api/cs-language/execute',
            reason: 'unsupported_operation'
        });
    }

    const orchestratorExecution = await executeViaOrchestrator(command, grammar);
    trace.push({
        step: 'execution-orchestrator',
        ok: orchestratorExecution.ok,
        status: orchestratorExecution.status,
        endpoint: '/api/execution-orchestrator/auto'
    });

    const fallbackDecision = {
        target: 'execution-orchestrator',
        operation: bridgeResult ? bridgeResult.payload.operation : 'auto',
        routedTo: '/api/execution-orchestrator/auto',
        reason: bridgeResult ? 'cs_execution_failed' : 'unsupported_for_cs_language'
    };
    const governance = buildGovernanceTrace(command, {
        target: 'execution-orchestrator',
        operation: bridgeResult ? bridgeResult.payload.operation : 'auto'
    }, orchestratorExecution.ok);
    const workflowTrail = buildWorkflowTrail(
        command,
        grammar,
        fallbackDecision,
        {
            status: orchestratorExecution.status,
            routed: '/api/execution-orchestrator/auto',
            response: orchestratorExecution.data
        },
        governance,
        trace
    );
    const queued = await enqueueDecisionJob(workflowTrail);
    const lifecycle = await advanceJobLifecycle(queued, {
        success: orchestratorExecution.ok,
        result: {
            decision: fallbackDecision,
            executionStatus: orchestratorExecution.status
        },
        error: orchestratorExecution.ok ? null : 'orchestrator_fallback_failed'
    });

    emitRealtimeDecision({
        command,
        target: fallbackDecision.target,
        operation: fallbackDecision.operation,
        success: orchestratorExecution.ok,
        reason: fallbackDecision.reason,
        jobId: lifecycle.jobId,
        timestamp: now()
    });

    return {
        status: orchestratorExecution.ok ? 200 : 502,
        body: {
            success: orchestratorExecution.ok,
            data: {
                decision: fallbackDecision,
                grammar,
                execution: {
                    status: orchestratorExecution.status,
                    routed: '/api/execution-orchestrator/auto',
                    response: orchestratorExecution.data
                },
                trace,
                governance,
                workflowTrail,
                jobQueue: buildJobQueueResponse(queued, lifecycle)
            },
            message: orchestratorExecution.ok
                ? 'تم التوجيه تلقائياً إلى orchestrator والتنفيذ بنجاح'
                : 'فشل التنفيذ عبر cs-language وorchestrator',
            timestamp: now()
        }
    };
}

function extractPmAction(command) {
    const pmRegex = /pm\s*([1-4])/i;
    const pmMatch = pmRegex.exec(String(command || ''));
    return pmMatch ? `ACTIVATE_PM${pmMatch[1]}` : null;
}

function createCsPlan(operation, payload) {
    return {
        target: '/api/cs-language/execute',
        payload,
        decision: {
            target: 'cs-language',
            operation,
            routedTo: '/api/cs-language/execute'
        }
    };
}

function createPmPlan(pmAction) {
    return {
        target: '/api/execution-orchestrator/manual',
        payload: {
            action: pmAction
        },
        decision: {
            target: 'execution-orchestrator',
            operation: pmAction.toLowerCase(),
            routedTo: '/api/execution-orchestrator/manual'
        }
    };
}

function resolveGrammarIntent(verb, text, pmAction) {
    const verbMap = {
        sort: ['رتب', 'فرز'],
        search: ['ابحث', 'فتش', 'اعثر'],
        hash: ['هاش', 'شفر', 'بصم'],
        convert: ['حول', 'حوّل', 'بدل'],
        zakat: ['احسب', 'زكاة'],
        pm: ['فعل', 'فعّل', 'شغل', 'نفذ']
    };

    const checks = [
        { key: 'sort', regex: /sort/, requirePm: false },
        { key: 'search', regex: /search/, requirePm: false },
        { key: 'hash', regex: /hash/, requirePm: false },
        { key: 'convert', regex: /convert|base/, requirePm: false },
        { key: 'zakat', regex: /zakat/, requirePm: false },
        { key: 'pm', regex: /pm\s*[1-4]/i, requirePm: true }
    ];

    for (const check of checks) {
        const matchedByVerb = verbMap[check.key].includes(verb);
        const matchedByText = check.regex.test(text);
        if ((matchedByVerb || matchedByText) && (!check.requirePm || pmAction)) {
            return check.key;
        }
    }

    return null;
}

function buildGrammarDrivenDecision(command, grammar) {
    if (!grammar || !Array.isArray(grammar.tokens)) {
        return null;
    }

    const text = String(command || '').toLowerCase();
    const verb = findVerb(grammar, command);
    const numbers = extractNumbers(command);
    const pmAction = extractPmAction(command);
    const intent = resolveGrammarIntent(verb, text, pmAction);

    const builders = {
        sort: () => bridgeToCsLanguage({ text: command }) || createCsPlan('sort', {
            operation: 'sort',
            values: numbers
        }),
        search: () => createCsPlan('search', {
            operation: 'search',
            values: numbers,
            target: numbers.length ? numbers[0] : 0
        }),
        hash: () => createCsPlan('hash', {
            operation: 'hash',
            text: command,
            mode: /sha512/.test(text) ? 'sha512' : 'sha256'
        }),
        convert: () => createCsPlan('convert', {
            operation: 'convert',
            value: numbers.length ? String(numbers[0]) : '0',
            baseFrom: 10,
            baseTo: /ثنائي|binary|base\s*2/.test(text) ? 2 : 16
        }),
        zakat: () => bridgeToCsLanguage({ text: command }) || createCsPlan('zakat', {
            operation: 'zakat',
            amount: numbers.length ? numbers[0] : 0
        }),
        pm: () => (pmAction ? createPmPlan(pmAction) : null)
    };

    const builder = intent ? builders[intent] : null;
    return builder ? builder() : null;
}

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            service: 'sheikha-code-decision',
            status: 'ready',
            route: '/api/sheikha-code-decision/command'
        },
        message: 'محرك القرار جاهز',
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

    if (/(احذف\s+كل|drop\s+database|wipe|اتلف|دمر|خرّب)/i.test(command)) {
        const blocked = await handleBlockedCommand(command);
        return res.status(blocked.status).json(blocked.body);
    }

    let grammar = null;
    try {
        grammar = grammarEngine.analyze(command);
    } catch (error) {
        console.warn('[sheikha-code-decision] grammar analyze failed:', error.message);
        grammar = null;
    }

    const grammarDecision = buildGrammarDrivenDecision(command, grammar);
    const bridgeResult = grammarDecision || bridgeToCsLanguage({ text: command });
    const trace = [];

    if (grammarDecision) {
        const detectedVerb = grammar?.tokens?.find((token) => token.role === 'verb')?.token || null;
        trace.push({
            step: 'grammar-decision',
            ok: true,
            reason: 'verb_intent_detected',
            verb: detectedVerb
        });
    } else {
        trace.push({
            step: 'grammar-decision',
            ok: false,
            reason: 'no_direct_mapping'
        });
    }

    const result = await executeDecisionFlow(command, grammar, bridgeResult, trace);
    return res.status(result.status).json(result.body);
});

module.exports = router;
module.exports.router = router;
