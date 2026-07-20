#include "sheikha_v2.h"
int sheikha_v2_block_initialize(uint32_t sector_size) {
  return sector_size == 512U || sector_size == 4096U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
