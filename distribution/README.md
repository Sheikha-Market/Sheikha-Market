# SHEIKHA Universal Delivery, Distribution and Installer Fabric V2

V2 is the local-first release plane for Sheikha products. It reuses the V1 Linux
builders and adds product-aware planning, evidence gates, architecture inspection,
CycloneDX SBOMs, local provenance, atomic publication, and rollback metadata.

The single target source of truth is
`distribution/manifest/sheikha-target-matrix-v2.json`. It declares exactly 27 base
targets: Windows 8, Linux 15, and macOS 4. VS Code Extension and Bare-Metal artifacts
are auxiliary products outside that count.

## Product Boundary

- Sheikha CLI: implemented; JavaScript launcher requiring Node.js 20, 22, or 25.
- Sheikha Server Runtime: implemented as a Node.js source runtime; production
  dependencies are installed separately.
- Sheikha VS Code Extension: implemented and packaged as VSIX 1.0.91.
- Sheikha Bare-Metal OS Seed: implemented as x86_64 UEFI EFI and FAT/ESP image.
- Sheikha Desktop: declared candidate only. No executable Desktop Runtime exists,
  so the pipeline never fabricates Windows EXE or macOS DMG files.

## Commands

```bash
npm run ops:delivery:inspect:v2
npm run ops:delivery:matrix:v2
npm run ops:delivery:plan:v2
npm run ops:delivery:build:linux:v2
npm run ops:delivery:build:available:v2
npm run ops:delivery:verify:v2
npm run ops:delivery:release:local:v2
npm run ops:delivery:status:v2
```

The main local release command is:

```bash
npm run ops:delivery:release:local:v2
```

It performs `inspect -> resolve-products -> resolve-targets -> inspect-toolchains ->
stage -> build -> inspect-artifacts -> verify-architecture -> checksums -> SBOM ->
provenance -> native-test-gate -> signing-readiness -> atomic-local-publication ->
release-index`.

V1 commands remain available as compatibility builders. V2 does not duplicate their
Linux packaging logic.

## Local Registry

V2 publishes atomically to:

```text
$HOME/Sheikha-Local-Registry/releases/v2/<version>/
├── artifacts/
├── metadata/
├── sbom/
├── provenance/
├── verification/
├── release-index.json
├── rollback-manifest.json
├── SHA256SUMS
└── MANIFEST.txt
```

Publication uses a sibling staging directory, verifies every copied checksum, calls
`fsync`, and renames the complete tree. Existing versions are immutable and silent
overwrite is rejected. No GitHub service is required.

## Verification

Run the following from the release directory:

```bash
sha256sum -c SHA256SUMS
```

`VERIFIED` requires a non-empty artifact, SHA-256, structural and architecture
inspection, the required runtime or installation test, and native evidence. A source
archive, extracted DEB, cross-build, or QEMU result is reported separately when it
does not satisfy native installation or physical-hardware qualification.

No signing key, notarization credential, store credential, or secret is stored by
the fabric. Signing, notarization, privileged installation, and external publication
require separate human approval.

## Recovery

1. Stop before modifying a published version; releases are immutable.
2. Verify `release-index.json`, `rollback-manifest.json`, and `SHA256SUMS`.
3. Select the previous immutable release recorded by the operator or local registry.
4. Repoint the consuming service or reinstall from that release.
5. Run the target-native smoke test and health check.
6. Record the rollback decision and evidence; do not silently delete the failed tree.

If atomic publication stops before rename, remove only the matching `.staging-*`
directory after confirming no process uses it. If it stops after rename, treat the
version as published and use a new version or an explicit rollback.

## Read-Only APIs

- `/api/sheikha/distribution-apex/v2/status`
- `/api/sheikha/distribution-apex/v2/matrix`
- `/api/sheikha/distribution-apex/v2/release-index`

There is deliberately no remote build, signing, or publish endpoint.
