#include "sheikha_uefi.h"

#include "sheikha_serial.h"
#include "sheikha_v2_kernel_entry.h"
#include "sheikha_v2_paging_boot_adapter.h"

enum {
  MEMORY_MAP_CAPACITY = 128 * 1024,
  EXIT_BOOT_SERVICES_ATTEMPTS = 2,
  BOOTSTRAP_PAGE_TABLE_CAPACITY = 8,
};

static const uint64_t BOOTSTRAP_IDENTITY_BYTES =
  0x100000000ULL;

static uint8_t memory_map[MEMORY_MAP_CAPACITY]
  __attribute__((aligned(16)));

_Alignas(4096)
static sheikha_x86_64_page_table_t
  bootstrap_page_tables[BOOTSTRAP_PAGE_TABLE_CAPACITY];

static sheikha_v2_paging_boot_context_t paging_context;

static const EFI_GUID graphics_output_protocol_guid = {
  0x9042a9deU,
  0x23dcU,
  0x4a38U,
  {0x96U, 0xfbU, 0x7aU, 0xdeU, 0xd0U, 0x80U, 0x51U, 0x6aU},
};

static const EFI_GUID loaded_image_protocol_guid = {
  0x5b1b31a1U,
  0x9562U,
  0x11d2U,
  {0x8eU, 0x3fU, 0x00U, 0xa0U, 0xc9U, 0x69U, 0x72U, 0x3bU},
};

static const EFI_GUID device_path_protocol_guid = {
  0x09576e91U,
  0x6d3fU,
  0x11d2U,
  {0x8eU, 0x39U, 0x00U, 0xa0U, 0xc9U, 0x69U, 0x72U, 0x3bU},
};

static bool console_write(
  EFI_SYSTEM_TABLE *system_table,
  const CHAR16 *text
) {
  if (
    system_table != NULL &&
    system_table->con_out != NULL &&
    system_table->con_out->output_string != NULL
  ) {
    return !EFI_ERROR(system_table->con_out->output_string(
      system_table->con_out,
      text
    ));
  }
  return false;
}

static bool table_header_is_valid(
  const EFI_TABLE_HEADER *header,
  uint64_t signature,
  uint32_t minimum_size
) {
  return
    header != NULL &&
    header->signature == signature &&
    header->revision != 0U &&
    header->header_size >= minimum_size &&
    header->header_size <= 4096U &&
    header->reserved == 0U;
}

static bool validate_uefi_tables(
  EFI_SYSTEM_TABLE *system_table,
  SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    system_table == NULL ||
    boot_info == NULL ||
    !table_header_is_valid(
      &system_table->header,
      EFI_SYSTEM_TABLE_SIGNATURE,
      sizeof(EFI_SYSTEM_TABLE)
    ) ||
    system_table->boot_services == NULL ||
    !table_header_is_valid(
      &system_table->boot_services->header,
      EFI_BOOT_SERVICES_SIGNATURE,
      (uint32_t)(
        offsetof(EFI_BOOT_SERVICES, locate_protocol) +
        sizeof(system_table->boot_services->locate_protocol)
      )
    )
  ) {
    return false;
  }

  boot_info->uefi_revision = system_table->header.revision;
  boot_info->firmware_revision = system_table->firmware_revision;
  boot_info->configuration_table_entries =
    system_table->number_of_table_entries;
  boot_info->system_table_validated = 1U;
  boot_info->boot_services_active = 1U;

  if (
    system_table->runtime_services != NULL &&
    table_header_is_valid(
      &system_table->runtime_services->header,
      EFI_RUNTIME_SERVICES_SIGNATURE,
      sizeof(EFI_TABLE_HEADER)
    )
  ) {
    boot_info->runtime_services_present = 1U;
  }

  return true;
}

static void disable_firmware_watchdog(
  EFI_SYSTEM_TABLE *system_table,
  SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    system_table == NULL ||
    system_table->boot_services == NULL ||
    system_table->boot_services->set_watchdog_timer == NULL ||
    boot_info == NULL
  ) {
    return;
  }

  const EFI_STATUS status =
    system_table->boot_services->set_watchdog_timer(
      0U,
      0ULL,
      0U,
      NULL
    );
  if (!EFI_ERROR(status)) {
    boot_info->watchdog_disabled = 1U;
    sheikha_serial_write_line(
      "SHEIKHA_UEFI_WATCHDOG_DISABLED"
    );
  }
}

