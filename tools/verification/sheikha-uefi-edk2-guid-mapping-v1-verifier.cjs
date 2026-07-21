#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(root, relativePath), 'utf8')
  );
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const provenance = readJson(
  'runtime/uefi-capability-registry/v4/sheikha-edk2-local-source-provenance-v1.json'
);
const symbols = readJson(
  'runtime/uefi-capability-registry/v4/sheikha-edk2-normative-symbol-index-v1.json'
);
const mapping = readJson(
  'runtime/uefi-capability-registry/v4/sheikha-uefi-registration-edk2-mapping-v1.json'
);
const matrix = readJson(
  'runtime/uefi-capability-registry/v4/sheikha-edk2-build-target-matrix-v1.json'
);
const registry = readJson(
  'runtime/uefi-capability-registry/v4/sheikha-uefi-comprehensive-registration-v4.json'
);

invariant(
  provenance.expectedTag === 'edk2-stable202605',
  'Unexpected EDK II source tag.'
);
invariant(provenance.expectedTagAtHead === true);
invariant(provenance.clean === true);
invariant(provenance.networkAccessUsed === false);
invariant(provenance.sourceModified === false);

invariant(symbols.packageCount >= 20);
invariant(symbols.decFileCount > 0);
invariant(symbols.dscFileCount > 0);
invariant(symbols.infFileCount > 0);
invariant(symbols.headerCount > 0);
invariant(symbols.headerSymbolRecordCount > 0);
invariant(symbols.decProtocolPpiGuidRecordCount > 0);
invariant(symbols.normativeSpecificationTextIncluded === false);
invariant(symbols.implementationClaimed === false);

invariant(mapping.registrationCount === 884);
invariant(mapping.mappingRecords.length === 884);
invariant(
  mapping.exactUniqueMappedCount +
    mapping.ambiguousCount +
    mapping.unmappedCount ===
    mapping.registrationCount
);
invariant(mapping.fuzzyGuessingUsed === false);
invariant(
  mapping.allOfficialProtocolIdentifiersExhaustivelyRegistered === false
);
invariant(mapping.allUefiProtocolsImplemented === false);
invariant(mapping.ALL_UEFI_PROTOCOLS_IMPLEMENTED === false);

for (const record of mapping.mappingRecords) {
  invariant(
    [
      'EXACT_NORMALIZED_UNIQUE',
      'EXACT_NORMALIZED_AMBIGUOUS',
      'UNMAPPED'
    ].includes(record.matchStatus),
    `Invalid mapping state: ${record.registrationId}`
  );
  invariant(
    record.implementationStatus === 'NOT_CLAIMED_IMPLEMENTED'
  );
  invariant(record.verificationStatus === 'EVIDENCE_REQUIRED');
}

invariant(matrix.targetCount === 7);
invariant(matrix.packageInstallExecuted === false);
invariant(matrix.firmwareBuildExecuted === false);
invariant(matrix.allTargetsBuilt === false);
invariant(matrix.allTargetsVerified === false);
invariant(matrix.physicalHardwareVerified === false);

invariant(registry.registrationCount === 884);
invariant(
  registry.truthBoundaries.registrationDoesNotMeanImplemented === true
);
invariant(
  registry.truthBoundaries.allUefiProtocolsImplemented === false
);

const report = {
  schemaVersion: '1.0.0',
  system: 'SHEIKHA_UEFI_EDK2_GUID_MAPPING_V1_VERIFIER',
  classification:
    'EXACT_LOCAL_EDK2_METADATA_MAPPING_VERIFIED_WITHOUT_IMPLEMENTATION_CLAIM',
  sourceTag: provenance.expectedTag,
  packageCount: symbols.packageCount,
  decFileCount: symbols.decFileCount,
  dscFileCount: symbols.dscFileCount,
  fdfFileCount: symbols.fdfFileCount,
  infFileCount: symbols.infFileCount,
  headerCount: symbols.headerCount,
  headerSymbolRecordCount: symbols.headerSymbolRecordCount,
  decProtocolPpiGuidRecordCount:
    symbols.decProtocolPpiGuidRecordCount,
  registrationCount: mapping.registrationCount,
  exactUniqueMappedCount: mapping.exactUniqueMappedCount,
  ambiguousCount: mapping.ambiguousCount,
  unmappedCount: mapping.unmappedCount,
  buildTargetCount: matrix.targetCount,
  sourcePresentBuildTargetCount: matrix.sourcePresentTargetCount,
  fuzzyGuessingUsed: false,
  registrationDoesNotMeanImplemented: true,
  allOfficialProtocolIdentifiersExhaustivelyRegistered: false,
  allUefiProtocolsImplemented: false,
  firmwareBuildExecuted: false,
  physicalHardwareVerified: false,
  passed: true
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
