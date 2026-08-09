'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const request = require('supertest');
const fabric = require(
  '../core/organization/sheikha-autonomous-role-dashboard-fabric-v1'
);
const routes = require(
  '../routes/organization/sheikha-autonomous-role-dashboard-routes-v1'
);
const ROOT = path.resolve(__dirname, '..');

describe('Sheikha Autonomous Role Dashboard Fabric V1', () => {
  test('registers ownership, board, executive, management, and employee roles', () => {
    const registry = fabric.listRoles();
    const ids = registry.roles.map((role) => role.id);

    expect(registry.status).toBe('ACTIVE');
    expect(ids).toContain('OWNER');
    expect(ids).toContain('BOARD_CHAIR');
    expect(ids).toContain('CEO');
    expect(ids).toContain('DEPARTMENT_MANAGER');
    expect(ids).toContain('EMPLOYEE');
  });

  test('defaults to zero human operators without automating binding authority', () => {
    const model = fabric.buildOperatingModel({ humanOperators: 0 });

    expect(model.activeHumanOperators).toBe(0);
    expect(model.autonomousRoleAssignments).toBe(fabric.listRoles().count);
    expect(model.legalAndFiduciaryAccountabilityAutomated).toBe(false);
    expect(model.assignments.every(
      (assignment) => assignment.mode === 'AUTONOMOUS_AGENT'
    )).toBe(true);
  });

  test('generates different least-privilege dashboards from each role contract', () => {
    const owner = fabric.designDashboard({ roleId: 'owner' });
    const employee = fabric.designDashboard({
      roleId: 'employee',
      assignmentMode: 'human'
    });

    expect(owner.role.id).toBe('OWNER');
    expect(employee.role.id).toBe('EMPLOYEE');
    expect(owner.role.widgets).not.toEqual(employee.role.widgets);
    expect(employee.assignment.mode).toBe('HUMAN');
    expect(employee.assignment.canDelegateBindingAuthorityToAI).toBe(false);
  });

  test('allows planning for low-impact work and gates binding decisions', () => {
    const monitor = fabric.planTask({
      roleId: 'OWNER',
      taskId: 'MONITOR_KPIS'
    });
    const budget = fabric.planTask({
      roleId: 'OWNER',
      taskId: 'APPROVE_BUDGET'
    });

    expect(monitor.status).toBe('ELIGIBLE_FOR_EXECUTION');
    expect(monitor.executionPerformed).toBe(false);
    expect(budget.status).toBe('HUMAN_APPROVAL_REQUIRED');
    expect(budget.humanApprovalRequired).toBe(true);
  });

  test('does not publish or hire when previewing a human position', () => {
    const preview = fabric.previewPosition({
      roleId: 'CFO',
      employmentMode: 'HUMAN'
    });

    expect(preview.status).toBe('PREVIEW_ONLY_NOT_PUBLISHED');
    expect(preview.positionPublished).toBe(false);
    expect(preview.personHired).toBe(false);
  });

  test('serves status, generated dashboards, and governed task plans', async () => {
    const app = express();
    app.use('/api/sheikha/organization-control/v1', routes);

    const status = await request(app)
      .get('/api/sheikha/organization-control/v1/status');
    const dashboard = await request(app)
      .get('/api/sheikha/organization-control/v1/dashboards/cto');
    const task = await request(app)
      .post('/api/sheikha/organization-control/v1/tasks/plan')
      .send({ roleId: 'CTO', taskId: 'CHANGE_PRODUCTION' });

    expect(status.status).toBe(200);
    expect(status.body.data.operatingModel.defaultHumanOperatorCount).toBe(0);
    expect(dashboard.body.data.role.id).toBe('CTO');
    expect(task.status).toBe(202);
    expect(task.body.data.status).toBe('HUMAN_APPROVAL_REQUIRED');
  });

  test('integrates the owner center with the public dashboard and VS Code surfaces', () => {
    const read = (relativePath) => fs.readFileSync(
      path.join(ROOT, relativePath),
      'utf8'
    );
    const server = read('server.js');
    const dashboard = read('public/sheikha-dashboards/dashboards.js');
    const inspector = read(
      'sheikha-vscode-extension/src/ui/sheikhaInspectorTemplate.js'
    );
    const chatProvider = read(
      'sheikha-vscode-extension/src/chat/sheikhaChatProvider.js'
    );

    expect(server).toContain(
      "'/api/sheikha/organization-control/v1'"
    );
    expect(dashboard).toContain('ORGANIZATION_API');
    expect(dashboard).toContain('humanOperators=0');
    expect(inspector).toContain('data-tab="organization"');
    expect(chatProvider).toContain('getOrganizationControlStatus');
    expect(chatProvider.indexOf('onDidReceiveMessage'))
      .toBeLessThan(chatProvider.indexOf('webviewView.webview.html = this.getHtml()'));
  });
});
