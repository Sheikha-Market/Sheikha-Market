# SHEIKHA Enterprise SaaS V2

Status: `ACTIVE_CONTROL_PLANE`

This layer turns the V2 foundation into a governed, multi-tenant control plane. It does not claim a connected payment gateway, external identity provider, production database, customer contract, regulatory license, or collected revenue.

## Runtime Flow

Authenticated identity or scoped API key -> RBAC -> tenant boundary -> governance admission -> Orchestrator Fabric L11 -> domain write -> atomic state -> append-only audit

## Active Components

- Organization, workspace, project, environment, and user isolation
- OWNER, ADMIN, OPERATOR, AUDITOR, and VIEWER RBAC
- Contract-backed subscriptions and seats
- Software product entitlements, explicitly not regulatory licenses
- Idempotent usage metering
- Billing previews, explicitly not invoices
- API key issue, authentication, rotation, revocation, and redacted registry
- Node.js SDK, dependency-free Python SDK, and CLI inspection commands
- Append-only audit evidence for every control-plane write

## Truthful Boundaries

- Production writes require an authenticated upstream identity or scoped Sheikha API key.
- Development identity headers are disabled in production unless explicitly enabled.
- API key secrets are returned once and only their SHA-256 digest is stored.
- Automatic writes are limited to append-only usage telemetry under a named policy.
- Commercial activation requires a verified contract reference and human approval.
- Billing remains `ESTIMATE_ONLY` until a real gateway and payment confirmation exist.
- File persistence is suitable for one writer. PostgreSQL or an equivalent transactional database is required before clustered production writes.

## Endpoints

- `GET /api/saas/v2/status`
- `GET /api/tenancy/snapshot`
- `POST /api/tenancy/organizations`
- `POST /api/tenancy/workspaces`
- `POST /api/tenancy/projects`
- `POST /api/tenancy/users`
- `POST /api/subscriptions`
- `POST /api/subscriptions/seats`
- `POST /api/subscriptions/product-entitlements`
- `GET|POST /api/subscriptions/usage`
- `GET /api/subscriptions/billing-preview`
- `GET|POST /api/security/api-keys`
- `POST /api/security/api-keys/:keyId/rotate`
- `POST /api/security/api-keys/:keyId/revoke`
- `GET /api/saas/v2/audit`
