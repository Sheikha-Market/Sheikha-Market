# Sheikha Enforcement Governed Production Promotion Workflow V1

This component converts exact local human approval and verified operational evidence into a deterministic promotion plan.

It does not execute commands, connect to production, create releases, switch links, restart services, install packages, or perform cleanup.

## Boundaries

- Authority: `HUMAN_ONLY`
- Execution boundary: `CONTROLLED_LOCAL_PRODUCTION_PROMOTION_WORKFLOW`
- HTTP approval: denied
- External approval fields: denied
- Separate reviewed executor: required
- Failure mode: `SAFE_HOLD`

## Required evidence

The workflow requires an exact candidate commit, payload SHA-256, local approval-record path and SHA-256, normalized scope, verified baseline, verified operational assurance, no operational drift, zero critical failures, healthy current state, rollback readiness, and explicit denial of package installation, cleanup, and service restart.

A session approval record is technical evidence of a human session acknowledgement. It is not cryptographic identity proof or a legal instrument.

## Plan phases

1. Verify local evidence.
2. Verify exact scope.
3. Materialize the proposed release.
4. Verify the proposed release.
5. Switch the current link.
6. Verify the PM2 process is unchanged.
7. Verify post-promotion health.
8. Preserve rollback releases.

Every phase is emitted with `executionPerformed: false`.

## Preparation basis

The verified scope inspection recorded 213 deployment-entrypoint candidates, 152 workflow candidates, 2 dirty-overlap candidates, and no existing external Enforcement references. The component is therefore prepared in an independent worktree without modifying the dirty main worktree.

## Governance

Reference: الكتاب والسنة

Rule: لا ضرر ولا ضرار