static void discover_loaded_image_and_device_path(
  EFI_HANDLE image_handle,
  EFI_SYSTEM_TABLE *system_table,
  SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    image_handle == NULL ||
    system_table == NULL ||
    system_table->boot_services == NULL ||
    system_table->boot_services->handle_protocol == NULL ||
    boot_info == NULL
  ) {
    return;
  }

  EFI_LOADED_IMAGE_PROTOCOL *loaded_image = NULL;
  EFI_STATUS status =
    system_table->boot_services->handle_protocol(
      image_handle,
      &loaded_image_protocol_guid,
      (void **)&loaded_image
    );
  if (
    EFI_ERROR(status) ||
    loaded_image == NULL ||
    loaded_image->system_table != system_table ||
    loaded_image->device_handle == NULL
  ) {
    return;
  }

  boot_info->loaded_image_protocol_available = 1U;
  sheikha_serial_write_line(
    "SHEIKHA_UEFI_LOADED_IMAGE_PROTOCOL_OK"
  );

  EFI_DEVICE_PATH_PROTOCOL *device_path = NULL;
  status = system_table->boot_services->handle_protocol(
    loaded_image->device_handle,
    &device_path_protocol_guid,
    (void **)&device_path
  );
  if (EFI_ERROR(status) || device_path == NULL) {
    return;
  }

  const uint16_t node_length =
    (uint16_t)device_path->length[0] |
    ((uint16_t)device_path->length[1] << 8U);
  if (node_length < sizeof(EFI_DEVICE_PATH_PROTOCOL)) {
    return;
  }

  boot_info->device_path_protocol_available = 1U;
  sheikha_serial_write_line(
    "SHEIKHA_UEFI_DEVICE_PATH_PROTOCOL_OK"
  );
}

static uint64_t current_stack_pointer(void) {
  uint64_t stack_pointer = 0ULL;
  __asm__ volatile(
    "mov %%rsp, %0"
    : "=r"(stack_pointer)
  );
  return stack_pointer;
}

static bool address_in_bootstrap_window(
  const void *address
) {
  return
    address != NULL &&
    (uint64_t)(uintptr_t)address <
      BOOTSTRAP_IDENTITY_BYTES;
}

static bool boot_addresses_supported(
  const SHEIKHA_V2_BOOT_INFO *boot_info
) {
  return
    address_in_bootstrap_window(boot_info) &&
    address_in_bootstrap_window(memory_map) &&
    address_in_bootstrap_window(
      bootstrap_page_tables
    ) &&
    address_in_bootstrap_window(&paging_context) &&
    current_stack_pointer() <
      BOOTSTRAP_IDENTITY_BYTES;
}

static bool discover_native_display(
  EFI_SYSTEM_TABLE *system_table,
  SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    system_table == NULL ||
    system_table->boot_services == NULL ||
    system_table->boot_services->locate_protocol == NULL ||
    boot_info == NULL
  ) {
    return false;
  }

  EFI_GRAPHICS_OUTPUT_PROTOCOL *graphics = NULL;
  EFI_STATUS status = system_table->boot_services->locate_protocol(
    &graphics_output_protocol_guid,
    NULL,
    (void **)&graphics
  );

  if (
    EFI_ERROR(status) ||
    graphics == NULL ||
    graphics->mode == NULL ||
    graphics->mode->info == NULL ||
    graphics->mode->frame_buffer_base == 0ULL ||
    graphics->mode->frame_buffer_size == 0ULL
  ) {
    return false;
  }

  const uint64_t framebuffer_end =
    graphics->mode->frame_buffer_base +
    graphics->mode->frame_buffer_size;

  if (
    framebuffer_end < graphics->mode->frame_buffer_base ||
    framebuffer_end > BOOTSTRAP_IDENTITY_BYTES
  ) {
    return false;
  }

  boot_info->framebuffer_base =
    graphics->mode->frame_buffer_base;
  boot_info->framebuffer_size =
    graphics->mode->frame_buffer_size;
  boot_info->framebuffer_width =
    graphics->mode->info->horizontal_resolution;
  boot_info->framebuffer_height =
    graphics->mode->info->vertical_resolution;
  boot_info->framebuffer_pixels_per_scan_line =
    graphics->mode->info->pixels_per_scan_line;
  boot_info->framebuffer_pixel_format =
    graphics->mode->info->pixel_format;
  boot_info->framebuffer_available = 1U;
  return true;
}

static EFI_STATUS exit_firmware_boot_services(
  EFI_HANDLE image_handle,
  EFI_SYSTEM_TABLE *system_table,
  SHEIKHA_V2_BOOT_INFO *boot_info
) {
  if (
    system_table == NULL ||
    system_table->boot_services == NULL ||
    boot_info == NULL
  ) {
    return EFI_ERROR_BIT | 2U;
  }

  EFI_BOOT_SERVICES *boot_services =
    system_table->boot_services;

  if (
    boot_services->get_memory_map == NULL ||
    boot_services->exit_boot_services == NULL
  ) {
    return EFI_ERROR_BIT | 3U;
  }

  EFI_STATUS status = EFI_ERROR_BIT | 2U;

  for (
    uint32_t attempt = 0U;
    attempt < EXIT_BOOT_SERVICES_ATTEMPTS;
    attempt += 1U
  ) {
    UINTN memory_map_size = sizeof(memory_map);
    UINTN map_key = 0U;
    UINTN descriptor_size = 0U;
    UINT32 descriptor_version = 0U;

    status = boot_services->get_memory_map(
      &memory_map_size,
      memory_map,
      &map_key,
      &descriptor_size,
      &descriptor_version
    );

    if (EFI_ERROR(status)) {
      return status;
    }

    boot_info->memory_map_size = memory_map_size;
    boot_info->memory_descriptor_size = descriptor_size;
    boot_info->memory_descriptor_version =
      descriptor_version;

    status = boot_services->exit_boot_services(
      image_handle,
      map_key
    );

    if (!EFI_ERROR(status)) {
      boot_info->boot_services_exited = 1U;
      return EFI_SUCCESS;
    }
  }

  return status;
}

