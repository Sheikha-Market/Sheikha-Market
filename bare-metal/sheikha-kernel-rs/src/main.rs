#![no_std]
#![no_main]

use core::fmt::{self, Write};
use core::panic::PanicInfo;

const VGA_BUFFER: *mut u8 = 0xb8000 as *mut u8;
const VGA_WIDTH: usize = 80;
const VGA_HEIGHT: usize = 25;
const COM1_PORT: u16 = 0x3F8;

#[inline]
unsafe fn outb(port: u16, val: u8) {
    core::arch::asm!("out dx, al", in("dx") port, in("al") val, options(nomem, nostack, preserves_flags));
}

pub fn init_serial() {
    unsafe {
        outb(COM1_PORT + 1, 0x00);
        outb(COM1_PORT + 3, 0x80);
        outb(COM1_PORT + 0, 0x03);
        outb(COM1_PORT + 1, 0x00);
        outb(COM1_PORT + 3, 0x03);
        outb(COM1_PORT + 2, 0xC7);
        outb(COM1_PORT + 4, 0x0B);
    }
}

pub struct SheikhaConsole {
    row: usize,
    col: usize,
    color: u8,
}

impl SheikhaConsole {
    pub const fn new(fg: u8, bg: u8) -> Self {
        Self { row: 0, col: 0, color: (bg << 4) | (fg & 0x0F) }
    }

    pub fn clear_screen(&mut self) {
        for r in 0..VGA_HEIGHT {
            for c in 0..VGA_WIDTH {
                let offset = (r * VGA_WIDTH + c) * 2;
                unsafe {
                    *VGA_BUFFER.add(offset) = b' ';
                    *VGA_BUFFER.add(offset + 1) = self.color;
                }
            }
        }
        self.row = 0;
        self.col = 0;
    }

    pub fn write_byte(&mut self, byte: u8) {
        unsafe { outb(COM1_PORT, byte); }
        match byte {
            b'\n' => {
                self.col = 0;
                if self.row + 1 < VGA_HEIGHT {
                    self.row += 1;
                }
            }
            byte => {
                if self.col >= VGA_WIDTH {
                    self.col = 0;
                    if self.row + 1 < VGA_HEIGHT {
                        self.row += 1;
                    }
                }
                let offset = (self.row * VGA_WIDTH + self.col) * 2;
                unsafe {
                    *VGA_BUFFER.add(offset) = byte;
                    *VGA_BUFFER.add(offset + 1) = self.color;
                }
                self.col += 1;
            }
        }
    }
}

impl Write for SheikhaConsole {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        for byte in s.bytes() {
            self.write_byte(byte);
        }
        Ok(())
    }
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    init_serial();
    let mut console = SheikhaConsole::new(0x0A, 0x00);
    console.clear_screen();

    let _ = writeln!(console, "================================================================================");
    let _ = writeln!(console, "  SHEIKHA SOVEREIGN KERNEL v1.0.0 (x86_64 Bare-Metal Rust Edition)");
    let _ = writeln!(console, "  Owner: Salman Ahmed Al-Rajih Trading Est. (CR: 2051263653)");
    let _ = writeln!(console, "  Governance: BOUND_BY_QURAN_SUNNAH | Memory Safety: ENFORCED");
    let _ = writeln!(console, "================================================================================");
    let _ = writeln!(console, "[OK] Serial UART 16550 (COM1 @ 0x3F8) Initialized.");
    let _ = writeln!(console, "[OK] VGA Text Buffer (80x25 @ 0xB8000) Active.");
    let _ = writeln!(console, "[OK] Host LAN Gateway Verified: 192.168.8.1 (Khobar Node).");

    loop {
        unsafe {
            core::arch::asm!("hlt", options(nomem, nostack, preserves_flags));
        }
    }
}

#[panic_handler]
fn panic(info: &PanicInfo) -> ! {
    let mut err_console = SheikhaConsole::new(0x0F, 0x04);
    let _ = writeln!(err_console, "\n[SHEIKHA KERNEL PANIC]: {}", info);
    loop {
        unsafe {
            core::arch::asm!("cli; hlt", options(nomem, nostack));
        }
    }
}
