'use strict';

// This is a traceability plan over sanitized observations, not an approval engine.
const ACCEPTANCE = {
  scope: ['تحديد معرف الأصل وحدوده وعلاقته بالمشتريات، وتسمية مسؤول يقر بالنطاق.'],
  rights: ['مراجعة دليل يربط الأصل بالمشتري أو المرخص له، وحدود الاستخدام والتجديد، بواسطة المسؤول المختص.'],
  engineering: ['ربط كل قدرة بمتطلب ومعيار قبول وإصدار محدد ونتائج اختبار مستقلة قابلة لإعادة التنفيذ.'],
  security: ['توثيق تصنيف البيانات وأقل الصلاحيات، واختبار رفض الوصول غير المأذون وعدم تسرب الأسرار.'],
  operations: ['تحديد بيئة التشغيل والقياسات وحدود التنبيه، وتجربة الاسترجاع والتراجع مع تسجيل النتيجة.'],
  budget: ['تحديد التكلفة المتكررة وسقف الإنفاق والموارد المسموحة واعتماد الالتزام المالي بشكل منفصل.'],
  values: ['مراجعة الصدق وحفظ الحقوق وعدم الضرر والأثر، وإحالة المسائل الشرعية التطبيقية إلى مختص مؤهل.'],
  authorization: ['توثيق صاحب الصلاحية والأصول والإجراء والبيئة والمدة وحدود الإلغاء، بعد مراجعة الأدلة؛ دون توريث إذن بين البيئات.']
};
const TECHNICAL = {
  'domain-core': [
    ['بوابة المنظومة', 'إثبات توجيه النطاق والاسم البديل إلى الوجهة المعتمدة، وصلاحية TLS واختبار صفحة البوابة من نقطة فحص مستقلة.', 'تقرير DNS وTLS وHTTP مؤرخ للوجهة المعتمدة دون أسرار.'],
    ['دليل الخدمات', 'مطابقة روابط دليل الخدمات لقائمة معتمدة واختبار المسارات المفقودة وعدم عرض خدمات غير مفعلة كمفعلة.', 'قائمة الخدمات وإصدار الواجهة ونتائج اختبار الروابط.']
  ],
  'domain-market': [
    ['كتالوج السوق', 'اختبار المسار والبحث والتصفية والحالة الخالية، وعدم عرض بيانات تجريبية كمنتجات متاحة للشراء.', 'إصدار الكتالوج ومصدر بياناته ونتائج اختبارات القبول.'],
    ['طلبات عروض الأسعار', 'التحقق من الحقول ورفض الطلبات غير المأذونة والمكررة، وعدم إرسال الطلب إلى مورد دون موافقة محددة.', 'عقد الطلب وسياسة الوصول واختبارات النجاح والرفض وعدم الإرسال غير المأذون.']
  ],
  'hosting-service': [
    ['استضافة البوابة والسوق', 'مطابقة الموارد ومواقع البيانات وخطة الخدمة للعقد المعتمد، واختبار التوفر والاسترجاع ضمن نطاق مأذون.', 'عقد وخريطة موارد منقحان وتقرير اختبار استرجاع.'],
    ['تشغيل خدمات ضمن الخطة المتعاقد عليها', 'تحديد الخدمات والحصص ومستخدم التشغيل وعزل الأسرار، واختبار الإيقاف والتراجع في بيئة محددة.', 'قائمة خدمات وحصص وإصدار إعداد وتقرير اختبار توقف وتراجع.']
  ],
  'host-governance-source': [
    ['صياغة بيانات الربط التاريخية', 'اختبار المصدر في مختبر معزول بقاعدة مؤقتة، وعدم تغيير الأصل أو تحويل عبارات الحالة الثابتة إلى دليل اتصال حي.', 'مراجعة المصدر وإصدار مختبر وفرق الملفات وقاعدة البيانات قبل الاختبار وبعده.']
  ],
  'domain-governance-source': [
    ['صياغة سجل علاقات النطاقات', 'اختبار علاقات النطاقات والكتابة المعزولة والتكرار، مع فصل البيان التاريخي عن نتائج فحص التوجيه المستقلة.', 'عقد العلاقات ونتائج مختبر معزول وتقرير اختلاف البيانات.']
  ],
  'supplier-package': [
    ['إدارة الموردين', 'تنفيذ عقد GET /api/suppliers في مختبر ببيانات اصطناعية، واختبار القائمة الخالية وصلاحيات الوصول وحدود النتائج.', 'عقد بيانات الموردين وإصدار التنفيذ ونتائج اختبارات قبول فعلية.'],
    ['إدارة المواد', 'تنفيذ عقد GET /api/materials في مختبر ببيانات اصطناعية، والتحقق من المعرفات والوحدات وصلاحيات الوصول وحدود النتائج.', 'عقد بيانات المواد والوحدات وإصدار التنفيذ ونتائج اختبارات القبول.'],
    ['إدارة الوثائق', 'تنفيذ عقد GET /api/documents في مختبر ببيانات اصطناعية، واختبار رفض المسارات التعسفية والوصول غير المأذون وعدم كشف المحتوى الخاص.', 'عقد بيانات الوثائق وسياسة الاحتفاظ وإصدار التنفيذ واختبارات الحماية والقبول.']
  ]
};

