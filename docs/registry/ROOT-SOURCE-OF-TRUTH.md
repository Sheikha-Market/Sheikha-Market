# Sheikha Root Source Of Truth

Canonical authority registry for all Sheikha systems.

## Principles

- One canonical source per subsystem.
- No duplicated governance.
- No duplicated architecture.
- No duplicated runtime logic.
- No duplicated dashboard ownership.
- No duplicated AI orchestration.
- No duplicated deployment blueprint.
- Human review is required before structural changes.
- Agents must consult this registry before creating new architecture, route, dashboard, runtime, deployment, security, neural, or governance files.

## Canonical Runtime

`docs/runtime/`

## Canonical Architecture

`docs/architecture/`

## Canonical Governance

`docs/governance/`

## Canonical Registry

`docs/registry/`

## Canonical Neural Systems

`core/neural/`

## Canonical Runtime Systems

`core/runtime/`

## Canonical Orchestration

`core/orchestration/`

## Canonical APIs

- `routes/`
- `server.js`

## Canonical Dashboard

- `routes/dashboard.js`
- `public/`

## Canonical Deployment

- `ecosystem.config.js`
- `docs/registry/deployment/`

## Forbidden Duplicate Sources

- `Sheikha-Market/sheikha-main-portal/*`
- `exports/*`
- `public/_archive/*`
- `infra/docker/compose/prod/Sheikha-Market/*`
- `repos/git-sheikha/*`

## Guard

`tools/sheikha-blueprint-guard.js` is the executable gate before commit, deploy, and PM2 restart paths.

Guard stages:

- `audit`: scan and report backlog without blocking.
- `precommit`: block changed staged duplicate or non-canonical sources.
- `preflight`: block changed duplicate or non-canonical sources before restart/deploy.
- `strict`: block all unresolved duplicate backlog.

## Governance

Unified for Allah, governed by Quran and Sunnah, with truthfulness, no fraud, no riba, no harm, no deception, no false claims, and human authority before any impactful action.
