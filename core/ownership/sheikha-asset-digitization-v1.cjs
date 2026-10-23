'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { digest } = require('./sheikha-owned-asset-registry.cjs');
const { createPrivateStore } = require('../industrial/sheikha-industrial-private-store-v1.cjs');
const { buildAssetExecutionPlan } = require('./sheikha-asset-execution-plan-v1.cjs');

const LIMITS = Object.freeze({ sourceBytes: 256 * 1024, records: 100, bytes: 256 * 1024, directoryEntries: 104 });
const HOME = '/home/sheikha';
const KERNEL = 'sheikha_os_ecosystem/01_foundry_baremetal_kernel/';
const LAB = 'sheikha-v43-1-lean-lab/supplier-portal-mvp/';
const SOURCE_DEFINITIONS = [
  ['attachment-1', 'المرفق الأول', 'codex/attachments/6af734cb-6d05-45ca-866b-a320b973cd4d/Pasted text.txt', 'text', '2acf0146fa6c9dde548cea90805023e4f89b0a506993df799367c8f76e3446ad'],
  ['attachment-2', 'المرفق الثاني', 'codex/attachments/254a22ed-2232-4a26-8782-56b4569f8b7a/Pasted text.txt', 'text', '2acf0146fa6c9dde548cea90805023e4f89b0a506993df799367c8f76e3446ad'],
  ['host-source', 'مصدر V42.7', KERNEL + 'sheikha_v42_7_hostinger_chat_integration.py', 'text'],
  ['host-manifest', 'بيان V42.7', KERNEL + 'sheikha_v42_7_hostinger_chat_manifest.json', 'json', '70b1ab4a7b913afecc3fbf39e14feab61d0194c1b591be4554baa067d29e7326'],
  ['domain-source', 'مصدر V42.8', KERNEL + 'sheikha_v42_8_domain_federation_engine.py', 'text'],
  ['domain-manifest', 'بيان V42.8', KERNEL + 'sheikha_v42_8_domain_federation_manifest.json', 'json', '9187d090c23210cb7b7851bd358eac3cb32a69f603e8876e68bee44438280079'],
  ...['requirements', 'architecture', 'interfaces', 'tests', 'manifest'].map(n => ['mvp-' + n, `بوابة الموردين: ${n}`, LAB + n + '.json', 'json'])
];
const ASSETS = [
  { id: 'domain-core', name: 'sheikha.top', kind: 'DOMAIN', aliases: ['www.sheikha.top'],
    role: 'عنوان البوابة الرئيسية المقترح', evidenceIds: ['domain-manifest'], capabilities: ['بوابة المنظومة', 'دليل الخدمات'], needs: ['إثبات تسجيل النطاق والحساب المسيطر', 'فحص DNS وTLS وربط الوجهة المحددة'], dependsOn: ['hosting-service'] },
  { id: 'domain-market', name: 'sheikha.shop', kind: 'DOMAIN', aliases: [],
    role: 'عنوان السوق المقترح', evidenceIds: ['domain-manifest'], capabilities: ['كتالوج السوق', 'طلبات عروض الأسعار'], needs: ['إثبات تسجيل النطاق والحساب المسيطر', 'فحص DNS وTLS ومسار السوق'], dependsOn: ['hosting-service', 'supplier-package'] },
  { id: 'hosting-service', name: 'خدمة Hostinger المشار إليها', kind: 'SERVICE', aliases: [],
    role: 'استضافة وربط خارجي يحتاج تحديد الخطة والنطاق', evidenceIds: ['host-manifest'], capabilities: ['استضافة البوابة والسوق', 'تشغيل خدمات ضمن الخطة المتعاقد عليها'], needs: ['فاتورة أو عقد وخطة الخدمة وحدودها', 'قائمة الموارد والتكلفة والصلاحيات وخطة التراجع'], dependsOn: [] },
  { id: 'host-governance-source', name: 'وحدة توثيق Hostinger V42.7', kind: 'SOFTWARE', aliases: [],
    role: 'مصدر محلي يكتب بيانات وصفية؛ لم يُنفذ هنا', evidenceIds: ['host-source', 'host-manifest'], capabilities: ['صياغة بيانات الربط التاريخية'], needs: ['مراجعة آثار الكتابة إلى SQLite وملف الأدلة', 'اختبارات مستقلة للخدمات بدل الاعتماد على العبارات الثابتة'], dependsOn: ['hosting-service'] },
  { id: 'domain-governance-source', name: 'وحدة توثيق النطاقات V42.8', kind: 'SOFTWARE', aliases: [],
    role: 'مصدر محلي يصف اتحاد النطاقات؛ ليس موصل DNS', evidenceIds: ['domain-source', 'domain-manifest'], capabilities: ['صياغة سجل علاقات النطاقات'], needs: ['مراجعة تغييرات قاعدة البيانات قبل التنفيذ', 'عقد تكامل واختبار توجيه فعلي مستقل'], dependsOn: ['domain-core', 'domain-market'] },
  { id: 'supplier-package', name: 'حزمة تصميم بوابة الموردين', kind: 'DESIGN_PACKAGE', aliases: [],
    role: 'متطلبات ومعمارية وعقود واجهات وتصميم اختبارات', evidenceIds: ['mvp-requirements', 'mvp-architecture', 'mvp-interfaces', 'mvp-tests', 'mvp-manifest'],
    capabilities: ['إدارة الموردين', 'إدارة المواد', 'إدارة الوثائق'], needs: ['تنفيذ الواجهات وإضافة اختبارات قبول فعلية', 'مراجعة بيانات الموردين والتحكم في الوصول'], dependsOn: [] }
];
const GATES = [
  ['scope', 'حصر الأصول وتعيين المسؤول', 'مالك الأصول', 'قائمة محددة ومعرفات وعلاقة تصريح الشراء بكل أصل'],
  ['rights', 'إثبات الملكية أو حق الاستخدام', 'مسؤول المشتريات والعقود', 'دليل شراء أو ترخيص منقح وحدود الاستخدام والتجديد'],
  ['engineering', 'المتطلبات والتصميم والاختبار', 'مسؤول الهندسة', 'متطلبات قابلة للقياس واختبارات مستقلة مرتبطة بإصدار'],
  ['security', 'الأمن والخصوصية والصلاحيات', 'مسؤول الأمن', 'مراجعة صلاحيات وبيانات وأسرار دون نقلها بين البيئات'],
  ['operations', 'الجاهزية التشغيلية والتراجع', 'مسؤول التشغيل', 'بيئة محددة ومراقبة ونسخ احتياطي وتجربة استرجاع'],
  ['budget', 'الميزانية وحدود الخدمة', 'مسؤول المالية', 'سقف إنفاق وموافقة منفصلة لأي التزام مالي'],
  ['values', 'مراجعة القيم والأثر', 'مراجع مؤهل يعينه المالك', 'مراجعة الصدق والأمانة والعدل وعدم الضرر والمسائل الشرعية ذات الصلة'],
  ['authorization', 'تفويض التنفيذ المحدد', 'مالك الخدمة وصاحب الصلاحية', 'موافقة محددة على الأصول والإجراء والبيئة والوقت']
];
const INVENTORY_CATEGORIES = [
  { id: 'domains', name: 'النطاقات', kinds: ['DOMAIN'],
    requiredDetails: ['اسم كل نطاق والحساب المسجل له', 'تاريخ الانتهاء والتجديد والجهة المسؤولة'],
    requiredEvidence: ['مستند تسجيل أو شراء منقح', 'مراجعة السيطرة على الحساب دون مشاركة بيانات الدخول'] },
  { id: 'hosting', name: 'الاستضافة والخدمات السحابية', kinds: ['SERVICE'],
    requiredDetails: ['المزود والخطة والموارد المشمولة', 'مدة الاشتراك وحدود التكلفة والتجديد'],
    requiredEvidence: ['فاتورة أو عقد خدمة منقح', 'بيان الاستحقاقات والصلاحيات المتعاقد عليها'] },
  { id: 'software', name: 'البرمجيات وحزم التصميم', kinds: ['SOFTWARE', 'DESIGN_PACKAGE'],
    requiredDetails: ['اسم المكون وإصداره ومصدره', 'الجهة المالكة ونطاق الاستخدام المطلوب'],
    requiredEvidence: ['دليل الإنشاء أو الشراء أو التنازل عن الحقوق بحسب الحالة', 'ملف الترخيص أو شروط الاستخدام دون مفاتيح التفعيل'] },
  { id: 'licenses', name: 'التراخيص والاشتراكات', kinds: [],
    requiredDetails: ['اسم المنتج والمزود ونوع الترخيص', 'المقاعد أو الموارد المشمولة والمدة والتجديد'],
    requiredEvidence: ['عقد أو فاتورة أو شهادة استحقاق منقحة', 'حدود الاستخدام والنقل وإعادة التوزيع إن وجدت'] },
  { id: 'equipment', name: 'المعدات والروبوتات وخطوط الإنتاج', kinds: [],
    requiredDetails: ['قائمة المعدات والطرازات والكميات ومعرفات داخلية', 'الموقع والمسؤول ووحدات التحكم والملحقات'],
    requiredEvidence: ['مستند شراء أو نقل ملكية ومحضر استلام منقح', 'أدلة الفحص والقبول والسلامة والصيانة قبل أي تشغيل'] },
  { id: 'visuals', name: 'البصريات والفيديو والتصاميم', kinds: [],
    requiredDetails: ['قائمة الأعمال والإصدارات ومصدر كل عمل', 'المنشئ ونطاق الاستخدام والنشر المطلوب'],
    requiredEvidence: ['سجل إنشاء أو مستند شراء أو ترخيص منقح', 'حدود حقوق الاستخدام والنشر وعناصر الطرف الثالث'] }
];
const POLICY = Object.freeze({ mode: 'LOCAL_DOCUMENTATION_ONLY', purchaseVerified: false, ownershipVerified: false,
  productionEnabled: false, externalCallsMade: false, physicalActuation: false, paymentEnabled: false,
  publicationEnabled: false, sourceScriptsExecuted: false, databaseOpened: false, credentialsRead: false,
  shariaCertificationGranted: false, permissionTransferEnabled: false, signatureAuthenticated: false, atomicSourceSet: false });

