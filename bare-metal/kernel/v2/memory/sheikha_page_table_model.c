#include "sheikha_v2_memory.h"

static bool aligned(uint64_t address) {
  return (address & (SHEIKHA_PAGE_SIZE - 1ULL)) == 0ULL;
}

static sheikha_page_mapping_t *find_mapping(sheikha_page_table_model_t *table, uint64_t virtual_page) {
  if (table == NULL || table->entries == NULL) {
    return NULL;
  }
  for (size_t index = 0U; index < table->capacity; index += 1U) {
    sheikha_page_mapping_t *entry = &table->entries[index];
    if (entry->active && entry->virtual_page == virtual_page) {
      return entry;
    }
  }
  return NULL;
}

static const sheikha_page_mapping_t *find_const_mapping(const sheikha_page_table_model_t *table, uint64_t virtual_page) {
  if (table == NULL || table->entries == NULL) {
    return NULL;
  }
  for (size_t index = 0U; index < table->capacity; index += 1U) {
    const sheikha_page_mapping_t *entry = &table->entries[index];
    if (entry->active && entry->virtual_page == virtual_page) {
      return entry;
    }
  }
  return NULL;
}

int sheikha_page_table_initialize(sheikha_page_table_model_t *table, sheikha_page_mapping_t *entries, size_t capacity) {
  if (table == NULL || entries == NULL || capacity == 0U) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  for (size_t index = 0U; index < capacity; index += 1U) {
    entries[index].virtual_page = 0ULL;
    entries[index].physical_frame = 0ULL;
    entries[index].flags = 0ULL;
    entries[index].active = false;
  }
  table->entries = entries;
  table->capacity = capacity;
  table->mapping_count = 0U;
  return SHEIKHA_MEMORY_OK;
}

int sheikha_page_map(sheikha_page_table_model_t *table, uint64_t virtual_address, uint64_t physical_address, uint64_t flags) {
  if (table == NULL || table->entries == NULL || !aligned(virtual_address) || !aligned(physical_address) || (flags & SHEIKHA_PAGE_PRESENT) == 0ULL) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  const uint64_t virtual_page = virtual_address / SHEIKHA_PAGE_SIZE;
  if (find_mapping(table, virtual_page) != NULL) {
    return SHEIKHA_MEMORY_ALREADY_MAPPED;
  }
  for (size_t index = 0U; index < table->capacity; index += 1U) {
    sheikha_page_mapping_t *entry = &table->entries[index];
    if (!entry->active) {
      entry->virtual_page = virtual_page;
      entry->physical_frame = physical_address / SHEIKHA_PAGE_SIZE;
      entry->flags = flags;
      entry->active = true;
      table->mapping_count += 1U;
      return SHEIKHA_MEMORY_OK;
    }
  }
  return SHEIKHA_MEMORY_EXHAUSTED;
}

int sheikha_page_unmap(sheikha_page_table_model_t *table, uint64_t virtual_address) {
  if (table == NULL || table->entries == NULL || !aligned(virtual_address)) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  const uint64_t virtual_page = virtual_address / SHEIKHA_PAGE_SIZE;
  sheikha_page_mapping_t *entry = find_mapping(table, virtual_page);
  if (entry == NULL) {
    return SHEIKHA_MEMORY_NOT_MAPPED;
  }
  entry->virtual_page = 0ULL;
  entry->physical_frame = 0ULL;
  entry->flags = 0ULL;
  entry->active = false;
  table->mapping_count -= 1U;
  return SHEIKHA_MEMORY_OK;
}

int sheikha_page_translate(const sheikha_page_table_model_t *table, uint64_t virtual_address, uint64_t *physical_address, uint64_t *flags) {
  if (table == NULL || table->entries == NULL || physical_address == NULL || flags == NULL) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  const uint64_t virtual_page = virtual_address / SHEIKHA_PAGE_SIZE;
  const uint64_t page_offset = virtual_address % SHEIKHA_PAGE_SIZE;
  const sheikha_page_mapping_t *entry = find_const_mapping(table, virtual_page);
  if (entry == NULL) {
    return SHEIKHA_MEMORY_NOT_MAPPED;
  }
  *physical_address = (entry->physical_frame * SHEIKHA_PAGE_SIZE) + page_offset;
  *flags = entry->flags;
  return SHEIKHA_MEMORY_OK;
}
