#ifndef SHEIKHA_LANGUAGE_NATIVE_ABI_V1_H
#define SHEIKHA_LANGUAGE_NATIVE_ABI_V1_H

#include <stdint.h>

uint32_t sheikha_native_contract_version(void);
uint32_t sheikha_native_governance_ready(void);
uint32_t sheikha_native_kernel_handoff_allowed(uint32_t boot_services_exited);
uint32_t sheikha_native_kernel_mode(void);

#endif
