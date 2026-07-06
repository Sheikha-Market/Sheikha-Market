# SHEIKHA Runtime Fabric V5

`SHEIKHA_RUNTIME_FABRIC_V5` is the governed operational fabric below
`SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11`. The Global Control Plane remains the
management and federation plane; it does not bypass the operational orchestrator.

## Execution order

1. Trusted identity
2. Policy Enforcement Point
3. Governance admission
4. Orchestrator Fabric L11
5. SDK/MCP capability resolution
6. Durable event log
7. Durable local queue
8. Registered bounded worker
9. Pipeline evidence
10. Audit and observability

## Operational components

- Service registry with explicit service identities
- In-process event bus with a durable event log
- Atomic JSON queue for one-node operation
- Registered worker handlers; arbitrary code execution is not supported
- Explicit governed scheduler tick
- Runtime metrics, queue depth, audit evidence, and dead letters
- Enterprise Inspector integration

## API

- `GET /api/sheikha/runtime-fabric/v5/status`
- `GET /api/sheikha/runtime-fabric/v5/services`
- `GET /api/sheikha/runtime-fabric/v5/events`
- `GET /api/sheikha/runtime-fabric/v5/queue`
- `GET /api/sheikha/runtime-fabric/v5/schedules`
- `GET /api/sheikha/runtime-fabric/v5/metrics`
- `GET /api/sheikha/runtime-fabric/v5/cluster`
- `GET /api/sheikha/runtime-fabric/v5/audit`
- `POST /api/sheikha/runtime-fabric/v5/issues`
- `POST /api/sheikha/runtime-fabric/v5/workers/drain`
- `POST /api/sheikha/runtime-fabric/v5/schedules`
- `POST /api/sheikha/runtime-fabric/v5/scheduler/tick`

Detailed reads require a trusted identity or a scoped Sheikha API key. Supported key
scopes are `runtime:read`, `runtime:execute`, `runtime:schedule`, and `runtime:audit`.
Writes additionally require human approval. Worker and scheduler operations require an
operational role.

## Truthful deployment boundary

The current implementation is operational on one host with atomic local persistence
and a cross-process file lock for local PM2 workers. It does not claim Redis,
Kubernetes, distributed consensus, multi-node failover, or a distributed queue.
Promotion requires a transactional shared store,
distributed queue, leader election, service discovery, mTLS, load tests, and failover
evidence.
