'use strict';

const text = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

function humanBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'غير متوفر';
  return `${(bytes / 1024 / 1024).toFixed(0)} MiB`;
}

function yesNo(value, yes, no) {
  return value ? yes : no;
}

function compactState(value) {
  const states = {
    IMPLEMENTED_SUBSET: 'جزء منفذ',
    IMPLEMENTED_ARTIFACT_SUBSET: 'أثر منفذ',
    IMPLEMENTED_DISCOVERY_SUBSET: 'اكتشاف منفذ',
    FIRMWARE_INTEGRATED_SUBSET: 'تكامل Firmware',
    FIRMWARE_BOOT_TRANSPORT_ONLY: 'نقل Firmware',
    DISCOVERY_ONLY: 'اكتشاف فقط',
    REFERENCE_MAPPED: 'مرجع مسجل',
    REGISTERED_NOT_IMPLEMENTED: 'غير منفذ',
    IMPLEMENTED_GUID_SUBSET: 'GUID منفذ',
    IMPLEMENTED_OUTPUT_SUBSET: 'إخراج منفذ',
    IMPLEMENTED_STATUS_SUBSET: 'حالات منفذة',
    QEMU_VERIFIED: 'QEMU متحقق',
    STRUCTURAL_AND_QEMU_VERIFIED: 'بنية وQEMU',
    SOURCE_VERIFIED: 'المصدر متحقق',
    REFERENCE_REGISTERED: 'مرجع',
    NOT_VERIFIED: 'غير متحقق',
    EVIDENCE_PENDING: 'بانتظار الدليل',
    REQUIRES_EXTERNAL_KEYS_AND_SIGNING: 'يتطلب مفاتيح وتوقيع',
    ACTIVE_READ_ONLY: 'نشط للقراءة',
    ACTIVE_DISCOVERY_ONLY: 'اكتشاف محكوم',
    ACTIVE_BUILD_TIME_ONLY: 'وقت البناء',
    ACTIVE_READ_ONLY_BOOT_TRANSPORT: 'نقل إقلاع مقروء',
    ACTIVE_OUTPUT_ONLY: 'إخراج فقط',
    FIRMWARE_PROVIDED_ONLY: 'Firmware فقط',
    REGISTERED_DEFAULT_DENY: 'مسجل وممنوع',
    REFERENCE_ONLY: 'مرجع فقط',
    BLOCKED_PENDING_EVIDENCE: 'محجوب حتى الدليل',
    REGISTERED: 'مسجل',
    CONTRACT_VERIFIED: 'العقد متحقق',
    BUILD_VERIFIED: 'البناء متحقق',
    EMULATED_VERIFIED: 'متحقق بالمحاكاة',
    NATIVE_VERIFIED: 'متحقق أصليًا',
    PHYSICAL_VERIFIED: 'متحقق فيزيائيًا',
    SAFETY_CERTIFIED: 'معتمد للسلامة',
    PERSONAL_COMPUTING: 'الحواسيب الشخصية',
    MOBILE: 'الجوال',
    DATACENTER: 'مراكز البيانات',
    HPC: 'الحوسبة الضخمة',
    AUTOMOTIVE: 'السيارات',
    INDUSTRIAL: 'المصانع والصناعة',
    EMBEDDED: 'الأنظمة المضمنة',
    NETWORK: 'الشبكات',
    ENTERPRISE_COMPUTE: 'الحوسبة المؤسسية',
    SEMICONDUCTOR: 'أشباه الموصلات',
    CLOUD: 'السحابة',
    MEDICAL: 'الأجهزة الطبية',
    ROBOTICS: 'الروبوتات',
    PHYSICAL_MACHINE_MATRIX: 'مصفوفة اختبار أجهزة فعلية',
    AARCH64_KERNEL_PORT: 'نقل النواة إلى ARM64',
    VENDOR_BOOT_ADAPTER: 'موائم سلسلة إقلاع المنصة',
    ANDROID_NATIVE_RUNNER: 'مشغل Android أصلي',
    SERVER_HARDWARE_MATRIX: 'مصفوفة عتاد الخوادم',
    INTERCONNECT_DRIVER: 'مشغل الربط عالي السرعة',
    REAL_TIME_KERNEL_PROFILE: 'نمط نواة للزمن الحقيقي',
    VEHICLE_GATEWAY_ISOLATION: 'عزل بوابة السيارة',
    DETERMINISTIC_RUNTIME: 'تشغيل حتمي للآلة',
    SITE_PROTOCOL_PROFILE: 'ملف بروتوكولات الموقع',
    BOARD_SUPPORT_PACKAGE: 'حزمة دعم اللوحة',
    PACKET_IO_DRIVER: 'مشغل إدخال وإخراج الحزم',
    S390X_PORT: 'نقل النظام إلى s390x',
    ISA_AND_REGISTER_SPEC: 'مواصفة التعليمات والسجلات',
    NATIVE_RUNNER_MATRIX: 'مصفوفة مشغلات أصلية',
    CLINICAL_SCOPE: 'تحديد النطاق السريري',
    REAL_TIME_CONTROL: 'تحكم حقيقي بالزمن الفعلي',
  };
  return states[value] || String(value).replaceAll('_', ' ');
}

