'use strict';

const fs = require('fs');
const path = require('path');
const experience = require(
  '../runtime/extension-experience-apex/v1/sheikha-vscode-extension-experience-apex-v1'
);

const root = path.join(__dirname, '..');

describe('Sheikha VS Code Extension Experience Apex V1', () => {
  test('is governed by layer governance L18 without claiming authority above it', () => {
    const result = experience.status();
    expect(result.system).toBe('SHEIKHA_VSCODE_EXTENSION_EXPERIENCE_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governedByApexLevel).toBe(18);
    expect(result.position).toContain('UNDER_SHEIKHA_LAYER_GOVERNANCE');
    expect(result.boundaries.noConsciousnessClaim).toBe(true);
    expect(result.boundaries.inspectorPrintedOnlyWhenExplicitlyRequested).toBe(true);
  });

  test('binds server, conversation, inspector, management, and extension surfaces', () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const provider = fs.readFileSync(
      path.join(root, 'sheikha-vscode-extension/src/chat/sheikhaChatProvider.js'), 'utf8'
    );
    const client = fs.readFileSync(
      path.join(root, 'sheikha-vscode-extension/src/sheikhaExtensionChatClient.js'), 'utf8'
    );
    const sdk = fs.readFileSync(path.join(root, 'sdk/sheikha-api/index.js'), 'utf8');
    const inspector = fs.readFileSync(
      path.join(root, 'core/enterprise/sheikha-enterprise-inspector-v3.js'), 'utf8'
    );

    expect(server).toContain("require('./routes/sheikha-vscode-extension-experience-apex-routes')");
    expect(server).toContain("require('./routes/vital-chat-apex/sheikha-vital-chat-apex-routes')");
    expect(client).toContain('/api/sheikha/extension-experience/v1/status');
    expect(client).toContain('/api/sheikha/vital-chat-apex/v1/status');
    expect(client).toContain('/api/sheikha/debugging-apex/v1/status');
    expect(client).toContain('/api/sheikha/chat-interface-apex/v1/status');
    expect(client).toContain('getDebuggingApexStatus');
    expect(client).toContain('getChatInterfaceApexStatus');
    expect(provider).toContain('conversationId');
    expect(provider).toContain('history: this.history');
    expect(provider).toContain('مسار الرد المحكوم');
    expect(provider).toContain('Vital Chat Apex');
    expect(provider).toContain('Debugging Apex');
    expect(provider).toContain('Chat Interface Apex');
    expect(provider).toContain('شات شيخة المتقدم');
    expect(provider).toContain('contextRail');
    expect(provider).toContain('id="clear"');
    expect(provider).toContain('Session Memory');
    expect(sdk).toContain('client.extensionExperience');
    expect(sdk).toContain('vitalChatApex');
    expect(sdk).toContain('debuggingApex');
    expect(sdk).toContain('chatInterfaceApex');
    expect(inspector).toContain('extensionExperienceStatus');
    expect(inspector).toContain('debuggingApexStatus');
    expect(inspector).toContain('chatInterfaceApexStatus');
    expect(inspector).toContain('enterpriseManagementStatus');
    const packageJson = require('../package.json');
    expect(packageJson.scripts['ops:vscode-extension-experience-apex:v1']).toBeTruthy();
    expect(fs.readFileSync(
      path.join(root, 'tools/verify-sheikha-unified-apex-v1.sh'), 'utf8'
    )).toContain('npm --prefix sheikha-vscode-extension test');
  });
});
