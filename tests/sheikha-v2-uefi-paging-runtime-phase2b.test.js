'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  EFI_ARTIFACT,
  FAT_IMAGE,
  REQUIRED_MARKERS,
  normalizeToolOutput,
} = require('../bare-metal/build/sheikha-bare-metal-v2-phase2b');
const {
  parsePeArtifact,
} = require('../bare-metal/build/sheikha-bare-metal-pipeline-v1');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

describe('Sheikha V2 UEFI paging runtime Phase 2B', () => {
  test('normalizes generated tool evidence without trailing whitespace', () => {
    expect(normalizeToolOutput('line  \nnext\t\n\n')).toBe(
      'line\nnext\n'
    );
  });

  test('verifies the 2 MiB bootstrap model without host privileges', () => {
    const output = execFileSync(
      'bash',
      [
        path.join(
          ROOT,
          'scripts/bare-metal/v2/' +
            'build-uefi-paging-runtime-phase2b.sh'
        ),
      ],
      {
        cwd: ROOT,
        encoding: 'utf8',
      }
    );

    expect(output).toContain(
      'SHEIKHA_V2_UEFI_PAGING_RUNTIME_PHASE2B_HOST_MODEL_OK'
    );
    expect(output).toContain(
      'TWO_MIB_PAGE_MODEL_VERIFIED=true'
    );
    expect(output).toContain(
      'EXPECTED_SIX_TABLE_TOPOLOGY_VERIFIED=true'
    );
    expect(output).toContain(
      'PRIVILEGED_INSTRUCTIONS_EXECUTED_IN_HOST_TEST=false'
    );
  });

  test('ships a real x86_64 PE32+ EFI artifact and FAT image', () => {
    expect(fs.statSync(EFI_ARTIFACT).size).toBeGreaterThan(0);
    expect(fs.statSync(FAT_IMAGE).size).toBe(1474560);

    const pe = parsePeArtifact(EFI_ARTIFACT);
    expect(pe.valid).toBe(true);
    expect(pe.machineName).toBe('x86_64');
    expect(pe.subsystemName).toBe('EFI_APPLICATION');
    expect(pe.importRva).toBe(0);
    expect(pe.importSize).toBe(0);

    const artifact = fs.readFileSync(EFI_ARTIFACT);
    for (const marker of REQUIRED_MARKERS) {
      expect(artifact.includes(Buffer.from(marker, 'ascii'))).toBe(true);
    }
    expect(fs.readFileSync(FAT_IMAGE).indexOf(artifact)).toBeGreaterThan(-1);
  });

  test('matches recorded SHA-256 evidence', () => {
    const build = readJson(
      'runtime/bare-metal/v2/evidence/' +
        'sheikha-v2-uefi-paging-runtime-phase2b-build.json'
    );

    expect(sha256(EFI_ARTIFACT)).toBe(build.artifact.sha256);
    expect(sha256(FAT_IMAGE)).toBe(build.image.sha256);
    expect(build.bootstrapMap.expectedTableCount).toBe(6);
    expect(
      build.bootstrapMap.permissionsTightenedByMemoryType
    ).toBe(false);
  });

  test('keeps runtime completion behind QEMU serial evidence', () => {
    const evidence = readJson(
      'runtime/bare-metal/v2/evidence/' +
        'sheikha-v2-uefi-paging-runtime-phase2b.json'
    );
    const verification = readJson(
      'runtime/bare-metal/v2/evidence/' +
        'sheikha-v2-uefi-paging-runtime-phase2b-verification.json'
    );

    if (evidence.verified) {
      expect(evidence.status).toBe('PHASE2B_VERIFIED');
      expect(evidence.scope.qemuBootExecuted).toBe(true);
      expect(evidence.scope.cr3LoadedAtRuntime).toBe(true);
      expect(evidence.scope.invlpgExecutedAtRuntime).toBe(true);
      expect(
        verification.checks.qemuArtifactBindingVerified
      ).toBe(true);
    } else {
      expect([
        'BUILD_VERIFIED_QEMU_TOOLCHAIN_MISSING',
        'BUILT_NOT_QEMU_VERIFIED',
      ]).toContain(evidence.status);
      expect(evidence.scope.cr3LoadedAtRuntime).toBe(false);
      expect(evidence.scope.invlpgExecutedAtRuntime).toBe(false);
    }

    expect(
      evidence.truthBoundary.physicalHardwareVerified
    ).toBe(false);
    expect(evidence.truthBoundary.secureBootVerified).toBe(false);
    expect(
      evidence.truthBoundary.generalPurposeOperatingSystemComplete
    ).toBe(false);
  });

  test('places System Builder and Gardens above the boot boundary', () => {
    const integration = readJson(
      'runtime/gardens-and-trees/v2/' +
        'sheikha-sovereign-bare-metal-system-builder-integration-v2.json'
    );
    const program = readJson(
      'runtime/bare-metal/v2/' +
        'sheikha-sovereign-bare-metal-os-v2-program.json'
    );

    expect(integration.integrationReady).toBe(true);
    expect(
      integration.criticalBootBoundary.aiInsideBootCriticalPath
    ).toBe(false);
    expect(
      integration.criticalBootBoundary.systemBuilderInsideBootCriticalPath
    ).toBe(false);
    expect(
      integration.criticalBootBoundary.jannatGardensInsideBootCriticalPath
    ).toBe(false);
    expect(integration.governance.automatedFatwa).toBe(false);
    expect(program.claimComplete).toBe(false);
    expect(
      Object.values(program.completionGate).every(
        (value) => value === false
      )
    ).toBe(true);
  });
});
