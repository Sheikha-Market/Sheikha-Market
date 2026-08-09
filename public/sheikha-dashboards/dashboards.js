'use strict';

const API = '/api/sheikha/commerce/v1';
const ORGANIZATION_API = '/api/sheikha/organization-control/v1';
const PRODUCTION_API = '/api/sheikha/production-federation/v1';
const dashboardState = {
  role: 'OWNER',
  assignment: 'AUTONOMOUS_AGENT',
  sector: 'all',
  sectors: [],
  roles: [],
  organization: null,
  operatingModel: null,
  roleDashboard: null,
  production: null,
  productionModels: [],
  productionSystems: [],
  productionEvidence: [],
  dashboard: null,
  view: 'overview'
};

const labels = {
  catalogReady: 'جاهز في الكتالوج',
  products: 'المنتجات والخدمات',
  saasServices: 'خدمات SaaS',
  sectors: 'القطاعات',
  workflows: 'مسارات العمل',
  LOCAL_EVIDENCE_VERIFIED: 'متحقق من الأدلة المحلية',
  NOT_CONNECTED: 'غير متصل ببيانات حية',
  SEPARATE_LIVE_FEED: 'مصدر حي منفصل',
  REQUEST_QUOTE_ONLY: 'بطلب عرض فقط'
};

const statusLabels = {
  AUTONOMOUS_AGENT: 'وكيل آلي محكوم',
  HUMAN: 'كادر بشري مخوّل',
  AUTONOMOUS_POLICY_GOVERNED: 'آلي ضمن السياسة',
  HUMAN_APPROVAL_GATED: 'محكوم بالموافقة',
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'عالٍ'
};

const domainLabels = {
  vision: 'الرؤية',
  governance: 'الحوكمة',
  portfolio: 'المحفظة',
  risk: 'المخاطر',
  capital: 'رأس المال',
  strategy: 'الاستراتيجية',
  execution: 'التنفيذ',
  operations: 'العمليات',
  planning: 'التخطيط',
  performance: 'الأداء',
  finance: 'المالية',
  architecture: 'العمارة',
  engineering: 'الهندسة',
  security: 'الأمن',
  workforce: 'القوى العاملة',
  employment: 'التوظيف',
  quality: 'الجودة',
  evidence: 'الأدلة'
};

const tierLabels = {
  OWNERSHIP: 'الملكية',
  BOARD: 'مجلس الإدارة',
  EXECUTIVE: 'الإدارة التنفيذية',
  PLANNING: 'التخطيط',
  MANAGEMENT: 'الإدارة',
  WORKFORCE: 'القوى العاملة'
};

const kindLabels = {
  SAAS_PRODUCT: 'SaaS',
  COMMERCIAL_DIGITAL_PRODUCT: 'رقمي',
  PLATFORM_PRODUCT: 'منصة',
  KNOWLEDGE_COMMUNITY_PRODUCT: 'معرفة ومجتمع'
};

