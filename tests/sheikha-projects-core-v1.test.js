'use strict';

const {
  SheikhaProjectsCore,
  PROJECT_CORE_CAPABILITIES,
  PROJECT_TYPES,
  PROJECT_LIFECYCLE
} = require('../runtime/sheikha-core/projects/sheikha-projects-core');

test('activates Sheikha project and projects core', () => {
  const core = new SheikhaProjectsCore();
  const status = core.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_PROJECTS_CORE');
  expect(status.layerRank).toBe('ABOVE_BUSINESS_OPERATIONS_PROTECTION_CORE');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.projectCoreCapabilities).toEqual(PROJECT_CORE_CAPABILITIES);
  expect(status.projectTypes).toEqual(PROJECT_TYPES);
  expect(status.projectLifecycle).toEqual(PROJECT_LIFECYCLE);

  expect(status.sampleGeneralProject.status).toBe('PROJECT_DESIGNED');
  expect(status.sampleUserProject.personalized).toBe(true);
  expect(status.boundaries.userSpecificProjectDesignEnabled).toBe(true);
});

test('designs general project with lifecycle governance and measurement', () => {
  const core = new SheikhaProjectsCore();

  const project = core.designProject({
    id: 'p-general',
    name: 'General Project',
    projectType: 'general-project',
    goals: ['govern', 'execute']
  });

  expect(project.status).toBe('PROJECT_DESIGNED');
  expect(project.projectType).toBe('general-project');
  expect(project.capabilities).toEqual(PROJECT_CORE_CAPABILITIES);
  expect(project.lifecycle).toEqual(PROJECT_LIFECYCLE);
  expect(project.boundaries.measurementRequired).toBe(true);
});

test('designs user-specific project', () => {
  const core = new SheikhaProjectsCore();

  const project = core.designUserProject({
    id: 'p-user',
    name: 'User Project',
    owner: 'salman',
    goals: ['personalized-development']
  });

  expect(project.status).toBe('PROJECT_DESIGNED');
  expect(project.projectType).toBe('personal-project');
  expect(project.owner).toBe('salman');
  expect(project.personalized).toBe(true);
});

test('creates governed projects portfolio', () => {
  const core = new SheikhaProjectsCore();

  const portfolio = core.createProjectPortfolio([
    {
      id: 'p1',
      name: 'Project One',
      projectType: 'software-project'
    },
    {
      id: 'p2',
      name: 'Project Two',
      projectType: 'operations-project'
    }
  ]);

  expect(portfolio.status).toBe('PROJECTS_PORTFOLIO_READY');
  expect(portfolio.count).toBe(2);
  expect(portfolio.boundaries.allProjectsGoverned).toBe(true);
  expect(portfolio.boundaries.noUngovernedPortfolio).toBe(true);
});

test('rejects invalid project definitions', () => {
  const core = new SheikhaProjectsCore();

  expect(() => core.designProject({ id: 'x' }))
    .toThrow('Sheikha project core requires id and name');

  expect(() => core.designProject({
    id: 'x',
    name: 'Invalid',
    projectType: 'bad-project'
  })).toThrow('Unsupported Sheikha project type');
});
