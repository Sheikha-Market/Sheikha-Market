'use strict';

const GOVERNANCE = Object.freeze({
  referenceModel: 'QURAN_AND_SUNNAH_VALUES_WITH_QUALIFIED_HUMAN_REVIEW',
  values: Object.freeze([
    'العدل',
    'الأمانة',
    'الوفاء بالعقود',
    'التثبت',
    'منع الضرر'
  ]),
  evidenceBeforeClaim: true,
  leastPrivilege: true,
  separationOfDuties: true,
  auditSensitiveActions: true,
  humanApprovalForBindingDecisions: true,
  noAutomatedFatwa: true,
  noClaimOfReligiousAuthority: true,
  noAutomatedLegalPersonhood: true
});

const TASKS = Object.freeze({
  MONITOR_KPIS: Object.freeze({
    id: 'MONITOR_KPIS',
    nameAr: 'مراقبة المؤشرات',
    impact: 'LOW',
    capability: 'READ_MEASURE',
    binding: false,
    externalWrite: false
  }),
  PREPARE_REPORT: Object.freeze({
    id: 'PREPARE_REPORT',
    nameAr: 'إعداد التقرير',
    impact: 'LOW',
    capability: 'ANALYZE_REPORT',
    binding: false,
    externalWrite: false
  }),
  PRIORITIZE_WORK: Object.freeze({
    id: 'PRIORITIZE_WORK',
    nameAr: 'اقتراح ترتيب الأولويات',
    impact: 'MEDIUM',
    capability: 'PLAN_RECOMMEND',
    binding: false,
    externalWrite: false
  }),
  RECONCILE_RECORDS: Object.freeze({
    id: 'RECONCILE_RECORDS',
    nameAr: 'مطابقة السجلات',
    impact: 'MEDIUM',
    capability: 'INTERNAL_REVERSIBLE',
    binding: false,
    externalWrite: false
  }),
  APPROVE_STRATEGY: Object.freeze({
    id: 'APPROVE_STRATEGY',
    nameAr: 'اعتماد الاستراتيجية',
    impact: 'HIGH',
    capability: 'FIDUCIARY_DECISION',
    binding: true,
    externalWrite: false
  }),
  APPROVE_BUDGET: Object.freeze({
    id: 'APPROVE_BUDGET',
    nameAr: 'اعتماد الميزانية',
    impact: 'HIGH',
    capability: 'FINANCIAL_COMMITMENT',
    binding: true,
    externalWrite: true
  }),
  SIGN_CONTRACT: Object.freeze({
    id: 'SIGN_CONTRACT',
    nameAr: 'توقيع عقد ملزم',
    impact: 'HIGH',
    capability: 'LEGAL_COMMITMENT',
    binding: true,
    externalWrite: true
  }),
  HIRE_PERSON: Object.freeze({
    id: 'HIRE_PERSON',
    nameAr: 'اعتماد التوظيف',
    impact: 'HIGH',
    capability: 'EMPLOYMENT_DECISION',
    binding: true,
    externalWrite: true
  }),
  PAY_FUNDS: Object.freeze({
    id: 'PAY_FUNDS',
    nameAr: 'صرف الأموال',
    impact: 'HIGH',
    capability: 'FINANCIAL_EXECUTION',
    binding: true,
    externalWrite: true
  }),
  CHANGE_PRODUCTION: Object.freeze({
    id: 'CHANGE_PRODUCTION',
    nameAr: 'تغيير الإنتاج',
    impact: 'HIGH',
    capability: 'PRODUCTION_MUTATION',
    binding: false,
    externalWrite: true
  })
});