const productionLabels = {
  ACTIVE_WITH_BOUNDED_VERIFIED_CAPABILITIES: 'نشط بأدلة محلية محدودة',
  REGISTERED_DEFAULT_DENY: 'مسجل ومحجوب افتراضيًا',
  ACTIVE_BOUNDED_BY_LOCAL_EVIDENCE: 'نشط ضمن الدليل المحلي',
  AVAILABLE_BY_EXPLICIT_SCOPE: 'متاح بنطاق صريح',
  ACTIVE_BOUNDED_LOCAL_EVIDENCE: 'نشط بأدلة محلية محدودة',
  ACTIVE_VERIFIED_FOUNDATION_SUBSETS: 'أساسات محددة متحققة',
  BOUNDED_LOCAL_EVIDENCE_ONLY: 'دعم محلي ضمن الأدلة فقط',
  NOT_PRODUCTION_SUPPORTED_UNTIL_PROVEN: 'غير مدعوم إنتاجيًا قبل الإثبات',
  QEMU_RUNTIME_VERIFIED_SUBSET: 'جزء متحقق داخل QEMU',
  FOUNDATION_SUBSETS_VERIFIED: 'أساسات محددة متحققة',
  DESKTOP_ARTIFACT_NOT_PRESENT: 'قطعة سطح المكتب غير موجودة حاليًا',
  DESKTOP_ARTIFACT_DIGEST_MISMATCH: 'بصمة قطعة سطح المكتب غير مطابقة',
  DESKTOP_NATIVE_LAUNCH_AND_SECURITY_VERIFIED: 'تشغيل وأمان سطح المكتب متحققان',
  ARTIFACT_BUILT_LIFECYCLE_PENDING: 'القطعة مبنية ودورة الحياة معلقة',
  NATIVE_LIFECYCLE_VERIFIED: 'دورة الحياة الأصلية متحققة',
  LOCAL_SITE_SMOKE_VERIFIED: 'تشغيل الموقع المحلي متحقق',
  INTERNAL: 'داخلي',
  EXTERNAL: 'خارجي',
  HYBRID: 'هجين',
  FEDERATED: 'اتحادي',
  SHEIKHA_OWNED: 'مملوك لشيخة',
  MIXED_RIGHTS: 'حقوق مختلطة',
  RESTRICTED_EXTERNAL: 'خارجي مقيد',
  CUSTOMER_OWNED: 'مملوك للعميل',
  UNCLASSIFIED: 'غير مصنف'
};

function productionLabel(value) {
  return productionLabels[value] || value;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function readJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    throw new Error(body.message || `${url}: ${response.status}`);
  }
  return body.data;
}

function sectorName(id) {
  if (id === 'all') return 'كل القطاعات';
  return dashboardState.sectors.find((sector) => sector.id === id)?.nameAr || id;
}

function renderKpis() {
  const grid = document.getElementById('kpi-grid');
  grid.replaceChildren();
  const commerce = dashboardState.dashboard.summary;
  const role = dashboardState.roleDashboard.summary;
  const entries = [
    ['widgets', 'أدوات لوحة الدور', role.widgets, 'مولدة من عقد المنصب'],
    ['auto', 'مهام مؤهلة آليًا', role.autonomousEligibleTasks, 'الأهلية ليست تنفيذًا'],
    ['gated', 'مهام تتطلب اعتمادًا', role.approvalGatedTasks, 'قرارات عالية الأثر'],
    ['products', labels.products, commerce.products, 'من سجل موحد'],
    ['sectors', labels.sectors, commerce.sectors, 'ضمن النطاق الحالي']
  ];
  for (const [key, label, value, note] of entries) {
    const card = el('article', 'kpi');
    card.dataset.metric = key;
    card.append(el('span', '', label));
    card.append(el('strong', '', value));
    card.append(el('small', '', note));
    grid.append(card);
  }
}

function renderRoleFocus() {
  const role = dashboardState.roleDashboard.role;
  document.getElementById('role-name').textContent = role.nameAr;
  const list = document.getElementById('role-focus');
  list.replaceChildren();
  list.append(el('li', '', role.purposeAr));
  for (const item of role.domains) {
    list.append(el('li', '', domainLabels[item] || item.replaceAll('-', ' ')));
  }
}

function renderDataState() {
  const list = document.getElementById('data-state');
  list.replaceChildren();
  const state = {
    'إسناد الدور': statusLabels[dashboardState.roleDashboard.assignment.mode],
    'الوضع التشغيلي': '0 موظفين افتراضيًا',
    'الكتالوج': labels[dashboardState.dashboard.dataState.catalog],
    'الإنتاج الداخلي': dashboardState.production.internalLane.status,
    'البيانات المالية الحية': 'غير موصولة',
    'الأثر العالي': 'موافقة بشرية'
  };
  for (const [name, value] of Object.entries(state)) {
    const row = el('div');
    row.append(el('dt', '', name));
    row.append(el('dd', '', value));
    list.append(row);
  }
}

