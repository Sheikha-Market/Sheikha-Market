#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SRC="$ROOT/bare-metal/kernel/v2"
OUT="$SRC/build"
CC="${CC:-cc}"
mkdir -p "$OUT"
rm -f "$OUT"/*.o "$OUT"/sheikha-v2-smoke
FLAGS=(-std=c11 -Wall -Wextra -Werror -ffreestanding -fno-stack-protector -fno-pie -mno-red-zone -I"$SRC/include")
SOURCES=(
  "$SRC/memory/sheikha_memory.c"
  "$SRC/memory/sheikha_paging.c"
  "$SRC/interrupts/sheikha_idt.c"
  "$SRC/scheduler/sheikha_scheduler.c"
  "$SRC/process/sheikha_process.c"
  "$SRC/syscalls/sheikha_syscall.c"
  "$SRC/drivers/pci/sheikha_pci.c"
  "$SRC/storage/sheikha_block.c"
  "$SRC/fs/sheikha_vfs.c"
  "$SRC/network/sheikha_network.c"
  "$SRC/security/sheikha_secure_boot.c"
  "$SRC/security/sheikha_tpm.c"
)
OBJECTS=()
for source in "${SOURCES[@]}"; do
  object="$OUT/$(printf '%s' "${source#"$SRC/"}" | tr '/.' '__').o"
  "$CC" "${FLAGS[@]}" -c "$source" -o "$object"
  OBJECTS+=("$object")
done
"$CC" -std=c11 -Wall -Wextra -Werror -fno-pie -no-pie -I"$SRC/include" \
  "$SRC/sheikha_v2_smoke.c" "${OBJECTS[@]}" -o "$OUT/sheikha-v2-smoke"
"$OUT/sheikha-v2-smoke"
echo "SHEIKHA_V2_FOUNDATION_BUILD_OK"
echo "OBJECT_COUNT=${#OBJECTS[@]}"
echo "SMOKE_TEST_PASSED=true"
