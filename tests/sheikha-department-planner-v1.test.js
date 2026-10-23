'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { planOrganization, listDepartmentTemplates } = require('../core/organization/department-planner-v1');
const { buildOperatingKit } = require('../core/partnerships/operating-kit-v1');
const { run } = require('../tools/partnerships/build-operating-kit-v1');
const asOf = '2026-09-14T00:00:00.000Z';
const portfolio = { schemaVersion: '1.0.0', dataMode: 'SYNTHETIC', relationships: [] };
function organization() {
  return { id: 'org-a', tenantId: 'tenant-a', displayName: 'Synthetic organization', type: 'INTERNAL', relationshipId: null,
    vision: 'Useful work', mission: 'Measured service', values: ['Evidence'], accountableHumanId: 'owner',
    goals: [{ id: 'goal-a', title: 'Reliable service', ownerId: 'owner', dueAt: '2026-12-01T00:00:00.000Z' }],
    departments: [{ id: 'quality', templateId: 'quality', parentId: null, mandate: 'Monitor acceptance', ownerId: 'owner', reviewerId: 'reviewer', goalIds: ['goal-a'],
      capacityHours: 4, budgetMinor: 10000, currency: 'SAR', interfaces: [], kpis: [{ id: 'acceptance', label: 'Accepted work', unit: '%', target: 90 }],
      tasks: [{ id: 'report', title: 'Prepare brief', goalId: 'goal-a', ownerId: 'owner', dueAt: '2026-09-13T00:00:00.000Z', remainingHours: 6, impact: 'LOW', action: 'PREPARE_REPORT', status: 'TODO', dependsOn: [] }] }]
  };
}
const plan = org => planOrganization(org, portfolio, asOf);
const input = org => ({ schemaVersion: '1.0.0', asOf, portfolio, methodologies: [], assets: [], licenseRequests: [], signingRequests: [], organizations: [org] });

