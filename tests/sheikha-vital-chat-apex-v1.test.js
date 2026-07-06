'use strict';

const fs = require('fs');
const path = require('path');
const vitalChatApex = require('../runtime/vital-chat-apex/v1/sheikha-vital-chat-apex-v1');

const root = path.join(__dirname, '..');

describe('Sheikha Vital Chat Apex V1', () => {
  test('activates the highest governed interactive chat layer', () => {
    const result = vitalChatApex.status();

    expect(result.system).toBe('SHEIKHA_VITAL_CHAT_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('VITAL_CHAT_APEX_V1_ACTIVE_100');
    expect(result.stack.conversationEngine).toBe('SHEIKHA_CONVERSATION_ENGINE_V1');
    expect(result.stack.sessionMemory).toBe('ACTIVE_IN_EXTENSION_HISTORY');
    expect(result.stack.contextMemory).toBe('ACTIVE_VIA_CONVERSATION_LAYER_STACK');
    expect(result.stack.workspaceAwareness).toBe('ACTIVE_VIA_VSCODE_WORKSPACE_CONTEXT');
    expect(result.stack.gitAwareness).toBe('ACTIVE_VIA_READ_ONLY_GIT_CONTEXT');
    expect(result.stack.projectAwareness).toBe('ACTIVE_VIA_PACKAGE_AND_WORKSPACE_METADATA');
    expect(result.boundaries.noConsciousnessClaim).toBe(true);
    expect(result.boundaries.noHumanSensesClaim).toBe(true);
  });

  test('binds route, SDK, activation tool, and VS Code chat surface', () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const sdk = fs.readFileSync(path.join(root, 'sdk/sheikha-api/index.js'), 'utf8');
    const provider = fs.readFileSync(
      path.join(root, 'sheikha-vscode-extension/src/chat/sheikhaChatProvider.js'),
      'utf8'
    );
    const client = fs.readFileSync(
      path.join(root, 'sheikha-vscode-extension/src/sheikhaExtensionChatClient.js'),
      'utf8'
    );
    const packageJson = require('../package.json');

    expect(server).toContain("require('./routes/vital-chat-apex/sheikha-vital-chat-apex-routes')");
    expect(sdk).toContain('/api/sheikha/vital-chat-apex/v1/status');
    expect(client).toContain('getVitalChatApexStatus');
    expect(provider).toContain('vitalStatus');
    expect(provider).toContain('Conversation Engine');
    expect(packageJson.scripts['ops:vital-chat-apex:v1']).toBe(
      'node tools/vital-chat-apex/sheikha-vital-chat-apex-v1.js'
    );
  });
});
