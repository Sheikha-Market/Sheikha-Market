# Sheikha SDK / MCP governance integration

The general MCP server admits only low-risk read tools in its configured allowlist. Unknown and write-capable tools fail closed; client approval flags cannot enable them. Configuration failures and audit failures block execution. Tool audit receipts contain no request arguments or response bodies. Audit is bounded and in memory; durable storage is not claimed.

The standalone SDK server binds to loopback and requires an existing scoped enterprise API key with runtime:read. Client identity and human-approval headers are not authorization. Existing JavaScript and Python API SDKs can pass this key; no new key is issued by this change.

Legacy catalog status is UNKNOWN without runtime evidence. Legacy key issuance and simulated MCP execution are disabled. SDK test responses are explicitly simulated.

No deployment or service restart is included. This change does not assert that every other platform route enforces the same policy. Mutations remain disabled in this MCP facade; enabling a write requires a separate server-side approval design and authorization. Secret-key and email redaction is a safeguard, not complete semantic classification of arbitrary free text.

Validation: node tests/sheikha-sdk-mcp-governance.test.cjs

## Local closure

Status: CLOSED_LOCAL_INTEGRATION_VERIFIED.

Changes cover the general MCP dispatch and resource catalog, the standalone SDK HTTP authentication boundary, and legacy demo SDK/MCP routes. Private MCP resources are excluded; permitted resource JSON is redacted.

Tests exercise actual MCP dispatch registration and the SDK HTTP handler using mocks, with no listening sockets, network requests, key issuance, deployment or service restart. Runtime production behavior remains UNKNOWN. Existing unrelated workspace changes were preserved.

Compatibility: write-capable MCP tools are no longer advertised or admitted. The standalone SDK now requires a scoped key and listens only on loopback. Legacy key issuance and demo execution return 501. Deployment or reopening mutation access requires separate authorization.

Final validation: 9 tests passed, including actual MCP dispatch and SDK HTTP handler boundaries under mocks. Syntax checks passed for all six JavaScript files; scoped git diff whitespace check passed. No live production verification performed.
