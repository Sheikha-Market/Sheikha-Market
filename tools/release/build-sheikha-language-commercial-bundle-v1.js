#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(ROOT, 'dist/sheikha-language-commercial/v1');
const RELEASE_GATE = 'runtime/sheikha-language-production/v1/sheikha-language-product-release-gate-v1-report.json';
const LICENSE_AR = 'LICENSES/SHEIKHA-PROPRIETARY-GOVERNED-USE-LICENSE-V1-AR.md';
const LICENSE_EN = 'LICENSES/SHEIKHA-PROPRIETARY-GOVERNED-USE-LICENSE-V1-EN.md';

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));

function write(outputDirectory, relative, data) {
  const absolute = path.join(outputDirectory, relative);
  fs.mkdirSync(path.dirname(absolute), {recursive: true});
  fs.writeFileSync(absolute, data);
  return {path: relative, bytes: Buffer.byteLength(data), sha256: sha256(data)};
}

function build(outputDirectory = OUTPUT) {
  const gate = readJson(RELEASE_GATE);
  const required = [
    'SHEIKHA_HOSTED_ARABIC_APPLICATIONS',
    'SHEIKHA_NATIVE_LANGUAGE_OBJECT_SDK',
    'SHEIKHA_LANGUAGE_KERNEL_INTEGRATION_IMAGE'
  ];
  if (!required.every((id) => gate.releasableProductIds.includes(id))) {
    throw new Error('SHEIKHA_COMMERCIAL_BUNDLE_RELEASE_GATE_BLOCKED');
  }

  const inputs = [
    [LICENSE_AR, 'legal/LICENSE-AR.md'],
    [LICENSE_EN, 'legal/LICENSE-EN.md'],
    ['commercial/templates/sheikha-customer-proposal-ar-v1.md', 'commercial/customer-proposal-ar.md'],
    ['commercial/templates/sheikha-order-form-ar-v1.md', 'commercial/license-order-form-ar.md'],
    ['dist/sheikha-language-products/v1/release-manifest.json', 'hosted/release-manifest.json'],
    ['dist/sheikha-language-native/v1/manifest.json', 'native/manifest.json'],
    ['dist/sheikha-language-native/v1/sheikha-native-kernel-v1.c', 'native/sheikha-native-kernel-v1.c'],
    ['dist/sheikha-language-native/v1/sheikha-native-kernel-v1.o', 'native/sheikha-native-kernel-v1.o'],
    ['bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI', 'trial/BOOTX64.EFI'],
    ['bare-metal/images/sheikha-bare-metal-seed-v1.img', 'trial/sheikha-language-kernel-qemu-v1.img'],
    ['runtime/bare-metal/v1/evidence/boot-verification.json', 'evidence/boot-verification.json'],
    ['runtime/bare-metal/v1/evidence/qemu-serial.log', 'evidence/qemu-serial.log'],
    [RELEASE_GATE, 'evidence/product-release-gate.json']
  ];

  fs.rmSync(outputDirectory, {recursive: true, force: true});
  fs.mkdirSync(outputDirectory, {recursive: true});
  const artifacts = inputs.map(([source, destination]) => write(outputDirectory, destination, read(source)));
  const notice = [
    '# SHEIKHA Language Commercial Bundle V1', '',
    'Commercial distribution candidate for written, scoped customer licensing.',
    'Internal license identifier: SHEIKHA-PGUL-1.0.',
    'The identifier is not a governmental registration or external certification.', '',
    'Included: hosted Arabic language release manifests, native object SDK, and a QEMU-verified read-only trial image.',
    'Excluded: production firmware, a complete self-hosted compiler, and a complete general-purpose kernel.',
    'The trial image must not be flashed or represented as production firmware without a separately approved hardware trial plan.',
    'Third-party tools used to build or test are not redistributed by this bundle.', ''
  ].join('\n');
  artifacts.push(write(outputDirectory, 'NOTICE.md', notice));

  const sbom = {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: 'SHEIKHA-Language-Commercial-Bundle-V1',
    documentNamespace: `https://www.sheikha.top/spdx/language-commercial-v1/${sha256(JSON.stringify(artifacts))}`,
    creationInfo: {
      created: new Date(Number(process.env.SOURCE_DATE_EPOCH || 0) * 1000).toISOString(),
      creators: ['Tool: SHEIKHA Commercial Bundle Builder V1']
    },
    packages: [{
      name: 'SHEIKHA Language Commercial Bundle',
      SPDXID: 'SPDXRef-Package',
      versionInfo: '1.0.0',
      downloadLocation: 'NOASSERTION',
      filesAnalyzed: true,
      licenseConcluded: 'LicenseRef-SHEIKHA-PGUL-1.0',
      licenseDeclared: 'LicenseRef-SHEIKHA-PGUL-1.0',
      copyrightText: 'NOASSERTION',
      externalRefs: []
    }],
    files: artifacts.map((artifact, index) => ({
      fileName: `./${artifact.path}`,
      SPDXID: `SPDXRef-File-${index + 1}`,
      checksums: [{algorithm: 'SHA256', checksumValue: artifact.sha256}],
      licenseConcluded: 'LicenseRef-SHEIKHA-PGUL-1.0',
      copyrightText: 'NOASSERTION'
    })),
    relationships: artifacts.map((_, index) => ({
      spdxElementId: 'SPDXRef-Package',
      relationshipType: 'CONTAINS',
      relatedSpdxElement: `SPDXRef-File-${index + 1}`
    })),
    hasExtractedLicensingInfos: [{
      licenseId: 'LicenseRef-SHEIKHA-PGUL-1.0',
      extractedText: 'See legal/LICENSE-AR.md and legal/LICENSE-EN.md in this bundle.',
      name: 'SHEIKHA Proprietary Governed Use License Version 1'
    }]
  };
  const sbomData = `${JSON.stringify(sbom, null, 2)}\n`;
  const sbomArtifact = write(outputDirectory, 'SBOM.spdx.json', sbomData);
  artifacts.push(sbomArtifact);

  const manifest = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_LANGUAGE_COMMERCIAL_BUNDLE_V1',
    status: 'READY_FOR_CONTRACTED_COMMERCIAL_DISTRIBUTION',
    license: {
      id: 'SHEIKHA-PGUL-1.0',
      type: 'PROPRIETARY_CONTRACTUAL_INTERNAL_LICENSE',
      writtenCustomerOrderRequired: true,
      governmentalRegistrationClaimed: false
    },
    products: required,
    exclusions: ['COMPLETE_SELF_HOSTED_COMPILER', 'COMPLETE_GENERAL_PURPOSE_KERNEL', 'PRODUCTION_FIRMWARE'],
    artifacts,
    releaseGate: {path: RELEASE_GATE, reportSha256: sha256(read(RELEASE_GATE))},
    productionDeploymentPerformed: false,
    customerAcceptanceRecorded: false
  };
  manifest.bundleSha256 = sha256(JSON.stringify(manifest));
  write(outputDirectory, 'MANIFEST.json', `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(build(), null, 2)}\n`);
module.exports = {OUTPUT, build};
