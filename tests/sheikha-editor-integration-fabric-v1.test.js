'use strict';

const {
  SheikhaEditorIntegrationFabric,
  EDITOR_TARGETS,
  LSP_CAPABILITIES,
  DEBUGGER_CAPABILITIES
} = require('../runtime/sheikha-editor/sheikha-editor-integration-fabric');

test('activates Sheikha editor with LSP debugger and editor integrations', () => {
  const fabric = new SheikhaEditorIntegrationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_EDITOR_INTEGRATION');
  expect(status.layerRank).toBe('ABOVE_LANGUAGE_SPECIFICATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.editorTargets).toEqual(EDITOR_TARGETS);
  expect(status.lspCapabilities).toEqual(LSP_CAPABILITIES);
  expect(status.debuggerCapabilities).toEqual(DEBUGGER_CAPABILITIES);

  expect(status.primaryEditor.target).toBe('sheikha-editor');
  expect(status.primaryEditor.ui.editorName).toBe('Sheikha Editor');
  expect(status.primaryEditor.ui.arabicFirst).toBe(true);
  expect(status.primaryEditor.ui.rtlReady).toBe(true);

  expect(status.editors.find((x) => x.target === 'vscode').lsp.status).toBe('ACTIVE');
  expect(status.editors.find((x) => x.target === 'vscode').debugger.status).toBe('ACTIVE');

  expect(status.boundaries.allEditorsGoverned).toBe(true);
  expect(status.boundaries.lspRequired).toBe(true);
  expect(status.boundaries.debuggerRequired).toBe(true);
});

test('rejects unsupported editor target', () => {
  const fabric = new SheikhaEditorIntegrationFabric();

  expect(() => fabric.activateEditor('unknown-editor'))
    .toThrow('Unsupported Sheikha editor target');
});
