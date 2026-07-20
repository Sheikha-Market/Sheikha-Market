#include "sheikha_v2.h"
int sheikha_v2_memory_initialize(uint64_t bytes) {
  return bytes >= (64ULL * 1024ULL * 1024ULL) ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
