# Sheikha Foundation Computing Platform V1

This directory contains the V5 authorization-governance repair of the modular,
evidence-governed foundation platform, preserving the V4 Qur'an policy-mapping gate.

## Operating meaning of "living"

"Living governance" means continuously active, event-driven, versioned, evidence-backed governance.
It does not mean biological life, consciousness, sentience, a soul, or independent will.

## Supreme policy order

1. Qur'an
2. Authentic Sunnah
3. Documented verified derived policy
4. Applicable law, regulation, standard and contract
5. Authorized technical policy
6. Authorized execution
7. Post-execution evidence and review

AI is an analysis and tooling capability under governance. It is not a legislative authority, does not issue independent fatwa,
does not claim unseen knowledge, and does not present future prediction as fact.

## Core model

Every governed thing is wrapped by a Universal Governed Object (UGO) envelope and moves through:
Observe -> Classify -> Evaluate -> Decide -> Authorize -> Enforce -> Execute -> Evidence -> Measure -> Feedback -> Improve -> Recover.

The initial sidecar is read-only and binds to 127.0.0.1:8097. Write surfaces are intentionally absent from V1.

## V4 semantic integration repair

The living governance kernel is materially connected to the policy decision point, policy enforcement point,
authorization engine, governance event fabric, evidence/observability, Qur'an/Sunnah governance,
asset-rights governance, legal/standards registry and the Sharia source validator.

The Qur'an/Sunnah source catalog materializes 13 Qur'an canonical references and four Sunnah policy-reference
records. Sunnah records remain enforcement-ineligible until authoritative source metadata, grading/verification
and qualified review are supplied. No missing hadith metadata is invented.

The sidecar remains read-only. This repair adds only:

- `GET /api/governance/sharia-sources`
- `GET /api/governance/integration/status`

No write endpoint is introduced.

## Qur'an policy-mapping review gate

Canonical source verification and executable policy approval are distinct.
A Qur'an reference may be a verified canonical reference while the policy mapping that uses it remains unapproved.
Every Sharia-governed executable policy therefore requires a documented mapping review bound to policy ID/version,
source ID, mapping-statement hash, reviewer, review timestamp and review evidence.

Unverified Sunnah records remain ineligible for enforcement. Metadata is never invented.

The governance kernel also requires a bound evidence identifier or payload hash plus evidence source before creating
a governance event or evidence record. Synthetic decision-evidence placeholders are forbidden.

## V5 authorization-governance repair

High-impact execution derives its classification from governed object, policy, and action data; callers cannot
downgrade it. Authorization is bound to the exact object, action, and canonical scope. Single-use authorization
requires an atomic persistent claim in PostgreSQL and fails closed when its claim store is unavailable.

PostgreSQL schema changes are operator-applied only through the provisioner under an advisory transaction lock.
The idempotent `000_sheikha_schema_migrations_v1` bootstrap must be first so a pristine database creates its
immutable migration ledger before any ledger lookup. Runtime and startup DDL remain forbidden.
