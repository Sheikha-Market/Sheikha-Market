# Sheikha Extension Streaming Artifact Apex V1

## Purpose

SHEIKHA_EXTENSION_STREAMING_ARTIFACT_APEX_V1 raises the VS Code extension chat from request/response waiting into governed streaming with safe artifact preview.

## Guarantees

- Local runtime first: `http://127.0.0.1:8080`.
- SSE stream first, JSON fallback second, unified chat fallback last.
- Early SSE ACK and heartbeat reduce 60 second timeout risk.
- HTML artifacts render only inside a safe preview with scripts disabled.
- No automatic stash, deletion, remote deployment, secret writing, or high-impact execution.
- AGI, ASI, and consciousness remain research classifications, not runtime claims.

## Routes

- Status: `/api/sheikha/extension-streaming-artifact-apex/v1/status`
- Stream: `/api/sheikha/streaming-chat-apex/v1/stream`
- Conversation fallback: `/api/sheikha/conversation-engine/v1/chat`
- Unified fallback: `/api/sheikha/unified-chat`

## Governance

The layer follows the principle: `لا ضرر ولا ضرار`.

Human approval remains required for destructive operations, external writes, production changes, deployment actions, billing, secrets, and provider provisioning.
