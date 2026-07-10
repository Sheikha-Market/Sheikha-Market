# SHEIKHA Universal Benefit and Boundary Governance Fabric V1

System: `SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1`

Arabic name: منظومة شيخة الشاملة لتحويل القدرات والحدود إلى الخير والنفع العام V1.

## Purpose

The fabric evaluates registered capabilities before governed routing. It turns a boundary into an approval request, evidence plan, sandbox, simulation, accessible format, local-first mode, recovery path, or qualified human handoff. A boundary is never treated as permission to bypass security, safety, law, privacy, rights, or ownership.

Decision states:

- `ALLOW`: verified as within the stated evaluation boundary; it does not grant execution authorization.
- `REVIEW`: evidence, permission, specialist review, or accountable human approval remains necessary.
- `SANDBOX`: only an isolated, simulated, read-only, local-first, or low-impact path is acceptable.
- `DENY`: the requested action is prohibited, unauthorized, or beyond the registered boundary.

## Architecture

The implementation reuses the existing public-benefit router, evidence registry, L24 reasoning profiles, governance kernel conventions, truth gates, defensive-awareness policy, distribution fabric, and master catalog. It adds one coordination plane and does not replace those systems.

The Arabic DSL contract is located at:

`sheikha-language/governance/sheikha-universal-benefit-boundary-v1.shk`

Its core vocabulary is: `قدرة`, `حد`, `إذن`, `دليل`, `منفعة`, `ضرر`, `تخفيف`, `موافقة`, `بديل آمن`, `قرار`, and `تدقيق`.

## API

- `GET /api/governance/universal-benefit/status`
- `POST /api/governance/universal-benefit/evaluate`
- `POST /api/governance/universal-benefit/transform-boundary`
- `GET /api/governance/universal-benefit/capabilities`
- `GET /api/governance/universal-benefit/evidence`

Example:

```json
{
  "capabilityId": "SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE",
  "purpose": "تقديم معرفة عامة قابلة للتحقق",
  "beneficiaries": ["PUBLIC"],
  "evidence": [
    {
      "evidenceId": "test-123",
      "source": "verified-test",
      "verified": true
    }
  ],
  "reasoningMode": "standard"
}
```

## Runtime Boundaries

- Standard, Pro, and Ultra produce bounded analysis only and do not escalate permission.
- L24 has no Ring 0, kernel, firmware, physical, external-write, or bare-metal authority.
- High-impact actions require accountable human review.
- Defensive security is authorization-scoped and sandboxed.
- Runtime API evaluation writes no external system and grants no authorization.
- Every evaluation returns `executionAllowed: false` and `decisionGrantsAuthorization: false`.
- Runtime audit records are bounded, in-memory metadata without sensitive request payloads.
- Benefit indicators are reviewable operational signals, not absolute moral judgments.

## Commands

```bash
npm run -s ops:universal-benefit:activate:v1
npm run -s ops:universal-benefit:verify:v1
npm run -s ops:universal-benefit:status:v1
npm run -s ops:universal-benefit:test:v1
```
