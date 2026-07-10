#include "sheikha_kernel.h"

#include "sheikha_contracts.h"
#include "sheikha_serial.h"

__attribute__((noreturn)) void sheikha_halt_forever(void) {
    __asm__ volatile("cli");
    for (;;) {
        __asm__ volatile("hlt");
    }
}

__attribute__((noreturn)) void sheikha_kernel_entry(const SHEIKHA_BOOT_INFO *boot_info) {
    if (boot_info == 0 || boot_info->boot_services_exited == 0U) {
        sheikha_serial_write_line("SHEIKHA_KERNEL_HANDOFF_REJECTED");
        sheikha_halt_forever();
    }

    sheikha_serial_write_line("SHEIKHA_BARE_METAL_BOOT_OK");
    sheikha_serial_write_line("architecture=x86_64");
    sheikha_serial_write_line("boot_protocol=UEFI");
    sheikha_serial_write_line("boot_services=EXITED");
    sheikha_serial_write_line("kernel=SHEIKHA_NATIVE_KERNEL_SEED_V1");
    sheikha_serial_write_line("kernel_version=1.0.0");
    sheikha_serial_write_line("governance_boundary=ACTIVE");
    sheikha_serial_write_line("ai_boot_control=DISABLED");
    sheikha_serial_write_line("linux_runtime_required=false");
    sheikha_serial_write_line("node_runtime_required=false");
    sheikha_serial_write_line("boot_contract=" SHEIKHA_BOOT_CONTRACT_ID);
    sheikha_serial_write_line("kernel_contract=" SHEIKHA_KERNEL_CONTRACT_ID);
    sheikha_serial_write_line("hal_contract=" SHEIKHA_HAL_CONTRACT_ID);
    sheikha_serial_write_line("language_contract=" SHEIKHA_LANGUAGE_BOOT_CONTRACT_ID);
    sheikha_serial_write_line("governance_contract=" SHEIKHA_GOVERNANCE_CONTRACT_ID);
    sheikha_serial_write_line("runtime_state=CONTROLLED_HALT");
    sheikha_halt_forever();
}
