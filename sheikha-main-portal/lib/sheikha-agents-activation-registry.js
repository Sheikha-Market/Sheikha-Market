/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA Agents Activation Registry — سجل الوكلاء الرسمي للتفعيل         ║
 * ║   تحديد نطاق التفعيل الرسمي، الحدود، وسياسات الحوكمة                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ﴾ — التوبة: ١٠٥
 *
 * هذا السجل يُعرِّف رسمياً:
 *   ① جميع وكلاء شيخة (البرمجة + التشغيل)
 *   ② نطاق التكامل الداخلي والخارجي
 *   ③ سياسات الحوكمة والامتثال الشرعي
 *   ④ حدود الصلاحيات لكل وكيل
 *
 * @module lib/sheikha-agents-activation-registry
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

// ─── ثوابت الهوية ────────────────────────────────────────────────────────────

const REGISTRY_VERSION = '1.0.0';
const REGISTRY_ID      = 'SHEIKHA-AGENTS-ACTIVATION-REGISTRY';
const TAWHEED          = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH        = 'بسم الله الرحمن الرحيم';

// ─── أنواع الوكلاء ────────────────────────────────────────────────────────────

/** @enum {string} */
const AGENT_TYPE = Object.freeze({
    CODING:      'coding',       // وكيل البرمجة
    OPERATIONAL: 'operational',  // وكيل التشغيل
    SECURITY:    'security',     // وكيل الأمن
    INTELLIGENCE:'intelligence', // وكيل الذكاء
    GOVERNANCE:  'governance',   // وكيل الحوكمة
    INTEGRATION: 'integration',  // وكيل التكامل
    NEURAL:      'neural',       // وكيل شبكة الخلايا
});

/** @enum {string} */
const AGENT_STATUS = Object.freeze({
    ACTIVE:    'active',
    STANDBY:   'standby',
    DISABLED:  'disabled',
});

/** @enum {string} */
const BOUNDARY_SCOPE = Object.freeze({
    INTERNAL:  'internal',   // داخل منصة شيخة فقط
    EXTERNAL:  'external',   // تكاملات خارجية مُعتمدة
    HYBRID:    'hybrid',     // داخلي + خارجي بموافقة
});

// ─── سياسات الحوكمة العامة ───────────────────────────────────────────────────

const GLOBAL_GOVERNANCE = Object.freeze({
    sharia: {
        noRiba:       true,   // لا ربا
        noGharar:     true,   // لا غرر
        noHaram:      true,   // لا منتجات محرمة
        maqasidFirst: true,   // المقاصد الشرعية أولاً
    },
    data: {
        noPII:           false,  // يُسمح بالبيانات الشخصية المُقيَّدة
        pdplCompliant:   true,   // الامتثال لنظام حماية البيانات الشخصية السعودي
        noSecretsInLogs: true,   // لا أسرار في السجلات
    },
    operations: {
        humanInTheLoop:  true,   // الإنسان مرجع القرار النهائي
        auditTrail:      true,   // سجل تدقيق كامل
        gracefulDegradation: true, // تدهور آمن عند الفشل
    },
    security: {
        jwtRequired:     true,   // JWT إلزامي للعمليات الحساسة
        rateLimiting:    true,   // تحديد معدل الطلبات
        helmetEnabled:   true,   // حماية HTTP headers
    },
});

// ─── تعريفات الوكلاء الرسمية ─────────────────────────────────────────────────

