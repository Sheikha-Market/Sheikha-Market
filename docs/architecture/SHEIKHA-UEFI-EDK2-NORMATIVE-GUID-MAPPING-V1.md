# Sheikha UEFI — EDK II Symbol and GUID Mapping V1

This phase indexes one clean local TianoCore EDK II checkout whose `HEAD`
is exactly tagged `edk2-stable202605`.

It records metadata from:

- package directories;
- DEC protocol, PPI and GUID sections;
- DSC, FDF and INF files;
- Protocol, PPI and GUID headers;
- explicit firmware build-target descriptors.

Mapping from the Sheikha V4 registry uses exact normalized names only.
Fuzzy guessing is prohibited. Ambiguous or unmatched entries remain unresolved.

```text
fuzzyGuessingUsed=false
registrationDoesNotMeanImplemented=true
allOfficialProtocolIdentifiersExhaustivelyRegistered=false
ALL_UEFI_PROTOCOLS_IMPLEMENTED=false
firmwareBuildExecuted=false
physicalHardwareVerified=false
```

The index does not copy normative specification text, modify the EDK II source,
install packages, fetch network content, build firmware, or update `main`.

The next controlled phase is toolchain readiness and per-target build evidence.
A target may be marked built only after a successful reproducible build with
binary hashes. Emulator verification and physical-hardware verification remain
separate evidence states.
