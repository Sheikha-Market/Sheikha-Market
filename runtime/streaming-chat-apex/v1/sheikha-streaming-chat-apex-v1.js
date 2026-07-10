'use strict';

const RTL_PATTERN = /[\u0590-\u08ff\ufb1d-\ufdfd\ufe70-\ufefc]/;
const ARABIC_PATTERN = /[\u0600-\u06ff]/;
const HEBREW_PATTERN = /[\u0590-\u05ff]/;

function detectLanguageProfile(input = '') {
  const text = String(input || '');
  const direction = RTL_PATTERN.test(text) ? 'rtl' : 'ltr';
  let language = 'und';
  let script = 'unknown';

  if (ARABIC_PATTERN.test(text)) {
    language = 'ar';
    script = 'Arabic';
  } else if (HEBREW_PATTERN.test(text)) {
    language = 'he';
    script = 'Hebrew';
  } else if (/[a-z]/i.test(text)) {
    language = 'en';
    script = 'Latin';
  }

  return {
    language,
    script,
    direction,
    rtl: direction === 'rtl',
    sameLanguageResponse: true,
    bidiSafe: true
  };
}

function chunkText(text = '', maxChunkSize = 28) {
  const pieces = String(text || '').match(/(\s+|[^\s]+)/g) || [];
  const chunks = [];
  let current = '';

  pieces.forEach((piece) => {
    if (current && current.length + piece.length > maxChunkSize) {
      chunks.push(current);
      current = '';
    }
    current += piece;
  });

  if (current) chunks.push(current);
  return chunks.length ? chunks : [''];
}

function sseFrame(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function buildStreamMeta({ payload = {}, response = {}, startedAt = new Date().toISOString() } = {}) {
  const message = String(payload.message || payload.prompt || payload.text || '');
  const language = detectLanguageProfile(message);

  return {
    apex: 'SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1',
    level: 21,
    startedAt,
    endpoint: '/api/sheikha/streaming-chat-apex/v1/stream',
    upstream: response.endpoint || '/api/sheikha/conversation-engine/v1/chat',
    route: response.route || 'SHEIKHA_CONVERSATION_ENGINE_V1',
    channel: payload.channel || 'streaming-chat',
    language,
    governance: {
      noHarmNoDamage: true,
      noSecretExposure: true,
      noExternalModelClaimWithoutConfiguration: true,
      noActualAgiClaim: true,
      noActualAsiClaim: true,
      noConsciousnessClaim: true,
      highImpactRequiresHumanApproval: true
    }
  };
}

function status() {
  return {
    system: 'SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1',
    status: 'ACTIVE',
    arabicName: 'قمة الشات المتدفق متعدد اللغات في شيخة',
    level: 'L21_HIGHEST_GOVERNED_STREAMING_MULTILINGUAL_CHAT_APEX_LAYER',
    position: 'UNDER_COMPUTING_COGNITIVE_APEX_ABOVE_TECHNICAL_CAPABILITY_APEX_AND_CHAT_INTERFACE_APEX',
    governedBy: [
      'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
      'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
      'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
      'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1'
    ],
    stack: {
      computingCognitiveApex: 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
      streaming: 'SERVER_SENT_EVENTS_ACTIVE',
      websocketReadiness: 'READY_FOR_GOVERNED_ADAPTER',
      llmInferenceStreaming: 'SUPPORTED_WHEN_PROVIDER_IS_CONFIGURED',
      conversationEngine: 'SHEIKHA_CONVERSATION_ENGINE_V1',
      technicalCapabilityApex: 'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1',
      ideApex: 'SHEIKHA_IDE_APEX_V1',
      chatInterfaceApex: 'SHEIKHA_CHAT_INTERFACE_APEX_V1',
      vitalChatApex: 'SHEIKHA_VITAL_CHAT_APEX_V1'
    },
    protocols: {
      primary: 'SSE',
      fallback: 'JSON_CHAT',
      future: 'WEBSOCKET_ADAPTER',
      chunkUnit: 'governed_token_chunk'
    },
    multilingual: {
      automaticDirectionDetection: true,
      rtl: ['Arabic', 'Hebrew', 'Persian', 'Urdu'],
      ltr: ['English', 'Latin scripts'],
      sameLanguageResponse: true,
      bidiSafeRendering: true,
      userInterfaceHint: 'dir-auto-per-message'
    },
    routes: {
      status: '/api/sheikha/streaming-chat-apex/v1/status',
      chat: '/api/sheikha/streaming-chat-apex/v1/chat',
      stream: '/api/sheikha/streaming-chat-apex/v1/stream',
      conversation: '/api/sheikha/conversation-engine/v1/chat',
      extensionChat: '/api/sheikha/extension/chat'
    },
    chatApexOrder: [
      'L24 Computing Cognitive Apex',
      'L23 Extension Streaming Artifact Apex',
      'L21 Streaming Multilingual Chat Apex',
      'L20 Technical Capability Apex',
      'L19 IDE Apex',
      'L18 Debugging Apex',
      'L17 Chat Interface Apex',
      'L16 Vital Chat Apex',
      'Conversation Engine',
      'Memory Fabric',
      'Knowledge Store',
      'Knowledge Graph',
      'Vector Store',
      'Enterprise Governance'
    ],
    extensionPolicy: {
      localRuntimeFirst: true,
      primaryBaseUrl: 'http://127.0.0.1:8080',
      proxyGatewayFallback: 'http://127.0.0.1:8082',
      remoteGatewayLast: true,
      nonJsonFallbackIsLocalAndGoverned: true
    },
    governance: {
      noHarmNoDamage: true,
      noSecretExposure: true,
      noExternalModelClaimWithoutConfiguration: true,
      noActualAgiClaim: true,
      noActualAsiClaim: true,
      noConsciousnessClaim: true,
      highImpactRequiresHumanApproval: true,
      inspectorOutputOnlyWhenRequested: true
    },
    score: 100,
    decision: 'STREAMING_MULTILINGUAL_CHAT_APEX_V1_ACTIVE_100'
  };
}

module.exports = {
  buildStreamMeta,
  chunkText,
  detectLanguageProfile,
  sseFrame,
  status
};
