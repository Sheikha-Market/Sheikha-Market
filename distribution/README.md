# SHEIKHA Universal Distribution and Installer Fabric V1

This directory is the local-first source of truth for Sheikha release planning,
packaging, inspection, checksums, SBOMs, provenance, and native verification.

## Current Product Boundary

Sheikha currently provides a Node.js server and a real command-line entrypoint at
`bin/sheikha`. No executable desktop shell is present. Desktop installers remain
`REQUIRES_DESKTOP_RUNTIME_IMPLEMENTATION`; the fabric does not create placeholder
installers.

## Commands

```bash
npm run ops:distribution:inspect:v1
npm run ops:distribution:plan:v1
npm run ops:distribution:build:linux:v1
npm run ops:distribution:verify:v1
npm run ops:distribution:index:v1
npm run ops:distribution:release:local:v1
```

The release command inspects the host, plans all 27 targets, stages shared source,
builds only available targets, inspects every artifact, verifies SHA-256, creates
CycloneDX SBOM and provenance documents, and atomically publishes to the local
release registry. It refuses to replace an existing release.

## Claim Boundary

- Cross-built is not native-verified.
- Windows installers require a real desktop runtime and Windows validation.
- macOS DMG and Universal 2 require a native macOS build, signing, and notarization.
- Snap Store publication is separate and requires explicit credentials and approval.
- No signing, notarization, external publication, or secret storage is automated.
- High-impact release decisions remain human-owned.

## Layer Position

`SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1` is the specialized L27 release
and delivery plane. L24 remains the cognitive evidence and decision-support plane;
L25 and L26 retain their existing autonomous operations and execution-bridge roles.
No numeric promotion grants authority over governance or accountable humans.
