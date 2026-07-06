'use strict';

const {
  SheikhaWorkspaceManager,
  WORKSPACE_COMPONENTS,
  PROJECT_TYPES
} = require('../runtime/sheikha-ide/sheikha-workspace-manager');

test('activates Sheikha workspace manager above editor integration', () => {
  const manager = new SheikhaWorkspaceManager();
  const status = manager.getStatus();

  expect(status.status).toBe('ACTIVE_WORKSPACE_MANAGER');
  expect(status.layerRank).toBe('ABOVE_EDITOR_INTEGRATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.components).toEqual(WORKSPACE_COMPONENTS);
  expect(status.projectTypes).toEqual(PROJECT_TYPES);

  expect(status.sampleProject.status).toBe('PROJECT_CREATED');
  expect(status.sampleProject.bindings.registry).toBe(true);
  expect(status.sampleProject.bindings.languageStack).toBe(true);

  expect(status.sampleSolution.status).toBe('SOLUTION_CREATED');
  expect(status.sampleSolution.boundaries.allProjectsGoverned).toBe(true);

  expect(status.packageManager.status).toBe('PACKAGE_CONTEXT_READY');
  expect(status.environmentManager.noSecretMutation).toBe(true);
  expect(status.boundaries.inspectorRequired).toBe(true);
});

test('creates governed Sheikha project and solution', () => {
  const manager = new SheikhaWorkspaceManager();

  const project = manager.createProject({
    name: 'plugin-alpha',
    type: 'plugin-project'
  });

  expect(project.status).toBe('PROJECT_CREATED');
  expect(project.type).toBe('plugin-project');
  expect(project.structure).toContain('sheikha.project.json');
  expect(project.bindings.masterLog).toBe(true);

  const solution = manager.createSolution({
    name: 'solution-alpha',
    projects: [project]
  });

  expect(solution.status).toBe('SOLUTION_CREATED');
  expect(solution.projectCount).toBe(1);
  expect(solution.boundaries.allProjectsAudited).toBe(true);
});

test('rejects invalid project and solution definitions', () => {
  const manager = new SheikhaWorkspaceManager();

  expect(() => manager.createProject({ name: 'bad', type: 'unknown' }))
    .toThrow('Unsupported Sheikha project type');

  expect(() => manager.createProject({ name: 'missing' }))
    .toThrow('Sheikha project requires name and type');

  expect(() => manager.createSolution({ name: 'empty', projects: [] }))
    .toThrow('Sheikha solution requires name and projects');
});
