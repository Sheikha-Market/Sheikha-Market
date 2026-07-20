# Sheikha V2 MSI USB Boot Trial V1

## Verified scope

This stage prepares one real 64 MiB raw disk image for an x86_64 UEFI
one-time boot trial:

- GPT disk layout.
- EFI System Partition.
- FAT32 filesystem.
- Standard `EFI/BOOT/BOOTX64.EFI` fallback path.
- Byte-for-byte verified UEFI application payload.
- QEMU/OVMF boot evidence ending at `SHEIKHA_BARE_METAL_BOOT_OK`.
- QEMU framebuffer evidence showing the safe-trial labels and green success bar.
- Controlled halt after the paging seed checks.

Artifact:

```text
bare-metal/images/v2/sheikha-sovereign-bare-metal-v2-msi-usb-gpt-v1.img
```

The authoritative SHA-256 is generated in:

```text
runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-msi-usb-gpt-v1-manifest.json
```

Visual evidence:

```text
runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-msi-usb-gpt-v1-boot-screen.png
runtime/bare-metal/v2/physical-trial/v1/sheikha-v2-msi-usb-gpt-v1-visual-evidence.json
```

## MSI one-time boot path

1. Attach one dedicated disposable USB disk.
2. Run the read-only physical preflight again.
3. Review the exact device path, size, transport, and mount state.
4. Provide the exact acceptance token printed by the guarded writer.
5. Write only that approved USB disk.
6. Restart the MSI laptop and press `F11` repeatedly.
7. Select the UEFI entry for the USB device.
8. Observe the safe-trial screen and the controlled halt.

Do not change the permanent firmware boot order for this trial.

## Guarded writer

The writer is intentionally not executed until a removable USB disk is
attached and explicitly approved:

```text
scripts/bare-metal/v2/write-msi-usb-v1.sh
```

It rejects:

- partitions instead of whole disks;
- mounted devices or mounted child partitions;
- read-only devices;
- devices that are neither removable nor USB;
- the detected system disk;
- images whose SHA-256 differs from the manifest;
- incomplete or mismatched acceptance text.

## Explicit boundary

This image is not an operating-system installer. The current native V2 seed
does not yet provide a persistent filesystem, storage drivers, hardware input,
networking, a package manager, or an internal-disk installation workflow.
Physical MSI boot remains pending until dedicated media is written and the
boot result is observed on that laptop.

Secure Boot signing and official external certification are not claimed.
