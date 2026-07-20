#ifndef SHEIKHA_V2_MEMORY_H
#define SHEIKHA_V2_MEMORY_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define SHEIKHA_PAGE_SIZE 4096ULL
#define SHEIKHA_PAGE_PRESENT (1ULL << 0)
#define SHEIKHA_PAGE_WRITABLE (1ULL << 1)
#define SHEIKHA_PAGE_USER (1ULL << 2)
#define SHEIKHA_PAGE_NO_EXECUTE (1ULL << 63)

#define SHEIKHA_MEMORY_OK 0
#define SHEIKHA_MEMORY_INVALID_ARGUMENT (-1)
#define SHEIKHA_MEMORY_EXHAUSTED (-2)
#define SHEIKHA_MEMORY_ALREADY_MAPPED (-3)
#define SHEIKHA_MEMORY_NOT_MAPPED (-4)

typedef struct {
  uint64_t base_frame;
  uint64_t frame_count;
  uint64_t free_count;
  uint8_t *bitmap;
  size_t bitmap_bytes;
} sheikha_frame_allocator_t;

typedef struct {
  uint64_t virtual_page;
  uint64_t physical_frame;
  uint64_t flags;
  bool active;
} sheikha_page_mapping_t;

typedef struct {
  sheikha_page_mapping_t *entries;
  size_t capacity;
  size_t mapping_count;
} sheikha_page_table_model_t;

size_t sheikha_frame_bitmap_bytes(uint64_t frame_count);
int sheikha_frame_allocator_initialize(sheikha_frame_allocator_t *allocator, uint64_t base_frame, uint64_t frame_count, uint8_t *bitmap, size_t bitmap_bytes);
int sheikha_frame_reserve(sheikha_frame_allocator_t *allocator, uint64_t first_frame, uint64_t frame_count);
int sheikha_frame_allocate(sheikha_frame_allocator_t *allocator, uint64_t *frame);
int sheikha_frame_release(sheikha_frame_allocator_t *allocator, uint64_t frame);
bool sheikha_frame_is_allocated(const sheikha_frame_allocator_t *allocator, uint64_t frame);
int sheikha_page_table_initialize(sheikha_page_table_model_t *table, sheikha_page_mapping_t *entries, size_t capacity);
int sheikha_page_map(sheikha_page_table_model_t *table, uint64_t virtual_address, uint64_t physical_address, uint64_t flags);
int sheikha_page_unmap(sheikha_page_table_model_t *table, uint64_t virtual_address);
int sheikha_page_translate(const sheikha_page_table_model_t *table, uint64_t virtual_address, uint64_t *physical_address, uint64_t *flags);

#endif