function renderSectorPreview() {
  const grid = document.getElementById('sector-preview-grid');
  grid.replaceChildren();
  for (const sector of dashboardState.dashboard.sectors.slice(0, 8)) {
    const item = el('article', 'sector-preview-item');
    item.append(el('strong', '', sector.nameAr));
    item.append(el('span', '', sector.groupNameAr));
    item.append(el('p', '', sector.benefitAr));
    grid.append(item);
  }
}

function appendCell(row, content, strong) {
  const cell = el('td');
  cell.append(el(strong ? 'strong' : 'span', '', content));
  row.append(cell);
}

function renderProductTable() {
  const body = document.getElementById('product-table');
  body.replaceChildren();
  for (const product of dashboardState.dashboard.products) {
    const row = el('tr');
    appendCell(row, product.nameAr, true);
    appendCell(row, kindLabels[product.kind] || product.kind);
    appendCell(row, sectorName(product.primarySector));
    const stateCell = el('td');
    stateCell.append(el('span', 'state-badge', product.availability));
    row.append(stateCell);
    appendCell(row, 'بطلب عرض');
    const technicalCell = el('td');
    const technicalLink = el('a', 'table-action', 'فتح الملف');
    technicalLink.href = `/product-technical/?id=${encodeURIComponent(product.id)}`;
    technicalCell.append(technicalLink);
    row.append(technicalCell);
    body.append(row);
  }
}

function renderSectorTable() {
  const body = document.getElementById('sector-table');
  body.replaceChildren();
  for (const sector of dashboardState.dashboard.sectors) {
    const row = el('tr');
    appendCell(row, sector.nameAr, true);
    appendCell(row, sector.groupNameAr);
    appendCell(row, sector.productCount);
    appendCell(row, sector.benefitAr);
    const stateCell = el('td');
    stateCell.append(el('span', 'state-badge', 'عقد جاهز'));
    row.append(stateCell);
    body.append(row);
  }
}

function renderOperations() {
  const list = document.getElementById('operation-list');
  list.replaceChildren();
  for (const workflow of dashboardState.dashboard.workflows) {
    const item = el('li');
    item.append(el('span', '', String(workflow.order).padStart(2, '0')));
    item.append(el('strong', '', workflow.nameAr));
    item.append(el(
      'p',
      '',
      workflow.highImpact
        ? 'عملية عالية الأثر، تتطلب مراجعة وموافقة بشرية.'
        : 'يمكن إعداد خطتها ضمن حدود القراءة والتنسيق.'
    ));
    list.append(item);
  }
}

function renderOperatingModel() {
  const model = dashboardState.operatingModel;
  document.getElementById('operating-mode').textContent =
    model.activeHumanOperators === 0
      ? 'استمرارية تشغيلية بلا موظفين'
      : 'تشغيل هجين آلي وبشري';
  document.getElementById('human-operators').textContent =
    model.activeHumanOperators;
  document.getElementById('agent-assignments').textContent =
    model.autonomousRoleAssignments;
}

function renderOrganizationTable() {
  const body = document.getElementById('organization-table');
  body.replaceChildren();
  document.getElementById('role-count').textContent =
    `${dashboardState.roles.length} دور`;
  const assignments = new Map(
    dashboardState.operatingModel.assignments.map((item) => [item.roleId, item])
  );
  for (const role of dashboardState.roles) {
    const assignment = assignments.get(role.id);
    const row = el('tr');
    appendCell(row, role.nameAr, true);
    appendCell(row, tierLabels[role.tier] || role.tier);
    appendCell(row, role.purposeAr);
    appendCell(row, statusLabels[assignment?.mode] || assignment?.mode || 'غير محدد');
    appendCell(row, 'لا تفوّض للآلة');
    body.append(row);
  }
}

