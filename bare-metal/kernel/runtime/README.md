# Native Runtime Status

The V1 native runtime is intentionally minimal: validate the UEFI handoff, emit
contract and governance evidence on COM1, then enter a controlled halt. Services,
processes, filesystems, networking, and user applications are not part of V1.
