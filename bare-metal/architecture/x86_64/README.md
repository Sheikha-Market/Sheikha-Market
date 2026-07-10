# x86_64 Architecture Seed

The V1 target uses the UEFI x64 Microsoft ABI for firmware entry, then crosses
an explicit `ExitBootServices` boundary before entering the native kernel seed.
The post-firmware kernel uses direct x86 port I/O for a 16550-compatible COM1
UART and finishes in an interrupt-disabled `hlt` loop.

The artifact is a PE32+ EFI application with subsystem 10 and no import table.
The disk artifact is a deterministic FAT12 superfloppy containing the standard
fallback path `EFI/BOOT/BOOTX64.EFI`.