function renderTasks() {
  const body = document.getElementById('task-table');
  body.replaceChildren();
  document.getElementById('task-role-label').textContent =
    dashboardState.roleDashboard.role.nameAr;
  for (const task of dashboardState.roleDashboard.tasks) {
    const row = el('tr');
    appendCell(row, task.nameAr, true);
    appendCell(row, task.capability);
    appendCell(row, statusLabels[task.impact] || task.impact);
    appendCell(row, statusLabels[task.executionMode] || task.executionMode);
    const gate = el('td');
    gate.append(el(
      'span',
      `state-badge ${task.humanApprovalRequired ? 'approval' : ''}`,
      task.humanApprovalRequired ? 'اعتماد بشري' : 'سياسة آلية'
    ));
    row.append(gate);
    body.append(row);
  }
}

function renderWorkforce() {
  const list = document.getElementById('workforce-state');
  list.replaceChildren();
  const state = {
    'الموظفون النشطون': dashboardState.operatingModel.activeHumanOperators,
    'الوكلاء المسندون': dashboardState.operatingModel.autonomousRoleAssignments,
    'التوظيف البشري': 'اختياري عند الحاجة',
    'مسؤولية المالك': 'مطلوبة',
    'السلطة القانونية الآلية': 'غير مفعلة'
  };
  for (const [name, value] of Object.entries(state)) {
    const row = el('div');
    row.append(el('dt', '', name), el('dd', '', value));
    list.append(row);
  }
}

function renderGovernance() {
  const grid = document.getElementById('governance-grid');
  grid.replaceChildren();
  const policy = dashboardState.organization.governance;
  const entries = [
    ['الدليل قبل الادعاء', policy.evidenceBeforeClaim],
    ['أقل صلاحية', policy.leastPrivilege],
    ['فصل الواجبات', policy.separationOfDuties],
    ['تدقيق الإجراءات الحساسة', policy.auditSensitiveActions],
    ['موافقة بشرية للقرار الملزم', policy.humanApprovalForBindingDecisions],
    ['لا فتوى آلية', policy.noAutomatedFatwa],
    ['لا سلطة شرعية للبرنامج', policy.noClaimOfReligiousAuthority],
    ['الكتابة الخارجية', dashboardState.organization.automation.externalWritesDefault]
  ];
  for (const [name, value] of entries) {
    const item = el('article', 'governance-item');
    item.append(el('span', '', name));
    item.append(el('strong', '', value === true ? 'مفعّل' : value === false ? 'ممنوع' : value));
    grid.append(item);
  }
}

function renderProduction() {
  const production = dashboardState.production;
  document.getElementById('production-internal-state').textContent =
    productionLabel(production.internalLane.status);
  const verifiedCount = document.getElementById(
    'production-verified-count'
  );
  verifiedCount.replaceChildren(
    el(
      'bdi',
      '',
      String(production.coverage.verifiedInternalCapabilityCount)
    ),
    el('span', '', 'من'),
    el('bdi', '', String(production.internalLane.evidenceCount))
  );
  document.getElementById('production-external-state').textContent =
    productionLabel(production.externalLane.status);
  document.getElementById('production-external-ready').textContent =
    production.coverage.externalProductionReadyAdapterCount;
  document.getElementById('production-system-count').textContent =
    `${dashboardState.productionSystems.length} عائلة`;

  const evidenceBody = document.getElementById(
    'production-evidence-table'
  );
  evidenceBody.replaceChildren();
  for (const evidence of dashboardState.productionEvidence) {
    const row = el('tr');
    appendCell(row, evidence.titleAr, true);
    const state = el('td');
    state.append(el(
      'span',
      `state-badge ${evidence.verified ? '' : 'approval'}`,
      evidence.verified ? 'متحقق' : 'غير متحقق حاليًا'
    ));
    row.append(state);
    appendCell(row, productionLabel(evidence.verificationLevel));
    appendCell(
      row,
      evidence.artifactBuilt
        ? 'قطعة موجودة ومطابقة'
        : evidence.staleEvidenceClaim
          ? 'التقرير موجود والقطعة غائبة'
          : 'لا توجد قطعة مطلوبة أو مثبتة'
    );
    evidenceBody.append(row);
  }

  const modelBody = document.getElementById('production-model-table');
  modelBody.replaceChildren();
  for (const model of dashboardState.productionModels) {
    const row = el('tr');
    appendCell(row, model.titleAr, true);
    appendCell(row, productionLabel(model.lane));
    const state = el('td');
    state.append(el(
      'span',
      `state-badge ${model.externalComponents ? 'approval' : ''}`,
      productionLabel(model.activation)
    ));
    row.append(state);
    appendCell(row, model.externalComponents ? 'نعم، بعقد وموافقة' : 'لا');
    modelBody.append(row);
  }

  const systemBody = document.getElementById('production-system-table');
  systemBody.replaceChildren();
  for (const family of dashboardState.productionSystems) {
    const row = el('tr');
    appendCell(row, family.titleAr, true);
    appendCell(row, productionLabel(family.ownershipClass));
    const state = el('td');
    state.append(el(
      'span',
      `state-badge ${family.activation.includes('DEFAULT_DENY') ? 'approval' : ''}`,
      productionLabel(family.activation)
    ));
    row.append(state);
    appendCell(row, productionLabel(family.productionSupport));
    systemBody.append(row);
  }
}

