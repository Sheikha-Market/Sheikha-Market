#include "sheikha_v2.h"
int sheikha_v2_scheduler_initialize(uint32_t quantum_us) {
  return quantum_us >= 100U && quantum_us <= 1000000U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
