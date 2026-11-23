# Cosmic and Infinite Compatibility Repair

## Cause and Fix

`app.use(...)` is JavaScript, not a Bash command. The server already mounted
`/api/cosmic`; adding another mount could introduce inconsistent behavior.
The existing mount now imports `routes/cosmic.js`, a small compatibility wrapper
around the canonical authenticated natural-model router. Only one server line
changed from the previously tested server snapshot.

`routes/infinite.js` delegates to the canonical router as well. Public status
remains limited to service/model flags; detailed state requires an authenticated
administrator with a configured JWT secret. Neither wrapper bypasses authentication.

The legacy `runtime/infinite/kernel.js` remains a constructor with `status()`,
backed by the existing bounded in-memory descriptor kernel. Replacing its export
with a plain status object would break callers using `new InfiniteKernel()`.
There is no automatic creation of 58 workers and no physical activation claim.

`totalBots` is a measured descriptor count, initially zero. It changes only after
explicit local registration. It does not measure executing robots or AI workers.
Both the compatibility status and authenticated `/api/infinite-agent/full` and
`/api/sheikha-kernel/full` responses expose `sealStatus: "NOT_VERIFIED"` and
`countScope: "LOCAL_IN_MEMORY_DESCRIPTORS"`. `seal: null` is intentional; a missing
verification must not be replaced with a fabricated success seal.

## Safe Local Checks

Run these commands in the project directory, not the `app.use` statement:

```bash
node --check server.js
node cli.cjs check-js runtime/infinite/kernel.js
node tools/runtime/sheikha-kernel-verify.cjs
```

These commands do not deploy a server or operate hardware. For a running server,
unauthenticated protected requests are denied; an administrator receives 200 for
the synthetic water model and 501 for the unimplemented atomic simulation.

## Build Protection

The initial stage attempt refused the literal `[STRIPPED 80 bytes]` placeholder in
`.gcloudignore`. After removing it, two existing build-tool tests exposed missing
private-file exclusions. Those exclusions were appended to `.gcloudignore` and
`.dockerignore`, preserving other current rules and executable runtime inputs.
The tests then passed, including a local upload-list check with inert private-file
fixtures. That check lists candidate files only; it performs no upload.

## Verification

- 63 focused cases passed: legacy compatibility 4, bounded kernel 8, routes 18,
  composition 9, inspection CLI 3, build-context tooling 21; no failures or skips
  on the final runs. The initial two build-rule failures were repaired, not hidden.
- The clean stage contained 2,929 files / 75,510,580 bytes, with no blocking
  findings, 188 resolved literal imports and three entrypoint syntax checks.
- Local container build passed with `--network=none --pull=false`, using cached
  dependencies. Image ID:
  `f3d126244a5ed8c8db6acf54a29b61e1b04a66603344832cd89e06c78e68c444`.
- All 67 full-server HTTP checks passed, including the new measured count and seal
  labels, authentication, input rejection and water/atoms compatibility behavior.
  The smoke used `SHEIKHA_ENABLE_ALL_ENGINES=false`, no published ports, no host
  mounts and no external network. Shutdown exited 0 with no missing modules.
- The disposable container was removed. All 2,929 staged source hashes matched the
  working tree at the post-test comparison. This document and the summary receipt
  were written afterwards; no continuous immutability guarantee is implied.

The structured summary is
`runtime/cloud-build-recovery-verification/2026-10-24-cosmic-compatibility.json`.
The scope is not an all-engine, whole-repository or production acceptance test.
No existing service was stopped, no persistent server started, and no cloud, IAM,
DNS, provider payment or physical-device action was performed.

## Attachment Review

The V43.89 manufacturing script writes declarations into SQLite and JSON, then
hashes those files. It does not implement sensor integration, robot drivers,
industrial control or verified unattended production. Its `PRODUCTION_HOLD` label
does not implement an enforced stop mechanism, and its hashes do not prove the
claimed capabilities. The script was not executed and its external database and
evidence registry were not modified. Quran and Sunnah remain the project's stated
reference; automated religious certification is not asserted.
