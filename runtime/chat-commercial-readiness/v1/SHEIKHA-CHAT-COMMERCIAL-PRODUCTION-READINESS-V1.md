# Sheikha Chat Commercial Production Readiness V1

## Decision

Local status: `READY_FOR_CONTROLLED_LOCAL_OPERATIONS`

Public gateway artifact: `ACTIVE_ZERO_THIRD_PARTY_DEPENDENCIES`

Public activation status: `VERIFIED_GOVERNED_COMMERCIAL_AND_NON_COMMERCIAL_SCOPE`

The governed readiness path is operational and prevents unsupported compatibility
claims. It is approved for controlled local commercial pilots and non-commercial
internal operations. A dependency-free commercial gateway now isolates the public
chat surface from the monolith dependency graph. The gateway is active under PM2
on the production host and the exact chat endpoint is routed through nginx and TLS.

## Verified Response Path

`VS Code Extension -> POST /api/sheikha/live/chat/v1 -> SSE prelude -> governed model route -> token stream -> done`

The endpoint returned HTTP 200. The observed SSE order was `ack`, `meta`,
`heartbeat`, `token`, `model_wait`, additional `token` events, then `done`.

## Final Consecutive Measurements

| Run | First token | Total | Result |
| --- | ---: | ---: | --- |
| 1 | 12.869 ms | 13.894 ms | PASS |
| 2 | 6.140 ms | 7.079 ms | PASS |
| 3 | 5.609 ms | 6.562 ms | PASS |

All three runs returned the same 201-character governed answer with SHA-256
`68bb3463769b07289ef0f5b07be3b55c27e32ef8c421a483533eac3ce613401a`.
Each response contained `الحالة`, `الأدلة`, and `الحدود`, with no fallback,
unsupported broad compatibility claim, or secret material.

## Short-Burst Load

- Requests: 20.
- Concurrency: 5.
- Passed: 20/20.
- Failures: 0.
- Minimum: 1.256 ms.
- p50: 2.828 ms.
- p95: 9.007 ms.
- Maximum: 11.836 ms.
- Scope: loopback short burst; this is not an internet or soak test.

## Sustained Smoke

- Verification date: 2026-08-28.
- Duration: 60 seconds through the isolated gateway and backend.
- Interval: 2.5 seconds.
- Passed: 24/24.
- Failures: 0.
- Health before and after: PASS.
- p50: 28.716 ms.
- p95: 86.424 ms.
- Maximum: 100.384 ms.
- Scope: sustained operational smoke; this is not a formal soak or contractual
  SLA test.

## Recovery Smoke

- Scope: local isolated commercial gateway process restart under PM2.
- Health recovery: PASS in 2,599 ms.
- Complete governed response after recovery: PASS.
- PM2 process list saved: PASS.
- Production host restart: not performed.
- Multi-node failover, backup restore, and contractual RTO certification: not
  tested by this smoke.

## Compensating Runtime Controls

- Global JSON and form bodies are limited to `1mb` by default.
- URL-encoded parameters are limited to 1,000.
- A live oversized JSON request was rejected with HTTP `413`.
- WebSocket payloads are limited to 64 KiB by default.
- WebSocket compression is disabled.
- WebSocket connections are capped at 100 by default.
- The service remained healthy after the rejection test.

## Isolated Commercial Gateway

- Path: `commercial-runtime/chat-gateway`.
- Runtime: Node standard library only.
- Third-party production packages: 0.
- Lockfile version: 3.
- Allowed routes: `GET /health` and `POST /api/sheikha/live/chat/v1` only.
- All other routes return `404 ROUTE_NOT_ALLOWED`.
- WebSocket upgrades are rejected.
- Request body limit: 64 KiB.
- Message limit: 16,000 characters.
- Rate limit: 30 requests per minute per source by default.
- Backend destination is fixed to loopback port 8080.
- Unit verification: passed.
- Permanent PM2 activation: online and saved on the production host.

## Public Production Evidence

- Reverified on 2026-08-28 against the active production path.

