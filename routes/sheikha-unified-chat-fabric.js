'use strict';

const express = require('express');
const router = express.Router();
const { handleUnifiedChat } = require('../runtime/chat-fabric/sheikha-unified-chat-fabric-v1');
const { handleConversation } = require('../runtime/conversation-engine/sheikha-conversation-engine-v1');
const { governGovernance } = require('../runtime/governance/sheikha-governance-of-governance-v1');

router.use(express.json({ limit: '5mb' }));

router.get('/api/sheikha/governance/of-governance/status', (req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    engine: 'SHEIKHA_GOVERNANCE_OF_GOVERNANCE_V1',
    policy: governGovernance({ actor: 'status', channel: 'api', action: 'status', message: 'status' })
  });
});

router.get('/api/sheikha/unified-chat/status', (req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    fabric: 'SHEIKHA_UNIFIED_CHAT_FABRIC_V1',
    protocol: 'SHEIKHA_PROTOCOL_V1',
    orchestrator: 'SHEIKHA_SMART_CHAT_ORCHESTRATOR_V3',
    apexLayers: [
      'Streaming Multilingual Chat Apex',
      'Technical Capability Apex',
      'IDE Apex',
      'Debugging Apex',
      'Chat Interface Apex',
      'Vital Chat Apex'
    ],
    surfaces: {
      generalChat: '/api/sheikha/chat',
      extensionChat: '/api/sheikha/extension/chat',
      conversationEngine: '/api/sheikha/conversation-engine/v1/chat',
      streamingChatApex: '/api/sheikha/streaming-chat-apex/v1/status',
      streamingChat: '/api/sheikha/streaming-chat-apex/v1/stream',
      technicalCapabilityApex: '/api/sheikha/technical-capability-apex/v1/status',
      ideApex: '/api/sheikha/ide-apex/v1/status',
      debuggingApex: '/api/sheikha/debugging-apex/v1/status',
      chatInterfaceApex: '/api/sheikha/chat-interface-apex/v1/status',
      vitalChatApex: '/api/sheikha/vital-chat-apex/v1/status',
      enterpriseInspector: '/api/sheikha/enterprise-inspector/v3/status'
    },
    intelligenceModes: {
      runtime: [
        'smart',
        'standard',
        'pro',
        'ultra',
        'generative',
        'rag',
        'agentic',
        'multi-agent',
        'mcp',
        'sdk',
        'cli',
        'graphics'
      ],
      researchOnly: ['agi-research', 'asi-research'],
      actualAgiReached: false,
      actualAsiReached: false
    },
    reasoningProfiles: {
      standard: 'bounded direct reasoning and relevant adjacent discovery',
      pro: 'four-lens evidence architecture serendipity and risk review',
      ultra: 'four governed role slots with human-owned final decision',
      safetyFilterEvasionAllowed: false,
      actualIndependentModelProcessesClaimed: false
    },
    highestExecutableTechnicalLayer: {
      system: 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
      level: 'L24_HIGHEST_GOVERNED_COMPUTING_COGNITIVE_APEX_LAYER',
      status: 'ACTIVE',
      underCovenantGovernance: true,
      humanFinalDecision: true,
      normativeReferenceLayerExecutable: false,
      statusEndpoint: '/api/intelligence/execution-loop/apex/status'
    },
    requiredPath: [
      'ComputingCognitiveApex',
      'StreamingMultilingualChatApex',
      'TechnicalCapabilityApex',
      'IDEApex',
      'DebuggingApex',
      'ChatInterfaceApex',
      'VitalChatApex',
      'Protocol',
      'GovernanceOfGovernance',
      'UnifiedChatFabric',
      'SmartOrchestrator',
      'ExecutionPipeline',
      'ModelCluster'
    ]
  });
});

router.post('/api/sheikha/unified-chat', (req, res) => {
  const result = handleUnifiedChat(req.body || {});
  res.status(result.blocked ? 403 : 200).json(result);
});

/* Conversation Engine هو الواجهة الأساسية؛ Unified Chat يبقى مساراً داخلياً واحتياطياً. */
router.post('/api/sheikha/chat', async (req, res) => {
  const result = await handleConversation({ ...(req.body || {}), channel: 'general-web-chat' });
  res.status(result.blocked ? 403 : 200).json(result);
});

router.post('/api/sheikha/extension/chat', async (req, res) => {
  const result = await handleConversation({ ...(req.body || {}), channel: 'extension-chat' });
  res.status(result.blocked ? 403 : 200).json(result);
});

module.exports = router;
