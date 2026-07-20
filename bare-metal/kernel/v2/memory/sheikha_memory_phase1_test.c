#include "sheikha_v2_memory.h"

#include <stdint.h>

static int test_frames(void) {
  uint8_t bitmap[16];
  sheikha_frame_allocator_t allocator;
  if (sheikha_frame_allocator_initialize(&allocator, 1024ULL, 128ULL, bitmap, sizeof(bitmap)) != SHEIKHA_MEMORY_OK) return 1;
  if (sheikha_frame_reserve(&allocator, 1024ULL, 4ULL) != SHEIKHA_MEMORY_OK) return 2;
  if (allocator.free_count != 124ULL) return 3;
  uint64_t frame = 0ULL;
  if (sheikha_frame_allocate(&allocator, &frame) != SHEIKHA_MEMORY_OK) return 4;
  if (frame != 1028ULL) return 5;
  if (!sheikha_frame_is_allocated(&allocator, frame)) return 6;
  if (sheikha_frame_release(&allocator, frame) != SHEIKHA_MEMORY_OK) return 7;
  if (sheikha_frame_is_allocated(&allocator, frame)) return 8;
  return 0;
}

static int test_pages(void) {
  sheikha_page_mapping_t entries[8];
  sheikha_page_table_model_t table;
  if (sheikha_page_table_initialize(&table, entries, 8U) != SHEIKHA_MEMORY_OK) return 20;
  if (sheikha_page_map(&table, 0x400000ULL, 0x200000ULL, SHEIKHA_PAGE_PRESENT | SHEIKHA_PAGE_WRITABLE | SHEIKHA_PAGE_NO_EXECUTE) != SHEIKHA_MEMORY_OK) return 21;
  uint64_t physical = 0ULL;
  uint64_t flags = 0ULL;
  if (sheikha_page_translate(&table, 0x400123ULL, &physical, &flags) != SHEIKHA_MEMORY_OK) return 22;
  if (physical != 0x200123ULL) return 23;
  if ((flags & SHEIKHA_PAGE_NO_EXECUTE) == 0ULL) return 24;
  if (sheikha_page_map(&table, 0x400000ULL, 0x300000ULL, SHEIKHA_PAGE_PRESENT) != SHEIKHA_MEMORY_ALREADY_MAPPED) return 25;
  if (sheikha_page_unmap(&table, 0x400000ULL) != SHEIKHA_MEMORY_OK) return 26;
  if (sheikha_page_translate(&table, 0x400123ULL, &physical, &flags) != SHEIKHA_MEMORY_NOT_MAPPED) return 27;
  return 0;
}

int main(void) {
  const int frame_result = test_frames();
  return frame_result == 0 ? test_pages() : frame_result;
}
