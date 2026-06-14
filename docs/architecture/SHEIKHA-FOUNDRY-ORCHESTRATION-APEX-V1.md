# Sheikha Foundry Orchestration Apex V1

The highest operational control plane is a governed twin apex:

1. `SHEIKHA_FOUNDRY_V3` reviews capability construction, evolution, testing, SDK/MCP integration, and release evidence.
2. `SHEIKHA_SUPREME_ORCHESTRATOR_V1` creates the routing and execution envelope.
3. `SHEIKHA_CONVERSATION_LAYER_STACK_V1` remains the runtime substrate at L1-L8.

Execution order:

`Governance Admission -> Foundry V3 Review -> Supreme Orchestrator -> Runtime L1-L8 -> Evidence`

The apex cannot bypass governance, authorize destructive work, claim unavailable capabilities, or perform writes without explicit human approval.

Endpoints:

- `GET /api/sheikha/apex-control-plane/v1/status`
- `POST /api/sheikha/apex-control-plane/v1/plan`
