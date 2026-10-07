# Sheikha AI Sovereign Architecture

## Principle

Sheikha is the governing upper layer, the logical provider, the router, and the default upstream.

Hostinger AI Router is an optional external adapter under Sheikha governance. It is never the governing authority and is not the default upstream.

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
│       ├── Sheikha Native Upstream
│       │   └── Sheikha Local Mind / SheikhaNeural-v1.0
│       ├── optional Hostinger adapter
│       └── future optional adapters
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
└── External adapters
    ├── Hostinger AI Router (optional)
    ├── OpenAI (optional)
    ├── Anthropic (optional)
    └── Ollama (optional/local adapter)
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

External consumers see Sheikha as the provider identity.

### Router layer

Router ID: `sheikha-ai-router`

The router owns:
- upstream selection
- allowed models
- fallback models
- token and input limits
- adapter policy
- client configuration

### Native upstream

Default upstream ID: `sheikha`

Native model: `SheikhaNeural-v1.0`

Native base identity: `sheikha://native`

The native path uses the existing Sheikha Local Mind architecture and does not require an external API key.

### Hostinger integration

Hostinger is an optional external adapter only.

To select it explicitly:

```env
SHEIKHA_AI_ROUTER_UPSTREAM=hostinger
SHEIKHA_AI_ROUTER_BASE_URL=https://router.hostinger.com/v1
SHEIKHA_AI_ROUTER_API_KEY=<secret>
SHEIKHA_AI_ROUTER_MODEL=<allowed-model-id>
```

If these values are not set, Sheikha remains the native upstream.

## Runtime files

- `lib/sheikha-local-mind.js`
- `lib/sheikha-ai-router.js`
- `lib/sheikha-ai-router/sheikha-upstream.js`
- `lib/sheikha-ai-router/governance.js`
- `lib/sheikha-ai-router/provider.js`
- `lib/sheikha-ai-router/hostinger-upstream.js`
- `lib/sheikha-ai-router/index.js`
- `routes/ai.js`

## Commands

```bash
npm run sheikha-ai-router:validate
npm run sheikha-ai-router:status
npm run sheikha-ai-router:test
npm run sheikha-ai-provider:status
npm run sheikha-ai-provider:test
```

Expected default status:

```json
{
  "provider": "sheikha",
  "identity": "Sheikha AI Provider",
  "upperLayer": "Sheikha Supreme AI Governance",
  "routingLayer": "Sheikha AI Router",
  "lowerLayer": "Sheikha Provider Fabric",
  "upstream": "sheikha",
  "upstreamVisibility": "native"
}
```

## Security and operations

- Real external credentials remain in environment variables only.
- Sheikha remains the visible provider identity.
- External adapters cannot override Sheikha governance.
- Model or token requests that violate Sheikha policy are rejected before any adapter call.
- No automatic deployment, payment, purchase, or secret mutation is performed by this architecture.
