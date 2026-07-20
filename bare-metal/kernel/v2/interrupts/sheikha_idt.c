#include "sheikha_v2.h"
int sheikha_v2_interrupts_initialize(uint32_t vectors) {
  return vectors >= 32U && vectors <= 256U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
