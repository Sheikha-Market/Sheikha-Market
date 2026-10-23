'use strict';

const { getRole, GOVERNANCE } = require('./sheikha-autonomous-role-dashboard-fabric-v1');
const { sha256 } = require('../partnerships/shared-goals-v1');

const DEFINITIONS = [
  ['executive', 'الإدارة التنفيذية', 'CEO', 'تنسيق الأهداف والقدرة والمخاطر', 'تحقق أهداف مقيسة'],
  ['supply-chain', 'سلاسل الإمداد والتوريد', 'COO', 'تخطيط الاحتياج والموردين والتسليم', 'التسليم في الموعد'],
  ['factory', 'إدارة المصانع', 'COO', 'خطة إنتاج وصيانة وجودة دون تحكم في الآلات', 'المنتج المقبول من أول مرة'],
  ['facilities', 'إدارة المرافق', 'COO', 'استمرارية الخدمة وأوامر صيانة مقترحة', 'إتمام الصيانة المخططة'],
  ['infrastructure', 'إدارة البنية التحتية', 'CTO', 'السعة والأصول والاعتماديات والتعافي', 'استعادة خدمة مختبرة'],
  ['industrial-clusters', 'الصناعة والتجمعات الصناعية', 'COO', 'تخطيط خدمات مشتركة وتنسيق موردين', 'طلبات تنسيق مقبولة'],
  ['cities', 'خدمات تخطيط المدن', 'STRATEGY_DIRECTOR', 'تحليل خدمات للجهة المخولة دون سلطة عامة', 'زمن معالجة طلب خدمة'],
  ['public-administration', 'دعم إدارة الجهات العامة والدول', 'STRATEGY_DIRECTOR', 'تخطيط ومؤشرات ضمن تكليف الجهة المختصة', 'أهداف خدمة مقيسة'],
  ['regional', 'التخطيط الإقليمي', 'STRATEGY_DIRECTOR', 'مقارنة احتياجات وتنسيق خدمات إقليمية', 'تغطية احتياج موثق'],
  ['marketing', 'إدارة التسويق', 'DEPARTMENT_MANAGER', 'تحليل حاجة وقنوات ومحتوى مسودة', 'تحويل طلب مؤهل إلى بيع محصل'],
  ['support', 'الإدارة المساندة', 'DEPARTMENT_MANAGER', 'فرز طلبات الخدمة ومتابعة الاستجابة', 'زمن حل طلب'],
  ['engineering', 'الإدارة الهندسية', 'CTO', 'المتطلبات والتصميم والتحقق', 'اجتياز اختبارات القبول'],
  ['technical', 'الإدارة الفنية', 'CTO', 'تشخيص تقني وإجراءات تشغيل مقترحة', 'تكرار العطل'],
  ['advisory', 'الإدارة الاستشارية', 'DEPARTMENT_MANAGER', 'رأي موثق وحدوده ومراجعة مختص', 'قبول توصيات قابلة للتحقق'],
  ['resources', 'إدارة الموارد', 'COO', 'حصر الموارد والسعة والندرة وإعادة الاستخدام', 'استخدام موارد مثبت'],
  ['human-resources', 'إدارة الموارد البشرية', 'CHRO', 'تخطيط وظائف وكفاءات وتعليم دون قرارات أفراد آلية', 'إتقان مهارة مقيسة'],
  ['safety', 'إدارة السلامة', 'DEPARTMENT_MANAGER', 'تصعيد مخاطر وحالات تتطلب مختصا', 'إغلاق إجراء سلامة بدليل'],
  ['quality', 'إدارة الجودة', 'DEPARTMENT_MANAGER', 'معايير قبول وتدقيق وعدم مطابقة', 'تكرار عدم المطابقة'],
  ['improvement', 'التطوير والتحسين', 'STRATEGY_DIRECTOR', 'تجارب صغيرة وقياس الانحدار والنتيجة', 'تحسين مثبت بعد المقارنة'],
  ['strategy', 'الرؤية والأهداف والبرامج', 'STRATEGY_DIRECTOR', 'ربط الرسالة بالبرامج والمشاريع والمقاييس', 'تغطية الأهداف بالدليل'],
  ['governance', 'إدارة الحوكمة', 'BOARD_CHAIR', 'حقوق وموافقات وتعارض مصالح ومراجعة مستقلة', 'التزام مفوض موثق'],
  ['ai', 'إدارة الذكاء الصناعي', 'CTO', 'نماذج وبيانات وتقييم وحقوق وميزانيات تدريب', 'مهام تقييم مقبولة'],
  ['computing', 'إدارة الحاسب', 'CTO', 'تشغيل وحصص وأدوات تطوير ومراقبة', 'توفر مقيس للخدمة'],
  ['finance', 'الإدارة المالية', 'CFO', 'سيناريوهات وسيولة وتكلفة دون صرف', 'هامش وتحصيل فعلي'],
  ['legal-rights', 'العقود والحقوق', 'DEPARTMENT_MANAGER', 'فهرسة حقوق ومسودات وإحالة للاختصاص', 'حقوق سارية متحققة'],
  ['customer-success', 'نجاح العملاء', 'DEPARTMENT_MANAGER', 'متابعة أهداف العميل والقبول والاعتراض', 'منفعة عميل مقيسة'],
  ['partnerships', 'نجاح الشراكات', 'DEPARTMENT_MANAGER', 'ميثاق وجدول ومنفعة متبادلة دون مراسلة تلقائية', 'هدف مشترك مثبت'],
  ['security', 'أمن المعلومات', 'CISO', 'وصول وحوادث وخصوصية وتحليل أمني دفاعي', 'زمن احتواء حادث'],
  ['education', 'التعليم والمعرفة', 'DEPARTMENT_MANAGER', 'أهداف تعلم ودروس وتمارين ومراجعة مصادر', 'اجتياز تطبيق مستقل'],
  ['sustainability', 'الموارد والبيئة والمنفعة', 'DEPARTMENT_MANAGER', 'قياس طاقة وماء ومخلفات ونفع دون ادعاء غير مثبت', 'وفر مورد بوحدة وحمل معروف']
];
const CATALOG = Object.freeze(DEFINITIONS.map(([id, nameAr, roleId, purposeAr, suggestedKpi]) => Object.freeze({ id, nameAr, roleId, purposeAr, suggestedKpi })));
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const IMPACT = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
const LOCAL_TASKS = ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK'];
const GATED_TASKS = ['SIGN_CONTRACT', 'APPROVE_BUDGET', 'PAY_FUNDS', 'HIRE_PERSON', 'CHANGE_PRODUCTION', 'PHYSICAL_CONTROL', 'PUBLIC_POLICY'];
function check(ok, code) { if (!ok) throw new Error(code); }
function id(v) { return typeof v === 'string' && ID.test(v); }
function text(v) { return typeof v === 'string' && v.trim().length > 0 && v.length <= 10000; }
function number(v) { return typeof v === 'number' && Number.isFinite(v) && v >= 0; }
function date(v) {
  check(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v), 'UTC_TIMESTAMP_REQUIRED');
  const n = Date.parse(v); check(Number.isFinite(n) && new Date(n).toISOString() === v, 'INVALID_TIMESTAMP'); return n;
}
function records(values, max, code) {
  check(Array.isArray(values) && values.length <= max, code);
  const ids = new Set();
  values.forEach(v => { check(v && id(v.id) && !ids.has(v.id), code); ids.add(v.id); });
  return ids;
}
function refs(values, ids, code, required = false) {
  check(Array.isArray(values) && values.length <= 100 && (!required || values.length > 0) && new Set(values).size === values.length && values.every(v => ids.has(v)), code);
}
function acyclic(nodes, dependencies, code) {
  const done = new Set(), visiting = new Set();
  const visit = node => {
    check(!visiting.has(node.id), code); if (done.has(node.id)) return;
    visiting.add(node.id); dependencies(node).forEach(dependency => visit(nodes.find(n => n.id === dependency)));
    visiting.delete(node.id); done.add(node.id);
  };
  nodes.forEach(visit);
}
function listDepartmentTemplates() { return CATALOG.map(entry => ({ ...entry })); }