const AGENT_DEFINITIONS = Object.freeze([

    // ① وكلاء البرمجة
    {
        id:          'copilot-coding',
        nameAr:      'وكيل البرمجة الذكي',
        nameEn:      'Copilot Coding Agent',
        type:        AGENT_TYPE.CODING,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'scripts/sheikha-copilot-server.js',
        capabilities: [
            'code-generation',
            'code-review',
            'refactoring',
            'security-scanning',
            'sharia-compliance-check',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
            noExternalDataLeakage: true,
        },
        ayah: '﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١',
    },

    // ② وكيل SDK
    {
        id:          'sdk-server',
        nameAr:      'خادم الـ SDK',
        nameEn:      'Sheikha SDK Server',
        type:        AGENT_TYPE.INTEGRATION,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.HYBRID,
        entryPoint:  'mcp-servers/sheikha-sdk-server.js',
        capabilities: [
            'sdk-api',
            'mcp-protocol',
            'tool-registration',
            'external-integration',
        ],
        governance: {
            requiresAuth: true,
            outputBoundary: 'hybrid',
            rateLimitPerMin: 60,
        },
        ayah: '﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ إِلَى أَهْلِهَا﴾ — النساء: ٥٨',
    },

    // ③ وكيل IDE
    {
        id:          'ide-server',
        nameAr:      'خادم IDE الذكي',
        nameEn:      'Sheikha IDE Server',
        type:        AGENT_TYPE.CODING,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'mcp-servers/sheikha-ide-server.js',
        capabilities: [
            'code-intelligence',
            'diagnostics',
            'auto-complete',
            'symbol-lookup',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
        },
        ayah: '﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾ — طه: ١١٤',
    },

    // ④ وكيل API الرئيسي
    {
        id:          'api-server',
        nameAr:      'وكيل خادم API',
        nameEn:      'Main API Agent',
        type:        AGENT_TYPE.OPERATIONAL,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.HYBRID,
        entryPoint:  'server.js',
        capabilities: [
            'rest-api',
            'market-catalog',
            'auth',
            'orders',
            'analytics',
            'neural-root-api',
        ],
        governance: {
            requiresAuth: true,
            outputBoundary: 'hybrid',
            rateLimitPerMin: 100,
            corsEnabled: true,
        },
        ayah: '﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ — البقرة: ٢٧٥',
    },

    // ⑤ وكيل الذكاء العصبي
    {
        id:          'neural-root',
        nameAr:      'وكيل الشبكة العصبية الجذرية',
        nameEn:      'Neural Root Activator',
        type:        AGENT_TYPE.NEURAL,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'intelligence/sheikha-neural-root-activator.js',
        capabilities: [
            'halal-inference',
            'sharia-compliance',
            'maqasid-assessment',
            'root-ncn-92-cells',
            'snrn-19-cells',
            'neural-cells-12',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
            shariaFirst: true,
            totalCells: 128,
        },
        ayah: '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
    },

    // ⑥ وكيل الأمن
    {
        id:          'security-fabric',
        nameAr:      'وكيل الأمن والحماية',
        nameEn:      'Security Fabric Agent',
        type:        AGENT_TYPE.SECURITY,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'security/sheikha-security-fabric.js',
        capabilities: [
            'jwt-validation',
            'rate-limiting',
            'helmet-headers',
            'input-validation',
            'deny-by-default',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
            denyByDefault: true,
        },
        ayah: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا خُذُوا حِذْرَكُمْ﴾ — النساء: ٧١',
    },

    // ⑦ وكيل الحوكمة
    {
        id:          'governance-fabric',
        nameAr:      'وكيل الحوكمة والسيادة',
        nameEn:      'Governance Fabric Agent',
        type:        AGENT_TYPE.GOVERNANCE,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'governance/sheikha-governance-fabric.js',
        capabilities: [
            'policy-enforcement',
            'sharia-compliance',
            'audit-trail',
            'sovereign-identity',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
            auditAll: true,
        },
        ayah: '﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ﴾ — النحل: ٩٠',
    },

    // ⑧ وكيل الذكاء التشغيلي
    {
        id:          'intelligence-fabric',
        nameAr:      'وكيل الذكاء التشغيلي',
        nameEn:      'Operational Intelligence Agent',
        type:        AGENT_TYPE.INTELLIGENCE,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'intelligence/sheikha-intelligence-fabric.js',
        capabilities: [
            'anomaly-detection',
            'predictive-maintenance',
            'workload-balancing',
            'adaptive-scaling',
            'metric-analysis',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
        },
        ayah: '﴿وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ﴾ — يوسف: ٧٦',
    },

    // ⑨ وكيل التكامل
    {
        id:          'integration-gateway',
        nameAr:      'وكيل بوابة التكامل',
        nameEn:      'Integration Gateway Agent',
        type:        AGENT_TYPE.INTEGRATION,
        status:      AGENT_STATUS.ACTIVE,
        scope:       BOUNDARY_SCOPE.HYBRID,
        entryPoint:  'integration/sheikha-integration-gateway.js',
        capabilities: [
            'external-api-bridge',
            'webhook-handler',
            'data-transform',
            'protocol-translation',
        ],
        governance: {
            requiresAuth: true,
            outputBoundary: 'hybrid',
            externalPartnerList: ['azure', 'google-cloud', 'saudi-gov-apis'],
        },
        ayah: '﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى﴾ — المائدة: ٢',
    },

    // ⑩ وكيل الخلفية والاستمرارية
    {
        id:          'background-continuity',
        nameAr:      'وكيل الخلفية والاستمرارية',
        nameEn:      'Background Continuity Agent',
        type:        AGENT_TYPE.OPERATIONAL,
        status:      AGENT_STATUS.STANDBY,
        scope:       BOUNDARY_SCOPE.INTERNAL,
        entryPoint:  'scripts/background-processes-guard.js',
        capabilities: [
            'process-health-check',
            'auto-restart',
            'memory-guard',
            'log-rotation',
        ],
        governance: {
            requiresAuth: false,
            outputBoundary: 'platform-internal',
            intervalMs: 60000,
        },
        ayah: '﴿إِنَّ اللَّهَ لَا يَغْفُلُ عَمَّا تَعْمَلُونَ﴾ — البقرة: ٨٥',
    },
]);

