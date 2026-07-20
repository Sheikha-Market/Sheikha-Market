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

static void console_write(
  EFI_SYSTEM_TABLE *system_table,
  const CHAR16 *text
) {
  if (
    system_table != NULL &&
    system_table->con_out != NULL &&
    system_table->con_out->output_string != NULL
  ) {
    system_table->con_out->output_string(
      system_table->con_out,
      text
    );
  }
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
  console_write(
    system_table,
    (const CHAR16 *)L"Sheikha Sovereign Native Kernel V2\r\n"
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
