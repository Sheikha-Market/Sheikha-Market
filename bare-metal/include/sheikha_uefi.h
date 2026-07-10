#ifndef SHEIKHA_UEFI_H
#define SHEIKHA_UEFI_H

#include <stddef.h>
#include <stdint.h>

#define EFIAPI __attribute__((ms_abi))

typedef void *EFI_HANDLE;
typedef uint64_t EFI_STATUS;
typedef uint64_t EFI_PHYSICAL_ADDRESS;
typedef uint64_t EFI_VIRTUAL_ADDRESS;
typedef uint64_t UINTN;
typedef uint32_t UINT32;
typedef uint16_t CHAR16;

#define EFI_SUCCESS ((EFI_STATUS)0)
#define EFI_ERROR_BIT (UINT64_C(1) << 63)
#define EFI_ERROR(status) (((status) & EFI_ERROR_BIT) != 0)

typedef struct {
    uint64_t signature;
    uint32_t revision;
    uint32_t header_size;
    uint32_t crc32;
    uint32_t reserved;
} EFI_TABLE_HEADER;

struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;
typedef EFI_STATUS(EFIAPI *EFI_TEXT_STRING)(
    struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *self,
    const CHAR16 *string
);

typedef struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL {
    void *reset;
    EFI_TEXT_STRING output_string;
} EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;

typedef EFI_STATUS(EFIAPI *EFI_GET_MEMORY_MAP)(
    UINTN *memory_map_size,
    void *memory_map,
    UINTN *map_key,
    UINTN *descriptor_size,
    UINT32 *descriptor_version
);

typedef EFI_STATUS(EFIAPI *EFI_EXIT_BOOT_SERVICES)(
    EFI_HANDLE image_handle,
    UINTN map_key
);

typedef struct {
    EFI_TABLE_HEADER header;
    void *raise_tpl;
    void *restore_tpl;
    void *allocate_pages;
    void *free_pages;
    EFI_GET_MEMORY_MAP get_memory_map;
    void *allocate_pool;
    void *free_pool;
    void *create_event;
    void *set_timer;
    void *wait_for_event;
    void *signal_event;
    void *close_event;
    void *check_event;
    void *install_protocol_interface;
    void *reinstall_protocol_interface;
    void *uninstall_protocol_interface;
    void *handle_protocol;
    void *reserved;
    void *register_protocol_notify;
    void *locate_handle;
    void *locate_device_path;
    void *install_configuration_table;
    void *load_image;
    void *start_image;
    void *exit;
    void *unload_image;
    EFI_EXIT_BOOT_SERVICES exit_boot_services;
} EFI_BOOT_SERVICES;

typedef struct {
    EFI_TABLE_HEADER header;
    CHAR16 *firmware_vendor;
    UINT32 firmware_revision;
    UINT32 padding;
    EFI_HANDLE console_in_handle;
    void *con_in;
    EFI_HANDLE console_out_handle;
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *con_out;
    EFI_HANDLE standard_error_handle;
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *std_err;
    void *runtime_services;
    EFI_BOOT_SERVICES *boot_services;
    UINTN number_of_table_entries;
    void *configuration_table;
} EFI_SYSTEM_TABLE;

#endif
