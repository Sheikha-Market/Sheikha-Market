#include "sheikha_v2.h"
int main(void) {
  if (sheikha_v2_memory_initialize(128ULL * 1024ULL * 1024ULL) != 0) return 1;
  if (sheikha_v2_paging_map(0x400000ULL, 0x400000ULL, 1ULL) != 0) return 2;
  if (sheikha_v2_interrupts_initialize(256U) != 0) return 3;
  if (sheikha_v2_scheduler_initialize(1000U) != 0) return 4;
  if (sheikha_v2_process_initialize(1024U) != 0) return 5;
  if (sheikha_v2_process_create(0x100000ULL, 0x800000ULL) != 0) return 6;
  if (sheikha_v2_syscalls_initialize(256U) != 0) return 7;
  if (sheikha_v2_pci_initialize(1U) != 0) return 8;
  if (sheikha_v2_block_initialize(512U) != 0) return 9;
  if (sheikha_v2_vfs_mount_root("sheikha-vfs") != 0) return 10;
  if (sheikha_v2_network_initialize(1500U) != 0) return 11;
  return 0;
}