function buildAssetExecutionPlan({ assets, sources, governance, packageAudit }) {
  const requirements = [], capabilities = [];
  const gateId = (asset, gate) => `${asset.id}--${gate}`;
  const refs = asset => asset.evidenceIds.map(sourceId => {
    const source = sources.find(s => s.id === sourceId);
    return { sourceId, status: source.status, sha256: source.sha256 };
  });
  for (const asset of assets) {
    const observationId = gateId(asset, 'observation');
    const observed = asset.evidenceIds.every(id => {
      const source = sources.find(s => s.id === id);
      return source.status === 'READ' && /^[a-f0-9]{64}$/.test(source.sha256) && source.matchesRecordedDigest !== false;
    });
    const technical = TECHNICAL[asset.id];
    if (!technical || technical.length !== asset.capabilities.length || technical.some((t, i) => t[0] !== asset.capabilities[i])) throw Error('ASSET_PLAN_CATALOG_MISMATCH');
    const capabilityIds = technical.map((_, i) => `${asset.id}--capability-${i + 1}`);
    const technicalIds = technical.map((_, i) => `${asset.id}--acceptance-${i + 1}`);
    requirements.push({ id: observationId, assetId: asset.id, gateId: 'engineering', type: 'LOCAL_CHECK',
      title: 'قراءة الأدلة المحلية واتساق البصمات المرجعية المتاحة',
      status: observed ? 'LOCAL_PASS' : 'LOCAL_FAIL',
      acceptanceCriteria: ['قراءة كل مصادر البطاقة بأمان مع بصمة محتوى، وعدم اختلاف أي بصمة مرجعية متاحة؛ لا يثبت ذلك صحة الادعاءات أو الملكية.'],
      requiredEvidence: ['نتائج قراءة المصادر المحددة وبصماتها في وقت هذا التقرير.'], evidenceRefs: refs(asset),
      capabilityIds: [], responsibleRole: 'مسؤول توثيق الأصول', assignedPerson: null, dependsOn: [],
      nextAction: observed ? 'استكمال الأدلة الموضوعية والمراجعة المختصة.' : 'مراجعة المصادر غير المقروءة أو المختلفة عن المرجع دون استبدال الدليل التاريخي.' });
    technical.forEach(([name, criterion, evidence], index) => {
      capabilities.push({ id: capabilityIds[index], assetId: asset.id, name, requirementIds: [technicalIds[index], gateId(asset, 'engineering')] });
      requirements.push({ id: technicalIds[index], assetId: asset.id, gateId: 'engineering', type: 'CAPABILITY_ACCEPTANCE',
        title: name, status: 'NOT_TESTED', acceptanceCriteria: [criterion], requiredEvidence: [evidence],
        evidenceRefs: refs(asset), capabilityIds: [capabilityIds[index]], responsibleRole: 'مسؤول الهندسة', assignedPerson: null,
        dependsOn: [gateId(asset, 'scope'), observationId, ...(asset.id === 'supplier-package' ? [gateId(asset, 'package-consistency')] : [])],
        nextAction: 'إعداد تنفيذ أو اختبار معزول ومراجعة نطاقه، ثم إرفاق نتائج مرتبطة بإصدار؛ الاختبار لم يُنفذ هنا.' });
    });
    for (const gate of governance.gates) {
      const dependencies = gate.id === 'scope' ? []
        : gate.id === 'engineering' ? [gateId(asset, 'scope'), ...technicalIds]
          : gate.id === 'authorization' ? governance.gates.filter(g => g.id !== 'authorization').map(g => gateId(asset, g.id))
            : [gateId(asset, 'scope')];
      requirements.push({ id: gateId(asset, gate.id), assetId: asset.id, gateId: gate.id, type: 'GOVERNANCE_REVIEW',
        title: gate.name, status: 'REVIEW_REQUIRED', acceptanceCriteria: [...ACCEPTANCE[gate.id]],
        requiredEvidence: [gate.requiredEvidence], evidenceRefs: refs(asset), capabilityIds: [...capabilityIds],
        responsibleRole: gate.responsibleRole, assignedPerson: null, dependsOn: dependencies,
        nextAction: `استكمال الدليل وتعيين ${gate.responsibleRole} للمراجعة وتوثيق القرار المحدد.` });
    }
    if (asset.id === 'supplier-package') {
      const passed = packageAudit.structureValid && packageAudit.declaredHashesMatch && packageAudit.declaredHold;
      requirements.push({ id: gateId(asset, 'package-consistency'), assetId: asset.id, gateId: 'engineering', type: 'LOCAL_CHECK',
        title: 'اتساق ملفات حزمة التصميم وأعلام التوقف المعلنة', status: passed ? 'LOCAL_PASS' : 'LOCAL_FAIL',
        acceptanceCriteria: ['ملفات الحزمة الخمسة كائنات JSON وبصمات الملفات الأربعة تطابق البيان، مع أعلام التفويض والإنتاج والدفع والأجهزة غير مفعلة؛ ليس فحصًا كاملًا لعقود API.'],
        requiredEvidence: ['packageAudit والبصمات المحلية المرصودة.'], evidenceRefs: refs(asset), capabilityIds: [...capabilityIds],
        responsibleRole: 'مسؤول الهندسة', assignedPerson: null, dependsOn: [observationId],
        nextAction: passed ? 'تنفيذ واختبار العقود في مختبر مستقل بعد تحديد النطاق.' : 'مراجعة ملفات الحزمة والبيان وأعلام التوقف قبل استخدام التصميم.' });
    }
  }
  const nextActions = assets.map(asset => {
    const requirement = requirements.find(r => r.assetId === asset.id && r.status === 'LOCAL_FAIL')
      || requirements.find(r => r.id === gateId(asset, 'scope'));
    return { assetId: asset.id, requirementId: requirement.id, action: requirement.nextAction,
      reason: requirement.status === 'LOCAL_FAIL' ? 'LOCAL_EVIDENCE_REVIEW' : 'SCOPE_AND_OWNER_REQUIRED',
      relatedAssetIds: [...asset.dependsOn], executionAuthorized: false };
  });
  return { schemaVersion: 1, kind: 'ASSET_EXECUTION_PLAN', status: 'DRAFT_NOT_AUTHORIZED',
    sequenceMeaning: 'PROPOSED_REQUIREMENT_ORDER_NOT_EXECUTION_PERMISSION',
    evidenceMeaning: 'LOCAL_CONTEXT_NOT_ACCEPTANCE_PROOF',
    capabilities, requirements, nextActions,
    summary: { assets: assets.length, capabilities: capabilities.length, requirements: requirements.length,
      localChecksPassed: requirements.filter(r => r.status === 'LOCAL_PASS').length,
      localChecksFailed: requirements.filter(r => r.status === 'LOCAL_FAIL').length,
      acceptanceNotTested: requirements.filter(r => r.status === 'NOT_TESTED').length,
      reviewsRequired: requirements.filter(r => r.status === 'REVIEW_REQUIRED').length },
    productionEnabled: false, approvalsRecorded: false, acceptanceTestsExecuted: false, certificationGranted: false };
}

module.exports = { buildAssetExecutionPlan };
