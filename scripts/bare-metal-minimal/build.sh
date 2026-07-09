#!/usr/bin/env bash
set -euo pipefail

# Build script for minimal bare-metal demo.
# Requires: nasm, gcc, ld

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/out"
mkdir -p "$OUT_DIR"

if ! command -v nasm >/dev/null 2>&1; then
  echo "Missing dependency: nasm"
  exit 1
fi
if ! command -v gcc >/dev/null 2>&1; then
  echo "Missing dependency: gcc"
  exit 1
fi
if ! command -v ld >/dev/null 2>&1; then
  echo "Missing dependency: ld"
  exit 1
fi

nasm -f elf32 "$SCRIPT_DIR/kernel.asm" -o "$OUT_DIR/kernel_asm.o"
gcc -m32 -ffreestanding -fno-pie -nostdlib -c "$SCRIPT_DIR/kernel.c" -o "$OUT_DIR/kernel_c.o"
ld -m elf_i386 -T "$SCRIPT_DIR/linker.ld" "$OUT_DIR/kernel_asm.o" "$OUT_DIR/kernel_c.o" -o "$OUT_DIR/kernel.bin"

nasm -f bin "$SCRIPT_DIR/boot.asm" -o "$OUT_DIR/boot.bin"

echo "Build completed:"
echo "  $OUT_DIR/kernel.bin"
echo "  $OUT_DIR/boot.bin"