describe('need-based departmental managers', () => {
  test('offers thirty mutable copies of templates, not claimed deployments', () => {
    const catalog = listDepartmentTemplates();
    expect(catalog).toHaveLength(30);
    expect(catalog.map(item => item.id)).toEqual(expect.arrayContaining(['factory', 'cities', 'regional', 'safety', 'ai', 'partnerships', 'human-resources']));
    catalog[0].nameAr = 'changed'; expect(listDepartmentTemplates()[0].nameAr).not.toBe('changed');
  });
  test('computes overload, overdue work and escalation without executing', () => {
    const org = organization(), before = JSON.stringify(org), result = plan(org);
    expect(plan(org)).toEqual(result); expect(JSON.stringify(org)).toBe(before);
    expect(result.executive).toMatchObject({ departmentCount: 1, overloadedDepartmentIds: ['quality'], completedTasksVerified: 0 });
    expect(result.executive.escalationQueue[0]).toMatchObject({ taskId: 'report', reason: 'OVERDUE_REVIEW', sent: false });
    expect(result.departments[0].tasks[0]).toMatchObject({ status: 'LOCAL_PLANNING_CANDIDATE', overdue: true, taskExecuted: false });
    expect(result.departments[0].manager).toMatchObject({ localBriefGenerated: true, llmInvoked: false, persistentWorkerStarted: false });
    expect(result.boundaries).toMatchObject({ paymentsExecuted: 0, physicalCommandsExecuted: 0, publicAuthorityClaimed: false });
  });
  test('does not coerce unknown capacity, costs or measured performance to zero', () => {
    const org = organization(); org.departments[0].capacityHours = null; org.departments[0].budgetMinor = null;
    const dept = plan(org).departments[0];
    expect(dept.capacity.overloaded).toBeNull(); expect(dept.budget.actualSpentMinor).toBeNull(); expect(dept.metrics[0].actual).toBeNull();
  });
  test.each(['SIGN_CONTRACT', 'PAY_FUNDS', 'HIRE_PERSON', 'PHYSICAL_CONTROL', 'PUBLIC_POLICY', 'CHANGE_PRODUCTION'])('cannot authorize %s by approval boolean or low risk label', action => {
    const org = organization(), task = org.departments[0].tasks[0]; task.action = action; task.humanApproved = true;
    expect(plan(org).departments[0].tasks[0]).toMatchObject({ status: 'AUTHORITY_AND_SPECIALIST_REVIEW_REQUIRED', executionAllowed: false, approvalVerified: false });
  });
  test('critical review is first, and high-risk reading still needs review', () => {
    const org = organization(), tasks = org.departments[0].tasks;
    tasks.push({ ...tasks[0], id: 'hazard', impact: 'CRITICAL', dueAt: '2026-10-01T00:00:00.000Z' });
    expect(plan(org).departments[0].tasks[0]).toMatchObject({ id: 'hazard', requiresAuthority: true });
  });
  test('declared done and dependency chains require acceptance evidence', () => {
    const org = organization(), tasks = org.departments[0].tasks;
    tasks[0].status = 'DONE_DECLARED'; tasks[0].remainingHours = 0;
    tasks.push({ ...tasks[0], id: 'next', status: 'TODO', remainingHours: 1, dependsOn: ['report'] });
    const dept = plan(org).departments[0];
    expect(dept.tasks.find(t => t.id === 'report')).toMatchObject({ status: 'COMPLETION_EVIDENCE_REVIEW_REQUIRED', overdue: null });
    expect(dept.tasks.find(t => t.id === 'next').status).toBe('DEPENDENCY_ACCEPTANCE_REVIEW_REQUIRED');
    expect(dept.capacity.completionEffortReviewRequired).toBe(true);
  });
  test('supports subdepartments and interfaces while flagging shared owners', () => {
    const org = organization(), first = org.departments[0];
    org.departments.push({ ...first, id: 'audit', parentId: 'quality', tasks: [], interfaces: [{ departmentId: 'quality', purpose: 'Acceptance review' }] });
    expect(plan(org).executive.sharedOwnersRequireCapacityReview).toEqual(['owner']);
    expect(plan(org).departments[1].parentId).toBe('quality');
  });
  test.each(['hierarchy', 'tasks', 'unknown-parent', 'unknown-dependency', 'self-review', 'invalid-budget', 'unassigned-goal'])('rejects %s', change => {
    const org = organization(), d = org.departments[0];
    if (change === 'hierarchy') { d.parentId = 'audit'; org.departments.push({ ...d, id: 'audit', parentId: 'quality', tasks: [] }); }
    if (change === 'tasks') d.tasks[0].dependsOn = ['report'];
    if (change === 'unknown-parent') d.parentId = 'missing';
    if (change === 'unknown-dependency') d.tasks[0].dependsOn = ['missing'];
    if (change === 'self-review') d.reviewerId = d.ownerId;
    if (change === 'invalid-budget') d.budgetMinor = '500';
    if (change === 'unassigned-goal') org.goals.push({ ...org.goals[0], id: 'orphan' });
    expect(() => plan(org)).toThrow();
  });
  test.each(['CUSTOMER', 'PARTNER'])('requires exact relationship and tenant for %s', type => {
    const org = organization(); org.type = type; org.relationshipId = 'rel';
    const linked = { ...portfolio, relationships: [{ id: 'rel', tenantId: org.tenantId, type: type === 'CUSTOMER' ? 'customer' : 'partner', stage: 'DRAFT' }] };
    expect(planOrganization(org, linked, asOf).relationshipId).toBe('rel');
    org.tenantId = 'other'; expect(() => planOrganization(org, linked, asOf)).toThrow('ORGANIZATION_RELATIONSHIP_SCOPE_DENIED');
    org.tenantId = 'tenant-a'; linked.relationships[0].stage = 'CLOSED';
    expect(() => planOrganization(org, linked, asOf)).toThrow('ORGANIZATION_RELATIONSHIP_SCOPE_DENIED');
  });
  test('integrates through the existing operating kit and validates organizations', () => {
    expect(buildOperatingKit(input(organization())).organizations[0].departments).toHaveLength(1);
    const f = input(organization()); f.organizations.push(organization());
    expect(() => buildOperatingKit(f)).toThrow('INVALID_ORGANIZATIONS');
  });
  test('private CLI separates department and organization outputs without filename collisions', () => {
    const dir = fs.mkdtempSync(path.resolve(__dirname, '../reports/private/department-test-'));
    fs.chmodSync(dir, 0o700);
    try {
      const f = input(organization()); f.organizations[0].id = 'a-b'; f.organizations[0].departments[0].id = 'c';
      const other = organization(); other.id = 'a'; other.tenantId = 'tenant-b'; other.departments[0].id = 'b-c';
      f.organizations.push(other);
      const file = path.join(dir, 'input.json'), out = path.join(dir, 'out');
      fs.writeFileSync(file, JSON.stringify(f), { mode: 0o600 });
      expect(run(['--input', file, '--out', out])).toMatchObject({ organizations: 2, departments: 2 });
      const first = path.join(out, 'organization-a-b/department-c.json');
      const second = path.join(out, 'organization-a/department-b-c.json');
      expect(fs.statSync(first).mode & 0o777).toBe(0o600); expect(fs.existsSync(second)).toBe(true);
      expect(fs.readFileSync(first, 'utf8')).not.toContain('tenant-b');
      expect(fs.statSync(path.dirname(first)).mode & 0o777).toBe(0o700);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
});
