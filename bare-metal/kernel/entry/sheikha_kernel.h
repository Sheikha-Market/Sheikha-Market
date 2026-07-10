#ifndef SHEIKHA_KERNEL_H
#define SHEIKHA_KERNEL_H

#include <stdint.h>

typedef struct {
    uint64_t memory_map_size;
    uint64_t memory_descriptor_size;
    uint32_t memory_descriptor_version;
    uint8_t boot_services_exited;
} SHEIKHA_BOOT_INFO;

__attribute__((noreturn)) void sheikha_kernel_entry(const SHEIKHA_BOOT_INFO *boot_info);
__attribute__((noreturn)) void sheikha_halt_forever(void);

#endif
