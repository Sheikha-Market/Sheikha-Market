'use strict';

const fs = require('fs');
const path = require('path');
const streamingChatApex = require(
  '../runtime/streaming-chat-apex/v1/sheikha-streaming-chat-apex-v1'
);

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Streaming Multilingual Chat Apex V1', () => {
  test('activates L21 above the technical capability and chat interface apex layers', () => {
    const result = streamingChatApex.status();

    expect(result.system).toBe('SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.decision).toBe('STREAMING_MULTILINGUAL_CHAT_APEX_V1_ACTIVE_100');
    expect(result.score).toBe(100);
    expect(result.level).toContain('L21');
    expect(result.position).toContain('UNDER_COMPUTING_COGNITIVE_APEX');
    expect(result.position).toContain('ABOVE_TECHNICAL_CAPABILITY_APEX');
    expect(result.stack.computingCognitiveApex).toBe('SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1');
    expect(result.chatApexOrder[0]).toBe('L24 Computing Cognitive Apex');
    expect(result.chatApexOrder[1]).toBe('L23 Extension Streaming Artifact Apex');
    expect(result.chatApexOrder[2]).toBe('L21 Streaming Multilingual Chat Apex');
    expect(result.protocols.primary).toBe('SSE');
    expect(result.protocols.fallback).toBe('JSON_CHAT');
    expect(result.governance.noHarmNoDamage).toBe(true);
    expect(result.governance.noActualAgiClaim).toBe(true);
    expect(result.governance.noActualAsiClaim).toBe(true);
    expect(result.governance.noConsciousnessClaim).toBe(true);
  });

  test('detects multilingual direction and emits governed SSE frames', () => {
    const arabic = streamingChatApex.detectLanguageProfile('اكتب تقريرًا سريعًا');
    const english = streamingChatApex.detectLanguageProfile('Write a quick report');
    const chunks = streamingChatApex.chunkText('بسم الله الرحمن الرحيم أنا شيخة', 10);
    const frame = streamingChatApex.sseFrame('token', { text: 'مرحبا' });

    expect(arabic.language).toBe('ar');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.sameLanguageResponse).toBe(true);
    expect(english.language).toBe('en');
    expect(english.direction).toBe('ltr');
    expect(chunks.length).toBeGreaterThan(1);
    expect(frame).toContain('event: token');
    expect(frame).toContain('data:');
  });

  test('is wired through server, SDK, inspector, extension client, and extension chat UI', () => {
    const server = read('server.js');
    const sdk = read('sdk/sheikha-api/index.js');
    const inspector = read('core/enterprise/sheikha-enterprise-inspector-v3.js');
    const client = read('sheikha-vscode-extension/src/sheikhaExtensionChatClient.js');
    const provider = read('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js');
    const route = read('routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js');

    expect(server).toContain(
      "app.use(require('./routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes'));"
    );
    expect(server.indexOf("routes/technical-capability-apex/sheikha-technical-capability-apex-routes"))
      .toBeLessThan(server.indexOf("routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes"));
    expect(server.indexOf("routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes"))
      .toBeLessThan(server.indexOf("routes/sheikha-unified-chat-fabric"));
    expect(sdk).toContain('/api/sheikha/streaming-chat-apex/v1/status');
    expect(sdk).toContain('/api/sheikha/streaming-chat-apex/v1/stream');
    expect(sdk).toContain('streamingChatApex');
    expect(inspector).toContain('streamingChatApexStatus');
    expect(client).toContain('STREAMING_CHAT_APEX_STATUS_ENDPOINT');
    expect(client).toContain('STREAMING_CHAT_APEX_STREAM_ENDPOINT');
    expect(client).toContain('getStreamingChatApexStatus');
    expect(provider).toContain('L21 Streaming Multilingual Chat Apex');
    expect(provider).toContain("command: 'streamingApexStatus'");
    expect(provider).toContain('Streaming Apex');
    expect(route).toContain("sseFrame(res, 'ack'");
    expect(route).toContain("sseFrame(res, 'heartbeat'");
  });
});
