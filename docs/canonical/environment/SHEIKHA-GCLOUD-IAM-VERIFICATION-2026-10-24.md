# Google Cloud IAM Verification

## Observed State

On 2026-10-24 at 01:19:03 +03, a read-only request successfully retrieved direct
project IAM bindings for the build account
`952025946298-compute@developer.gserviceaccount.com` in `sheikha-marketplace`.
The selected local gcloud account was `market@sheikha.top` and its configured
project matched. The following bindings were observed without conditions:

- `roles/artifactregistry.writer`
- `roles/iam.serviceAccountUser`
- `roles/logging.logWriter`
- `roles/run.admin`
- `roles/storage.admin`

The two roles requested in the attachment are already present. No role was granted
or removed, and no login or credential reconfiguration was performed. This proves
authentication and authorization for this project-policy read at that time, not
successful deployment or a general resolution of every authentication issue.
Inherited policies, deny policies, resource-specific bindings and effective build
permissions were not evaluated. The account actually selected by a future build
was not verified.

## Authentication Diagnosis

The pasted log combines an `ACCESS_TOKEN_TYPE_UNSUPPORTED` failure with a later
successful policy update. It does not establish a single continuing failure.
The read-only current probe succeeded, so another permission grant or forced login
is not indicated by this check.

Selected local checks found no configured access-token file, credential-file
override, service-account impersonation, disabled-credentials flag, Resource
Manager endpoint override or custom CA file. The raw access-token environment
variable was absent. Only presence flags were retained; no token, key, credential
file or raw diagnostic output was included in this record. This is a selected
configuration check, not an exhaustive audit of credential sources or proxies.

Google documents several CLI authentication sources with precedence rules; an
active account name alone does not establish which credential a request used.
See [gcloud authentication](https://docs.cloud.google.com/sdk/docs/authenticate)
and [configuration properties](https://docs.cloud.google.com/sdk/gcloud/reference/config/set).

The pasted commands also contain a backslash followed by whitespace. If copied
literally, this is not a valid Bash line continuation. This formatting defect is
separate from the reported token-type error. A repeatable read-only command avoids
line continuation entirely:

```bash
gcloud projects get-iam-policy sheikha-marketplace --flatten=bindings --filter='bindings.members:serviceAccount:952025946298-compute@developer.gserviceaccount.com' --format='table(bindings.role)' --quiet
```

If authentication fails again, inspect the effective credential source and use an
appropriate interactive login only when required. Do not paste access tokens or
keys into a conversation, and do not use additional IAM grants as a token repair.

## Remaining Reviews

The bindings above are project-wide. In particular, Service Account User scope
should be reviewed against the intended Cloud Run runtime identity; no scope was
changed during this task. Google's container-deployment guidance distinguishes
the deployer, Artifact Registry access and the runtime service account's `actAs`
permission. See [Cloud Run IAM roles](https://docs.cloud.google.com/run/docs/reference/iam/roles).

Both `cloudbuild.yaml` and `tools/runtime/cloudbuild-portal-v43.82.json` reference
`us-central1-docker.pkg.dev`. This does not match the user's requested Dammam
deployment locality. Dammam is `me-central2` in the official
[Cloud Run locations](https://docs.cloud.google.com/run/docs/locations).
An artifact hostname alone does not establish the deployed service or build
execution region. No live regional inventory was queried, and the existence of an
appropriate Dammam repository, build region and runtime service remains unverified.
These build files were not changed or submitted; no regional migration occurred.

The V43.90 script in the attachment is truncated. Its printed manifest declares
immutable audit logging, broad OS support and recovery seals, but those labels and
hashes do not verify the missing implementation. No external SQLite database,
manufacturing process, OS boot, evidence registry or physical device was modified.

## Evidence Limits

The structured observation is stored in
`runtime/cloud-build-recovery-verification/2026-10-24-gcloud-iam-readonly.json`.
It is an ordinary editable local record, not a signed or immutable audit log.
No build, upload, deployment, DNS change, IAM mutation or paid resource creation
was performed. Application code was unchanged; application tests were not rerun
for this documentation-only result. The observed bindings must be rechecked before
any later operation that depends on them.
