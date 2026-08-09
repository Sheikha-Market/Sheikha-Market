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
      'Universal Distribution Release Apex',
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
      intelligenceCapabilityApex:
        '/api/sheikha/intelligence-capability-apex/v1/status',
      intelligenceCapabilities:
        '/api/sheikha/intelligence-capability-apex/v1/capabilities',
      intelligenceModels:
        '/api/sheikha/intelligence-capability-apex/v1/models',
      enterpriseInspector: '/api/sheikha/enterprise-inspector/v3/status',
      distributionReleaseApex: '/api/sheikha/distribution-apex/v1/status',
      distributionReleaseMatrix: '/api/sheikha/distribution-apex/v1/matrix',
      distributionReleaseIndex: '/api/sheikha/distribution-apex/v1/release-index',
      publicBenefitPolicy: '/api/governance/generator/public-benefit-policy',
      publicBenefitCoverage: '/api/governance/generator/public-benefit/coverage',
      publicBenefitEvaluation: '/api/governance/generator/public-benefit/evaluate',
      nativeLanguageArchitecture:
        '/api/governance/generator/sheikha-language-architecture'
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
      actualIndependentModelInvocationsAvailable: true,
      actualIndependentModelProcessesClaimed: false
    },
    highestExecutableTechnicalLayer: {
      system: 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
      level: 'L24_HIGHEST_GOVERNED_COMPUTING_COGNITIVE_APEX_LAYER',
      plane: 'COGNITIVE_REASONING_PLANE_ONLY',
      status: 'ACTIVE',
      underCovenantGovernance: true,
      humanFinalDecision: true,
      normativeReferenceLayerExecutable: false,
      statusEndpoint: '/api/intelligence/execution-loop/apex/status'
    },
    highestReleaseDeliveryLayer: {
      system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1',
      level: 'L27_HIGHEST_GOVERNED_RELEASE_DISTRIBUTION_APEX_LAYER',
      plane: 'RELEASE_DELIVERY_PLANE_ONLY',
      status: 'ACTIVE_WITH_EVIDENCE_GATED_LOCAL_RELEASE',
      underCovenantGovernance: true,
      remoteBuildEndpointExposed: false,
      remotePublishEndpointExposed: false,
      humanFinalDecision: true,
      statusEndpoint: '/api/sheikha/distribution-apex/v1/status'
    },
    publicBenefitRouting: {
      system: 'SHEIKHA_PUBLIC_BENEFIT_CAPABILITY_ROUTER_V1',
      status: 'ACTIVE_GOVERNED_EVALUATION_ONLY',
      scope: 'ALL_DISCOVERED_AND_REGISTERED_CAPABILITIES',
      hardBoundariesOverrideBenefitIntent: true,
      policyCoverageActivatesCapabilities: false,
      automaticExecution: false,
      automatedFatwaAllowed: false,
      humanFinalDecision: true,
      statusEndpoint: '/api/governance/generator/public-benefit/coverage'
    },
    nativeLanguageArchitecture: {
      system: 'SHEIKHA_NATIVE_LANGUAGE_ARCHITECTURE_V1',
      status: 'FOUNDATION_ACTIVE_FULL_NATIVE_MIGRATION_REQUIRED',
      canonicalSource:
        'sheikha-language/system/sheikha-sovereign-architecture-v1.shk',
      compilerSelfHosted: false,
      nativeTargetAvailable: false,
      fullSystemPortedToSheikha: false,
      currentPortalRequiresNode: true,
      completionClaimAllowed: false,
      statusEndpoint: '/api/governance/generator/sheikha-language-architecture'
    },
    requiredPath: [
      'NativeSheikhaLanguageArchitectureFoundation',
      'PublicBenefitCapabilityRouter',
      'DistributionReleaseApex',
      'ComputingCognitiveApex',
      'IntelligenceCapabilityApex',
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

router.post('/api/sheikha/unified-chat', async (req, res) => {
  const result = await handleUnifiedChat(req.body || {});
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
