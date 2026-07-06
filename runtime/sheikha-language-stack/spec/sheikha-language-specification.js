'use strict';

const LANGUAGE_VERSION = 'SHEIKHA_LANGUAGE_SPEC_V1';

const RESERVED_KEYWORDS = [
  'نظام',
  'مصدر',
  'تحقق',
  'حوّل',
  'سجّل',
  'اربط',
  'قس',
  'احكم',
  'تعافى',
  'طبّق'
];

const DATA_TYPES = [
  'نية',
  'نص',
  'رقم',
  'منطق',
  'جدول',
  'سجل',
  'وثيقة',
  'ملف',
  'مخطط',
  'تطبيق',
  'خطة_تنفيذ'
];

const GOVERNANCE_RULES = [
  'no-ungoverned-execution',
  'audit-required',
  'master-log-required',
  'inspector-required',
  'registry-required',
  'recovery-required',
  'no-secret-mutation',
  'no-unsafe-transformation'
];

const STANDARD_FUNCTION_CONTRACTS = [
  {
    name: 'عرّف',
    purpose: 'تعريف كيان أو نظام أو مصدر بيانات',
    input: ['نية', 'نص'],
    output: ['مخطط'],
    preconditions: ['input-validation-required'],
    governance: ['registry-required', 'audit-required']
  },
  {
    name: 'صنّف',
    purpose: 'تصنيف البيانات أو البرمجيات أو الإمكانية',
    input: ['ملف', 'وثيقة', 'سجل', 'جدول'],
    output: ['مخطط'],
    preconditions: ['schema-or-metadata-required'],
    governance: ['inspector-required', 'audit-required']
  },
  {
    name: 'حوّل',
    purpose: 'تحويل البيانات أو النية إلى مخرج تطبيقي',
    input: ['نية', 'سجل', 'وثيقة', 'جدول'],
    output: ['تطبيق', 'خطة_تنفيذ'],
    preconditions: ['validation-required'],
    governance: ['master-log-required', 'no-unsafe-transformation']
  },
  {
    name: 'تحقق',
    purpose: 'التحقق من الصحة والمعنى والقابلية للتنفيذ',
    input: ['مخطط', 'خطة_تنفيذ'],
    output: ['منطق'],
    preconditions: ['schema-or-metadata-required'],
    governance: ['inspector-required', 'audit-required']
  },
  {
    name: 'قس',
    purpose: 'قياس الإمكانية أو الأداء أو جودة البيانات',
    input: ['مخطط', 'تطبيق', 'سجل'],
    output: ['رقم'],
    preconditions: ['measurement-source-required'],
    governance: ['master-log-required']
  },
  {
    name: 'سجّل',
    purpose: 'تسجيل الكيان أو القدرة أو الحدث في السجلات',
    input: ['مخطط', 'سجل'],
    output: ['سجل'],
    preconditions: ['audit-context-required'],
    governance: ['registry-required', 'master-log-required']
  },
  {
    name: 'اربط',
    purpose: 'ربط Plugin أو Connector أو Capability بطبقة تشغيل',
    input: ['مخطط', 'خطة_تنفيذ'],
    output: ['منطق'],
    preconditions: ['contract-required'],
    governance: ['inspector-required', 'registry-required']
  },
  {
    name: 'احكم',
    purpose: 'تطبيق قواعد الحوكمة على التنفيذ',
    input: ['خطة_تنفيذ'],
    output: ['منطق'],
    preconditions: ['rules-required'],
    governance: ['no-ungoverned-execution', 'audit-required']
  },
  {
    name: 'تعافى',
    purpose: 'إنشاء خطة تعافٍ آمنة عند الفشل',
    input: ['سجل', 'خطة_تنفيذ'],
    output: ['خطة_تنفيذ'],
    preconditions: ['failure-evidence-required'],
    governance: ['recovery-required', 'master-log-required']
  }
];

class SheikhaLanguageSpecification {
  getStatus() {
    return {
      system: LANGUAGE_VERSION,
      arabicName: 'مواصفة لغة شيخة البرمجية',
      status: 'ACTIVE_LANGUAGE_SPECIFICATION',
      version: '1.0.0',
      productionReady: true,
      governed: true,
      audited: true,
      reservedKeywords: RESERVED_KEYWORDS,
      dataTypes: DATA_TYPES,
      governanceRules: GOVERNANCE_RULES,
      standardFunctionContracts: STANDARD_FUNCTION_CONTRACTS,
      boundaries: {
        noUngovernedLanguageFeature: true,
        allFunctionsHaveContracts: STANDARD_FUNCTION_CONTRACTS.every((x) => x.name && x.input && x.output),
        governanceRequired: true,
        auditRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaLanguageSpecification,
  LANGUAGE_VERSION,
  RESERVED_KEYWORDS,
  DATA_TYPES,
  GOVERNANCE_RULES,
  STANDARD_FUNCTION_CONTRACTS
};
