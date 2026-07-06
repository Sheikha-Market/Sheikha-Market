# SHEIKHA Civilization Stewardship Apex V1

This is the highest governed institutional stewardship layer in the current Sheikha
runtime. It sits above the Civilization Command Plane as a mandate, evidence, risk,
and human-ratification gate. It remains subordinate to the Master Life Cycle
constitutional reference and Civilization Governance authority.

## Governed hierarchy

1. `SHEIKHA_MASTER_LIFE_CYCLE_V1` - constitutional and lifecycle reference
2. `SHEIKHA_CIVILIZATION_GOVERNANCE_V2` - governance authority
3. `SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1` - institutional stewardship apex
4. `SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1` - command intelligence
5. `SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11` - operational admission
6. `SHEIKHA_RUNTIME_FABRIC_V5` - bounded execution

## Lifecycle

Mandate registration, evidence linking, risk review, explicit human ratification,
command-plane delegation, measurement, audit, improvement, and knowledge renewal.
Evidence must be marked as independently verified by a human reviewer before a
mandate can become ready for ratification; source-declared evidence remains pending.

The apex never dispatches execution directly. Ratification creates a governed draft
plan in the Civilization Command Plane, where evaluation and bounded runtime dispatch
remain separate controlled actions.

## API

- `GET /api/sheikha/civilization-stewardship/v1/status`
- `GET /api/sheikha/civilization-stewardship/v1/dashboard`
- `GET /api/sheikha/civilization-stewardship/v1/registry`
- `GET /api/sheikha/civilization-stewardship/v1/audit`
- `POST /api/sheikha/civilization-stewardship/v1/mandates`
- `POST /api/sheikha/civilization-stewardship/v1/mandates/:mandateId/evidence`
- `POST /api/sheikha/civilization-stewardship/v1/mandates/:mandateId/review`
- `POST /api/sheikha/civilization-stewardship/v1/mandates/:mandateId/ratify`

Scopes are `stewardship:read`, `stewardship:write`, `stewardship:ratify`, and
`stewardship:audit`. Every mutation requires a trusted identity, an approved role,
and explicit human approval.

## Truthful boundary

The layer is operational on one host with atomic JSON persistence and an audit log.
Distributed transactions, multi-region consensus, autonomous final authority,
religious authority, and external governmental or regulatory authority are not
connected or claimed.
