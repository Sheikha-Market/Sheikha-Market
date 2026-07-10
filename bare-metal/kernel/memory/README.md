# Memory Status

V1 captures the UEFI memory map before `ExitBootServices` and passes its metadata
to the kernel entry. Page-table ownership, physical allocation, virtual memory,
and memory protection are not implemented or claimed.
