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
  };
  return states[value] || String(value).replaceAll('_', ' ');
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

document.getElementById('uefi-filter')?.addEventListener('change', (event) => {
  loadCapabilities(event.target.value).catch(() => renderCapabilities([]));
});
