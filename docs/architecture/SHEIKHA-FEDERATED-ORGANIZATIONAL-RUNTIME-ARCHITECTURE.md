# SHEIKHA Federated Organizational Runtime Architecture

## Definition

SHEIKHA is a federated organizational runtime architecture for multiple
organizations, systems, domains, markets, advisory layers, runtime fabrics, AI
services, datacenter operations, governance controls, telemetry, and audit
chains.

This architecture is not a single Express API surface. It is a governed runtime
environment where every capability must pass through organization, governance,
policy, capability, audit, and runtime controls before execution.

## Foundation

SHEIKHA is operated as an amanah, for Allah alone, with truth, auditability,
bounded claims, human approval when required, and no false public authority
claims.

SHEIKHA may build:

- Readiness frameworks
- Governance fabrics
- Advisory platforms
- Licensing readiness layers
- Market infrastructure support layers
- Federated runtime architecture
- Exchange-support infrastructure
- Standards and certification readiness

SHEIKHA must not claim to be an official exchange, regulator, licensing
authority, public authority, or sovereign state authority unless competent
authorities issue the required approvals.

## Active Baseline

The current runtime baseline is anchored by these commits:

- `46495378` Activate Sheikha capability token engine
- `5b51d3dc` Activate Sheikha unified governance bus
- `9e9e9058` Activate Sheikha organizational federation kernel

Together, these commits move SHEIKHA from isolated APIs into a federated
organizational operating environment.

## Runtime Control Order

The Fabric Bootstrap registry is loaded from:

`runtime/fabric-bootstrap/sheikha-fabric-routes.json`

Routes are mounted by `lib/fabric-bootstrap/fabric-bootstrap-loader.js`, which
sorts entries by descending `priority` before mounting. Higher priority means
earlier governance binding.

Current high-order runtime stack:

1. Organizational Federation Kernel
2. Domain Contract Fabric
3. Governance Graph Engine
4. Policy Enforcement Point
5. Policy Decision Point
6. Unified Governance Bus
7. Capability Token Engine
8. Risk Classification Engine
9. Audit Ledger
10. Policy Compiler
11. Capability Execution Registry
12. Execution Governance Kernel
13. Governance Enforcement Engine
14. Organization System of Systems
15. Capability Registry
16. Authority, exchange, market, advisory, runtime, federation, AI, telemetry,
    and client layers

## Governance Execution Pipeline

All governed execution intents should move through this path:

1. Intent
2. Policy Compiler
3. Capability Registry
4. Policy Decision Point
5. Policy Enforcement Point
6. Risk Engine
7. Audit Ledger
8. Capability Token
9. Execution Governance Kernel
10. Runtime Dispatch

No direct execution is considered valid when the action requires governance,
policy, risk, audit, token, or human approval.

## Active Runtime Surfaces

| Layer | Mount | Priority |
| --- | --- | --- |
| Organizational Federation Kernel | `/api/federation/organizational-kernel` | 290 |
| Domain Contract Fabric | `/api/governance/domain-contract-fabric` | 285 |
| Governance Graph Engine | `/api/governance/graph-engine` | 280 |
| Policy Enforcement Point | `/api/governance/pep` | 270 |
| Policy Decision Point | `/api/governance/pdp` | 260 |
| Unified Governance Bus | `/api/governance/bus` | 250 |
| Capability Token Engine | `/api/governance/capability-tokens` | 240 |
| Risk Classification Engine | `/api/governance/risk-engine` | 218 |
| Audit Ledger | `/api/governance/audit-ledger` | 217 |
| Policy Compiler | `/api/governance/policy-compiler` | 210 |
| Capability Execution Registry | `/api/governance/capability-execution-registry` | 205 |
| Execution Governance Kernel | `/api/governance/execution-kernel` | 200 |
| Governance Enforcement Engine | `/api/governance/enforcement-engine` | 190 |
| Organization System of Systems | `/api/organization/sheikha` | 180 |
| Unified Capability Registry | `/api/governance/capability-registry` | 179 |

## Federation Nodes

The organizational federation kernel recognizes these nodes:

- governance
- markets
- metals
- supply_chain
- ai
- datacenter
- research
- licensing
- standards
- certification
- advisory
- organizations

Each node must have a boundary, a governance path, auditable evidence, and a
federation contract before being treated as an execution surface.

## Capability Token Model

Capabilities are tokenized before controlled execution. Tokens require:

- Signed token
- Registered capability
- Policy validation
- Risk validation
- Audit binding
- Expiry
- Revocation support

Supported token scopes include runtime execution, federation, advisory
execution, market infrastructure, governance execution, AI execution,
datacenter control, cluster orchestration, and policy management.

## Unified Governance Bus

The governance bus is the single path before execution. Its role is to route
intents through the policy compiler, registries, PDP, PEP, risk engine, audit
ledger, capability token engine, execution governance kernel, and runtime
dispatch.

The invariant is:

`no_direct_execution = true`

## Operational Verification

Minimum checks after changing this architecture:

```bash
node --check server.js
npm run lint
pm2 restart ecosystem.config.js --update-env
pm2 save
curl -s http://127.0.0.1:8080/api/federation/organizational-kernel/status | jq
curl -s http://127.0.0.1:8080/api/governance/bus/status | jq
curl -s http://127.0.0.1:8080/api/governance/capability-tokens/status | jq
curl -s http://127.0.0.1:8080/api/runtime/introspection/routes | jq '.success,.total'
```

## Architectural Invariant

SHEIKHA is unified as:

`Federated Organizational Runtime Architecture`

Not merely:

`Express Project`

The runtime must remain governed, auditable, reversible, bounded, and truthful
across organizations, systems, domains, policies, capabilities, markets,
advisory layers, AI layers, and execution surfaces.
