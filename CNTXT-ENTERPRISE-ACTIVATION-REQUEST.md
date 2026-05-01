# CNTXT Enterprise Activation Request

- Date: 2026-03-09T21:24:47.480Z
- Requester: Salman Ahmed Al-Rajih (market@sheikha.top)
- Organization: 224557279528

## Request
Please activate institutional Google Cloud setup for Sheikha with no personal card requirement.

## Projects
- Production: sheikha-empire
- Development: sheikha-core
- Testing: sheikha-test

## Required Actions
- Link sheikha-empire to institutional billing account (no personal card)
- Enable required Google Cloud APIs for production and development
- Grant operator IAM roles to user:market@sheikha.top
- Confirm org-level policy alignment and regional constraints
- Provide activation confirmation and support case reference

## Required APIs
- aiplatform.googleapis.com
- run.googleapis.com
- bigquery.googleapis.com
- storage.googleapis.com
- cloudfunctions.googleapis.com
- monitoring.googleapis.com
- iam.googleapis.com
- serviceusage.googleapis.com

## Operator Principal
- user:market@sheikha.top

## Operator IAM Roles
- roles/viewer
- roles/serviceusage.serviceUsageAdmin
- roles/run.admin
- roles/aiplatform.user
- roles/bigquery.jobUser
- roles/storage.objectAdmin
- roles/cloudfunctions.developer

## Compliance Controls
- No Harm: Enabled
- Least Privilege: Enabled
- Transparency: Enabled
- Auditability: Enabled

## Acceptance Criteria
- sheikha-empire linked to institutional billing account
- APIs enabled on production and development projects
- IAM roles applied to operator principal
- Written confirmation with support case ID
