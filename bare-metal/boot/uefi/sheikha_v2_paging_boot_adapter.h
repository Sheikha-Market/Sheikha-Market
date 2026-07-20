#ifndef SHEIKHA_V2_PAGING_BOOT_ADAPTER_H
#define SHEIKHA_V2_PAGING_BOOT_ADAPTER_H

#include "sheikha_x86_64_paging.h"

typedef struct {
  sheikha_x86_64_page_table_pool_t pool;
  uint64_t root_cr3;
  uint64_t previous_cr3;
  uint64_t active_cr3;
  bool prepared;
  bool activated;
  bool invalidation_executed;
} sheikha_v2_paging_boot_context_t;

int sheikha_v2_prepare_identity_map(
  sheikha_v2_paging_boot_context_t *context,
  sheikha_x86_64_page_table_t *tables,
  size_t table_capacity,
  uint64_t table_physical_base,
  uint64_t region_start,
  uint64_t region_size
);

int sheikha_v2_prepare_bootstrap_identity_map_2m(
  sheikha_v2_paging_boot_context_t *context,
  sheikha_x86_64_page_table_t *tables,
  size_t table_capacity,
  uint64_t table_physical_base,
  uint64_t region_start,
  uint64_t region_size
);

int sheikha_v2_activate_prepared_paging(
  sheikha_v2_paging_boot_context_t *context
);

int sheikha_v2_invalidate_identity_address(
  sheikha_v2_paging_boot_context_t *context,
  const void *address
);

#endif
