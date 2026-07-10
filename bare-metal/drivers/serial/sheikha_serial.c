#include "sheikha_serial.h"

#include <stdint.h>

enum {
    COM1_BASE = 0x3f8,
    SERIAL_READY_SPINS = 100000
};

static inline void outb(uint16_t port, uint8_t value) {
    __asm__ volatile("outb %0, %1" : : "a"(value), "Nd"(port));
}

static inline uint8_t inb(uint16_t port) {
    uint8_t value;
    __asm__ volatile("inb %1, %0" : "=a"(value) : "Nd"(port));
    return value;
}

static void write_byte(uint8_t value) {
    for (uint32_t spin = 0; spin < SERIAL_READY_SPINS; ++spin) {
        if ((inb(COM1_BASE + 5) & 0x20U) != 0U) {
            break;
        }
    }
    outb(COM1_BASE, value);
}

void sheikha_serial_init(void) {
    outb(COM1_BASE + 1, 0x00);
    outb(COM1_BASE + 3, 0x80);
    outb(COM1_BASE + 0, 0x01);
    outb(COM1_BASE + 1, 0x00);
    outb(COM1_BASE + 3, 0x03);
    outb(COM1_BASE + 2, 0xc7);
    outb(COM1_BASE + 4, 0x0b);
}

void sheikha_serial_write(const char *text) {
    if (text == 0) {
        return;
    }

    while (*text != '\0') {
        if (*text == '\n') {
            write_byte('\r');
        }
        write_byte((uint8_t)*text);
        ++text;
    }
}

void sheikha_serial_write_line(const char *text) {
    sheikha_serial_write(text);
    sheikha_serial_write("\n");
}
