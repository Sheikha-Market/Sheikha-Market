#ifndef SHEIKHA_V2_H
#define SHEIKHA_V2_H
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#define SHEIKHA_V2_OK 0
#define SHEIKHA_V2_INVALID_ARGUMENT (-1)
#define SHEIKHA_V2_VERIFICATION_PENDING (-2)
int sheikha_v2_memory_initialize(uint64_t bytes);
int sheikha_v2_paging_map(uint64_t va, uint64_t pa, uint64_t flags);
int sheikha_v2_interrupts_initialize(uint32_t vectors);
int sheikha_v2_scheduler_initialize(uint32_t quantum_us);
int sheikha_v2_process_initialize(uint32_t capacity);
int sheikha_v2_process_create(uint64_t entry, uint64_t stack);
int sheikha_v2_syscalls_initialize(uint32_t capacity);
int sheikha_v2_pci_initialize(uint32_t segments);
int sheikha_v2_block_initialize(uint32_t sector_size);
int sheikha_v2_vfs_mount_root(const char *filesystem_name);
int sheikha_v2_network_initialize(uint32_t mtu);
int sheikha_v2_secure_boot_verify(const uint8_t *image, size_t size, const uint8_t digest[32]);
int sheikha_v2_tpm_measure(uint32_t pcr_index, const uint8_t digest[32]);
#endif
