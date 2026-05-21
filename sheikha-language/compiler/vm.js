'use strict';

const childProcess = require('node:child_process');
const governance = require('./governance');
const sandboxPolicy = require('./sandbox-policy');

function runIR(ir, options = {}) {
    const state = createState(options);
    const steps = Array.isArray(ir.steps) ? ir.steps : [];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        governance.beforeStep(state, step);
        const result = executeStep(state, step, options);
        governance.afterStep(state, step, result);
        pushTrace(state, step, i);
    }

    const ok = state.governance.violations.length === 0;
    return {
        ok,
        status: ok ? 'passed' : 'blocked',
        state,
    };
}

function createState(options) {
    const profile = options.profile || 'local';
    const strictIsolation = typeof options.strictIsolation === 'boolean' ? options.strictIsolation : undefined;
    const sandbox = sandboxPolicy.resolveSandboxPolicy(profile, strictIsolation);

    return {
        entities: {},
        procedures: {},
        activeProcedure: null,
        directives: [],
        output: [],
        decisions: [],
        flags: options.flags || {},
        adapters: {
            dryRun: options.live !== true,
            calls: [],
        },
        sandbox,
        neural: {
            cells: 19,
            status: 'online',
            executionGraph: {
                nodes: [],
                edges: [],
            },
        },
        governance: governance.createGovernance(),
    };
}

function executeStep(state, step, options) {
    switch (step.op) {
    case 'DIRECTIVE':
        state.directives.push(step.name);
        return null;
    case 'ENTITY_BEGIN':
        state.entities[step.name] = state.entities[step.name] || {};
        return null;
    case 'ENTITY_PROPERTY':
        state.entities[step.entity] = state.entities[step.entity] || {};
        state.entities[step.entity][step.key] = step.value;
        return null;
    case 'ENTITY_END':
        return null;
    case 'PROCEDURE_BEGIN':
        state.activeProcedure = step.name;
        state.procedures[step.name] = state.procedures[step.name] || { properties: {}, commands: [] };
        return null;
    case 'PROCEDURE_PROPERTY':
        state.procedures[step.procedure] = state.procedures[step.procedure] || { properties: {}, commands: [] };
        state.procedures[step.procedure].properties[step.key] = step.value;
        return null;
    case 'COMMAND':
        return executeCommand(state, step);
    case 'IF':
        return executeIf(state, step, options);
    case 'PROCEDURE_END':
        state.activeProcedure = null;
        return null;
    default:
        return null;
    }
}

function executeIf(state, step, options) {
    const isTrue = evaluateCondition(step.condition, state, options);
    const inlineSteps = isTrue ? step.thenSteps : step.elseSteps;
    for (const nestedStep of inlineSteps) {
        governance.beforeStep(state, nestedStep);
        const result = executeStep(state, nestedStep, options);
        governance.afterStep(state, nestedStep, result);
    }
    return { kind: 'if', condition: step.condition, branch: isTrue ? 'then' : 'else' };
}

function evaluateCondition(condition, state, options) {
    const raw = String(condition || '');
    if (options.forceConditionTrue === true) {
        return true;
    }
    if (options.forceConditionFalse === true) {
        return false;
    }

    if (raw.includes('غش')) {
        const allEntityText = JSON.stringify(state.entities);
        return allEntityText.includes('غش');
    }

    return raw.length > 0;
}

function executeCommand(state, step) {
    state.procedures[step.procedure] = state.procedures[step.procedure] || { properties: {}, commands: [] };
    state.procedures[step.procedure].commands.push({
        command: step.command,
        argument: step.argument,
    });

    if (step.command === 'اعرض') {
        state.output.push(step.argument);
        return { kind: 'output', text: step.argument };
    }

    if (step.command === 'ارفض') {
        state.decisions.push({ type: 'reject', reason: step.argument });
        state.output.push(`رفض: ${step.argument}`);
        return { kind: 'rejection', reason: step.argument };
    }

    if (step.command === 'أجز') {
        state.decisions.push({ type: 'approve', reason: step.argument });
        state.output.push(`إجازة: ${step.argument}`);
        return { kind: 'approval', reason: step.argument };
    }

    if (isAdapterCommand(step.command)) {
        return executeAdapter(state, step);
    }

    state.output.push(`${step.command}: ${step.argument}`);
    return { kind: 'command', command: step.command };
}

