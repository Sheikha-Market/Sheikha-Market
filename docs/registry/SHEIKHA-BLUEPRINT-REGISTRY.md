# SHEIKHA BLUEPRINT REGISTRY

## Status
ACTIVE

## Canonical Root
~/Projects/sheikha/sheikha-main-portal

## Runtime-Allowed Canonical Paths
- docs/architecture
- docs/architecture/blueprints
- core/runtime
- core/governance
- core/neural
- core/orchestration
- routes
- server.js

## Audit-Only Paths
- docs/architecture/blueprints/auto
- reports
- exports
- public/_archive

## Non-Canonical Roots
- Sheikha-Market
- exports
- repos/git-sheikha
- public/_archive
- infra/docker/compose/prod/Sheikha-Market

## Rule
Any blueprint outside canonical paths:
- must not execute
- must not load into Runtime
- must not become Source Of Truth
- must remain audit/reference only until human review

## Runtime Policy
Runtime loaders must ignore:
- docs/architecture/blueprints/auto
- exports
- mirrors
- nested repositories
- archived dashboards

## Canonical Runtime Loader
- Module: `core/runtime/governance/sheikha-canonical-runtime-loader.js`
- API: `GET /api/runtime-root/canonical-runtime/status`
- API: `POST /api/runtime-root/canonical-runtime/evaluate-path`

## Runtime Guarantees
- duplicateRuntimeLoading: false
- autoBlueprintRuntimeLoading: false
- nestedRepoExecution: false
- recursiveScannerRuntimeLoading: false
- human review before any new runtime authority
