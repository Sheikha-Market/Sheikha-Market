#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SRC="$ROOT/bare-metal/kernel/v2"
OUT="$SRC/build/memory-paging-phase1"
CC="${CC:-cc}"
mkdir -p "$OUT"
COMMON=(-std=c11 -Wall -Wextra -Werror -pedantic -ffreestanding -fno-stack-protector -fno-pie -mno-red-zone -I"$SRC/include")
"$CC" "${COMMON[@]}" -c "$SRC/memory/sheikha_frame_allocator.c" -o "$OUT/sheikha_frame_allocator.o"
"$CC" "${COMMON[@]}" -c "$SRC/memory/sheikha_page_table_model.c" -o "$OUT/sheikha_page_table_model.o"
"$CC" -std=c11 -Wall -Wextra -Werror -pedantic -fno-pie -no-pie -I"$SRC/include" "$SRC/memory/sheikha_memory_phase1_test.c" "$OUT/sheikha_frame_allocator.o" "$OUT/sheikha_page_table_model.o" -o "$OUT/sheikha-memory-paging-phase1-test"
"$OUT/sheikha-memory-paging-phase1-test"
printf 'SHEIKHA_V2_MEMORY_PAGING_PHASE1_BUILD_OK\n'
printf 'FRAME_ALLOCATOR_VERIFIED=true\n'
printf 'PAGE_TABLE_MODEL_VERIFIED=true\n'
printf 'TRANSLATION_AND_UNMAP_VERIFIED=true\n'
