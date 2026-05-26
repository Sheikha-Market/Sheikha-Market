# SHEIKHA Sovereign Runtime Fabric

## Purpose

Sheikha operates as a sovereign deterministic runtime fabric. External AI
vendors, IDE assistants, cloud APIs, and CI systems are providers only; they do
not own runtime authority.

## Principles

- Canonical ownership
- Governance-first runtime
- Provider abstraction
- Offline survivability
- Enterprise federation
- Deterministic execution
- Registry-driven orchestration
- Local-first intelligence
- Human review before publish, merge, deployment, or destructive action

## Runtime Model

SHEIKHA Kernel controls:

- Runtime
- Governance
- Providers
- Federation
- Security
- Registry
- IDE integrations

## Provider Model

The provider registry resolves providers in this order:

1. local
2. ollama
3. openai
4. claude
5. gemini
6. offline

If billing, limits, network access, or vendor APIs fail, Sheikha falls back to
local/offline providers and keeps governance, routing, ownership, and audit
available.

## Ownership Model

Runtime ownership is declared in `runtime/ownership/runtime-ownership-registry.json`.
Each runtime surface has one owner, one canonical path, and one governing policy.

## Invariant

Sheikha remains operational when any external AI provider, IDE budget, or cloud
API is unavailable. Capabilities may degrade, but the kernel, registry,
governance, and ownership controls stay active.