function isAdapterCommand(command) {
    return command === 'API' || command === 'PM2' || command === 'DOCKER' || command === 'نداء_api' || command === 'تحكم_pm2' || command === 'تحكم_docker';
}

function executeAdapter(state, step) {
    if (step.command === 'API' || step.command === 'نداء_api') {
        return runApiAdapter(state, step);
    }
    if (step.command === 'PM2' || step.command === 'تحكم_pm2') {
        return runPm2Adapter(state, step);
    }
    return runDockerAdapter(state, step);
}

function runApiAdapter(state, step) {
    const args = parseArgs(step.argument);
    const method = (args[0] || 'GET').toUpperCase();
    const url = args[1] || '';

    if (!url) {
        const message = 'API adapter requires method and url';
        state.output.push(`[API:FAIL] ${message}`);
        return recordAdapterCall(state, 'api', method, false, message, false);
    }

    const policyCheck = sandboxPolicy.checkApiTarget(state.sandbox, url);
    if (!policyCheck.allowed) {
        const message = `[API:SANDBOX_DENY] ${policyCheck.reason}`;
        state.output.push(message);
        return recordAdapterCall(state, 'api', method, false, message, false, { url });
    }

    if (state.adapters.dryRun) {
        const msg = `[API:DRY] ${method} ${url}`;
        state.output.push(msg);
        return recordAdapterCall(state, 'api', method, true, msg, false, { url });
    }

    const curlCommand = `curl -s -o /dev/null -w "%{http_code}" -X ${escapeShellArg(method)} ${escapeShellArg(url)}`;
    const shell = runShell(curlCommand);
    const ok = shell.ok && /^[23]/.test(shell.stdout.trim());
    const detail = ok ? `[API:OK] ${method} ${url} -> ${shell.stdout.trim()}` : `[API:FAIL] ${method} ${url} -> ${shell.stdout.trim() || shell.stderr}`;
    state.output.push(detail);
    return recordAdapterCall(state, 'api', method, ok, detail, true, { url });
}

function runPm2Adapter(state, step) {
    const args = parseArgs(step.argument);
    const action = (args[0] || 'status').toLowerCase();
    const processName = args[1] || 'sheikha-api';
    const allow = new Set(['status', 'restart', 'start', 'stop', 'logs']);

    if (!allow.has(action)) {
        const message = `[PM2:DENY] action not allowed: ${action}`;
        state.output.push(message);
        return recordAdapterCall(state, 'pm2', action, false, message, false, { processName });
    }

    const policyCheck = sandboxPolicy.checkPm2Target(state.sandbox, processName);
    if (!policyCheck.allowed) {
        const message = `[PM2:SANDBOX_DENY] ${policyCheck.reason}`;
        state.output.push(message);
        return recordAdapterCall(state, 'pm2', action, false, message, false, { processName });
    }

    if (state.adapters.dryRun) {
        const message = `[PM2:DRY] ${action} ${processName}`;
        state.output.push(message);
        return recordAdapterCall(state, 'pm2', action, true, message, false, { processName });
    }

    const cmd = action === 'status'
        ? `pm2 describe ${escapeShellArg(processName)}`
        : `pm2 ${action} ${escapeShellArg(processName)}`;
    const shell = runShell(cmd);
    const ok = shell.ok;
    const message = ok ? `[PM2:OK] ${action} ${processName}` : `[PM2:FAIL] ${action} ${processName} -> ${shell.stderr || shell.stdout}`;
    state.output.push(message);
    return recordAdapterCall(state, 'pm2', action, ok, message, true, { processName });
}

