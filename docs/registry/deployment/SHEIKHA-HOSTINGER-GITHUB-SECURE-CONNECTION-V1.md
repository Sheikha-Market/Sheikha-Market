# SHEIKHA Hostinger And GitHub Secure Connection V1

## Purpose

This document saves the secure continuation point for connecting Hostinger to
GitHub for Sheikha production deployment.

It is stronger than a simple connection note because it separates identity,
repository access, branch governance, secrets, CI/CD gates, rollback, and
evidence required before any production claim.

## Saved Continuation Point

Date: 2026-06-29

Machine-readable record:

- `docs/registry/deployment/SHEIKHA-HOSTINGER-GITHUB-SECURE-CONNECTION-V1.json`

Current continuation request:

> Continue production setup from the Hostinger and GitHub connection, using the
> production repository `Sheikha-top/sheikha-enterprise-portal`, with secure
> least-privilege access and separation between development and production.

## Confirmed Context From The User

- Hostinger connection to GitHub has been completed in the browser flow.
- Repository access should use `Only select repositories`, not `All repositories`.
- The selected production repository is:
  - `Sheikha-top/sheikha-enterprise-portal`
- Development repositories, including Sheikha Market work, must not be granted
  production deployment authority by default.
- Hostinger is treated as a production deployment surface, not as an internal
  development authority.

## Security Decision

The approved secure pattern is:

```text
Local Development
  -> Development Repository / Feature Branches
  -> Pull Request
  -> Protected Production Branch
  -> Required Checks
  -> GitHub Deployment Environment
  -> Hostinger Deployment
  -> Production Runtime Verification
```

This means Hostinger receives only the repository access required for deployment
and does not receive broad organization-wide repository access.

## Required GitHub App Scope

Use this policy for the Hostinger GitHub App:

| Control | Required State |
| --- | --- |
| Repository access | `Only select repositories` |
| Selected repository | `Sheikha-top/sheikha-enterprise-portal` |
| All repositories | Not allowed for production |
| Development repositories | Excluded unless explicitly approved |
| Secrets in repository | Not allowed |
| Production branch writes | Protected by review and checks |

If `All repositories` was used before, rotate any deployment secrets that may
have been exposed to a broader trust boundary.

## Production Branch Protection

The production branch should be protected before Hostinger deployment is treated
as complete.

Required controls:

1. Require pull request before merge.
2. Require at least one human approval.
3. Require status checks to pass.
4. Require branch to be up to date before merge when feasible.
5. Block force push.
6. Block branch deletion.
7. Restrict direct pushes to production branch.
8. Require signed commits or verified provenance when the repository policy
   supports it.
9. Require conversation resolution before merge.
10. Keep administrators included unless an emergency break-glass policy exists.

## GitHub Actions And Environment Gates

Before Hostinger deploys production, the pipeline should have these gates:

| Gate | Purpose |
| --- | --- |
| Install | Reproduce dependency tree |
| Lint | Catch style and runtime quality defects |
| Unit tests | Catch functional regressions |
| Build | Confirm deployable artifact |
| Secret scan | Prevent leaked tokens |
| Dependency audit | Surface vulnerable packages |
| Runtime smoke test | Confirm app boot and health route |
| Deployment approval | Human approval before production |

Use a GitHub Environment named `production` for:

- production-only secrets,
- deployment approval,
- deployment history,
- environment URL,
- rollback notes.

## Hostinger Configuration

Hostinger should be configured as a deployment target with limited authority.

Required Hostinger setup:

1. Connect only to `Sheikha-top/sheikha-enterprise-portal`.
2. Select the approved production branch, normally `main` or a dedicated
   production branch such as `production`.
3. Set the application root and build command explicitly.
4. Store environment variables in Hostinger's environment or secret interface,
   not in Git.
5. Enable HTTPS/TLS for `sheikha.top`.
6. Keep deployment logs available for audit.
7. Test rollback before the first public launch.
8. Document who can trigger deploys and who can change deployment settings.

## Secrets Policy

Never commit these to the repository:

- API keys.
- Database URLs.
- OAuth client secrets.
- Hostinger tokens.
- GitHub tokens.
- Private SSH keys.
- `.env` production files.

Required secret controls:

- Store production secrets in Hostinger or GitHub Environment secrets.
- Use separate development and production secrets.
- Rotate secrets after changing repository access scope.
- Do not reuse personal tokens for production.
- Prefer short-lived or environment-scoped credentials where supported.

## Development And Production Separation

The separation rule is:

```text
Sheikha-Market / development work
  !=
Sheikha-top / production deployment authority
```

Development may prepare changes, but production requires:

- PR review,
- passing checks,
- explicit promotion,
- deployment evidence,
- production health verification.

## Evidence Required Before Saying Production Is Live

Do not claim production is fully live until the following evidence exists:

1. Hostinger GitHub App access is limited to the production repository.
2. Production branch protection is enabled.
3. CI checks pass on the production branch.
4. Hostinger deployment succeeds from the approved branch.
5. `sheikha.top` resolves to the intended deployment.
6. HTTPS certificate is active and valid.
7. Production health endpoint returns OK.
8. No production secrets are present in Git.
9. Rollback procedure is documented and tested.
10. Deployment record is saved with timestamp and commit SHA.

## Root Risks And Mitigations

| Risk | Root Cause | Consequence | Mitigation |
| --- | --- | --- | --- |
| Hostinger sees too many repositories | `All repositories` access | Broad blast radius if connector is compromised | Use `Only select repositories` |
| Direct production push | Missing branch protection | Untested code reaches production | Require PR and status checks |
| Secret leakage | `.env` or token committed | Account or data compromise | Secret scan and environment secrets |
| Wrong repository deployed | Similar repo names | Production runs stale or wrong code | Pin repository and branch in Hostinger |
| Broken deployment | No build/test gate | Site outage | CI build plus smoke tests |
| Unclear rollback | No deployment record | Slow recovery | Save deployment SHA and rollback steps |
| Development/production mixing | Shared authority | Accidental production mutation | Separate repos, branches, secrets, and approvals |

## Recommended Next Execution Order

1. Confirm Hostinger GitHub App is saved with `Only select repositories`.
2. Confirm only `Sheikha-top/sheikha-enterprise-portal` is selected.
3. Enable branch protection on the production branch.
4. Add or verify GitHub Actions checks.
5. Configure production environment secrets.
6. Configure Hostinger deployment branch and build settings.
7. Deploy a controlled build.
8. Verify `sheikha.top` health, TLS, logs, and rollback.
9. Save the deployment evidence.
10. Promote the deployment status from `CONNECTED` to `PRODUCTION_VERIFIED`.

## Current Status

Status: `CONNECTED_PENDING_PRODUCTION_VERIFICATION`

This means the connection is accepted as a secure starting point, but production
must still be verified with branch protection, checks, deployment evidence, TLS,
health, and rollback.

## Continuation Prompt

Use this in the next conversation:

> Continue Sheikha production setup from
> `docs/registry/deployment/SHEIKHA-HOSTINGER-GITHUB-SECURE-CONNECTION-V1.md`.
> Hostinger is connected to GitHub with least-privilege repository access.
> Complete production verification for
> `Sheikha-top/sheikha-enterprise-portal`, including protected branch, CI checks,
> environment secrets, Hostinger deployment settings, TLS, health check,
> rollback, and deployment evidence.
