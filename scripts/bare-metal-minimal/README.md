# Bare-Metal Minimal Scripts

This folder contains a minimal, isolated bare-metal example:

- `boot.asm`: 16-bit boot sector demo (`0x7C00`) that prints one character.
- `kernel.asm`: 32-bit entry point that calls `kernel_main`.
- `kernel.c`: writes a short message to VGA text memory.
- `linker.ld`: memory layout for linking kernel objects.
- `build.sh`: safe local build script for producing binaries.

## Build

```bash
cd scripts/bare-metal-minimal
bash build.sh
```

Output binaries are generated in `scripts/bare-metal-minimal/out`.

Note: This example is isolated from the runtime architecture and does not affect production services.
