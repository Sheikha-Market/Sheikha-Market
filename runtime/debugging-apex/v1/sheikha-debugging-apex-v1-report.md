# SHEIKHA DEBUGGING APEX V1

- Status: ACTIVE
- Decision: DEBUGGING_APEX_V1_ACTIVE_100
- Level: HIGHEST_GOVERNED_DEBUGGING_AND_DIAGNOSTICS_LAYER

## Workflow

1. capture-user-debug-intent
2. collect-read-only-workspace-git-and-diagnostics
3. inspect-runtime-health-ports-and-pm2
4. correlate-log-intelligence-and-inspector-findings
5. classify-risk-and-blast-radius
6. propose-minimal-safe-patch
7. run-tests-lint-and-self-governance
8. record-evidence-and-no-drift

## Policies

- readOnlyFirst: true
- noAutoDeletion: true
- noSecretExposure: true
- noDestructiveGit: true
- patchOnlyWithEvidence: true
- humanApprovalForHighImpactActions: true
- inspectorPrintedOnlyWhenExplicitlyRequested: true
- selfGovernanceRequiredBeforeReady: true

Debugging Apex is a governed diagnostics and repair-planning layer. It does not perform destructive actions without human approval.
