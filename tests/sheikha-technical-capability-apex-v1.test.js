'use strict';

const fs = require('fs');
const path = require('path');
const technicalCapabilityApex = require(
  '../runtime/technical-capability-apex/v1/sheikha-technical-capability-apex-v1'
);

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Technical Capability Apex V1', () => {
  test('activates the highest governed technical capability layer', () => {
    const result = technicalCapabilityApex.status();

    expect(result.system).toBe('SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('TECHNICAL_CAPABILITY_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.position).toContain('ABOVE_IDE_APEX');
    expect(result.chatApexOrder[0]).toBe('Technical Capability Apex');
    expect(result.stack.ideApex).toBe('SHEIKHA_IDE_APEX_V1');
    expect(result.routes.status).toBe('/api/sheikha/technical-capability-apex/v1/status');
  });

  test('maps advanced chat, coding, agentic, RAG, MCP, SDK, and template capabilities safely', () => {
    const matrix = technicalCapabilityApex.status().capabilityMatrix;
    const governance = technicalCapabilityApex.status().governance;

    expect(matrix.generative.status).toBe('ACTIVE');
    expect(matrix.codingCopilotPattern.status).toBe('ACTIVE');
    expect(matrix.agentic.status).toBe('ACTIVE_GOVERNED');
    expect(matrix.multiAgent.status).toBe('ACTIVE_GOVERNED');
    expect(matrix.rag.status).toBe('ACTIVE');
    expect(matrix.mcp.status).toBe('ACTIVE');
    expect(matrix.sdk.status).toBe('ACTIVE');
    expect(matrix.ide.status).toBe('ACTIVE');
    expect(matrix.debugging.status).toBe('ACTIVE_ON_REQUEST');
    expect(matrix.templates.status).toBe('ACTIVE');
    expect(governance.noExternalModelClaimWithoutConfiguration).toBe(true);
    expect(governance.noActualAgiClaim).toBe(true);
    expect(governance.noActualAsiClaim).toBe(true);
  });

  test('is wired through server, SDK, extension client, provider, and inspector', () => {
    expect(read('server.js')).toContain(
      "app.use(require('./routes/technical-capability-apex/sheikha-technical-capability-apex-routes'));"
    );
    expect(read('sdk/sheikha-api/index.js'))
      .toContain('/api/sheikha/technical-capability-apex/v1/status');
    expect(read('sdk/sheikha-api/index.js')).toContain('technicalCapabilityApex');
    expect(read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js'))
      .toContain('TECHNICAL_CAPABILITY_APEX_STATUS_ENDPOINT');
    expect(read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js'))
      .toContain('Technical Capability Apex');
    expect(read('core/enterprise/sheikha-enterprise-inspector-v3.js'))
      .toContain('technicalCapabilityApexStatus');
  });
});
