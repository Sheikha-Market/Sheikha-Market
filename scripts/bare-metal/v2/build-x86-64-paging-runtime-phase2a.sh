#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/../../.." &&
  pwd
)"

SRC="$ROOT/bare-metal/kernel/v2"
OUT="$SRC/build/x86-64-paging-runtime-phase2a"
CC="${CC:-cc}"

mkdir -p "$OUT"

COMMON_FLAGS=(
  -std=c11
  -Wall
  -Wextra
  -Werror
  -pedantic
  -ffreestanding
  -fno-stack-protector
  -fno-pie
  -mno-red-zone
  -I"$SRC/include"
)

"$CC" \
  "${COMMON_FLAGS[@]}" \
  -c "$SRC/memory/sheikha_x86_64_paging.c" \
  -o "$OUT/sheikha_x86_64_paging.o"

"$CC" \
  -Wall \
  -Wextra \
  -Werror \
  -ffreestanding \
  -fno-stack-protector \
  -fno-pie \
  -mno-red-zone \
  -c "$SRC/arch/x86_64/sheikha_cr3.S" \
  -o "$OUT/sheikha_cr3.o"

"$CC" \
  "${COMMON_FLAGS[@]}" \
  -c "$ROOT/bare-metal/boot/uefi/sheikha_v2_paging_boot_adapter.c" \
  -o "$OUT/sheikha_v2_paging_boot_adapter.o"

"$CC" \
  -std=c11 \
  -Wall \
  -Wextra \
  -Werror \
  -pedantic \
  -fno-pie \
  -no-pie \
  -I"$SRC/include" \
  "$SRC/memory/sheikha_x86_64_paging_phase2a_test.c" \
  "$OUT/sheikha_x86_64_paging.o" \
  -o "$OUT/sheikha-x86-64-paging-phase2a-test"

"$OUT/sheikha-x86-64-paging-phase2a-test"

objdump -d "$OUT/sheikha_cr3.o" \
  >"$OUT/sheikha_cr3.disassembly.txt"

grep -Eq \
  'mov.*%cr3|mov.*cr3' \
  "$OUT/sheikha_cr3.disassembly.txt"

grep -Eq \
  'invlpg' \
  "$OUT/sheikha_cr3.disassembly.txt"

printf 'SHEIKHA_V2_X86_64_PAGING_RUNTIME_PHASE2A_BUILD_OK\n'
printf 'FOUR_LEVEL_PAGE_TABLE_BUILDER_VERIFIED=true\n'
printf 'CANONICAL_ADDRESS_VALIDATION_VERIFIED=true\n'
printf 'CR3_INTERFACE_COMPILED=true\n'
printf 'INVLPG_INTERFACE_COMPILED=true\n'
printf 'UEFI_PAGING_BOOT_ADAPTER_COMPILED=true\n'
printf 'PRIVILEGED_INSTRUCTIONS_EXECUTED_IN_HOST_TESTS=false\n'
