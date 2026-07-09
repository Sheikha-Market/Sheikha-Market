[bits 32]
[global _start]
[extern kernel_main]

section .text
_start:
    ; Transfer control to C kernel entry point.
    call kernel_main

.hang:
    hlt
    jmp .hang
