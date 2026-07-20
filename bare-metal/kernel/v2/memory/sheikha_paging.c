#include "sheikha_v2.h"
int sheikha_v2_paging_map(uint64_t va, uint64_t pa, uint64_t flags) {
  const uint64_t mask = 4095ULL;
  return ((va & mask) == 0ULL && (pa & mask) == 0ULL && (flags & 1ULL) != 0ULL)
    ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
