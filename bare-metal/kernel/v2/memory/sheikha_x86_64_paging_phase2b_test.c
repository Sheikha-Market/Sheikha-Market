#include "sheikha_v2_paging_boot_adapter.h"

#include <stdint.h>

_Alignas(4096)
static sheikha_x86_64_page_table_t TABLES[8];

static uint64_t fake_cr3 = 0x9000ULL;
static unsigned int invalidation_count = 0U;

uint64_t sheikha_x86_64_read_cr3(void) {
  return fake_cr3;
}

void sheikha_x86_64_write_cr3(uint64_t value) {
  fake_cr3 = value;
}

void sheikha_x86_64_invalidate_page(
  const void *address
) {
  if (address != NULL) {
    invalidation_count += 1U;
  }
}

static int expect_identity_translation(
  const sheikha_v2_paging_boot_context_t *context,
  uint64_t address
) {
  uint64_t translated = 0ULL;
  uint64_t flags = 0ULL;

  if (
    sheikha_x86_64_translate(
      &context->pool,
      address,
      &translated,
      &flags
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 1;
  }

  if (translated != address) {
    return 2;
  }

  if (
    (flags & SHEIKHA_X86_64_PAGE_HUGE) == 0ULL ||
    (flags & SHEIKHA_X86_64_PAGE_WRITABLE) == 0ULL ||
    (flags & SHEIKHA_X86_64_PAGE_NO_EXECUTE) != 0ULL
  ) {
    return 3;
  }

  return 0;
}

int main(void) {
  sheikha_v2_paging_boot_context_t context = {0};

  if (
    sheikha_v2_prepare_bootstrap_identity_map_2m(
      &context,
      TABLES,
      8U,
      0x200000ULL,
      0ULL,
      0x100000000ULL
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 10;
  }

  if (
    !context.prepared ||
    context.activated ||
    context.pool.used != 6U ||
    context.root_cr3 != 0x200000ULL
  ) {
    return 11;
  }

  const uint64_t samples[] = {
    0x0000000000001234ULL,
    0x000000003fffffffULL,
    0x0000000087654321ULL,
    0x00000000ffffffffULL,
  };

  for (
    size_t index = 0U;
    index < sizeof(samples) / sizeof(samples[0]);
    index += 1U
  ) {
    const int result =
      expect_identity_translation(
        &context,
        samples[index]
      );

    if (result != 0) {
      return 20 + result;
    }
  }

  if (
    sheikha_x86_64_map_2m(
      &context.pool,
      0ULL,
      0ULL,
      SHEIKHA_X86_64_PAGE_WRITABLE
    ) != SHEIKHA_X86_64_PAGING_ALREADY_MAPPED
  ) {
    return 30;
  }

  if (
    sheikha_x86_64_map_2m(
      &context.pool,
      0x1000ULL,
      0ULL,
      SHEIKHA_X86_64_PAGE_WRITABLE
    ) != SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT
  ) {
    return 31;
  }

  if (
    sheikha_v2_activate_prepared_paging(
      &context
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 40;
  }

  if (
    !context.activated ||
    context.previous_cr3 != 0x9000ULL ||
    context.active_cr3 != context.root_cr3
  ) {
    return 41;
  }

  if (
    sheikha_v2_invalidate_identity_address(
      &context,
      &TABLES[0]
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 42;
  }

  if (
    !context.invalidation_executed ||
    invalidation_count != 1U
  ) {
    return 43;
  }

  return 0;
}
