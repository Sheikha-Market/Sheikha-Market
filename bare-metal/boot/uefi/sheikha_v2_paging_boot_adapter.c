#include "sheikha_v2_paging_boot_adapter.h"

static void reset_activation_state(
  sheikha_v2_paging_boot_context_t *context
) {
  context->root_cr3 =
    sheikha_x86_64_root_physical(
      &context->pool
    );
  context->previous_cr3 = 0ULL;
  context->active_cr3 = 0ULL;
  context->prepared =
    context->root_cr3 != 0ULL;
  context->activated = false;
  context->invalidation_executed = false;
}

int sheikha_v2_prepare_identity_map(
  sheikha_v2_paging_boot_context_t *context,
  sheikha_x86_64_page_table_t *tables,
  size_t table_capacity,
  uint64_t table_physical_base,
  uint64_t region_start,
  uint64_t region_size
) {
  if (
    context == NULL ||
    tables == NULL ||
    region_size == 0ULL ||
    (
      region_start &
      (SHEIKHA_X86_64_PAGE_SIZE - 1ULL)
    ) != 0ULL
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  int result =
    sheikha_x86_64_page_table_pool_initialize(
      &context->pool,
      tables,
      table_capacity,
      table_physical_base
    );

  if (result != SHEIKHA_X86_64_PAGING_OK) {
    return result;
  }

  const uint64_t rounded_size =
    (
      region_size +
      SHEIKHA_X86_64_PAGE_SIZE -
      1ULL
    ) &
    ~(SHEIKHA_X86_64_PAGE_SIZE - 1ULL);

  for (
    uint64_t offset = 0ULL;
    offset < rounded_size;
    offset += SHEIKHA_X86_64_PAGE_SIZE
  ) {
    result = sheikha_x86_64_map_4k(
      &context->pool,
      region_start + offset,
      region_start + offset,
      SHEIKHA_X86_64_PAGE_WRITABLE |
        SHEIKHA_X86_64_PAGE_NO_EXECUTE
    );

    if (result != SHEIKHA_X86_64_PAGING_OK) {
      return result;
    }
  }

  reset_activation_state(context);

  return context->prepared
    ? SHEIKHA_X86_64_PAGING_OK
    : SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
}

int sheikha_v2_prepare_bootstrap_identity_map_2m(
  sheikha_v2_paging_boot_context_t *context,
  sheikha_x86_64_page_table_t *tables,
  size_t table_capacity,
  uint64_t table_physical_base,
  uint64_t region_start,
  uint64_t region_size
) {
  if (
    context == NULL ||
    tables == NULL ||
    region_size == 0ULL ||
    (
      region_start &
      (SHEIKHA_X86_64_PAGE_2M_SIZE - 1ULL)
    ) != 0ULL ||
    region_size >
      UINT64_MAX -
      (SHEIKHA_X86_64_PAGE_2M_SIZE - 1ULL)
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  int result =
    sheikha_x86_64_page_table_pool_initialize(
      &context->pool,
      tables,
      table_capacity,
      table_physical_base
    );

  if (result != SHEIKHA_X86_64_PAGING_OK) {
    return result;
  }

  const uint64_t rounded_size =
    (
      region_size +
      SHEIKHA_X86_64_PAGE_2M_SIZE -
      1ULL
    ) &
    ~(SHEIKHA_X86_64_PAGE_2M_SIZE - 1ULL);

  if (region_start > UINT64_MAX - rounded_size) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  for (
    uint64_t offset = 0ULL;
    offset < rounded_size;
    offset += SHEIKHA_X86_64_PAGE_2M_SIZE
  ) {
    result = sheikha_x86_64_map_2m(
      &context->pool,
      region_start + offset,
      region_start + offset,
      SHEIKHA_X86_64_PAGE_WRITABLE
    );

    if (result != SHEIKHA_X86_64_PAGING_OK) {
      return result;
    }
  }

  reset_activation_state(context);

  return context->prepared
    ? SHEIKHA_X86_64_PAGING_OK
    : SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
}

/*
 * Deliberately not called by host tests.
 * This function must execute only in ring 0 after the UEFI
 * boot path proves ownership and validity of all mapped memory.
 */
int sheikha_v2_activate_prepared_paging(
  sheikha_v2_paging_boot_context_t *context
) {
  if (
    context == NULL ||
    !context->prepared ||
    context->root_cr3 == 0ULL
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  context->previous_cr3 =
    sheikha_x86_64_read_cr3();

  sheikha_x86_64_write_cr3(
    context->root_cr3
  );

  context->active_cr3 =
    sheikha_x86_64_read_cr3();

  context->activated =
    (
      context->active_cr3 &
      SHEIKHA_X86_64_ADDRESS_MASK
    ) ==
    (
      context->root_cr3 &
      SHEIKHA_X86_64_ADDRESS_MASK
    );

  return context->activated
    ? SHEIKHA_X86_64_PAGING_OK
    : SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
}

int sheikha_v2_invalidate_identity_address(
  sheikha_v2_paging_boot_context_t *context,
  const void *address
) {
  if (
    context == NULL ||
    address == NULL ||
    !context->activated
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  sheikha_x86_64_invalidate_page(address);
  context->invalidation_executed = true;

  return SHEIKHA_X86_64_PAGING_OK;
}
