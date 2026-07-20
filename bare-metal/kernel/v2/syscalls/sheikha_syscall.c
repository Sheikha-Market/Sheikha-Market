#include "sheikha_v2.h"
int sheikha_v2_syscalls_initialize(uint32_t capacity) {
  return capacity >= 1U && capacity <= 1024U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
