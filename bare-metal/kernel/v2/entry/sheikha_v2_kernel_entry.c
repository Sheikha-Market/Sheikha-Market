#include "sheikha_v2_kernel_entry.h"

#include "sheikha_contracts.h"
#include "sheikha_serial.h"

static bool framebuffer_is_writable(
  const SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    boot_info->framebuffer_available == 0U ||
    boot_info->framebuffer_base == 0ULL ||
    boot_info->framebuffer_width == 0U ||
    boot_info->framebuffer_height == 0U ||
    boot_info->framebuffer_pixels_per_scan_line <
      boot_info->framebuffer_width ||
    boot_info->framebuffer_pixel_format > 1U
  ) {
    return false;
  }

  const uint64_t required_bytes =
    (uint64_t)boot_info->framebuffer_pixels_per_scan_line *
    (uint64_t)boot_info->framebuffer_height *
    sizeof(uint32_t);

  return required_bytes <= boot_info->framebuffer_size;
}

static bool draw_native_boot_success(
  const SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (!framebuffer_is_writable(boot_info)) {
    return false;
  }

  volatile uint32_t *framebuffer =
    (volatile uint32_t *)(uintptr_t)boot_info->framebuffer_base;
  const uint32_t height = boot_info->framebuffer_height;
  const uint32_t width = boot_info->framebuffer_width;
  const uint32_t stride =
    boot_info->framebuffer_pixels_per_scan_line;
  const uint32_t bar_height = height < 64U ? 8U : 48U;
  const uint32_t start_row = height - bar_height;
  const uint32_t green = 0x003c9b5fU;
  const uint32_t white = 0x00f5f7f6U;

  for (uint32_t row = start_row; row < height; row += 1U) {
    const uint32_t color = row < start_row + 4U ? white : green;
    for (uint32_t column = 0U; column < width; column += 1U) {
      framebuffer[(uint64_t)row * stride + column] = color;
    }
  }

  return true;
}

__attribute__((noreturn)) void sheikha_v2_halt_forever(void) {
  __asm__ volatile("cli");
  for (;;) {
    __asm__ volatile("hlt");
  }
}

__attribute__((noreturn)) void sheikha_v2_kernel_entry(
  const SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    boot_info == NULL ||
    boot_info->boot_services_exited == 0U ||
    boot_info->system_table_validated == 0U ||
    boot_info->boot_services_active == 0U ||
    boot_info->paging_prepared == 0U ||
    boot_info->cr3_loaded == 0U ||
    boot_info->tlb_invalidation_executed == 0U ||
    boot_info->paging_root_cr3 == 0ULL ||
    boot_info->active_cr3 != boot_info->paging_root_cr3
  ) {
    sheikha_serial_write_line(
      "SHEIKHA_V2_KERNEL_HANDOFF_REJECTED"
    );
    sheikha_v2_halt_forever();
  }

  sheikha_serial_write_line("SHEIKHA_V2_PAGING_BOOT_OK");
  sheikha_serial_write_line("SHEIKHA_BARE_METAL_BOOT_OK");
  sheikha_serial_write_line("architecture=x86_64");
  sheikha_serial_write_line("boot_protocol=UEFI");
  sheikha_serial_write_line("boot_services=EXITED");
  sheikha_serial_write_line("uefi_system_table=VALIDATED");
  sheikha_serial_write_line("uefi_boot_services=CONSUMED_AND_EXITED");
  if (boot_info->runtime_services_present != 0U) {
    sheikha_serial_write_line("uefi_runtime_services=PRESENT_NOT_USED");
  }
  if (boot_info->console_output_available != 0U) {
    sheikha_serial_write_line("uefi_console=TEXT_OUTPUT_VERIFIED");
  }
  if (boot_info->watchdog_disabled != 0U) {
    sheikha_serial_write_line("uefi_watchdog=DISABLED_FOR_HANDOFF");
  }
  if (boot_info->loaded_image_protocol_available != 0U) {
    sheikha_serial_write_line("uefi_loaded_image=DISCOVERED");
  }
  if (boot_info->device_path_protocol_available != 0U) {
    sheikha_serial_write_line("uefi_device_path=DISCOVERED");
  }
  sheikha_serial_write_line("paging=x86_64_4_LEVEL");
  sheikha_serial_write_line("bootstrap_pages=2MiB_IDENTITY");
  sheikha_serial_write_line("cr3=LOADED_AND_READ_BACK");
  sheikha_serial_write_line("invlpg=EXECUTED");
  sheikha_serial_write_line(
    "kernel=SHEIKHA_SOVEREIGN_NATIVE_KERNEL_V2"
  );
  sheikha_serial_write_line("kernel_version=2.2.0-phase2b");
  sheikha_serial_write_line("governance_boundary=ACTIVE");
  sheikha_serial_write_line("ai_boot_control=DISABLED");
  sheikha_serial_write_line(
    "system_builder_boot_control=DISABLED"
  );
  sheikha_serial_write_line(
    "jannat_gardens_boot_control=DISABLED"
  );
  sheikha_serial_write_line(
    "product_layers=POST_BOOT_GOVERNED"
  );
  if (draw_native_boot_success(boot_info)) {
    sheikha_serial_write_line(
      "physical_display_indicator=GREEN_STATUS_BAR"
    );
  } else {
    sheikha_serial_write_line(
      "physical_display_indicator=UNAVAILABLE"
    );
  }
  sheikha_serial_write_line("linux_runtime_required=false");
  sheikha_serial_write_line("node_runtime_required=false");
  sheikha_serial_write_line(
    "boot_contract=" SHEIKHA_BOOT_CONTRACT_ID
  );
  sheikha_serial_write_line(
    "kernel_contract=" SHEIKHA_KERNEL_CONTRACT_ID
  );
  sheikha_serial_write_line(
    "hal_contract=" SHEIKHA_HAL_CONTRACT_ID
  );
  sheikha_serial_write_line(
    "language_contract=" SHEIKHA_LANGUAGE_BOOT_CONTRACT_ID
  );
  sheikha_serial_write_line(
    "governance_contract=" SHEIKHA_GOVERNANCE_CONTRACT_ID
  );
  sheikha_serial_write_line("runtime_state=CONTROLLED_HALT");
  sheikha_v2_halt_forever();
}