function renderDashboard() {
  document.getElementById('health-state').textContent = 'Organization Control نشط';
  document.getElementById('health-dot').classList.add('ready');
  document.getElementById('scope-label').textContent = sectorName(dashboardState.sector);
  renderKpis();
  renderRoleFocus();
  renderDataState();
  renderOperatingModel();
  renderOrganizationTable();
  renderTasks();
  renderWorkforce();
  renderGovernance();
  renderProduction();
  renderSectorPreview();
  renderProductTable();
  renderSectorTable();
  renderOperations();
}

function commerceRoleFor(roleId) {
  if (['CFO', 'BOARD_CHAIR', 'BOARD_MEMBER'].includes(roleId)) return 'governance';
  if (['COO', 'CTO', 'CISO', 'DEPARTMENT_MANAGER', 'EMPLOYEE'].includes(roleId)) {
    return 'operator';
  }
  return 'owner';
}

async function loadDashboard() {
  document.getElementById('health-state').textContent = 'جارٍ تحديث البيانات';
  const params = new URLSearchParams({
    role: commerceRoleFor(dashboardState.role),
    sector: dashboardState.sector
  });
  const roleParams = new URLSearchParams({
    assignment: dashboardState.assignment
  });
  [dashboardState.dashboard, dashboardState.roleDashboard] = await Promise.all([
    readJson(`${API}/dashboard?${params}`),
    readJson(
      `${ORGANIZATION_API}/dashboards/${encodeURIComponent(dashboardState.role)}?${roleParams}`
    )
  ]);
  renderDashboard();
}

function openView(view) {
  dashboardState.view = view;
  document.querySelectorAll('[data-panel]').forEach((panel) =>
    panel.classList.toggle('active', panel.dataset.panel === view)
  );
  document.querySelectorAll('[data-view]').forEach((button) =>
    button.classList.toggle('active', button.dataset.view === view)
  );
  const titles = {
    overview: ['لوحة المالك العليا', 'قيادة المؤسسة والأدوار والمهام الآلية والموافقات من سجل واحد محكوم.'],
    organization: ['الهيكل والأدوار', 'لوحة وصلاحيات ومهام مولدة آليًا لكل منصب.'],
    tasks: ['المهام الآلية', 'تمييز صريح بين العمل الآلي والقرار الذي ينتظر الاعتماد.'],
    workforce: ['الوظائف والكوادر', 'تشغيل افتراضي دون موظفين مع فتح التوظيف البشري عند الحاجة.'],
    governance: ['الموافقات والحوكمة', 'حدود الأتمتة والأدلة والصلاحيات والمساءلة.'],
    production: ['الإنتاج والاتحاد', 'مساران داخلي وخارجي بعقد واحد وبصمة قطعة ثابتة وحدود تنفيذ صريحة.'],
    products: ['المنتجات والخدمات', 'كتالوج السوق وSheikha Cloud SaaS في سجل تشغيلي واحد.'],
    sectors: ['القطاعات والأسواق', 'تكامل العمليات والمنفعة التشغيلية عبر كل قطاع.'],
    operations: ['مسارات العمليات', 'تنسيق مشترك مع بوابة بشرية للعمليات عالية الأثر.']
  };
  document.getElementById('view-title').textContent = titles[view][0];
  document.getElementById('view-description').textContent = titles[view][1];
  window.history.replaceState(null, '', `#${view}`);
}

