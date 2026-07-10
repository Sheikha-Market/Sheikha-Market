# SHEIKHA Boundary-to-Benefit Model V1

## State Model

`WITHIN_BOUNDARY` routes a verified request to the next authorization gate.

`AT_BOUNDARY` requests approval, evidence, isolation, minimization, budget control, accessibility adaptation, or specialist review.

`BEYOND_BOUNDARY` denies execution and returns a safe alternative.

No state grants permission escalation or an external write.

## Transformation Patterns

| Condition | Safe transformation |
| --- | --- |
| Missing permission | Scoped approval request |
| Missing evidence | `UNKNOWN` plus evidence collection plan |
| Elevated risk | Sandbox, simulation, or read-only mode |
| Personal data | Minimization, anonymization, and retention limit |
| Missing tool | Requirements report and alternative plan |
| Unsupported hardware | Emulation or compatibility adapter without native claim |
| Excess cost | Budget gate, optimizer, and small probe |
| No connection | Local-first and offline mode |
| Access barrier | Arabic, RTL, text, voice, CLI, API, or simplified UI |
| Probable harm | Stop, warn, recover, repair, report, and human handoff |
| Defensive security | Authorized scope, evidence preservation, and remediation |
| High-impact action | Accountable human and qualified-domain review |

## Evidence Rule

An unverified reference is not verified evidence. If required evidence is missing, the output is `REVIEW` with `evidenceStatus: UNKNOWN`; the fabric does not guess or relabel the result as verified.

## Execution Rule

The evaluation and transformation APIs are advisory governance gates. Even `ALLOW` returns `executionAllowed: false` and `decisionGrantsAuthorization: false`. A separate permissioned execution pipeline must validate identity, capability token, current policy, approval, rollback, and audit requirements before any actual action.
