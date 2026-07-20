# Sheikha V2 UEFI Paging Runtime Phase 2B

## Implemented

- Dedicated V2 UEFI entry and kernel handoff, separate from V1 artifacts.
- Four-level x86_64 bootstrap map using 2 MiB leaves.
- Identity coverage for the first 4 GiB with an expected six-table topology.
- CR3 read, write and read-back path linked into the EFI artifact.
- INVLPG path linked after CR3 activation.
- Low-address preflight for the image data, stack and page-table pool.
- UEFI pre-exit text plus a post-handoff green GOP status bar when the
  framebuffer is available inside the bootstrap identity window.
- Deterministic FAT12 image with `EFI/BOOT/BOOTX64.EFI`.
- PE32+ inspection, SHA-256 evidence and embedded marker checks.

## Current evidence state

The EFI artifact and boot image are real and artifact-verified. QEMU and OVMF
executed the image, and the serial log contains every required CR3, INVLPG and
post-firmware handoff marker. The QEMU evidence is bound to both artifact
SHA-256 values, so the verified status cannot be reused for a changed image.

This closes Phase 2B in the emulator scope only. Physical hardware, Secure Boot,
all drivers, and general-purpose OS completion remain unverified.
The read-only laptop preflight and removable-media procedure are documented in
`docs/products/SHEIKHA-V2-PHYSICAL-BOOT-TRIAL-V1.md`.

## Security boundary

The 4 GiB identity map is a bootstrap transition map. It is executable so the
running UEFI image and stack survive the CR3 switch. It is not the final
permission model; W^X, memory-type-aware mappings and higher-half isolation remain
future work.

AI, System Builder, the technology-family tree, and Jannat Gardens are explicitly
outside the critical boot path. They may operate only as governed post-boot
layers. Jannat Gardens remains a worldly design metaphor, not a claim about the
unseen.

## Commands

```bash
npm run -s ops:bare-metal:toolchain:v2:phase2b
bash scripts/bare-metal/v2/build-uefi-paging-runtime-phase2b.sh
npm run -s ops:bare-metal:all:v2:phase2b
npm run -s ops:bare-metal:test:v2:phase2b
```

## Completion rule

`PHASE2B_VERIFIED` requires an actual QEMU run and every marker listed in the
Phase 2B contract. A successful build alone is not completion evidence.
