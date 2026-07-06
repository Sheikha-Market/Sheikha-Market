'use strict';

const {
  SheikhaFullIDEOperatingLayer,
  IDE_MODULES,
  IDE_OPERATIONS,
  VISUAL_DESIGNERS
} = require('../runtime/sheikha-ide/full/sheikha-full-ide-operating-layer');

test('activates full Sheikha IDE operating layer', () => {
  const ide = new SheikhaFullIDEOperatingLayer();
  const status = ide.getStatus();

  expect(status.status).toBe('ACTIVE_FULL_IDE_OPERATING_LAYER');
  expect(status.layerRank).toBe('ABOVE_WORKSPACE_MANAGER_AND_EDITOR_INTEGRATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.modules).toHaveLength(IDE_MODULES.length);
  expect(status.operations).toHaveLength(IDE_OPERATIONS.length);
  expect(status.visualDesigners).toHaveLength(VISUAL_DESIGNERS.length);

  expect(status.capabilities.lsp).toBe(true);
  expect(status.capabilities.debugger).toBe(true);
  expect(status.capabilities.buildTestRun).toBe(true);
  expect(status.capabilities.pluginMarketplace).toBe(true);

  expect(status.boundaries.allModulesGoverned).toBe(true);
  expect(status.boundaries.allOperationsAudited).toBe(true);
  expect(status.boundaries.allDesignersNoLivingBeingImages).toBe(true);
});

test('executes governed IDE operations', () => {
  const ide = new SheikhaFullIDEOperatingLayer();

  const build = ide.executeOperation('build', {
    project: 'sheikha-marketplace'
  });

  expect(build.status).toBe('IDE_OPERATION_READY');
  expect(build.lifecycle).toContain('write-master-log');
  expect(build.boundaries.noUngovernedExecution).toBe(true);
});

test('activates visual designer without living-being images', () => {
  const ide = new SheikhaFullIDEOperatingLayer();

  const designer = ide.activateVisualDesigner('market-designer');

  expect(designer.status).toBe('VISUAL_DESIGNER_READY');
  expect(designer.noLivingBeingImages).toBe(true);
  expect(designer.arabicFirst).toBe(true);
  expect(designer.outputs).toContain('component-blueprint');
});

test('rejects unsupported IDE module operation and designer', () => {
  const ide = new SheikhaFullIDEOperatingLayer();

  expect(() => ide.activateModule('unknown-module'))
    .toThrow('Unsupported Sheikha IDE module');

  expect(() => ide.executeOperation('unknown-operation'))
    .toThrow('Unsupported Sheikha IDE operation');

  expect(() => ide.activateVisualDesigner('unknown-designer'))
    .toThrow('Unsupported Sheikha visual designer');
});
