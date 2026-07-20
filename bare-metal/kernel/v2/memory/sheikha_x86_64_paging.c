#include "sheikha_x86_64_paging.h"

_Static_assert(
  sizeof(sheikha_x86_64_page_table_t) ==
    SHEIKHA_X86_64_PAGE_SIZE,
  "x86_64 page table must be exactly 4096 bytes"
);

static bool aligned_4k(uint64_t address) {
  return (
    address & (SHEIKHA_X86_64_PAGE_SIZE - 1ULL)
  ) == 0ULL;
}

static uint64_t table_physical(
  const sheikha_x86_64_page_table_pool_t *pool,
  size_t table_index
) {
  return pool->physical_base +
    (
      (uint64_t)table_index *
      SHEIKHA_X86_64_PAGE_SIZE
    );
}

static int physical_to_table_index(
  const sheikha_x86_64_page_table_pool_t *pool,
  uint64_t physical_address,
  size_t *table_index
) {
  if (
    pool == NULL ||
    table_index == NULL ||
    physical_address < pool->physical_base
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  const uint64_t offset =
    physical_address - pool->physical_base;

  if (
    !aligned_4k(offset) ||
    offset / SHEIKHA_X86_64_PAGE_SIZE >=
      pool->capacity
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  *table_index = (size_t)(
    offset / SHEIKHA_X86_64_PAGE_SIZE
  );

  return SHEIKHA_X86_64_PAGING_OK;
}

static int allocate_table(
  sheikha_x86_64_page_table_pool_t *pool,
  size_t *table_index
) {
  if (
    pool == NULL ||
    table_index == NULL ||
    pool->tables == NULL
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  if (pool->used >= pool->capacity) {
    return SHEIKHA_X86_64_PAGING_EXHAUSTED;
  }

  const size_t index = pool->used;
  pool->used += 1U;

  for (
    size_t entry = 0U;
    entry < SHEIKHA_X86_64_TABLE_ENTRIES;
    entry += 1U
  ) {
    pool->tables[index].entries[entry] = 0ULL;
  }

  *table_index = index;
  return SHEIKHA_X86_64_PAGING_OK;
}

static int get_or_create_child(
  sheikha_x86_64_page_table_pool_t *pool,
  size_t parent_index,
  size_t entry_index,
  uint64_t intermediate_flags,
  size_t *child_index
) {
  uint64_t *entry =
    &pool->tables[parent_index].entries[entry_index];

  if ((*entry & SHEIKHA_X86_64_PAGE_PRESENT) != 0ULL) {
    if ((*entry & SHEIKHA_X86_64_PAGE_HUGE) != 0ULL) {
      return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
    }

    return physical_to_table_index(
      pool,
      *entry & SHEIKHA_X86_64_ADDRESS_MASK,
      child_index
    );
  }

  int result = allocate_table(
    pool,
    child_index
  );

  if (result != SHEIKHA_X86_64_PAGING_OK) {
    return result;
  }

  *entry =
    (
      table_physical(pool, *child_index) &
      SHEIKHA_X86_64_ADDRESS_MASK
    ) |
    intermediate_flags |
    SHEIKHA_X86_64_PAGE_PRESENT;

  return SHEIKHA_X86_64_PAGING_OK;
}

size_t sheikha_x86_64_pml4_index(
  uint64_t virtual_address
) {
  return (size_t)(
    (virtual_address >> 39U) & 0x1ffULL
  );
}

size_t sheikha_x86_64_pdpt_index(
  uint64_t virtual_address
) {
  return (size_t)(
    (virtual_address >> 30U) & 0x1ffULL
  );
}

size_t sheikha_x86_64_pd_index(
  uint64_t virtual_address
) {
  return (size_t)(
    (virtual_address >> 21U) & 0x1ffULL
  );
}

size_t sheikha_x86_64_pt_index(
  uint64_t virtual_address
) {
  return (size_t)(
    (virtual_address >> 12U) & 0x1ffULL
  );
}

bool sheikha_x86_64_is_canonical(
  uint64_t virtual_address
) {
  const uint64_t top =
    virtual_address >> 48U;

  const bool sign_bit =
    (
      virtual_address &
      (1ULL << 47U)
    ) != 0ULL;

  return sign_bit
    ? top == 0xffffULL
    : top == 0ULL;
}

int sheikha_x86_64_page_table_pool_initialize(
  sheikha_x86_64_page_table_pool_t *pool,
  sheikha_x86_64_page_table_t *tables,
  size_t capacity,
  uint64_t physical_base
) {
  if (
    pool == NULL ||
    tables == NULL ||
    capacity < 4U ||
    !aligned_4k(physical_base)
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  pool->tables = tables;
  pool->capacity = capacity;
  pool->used = 0U;
  pool->physical_base = physical_base;

  size_t root_index = 0U;

  const int result = allocate_table(
    pool,
    &root_index
  );

  if (
    result != SHEIKHA_X86_64_PAGING_OK ||
    root_index != 0U
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  return SHEIKHA_X86_64_PAGING_OK;
}

uint64_t sheikha_x86_64_root_physical(
  const sheikha_x86_64_page_table_pool_t *pool
) {
  if (
    pool == NULL ||
    pool->tables == NULL ||
    pool->used == 0U
  ) {
    return 0ULL;
  }

  return pool->physical_base;
}

int sheikha_x86_64_map_4k(
  sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address,
  uint64_t physical_address,
  uint64_t leaf_flags
) {
  if (
    pool == NULL ||
    pool->tables == NULL ||
    !sheikha_x86_64_is_canonical(
      virtual_address
    ) ||
    !aligned_4k(virtual_address) ||
    !aligned_4k(physical_address)
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  uint64_t intermediate_flags =
    SHEIKHA_X86_64_PAGE_WRITABLE;

  if (
    (
      leaf_flags &
      SHEIKHA_X86_64_PAGE_USER
    ) != 0ULL
  ) {
    intermediate_flags |=
      SHEIKHA_X86_64_PAGE_USER;
  }

  size_t pdpt = 0U;
  size_t pd = 0U;
  size_t pt = 0U;

  int result = get_or_create_child(
    pool,
    0U,
    sheikha_x86_64_pml4_index(
      virtual_address
    ),
    intermediate_flags,
    &pdpt
  );

  if (result != SHEIKHA_X86_64_PAGING_OK) {
    return result;
  }

  result = get_or_create_child(
    pool,
    pdpt,
    sheikha_x86_64_pdpt_index(
      virtual_address
    ),
    intermediate_flags,
    &pd
  );

  if (result != SHEIKHA_X86_64_PAGING_OK) {
    return result;
  }

  result = get_or_create_child(
    pool,
    pd,
    sheikha_x86_64_pd_index(
      virtual_address
    ),
    intermediate_flags,
    &pt
  );

  if (result != SHEIKHA_X86_64_PAGING_OK) {
    return result;
  }

  uint64_t *leaf =
    &pool->tables[pt].entries[
      sheikha_x86_64_pt_index(
        virtual_address
      )
    ];

  if ((*leaf & SHEIKHA_X86_64_PAGE_PRESENT) != 0ULL) {
    return SHEIKHA_X86_64_PAGING_ALREADY_MAPPED;
  }

  *leaf =
    (
      physical_address &
      SHEIKHA_X86_64_ADDRESS_MASK
    ) |
    leaf_flags |
    SHEIKHA_X86_64_PAGE_PRESENT;

  return SHEIKHA_X86_64_PAGING_OK;
}

int sheikha_x86_64_translate(
  const sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address,
  uint64_t *physical_address,
  uint64_t *leaf_flags
) {
  if (
    pool == NULL ||
    pool->tables == NULL ||
    physical_address == NULL ||
    leaf_flags == NULL ||
    !sheikha_x86_64_is_canonical(
      virtual_address
    )
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  const size_t indices[4] = {
    sheikha_x86_64_pml4_index(
      virtual_address
    ),
    sheikha_x86_64_pdpt_index(
      virtual_address
    ),
    sheikha_x86_64_pd_index(
      virtual_address
    ),
    sheikha_x86_64_pt_index(
      virtual_address
    ),
  };

  size_t table_index = 0U;

  for (size_t level = 0U; level < 3U; level += 1U) {
    const uint64_t entry =
      pool->tables[table_index].entries[
        indices[level]
      ];

    if (
      (entry & SHEIKHA_X86_64_PAGE_PRESENT) ==
        0ULL ||
      (entry & SHEIKHA_X86_64_PAGE_HUGE) !=
        0ULL
    ) {
      return SHEIKHA_X86_64_PAGING_NOT_MAPPED;
    }

    const int result =
      physical_to_table_index(
        pool,
        entry &
          SHEIKHA_X86_64_ADDRESS_MASK,
        &table_index
      );

    if (result != SHEIKHA_X86_64_PAGING_OK) {
      return result;
    }
  }

  const uint64_t leaf =
    pool->tables[table_index].entries[
      indices[3]
    ];

  if (
    (leaf & SHEIKHA_X86_64_PAGE_PRESENT) ==
      0ULL
  ) {
    return SHEIKHA_X86_64_PAGING_NOT_MAPPED;
  }

  *physical_address =
    (
      leaf &
      SHEIKHA_X86_64_ADDRESS_MASK
    ) |
    (
      virtual_address &
      (SHEIKHA_X86_64_PAGE_SIZE - 1ULL)
    );

  *leaf_flags =
    leaf &
    ~SHEIKHA_X86_64_ADDRESS_MASK;

  return SHEIKHA_X86_64_PAGING_OK;
}

int sheikha_x86_64_unmap_4k(
  sheikha_x86_64_page_table_pool_t *pool,
  uint64_t virtual_address
) {
  if (
    pool == NULL ||
    pool->tables == NULL ||
    !sheikha_x86_64_is_canonical(
      virtual_address
    ) ||
    !aligned_4k(virtual_address)
  ) {
    return SHEIKHA_X86_64_PAGING_INVALID_ARGUMENT;
  }

  const size_t indices[4] = {
    sheikha_x86_64_pml4_index(
      virtual_address
    ),
    sheikha_x86_64_pdpt_index(
      virtual_address
    ),
    sheikha_x86_64_pd_index(
      virtual_address
    ),
    sheikha_x86_64_pt_index(
      virtual_address
    ),
  };

  size_t table_index = 0U;

  for (size_t level = 0U; level < 3U; level += 1U) {
    const uint64_t entry =
      pool->tables[table_index].entries[
        indices[level]
      ];

    if (
      (entry & SHEIKHA_X86_64_PAGE_PRESENT) ==
        0ULL
    ) {
      return SHEIKHA_X86_64_PAGING_NOT_MAPPED;
    }

    const int result =
      physical_to_table_index(
        pool,
        entry &
          SHEIKHA_X86_64_ADDRESS_MASK,
        &table_index
      );

    if (result != SHEIKHA_X86_64_PAGING_OK) {
      return result;
    }
  }

  uint64_t *leaf =
    &pool->tables[table_index].entries[
      indices[3]
    ];

  if (
    (*leaf & SHEIKHA_X86_64_PAGE_PRESENT) ==
      0ULL
  ) {
    return SHEIKHA_X86_64_PAGING_NOT_MAPPED;
  }

  *leaf = 0ULL;
  return SHEIKHA_X86_64_PAGING_OK;
}