function renderHardwareTargets(targets) {
  const body = document.getElementById('hardware-target-list');
  if (!body) return;
  body.replaceChildren();
  if (!targets.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'لا توجد منصات ضمن هذا المجال.';
    row.append(cell);
    body.append(row);
    return;
  }
  for (const target of targets) {
    const row = document.createElement('tr');
    const values = [
      target.titleAr || target.title,
      compactState(target.domain),
      target.architectures.join(' · '),
      compactState(target.qualification),
      compactState(target.blockers[0] || 'لا توجد'),
    ];
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    body.append(row);
  }
}

async function loadHardwareTargets(filter = 'all') {
  const query = filter === 'all' ? '' : `?domain=${encodeURIComponent(filter)}`;
  const response = await fetch(
    `/api/sheikha/bare-metal/v2/hardware-compatibility/v1/targets${query}`,
    { headers: { Accept: 'application/json' } }
  );
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error('hardware targets unavailable');
  }
  renderHardwareTargets(payload.data.targets);
}

async function loadHardwareStatus() {
  try {
    const response = await fetch(
      '/api/sheikha/bare-metal/v2/hardware-compatibility/v1/status',
      { headers: { Accept: 'application/json' } }
    );
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error('hardware compatibility status unavailable');
    }
    const coverage = payload.data.coverage;
    text('hardware-architectures', coverage.architectures);
    text('hardware-targets', coverage.targetClasses);
    text('hardware-connectors', coverage.connectors);
    text('hardware-physical', coverage.physicalVerifiedTargets);
    await loadHardwareTargets();
  } catch {
    [
      'hardware-architectures',
      'hardware-targets',
      'hardware-connectors',
      'hardware-physical',
    ].forEach((id) => text(id, 'غير متوفر'));
    renderHardwareTargets([]);
  }
}

function renderCapabilities(capabilities) {
  const body = document.getElementById('uefi-capabilities');
  if (!body) return;
  body.replaceChildren();
  if (!capabilities.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'لا توجد نتائج ضمن هذا التصنيف.';
    row.append(cell);
    body.append(row);
    return;
  }
  for (const capability of capabilities) {
    const row = document.createElement('tr');
    [
      capability.id,
      capability.title,
      compactState(capability.implementationLevel),
      compactState(capability.verificationStatus),
      compactState(capability.activation),
    ].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    body.append(row);
  }
}

async function loadCapabilities(filter = 'all') {
  const query = {
    verified: '?verification=verified',
    denied: '?activation=default_deny',
    reference: '?activation=reference_only',
  }[filter] || '';
  const response = await fetch(
    `/api/sheikha/bare-metal/v2/uefi-integration/v1/capabilities${query}`,
    { headers: { Accept: 'application/json' } }
  );
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error('capabilities unavailable');
  renderCapabilities(payload.data.capabilities);
}

async function loadUefiStatus() {
  try {
    const response = await fetch(
      '/api/sheikha/bare-metal/v2/uefi-integration/v1/status',
      { headers: { Accept: 'application/json' } }
    );
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error('UEFI status unavailable');
    const coverage = payload.data.coverage;
    text('uefi-chapters', coverage.chapters);
    text('uefi-appendices', coverage.appendices);
    text(
      'uefi-verified',
      coverage.qemuVerifiedSubsets + coverage.sourceVerifiedSubsets
    );
    text('uefi-denied', coverage.defaultDeny);
    await loadCapabilities();
  } catch {
    ['uefi-chapters', 'uefi-appendices', 'uefi-verified', 'uefi-denied']
      .forEach((id) => text(id, 'غير متوفر'));
    renderCapabilities([]);
  }
}

async function loadStatus() {
  const state = document.getElementById('overall-state');
  try {
    const response = await fetch(
      '/api/sheikha/bare-metal/v2/physical-trial/v1/status',
      { headers: { Accept: 'application/json' } }
    );
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error('status unavailable');
    const data = payload.data;
    text('overall-state', 'صورة الإقلاع جاهزة');
    state?.classList.add('ready');
    text(
      'image-state',
      yesNo(data.verification.structurallyVerified, 'متحقق', 'غير متحقق')
    );
    text(
      'qemu-state',
      yesNo(
        data.verification.qemuBootVerified &&
          data.verification.visualBootUiVerified,
        'ناجح ومرئي',
        'غير مكتمل'
      )
    );
    text(
      'physical-state',
      yesNo(data.verification.physicalBootVerified, 'ناجح', 'بانتظار الفلاشة')
    );
    text(
      'installer-state',
      yesNo(data.installation.diskInstallerImplemented, 'متوفر', 'معطل')
    );
    text('artifact-name', data.image.path.split('/').pop());
    text('artifact-size', humanBytes(data.image.bytes));
    text('artifact-hash', data.image.sha256);
  } catch {
    text('overall-state', 'تعذر قراءة الحالة');
    state?.classList.add('error');
    ['image-state', 'qemu-state', 'physical-state', 'installer-state']
      .forEach((id) => text(id, 'غير متوفر'));
  }
}

loadStatus();
loadUefiStatus();
loadHardwareStatus();

document.getElementById('uefi-filter')?.addEventListener('change', (event) => {
  loadCapabilities(event.target.value).catch(() => renderCapabilities([]));
});

document.getElementById('hardware-filter')?.addEventListener(
  'change',
  (event) => {
    loadHardwareTargets(event.target.value)
      .catch(() => renderHardwareTargets([]));
  }
);
