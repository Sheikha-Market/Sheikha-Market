# Sheikha Extension Streaming Artifact Apex V1

- System: SHEIKHA_EXTENSION_STREAMING_ARTIFACT_APEX_V1
- Status: ACTIVE
- Decision: EXTENSION_STREAMING_ARTIFACT_APEX_V1_ACTIVE_100
- Score: 100
- Level: L23_EXTENSION_STREAMING_ARTIFACT_APEX

## Capabilities

- extensionSseClient: ACTIVE
- governedStreamFallback: ACTIVE
- safeArtifactPreview: ACTIVE_SAFE_IFRAME
- sessionGreetingPolicy: ACTIVE_FIRST_MESSAGE_ONLY
- localRuntimeFirst: true
- heartbeatTimeoutMitigation: true
- nonJsonProxyFallback: LOCAL_GOVERNED_FALLBACK

## Transport

- status: /api/sheikha/extension-streaming-artifact-apex/v1/status
- stream: /api/sheikha/streaming-chat-apex/v1/stream
- conversation: /api/sheikha/conversation-engine/v1/chat
- unifiedFallback: /api/sheikha/unified-chat
- inspector: /api/sheikha/enterprise-inspector/v3/status

## Artifact Policy

- supported: html
- previewMode: SAFE_PREVIEW_ONLY
- webviewScripts: DISABLED
- iframeSandbox: true
- maxArtifactBytes: 200000
- noFileWriteFromPreview: true
- noShellExecutionFromPreview: true

## Governance

- noHarmNoDamage: true
- noSecretExposure: true
- noStashOrDeletionAutomation: true
- noRemoteExecutionWithoutHumanApproval: true
- noProductionClaimWithoutEvidence: true
- noExternalModelClaimWithoutConfiguration: true
- noActualAgiClaim: true
- noActualAsiClaim: true
- noConsciousnessClaim: true
- highImpactRequiresHumanApproval: true
- inspectorOutputOnlyWhenRequested: true
