/*
 * V2 UEFI seed composition for the local GNU ELF-to-COFF bridge.
 * The privileged CR3 and INVLPG implementation is linked separately.
 */
#include "../drivers/serial/sheikha_serial.c"
#include "v2/memory/sheikha_x86_64_paging.c"
#include "../boot/uefi/sheikha_v2_paging_boot_adapter.c"
#include "v2/entry/sheikha_v2_kernel_entry.c"
#include "../boot/uefi/sheikha_v2_uefi_entry.c"
