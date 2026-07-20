.text

.globl sheikha_x86_64_read_cr3
.type sheikha_x86_64_read_cr3, @function
sheikha_x86_64_read_cr3:
  mov %cr3, %rax
  ret

.globl sheikha_x86_64_write_cr3
.type sheikha_x86_64_write_cr3, @function
sheikha_x86_64_write_cr3:
  mov %rdi, %cr3
  ret

.globl sheikha_x86_64_invalidate_page
.type sheikha_x86_64_invalidate_page, @function
sheikha_x86_64_invalidate_page:
  invlpg (%rdi)
  ret

.section .note.GNU-stack,"",@progbits
