#include "sheikha_v2_memory.h"

static bool valid_allocator(const sheikha_frame_allocator_t *allocator) {
  return allocator != NULL && allocator->bitmap != NULL && allocator->frame_count > 0ULL && allocator->bitmap_bytes >= sheikha_frame_bitmap_bytes(allocator->frame_count);
}

static bool frame_index(const sheikha_frame_allocator_t *allocator, uint64_t frame, uint64_t *index) {
  if (!valid_allocator(allocator) || index == NULL || frame < allocator->base_frame) {
    return false;
  }
  const uint64_t candidate = frame - allocator->base_frame;
  if (candidate >= allocator->frame_count) {
    return false;
  }
  *index = candidate;
  return true;
}

static bool bitmap_get(const uint8_t *bitmap, uint64_t index) {
  const uint64_t byte_index = index / 8ULL;
  const uint8_t bit_mask = (uint8_t)(1U << (uint8_t)(index % 8ULL));
  return (bitmap[byte_index] & bit_mask) != 0U;
}

static void bitmap_set(uint8_t *bitmap, uint64_t index, bool value) {
  const uint64_t byte_index = index / 8ULL;
  const uint8_t bit_mask = (uint8_t)(1U << (uint8_t)(index % 8ULL));
  if (value) {
    bitmap[byte_index] |= bit_mask;
  } else {
    bitmap[byte_index] &= (uint8_t)(~bit_mask);
  }
}

size_t sheikha_frame_bitmap_bytes(uint64_t frame_count) {
  return (size_t)((frame_count + 7ULL) / 8ULL);
}

int sheikha_frame_allocator_initialize(sheikha_frame_allocator_t *allocator, uint64_t base_frame, uint64_t frame_count, uint8_t *bitmap, size_t bitmap_bytes) {
  if (allocator == NULL || bitmap == NULL || frame_count == 0ULL || bitmap_bytes < sheikha_frame_bitmap_bytes(frame_count)) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  for (size_t index = 0U; index < bitmap_bytes; index += 1U) {
    bitmap[index] = 0U;
  }
  allocator->base_frame = base_frame;
  allocator->frame_count = frame_count;
  allocator->free_count = frame_count;
  allocator->bitmap = bitmap;
  allocator->bitmap_bytes = bitmap_bytes;
  return SHEIKHA_MEMORY_OK;
}

int sheikha_frame_reserve(sheikha_frame_allocator_t *allocator, uint64_t first_frame, uint64_t frame_count) {
  if (!valid_allocator(allocator) || frame_count == 0ULL) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  uint64_t first_index = 0ULL;
  if (!frame_index(allocator, first_frame, &first_index) || first_index + frame_count > allocator->frame_count || first_index + frame_count < first_index) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  for (uint64_t offset = 0ULL; offset < frame_count; offset += 1ULL) {
    const uint64_t index = first_index + offset;
    if (!bitmap_get(allocator->bitmap, index)) {
      bitmap_set(allocator->bitmap, index, true);
      allocator->free_count -= 1ULL;
    }
  }
  return SHEIKHA_MEMORY_OK;
}

int sheikha_frame_allocate(sheikha_frame_allocator_t *allocator, uint64_t *frame) {
  if (!valid_allocator(allocator) || frame == NULL) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  if (allocator->free_count == 0ULL) {
    return SHEIKHA_MEMORY_EXHAUSTED;
  }
  for (uint64_t index = 0ULL; index < allocator->frame_count; index += 1ULL) {
    if (!bitmap_get(allocator->bitmap, index)) {
      bitmap_set(allocator->bitmap, index, true);
      allocator->free_count -= 1ULL;
      *frame = allocator->base_frame + index;
      return SHEIKHA_MEMORY_OK;
    }
  }
  return SHEIKHA_MEMORY_EXHAUSTED;
}

int sheikha_frame_release(sheikha_frame_allocator_t *allocator, uint64_t frame) {
  uint64_t index = 0ULL;
  if (!frame_index(allocator, frame, &index) || !bitmap_get(allocator->bitmap, index)) {
    return SHEIKHA_MEMORY_INVALID_ARGUMENT;
  }
  bitmap_set(allocator->bitmap, index, false);
  allocator->free_count += 1ULL;
  return SHEIKHA_MEMORY_OK;
}

bool sheikha_frame_is_allocated(const sheikha_frame_allocator_t *allocator, uint64_t frame) {
  uint64_t index = 0ULL;
  return frame_index(allocator, frame, &index) && bitmap_get(allocator->bitmap, index);
}
