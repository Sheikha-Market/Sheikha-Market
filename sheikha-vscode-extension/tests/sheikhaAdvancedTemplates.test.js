'use strict';

const {
  APEX_LAYERS,
  CHAT_MODES,
  CHAT_TOOL_COMMAND_IDS,
  CHAT_TOOL_GROUPS,
  CHAT_TOOLS,
  DIALOGUE_AUDIENCES,
  QUICK_ACTIONS,
  renderSheikhaChatTemplate
} = require('../src/ui/sheikhaChatTemplate');
const {
  renderInspectorTemplate
} = require('../src/ui/sheikhaInspectorTemplate');

describe('Sheikha advanced VS Code templates', () => {
  test('renders a conversation-first governed chat without placeholder regions', () => {
    const html = renderSheikhaChatTemplate({ nonce: 'safe-nonce', version: '1.0.102' });

    expect(html).toContain('شات شيخة');
    expect(html).toContain('Extension 1.0.102');
    expect(html).toContain('لوحة المالك');
    expect(html).toContain('id="composerForm"');
    expect(html).toContain('type="button"');
    expect(html).toContain("command: 'ready'");
    expect(html).toContain("msg.command === 'readyAck'");
    expect(html).toContain('function announceReady()');
    expect(html).toContain('setInterval(announceReady, 500)');
    expect(html).toContain('clearInterval(readyTimer)');
    expect(html).toContain("composerForm.addEventListener('submit', ask)");
    expect(html).toContain("send.addEventListener('click', ask)");
    expect(html).toContain('send.disabled = busy;');
    expect(html).not.toContain('send.disabled = busy || !bridgeReady;');
    expect(html).toContain('armRequestTimeout();');
    expect(html).toContain('const REQUEST_IDLE_TIMEOUT_MS = 100000;');
    expect(html).toContain("msg.command === 'progress'");
    expect(html).toContain('id="mode"');
    expect(html).toContain('id="audience"');
    expect(html).toContain('حوار فكري محكوم');
    expect(html).toContain('class="conversation"');
    expect(html).toContain('class="composer"');
    expect(html).toContain('id="toolbox"');
    expect(html).toContain('id="toolSearch"');
    expect(html).toContain('39 أداة محكومة');
    expect(html).toContain('data-tool-command="sheikha.showStatus"');
    expect(html).toContain('data-tool-command="sheikha.runtime.restart"');
    expect(html).toContain("command: 'tool'");
    expect(html).toContain("msg.command === 'toolAvailability'");
    expect(html).toContain("msg.command === 'toolResult'");
    expect(html).toContain("script-src 'nonce-safe-nonce'");
    expect(html).toContain('replaceChildren');
    expect(html).not.toContain('context_rail');
    expect(html).not.toContain('governed_mode_dock');
    expect(html).not.toContain('.innerHTML');
    expect(APEX_LAYERS).toHaveLength(8);
    expect(CHAT_MODES.length).toBeGreaterThanOrEqual(10);
    expect(DIALOGUE_AUDIENCES).toHaveLength(6);
    expect(QUICK_ACTIONS).toHaveLength(6);
    expect(CHAT_TOOL_GROUPS).toHaveLength(6);
    expect(CHAT_TOOLS).toHaveLength(39);
    expect(new Set(CHAT_TOOL_COMMAND_IDS).size).toBe(39);
  });

  test('emits syntactically valid webview scripts', () => {
    const html = renderSheikhaChatTemplate({
      nonce: 'syntax-nonce',
      version: '1.0.102'
    });
    const scripts = [...html.matchAll(
      /<script[^>]*>([\s\S]*?)<\/script>/g
    )].map((match) => match[1]);

    expect(scripts).toHaveLength(1);
    for (const script of scripts) {
      expect(() => new Function(script)).not.toThrow();
    }
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
    expect(html).toContain('data-tab="organization"');
    expect(html).toContain('data-tab="workspace"');
    expect(html).toContain('data-tab="governance"');
    expect(html).toContain('data-tab="interfaces"');
    expect(html).toContain('id="routeFilter"');
    expect(html).toContain('القرار النهائي للإنسان');
    expect(html).toContain('سلطة القرار الملزم للآلة');
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