EFI_STATUS EFIAPI efi_main(
  EFI_HANDLE image_handle,
  EFI_SYSTEM_TABLE *system_table
) {
  SHEIKHA_V2_BOOT_INFO boot_info = {0};

  sheikha_serial_init();
  sheikha_serial_write_line("SHEIKHA_V2_UEFI_BOOT_ENTRY");

  if (!validate_uefi_tables(system_table, &boot_info)) {
    sheikha_serial_write_line(
      "SHEIKHA_UEFI_SYSTEM_TABLE_REJECTED"
    );
    sheikha_v2_halt_forever();
  }
  sheikha_serial_write_line(
    "SHEIKHA_UEFI_SYSTEM_TABLE_VALIDATED"
  );
  sheikha_serial_write_line(
    "SHEIKHA_UEFI_BOOT_SERVICES_ACTIVE"
  );
  if (boot_info.runtime_services_present != 0U) {
    sheikha_serial_write_line(
      "SHEIKHA_UEFI_RUNTIME_SERVICES_PRESENT"
    );
  }

  if (console_write(
    system_table,
    (const CHAR16 *)
      L"SHEIKHA NATIVE V2\r\n"
      L"MSI UEFI SAFE TRIAL\r\n"
      L"MODE: READ-ONLY CONTROLLED HALT\r\n"
      L"DISK INSTALLER: DISABLED\r\n"
      L"--------------------------------\r\n"
  )) {
    boot_info.console_output_available = 1U;
    sheikha_serial_write_line(
      "SHEIKHA_UEFI_CONSOLE_OUTPUT_OK"
    );
  }
  disable_firmware_watchdog(system_table, &boot_info);
  discover_loaded_image_and_device_path(
    image_handle,
    system_table,
    &boot_info
  );

  if (!boot_addresses_supported(&boot_info)) {
    sheikha_serial_write_line(
      "SHEIKHA_V2_BOOTSTRAP_WINDOW_REJECTED"
    );
    sheikha_v2_halt_forever();
  }

  const int prepare_result =
    sheikha_v2_prepare_bootstrap_identity_map_2m(
      &paging_context,
      bootstrap_page_tables,
      BOOTSTRAP_PAGE_TABLE_CAPACITY,
      (uint64_t)(uintptr_t)bootstrap_page_tables,
      0ULL,
      BOOTSTRAP_IDENTITY_BYTES
    );

  if (prepare_result != SHEIKHA_X86_64_PAGING_OK) {
    sheikha_serial_write_line(
      "SHEIKHA_V2_PAGING_PREPARE_FAILED"
    );
    sheikha_v2_halt_forever();
  }

  boot_info.paging_prepared = 1U;
  boot_info.bootstrap_identity_bytes =
    BOOTSTRAP_IDENTITY_BYTES;
  boot_info.page_table_count = paging_context.pool.used;
  boot_info.paging_root_cr3 = paging_context.root_cr3;
  sheikha_serial_write_line("SHEIKHA_V2_PAGING_PREPARED");
  sheikha_serial_write_line(
    "SHEIKHA_UEFI_GOP_DISCOVERY_ATTEMPTED"
  );
  if (discover_native_display(system_table, &boot_info)) {
    sheikha_serial_write_line(
      "SHEIKHA_UEFI_GOP_DISCOVERY_OK"
    );
  }
  console_write(
    system_table,
    (const CHAR16 *)
      L"Paging prepared; entering native kernel...\r\n"
  );

  const EFI_STATUS status =
    exit_firmware_boot_services(
      image_handle,
      system_table,
      &boot_info
    );

  if (EFI_ERROR(status)) {
    sheikha_serial_write_line(
      "SHEIKHA_V2_EXIT_BOOT_SERVICES_FAILED"
    );
    sheikha_v2_halt_forever();
  }

  if (
    sheikha_v2_activate_prepared_paging(
      &paging_context
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    sheikha_serial_write_line("SHEIKHA_V2_CR3_LOAD_FAILED");
    sheikha_v2_halt_forever();
  }

  boot_info.previous_cr3 = paging_context.previous_cr3;
  boot_info.active_cr3 = paging_context.active_cr3;
  boot_info.cr3_loaded = 1U;
  sheikha_serial_write_line("SHEIKHA_V2_CR3_LOAD_OK");

  if (
    sheikha_v2_invalidate_identity_address(
      &paging_context,
      bootstrap_page_tables
    ) != SHEIKHA_X86_64_PAGING_OK
  ) {
    sheikha_serial_write_line("SHEIKHA_V2_INVLPG_FAILED");
    sheikha_v2_halt_forever();
  }

  boot_info.tlb_invalidation_executed = 1U;
  sheikha_serial_write_line("SHEIKHA_V2_INVLPG_OK");
  sheikha_v2_kernel_entry(&boot_info);
}
