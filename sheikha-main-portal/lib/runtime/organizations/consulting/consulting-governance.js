/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏛️ SHEIKHA International Consulting Organization — Governance
 *  منظمة شيخة للاستشارات الدولية — نظام الحوكمة
 *
 *  ﴿ وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ ﴾ — الشورى: 38
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── طبقات الحوكمة ────────────────────────────────────────────────────────────
const GOVERNANCE_LAYERS = [
    {
        layer: 1,
        id:    'sharia-compliance',
        nameAr:'الامتثال الشرعي',
        nameEn:'Sharia Compliance',
        description: 'التأكد من أن جميع الاستشارات والعقود خالية من الربا والغرر والغش والاحتكار والضرر',
        mandatory: true,
        checkpoints: ['قبل قبول العقد', 'أثناء التنفيذ', 'عند الإغلاق'],
    },
    {
        layer: 2,
        id:    'quality-standards',
        nameAr:'معايير الجودة',
        nameEn:'Quality Standards',
        description: 'تطبيق معايير الإتقان والجودة في كل خدمة استشارية',
        mandatory: true,
        checkpoints: ['مراجعة المخرجات', 'اعتماد التقارير', 'قياس رضا العميل'],
    },
    {
        layer: 3,
        id:    'conflict-resolution',
        nameAr:'حل النزاعات',
        nameEn:'Conflict Resolution',
        description: 'آلية واضحة لمعالجة النزاعات بين الأطراف عبر التحكيم الشرعي',
        mandatory: true,
        checkpoints: ['استلام الشكوى', 'التحقيق', 'التحكيم', 'الحل', 'التوثيق'],
    },
    {
        layer: 4,
        id:    'data-confidentiality',
        nameAr:'سرية البيانات',
        nameEn:'Data Confidentiality',
        description: 'حماية بيانات العملاء والشركاء ومنع تسريب المعلومات السرية',
        mandatory: true,
        checkpoints: ['عقد السرية', 'تصنيف البيانات', 'التدقيق الأمني'],
    },
    {
        layer: 5,
        id:    'performance-accountability',
        nameAr:'المساءلة والأداء',
        nameEn:'Performance Accountability',
        description: 'قياس وتقييم أداء كل قسم ومستشار بمؤشرات واضحة وقابلة للقياس',
        mandatory: true,
        checkpoints: ['تقييم شهري', 'تقييم ربع سنوي', 'تقييم سنوي'],
    },
];

// ─── سياسات التشغيل ───────────────────────────────────────────────────────────
const OPERATIONAL_POLICIES = {
    contractPolicy: {
        id:     'contract-policy',
        nameAr: 'سياسة العقود',
        rules: [
            'كل عقد يجب أن يُراجَع شرعيًا قبل التوقيع',
            'تحديد نطاق العمل بدقة قبل البدء',
            'تضمين بنود التعديل والإلغاء بشكل واضح',
            'توثيق جميع التعديلات بتوقيع الطرفين',
        ],
    },
    deliverablePolicy: {
        id:     'deliverable-policy',
        nameAr: 'سياسة المخرجات',
        rules: [
            'كل تقرير يُراجَع من مدير القسم المختص قبل التسليم',
            'التقارير تحتوي: الملخص التنفيذي، التحليل، التوصيات، خطة التنفيذ',
            'توحيد قوالب التقارير حسب نوع الاستشارة',
            'تسليم النسخة النهائية خلال المدة المتفق عليها',
        ],
    },
    escalationPolicy: {
        id:     'escalation-policy',
        nameAr: 'سياسة التصعيد',
        levels: [
            { level: 1, owner: 'المستشار المسؤول',    sla: '24 ساعة' },
            { level: 2, owner: 'مدير القسم',           sla: '48 ساعة' },
            { level: 3, owner: 'المجلس التنفيذي',      sla: '72 ساعة' },
            { level: 4, owner: 'التحكيم الشرعي',       sla: '7 أيام'  },
        ],
    },
    confidentialityPolicy: {
        id:          'confidentiality-policy',
        nameAr:      'سياسة السرية',
        classification: ['عام', 'داخلي', 'سري', 'سري للغاية'],
        defaultLevel:   'سري',
        retentionYears: 7,
    },
};

