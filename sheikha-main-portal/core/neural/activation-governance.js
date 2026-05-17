'use strict';

const PLATFORM_SCOPE = Object.freeze({
    boundary: 'sheikha-platform',
    applied: 'platform-internal',
    descriptionAr: 'التفعيل محصور داخل حدود المنصة ووحداتها الداخلية القابلة للتحقق',
    excludes: [
        'external-unbounded-networks',
        'cosmic-or-unverifiable-claims',
    ],
});

const SHARIAH_CONTROLS = Object.freeze([
    'no-riba',
    'no-gharar',
    'transparency',
]);

const OPERATIONAL_CONTROLS = Object.freeze([
    'input-verification',
    'governance',
    'measurable-readiness',
    'manual-dispatch-report',
]);

const RESTRICTED_SCOPE_PATTERN = /(cosmic|universe|all\s+networks|unbounded|external-all|الكون|كل\s*الشبكات|جميع\s*الشبكات)/i;

function normalizeActivationInput(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return {
            type: 'general',
            data: input ?? {},
            context: '',
            requestedScope: PLATFORM_SCOPE.applied,
        };
    }

    return {
        ...input,
        type: typeof input.type === 'string' && input.type.trim()
            ? input.type.trim()
            : 'general',
        data: input.data ?? {},
        context: typeof input.context === 'string' ? input.context : '',
        requestedScope: input.scope || input.targetScope || input.requestedScope || PLATFORM_SCOPE.applied,
    };
}

function buildScopeReport(requestedScope = PLATFORM_SCOPE.applied) {
    const requested = typeof requestedScope === 'string' && requestedScope.trim()
        ? requestedScope.trim()
        : PLATFORM_SCOPE.applied;
    const restricted = requested !== PLATFORM_SCOPE.applied &&
        requested !== 'platform' &&
        requested !== 'internal-platform';

    return {
        ...PLATFORM_SCOPE,
        requested,
        restricted: restricted || RESTRICTED_SCOPE_PATTERN.test(requested),
        withinPlatformBoundary: true,
    };
}

function detectShariahViolations(data = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];

    const violations = [];
    const interestRate = Number(data.interestRate || data.interest || 0);
    const dataType = String(data.type || '');

    if (interestRate > 0 || data.riba === true || /interest/i.test(dataType)) {
        violations.push('riba');
    }

    if (data.gharar === true || data.priceUnknown === true || data.quantityUnknown === true) {
        violations.push('gharar');
    }

    return violations;
}

function buildComplianceReport({ requestedScope = PLATFORM_SCOPE.applied, data = {}, context = '' } = {}) {
    const scope = buildScopeReport(requestedScope);
    const violations = detectShariahViolations(data);
    const hasTransparentInput = Boolean(
        (typeof context === 'string' && context.trim()) ||
        (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0)
    );

    return {
        scope,
        shariah: {
            controls: SHARIAH_CONTROLS,
            noRiba: !violations.includes('riba'),
            noGharar: !violations.includes('gharar'),
            transparency: hasTransparentInput,
            violations,
        },
        operations: {
            controls: OPERATIONAL_CONTROLS,
            verificationRequired: true,
            governanceRequired: true,
            measurableReadiness: true,
            manualDispatchSupported: true,
        },
        compliant: scope.withinPlatformBoundary && violations.length === 0,
    };
}

module.exports = {
    PLATFORM_SCOPE,
    SHARIAH_CONTROLS,
    OPERATIONAL_CONTROLS,
    normalizeActivationInput,
    buildScopeReport,
    buildComplianceReport,
};
