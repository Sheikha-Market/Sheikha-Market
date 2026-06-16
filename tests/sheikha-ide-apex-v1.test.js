'use strict';

const fs = require('fs');
const path = require('path');
const ideApex = require('../runtime/ide-apex/v1/sheikha-ide-apex-v1');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha IDE Apex V1', () => {
  test('activates the highest governed IDE programming and development layer', () => {
    const result = ideApex.status();

    expect(result.system).toBe('SHEIKHA_IDE_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('IDE_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.stack.chatInterfaceApex).toBe('SHEIKHA_CHAT_INTERFACE_APEX_V1');
    expect(result.stack.codeAssist).toBe('SHEIKHA_IDE_CODE_ASSIST');
    expect(result.stack.promotedBy).toBe('SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1');
    expect(result.routes.status).toBe('/api/sheikha/ide-apex/v1/status');
    expect(result.routes.technicalCapabilityApex)
      .toBe('/api/sheikha/technical-capability-apex/v1/status');
  });

  test('enforces local runtime first programming transport governance', () => {
    const result = ideApex.status();

    expect(result.transportPolicy.localRuntimeFirst).toBe(true);
    expect(result.transportPolicy.nonJsonGatewayIsNotUserAnswer).toBe(true);
    expect(result.transportPolicy.retryLocalConversationBeforeLocalFallback).toBe(true);
    expect(result.governance.noDestructiveGitWithoutExplicitRequest).toBe(true);
    expect(result.governance.noSecretExposure).toBe(true);
  });

  test('is wired through server, SDK, extension client, and chat provider', () => {
    expect(read('server.js')).toContain(
      "app.use(require('./routes/ide-apex/sheikha-ide-apex-routes'));"
    );
    expect(read('sdk/sheikha-api/index.js')).toContain('/api/sheikha/ide-apex/v1/status');
    expect(read('sdk/sheikha-api/index.js')).toContain('ideApex');
    expect(read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js'))
      .toContain('IDE_APEX_STATUS_ENDPOINT');
    expect(read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js')).toContain('IDE Apex');
    expect(read('core/enterprise/sheikha-enterprise-inspector-v3.js')).toContain('ideApexStatus');
  });
});
