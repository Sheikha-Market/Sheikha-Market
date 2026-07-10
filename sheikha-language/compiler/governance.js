'use strict';

const MANDATORY_MARKET_CONTROLS = ['احتكار', 'غش', 'ضرر'];
const MARKET_ENTITY_PATTERN = /سوق|صفقة|تجارة|market|trade|deal/i;
const PROHIBITED_TOKENS = ['ربا', 'غرر'];
const BLOCKED_ADAPTER_ACTIONS = ['prune', 'rm', 'rmi', 'kill'];

function createGovernance() {
    return {
        checks: [],
        violations: [],
    };
}

function addCheck(state, check) {
    state.governance.checks.push({
        ...check,
        ts: new Date().toISOString(),
    });
}

function addViolation(state, violation) {
    state.governance.violations.push({
        ...violation,
        ts: new Date().toISOString(),
    });
}

function containsAny(text, values) {
    return values.filter((value) => String(text).includes(value));
}

function beforeStep(state, step) {
    if (
        step.op === 'ENTITY_PROPERTY' &&
        step.key === 'منع' &&
        MARKET_ENTITY_PATTERN.test(String(step.entity || ''))
    ) {
        const missing = MANDATORY_MARKET_CONTROLS.filter((value) => !String(step.value).includes(value));
        addCheck(state, {
            rule: 'market-controls-required',
            status: missing.length === 0 ? 'pass' : 'fail',
            detail: missing.length === 0 ? 'ضوابط السوق مكتملة' : `ضوابط ناقصة: ${missing.join('، ')}`,
            step,
        });
        if (missing.length > 0) {
            addViolation(state, {
                rule: 'market-controls-required',
                severity: 'high',
                detail: `يجب تضمين: ${missing.join('، ')}`,
                step,
            });
        }
    }

    if (step.op === 'COMMAND' && (step.command === 'DOCKER' || step.command === 'تحكم_docker' || step.command === 'PM2' || step.command === 'تحكم_pm2')) {
        const firstToken = String(step.argument || '').trim().split(/\s+/)[0]?.toLowerCase() || '';
        const blocked = BLOCKED_ADAPTER_ACTIONS.includes(firstToken);
        addCheck(state, {
            rule: 'adapter-action-allowlist',
            status: blocked ? 'fail' : 'pass',
            detail: blocked ? `إجراء محظور: ${firstToken}` : 'إجراء adapter ضمن القائمة المسموحة',
            step,
        });
        if (blocked) {
            addViolation(state, {
                rule: 'adapter-action-allowlist',
                severity: 'critical',
                detail: `لا يسمح بتنفيذ ${firstToken} داخل بيئة لغة شيخة`,
                step,
            });
        }
    }
}

function afterStep(state, step, result) {
    if (step.op === 'COMMAND') {
        const hit = containsAny(step.argument, PROHIBITED_TOKENS);
        addCheck(state, {
            rule: 'prohibited-financial-patterns',
            status: hit.length === 0 ? 'pass' : 'fail',
            detail: hit.length === 0 ? 'لا توجد عبارات ربا/غرر' : `عبارات ممنوعة: ${hit.join('، ')}`,
            step,
        });
        if (hit.length > 0) {
            addViolation(state, {
                rule: 'prohibited-financial-patterns',
                severity: 'critical',
                detail: `تم رصد ${hit.join('، ')} في مخرجات التشغيل`,
                step,
            });
        }
    }

    if (result?.kind === 'approval' && state.governance.violations.length > 0) {
        addViolation(state, {
            rule: 'approval-with-open-violations',
            severity: 'critical',
            detail: 'لا يجوز إصدار قبول مع وجود مخالفات حوكمة مفتوحة',
            step,
        });
    }

    if (result?.kind === 'adapter') {
        addCheck(state, {
            rule: 'adapter-execution-status',
            status: result.ok ? 'pass' : 'fail',
            detail: result.message,
            step,
        });
        if (!result.ok) {
            addViolation(state, {
                rule: 'adapter-execution-status',
                severity: result.live ? 'high' : 'medium',
                detail: result.message,
                step,
            });
        }
    }
}

module.exports = {
    createGovernance,
    beforeStep,
    afterStep,
};
