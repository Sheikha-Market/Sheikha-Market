# SHEIKHA IDE APEX V1

`SHEIKHA_IDE_APEX_V1` is the governed programming and development layer for Sheikha inside VS Code.

It makes the IDE chat prefer the local governed runtime first, then uses gateway fallback only when explicitly configured.

## Scope

- Programming chat routing
- Workspace and Git awareness
- Code error triage
- Test and lint guidance
- SDK Fabric and MCP development integration
- Non-JSON gateway recovery

## Endpoint

`GET /api/sheikha/ide-apex/v1/status`

## Boundaries

- Read-only first
- No secret exposure
- No destructive Git without explicit user request
- Human review for high-impact actions
- No consciousness, AGI, or ASI runtime claim