// ─── نظام الصلاحيات ───────────────────────────────────────────────────────────
const AUTHORITY_MATRIX = {
    roles: {
        SENIOR_CONSULTANT:  { id: 'senior-consultant',  nameAr: 'مستشار أول',        canApproveContracts: false, canApproveReports: false, canViewKPIs: true  },
        DIVISION_MANAGER:   { id: 'division-manager',   nameAr: 'مدير قسم',          canApproveContracts: true,  canApproveReports: true,  canViewKPIs: true  },
        EXECUTIVE_DIRECTOR: { id: 'executive-director', nameAr: 'المدير التنفيذي',   canApproveContracts: true,  canApproveReports: true,  canViewKPIs: true,  canModifyPolicies: true },
        SHARIA_AUDITOR:     { id: 'sharia-auditor',     nameAr: 'المدقق الشرعي',     canApproveContracts: false, canApproveReports: false, canViewKPIs: false, canAuditSharia: true    },
    },
};

// ─── مسار اتخاذ القرار ───────────────────────────────────────────────────────
const DECISION_FLOW = [
    { step: 1, action: 'استلام الطلب',       owner: 'مدير القسم المختص',  duration: '24 ساعة',  outcome: 'قبول / رفض / إحالة' },
    { step: 2, action: 'التقييم الشرعي',     owner: 'المدقق الشرعي',       duration: '48 ساعة',  outcome: 'موافق / مخالف / يحتاج تعديل' },
    { step: 3, action: 'تحديد نطاق العمل',   owner: 'المستشار الأول',       duration: '48 ساعة',  outcome: 'خطة عمل مفصلة + عرض سعر' },
    { step: 4, action: 'اعتماد العقد',       owner: 'المدير التنفيذي',      duration: '24 ساعة',  outcome: 'عقد موقع' },
    { step: 5, action: 'التنفيذ والمتابعة',  owner: 'المستشار الأول',       duration: 'حسب العقد', outcome: 'تقارير مرحلية + تقرير نهائي' },
    { step: 6, action: 'مراجعة المخرجات',    owner: 'مدير القسم',           duration: '48 ساعة',  outcome: 'اعتماد / مراجعة' },
    { step: 7, action: 'التسليم النهائي',    owner: 'المدير التنفيذي',      duration: '24 ساعة',  outcome: 'إغلاق المشروع + توثيق المعرفة' },
];

function getGovernanceSummary() {
    return {
        org:         'SHEIKHA International Consulting Organization',
        layers:      GOVERNANCE_LAYERS.length,
        policies:    Object.keys(OPERATIONAL_POLICIES).length,
        decisionSteps: DECISION_FLOW.length,
        roles:       Object.keys(AUTHORITY_MATRIX.roles).length,
        status:      'active',
    };
}

function validateConsultingRequest(request = {}) {
    const issues = [];
    if (!request.clientName)    issues.push('اسم العميل مطلوب');
    if (!request.serviceId)     issues.push('نوع الاستشارة مطلوب');
    if (!request.scopeSummary)  issues.push('ملخص نطاق العمل مطلوب');
    return {
        valid:  issues.length === 0,
        issues,
        shariaCheck: {
            riba:     false,
            gharar:   !request.scopeSummary,
            ghish:    false,
            ihtikar:  false,
            darar:    false,
        },
    };
}

module.exports = {
    GOVERNANCE_LAYERS,
    OPERATIONAL_POLICIES,
    AUTHORITY_MATRIX,
    DECISION_FLOW,
    getGovernanceSummary,
    validateConsultingRequest,
};
