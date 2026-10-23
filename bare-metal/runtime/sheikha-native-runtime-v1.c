#include <stdint.h>
#include "sheikha_native_package.h"

/* Development-only, finite cooperative runtime. No host OS calls or heap. */
enum { APP_EMPTY, APP_READY, APP_RUNNING, APP_COMPLETE, APP_STOPPED, APP_FAILED };
typedef struct {
    uint32_t state, verified, produced, steps, budget;
    char contracts[SHEIKHA_COMPONENT_COUNT][SHEIKHA_CONTRACT_BYTES];
} SHEIKHA_NATIVE_APP;
static SHEIKHA_NATIVE_APP app;
static void clear_app(void) {
    app.state = APP_EMPTY; app.verified = 0; app.produced = 0; app.steps = 0; app.budget = 0;
    for (uint32_t i = 0; i < SHEIKHA_COMPONENT_COUNT; ++i)
        for (uint32_t j = 0; j < SHEIKHA_CONTRACT_BYTES; ++j) app.contracts[i][j] = 0;
}
static int deploy(uint32_t production, uint32_t budget) {
    if (production != 0 || app.state != APP_EMPTY || budget < SHEIKHA_INSTRUCTION_COUNT || budget > 128U) return 0;
    app.state = APP_READY; app.budget = budget; return 1;
}
static int execute_instruction(uint32_t opcode, uint32_t id) {
    if (app.state != APP_RUNNING || app.steps >= app.budget) return 0;
    ++app.steps;
    if (opcode == 3U) return 1;
    if (id >= SHEIKHA_COMPONENT_COUNT) return 0;
    const uint32_t bit = UINT32_C(1) << id;
    if (opcode == 1U) {
        if ((app.verified & bit) != 0) return 0;
        app.verified |= bit; return 1;
    }
    if (opcode == 2U) {
        if ((app.verified & bit) == 0 || (app.produced & bit) != 0 ||
            (app.produced & sheikha_components[id].dependencies) != sheikha_components[id].dependencies) return 0;
        uint32_t j = 0;
        while (j + 1U < SHEIKHA_CONTRACT_BYTES && sheikha_components[id].contract[j] != 0) {
            app.contracts[id][j] = sheikha_components[id].contract[j]; ++j;
        }
        if (sheikha_components[id].contract[j] != 0) return 0;
        app.contracts[id][j] = 0; app.produced |= bit; return 1;
    }
    return 0;
}
static int start(void) {
    if (app.state != APP_READY && app.state != APP_STOPPED) return 0;
    app.state = APP_RUNNING; app.verified = 0; app.produced = 0; app.steps = 0;
    for (uint32_t i = 0; i < SHEIKHA_INSTRUCTION_COUNT; ++i) {
        if (!execute_instruction(sheikha_instructions[i].opcode, sheikha_instructions[i].component)) {
            app.state = APP_FAILED; return 0;
        }
    }
    const uint32_t expected = (UINT32_C(1) << SHEIKHA_COMPONENT_COUNT) - 1U;
    if (app.produced != expected) { app.state = APP_FAILED; return 0; }
    app.state = APP_COMPLETE; return 1;
}
static int stop(void) {
    if (app.state != APP_COMPLETE && app.state != APP_READY && app.state != APP_FAILED) return 0;
    app.state = APP_STOPPED; return 1;
}
static int restart(void) { return stop() && start(); }
static int native_self_test(void) {
    clear_app();
    if (deploy(1, 128) || app.state != APP_EMPTY) return 1; /* production admission denied */
    if (deploy(0, 1) || app.state != APP_EMPTY) return 2; /* inadequate budget */
    if (!deploy(0, 128) || !start() || app.state != APP_COMPLETE) return 3;
    for (uint32_t i = 0; i < SHEIKHA_COMPONENT_COUNT; ++i) {
        for (uint32_t j = 0; j < SHEIKHA_CONTRACT_BYTES; ++j) {
            if (app.contracts[i][j] != sheikha_components[i].contract[j]) return 4;
            if (app.contracts[i][j] == 0) break;
        }
    }
    if (!restart() || !stop() || app.state != APP_STOPPED || !start()) return 5;
    app.state = APP_RUNNING; app.verified = 0; app.produced = 0; app.steps = 0;
    if (execute_instruction(2, 0) || app.produced != 0) return 6; /* verify before produce */
    if (execute_instruction(1, SHEIKHA_COMPONENT_COUNT)) return 7; /* invalid component */
    if (execute_instruction(99, 0)) return 8; /* unknown instruction */
    app.steps = app.budget;
    if (execute_instruction(3, 0)) return 9; /* budget bound */
    clear_app();
    if (!deploy(0, 128) || !start()) return 10;
    return 0;
}
#ifdef SHEIKHA_HOST_TEST
int main(void) { return native_self_test(); }
#else
#include "sheikha_kernel.h"
#include "sheikha_serial.h"
__attribute__((noreturn)) void sheikha_halt_forever(void) {
    __asm__ volatile("cli"); for (;;) __asm__ volatile("hlt");
}
__attribute__((noreturn)) void sheikha_kernel_entry(const SHEIKHA_BOOT_INFO *boot_info) {
    if (boot_info == 0 || boot_info->boot_services_exited != 1U) sheikha_halt_forever();
    sheikha_serial_write_line("SHEIKHA_NATIVE_RUNTIME_BOOT");
    sheikha_serial_write_line("boot_services=EXITED");
    if (native_self_test() != 0) {
        sheikha_serial_write_line("SHEIKHA_NATIVE_RUNTIME_FAILED"); sheikha_halt_forever();
    }
    sheikha_serial_write_line("SHEIKHA_NATIVE_SUPERVISOR_TESTS_PASS");
    for (uint32_t i = 0; i < SHEIKHA_COMPONENT_COUNT; ++i) {
        sheikha_serial_write("NATIVE_CONTRACT:"); sheikha_serial_write_line(sheikha_components[i].id);
    }
    sheikha_serial_write_line("source_sha256=" SHEIKHA_SOURCE_SHA256);
    sheikha_serial_write_line("guest_dependencies=NO_NODE_NO_DOCKER_NO_PM2_NO_LINUX");
    sheikha_serial_write_line("deployment_mode=STATIC_DEVELOPMENT_PACKAGE_IN_RAM");
    sheikha_serial_write_line("production_ready=false");
    sheikha_serial_write_line("SHEIKHA_NATIVE_RUNTIME_VERIFIED");
    /* QEMU-only exit device; absent on physical machines, then controlled halt. */
    __asm__ volatile("outl %0, %1" : : "a"(UINT32_C(0x10)), "Nd"((uint16_t)0xf4));
    sheikha_halt_forever();
}
#endif
