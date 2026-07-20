#ifndef SHEIKHA_X86_64_PAGING_H
#define SHEIKHA_X86_64_PAGING_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define SHEIKHA_X86_64_PAGE_SIZE 4096ULL
#define SHEIKHA_X86_64_PAGE_2M_SIZE (1ULL << 21)
#define SHEIKHA_X86_64_TABLE_ENTRIES 512ULL
#define SHEIKHA_X86_64_ADDRESS_MASK 0x000ffffffffff000ULL
#define SHEIKHA_X86_64_2M_ADDRESS_MASK 0x000fffffffe00000ULL

#define SHEIKHA_X86_64_PAGE_PRESENT (1ULL << 0)
#define SHEIKHA_X86_64_PAGE_WRITABLE (1ULL << 1)
#define SHEIKHA_X86_64_PAGE_USER (1ULL << 2)
#define SHEIKHA_X86_64_PAGE_WRITE_THROUGH (1ULL << 3)
#define SHEIKHA_X86_64_PAGE_CACHE_DISABLE (1ULL << 4)
#define SHEIKHA_X86_64_PAGE_ACCESSED (1ULL << 5)
#define SHEIKHA_X86_64_PAGE_DIRTY (1ULL << 6)
#define SHEIKHA_X86_64_PAGE_HUGE (1ULL << 7)
#define SHEIKHA_X86_64_PAGE_GLOBAL (1ULL << 8)
#define SHEIKHA_X86_64_PAGE_NO_EXECUTE (1ULL << 63)

#define SHEIKHA_X86_64_PAGING_OK 0
#define SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT (-1)
#define SHEIKHA_X86_64_PAGING_EXHAUSTED (-2)
#define SHEIKHA_X86_64_PAGING_ALREADY_MAPPED (-3)
#define SHEIKHA_X86_64_PAGING_NOT_MAPPED (-4)
#define SHEIKHA_X86_64_PAGING_NON_CANONICAL (-5)

typedef struct {
  uint64_t entries[SHEIKHA_X86_64_TABLE_ENTRIES];
} sheikha_x86_64_page_table_t;

typedef struct {
  sheikha_x86_64_page_table_t *tables;
  size_t capacity;
  size_t used;
  uint64_t physical_base;
} sheikha_x86_64_page_table_pool_t;

size_t sheikha_x86_64_pml4_index(uint64_t virtual_address);
size_t sheikha_x86_64_pdpt_index(uint64_t virtual_address);
size_t sheikha_x86_64_pd_index(uint64_t virtual_address);
size_t sheikha_x86_64_pt_index(uint64_t virtual_address);

bool sheikha_x86_64_is_canonical(uint64_t virtual_address);

int sheikha_x86_64_page_table_pool_initialize(
  sheikha_x86_64_page_table_pool_t *pool,
  sheikha_x86_64_page_table_t *tables,
  size_t capacity,
  uint64_t physical_base
);

uint64_t sheikha_x86_64_root_physical(
  const sheikha_x86_64_page_table_pool_t *pool
);

int sheikha_x86_64_map_4k(
  sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address,
  uint64_t physical_address,
  uint64_t leaf_flags
);

int sheikha_x86_64_map_2m(
  sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address,
  uint64_t physical_address,
  uint64_t leaf_flags
);

int sheikha_x86_64_unmap_4k(
  sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address
);

int sheikha_x86_64_translate(
  const sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address,
  uint64_t *physical_address,
  uint64_t *leaf_flags
);

uint64_t sheikha_x86_64_read_cr3(void);
void sheikha_x86_64_write_cr3(uint64_t value);
void sheikha_x86_64_invalidate_page(const void *address);

#endif
