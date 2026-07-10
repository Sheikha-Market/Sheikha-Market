# Linker Boundary

The local GNU linker supports the `i386pep` emulation. The build pipeline turns
freestanding ELF objects into COFF objects and links a PE32+ EFI application
with subsystem 10. The verifier rejects imports, a wrong machine type, a wrong
subsystem, or a missing entry point.
