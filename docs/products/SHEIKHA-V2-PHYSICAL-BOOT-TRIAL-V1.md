# Sheikha V2 Physical Boot Trial V1

## Verified scope

The current boot artifact is a freestanding x86_64 UEFI application. Its
four-level paging handoff, CR3 load, INVLPG execution, and controlled kernel
halt are verified in QEMU with OVMF. The application does not require Linux or
Node.js after firmware starts it.

The physical-device claim remains pending. QEMU evidence is not a substitute
for a successful boot on the target laptop.

## Laptop observation

The physical-trial build provides two display signals:

1. Before leaving UEFI services, the screen prints `Sheikha Sovereign Native
   Kernel V2` and `Paging prepared; entering native kernel...`.
2. After the kernel validates paging, it draws a green status bar at the bottom
   of a compatible GOP framebuffer. The serial marker remains
   `SHEIKHA_BARE_METAL_BOOT_OK`.

The status bar is best effort. Firmware without a usable framebuffer requires
serial evidence for complete physical verification.

## Safe preparation

Run the read-only inspection:

```bash
npm run -s ops:bare-metal:physical-trial:inspect:v2
```

The inspector never formats, partitions, mounts, writes, or changes firmware.
It rejects the system disk and lists only unmounted removable USB devices for
human review.

No removable device was present during preparation. Do not use the internal
NVMe device. Attach one dedicated disposable USB device, run the inspection
again, and record its exact `/dev/...` path. Writing the image is a separate
high-impact action and requires explicit approval for that exact path.

## Boot artifact

- Image: `bare-metal/images/v2/sheikha-sovereign-bare-metal-v2-phase2b.img`
- EFI fallback file: `bare-metal/images/v2/esp/EFI/BOOT/BOOTX64.EFI`
- Manifest: `runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-physical-boot-trial-manifest-v1.json`
- Checksums: `runtime/bare-metal/v2/physical-trial/v1/SHA256SUMS`

The EFI file is unsigned. Secure Boot must remain disabled for this trial
unless a separately governed signing and enrollment process is completed.

## Device and certification boundary

This artifact does not claim support for every computer, phone, vehicle,
factory controller, data center, accelerator, or processor architecture. Each
family requires its own architecture port, HAL and driver set, safety and
security evidence, and hardware tests.

Internal methodology attestations are evidence records only. No governmental,
standards-body, laboratory, or independent-auditor certificate is issued by the
software. Official certifications and regulated-device approvals require the
relevant external authority and qualified human reviewers.

## Recovery

The trial does not modify the installed operating system or firmware boot
order. Use the firmware one-time boot menu. Remove the USB device to return to
the existing system. No disk installation, persistence, or automatic recovery
is present in this controlled-halt seed.
