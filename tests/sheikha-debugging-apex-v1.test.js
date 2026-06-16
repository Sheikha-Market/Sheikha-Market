'use strict';

const fs = require('fs');
const path = require('path');
const debuggingApex = require('../runtime/debugging-apex/v1/sheikha-debugging-apex-v1');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Debugging Apex V1', () => {
  test('activates the governed highest debugging layer', () => {
    const result = debuggingApex.status();

    expect(result.system).toBe('SHEIKHA_DEBUGGING_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('DEBUGGING_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.position).toContain('ABOVE_VITAL_CHAT_APEX');
    expect(result.stack.vitalChatApex).toBe('SHEIKHA_VITAL_CHAT_APEX_V1');
    expect(result.routes.status).toBe('/api/sheikha/debugging-apex/v1/status');
    expect(result.routes.conversation).toBe('/api/sheikha/conversation-engine/v1/chat');
  });

  test('enforces safe debugging policies', () => {
    const policies = debuggingApex.status().policies;

    expect(policies.readOnlyFirst).toBe(true);
    expect(policies.noAutoDeletion).toBe(true);
    expect(policies.noSecretExposure).toBe(true);
    expect(policies.noDestructiveGit).toBe(true);
    expect(policies.inspectorPrintedOnlyWhenExplicitlyRequested).toBe(true);
    expect(policies.humanApprovalForHighImpactActions).toBe(true);
  });

  test('is wired through server, SDK, extension client, and package scripts', () => {
    expect(read('server.js')).toContain(
      "app.use(require('./routes/debugging-apex/sheikha-debugging-apex-routes'));"
    );
    expect(read('sdk/sheikha-api/index.js')).toContain('/api/sheikha/debugging-apex/v1/status');
    expect(read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js'))
      .toContain('DEBUGGING_APEX_STATUS_ENDPOINT');

    const packageJson = require('../package.json');
    expect(packageJson.scripts['ops:debugging-apex:v1']).toBe(
      'node tools/debugging-apex/sheikha-debugging-apex-v1.js'
    );
  });

  test('keeps Todo Tree ripgrep workspace binding explicit', () => {
    expect(read('.vscode/settings.json')).toContain('"todo-tree.ripgrep": "/usr/bin/rg"');
  });
});
