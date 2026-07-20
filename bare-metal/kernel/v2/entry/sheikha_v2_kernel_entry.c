#include "sheikha_v2_kernel_entry.h"

#include "sheikha_contracts.h"
#include "sheikha_serial.h"

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
