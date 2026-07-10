#include "sheikha_uefi.h"

#include "sheikha_kernel.h"
#include "sheikha_serial.h"

enum {
    MEMORY_MAP_CAPACITY = 128 * 1024,
    EXIT_BOOT_SERVICES_ATTEMPTS = 2
};

static uint8_t memory_map[MEMORY_MAP_CAPACITY] __attribute__((aligned(16)));

static void console_write(EFI_SYSTEM_TABLE *system_table, const CHAR16 *text) {
    if (system_table != 0 && system_table->con_out != 0 &&
        system_table->con_out->output_string != 0) {
        system_table->con_out->output_string(system_table->con_out, text);
    }
}

static EFI_STATUS exit_firmware_boot_services(
    EFI_HANDLE image_handle,
    EFI_SYSTEM_TABLE *system_table,
    SHEIKHA_BOOT_INFO *boot_info
) {
    if (system_table == 0 || system_table->boot_services == 0 || boot_info == 0) {
        return EFI_ERROR_BIT | 2U;
    }

    EFI_BOOT_SERVICES *boot_services = system_table->boot_services;
    if (boot_services->get_memory_map == 0 || boot_services->exit_boot_services == 0) {
        return EFI_ERROR_BIT | 3U;
    }

    EFI_STATUS status = EFI_ERROR_BIT | 2U;
    for (uint32_t attempt = 0; attempt < EXIT_BOOT_SERVICES_ATTEMPTS; ++attempt) {
        UINTN memory_map_size = sizeof(memory_map);
        UINTN map_key = 0;
        UINTN descriptor_size = 0;
        UINT32 descriptor_version = 0;

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
        boot_info->memory_descriptor_version = descriptor_version;

        status = boot_services->exit_boot_services(image_handle, map_key);
        if (!EFI_ERROR(status)) {
            boot_info->boot_services_exited = 1U;
            return EFI_SUCCESS;
        }
    }

    return status;
}

EFI_STATUS EFIAPI efi_main(EFI_HANDLE image_handle, EFI_SYSTEM_TABLE *system_table) {
    SHEIKHA_BOOT_INFO boot_info = {0};

    sheikha_serial_init();
    sheikha_serial_write_line("SHEIKHA_UEFI_BOOT_ENTRY");
    console_write(system_table, (const CHAR16 *)L"Sheikha Native Kernel Seed V1\r\n");

    EFI_STATUS status = exit_firmware_boot_services(image_handle, system_table, &boot_info);
    if (EFI_ERROR(status)) {
        sheikha_serial_write_line("SHEIKHA_EXIT_BOOT_SERVICES_FAILED");
        sheikha_halt_forever();
    }

    sheikha_kernel_entry(&boot_info);
}
