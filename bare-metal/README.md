# Sheikha Native Bare-Metal Seed V1

This directory contains the first executable x86_64 UEFI seed for the Sheikha
native kernel path. The boot payload is freestanding C11 and does not link
against libc, Linux, Node.js, or project JavaScript.

## Verified boundary

The success marker is emitted from `sheikha_kernel_entry` only after UEFI
`ExitBootServices` succeeds. A compiled artifact is not treated as boot proof.
The report may set `bareMetalFullyIndependentToday` to `true` only when QEMU
actually runs the image and the captured serial stream contains:

```text
SHEIKHA_BARE_METAL_BOOT_OK
```

## Boot chain

```text
UEFI firmware
  -> EFI/BOOT/BOOTX64.EFI
  -> efi_main
  -> GetMemoryMap + ExitBootServices
  -> sheikha_kernel_entry
  -> COM1 serial evidence
  -> controlled halt
```

## Build

```bash
npm run -s ops:bare-metal:toolchain:v1
npm run -s ops:bare-metal:build:v1
npm run -s ops:bare-metal:image:v1
npm run -s ops:bare-metal:qemu:v1
npm run -s ops:bare-metal:verify:v1
```

The Node.js pipeline is host-side build orchestration only. It generates a
contract header, invokes the native compiler and linker, creates the FAT12 boot
image, runs QEMU when available, and writes evidence. It is absent from the
firmware and kernel runtime path.

## Current scope

V1 establishes UEFI handoff, a serial HAL, contract identity, governance
boundaries, and a safe CPU halt. Interrupt tables, paging ownership, allocator,
scheduler, storage, framebuffer, networking, and physical-device qualification
remain later kernel milestones and are not claimed by this seed.