const ROLE_CATALOG = Object.freeze({
  OWNER: role({
    id: 'OWNER',
    nameAr: 'المالك',
    tier: 'OWNERSHIP',
    purposeAr: 'الرؤية العليا، ملكية المخاطر، واعتماد القرارات الملزمة.',
    domains: ['vision', 'governance', 'portfolio', 'risk', 'capital'],
    widgets: ['enterprise-pulse', 'risk-map', 'portfolio', 'approvals', 'evidence'],
    tasks: [
      'MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK',
      'APPROVE_STRATEGY', 'APPROVE_BUDGET'
    ]
  }),
  BOARD_CHAIR: role({
    id: 'BOARD_CHAIR',
    nameAr: 'رئيس مجلس الإدارة',
    tier: 'BOARD',
    purposeAr: 'تنظيم أعمال المجلس، الرقابة، ومتابعة القرارات المعتمدة.',
    domains: ['board-agenda', 'governance', 'risk', 'accountability'],
    widgets: ['board-agenda', 'decision-register', 'risk-map', 'audit-evidence'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'APPROVE_STRATEGY']
  }),
  BOARD_MEMBER: role({
    id: 'BOARD_MEMBER',
    nameAr: 'عضو مجلس الإدارة',
    tier: 'BOARD',
    purposeAr: 'مراجعة الأدلة والمخاطر والتصويت البشري على القرارات الملزمة.',
    domains: ['governance', 'risk', 'audit', 'strategy'],
    widgets: ['board-papers', 'risk-map', 'evidence', 'decisions'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'APPROVE_STRATEGY']
  }),
  CEO: role({
    id: 'CEO',
    nameAr: 'المدير التنفيذي',
    tier: 'EXECUTIVE',
    purposeAr: 'تنسيق التنفيذ المؤسسي وتحويل الاستراتيجية المعتمدة إلى نتائج.',
    domains: ['execution', 'portfolio', 'performance', 'customers'],
    widgets: ['executive-scorecard', 'portfolio', 'operations', 'customers'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'SIGN_CONTRACT']
  }),
  EXECUTIVE_COMMITTEE: role({
    id: 'EXECUTIVE_COMMITTEE',
    nameAr: 'مجلس الإدارة التنفيذية',
    tier: 'EXECUTIVE',
    purposeAr: 'تنسيق القرارات التنفيذية المشتركة ورفع ما يتطلب اعتمادًا.',
    domains: ['execution', 'dependencies', 'risk', 'resources'],
    widgets: ['cross-function-plan', 'dependencies', 'risk-map', 'approvals'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'APPROVE_BUDGET']
  }),
  STRATEGY_DIRECTOR: role({
    id: 'STRATEGY_DIRECTOR',
    nameAr: 'مدير التخطيط والاستراتيجية',
    tier: 'PLANNING',
    purposeAr: 'بناء السيناريوهات وقياس التقدم واقتراح الأولويات.',
    domains: ['planning', 'objectives', 'scenarios', 'performance'],
    widgets: ['objectives', 'roadmap', 'scenarios', 'benefits'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK']
  }),
  COO: role({
    id: 'COO',
    nameAr: 'مدير العمليات',
    tier: 'EXECUTIVE',
    purposeAr: 'استمرارية التشغيل، جودة الخدمة، وإدارة الاختناقات.',
    domains: ['operations', 'service', 'quality', 'supply-chain'],
    widgets: ['runtime-health', 'operations', 'incidents', 'supply-chain'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'RECONCILE_RECORDS', 'CHANGE_PRODUCTION']
  }),
  CFO: role({
    id: 'CFO',
    nameAr: 'المدير المالي',
    tier: 'EXECUTIVE',
    purposeAr: 'الرقابة المالية والميزانية والسيولة والتقارير دون ادعاء بيانات حية.',
    domains: ['finance', 'budget', 'cash', 'audit'],
    widgets: ['budget', 'cash-position', 'variance', 'financial-approvals'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'RECONCILE_RECORDS', 'PAY_FUNDS']
  }),
  CTO: role({
    id: 'CTO',
    nameAr: 'المدير التقني',
    tier: 'EXECUTIVE',
    purposeAr: 'العمارة والمنتجات التقنية والجودة والموثوقية.',
    domains: ['architecture', 'engineering', 'delivery', 'reliability'],
    widgets: ['architecture', 'delivery', 'quality', 'technical-debt'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'CHANGE_PRODUCTION']
  }),
  CISO: role({
    id: 'CISO',
    nameAr: 'مدير أمن المعلومات',
    tier: 'EXECUTIVE',
    purposeAr: 'المخاطر الأمنية والوصول والاستجابة والتثبت من الأدلة.',
    domains: ['security', 'identity', 'incidents', 'compliance'],
    widgets: ['security-posture', 'access', 'incidents', 'evidence'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'CHANGE_PRODUCTION']
  }),
  CHRO: role({
    id: 'CHRO',
    nameAr: 'مدير الموارد البشرية',
    tier: 'EXECUTIVE',
    purposeAr: 'تصميم الوظائف والكفاءات وفتح التوظيف عند اعتماد الحاجة.',
    domains: ['workforce', 'roles', 'skills', 'employment'],
    widgets: ['workforce-mode', 'positions', 'skills', 'employment-approvals'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'HIRE_PERSON']
  }),
  DEPARTMENT_MANAGER: role({
    id: 'DEPARTMENT_MANAGER',
    nameAr: 'مدير الإدارة',
    tier: 'MANAGEMENT',
    purposeAr: 'توزيع العمل ومتابعة الخدمة والجودة ضمن صلاحيات الإدارة.',
    domains: ['team-work', 'service', 'quality', 'capacity'],
    widgets: ['work-queue', 'service-level', 'quality', 'capacity'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'PRIORITIZE_WORK', 'RECONCILE_RECORDS']
  }),
  EMPLOYEE: role({
    id: 'EMPLOYEE',
    nameAr: 'الموظف',
    tier: 'WORKFORCE',
    purposeAr: 'تنفيذ المهام المصرح بها ومتابعة الأدلة والتسليم.',
    domains: ['assigned-work', 'quality', 'knowledge', 'evidence'],
    widgets: ['my-work', 'due-dates', 'knowledge', 'evidence'],
    tasks: ['MONITOR_KPIS', 'PREPARE_REPORT', 'RECONCILE_RECORDS']
  })
});

const AUTONOMOUS_TASK_CAPABILITIES = Object.freeze([
  'READ_MEASURE',
  'ANALYZE_REPORT',
  'PLAN_RECOMMEND',
  'INTERNAL_REVERSIBLE'
]);

function role(definition) {
  return Object.freeze({
    ...definition,
    domains: Object.freeze([...definition.domains]),
    widgets: Object.freeze([...definition.widgets]),
    tasks: Object.freeze([...definition.tasks])
  });
}

function normalizeRoleId(value) {
  return String(value || 'OWNER')
    .trim()
    .replace(/[-\s]+/gu, '_')
    .toUpperCase();
}

function getRole(roleId) {
  const normalized = normalizeRoleId(roleId);
  const selected = ROLE_CATALOG[normalized];
  if (!selected) {
    const error = new Error(`UNKNOWN_ORGANIZATION_ROLE:${normalized}`);
    error.code = 'UNKNOWN_ORGANIZATION_ROLE';
    throw error;
  }
  return selected;
}

function taskForRole(roleData, taskId) {
  const normalized = String(taskId || '').trim().toUpperCase();
  if (!roleData.tasks.includes(normalized) || !TASKS[normalized]) {
    const error = new Error(`TASK_NOT_ALLOWED_FOR_ROLE:${normalized}`);
    error.code = 'TASK_NOT_ALLOWED_FOR_ROLE';
    throw error;
  }
  return TASKS[normalized];
}

function assignmentFor(roleData, assignmentMode) {
  const human = String(assignmentMode || '').toUpperCase() === 'HUMAN';
  return {
    mode: human ? 'HUMAN' : 'AUTONOMOUS_AGENT',
    occupant: human
      ? 'AUTHORIZED_HUMAN_ASSIGNEE'
      : `SHEIKHA_${roleData.id}_AGENT`,
    employmentRecordRequired: human,
    leastPrivilegeProfile: roleData.id,
    canDelegateBindingAuthorityToAI: false
  };
}

function taskView(taskId) {
  const task = TASKS[taskId];
  const autonomousEligible = AUTONOMOUS_TASK_CAPABILITIES.includes(task.capability);
  return {
    ...task,
    executionMode: autonomousEligible
      ? 'AUTONOMOUS_POLICY_GOVERNED'
      : 'HUMAN_APPROVAL_GATED',
    autonomousEligible,
    humanApprovalRequired: !autonomousEligible
  };
}

function listRoles() {
  return {
    registry: 'SHEIKHA_ORGANIZATION_ROLE_CATALOG_V1',
    status: 'ACTIVE',
    count: Object.keys(ROLE_CATALOG).length,
    roles: Object.values(ROLE_CATALOG).map((item) => ({
      id: item.id,
      nameAr: item.nameAr,
      tier: item.tier,
      purposeAr: item.purposeAr,
      domains: item.domains
    }))
  };
}

function buildOperatingModel(input = {}) {
  const requestedHumans = Math.max(0, Math.floor(Number(input.humanOperators) || 0));
  const roles = Object.values(ROLE_CATALOG);
  const humanOperators = Math.min(requestedHumans, roles.length);

  return {
    model: 'SHEIKHA_ZERO_HUMAN_OPERATIONAL_CONTINUITY_V1',
    status: 'ACTIVE_WITH_BINDING_DECISION_GATES',
    requestedHumanOperators: requestedHumans,
    activeHumanOperators: humanOperators,
    autonomousRoleAssignments: roles.length - humanOperators,
    humanEmploymentOptional: true,
    ownerAccountabilityRequired: true,
    legalAndFiduciaryAccountabilityAutomated: false,
    assignments: roles.map((item, index) => ({
      roleId: item.id,
      roleNameAr: item.nameAr,
      ...assignmentFor(item, index < humanOperators ? 'HUMAN' : 'AUTONOMOUS_AGENT')
    })),
    boundary:
      'صفر موظفين تشغيليين ممكن للقراءة والمراقبة والتحليل والتخطيط والأعمال الداخلية القابلة للعكس؛ القرارات الملزمة تبقى محكومة بصاحب صلاحية بشري.'
  };
}

function designDashboard(input = {}) {
  const selectedRole = getRole(input.roleId);
  const assignment = assignmentFor(selectedRole, input.assignmentMode);
  const tasks = selectedRole.tasks.map(taskView);

  return {
    dashboard: 'SHEIKHA_GENERATED_ROLE_DASHBOARD_V1',
    status: 'GENERATED_FROM_ROLE_CONTRACT',
    generatedAt: new Date().toISOString(),
    role: selectedRole,
    assignment,
    layout: {
      direction: 'rtl',
      density: 'EXECUTIVE_OPERATIONAL',
      sections: [
        {
          id: 'mission',
          titleAr: 'المهمة والنطاق',
          widgets: selectedRole.widgets.slice(0, 2)
        },
        {
          id: 'work',
          titleAr: 'قائمة العمل',
          widgets: selectedRole.widgets.slice(2)
        },
        {
          id: 'governance',
          titleAr: 'الموافقات والأدلة',
          widgets: ['approval-queue', 'audit-evidence']
        }
      ]
    },
    tasks,
    summary: {
      widgets: selectedRole.widgets.length + 2,
      tasks: tasks.length,
      autonomousEligibleTasks: tasks.filter((task) => task.autonomousEligible).length,
      approvalGatedTasks: tasks.filter((task) => task.humanApprovalRequired).length
    },
    governance: GOVERNANCE
  };
}

function planTask(input = {}) {
  const selectedRole = getRole(input.roleId);
  const task = taskForRole(selectedRole, input.taskId);
  const humanApproved = input.humanApproved === true;
  const autonomousEligible = AUTONOMOUS_TASK_CAPABILITIES.includes(task.capability);
  const approvalSatisfied = autonomousEligible || humanApproved;

  return {
    plan: 'SHEIKHA_GOVERNED_ROLE_TASK_PLAN_V1',
    status: approvalSatisfied ? 'ELIGIBLE_FOR_EXECUTION' : 'HUMAN_APPROVAL_REQUIRED',
    role: {
      id: selectedRole.id,
      nameAr: selectedRole.nameAr
    },
    task,
    autonomousEligible,
    humanApprovalRequired: !autonomousEligible,
    humanApprovalVerified: !autonomousEligible && humanApproved,
    executionPerformed: false,
    nextStep: approvalSatisfied
      ? 'DISPATCH_THROUGH_CAPABILITY_CONTRACT'
      : 'WAIT_FOR_AUTHORIZED_HUMAN_APPROVAL',
    flow: [
      'Schema Validation',
      'Role Capability Contract',
      'Governance Gate',
      'Human Approval when required',
      'Native Adapter',
      'Audit Evidence'
    ]
  };
}

function previewPosition(input = {}) {
  const selectedRole = getRole(input.roleId);
  const employmentMode = String(input.employmentMode || 'HUMAN_OPTIONAL').toUpperCase();

  return {
    preview: 'SHEIKHA_GOVERNED_POSITION_PREVIEW_V1',
    status: 'PREVIEW_ONLY_NOT_PUBLISHED',
    role: selectedRole,
    employmentMode,
    dashboardOnAssignment: designDashboard({
      roleId: selectedRole.id,
      assignmentMode: employmentMode === 'AUTONOMOUS_AGENT' ? 'AUTONOMOUS_AGENT' : 'HUMAN'
    }).layout,
    requiredGates: [
      'AUTHORIZED_OWNER_REQUEST',
      'ROLE_AND_BUDGET_APPROVAL',
      'FAIR_HUMAN_REVIEW',
      'EMPLOYMENT_AND_PRIVACY_COMPLIANCE',
      'LEAST_PRIVILEGE_ACCESS'
    ],
    positionPublished: false,
    personHired: false
  };
}

function status() {
  const roles = Object.values(ROLE_CATALOG);
  return {
    system: 'SHEIKHA_AUTONOMOUS_ROLE_DASHBOARD_FABRIC_V1',
    status: 'ACTIVE_GOVERNED_AUTONOMOUS_CONTINUITY',
    roleCount: roles.length,
    dashboardGeneratorActive: true,
    operatingModel: {
      defaultHumanOperatorCount: 0,
      humanEmploymentOptional: true,
      everyRoleHasAutonomousAgentProfile: true,
      everyRoleHasGeneratedDashboard: true,
      bindingDecisionAutomation: false
    },
    automation: {
      eligibleCapabilities: AUTONOMOUS_TASK_CAPABILITIES,
      eligibilityIsExecution: false,
      externalWritesDefault: 'DENY',
      highImpactDefault: 'HUMAN_APPROVAL_REQUIRED'
    },
    governance: GOVERNANCE
  };
}

module.exports = {
  AUTONOMOUS_TASK_CAPABILITIES,
  GOVERNANCE,
  ROLE_CATALOG,
  TASKS,
  buildOperatingModel,
  designDashboard,
  getRole,
  listRoles,
  normalizeRoleId,
  planTask,
  previewPosition,
  status
};
