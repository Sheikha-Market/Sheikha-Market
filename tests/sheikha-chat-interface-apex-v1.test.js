'use strict';

const fs = require('fs');
const path = require('path');
const chatInterfaceApex = require('../runtime/chat-interface-apex/v1/sheikha-chat-interface-apex-v1');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Chat Interface Apex V1', () => {
  test('activates the highest governed chat and interface template layer', () => {
    const result = chatInterfaceApex.status();

    expect(result.system).toBe('SHEIKHA_CHAT_INTERFACE_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('CHAT_INTERFACE_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.position).toContain('ABOVE_VITAL_CHAT_APEX');
    expect(result.stack.vitalChatApex).toBe('SHEIKHA_VITAL_CHAT_APEX_V1');
    expect(result.stack.debuggingApex).toBe('SHEIKHA_DEBUGGING_APEX_V1');
    expect(result.surfaces.status).toBe('/api/sheikha/chat-interface-apex/v1/status');
  });

  test('defines an advanced stable interactive template contract', () => {
    const result = chatInterfaceApex.status();

    expect(result.template.shell).toBe('ADVANCED_RTL_ENTERPRISE_CHAT_SHELL');
    expect(result.template.regions).toEqual(expect.arrayContaining([
      'apex_header',
      'governed_mode_dock',
      'context_rail',
      'conversation_stream',
      'evidence_trace_panel',
      'composer_command_bar'
    ]));
    expect(result.template.controls).toEqual(expect.arrayContaining([
      'send',
      'clear',
      'system_status',
      'debugging_apex',
      'diagnostics',
      'project_review'
    ]));
    expect(result.interfaceGovernance.noConsciousnessClaim).toBe(true);
    expect(result.interfaceGovernance.stableNoLayoutShiftControls).toBe(true);
  });

  test('is wired through server, SDK, extension client, and provider template', () => {
    const server = read('server.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const client = read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js');
    const provider = read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js');
    const inspector = read('core/enterprise/sheikha-enterprise-inspector-v3.js');

    expect(server).toContain(
      "app.use(require('./routes/chat-interface-apex/sheikha-chat-interface-apex-routes'));"
    );
    expect(sdk).toContain('/api/sheikha/chat-interface-apex/v1/status');
    expect(sdk).toContain('chatInterfaceApex');
    expect(client).toContain('CHAT_INTERFACE_APEX_STATUS_ENDPOINT');
    expect(client).toContain('getChatInterfaceApexStatus');
    expect(provider).toContain('شات شيخة المتدفق المتقدم');
    expect(provider).toContain('Streaming Multilingual Chat Apex');
    expect(provider).toContain('Technical Capability Apex');
    expect(provider).toContain('Chat Interface Apex');
    expect(provider).toContain("command: 'interfaceStatus'");
    expect(provider).toContain('contextRail');
    expect(inspector).toContain('chatInterfaceApexStatus');
  });
});