function planOrganization(org, portfolio, asOf) {
  const now = date(asOf);
  check(org && id(org.id) && id(org.tenantId) && text(org.displayName) && text(org.vision) && text(org.mission), 'ORGANIZATION_IDENTITY_REQUIRED');
  check(id(org.accountableHumanId) && Array.isArray(org.values) && org.values.length > 0 && org.values.length <= 30 && org.values.every(text), 'ACCOUNTABILITY_AND_VALUES_REQUIRED');
  check(['INTERNAL', 'CUSTOMER', 'PARTNER'].includes(org.type), 'ORGANIZATION_TYPE_REQUIRED');
  if (org.type !== 'INTERNAL') {
    const relationship = portfolio.relationships.find(r => r.id === org.relationshipId && r.tenantId === org.tenantId && r.type === (org.type === 'CUSTOMER' ? 'customer' : 'partner'));
    check(relationship && !['SUSPENDED', 'CLOSED'].includes(relationship.stage), 'ORGANIZATION_RELATIONSHIP_SCOPE_DENIED');
  } else check(org.relationshipId === null, 'INTERNAL_RELATIONSHIP_MUST_BE_NULL');
  const goalIds = records(org.goals, 100, 'INVALID_ORGANIZATION_GOALS');
  check(goalIds.size > 0, 'ORGANIZATION_GOAL_REQUIRED');
  org.goals.forEach(goal => { check(text(goal.title) && id(goal.ownerId), 'INVALID_ORGANIZATION_GOAL'); date(goal.dueAt); });
  const deptIds = records(org.departments, 100, 'INVALID_DEPARTMENTS');
  check(deptIds.size > 0, 'DEPARTMENT_REQUIRED');
  const allTasks = [];
  org.departments.forEach(dept => {
    check(CATALOG.some(item => item.id === dept.templateId), 'UNKNOWN_DEPARTMENT_TEMPLATE');
    check(text(dept.mandate) && id(dept.ownerId) && id(dept.reviewerId) && dept.ownerId !== dept.reviewerId, 'INDEPENDENT_DEPARTMENT_ACCOUNTABILITY_REQUIRED');
    check(dept.parentId === null || (deptIds.has(dept.parentId) && dept.parentId !== dept.id), 'INVALID_DEPARTMENT_PARENT');
    refs(dept.goalIds, goalIds, 'INVALID_DEPARTMENT_GOAL', true);
    check(dept.capacityHours === null || number(dept.capacityHours), 'INVALID_CAPACITY');
    check(dept.budgetMinor === null || (Number.isSafeInteger(dept.budgetMinor) && dept.budgetMinor >= 0), 'INVALID_DEPARTMENT_BUDGET');
    check(typeof dept.currency === 'string' && /^[A-Z]{3}$/.test(dept.currency), 'CURRENCY_REQUIRED');
    records(dept.kpis, 30, 'INVALID_DEPARTMENT_KPIS');
    check(dept.kpis.length > 0, 'DEPARTMENT_KPI_REQUIRED');
    dept.kpis.forEach(k => check(text(k.label) && text(k.unit) && (k.target === null || number(k.target)), 'INVALID_DEPARTMENT_KPI'));
    check(Array.isArray(dept.interfaces) && dept.interfaces.length <= 100, 'INVALID_DEPARTMENT_INTERFACES');
    dept.interfaces.forEach(i => check(i && deptIds.has(i.departmentId) && i.departmentId !== dept.id && text(i.purpose), 'INVALID_DEPARTMENT_INTERFACE'));
    records(dept.tasks, 100, 'INVALID_DEPARTMENT_TASKS');
    dept.tasks.forEach(task => {
      check(text(task.title) && id(task.ownerId) && dept.goalIds.includes(task.goalId) && number(task.remainingHours), 'INVALID_TASK_SCOPE_OR_EFFORT');
      check(Object.hasOwn(IMPACT, task.impact) && ['TODO', 'IN_PROGRESS', 'DONE_DECLARED', 'BLOCKED'].includes(task.status), 'INVALID_TASK_STATE');
      check([...LOCAL_TASKS, ...GATED_TASKS].includes(task.action), 'UNKNOWN_TASK_ACTION'); date(task.dueAt);
      allTasks.push({ ...task, departmentId: dept.id });
    });
  });
  const taskIds = records(allTasks, 1000, 'TASK_LIMIT_OR_DUPLICATE');
  allTasks.forEach(task => refs(task.dependsOn, taskIds, 'INVALID_TASK_DEPENDENCY'));
  acyclic(org.departments, d => d.parentId === null ? [] : [d.parentId], 'DEPARTMENT_HIERARCHY_CYCLE');
  acyclic(allTasks, task => task.dependsOn, 'TASK_DEPENDENCY_CYCLE');
  const coveredGoals = new Set(org.departments.flatMap(dept => dept.goalIds));
  check(org.goals.every(goal => coveredGoals.has(goal.id)), 'UNASSIGNED_ORGANIZATION_GOAL');

  const departments = org.departments.map(dept => {
    const definition = CATALOG.find(item => item.id === dept.templateId), role = getRole(definition.roleId);
    const tasks = allTasks.filter(task => task.departmentId === dept.id).map(task => {
      const requiresAuthority = GATED_TASKS.includes(task.action) || IMPACT[task.impact] >= IMPACT.HIGH;
      const status = requiresAuthority ? 'AUTHORITY_AND_SPECIALIST_REVIEW_REQUIRED'
        : task.status === 'BLOCKED' ? 'OWNER_UNBLOCK_REVIEW_REQUIRED'
          : task.status === 'DONE_DECLARED' ? 'COMPLETION_EVIDENCE_REVIEW_REQUIRED'
            : task.dependsOn.length ? 'DEPENDENCY_ACCEPTANCE_REVIEW_REQUIRED' : 'LOCAL_PLANNING_CANDIDATE';
      return { id: task.id, title: task.title, goalId: task.goalId, ownerId: task.ownerId, dueAt: task.dueAt, action: task.action,
        declaredStatus: task.status, impact: task.impact, remainingHours: task.remainingHours, dependsOn: [...task.dependsOn],
        overdue: task.status === 'DONE_DECLARED' ? null : date(task.dueAt) < now,
        status, requiresAuthority, executionAllowed: false, taskExecuted: false, approvalVerified: false };
    }).sort((a, b) => IMPACT[b.impact] - IMPACT[a.impact] || date(a.dueAt) - date(b.dueAt) || a.id.localeCompare(b.id));
    const effort = tasks.reduce((total, t) => total + t.remainingHours, 0);
    check(Number.isFinite(effort), 'EFFORT_OVERFLOW');
    return { id: dept.id, templateId: definition.id, nameAr: definition.nameAr, mandate: dept.mandate,
      tenantId: org.tenantId, organizationId: org.id, parentId: dept.parentId, goalIds: [...dept.goalIds],
      interfaces: dept.interfaces.map(i => ({ departmentId: i.departmentId, purpose: i.purpose })),
      manager: { id: `${org.id}:${dept.id}:manager`, roleId: role.id, roleNameAr: role.nameAr,
        mode: 'DETERMINISTIC_LOCAL_PLANNING_AND_REVIEW', humanOwnerId: dept.ownerId, independentReviewerId: dept.reviewerId,
        llmInvoked: false, persistentWorkerStarted: false, identityVerified: false, localBriefGenerated: true,
        autonomousCapabilities: [...LOCAL_TASKS], externalExecutionAllowed: false },
      capacity: { declaredHours: dept.capacityHours, declaredRemainingHours: effort,
        overloaded: dept.capacityHours === null ? null : effort > dept.capacityHours,
        scope: 'DEPARTMENT_ALLOCATION_NOT_VERIFIED_PERSON_AVAILABILITY',
        completionEffortReviewRequired: tasks.some(t => t.declaredStatus === 'DONE_DECLARED') },
      budget: { declaredMinor: dept.budgetMinor, currency: dept.currency, actualSpentMinor: null, spendingAuthorized: false },
      metrics: dept.kpis.map(k => ({ id: k.id, label: k.label, unit: k.unit, proposedTarget: k.target, actual: null, status: 'NO_VERIFIED_MEASUREMENT_CONNECTED' })),
      reviewCadence: { workload: 'DAILY_PROPOSED', goals: 'WEEKLY_PROPOSED', rightsAndValue: 'MONTHLY_PROPOSED', schedulerStarted: false },
      tasks, publicAuthorityGranted: false, physicalControlConnected: false };
  });
  const ownerCounts = new Map(); departments.forEach(d => ownerCounts.set(d.manager.humanOwnerId, (ownerCounts.get(d.manager.humanOwnerId) || 0) + 1));
  const plan = { system: 'SHEIKHA_NEED_BASED_DIGITAL_MANAGEMENT_V1', classification: 'CONFIDENTIAL_INTERNAL_DRAFT',
    dataMode: portfolio.dataMode, asOf, organizationId: org.id, tenantId: org.tenantId, type: org.type,
    relationshipId: org.relationshipId, displayName: org.displayName, vision: org.vision, mission: org.mission, values: [...org.values],
    accountableHumanId: org.accountableHumanId, goals: org.goals.map(g => ({ id: g.id, title: g.title, ownerId: g.ownerId, dueAt: g.dueAt, achievementVerified: false })),
    executive: { roleId: 'CEO', humanAccountableId: org.accountableHumanId, mode: 'LOCAL_COORDINATION_BRIEF',
      departmentCount: departments.length, declaredTaskCount: allTasks.length, completedTasksVerified: 0,
      overloadedDepartmentIds: departments.filter(d => d.capacity.overloaded).map(d => d.id),
      unknownCapacityDepartmentIds: departments.filter(d => d.capacity.declaredHours === null).map(d => d.id),
      sharedOwnersRequireCapacityReview: [...ownerCounts].filter(([, count]) => count > 1).map(([ownerId]) => ownerId),
      escalationQueue: departments.flatMap(d => d.tasks.filter(t => t.requiresAuthority || t.overdue).map(t => ({ departmentId: d.id, taskId: t.id, ownerId: d.manager.humanOwnerId, reviewerId: d.manager.independentReviewerId, reason: t.requiresAuthority ? 'AUTHORITY_REVIEW' : 'OVERDUE_REVIEW', sent: false }))) },
    departments, governance: GOVERNANCE,
    boundaries: { foreignTenantAccessAllowed: false, signaturesProduced: 0, paymentsExecuted: 0, employeesHired: 0, physicalCommandsExecuted: 0, publicAuthorityClaimed: false,
      externalMessagesSent: 0, religiousRulingIssued: false, productionActivated: false, persistentAgentsStarted: 0 }
  };
  return { ...plan, planSha256: sha256(JSON.stringify(plan)) };
}

module.exports = { listDepartmentTemplates, planOrganization };
