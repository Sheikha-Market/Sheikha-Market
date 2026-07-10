'use strict';

const MANDATORY_MARKET_CONTROLS = ['احتكار', 'غش', 'ضرر'];
const MARKET_ENTITY_PATTERN = /سوق|صفقة|تجارة|market|trade|deal/i;
const PROHIBITED_TOKENS = ['ربا', 'غرر'];
const BLOCKED_ADAPTER_ACTIONS = ['prune', 'rm', 'rmi', 'kill'];
const REQUIRED_POLICY_VALUES = ['الصدق', 'العدل', 'الأمانة', 'الدليل'];
const REQUIRED_POLICY_PROHIBITIONS = ['الضرر', 'الظلم', 'الغش', 'الخداع', 'الإكراه'];

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
    if (step.op === 'VALUES_REFERENCE_END') {
        verifyValuesReference(state, step);
    }

    if (step.op === 'GOVERNANCE_POLICY_END') {
        verifyGovernancePolicy(state, step);
    }

    if (step.op === 'REASONING_METHODOLOGY_END') {
        verifyReasoningMethodology(state, step);
    }

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

function verifyValuesReference(state, step) {
    const reference = state.valuesReferences?.[step.name];
    const properties = reference?.properties || {};
    const valid = reference?.executable === false &&
        String(properties['الدور'] || '').includes('غير_تنفيذية') &&
        String(properties['السلطة_البرمجية'] || '') === 'لا' &&
        String(properties['الفتوى_الآلية'] || '').includes('ممنوع') &&
        String(properties['المراجعة_الشرعية'] || '').includes('أهل_العلم') &&
        String(properties['التحقق_من_المصادر'] || '').includes('واجب');
    addRuntimeGovernanceResult(
        state,
        step,
        'non-executable-values-reference',
        valid,
        'المرجعية قيمية غير تنفيذية ولا تصدر فتوى آلية.',
        'مرجعية القيم لا تستوفي حدود عدم التنفيذ والمراجعة المؤهلة.'
    );
}

function verifyGovernancePolicy(state, step) {
    const policy = state.governancePolicies?.[step.name] || {};
    const requiredValuesPresent = REQUIRED_POLICY_VALUES.every((value) => (
        String(policy['يوجب'] || '').includes(value)
    ));
    const prohibitionsPresent = REQUIRED_POLICY_PROHIBITIONS.every((value) => (
        String(policy['يمنع'] || '').includes(value)
    ));
    const humanReview = String(policy['القرار_العالي_الأثر'] || '').includes('مراجعة_بشرية');
    const leastPrivilege = String(policy['التنفيذ'] || '').includes('أقل_صلاحية');
    const explicitConsent = String(policy['التنفيذ'] || '').includes('موافقة_صريحة');
    addRuntimeGovernanceResult(
        state,
        step,
        'public-benefit-governance-policy',
        requiredValuesPresent && prohibitionsPresent && humanReview && leastPrivilege && explicitConsent,
        'سياسة النفع تلتزم بالدليل ومنع الضرر والمراجعة البشرية.',
        'سياسة النفع ناقصة الضوابط الملزمة.'
    );
}

function verifyReasoningMethodology(state, step) {
    const methodology = state.reasoningMethodologies?.[step.name] || {};
    const arabicSciences = ['النحو', 'الصرف', 'البلاغة', 'البيان'].every((value) => (
        String(methodology['علوم_العربية'] || '').includes(value)
    ));
    const reasoningSciences = ['المنطق', 'الحجة', 'البرهان', 'الاستدلال'].every((value) => (
        String(methodology['علوم_الاستدلال'] || '').includes(value)
    ));
    const mathematicalMethod = ['تعريفات', 'مسلمات', 'برهان', 'اختبار'].every((value) => (
        String(methodology['منهج_الحساب'] || '').includes(value)
    ));
    const empiricalMethod = ['ملاحظة', 'قياس', 'تجربة', 'تكرار'].every((value) => (
        String(methodology['منهج_العلوم_التجريبية'] || '').includes(value)
    ));
    const religiousEvidence = ['القرآن_الكريم', 'السنة_الصحيحة', 'أهل_العلم'].every((value) => (
        String(methodology['الاستدلال_الشرعي'] || '').includes(value)
    ));
    const valid = String(methodology['لغة_البرمجة'] || '').includes('العربية') &&
        arabicSciences &&
        reasoningSciences &&
        mathematicalMethod &&
        empiricalMethod &&
        religiousEvidence &&
        String(methodology['خلط_المجالات'] || '').includes('ممنوع') &&
        String(methodology['بيان_الدليل_والثقة'] || '').includes('واجب') &&
        String(methodology['الفتوى_الآلية'] || '').includes('ممنوع');
    addRuntimeGovernanceResult(
        state,
        step,
        'arabic-science-reasoning-methodology',
        valid,
        'منهج العربية والحساب والعلوم والاستدلال موثق بحدود مجاله.',
        'منهج العربية والعلوم والاستدلال ناقص الدليل أو حدود المجال.'
    );
}

function addRuntimeGovernanceResult(state, step, rule, valid, passDetail, failDetail) {
    addCheck(state, {
        rule,
        status: valid ? 'pass' : 'fail',
        detail: valid ? passDetail : failDetail,
        step,
    });
    if (!valid) {
        addViolation(state, {
            rule,
            severity: 'critical',
            detail: failDetail,
            step,
        });
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
