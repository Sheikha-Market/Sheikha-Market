#include "sheikha_v2.h"
int sheikha_v2_network_initialize(uint32_t mtu) {
  return mtu >= 576U && mtu <= 9000U ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
