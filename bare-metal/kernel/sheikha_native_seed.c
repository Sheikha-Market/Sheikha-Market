/*
 * Single translation unit for the local GNU ELF-to-COFF bridge.
 *
 * Keeping the implementation modules separate preserves their ownership
 * boundaries. Combining them here avoids unresolved cross-object symbols while
 * the host binutils bridge emits the PE32+ UEFI artifact.
 */
#include "../drivers/serial/sheikha_serial.c"
#include "entry/sheikha_kernel.c"
#include "../boot/uefi/sheikha_uefi_entry.c"