function runDockerAdapter(state, step) {
    const args = parseArgs(step.argument);
    const action = (args[0] || 'ps').toLowerCase();
    const target = args[1] || '';
    const allow = new Set(['ps', 'images', 'inspect', 'logs', 'start', 'stop']);

    if (!allow.has(action)) {
        const message = `[DOCKER:DENY] action not allowed: ${action}`;
        state.output.push(message);
        return recordAdapterCall(state, 'docker', action, false, message, false, { target });
    }

    if ((action === 'inspect' || action === 'logs' || action === 'start' || action === 'stop') && !target) {
        const message = `[DOCKER:FAIL] ${action} requires target`;
        state.output.push(message);
        return recordAdapterCall(state, 'docker', action, false, message, false, { target });
    }

    const policyCheck = sandboxPolicy.checkDockerTarget(state.sandbox, action, target);
    if (!policyCheck.allowed) {
        const message = `[DOCKER:SANDBOX_DENY] ${policyCheck.reason}`;
        state.output.push(message);
        return recordAdapterCall(state, 'docker', action, false, message, false, { target });
    }

    if (state.adapters.dryRun) {
        const targetSuffix = target ? ' ' + target : '';
        const message = `[DOCKER:DRY] ${action}${targetSuffix}`;
        state.output.push(message);
        return recordAdapterCall(state, 'docker', action, true, message, false, { target });
    }

    const cmd = buildDockerCommand(action, target);
    const shell = runShell(cmd);
    const ok = shell.ok;
    const targetSuffix = target ? ' ' + target : '';
    let message = `[DOCKER:OK] ${action}${targetSuffix}`;
    if (!ok) {
        message = `[DOCKER:FAIL] ${action}${targetSuffix} -> ${shell.stderr || shell.stdout}`;
    }
    state.output.push(message);
    return recordAdapterCall(state, 'docker', action, ok, message, true, { target });
}

function buildDockerCommand(action, target) {
    if (action === 'ps') {
        return String.raw`docker ps --format "table {{.Names}}\t{{.Status}}"`;
    }
    if (action === 'images') {
        return String.raw`docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"`;
    }
    if (action === 'inspect') {
        return `docker inspect ${escapeShellArg(target)}`;
    }
    if (action === 'logs') {
        return `docker logs --tail 100 ${escapeShellArg(target)}`;
    }
    if (action === 'start') {
        return `docker start ${escapeShellArg(target)}`;
    }
    if (action === 'stop') {
        return `docker stop ${escapeShellArg(target)}`;
    }
    return 'docker ps';
}

function parseArgs(argument) {
    const input = String(argument || '').trim();
    if (!input) {
        return [];
    }
    const match = input.match(/"[^"]*"|\S+/g) || [];
    return match.map((v) => v.replace(/^"|"$/g, ''));
}

function escapeShellArg(value) {
    const escaped = String(value).replaceAll("'", "'\"'\"'");
    return `'${escaped}'`;
}

function runShell(command) {
    try {
        const stdout = childProcess.execSync(command, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 15000,
        });
        return {
            ok: true,
            stdout: String(stdout || '').trim(),
            stderr: '',
        };
    } catch (error) {
        return {
            ok: false,
            stdout: String(error.stdout || '').trim(),
            stderr: String(error.stderr || error.message || '').trim(),
        };
    }
}

function recordAdapterCall(state, adapter, action, ok, message, live, meta = {}) {
    const result = {
        kind: 'adapter',
        adapter,
        action,
        ok,
        message,
        live,
        ...meta,
    };
    state.adapters.calls.push(result);
    return result;
}

function pushTrace(state, step, index) {
    const nodeId = `n${index + 1}`;
    state.neural.executionGraph.nodes.push({
        id: nodeId,
        label: step.op,
        procedure: step.procedure || null,
    });
    if (index > 0) {
        state.neural.executionGraph.edges.push({
            from: `n${index}`,
            to: nodeId,
        });
    }
}

module.exports = {
    runIR,
};
