#include "sheikha_v2.h"
int sheikha_v2_pci_initialize(uint32_t segments) {
  return segments >= 1U && segments <= 256U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
