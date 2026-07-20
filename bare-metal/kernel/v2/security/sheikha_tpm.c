#include "sheikha_v2.h"
int sheikha_v2_tpm_measure(uint32_t pcr_index, const uint8_t digest[32]) {
  if (digest == NULL || pcr_index > 23U) return SHEIKHA_V2_INVALID_ARGUMENT;
  return SHEIKHA_V2_VERIFICATION_PENDING;
}
