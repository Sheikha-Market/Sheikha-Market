# OPERATING MODEL

## Objective

Define how teams, systems, and release gates operate to deliver stable, governed, and scalable platform execution.

## Team Structure

1. Governance Office

- Owns policy, risk acceptance, and production gates.

1. Platform Engineering

- Owns control plane, CI/CD, and deployment standards.

1. Data Engineering

- Owns data contracts, quality, and lifecycle controls.

1. AI and Automation

- Owns model operations, evaluation, and safe autonomy.

1. SRE and Operations

- Owns reliability, incident response, and recovery flows.

1. Security and Compliance

- Owns identity, secrets, and audit conformance.

## RACI Summary

- Policy approval: Governance Office (A)
- Deployment pipeline changes: Platform (A), Security (C)
- Runtime incident handling: SRE (A), Platform (C)
- Data schema changes: Data Team (A), Governance (C)
- AI policy threshold changes: AI Team (A), Governance (A)

## Release Gates

1. Safety gate

- Critical health endpoints are green.

1. Governance gate

- Governance status passes and no blocked policy.

1. Security gate

- No exposed secrets, no high-risk unresolved findings.

1. Runtime gate

- PM2 online, canonical runtime path, no restart storm.

1. Data gate

- Backup readiness and integrity checks pass.

## Change Management

- Small, traceable changes by default.
- Every high-impact change includes rollback plan.
- Production changes require gate evidence.

## Incident Management

1. Detect

- Monitoring alert or failed endpoint probe.

1. Triage

- Classify impact and scope.

1. Mitigate

- Controlled restart, route fallback, or policy freeze.

1. Recover

- Validate all critical endpoints.

1. Review

- Post-incident report with corrective actions.

## Daily Operations Checklist

- Check /api/health and /api/governance/status
- Check DNS and DBus status endpoints
- Verify PM2 status for core process
- Verify working tree cleanliness in production runtime

## Weekly Governance Review

- SLO performance
- Failed deployments and root causes
- Policy exceptions and approvals
- Cost and capacity trends
