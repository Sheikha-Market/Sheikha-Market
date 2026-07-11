'use strict';

const {
  APEX_LAYERS,
  CHAT_MODES,
  QUICK_ACTIONS,
  renderSheikhaChatTemplate
} = require('../src/ui/sheikhaChatTemplate');
const {
  renderInspectorTemplate
} = require('../src/ui/sheikhaInspectorTemplate');

describe('Sheikha advanced VS Code templates', () => {
  test('renders a conversation-first governed chat without placeholder regions', () => {
    const html = renderSheikhaChatTemplate({ nonce: 'safe-nonce', version: '1.0.91' });

    expect(html).toContain('شات شيخة');
    expect(html).toContain('Extension 1.0.91');
    expect(html).toContain('id="mode"');
    expect(html).toContain('class="conversation"');
    expect(html).toContain('class="composer"');
    expect(html).toContain("script-src 'nonce-safe-nonce'");
    expect(html).toContain('replaceChildren');
    expect(html).not.toContain('context_rail');
    expect(html).not.toContain('governed_mode_dock');
    expect(html).not.toContain('.innerHTML');
    expect(APEX_LAYERS).toHaveLength(8);
    expect(CHAT_MODES.length).toBeGreaterThanOrEqual(10);
    expect(QUICK_ACTIONS).toHaveLength(4);
  });

  test('renders an inspector with compact summary tabs and searchable interfaces', () => {
    const html = renderInspectorTemplate({
      nonce: 'inspector-nonce',
      local: {
        workspaceRoot: '/workspace/sheikha',
        gitBranch: 'main',
        activeFile: 'server.js',
        languageId: 'javascript',
        gitStatus: '',
        openEditors: [{ file: 'server.js', languageId: 'javascript' }],
        registry: 'LOCAL'
      },
      localRuntime: { cpuLoad1m: 1, ramUsedPercent: 30 },
      localDiagnostics: { errors: 0, warnings: 0, information: 0, total: 0 },
      remote: {
        success: true,
        status: 'ACTIVE',
        inspector: 'SHEIKHA_ENTERPRISE_INSPECTOR_V3',
        health: { overall: 'HEALTHY', runtime: 'ACTIVE', governance: 'ACTIVE' },
        runtime: { cpuLoad1m: 1, ramUsedPercent: 30, heapUsedMb: 40, heapTotalMb: 80 },
        architecture: { flow: ['Governance Review', 'Verification'] },
        governance: { contextPolicy: 'MINIMUM_NECESSARY_NO_SECRETS' },
        surfaces: { health: '/api/health' }
      }
    });

    expect(html).toContain('data-tab="overview"');
    expect(html).toContain('data-tab="workspace"');
    expect(html).toContain('data-tab="governance"');
    expect(html).toContain('data-tab="interfaces"');
    expect(html).toContain('id="routeFilter"');
    expect(html).toContain('القرار النهائي للإنسان');
    expect(html).toContain("script-src 'nonce-inspector-nonce'");
    expect(html).not.toContain('50</b><span>Open Editors');
  });

  test('escapes inspector evidence before embedding it in the webview', () => {
    const html = renderInspectorTemplate({
      nonce: 'safe',
      local: { diagnostics: [] },
      localRuntime: { cpuLoad1m: 0, ramUsedPercent: 0 },
      localDiagnostics: { errors: 0, warnings: 0, total: 0 },
      remote: { success: false, error: '</script><script>unsafe()</script>' }
    });

    expect(html).not.toContain('</script><script>unsafe()');
    expect(html).toContain('&lt;/script&gt;&lt;script&gt;unsafe()');
  });
});
