# Sheikha Cloud Production Deployment Apex V1

SHEIKHA_CLOUD_PRODUCTION_DEPLOYMENT_APEX_V1 converts cloud deployment proposals into a governed, evidence-first production readiness layer.

It does not execute `sudo`, `gcloud`, `certbot`, Docker, or remote provisioning commands. It produces plans, templates, gates, and evidence requirements.

## Why This Is Safer Than Direct Deployment Scripts

- No inline `.env` secrets.
- No fake production claim without runtime health evidence.
- No cloud spend without budget approval.
- No TLS issuance without domain ownership.
- No provider partnership or contract claim without signed evidence.
- No high-impact action without human approval.

## Routes

- `GET /api/sheikha/cloud-production-deployment-apex/v1/status`
- `GET /api/sheikha/cloud-production-deployment-apex/v1/plan`
- `GET /api/sheikha/cloud-production-deployment-apex/v1/gcp-readiness`
- `GET /api/sheikha/cloud-production-deployment-apex/v1/nginx-template`

## Required Evidence Before Real Production Claim

1. Tests and lint passed.
2. Governance and drift reviewed.
3. Domain ownership verified.
4. Secrets stored in a secret manager.
5. Budget and billing guard approved.
6. Deployment record and rollback plan exist.
7. Health, streaming, and security smoke tests passed.

## Principle

No harm, no damage. Deployment is a governed human-approved act, not an automatic side effect.
