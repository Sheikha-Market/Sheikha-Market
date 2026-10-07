# Sheikha AI Router

Sheikha AI Router is the routing and governance layer used by Sheikha applications, agents, IDEs and SDK integrations.

## Identity and upstream

- Logical identity: `sheikha-ai-router`
- Current upstream provider: Hostinger AI Router
- Official upstream base URL: `https://router.hostinger.com/v1`

Sheikha owns the policy, model allowlist, fallback policy, observability contract and fail-closed behavior. Hostinger is the current upstream transport/provider.

## Architecture

```text
Sheikha AI Router
├── Governance
│   ├── no secret logging
│   ├── fail closed
│   ├── allowed model list
│   ├── fallback model list
│   └── spend limits at upstream provider
├── Router
│   ├── logical provider: sheikha-ai-router
│   └── upstream: hostinger
├── Consumers
│   ├── sheikha.top
│   ├── Sheikha Codex
│   ├── coding agents
│   ├── IDEs
│   ├── SDKs
│   ├── n8n
│   ├── OpenClaw
│   └── Hermes
└── Observability
    ├── provider
    ├── model
    ├── request result
    └── spend/usage guardrails
```

## Environment contract

```env
SHEIKHA_AI_ROUTER_ENABLED=true
SHEIKHA_AI_ROUTER_UPSTREAM=hostinger
SHEIKHA_AI_ROUTER_BASE_URL=https://router.hostinger.com/v1
SHEIKHA_AI_ROUTER_API_KEY=<secret>
SHEIKHA_AI_ROUTER_MODEL=<exact model id>
SHEIKHA_AI_ROUTER_ALLOWED_MODELS=<comma separated>
SHEIKHA_AI_ROUTER_FALLBACK_MODELS=<comma separated>
SHEIKHA_AI_ROUTER_FAIL_CLOSED=true
```

Keep the real key only in Hostinger Environment Variables or a local secret environment file that is excluded from Git.

## Commands

Run from the portal directory:

```bash
cd /home/sheikha/Sheikha-Market/sheikha-main-portal
npm run sheikha-ai-router:validate
npm run sheikha-ai-router:status
```

Or from anywhere:

```bash
npm --prefix /home/sheikha/Sheikha-Market/sheikha-main-portal run sheikha-ai-router:validate
```

The legacy alias remains available:

```bash
npm run ai-router:validate
```

## Applications, agents, IDEs and SDKs

For clients that support an OpenAI-compatible provider:

- Base URL: `https://router.hostinger.com/v1`
- API key: upstream Hostinger AI Router key
- Model: exact model ID shown by Hostinger

Expose these values through Sheikha configuration, not by committing them into application source.

## Governance principle

Routing must not bypass model allowlists, spend controls, secret isolation, or application authorization. Invalid enabled configurations fail closed.
