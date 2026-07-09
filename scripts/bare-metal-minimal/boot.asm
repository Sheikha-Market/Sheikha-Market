[org 0x7c00]
[bits 16]

; Minimal boot sector example.
; Prints 'A' using BIOS teletype interrupt and halts safely.

start:
    mov ah, 0x0e
    mov al, 'A'
    int 0x10

.hang:
    hlt
    jmp .hang

times 510-($-$$) db 0
dw 0xaa55
