#include "sheikha_v2.h"
int sheikha_v2_secure_boot_verify(const uint8_t *image, size_t size, const uint8_t digest[32]) {
  if (image == NULL || digest == NULL || size == 0U) return SHEIKHA_V2_INVALID_ARGUMENT;
  return SHEIKHA_V2_VERIFICATION_PENDING;
}
