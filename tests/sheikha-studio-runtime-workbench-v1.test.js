'use strict';

const {
  SheikhaStudioRuntimeWorkbench,
  WORKBENCHES,
  DOCK_PANELS,
  LIVE_GRAPHS,
  PROJECT_FACTORY_OUTPUTS,
  COLLABORATION_FEATURES
} = require('../runtime/sheikha-studio/workbench/sheikha-studio-runtime-workbench');

test('activates Sheikha Studio runtime workbench layer', () => {
  const workbench = new SheikhaStudioRuntimeWorkbench();
  const status = workbench.getStatus();

  expect(status.status).toBe('ACTIVE_STUDIO_RUNTIME_WORKBENCH');
  expect(status.layerRank).toBe('ABOVE_SHEIKHA_STUDIO_PLATFORM');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.workbenches).toHaveLength(WORKBENCHES.length);
  expect(status.dockPanels).toHaveLength(DOCK_PANELS.length);
  expect(status.liveGraphs).toHaveLength(LIVE_GRAPHS.length);
  expect(status.collaboration).toHaveLength(COLLABORATION_FEATURES.length);

  expect(status.integratedProjectFactory.outputs).toEqual(PROJECT_FACTORY_OUTPUTS);
  expect(status.deploymentCenter.noLiveClaimWithoutEvidence).toBe(true);

  expect(status.boundaries.allWorkbenchesGoverned).toBe(true);
  expect(status.boundaries.allGraphsEvidenceDriven).toBe(true);
  expect(status.boundaries.allCollaborationPermissionAware).toBe(true);
});

test('activates dock panel and live graph with evidence boundaries', () => {
  const workbench = new SheikhaStudioRuntimeWorkbench();

  const terminal = workbench.activateDockPanel('terminal');
  const graph = workbench.activateLiveGraph('runtime-graph');

  expect(terminal.status).toBe('DOCK_PANEL_READY');
  expect(terminal.layoutPersistence).toBe(true);

  expect(graph.status).toBe('LIVE_GRAPH_READY');
  expect(graph.evidenceDriven).toBe(true);
  expect(graph.noLiveClaimWithoutTelemetry).toBe(true);
});

test('creates integrated project factory outputs', () => {
  const workbench = new SheikhaStudioRuntimeWorkbench();
  const project = workbench.createIntegratedProject('saas');

  expect(project.status).toBe('INTEGRATED_PROJECT_FACTORY_READY');
  expect(project.outputs).toContain('contracts');
  expect(project.outputs).toContain('deployment-profile');
  expect(project.boundaries.testsRequired).toBe(true);
});

test('rejects unsupported workbench elements', () => {
  const workbench = new SheikhaStudioRuntimeWorkbench();

  expect(() => workbench.activateWorkbench('unknown-workbench'))
    .toThrow('Unsupported Sheikha Studio workbench');

  expect(() => workbench.activateDockPanel('unknown-panel'))
    .toThrow('Unsupported Sheikha dock panel');

  expect(() => workbench.activateLiveGraph('unknown-graph'))
    .toThrow('Unsupported Sheikha live graph');

  expect(() => workbench.activateCollaborationFeature('unknown-feature'))
    .toThrow('Unsupported Sheikha collaboration feature');
});