- `https://sheikha.top/api/sheikha/live/chat/v1`: HTTP 200, TLS verified.
- `https://api.sheikha.top/api/sheikha/live/chat/v1`: HTTP 200, TLS verified.
- Commercial readiness response: complete SSE in 0.712 s and 0.778 s.
- Final post-hardening smoke: complete SSE in 1.407 s.
- SSE sequence: `ack`, `meta`, `heartbeat`, `token`, `done`.
- Response SHA-256: `68bb3463769b07289ef0f5b07be3b55c27e32ef8c421a483533eac3ce613401a`.
- Oversized public request: HTTP 413 on both production domains.
- Spoofed `X-Forwarded-For`: could not bypass the 30 request rate limit.
- Rate-limit observation: 30 accepted requests followed by HTTP 429.
- Non-commercial arithmetic smoke: `الناتج هو 4.` with a verified local
  calculation route and HTTP 200.
- Final commercial/non-commercial readiness request returned a complete Arabic
  response through `GOVERNED_COMMERCIAL_READINESS_EVIDENCE_PATH`, followed by
  `done`; it used no model and executed no high-impact action.
- Production live-runtime SHA-256 matched the local verified source:
  `29956f4c1c4c74a0fb43545dc645acb8a3af5d5a6715b434a3138c0de28dc726`.
- nginx configuration test: successful before each reload.
- PM2 state: gateway and main portal online and saved.
- Current commercial readiness smoke: HTTP 200, TLS verified, complete response
  in 1.327 seconds.
- Current bounded arithmetic smoke: HTTP 200, TLS verified, result `42` in
  1.204 seconds.

The readiness response uses a bounded local evidence path. General conversation,
coding, and reasoning requests retain their governed model routes.

## Gate Results

- PASS: local process online after governed restart.
- PASS: local health endpoint returned success.
- PASS: HTTP and SSE transport.
- PASS: first event and first Arabic token within one second.
- PASS: explicit response route and terminal `done` event.
- PASS: 42 targeted routing, streaming, input-bound, gateway, HAProxy, and nginx tests.
- PASS: project lint for the changed server scope.
- PASS: `git diff --check` for the changed scope.
- PASS: three consecutive complete Arabic evidence responses.
- PASS: no timeout or governed fallback.
- PASS: required status, evidence, and boundary sections.
- PASS: 20/20 short-burst concurrent requests.
- PASS: 24/24 one-minute sustained-smoke requests through gateway and backend,
  with health passing before and after.
- PASS: local gateway process restart, health recovery in 2.599 seconds, and
  complete post-recovery governed response.
- PASS: 42 targeted tests, lint, syntax checks, and diff checks.
- PASS: secret scan for the new evidence and verification scope.
- PASS: oversized request rejection and post-rejection health check.
- ISOLATED: the monolith audit reports 23 vulnerabilities: 14 high, 7 moderate,
  and 2 low. The public gateway artifact has no third-party packages.
- PASS: isolated gateway launch, reverse-proxy routing, TLS, public smoke,
  oversized-body rejection, and rate-limit enforcement.
- PASS: public TLS path, exact-route isolation, oversized-body rejection, and
  public rate limiting with spoofed-forwarding resistance.
- NOT VERIFIED: sustained concurrent-user capacity, soak behavior, multi-node
  failover, backup recovery objective, and a contractual commercial SLA.

## Commercial Exit Criteria

Commercial production approval requires all of the following in the same build:

1. Add or repair DNS for `public.sheikha.top`; it did not resolve during testing.
2. Run sustained soak and restart/failover recovery tests for a formal SLA.
3. Qualify unrestricted model answers separately from governed evidence and
   arithmetic routes.
4. Complete a clean release scope with reproducible artifact and rollback evidence.

## Boundaries

This evidence verifies the governed commercial readiness and bounded arithmetic
routes over public TLS. It does not certify unrestricted model quality, regulatory
compliance, external accreditation, multi-node availability, or a formal SLA.
No signing, notarization, or automated high-impact action occurred.
