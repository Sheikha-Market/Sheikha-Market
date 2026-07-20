#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/../../.." &&
  pwd
)"

SRC="$ROOT/bare-metal/kernel/v2"
OUT="$SRC/build/uefi-paging-runtime-phase2b-host"
CC="${CC:-cc}"

mkdir -p "$OUT"

"$CC" \
  -std=c11 \
  -Wall \
  -Wextra \
  -Werror \
  -pedantic \
  -fno-pie \
  -no-pie \
  -I"$SRC/include" \
  -I"$ROOT/bare-metal/boot/uefi" \
  "$SRC/memory/sheikha_x86_64_paging_phase2b_test.c" \
  "$SRC/memory/sheikha_x86_64_paging.c" \
  "$ROOT/bare-metal/boot/uefi/sheikha_v2_paging_boot_adapter.c" \
  -o "$OUT/sheikha-v2-paging-phase2b-host-test"

"$OUT/sheikha-v2-paging-phase2b-host-test"

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

objdump -d "$OUT/sheikha_cr3.o" \
  >"$OUT/sheikha_cr3.disassembly.txt"

grep -Eq 'mov.*%cr3|mov.*cr3' \
  "$OUT/sheikha_cr3.disassembly.txt"
grep -Eq 'invlpg' \
  "$OUT/sheikha_cr3.disassembly.txt"

printf 'SHEIKHA_V2_UEFI_PAGING_RUNTIME_PHASE2B_HOST_MODEL_OK\n'
printf 'TWO_MIB_PAGE_MODEL_VERIFIED=true\n'
printf 'FOUR_GIB_IDENTITY_MAP_MODEL_VERIFIED=true\n'
printf 'EXPECTED_SIX_TABLE_TOPOLOGY_VERIFIED=true\n'
printf 'CR3_AND_INVLPG_STATE_MACHINE_HOST_STUB_VERIFIED=true\n'
printf 'PRIVILEGED_INSTRUCTIONS_EXECUTED_IN_HOST_TEST=false\n'
