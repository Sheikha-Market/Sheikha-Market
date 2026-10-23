'use strict';

const POLICIES = Object.freeze([
  { id: 'SOURCE_EVIDENCE', state: 'ACTIVE', rule: 'افصل ادعاء المصدر عن تحقق شيخة والانطباق والتنفيذ.' },
  { id: 'RIGHTS_AND_FEASIBILITY', state: 'ACTIVE', rule: 'لا تجربة تجارية قبل مراجعة الحقوق والتكلفة ومعيار قبول قابل للقياس.' },
  { id: 'SECURITY_ASSET_BINDING', state: 'ACTIVE', rule: 'اربط التحذير بالمورد والمنتج والإصدار والأصل والتعرض والدليل.' },
  { id: 'ARTIFACT_PROVENANCE_ADMISSION', state: 'ACTIVE', rule: 'اربط artifact بـdigest وتوقيع ومصدر قبل قبول التشغيل.' },
  { id: 'VULNERABILITY_EXCEPTION_EXPIRY', state: 'ACTIVE', rule: 'كل استثناء أمني له مالك ونطاق وتعويض وتاريخ انتهاء.' },
  { id: 'MCP_OBJECT_ACTION_SCOPE', state: 'ACTIVE', rule: 'تحقق من المستخدم والعميل والفعل والمورد والنطاق قبل handler.' },
  { id: 'REQUEST_RESOURCE_LIMITS', state: 'ACTIVE', rule: 'حد مستقل لحجم body وعدد batch وعمق الطلب وزمنه.' },
  { id: 'UNTRUSTED_PROMPT_BOUNDARY', state: 'ACTIVE', rule: 'النص غير الموثوق لا يتحول تلقائيًا إلى قراءة ملف أو أمر.' },
  { id: 'AGENT_PLACEMENT_BINDING', state: 'ACTIVE', rule: 'اربط image digest وlistener وnamespace وenvironment بالتفويض.' },
  { id: 'TOOLCHAIN_REPRODUCIBILITY', state: 'ACTIVE', rule: 'اختبر مصفوفة المترجم والمسرع وطريقة البناء قبل ترقية المصدر.' }
]);

function evaluate(item) {
  const material = (item.title + ' ' + item.summary).toLowerCase();
  const required = ['SOURCE_EVIDENCE', 'RIGHTS_AND_FEASIBILITY'];
  if (item.kind === 'SECURITY_ADVISORY') required.push('SECURITY_ASSET_BINDING');
  if (item.kind === 'SERVICE_STATUS') required.push('SOURCE_EVIDENCE');
  if (/docker|cosign|signature|artifact|image|صورة|توقيع/.test(material)) required.push('ARTIFACT_PROVENANCE_ADMISSION');
  if (/vulnerab|ghsa|cve|osv|استثناء|ثغر/.test(material)) required.push('VULNERABILITY_EXCEPTION_EXPIRY');
  if (/\bmcp\b|oauth|scope|session|جلس/.test(material)) required.push('MCP_OBJECT_ACTION_SCOPE', 'REQUEST_RESOURCE_LIMITS');
  if (/prompt|verbatim|untrusted|نص غير موثوق/.test(material)) required.push('UNTRUSTED_PROMPT_BOUNDARY');
  if (/listener|namespace|langgraph|placement/.test(material)) required.push('AGENT_PLACEMENT_BINDING');
  if (/\bvllm\b|\bgcc\b|toolchain|source build|مترجم/.test(material)) required.push('TOOLCHAIN_REPRODUCIBILITY');
  return { requiredPolicies: [...new Set(required)],
    recommendation: 'QUALIFY_IN_ISOLATION_THEN_REQUEST_SEPARATE_EXECUTION_AUTHORIZATION',
    automaticMutationAllowed: false };
}

function architecture() {
  return { schema: 'SHEIKHA_WATCH_GOVERNANCE_V1', policies: POLICIES,
    flow: ['COLLECT', 'NORMALIZE', 'VERIFY_SOURCE', 'CLASSIFY', 'CHECK_APPLICABILITY', 'ASSESS_RIGHTS_FEASIBILITY',
      'DRAFT_FOR_BENEFICIARY', 'HUMAN_APPROVAL', 'LOCAL_DISPLAY_OR_CONFIGURED_DELIVERY', 'MEASURE_FEEDBACK'],
    invariants: ['SOURCE_IS_NOT_APPLICABILITY', 'PROPOSAL_IS_NOT_AUTHORITY', 'VENDOR_IS_NOT_AFFECTED_PRODUCT',
      'NO_EXTERNAL_DELIVERY_WITHOUT_RECIPIENT_OPT_IN_PROVIDER_AND_TENANT_ISOLATION',
      'NO_AUTOMATIC_TRAINING_FROM_REPORTS_OR_FEEDBACK'] };
}

module.exports = { POLICIES, evaluate, architecture };
