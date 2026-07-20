#include "sheikha_x86_64_paging.h"

#include <stdint.h>

_Alignas(4096)
static sheikha_x86_64_page_table_t TABLES[16];

static int test_indices(void) {
  const uint64_t address =
    0xffff800012345678ULL;

  if (
    sheikha_x86_64_pml4_index(address) !=
      256U
  ) {
    return 1;
  }

  if (
    sheikha_x86_64_pdpt_index(address) !=
      0U
  ) {
    return 2;
  }

  if (
    sheikha_x86_64_pd_index(address) !=
      145U
  ) {
    return 3;
  }

  if (
    sheikha_x86_64_pt_index(address) !=
      325U
  ) {
    return 4;
  }

  if (!sheikha_x86_64_is_canonical(address)) {
    return 5;
  }

  if (
    sheikha_x86_64_is_canonical(
      0x0000800000000000ULL
    )
  ) {
    return 6;
  }

  return 0;
}

static int test_mapping(void) {
  sheikha_x86_64_page_table_pool_t pool;

  if (
    sheikha_x86_64_page_table_pool_initialize(
      &pool,
      TABLES,
      16U,
      0x100000ULL
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 10;
  }

  if (
    sheikha_x86_64_root_physical(&pool) !=
      0x100000ULL
  ) {
    return 11;
  }

  const uint64_t virtual_address =
    0xffff800000200000ULL;

  const uint64_t physical_address =
    0x00200000ULL;

  const uint64_t flags =
    SHEIKHA_X86_64_PAGE_WRITABLE |
    SHEIKHA_X86_64_PAGE_GLOBAL |
    SHEIKHA_X86_64_PAGE_NO_EXECUTE;

  if (
    sheikha_x86_64_map_4k(
      &pool,
      virtual_address,
      physical_address,
      flags
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 12;
  }

  if (pool.used != 4U) {
    return 13;
  }

  uint64_t translated = 0ULL;
  uint64_t translated_flags = 0ULL;

  if (
    sheikha_x86_64_translate(
      &pool,
      virtual_address + 0x321ULL,
      &translated,
      &translated_flags
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 14;
  }

  if (translated != physical_address + 0x321ULL) {
    return 15;
  }

  if (
    (
      translated_flags &
      SHEIKHA_X86_64_PAGE_NO_EXECUTE
    ) == 0ULL
  ) {
    return 16;
  }

  if (
    sheikha_x86_64_map_4k(
      &pool,
      virtual_address,
      0x00300000ULL,
      flags
    ) != SHEIKHA_X86_64_PAGING_ALREADY_MAPPED
  ) {
    return 17;
  }

  if (
    sheikha_x86_64_unmap_4k(
      &pool,
      virtual_address
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    return 18;
  }

  if (
    sheikha_x86_64_translate(
      &pool,
      virtual_address,
      &translated,
      &translated_flags
    ) != SHEIKHA_X86_64_PAGING_NOT_MAPPED
  ) {
    return 19;
  }

  return 0;
}

int main(void) {
  const int indices_result = test_indices();

  if (indices_result != 0) {
    return indices_result;
  }

  return test_mapping();
}