// ─── حدود التكامل ─────────────────────────────────────────────────────────────

const INTEGRATION_BOUNDARIES = Object.freeze({
    internal: {
        description: 'خدمات داخل منصة شيخة — لا تكامل خارجي',
        allowedScopes: [BOUNDARY_SCOPE.INTERNAL],
        requiresAuth: false,
        dataClassification: 'internal',
    },
    external: {
        description: 'تكاملات خارجية مُعتمدة بموافقة الحوكمة',
        allowedPartners: ['azure-container-apps', 'google-cloud', 'saudi-gov', 'gcc-trade'],
        requiresAuth: true,
        dataClassification: 'confidential',
        shariaVetRequired: true,
    },
    governance: {
        description: 'سياسات الامتثال الإلزامية لجميع الوكلاء',
        frameworks: ['sharia-maqasid', 'pdpl-ksa', 'sama-regulations', 'iso-27001'],
        humanApprovalRequired: ['financial-transactions', 'data-export', 'external-partnerships'],
    },
});

// ─── API سجل الوكلاء ─────────────────────────────────────────────────────────

/**
 * الحصول على جميع تعريفات الوكلاء.
 * @returns {ReadonlyArray<object>}
 */
function getAllAgents() {
    return AGENT_DEFINITIONS;
}

/**
 * البحث عن وكيل بمعرّفه.
 * @param {string} agentId
 * @returns {object|null}
 */
function getAgent(agentId) {
    return AGENT_DEFINITIONS.find(a => a.id === agentId) || null;
}

/**
 * الحصول على وكلاء حسب النوع.
 * @param {string} type — من AGENT_TYPE
 * @returns {ReadonlyArray<object>}
 */
function getAgentsByType(type) {
    return AGENT_DEFINITIONS.filter(a => a.type === type);
}

/**
 * الحصول على وكلاء حسب النطاق.
 * @param {string} scope — من BOUNDARY_SCOPE
 * @returns {ReadonlyArray<object>}
 */
function getAgentsByScope(scope) {
    return AGENT_DEFINITIONS.filter(a => a.scope === scope);
}

/**
 * ملخص السجل الكامل.
 * @returns {object}
 */
function registrySummary() {
    const byType  = {};
    const byScope = {};
    const byStatus = {};

    for (const agent of AGENT_DEFINITIONS) {
        byType[agent.type]     = (byType[agent.type]     || 0) + 1;
        byScope[agent.scope]   = (byScope[agent.scope]   || 0) + 1;
        byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
    }

    return {
        registryId:    REGISTRY_ID,
        version:       REGISTRY_VERSION,
        tawheed:       TAWHEED,
        bismillah:     BISMILLAH,
        totalAgents:   AGENT_DEFINITIONS.length,
        byType,
        byScope,
        byStatus,
        governance:    GLOBAL_GOVERNANCE,
        boundaries:    INTEGRATION_BOUNDARIES,
        generatedAt:   new Date().toISOString(),
    };
}

/**
 * التحقق من صلاحية وكيل للتكامل مع نظام خارجي.
 * @param {string} agentId
 * @param {string} partnerSystem
 * @returns {{allowed: boolean, reason: string}}
 */
function canIntegrate(agentId, partnerSystem) {
    const agent = getAgent(agentId);
    if (!agent) {
        return { allowed: false, reason: `الوكيل "${agentId}" غير مُعرَّف في السجل` };
    }
    if (agent.scope === BOUNDARY_SCOPE.INTERNAL) {
        return { allowed: false, reason: `الوكيل "${agentId}" مقيَّد داخلياً ولا يُسمح له بالتكامل الخارجي` };
    }
    const allowedPartners = INTEGRATION_BOUNDARIES.external.allowedPartners || [];
    const partnerKey = String(partnerSystem || '').toLowerCase();
    const found = allowedPartners.some(p => partnerKey.includes(p) || p.includes(partnerKey));
    if (!found && agent.scope !== BOUNDARY_SCOPE.HYBRID) {
        return { allowed: false, reason: `الشريك "${partnerSystem}" غير مُدرج في قائمة التكاملات المُعتمدة` };
    }
    return { allowed: true, reason: 'مُعتمد بحسب حدود التكامل' };
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
    REGISTRY_VERSION,
    REGISTRY_ID,
    AGENT_TYPE,
    AGENT_STATUS,
    BOUNDARY_SCOPE,
    GLOBAL_GOVERNANCE,
    INTEGRATION_BOUNDARIES,
    getAllAgents,
    getAgent,
    getAgentsByType,
    getAgentsByScope,
    registrySummary,
    canIntegrate,
};
