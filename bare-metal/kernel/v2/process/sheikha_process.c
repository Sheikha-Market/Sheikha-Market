#include "sheikha_v2.h"
int sheikha_v2_process_initialize(uint32_t capacity) {
  return capacity >= 1U && capacity <= 65535U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
int sheikha_v2_process_create(uint64_t entry, uint64_t stack) {
  return entry != 0ULL && (stack & 15ULL) == 0ULL ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
