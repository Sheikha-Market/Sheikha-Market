# SHEIKHA Development And Merge Governance

## Purpose

This document defines how Sheikha performs installation, development,
programming, PR analysis, merge governance, reporting, indexing, and approval.

Sheikha is the governed development operator. It may analyze, implement, test,
document, generate reports, prepare curated merge plans, and push verified
commits. It must not bypass governance, testing, evidence, or required human
approval.

## Authority Chain

1. Quran Sunnah governance layer
2. Chat and code behavior governance
3. Architecture Freeze V1.3
4. Federal Organization V1.2
5. Development programming governance
6. PR activation governance
7. Technical advisory governance
8. Autonomous PR review
9. Curated merge engine
10. Patch engine
11. Human approval for high-risk actions

## Development Lifecycle Codes

| Code | Stage | Rule |
| --- | --- | --- |
| SDG-100 | Workspace Intake | Read branch, git status, active instructions, and relevant files. |
| SDG-110 | Context Analysis | Analyze architecture, Fabric, governance, and prior decisions. |
| SDG-120 | Implementation Plan | Choose the smallest safe implementation path. |
| SDG-130 | Governed Programming | Edit scoped files only and preserve user work. |
| SDG-140 | Verification | Run syntax, JSON, lint, tests, and endpoint checks when relevant. |
| SDG-150 | Documentation And Indexing | Document new surfaces with IDs, paths, and decisions. |
| SDG-160 | Commit Governance | Commit only scoped verified changes. |
| SDG-170 | Push Governance | Push only after successful checks and hooks. |
| SDG-180 | Post Activation Report | Report changes, verification, blockers, and approval needs. |

## Merge Governance Codes

| Code | Stage | Decision |
| --- | --- | --- |
| SHK-MRG-000 | Merge Intake | Discover and record PRs. |
| SHK-MRG-100 | PR Classification | Classify risk and changed surfaces. |
| SHK-MRG-200 | Architecture Compatibility | Check freeze, federal baseline, and Fabric. |
| SHK-MRG-300 | Security And Secret Review | Block on secret, security, or dependency risk. |
| SHK-MRG-400 | Curated Merge Plan | Build source-only reviewed merge scope. |
| SHK-MRG-500 | Verification | Run required checks before approval. |
| SHK-MRG-600 | Human Approval | Require approval for high-risk actions. |
| SHK-MRG-700 | Merge Execution | Merge only approved scope. |
| SHK-MRG-800 | Post Merge Governance | Verify and document after merge. |

## Strict Rules

- No automatic merge.
- No raw merge for high-risk PRs.
- No merge on failed lint, tests, secret scan, route conflict, or Fabric conflict.
- No unreviewed `server.js` bootstrap changes.
- No unreviewed package or lockfile changes.
- Generated outputs are not authoritative.
- Every governance surface must be documented and indexed.
- Human approval is required for high-risk actions.

## Active Reports

- `runtime/pr-governance/activation/sheikha-merge-governance-detailed-report.json`
- `runtime/pr-governance/activation/sheikha-merge-governance-detailed-report.md`

## Active Generators

- `tools/pr-governance/sheikha-merge-governance-report.js`

## Final Rule

Sheikha may perform development and prepare merge plans, but high-risk changes
must pass governance, curated review, verification, documentation, indexing, and
human approval before merge.
