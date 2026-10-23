# Clean Build Recovery: Dammam and Hostinger

Review recorded on 2026-10-23. This is a local build verification, not a production release.
The requested Google Cloud destination is Dammam (`me-central2`), with Hostinger
remaining part of the hybrid architecture. No automatic fallback to another region.

## Diagnosis and Changes

- Live Cloud Build read confirmed build `a22f83bf-75b6-4ad9-a145-b69a8f1fff73`
  already succeeded and pushed to `us-central1`. That historical success does not
  prove runtime readiness and is not a new deployment destination.
- The default compute service account already has `roles/artifactregistry.writer`.
  No additional IAM grants were made.
- The pasted failure omitted `tools/sheikha-language-platform/` from its context.
  The existing bounded context tool retains `tools` and `runtime` code and follows
  entrypoint-reachable literal relative imports without executing application modules.
- Repaired `.gcloudignore` and `.dockerignore`: explicit application roots, private
  and generated data exclusions, no malformed paste placeholders. Root deployment
  artifacts are excluded without removing operational `core/distribution`,
  `runtime/distribution`, or `tools/distribution` code.
- Added explicit required JSON assets for the dynamic language registry and the
  three optional status routers. Missing required assets block staging. They are
  secret-scanned and hashed like other source inputs; saved reports are not live
  engine activation or proof of AGI capability.
- The scanner exempts only the exact public naming prefixes `shk_` and `nafath_`,
  never complete values starting with them. Confidential intellectual-property
  directories are excluded even if a caller weakens its local policy.
- Removed hardcoded virtual-account passwords and the credential response from
  `server.js`. Test accounts are disabled by default and always disabled in
  production. Non-production use requires explicit opt-in and two distinct
  environment-supplied passwords of at least 16 characters. No default passwords
  are substituted or returned by the API.

## Verification

The tested snapshot is `/tmp/SHEIKHA_CLOUD_CONTEXT_V1_3st8v7ad`:

- 2,880 source files, 75,610,730 bytes; 1,024 literal relative imports resolved.
- Actual `gcloud meta list-files-for-upload`: 2,881 files including the manifest,
  76,523,320 bytes (about 73 MiB); zero source files dropped or unexpected files.
- Local container `localhost/sheikha-main-portal:context-repair-final-20261023`
  built successfully. Container contents matched all source SHA-256 hashes.
- `/api/health` returned HTTP 200 with `success: true` and `data.status: ok`.
  Sixteen saved-report endpoints returned HTTP 200. Virtual-account GET and login
  POST returned HTTP 404 in production, including with explicit test opt-in.
- No missing-module errors were observed during this smoke run. Cron and model
  boot were disabled; the container had no external network, host mounts, or
  host credentials. Test secrets were generated inside the disposable container.
  No host port was exposed. The container exited and was removed after testing.
- 36 focused tests passed: context 16, virtual accounts 8, optional status routes 12.
  The HTTP tests initially hit sandbox `listen EPERM`; the approved rerun passed.
  The entire repository test suite was not run.

Machine-readable results and exact hashes:
`runtime/cloud-build-recovery-verification/2026-10-23.json`.

## Repeat Locally

```bash
python3 -I -B tests/test_sheikha_cloud_build_context.py
node tests/sheikha-virtual-test-accounts.test.cjs
node tests/sheikha-optional-ai-status-routes.test.cjs
python3 -I -B tools/production/sheikha-cloud-build-context-v1.py --stage --staging-root /tmp
```

Use the newly returned staging directory for builds. `/tmp` is temporary; rebuild
the context before any future release and recheck its upload list and manifest.
Do not run an upload directly from the repository: the pre-existing broken
`node -> /usr/local/bin/node` symlink still crashes this gcloud version before
ignore filtering. It was preserved, not deleted or retargeted.

The verification script `tools/verification/sheikha-container-boot-smoke.cjs`
must run via stdin in a disposable container with `--network=none`; it refuses
ordinary host execution. Its final revision was passed through stdin, rather
than claiming the earlier snapshot's embedded verification script was modified.

## Deployment Holds

- Artifact Registry returned no repositories in `me-central2` for this project.
- Cloud Run listing in `me-central2` failed with `LOCATION_POLICY_VIOLATED` and
  an unavailable-region message. This is distinct from the resolved upload IAM
  issue. No organization policy, billing account, region, or resource was changed.
- Google's [Dammam access documentation](https://docs.cloud.google.com/docs/dammam-region-access)
  describes separate eligibility/billing requirements. For a KSA billing address
  it specifies access through CNTXT; for a non-KSA billing address it specifies
  invoiced billing. The account's billing arrangement was not inspected, so this
  review does not attribute the denial to a particular billing configuration.
- Hostinger's read-only `hosting_websites_list` request filtered to `sheikha`
  timed out after 300 seconds. No target website or deployment state was verified.
- The final dependency layer's npm output reported 29 advisories: 17 moderate,
  11 high, 1 critical. No forced dependency upgrade or full advisory triage was
  performed. A successful build is not a security approval.
- New-spend budget remains unspecified. No new Cloud Build submission, cloud
  push, Cloud Run deployment, DNS update, Hostinger overwrite, or regional resource
  creation was performed. Regional access, target readiness, dependency review,
  and explicit release/spend approval remain necessary before publication.

Existing and concurrent worktree changes were preserved. These observations
apply to the named snapshot, not to every later revision of the shared project.
