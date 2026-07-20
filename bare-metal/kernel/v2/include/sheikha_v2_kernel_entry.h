#ifndef SHEIKHA_V2_KERNEL_ENTRY_H
#define SHEIKHA_V2_KERNEL_ENTRY_H

#include <stddef.h>
#include <stdint.h>

typedef struct {
  uint64_t memory_map_size;
  uint64_t memory_descriptor_size;
  uint64_t bootstrap_identity_bytes;
  uint64_t page_table_count;
  uint64_t paging_root_cr3;
  uint64_t previous_cr3;
  uint64_t active_cr3;
  uint32_t memory_descriptor_version;
  uint8_t boot_services_exited;
  uint8_t paging_prepared;
  uint8_t cr3_loaded;
  uint8_t tlb_invalidation_executed;
} SHEIKHA_V2_BOOT_INFO;

__attribute__((noreturn)) void sheikha_v2_kernel_entry(
  const SHEIKHA_V2_BOOT_INFO *boot_info
);

__attribute__((noreturn)) void sheikha_v2_halt_forever(void);

#endif
