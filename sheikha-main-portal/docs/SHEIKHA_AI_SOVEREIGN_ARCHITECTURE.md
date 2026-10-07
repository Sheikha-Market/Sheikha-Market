# Sheikha AI Sovereign Architecture

## Principle

Sheikha is the governing upper layer and the logical provider identity.

Hostinger AI Router is an integrated upstream transport/provider under Sheikha governance. It is not the governing authority.

## Layer model

```text
Sheikha Supreme Governance
│
├── Sheikha AI Provider
│   │
│   ├── Sheikha AI Router
│   │   ├── policy enforcement
│   │   ├── model allowlist
│   │   ├── fallback policy
│   │   ├── token/input limits
│   │   ├── secret isolation
│   │   └── fail-closed decisions
│   │
│   └── Sheikha Provider Fabric
│       ├── hostinger upstream adapter
│       ├── future upstream adapters
│       └── provider observability
│
├── Sheikha Applications
│   ├── sheikha.top
│   ├── Sheikha Codex
│   ├── IDE/SDK
│   ├── agents
│   ├── n8n
│   ├── OpenClaw
│   └── Hermes
│
└── Upstreams
    └── Hostinger AI Router
        └── https://router.hostinger.com/v1
```

## Authority boundaries

### Upper governing layer

Authority ID: `sheikha-governance`

Responsibilities:
- no harm
- no riba
- no deception
- explicit authority
- secret isolation
- fail closed on invalid enabled configuration

### Provider layer

Provider ID: `sheikha`

External consumers see Sheikha as the logical provider identity.

The provider selects and calls a registered private upstream adapter only after governance approval.

### Router layer

Router ID: `sheikha-ai-router`

The router owns:
- allowed models
- fallback models
- base URL policy
- selected model
- provider selection
- client configuration

### Upstream layer

Current upstream ID: `hostinger`

Current official upstream base URL:
`https://router.hostinger.com/v1`

The upstream is private implementation detail. It does not override Sheikha governance.

## Runtime files

- `lib/sheikha-ai-router.js`
- `lib/sheikha-ai-router/governance.js`
- `lib/sheikha-ai-router/provider.js`
- `lib/sheikha-ai-router/hostinger-upstream.js`
- `lib/sheikha-ai-router/index.js`

## Commands

```bash
npm run sheikha-ai-router:validate
npm run sheikha-ai-router:status
npm run sheikha-ai-router:test
npm run sheikha-ai-provider:status
npm run sheikha-ai-provider:test
```

## Security and operations

- Real credentials remain in environment variables only.
- Provider responses identify `sheikha` as the logical provider.
- Upstream identity is retained internally for observability and troubleshooting.
- Model or token requests that violate Sheikha policy are rejected before the upstream call.
- No automatic deployment, payment, purchase, or secret mutation is performed by this architecture.