function bindDashboardControls() {
  document.querySelectorAll('[data-view]').forEach((button) =>
    button.addEventListener('click', () => openView(button.dataset.view))
  );
  document.querySelectorAll('[data-open-view]').forEach((button) =>
    button.addEventListener('click', () => openView(button.dataset.openView))
  );
  document.getElementById('role-filter').addEventListener('change', async (event) => {
    dashboardState.role = event.target.value;
    await loadDashboard();
  });
  document.getElementById('assignment-filter').addEventListener('change', async (event) => {
    dashboardState.assignment = event.target.value;
    await loadDashboard();
  });
  document.getElementById('dashboard-sector').addEventListener('change', async (event) => {
    dashboardState.sector = event.target.value;
    await loadDashboard();
  });
  document.getElementById('refresh-dashboard').addEventListener('click', loadDashboard);
  document.getElementById('preview-position').addEventListener('click', previewPosition);
}

async function previewPosition() {
  const result = document.getElementById('position-result');
  result.textContent = 'جارٍ إعداد المعاينة...';
  try {
    const response = await fetch(`${ORGANIZATION_API}/positions/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleId: dashboardState.role,
        employmentMode: 'HUMAN'
      })
    });
    const body = await response.json();
    if (!response.ok || body.success === false) throw new Error(body.message);
    result.textContent =
      `${body.data.role.nameAr}: عقد الدور واللوحة جاهزان للمعاينة. ` +
      'لم تُنشر وظيفة ولم يُمنح وصول.';
  } catch (error) {
    result.textContent = `تعذرت المعاينة: ${error.message}`;
  }
}

async function activateDashboard() {
  const [
    sectorData,
    organization,
    roles,
    operatingModel,
    production,
    productionModels,
    productionSystems,
    productionEvidence
  ] = await Promise.all([
    readJson(`${API}/sectors`),
    readJson(`${ORGANIZATION_API}/status`),
    readJson(`${ORGANIZATION_API}/roles`),
    readJson(`${ORGANIZATION_API}/operating-model?humanOperators=0`),
    readJson(`${PRODUCTION_API}/status`),
    readJson(`${PRODUCTION_API}/models`),
    readJson(`${PRODUCTION_API}/systems`),
    readJson(`${PRODUCTION_API}/evidence`)
  ]);
  dashboardState.sectors = sectorData.sectors;
  dashboardState.organization = organization;
  dashboardState.roles = roles.roles;
  dashboardState.operatingModel = operatingModel;
  dashboardState.production = production;
  dashboardState.productionModels = productionModels.models;
  dashboardState.productionSystems = productionSystems.families;
  dashboardState.productionEvidence = productionEvidence.capabilities;

  const roleSelector = document.getElementById('role-filter');
  roleSelector.replaceChildren();
  for (const role of dashboardState.roles) {
    const option = el('option', '', role.nameAr);
    option.value = role.id;
    roleSelector.append(option);
  }
  roleSelector.value = dashboardState.role;

  const selector = document.getElementById('dashboard-sector');
  for (const sector of dashboardState.sectors) {
    const option = el('option', '', sector.nameAr);
    option.value = sector.id;
    selector.append(option);
  }
  bindDashboardControls();
  await loadDashboard();
  const requestedView = window.location.hash.slice(1);
  if ([
    'overview', 'organization', 'tasks', 'workforce',
    'governance', 'production', 'products', 'sectors', 'operations'
  ].includes(requestedView)) {
    openView(requestedView);
  }
}

activateDashboard().catch((error) => {
  document.getElementById('health-state').textContent = 'تعذر تحميل مركز التحكم';
  document.getElementById('view-description').textContent = error.message;
});
