# Interrupt Status

V1 does not install an IDT or enable hardware interrupts. Interrupts are disabled
before the controlled halt. IDT, exception handling, timers, and IRQ routing are
deferred.
