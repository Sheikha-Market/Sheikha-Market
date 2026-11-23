# Sheikha Local Route Recovery

## Scope

Verified on 2026-10-24 in a disposable local container. This repairs the missing
kernel and cosmic route integration described in the latest pasted terminal log.
It does not activate native hardware, physical agents, atomic simulation, AI
providers, cloud deployment or an unlimited workforce. Quran and Sunnah remain the
project reference, not an automated certification of compliance.

The existing replacement of `server.js` was preserved. Its starting SHA-256 was
`1115dbbb09396a98313410caa76990fdbc5c43c9430a71b311b1e4a18549450a`.
Only targeted integration, test-account, scheduler and shutdown changes were made;
an older full server was not restored. Unrelated worktree and staged changes were
not reverted. Historical `ACTIVE` and `SEALED` strings in the attachment are not
accepted as evidence of current execution.

## Changes

- Restored mandatory governance initialization before Express. Optional activation
  absence is reported as not configured; a broken installed module fails startup.
  Successful loading is not reported as verified capability activation.
- Mounted the existing authenticated router at `/api/infinite-agent` and
  `/api/sheikha-kernel`, and the natural-model router at `/api/cosmic-engineering`
  and `/api/cosmic`. Bounded parsing precedes the legacy text sanitizer so unknown
  JSON keys cannot silently disappear. The existing general limiter also applies.
- Preserved the health response's top-level status and added the smoke-test health
  contract. Explicit `HOST` controls the single listener, with loopback as the
  local default. No port eviction or automatic alternate-service takeover occurs.
- Replaced fixed virtual-account passwords with the existing opt-in account
  helper. Virtual-account endpoints remain disabled in production even when
  test-account environment flags are set. Credential fields are no longer returned.
  Existing real-user credentials were not rotated.
- Made the two entrypoint cron registrations and automation scheduler start
  conditional on exactly `SHEIKHA_ENABLE_CRON=true`. Other existing internal
  intervals were not redesigned or claimed to be disabled.
- Added idempotent SIGTERM/SIGINT shutdown for HTTP and WebSocket resources with
  a bounded forced-exit fallback.

## Verified API Contracts

| Request | Result |
| --- | --- |
| Public kernel root/status | 200; bounded local descriptor model, not a live neural network |
| Protected kernel/natural paths without authentication | 401 |
| Administrator GET kernel manifest | 200; no verified bare-metal boot or connected AI provider |
| Administrator POST kernel self-test with JSON `{}` | 200; fresh disposable registry |
| Administrator GET kernel self-test | 405 with `Allow: POST` |
| Self-test with unknown keys, `__proto__` or query overrides | 400 |
| Administrator GET `/api/cosmic/water` | 200; synthetic local model |
| Administrator GET `/api/cosmic/atoms` | 501; `ATOMIC_SIMULATION_NOT_IMPLEMENTED` |
| Administrator POST natural simulation | 200 for valid synthetic water inputs; invalid rain rejected |
| Production virtual-account GET/login | 404 |

The kernel creates bounded in-memory descriptors, not executing employees or
devices. Its self-test does not mutate the API registry. The `/rasul` compatibility
path reports reference information only, not a biological or personal simulation.

## Verification

All 66 focused test cases passed with no failures or skips:

| Test file | Passed |
| --- | ---: |
| `tests/sheikha-infinite-agent-routes.test.cjs` | 17 |
| `tests/sheikha-supreme-startup.test.cjs` | 7 |
| `tests/sheikha-virtual-test-accounts.test.cjs` | 8 |
| `tests/sheikha-local-kernel-composition.test.cjs` | 9 |
| `tests/sheikha-server-runtime-controls.test.cjs` | 4 |
| `tests/test_sheikha_cloud_build_context.py` | 21 |

The immutable staged build contained 2,928 source files totaling 75,510,121 bytes.
All 186 discovered literal imports resolved across 166 reachable sources, and all
three configured entrypoints passed syntax checks. Staging reported no blocking
findings; the excluded root `node` symlink warning was retained.

Built locally from cached dependencies with `--network=none --pull=false`:

```text
tag: localhost/sheikha-main-portal:kernel-recovery-20261024
image: 49c871744b2715ca5c799a9575a2ccf48d3e179e33dc7c450679725a812d2593
inventory: 6e741b57ea51db5d2a125ff3a96fed46a67014e9666ad6b816c06be8a2e41ebc
server.js: 106cd7ce831a8e1c355813f1f040341436228112d03e88e021687378d4ee0995
```

The full-server smoke harness passed 67 HTTP checks inside that exact image with
network disabled, all capabilities dropped, no-new-privileges, a 1 GiB memory limit
and a 256-process limit. It verified every staged source hash before starting the
server. No ports or host directories were published or mounted. SIGTERM shutdown
exited cleanly with code 0; no missing modules were observed. The test container
was removed, and a subsequent inventory found no remaining container for this image.

The smoke used `SHEIKHA_ENABLE_ALL_ENGINES=false`, `SHEIKHA_LOCALMIND_BOOT=false`
and `SHEIKHA_ENABLE_CRON=false`. It does not verify every optional engine or API.
The prior replacement's absent `/api/runtime/authority` and optional fabric routes
were not restored in this change. Tests now check the current entrypoint's actual
listener and bootstrap ordering, without asserting the removed authority route.
This is not a successful run of the entire repository test suite.

Final server syntax and receipt/hash consistency checks passed. A full working-tree
`git diff --check` still reports trailing whitespace in the broad `server.js` diff;
the server was not reformatted wholesale. The focused non-server diff and newly
written files passed whitespace checks. This report does not claim a clean Git diff.

## Snapshot and Operational Limits

After the test, the only drift found among staged source paths was
`public/executive-civilization-control-center/identity.health.json`, whose
`generatedAt` field changed concurrently. That generated file was not reverted.
The server and smoke harness still matched the tested snapshot. Documentation and
the receipt were written afterwards; this is a tested snapshot, not a claim that
the entire live working tree is immutable.

The existing service on port `18080` was not stopped, replaced or used as evidence
for the new build. No persistent server was started. No cloud build, upload, IAM,
DNS, Hostinger, Cloud Run, provider billing or physical-device action was performed.
Production readiness remains false. Dependency vulnerability freshness, all-engine
operation and externally supplied startup modules require separate review.

The structured summary is
`runtime/cloud-build-recovery-verification/2026-10-24-cosmic-route-recovery.json`.
The [2026-10-23 report](SHEIKHA-LOCAL-KERNEL-MANIFEST-2026-10-23.md) and its failed
integration receipt remain historical records, not current failure assertions.
