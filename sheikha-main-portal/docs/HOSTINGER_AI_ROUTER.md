# Hostinger AI Router — Sheikha Integration Guide

Official base URL: `https://router.hostinger.com/v1`.

Use the exact model ID shown in Hostinger Dashboard → AI Router → Models.

## Architecture

- Policy: allowed models, spending limits, fail-closed behavior.
- Routing: Hostinger AI Router as the shared model gateway.
- Consumers: sheikha.top, coding agents, IDEs, SDKs, n8n, OpenClaw, Hermes.
- Observability: usage by key/model, request status, and spend guardrails.
- Security: secrets stay in environment variables and are never committed or logged.

## Applications and SDKs

For any OpenAI-compatible client:

- Base URL: `https://router.hostinger.com/v1`
- API key: create it in Hostinger AI Router.
- Model: copy the exact ID from the Models page.

OpenAI-compatible Python example:

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["HOSTINGER_AI_ROUTER_API_KEY"],
    base_url="https://router.hostinger.com/v1",
)

response = client.chat.completions.create(
    model=os.environ["HOSTINGER_AI_ROUTER_MODEL"],
    messages=[{"role": "user", "content": "Hello"}],
)
```

## Coding agents and IDEs

If the tool supports a Custom Provider or OpenAI-compatible endpoint, use the same Base URL, API key, and model ID.

If the tool does not support a custom Base URL, do not force routing through an unsupported mechanism. Use its supported provider integration.

## OpenClaw, Hermes, n8n, and VPS apps

Use separate project/agent keys when possible. Configure daily/monthly limits and restrict allowed models in Hostinger AI Router.

For Docker apps, keep provider configuration in Hostinger Docker Manager environment variables so it persists across redeployments.

## Sheikha governance

- no secret logging
- no uncontrolled spending
- no silent provider switching outside policy
- fail closed on invalid production configuration
- no harmful or deceptive use
- no riba, gharar, or prohibited commercial behavior in system policy

## Official references

- https://www.hostinger.com/support/what-is-hostinger-ai-router-and-how-to-get-started/
- https://www.hostinger.com/support/migrating-your-credits-from-nexos-ai-to-hostinger-ai-router-credits/
- https://www.hostinger.com/support/how-ai-router-credits-work-with-openclaw-on-vps/
- https://www.hostinger.com/support/how-to-get-started-with-hermes-agent-on-hostinger-vps/
