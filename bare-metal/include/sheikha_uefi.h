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

typedef struct {
    uint32_t data1;
    uint16_t data2;
    uint16_t data3;
    uint8_t data4[8];
} EFI_GUID;

#define EFI_SUCCESS ((EFI_STATUS)0)
#define EFI_ERROR_BIT (UINT64_C(1) << 63)
#define EFI_ERROR(status) (((status) & EFI_ERROR_BIT) != 0)

#define EFI_SYSTEM_TABLE_SIGNATURE UINT64_C(0x5453595320494249)
#define EFI_BOOT_SERVICES_SIGNATURE UINT64_C(0x56524553544f4f42)
#define EFI_RUNTIME_SERVICES_SIGNATURE UINT64_C(0x56524553544e5552)

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

typedef EFI_STATUS(EFIAPI *EFI_LOCATE_PROTOCOL)(
    const EFI_GUID *protocol,
    void *registration,
    void **interface
);

typedef EFI_STATUS(EFIAPI *EFI_HANDLE_PROTOCOL)(
    EFI_HANDLE handle,
    const EFI_GUID *protocol,
    void **interface
);

typedef EFI_STATUS(EFIAPI *EFI_SET_WATCHDOG_TIMER)(
    UINTN timeout,
    uint64_t watchdog_code,
    UINTN data_size,
    CHAR16 *watchdog_data
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
    EFI_HANDLE_PROTOCOL handle_protocol;
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
    void *get_next_monotonic_count;
    void *stall;
    EFI_SET_WATCHDOG_TIMER set_watchdog_timer;
    void *connect_controller;
    void *disconnect_controller;
    void *open_protocol;
    void *close_protocol;
    void *open_protocol_information;
    void *protocols_per_handle;
    void *locate_handle_buffer;
    EFI_LOCATE_PROTOCOL locate_protocol;
} EFI_BOOT_SERVICES;

typedef struct {
    EFI_TABLE_HEADER header;
} EFI_RUNTIME_SERVICES;

typedef struct {
    uint8_t type;
    uint8_t sub_type;
    uint8_t length[2];
} EFI_DEVICE_PATH_PROTOCOL;

typedef struct {
    UINT32 red_mask;
    UINT32 green_mask;
    UINT32 blue_mask;
    UINT32 reserved_mask;
} EFI_PIXEL_BITMASK;

typedef struct {
    UINT32 version;
    UINT32 horizontal_resolution;
    UINT32 vertical_resolution;
    UINT32 pixel_format;
    EFI_PIXEL_BITMASK pixel_information;
    UINT32 pixels_per_scan_line;
} EFI_GRAPHICS_OUTPUT_MODE_INFORMATION;

typedef struct {
    UINT32 max_mode;
    UINT32 mode;
    EFI_GRAPHICS_OUTPUT_MODE_INFORMATION *info;
    UINTN size_of_info;
    EFI_PHYSICAL_ADDRESS frame_buffer_base;
    UINTN frame_buffer_size;
} EFI_GRAPHICS_OUTPUT_PROTOCOL_MODE;

typedef struct {
    void *query_mode;
    void *set_mode;
    void *blt;
    EFI_GRAPHICS_OUTPUT_PROTOCOL_MODE *mode;
} EFI_GRAPHICS_OUTPUT_PROTOCOL;

typedef struct EFI_SYSTEM_TABLE {
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
    EFI_RUNTIME_SERVICES *runtime_services;
    EFI_BOOT_SERVICES *boot_services;
    UINTN number_of_table_entries;
    void *configuration_table;
} EFI_SYSTEM_TABLE;

typedef struct EFI_LOADED_IMAGE_PROTOCOL {
    UINT32 revision;
    EFI_HANDLE parent_handle;
    EFI_SYSTEM_TABLE *system_table;
    EFI_HANDLE device_handle;
    EFI_DEVICE_PATH_PROTOCOL *file_path;
    void *reserved;
    UINT32 load_options_size;
    void *load_options;
    void *image_base;
    uint64_t image_size;
    UINT32 image_code_type;
    UINT32 image_data_type;
    void *unload;
} EFI_LOADED_IMAGE_PROTOCOL;

#endif
