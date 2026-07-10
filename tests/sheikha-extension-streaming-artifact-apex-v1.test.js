'use strict';

const fs = require('fs');
const path = require('path');
const extensionStreamingArtifactApex = require(
  '../runtime/extension-streaming-artifact-apex/v1/sheikha-extension-streaming-artifact-apex-v1'
);

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Extension Streaming Artifact Apex V1', () => {
  test('activates L23 above streaming chat and technical capability apex', () => {
    const result = extensionStreamingArtifactApex.status();

    expect(result.system).toBe('SHEIKHA_EXTENSION_STREAMING_ARTIFACT_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.apexLevel).toBe(23);
    expect(result.level).toContain('L23');
    expect(result.decision).toBe('EXTENSION_STREAMING_ARTIFACT_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.position).toContain('UNDER_COMPUTING_COGNITIVE_APEX');
    expect(result.governedBy).toContain('SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1');
    expect(result.chatApexOrder[0]).toBe('L24 Computing Cognitive Apex');
    expect(result.chatApexOrder[1]).toBe('L23 Extension Streaming Artifact Apex');
    expect(result.capabilities.extensionSseClient).toBe('ACTIVE');
    expect(result.capabilities.safeArtifactPreview).toBe('ACTIVE_SAFE_IFRAME');
    expect(result.artifactPolicy.webviewScripts).toBe('DISABLED');
    expect(result.governance.noHarmNoDamage).toBe(true);
    expect(result.governance.noStashOrDeletionAutomation).toBe(true);
    expect(result.governance.noActualAgiClaim).toBe(true);
    expect(result.governance.noActualAsiClaim).toBe(true);
  });

  test('is wired through server, SDK, inspector, package script, docs, and extension UI', () => {
    const server = read('server.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const inspector = read('core/enterprise/sheikha-enterprise-inspector-v3.js');
    const client = read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js');
    const provider = read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js');
    const artifactPreview = read('sheikha-vscode-extension/src/sheikhaArtifactPreview.js');
    const docs = read(
      'docs/extension-streaming-artifact-apex/SHEIKHA-EXTENSION-STREAMING-ARTIFACT-APEX-V1.md'
    );
    const packageJson = require('../package.json');

    expect(server).toContain(
      "app.use(require('./routes/extension-streaming-artifact-apex/sheikha-extension-streaming-artifact-apex-routes'));"
    );
    expect(server.indexOf('routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes'))
      .toBeLessThan(server.indexOf('routes/extension-streaming-artifact-apex/sheikha-extension-streaming-artifact-apex-routes'));
    expect(sdk).toContain('/api/sheikha/extension-streaming-artifact-apex/v1/status');
    expect(sdk).toContain('/api/intelligence/execution-loop/apex/status');
    expect(sdk).toContain('extensionStreamingArtifactApex');
    expect(sdk).toContain('computingCognitiveApex');
    expect(inspector).toContain('extensionStreamingArtifactApexStatus');
    expect(inspector).toContain('computingCognitiveApexStatus');
    expect(client).toContain('postSse');
    expect(client).toContain('parseSseBuffer');
    expect(client).toContain('EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT');
    expect(client).toContain('COMPUTING_COGNITIVE_APEX_STATUS_ENDPOINT');
    expect(client).toContain('getComputingCognitiveApexStatus');
    expect(provider).toContain("command: 'streamToken'");
    expect(provider).toContain("command: 'computingCognitiveApexStatus'");
    expect(provider).toContain('L24 Computing Cognitive Apex');
    expect(provider).toContain('Sheikha Live Preview');
    expect(artifactPreview).toContain('sandbox=""');
    expect(artifactPreview).toContain("script-src 'none'");
    expect(docs).toContain('Early SSE ACK');
    expect(packageJson.scripts['ops:extension-streaming-artifact-apex:v1'])
      .toBe('node tools/extension-streaming-artifact-apex/sheikha-extension-streaming-artifact-apex-v1.js');
  });
});
