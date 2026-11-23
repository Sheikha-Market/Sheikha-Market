# Sheikha Local Kernel and Platform Manifest

Historical report: the scoped integration blocker below was subsequently addressed
and retested in the [2026-10-24 local route recovery](SHEIKHA-COSMIC-ROUTE-RECOVERY-2026-10-24.md).
The original results are retained rather than rewritten as a successful run.

## Scope

The kernel composition is a locally tested Node.js software module, not a native
operating system, a physical boot, a connected AI model, or production activation.
Quran and Sunnah are the project's reference; no automated religious certification
or replacement for qualified human review is asserted.

## Architecture

```text
CLI / authenticated admin router
  -> runtime/kernel/sheikha-kernel.js
     -> runtime/bare-metal/manifest.js (immutable target contracts)
     -> bounded agent descriptors (fresh disposable registry per self-test)
     -> managed Sheikha language compiler and governed local VM
     -> synthetic water-balance model
     -> research planning with 11 method labels and evidence requirements
```

The compatibility kernel no longer requires the missing `runtime/cosmic/model`
or treats the legacy `runtime/infinite/kernel` class as an instance. The platform
manifest no longer contains invalid pasted entity annotations or fabricated boot
seals. Pop!_OS, Linux, Ubuntu, Windows, macOS and native boot are target contracts,
all marked `TARGET_NOT_QUALIFIED`. A Linux Node.js probe does not qualify an OS.

## Local Commands

```bash
node tools/runtime/sheikha-kernel-verify.cjs
node tools/runtime/sheikha-kernel-verify.cjs --manifest
```

The default command performs five fixed checks: descriptor quotas, denied external
operations, managed language execution, synthetic water conservation and research
planning without asserted conclusions. It accepts no source, provider, URL, device,
approval or runtime configuration. The CLI exits nonzero for invalid arguments,
failed checks or exceptions, without reflecting private exception text.

## Router Contract

The existing router implements these paths under `/api/sheikha-kernel` and its
`/api/infinite-agent` alias, **when mounted by an application**:

- `GET /manifest`: authenticated administrator only; immutable capability contract.
- `POST /self-test`: authenticated administrator; JSON `{}` only; isolated probe.
- `GET /self-test`: authenticated administrator receives 405 with `Allow: POST`.
- No configured explicit JWT secret: access denied. Caller approval fields do not
  authorize access. Unknown fields and queries are rejected, bodies are bounded,
  results use `Cache-Control: no-store`, and failed probes return 503.

Self-tests do not modify the API's shared descriptor registry. No task scheduling,
provider calls, model training, system changes or device commands are introduced.

## Current Integration Blocker

`server.js` changed externally during this work. First, catch blocks were removed
and syntax failed. After the user authorized catch-only repair, another replacement
arrived that already parsed, but lacked the kernel/cosmic mounts and the tested
governance startup block. That replacement was preserved, not overwritten with an
older server. No server edit was made in this change set.

At SHA-256 `1115dbbb09396a98313410caa76990fdbc5c43c9430a71b311b1e4a18549450a`,
the server passes syntax checking but fails two integration assertions and all seven
governance-startup tests. Router-only tests are not proof that its URLs are available
through this server. Current build input inspection also reports
`HARDCODED_CREDENTIAL_REVIEW_REQUIRED` for `server.js`; values are not copied here.
The stage operation refused to create a context. No new container build, full-server
smoke test, deployment, cloud request or existing-service shutdown was performed.

The ignore files retain concurrent rules and add private-file exclusions. The build
policy includes the kernel verification CLI as an entrypoint. The existing container
smoke harness now checks manifest/self-test contracts but was not run this turn.

## Verification

Latest results: 73 passed and 9 failed across 82 focused cases, with no skips:

| Suite | Passed | Failed |
| --- | ---: | ---: |
| Local kernel composition and CLI | 9 | 0 |
| Bounded descriptor kernel | 8 | 0 |
| Synthetic natural model | 8 | 0 |
| Managed language | 9 | 0 |
| Research brain | 3 | 0 |
| Router and server integration | 15 | 2 |
| Governance startup | 0 | 7 |
| Build-context tooling | 21 | 0 |

The fixed self-test passed on Linux x64 / Node 25.6.1. The existing native-environment
status tool returned `UNKNOWN`, with `productionReady: false`; no QEMU or physical
boot was performed. Full activation remains unverified until the shared server
integration and credential finding are resolved and a stable snapshot is retested.
