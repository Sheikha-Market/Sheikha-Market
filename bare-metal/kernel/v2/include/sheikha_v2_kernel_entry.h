#ifndef SHEIKHA_V2_KERNEL_ENTRY_H
#define SHEIKHA_V2_KERNEL_ENTRY_H

#include <stddef.h>
#include <stdint.h>

typedef struct {
  uint64_t memory_map_size;
  uint64_t memory_descriptor_size;
  uint64_t bootstrap_identity_bytes;
  uint64_t page_table_count;
  uint64_t paging_root_cr3;
  uint64_t previous_cr3;
  uint64_t active_cr3;
  uint64_t framebuffer_base;
  uint64_t framebuffer_size;
  uint64_t configuration_table_entries;
  uint32_t memory_descriptor_version;
  uint32_t uefi_revision;
  uint32_t firmware_revision;
  uint32_t framebuffer_width;
  uint32_t framebuffer_height;
  uint32_t framebuffer_pixels_per_scan_line;
  uint32_t framebuffer_pixel_format;
  uint8_t boot_services_exited;
  uint8_t paging_prepared;
  uint8_t cr3_loaded;
  uint8_t tlb_invalidation_executed;
  uint8_t framebuffer_available;
  uint8_t system_table_validated;
  uint8_t boot_services_active;
  uint8_t runtime_services_present;
  uint8_t console_output_available;
  uint8_t watchdog_disabled;
  uint8_t loaded_image_protocol_available;
  uint8_t device_path_protocol_available;
} SHEIKHA_V2_BOOT_INFO;

__attribute__((noreturn)) void sheikha_v2_kernel_entry(
  const SHEIKHA_V2_BOOT_INFO *boot_info
);

__attribute__((noreturn)) void sheikha_v2_halt_forever(void);

#endif