function readSource(file, kind) {
  let fd;
  try {
    let current = path.parse(file).root;
    for (const part of path.dirname(file).slice(current.length).split(path.sep).filter(Boolean)) {
      current = path.join(current, part); if (!fs.lstatSync(current).isDirectory()) throw Error('UNSAFE');
    }
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const before = fs.fstatSync(fd, { bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size < 1n || before.size > BigInt(LIMITS.sourceBytes)) throw Error('UNSAFE');
    const buffer = Buffer.alloc(Number(before.size) + 1); let count = 0, n;
    while (count < buffer.length && (n = fs.readSync(fd, buffer, count, buffer.length - count, null))) count += n;
    const after = fs.fstatSync(fd, { bigint: true }), pathname = fs.lstatSync(file, { bigint: true });
    if (!pathname.isFile() || count !== Number(before.size)
      || ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs'].some(k => before[k] !== after[k] || before[k] !== pathname[k])) throw Error('UNSAFE');
    const bytes = buffer.subarray(0, count), sha256 = createHash('sha256').update(bytes).digest('hex');
    let document;
    if (kind === 'json') {
      try { document = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
      catch { return { status: 'INVALID_JSON', bytes: count, sha256 }; }
      if (!document || typeof document !== 'object' || Array.isArray(document)) return { status: 'INVALID_JSON', bytes: count, sha256 };
    }
    return { status: 'READ', bytes: count, sha256, document };
  } catch (error) { return { status: error.code === 'ENOENT' ? 'MISSING' : 'UNREADABLE', bytes: null, sha256: null }; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}

function createAssetDigitization({ sourcePaths = {}, now = Date.now,
  root = path.resolve(__dirname, '../../runtime/asset-digitization/v1') } = {}) {
  if (Object.keys(sourcePaths).some(id => !SOURCE_DEFINITIONS.some(s => s[0] === id))
    || Object.values(sourcePaths).some(p => typeof p !== 'string' || !path.isAbsolute(p))) throw Error('ASSET_INPUT_REJECTED');
  function inspect() {
    const observed = new Map();
    const sources = SOURCE_DEFINITIONS.map(([id, label, relative, kind, expected]) => {
      const data = readSource(sourcePaths[id] || path.join(HOME, relative), kind); observed.set(id, data);
      return { id, label, kind, status: data.status, bytes: data.bytes, sha256: data.sha256,
        recordedDigest: expected || null, matchesRecordedDigest: expected && data.sha256 ? data.sha256 === expected : null };
    });
    const doc = id => observed.get('mvp-' + id)?.document;
    const names = ['requirements', 'architecture', 'interfaces', 'tests'];
    const structureValid = [...names, 'manifest'].every(n => Boolean(doc(n)));
    const manifest = doc('manifest'), hashes = manifest?.files_sha256;
    const declaredHashesMatch = Boolean(structureValid && hashes && typeof hashes === 'object' && !Array.isArray(hashes)
      && Object.keys(hashes).sort().join(',') === names.map(n => n + '.json').sort().join(',')
      && names.every(n => /^[a-f0-9]{64}$/.test(hashes[n + '.json']) && hashes[n + '.json'] === observed.get('mvp-' + n).sha256));
    const contracts = doc('interfaces')?.contracts;
    const contractsValid = Array.isArray(contracts) && contracts.length <= 100 && contracts.every(c => c && typeof c === 'object');
    const declaredHold = Boolean(structureValid && ['authority_granted', 'payments_authorized', 'physical_actuation', 'production_enabled'].every(k => manifest[k] === false)
      && manifest.decision === 'DESIGN_ONLY_HOLD' && doc('requirements').scope === 'DESIGN_ONLY');
    const packageAudit = { structureValid, declaredHashesMatch, declaredHold,
      contractsCount: contractsValid ? contracts.length : null,
      unimplementedContracts: contractsValid ? contracts.filter(c => c.implementation === 'NOT_IMPLEMENTED').length : null,
      executionTested: false, decision: declaredHashesMatch && declaredHold && contractsValid ? 'DESIGN_ONLY_HOLD' : 'REVIEW_REQUIRED' };
    const assets = ASSETS.map(asset => ({ ...structuredClone(asset), recordStatus: 'DIGITIZED_DRAFT',
      acquisitionStatus: 'PURCHASE_REPORTED_SCOPE_UNCONFIRMED', ownershipVerified: false, productionEnabled: false,
      evidenceStatus: asset.evidenceIds.some(id => observed.get(id).status !== 'READ') ? 'INCOMPLETE'
        : sources.some(s => asset.evidenceIds.includes(s.id) && s.matchesRecordedDigest === false) ? 'DIGEST_MISMATCH'
          : asset.kind === 'DESIGN_PACKAGE' ? packageAudit.decision : ['DOMAIN', 'SERVICE'].includes(asset.kind) ? 'DECLARATION_ONLY' : 'LOCAL_SOURCE_OBSERVED',
      capabilityStatus: 'PROPOSED_NOT_ACTIVATED', readiness: 'HOLD',
      gates: GATES.map(([id]) => ({ id, status: 'REVIEW_REQUIRED' })) }));
    const attachmentDigests = sources.filter(s => s.id.startsWith('attachment-') && s.status === 'READ').map(s => s.sha256);
    const body = { schemaVersion: 1, kind: 'ASSET_DIGITIZATION_DOSSIER', observedAt: new Date(now()).toISOString(),
      scope: 'نطاق الجرد المطلوب شامل؛ البطاقات الحالية للأصول المذكورة في المرفقين فقط وليست جردًا كاملًا للمشتريات',
      purchaseDeclaration: { status: 'USER_REPORTED', perAssetAllocationConfirmed: false, purchaseEvidenceProvided: false },
      inventoryScope: { status: 'FULL_SCOPE_REQUESTED_NOT_ITEMIZED', request: { source: 'USER_SCOPE_REPLY', text: 'الافضل الكل', receivedOn: '2026-10-22', timezone: 'Asia/Riyadh' },
        purpose: 'INVENTORY_AND_EVIDENCE_REVIEW', inventoryComplete: false, itemizedPurchaseListProvided: false,
        purchaseEvidenceProvided: false, executionAuthorized: false,
        categories: INVENTORY_CATEGORIES.map(({ kinds, ...category }) => {
          const knownAssetIds = assets.filter(a => kinds.includes(a.kind)).map(a => a.id);
          return { ...structuredClone(category), knownAssetIds,
            itemizationStatus: knownAssetIds.length ? 'KNOWN_RECORDS_ONLY' : 'ITEMIZED_LIST_REQUIRED',
            purchaseVerified: false, productionEnabled: false };
        }) },
      sources, attachmentCopies: attachmentDigests.length, uniqueAttachmentContents: new Set(attachmentDigests).size,
      packageAudit, assets, governance: { reference: 'QURAN_AND_SUNNAH', certificationGranted: false,
        gates: GATES.map(([id, name, responsibleRole, requiredEvidence]) => ({ id, name, responsibleRole, requiredEvidence, assignedPerson: null })) },
      architecture: { status: 'PROPOSED_NOT_DEPLOYED', layers: [
        { id: 'governance', name: 'المرجعية والحوكمة', members: ['سجل الأصول', 'الأدلة', 'المراجعة والتفويض'] },
        { id: 'channels', name: 'البوابات', members: ['domain-core', 'domain-market'] },
        { id: 'applications', name: 'التطبيقات والعقود', members: ['supplier-package'] },
        { id: 'integration', name: 'التكامل المقترح', members: ['host-governance-source', 'domain-governance-source'] },
        { id: 'infrastructure', name: 'الاستضافة والبيانات', members: ['hosting-service'] }
      ], links: assets.flatMap(a => a.dependsOn.map(target => ({ source: a.id, target, relation: 'PLANNED_DEPENDENCY', deployed: false }))) },
      localFunctions: ['READ_DIGITAL_PASSPORTS', 'HASH_ALLOWLISTED_FILES', 'CHECK_PACKAGE_DECLARED_HASHES', 'EXPORT_DOSSIER'],
      policy: { ...POLICY } };
    body.executionPlan = buildAssetExecutionPlan(body);
    return { ...body, integrity: { algorithm: 'SHA-256_CANONICAL_JSON', digest: digest(body), signature: false } };
  }
  function snapshot() {
    const report = inspect(), files = createPrivateStore({ root, limits: LIMITS, prefix: 'ASSET' }), id = report.integrity.digest;
    return files.withLock(() => {
      if (files.entries().includes(id + '.json')) {
        if (digest(files.read(id)) !== digest(report)) throw Error('ASSET_RECORD_REJECTED');
      } else files.write(id, report);
      return { id, report };
    });
  }
  return { inspect, snapshot };
}
module.exports = { createAssetDigitization, LIMITS, SOURCE_DEFINITIONS };
