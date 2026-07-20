'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(
      path.join(root, relativePath),
      'utf8'
    )
  );
}

describe('Sheikha V2 x86_64 paging runtime Phase 2A', () => {
  test('ships the four-level paging runtime', () => {
    for (const relativePath of [
      'bare-metal/kernel/v2/include/sheikha_x86_64_paging.h',
      'bare-metal/kernel/v2/memory/sheikha_x86_64_paging.c',
      'bare-metal/kernel/v2/arch/x86_64/sheikha_cr3.S',
      'bare-metal/boot/uefi/sheikha_v2_paging_boot_adapter.c',
      'scripts/bare-metal/v2/build-x86-64-paging-runtime-phase2a.sh',
    ]) {
      expect(
        fs.statSync(
          path.join(root, relativePath)
        ).size
      ).toBeGreaterThan(0);
    }
  });

  test('builds builder, CR3 and INVLPG interfaces', () => {
    const output = execFileSync(
      'bash',
      [
        path.join(
          root,
          'scripts/bare-metal/v2/' +
            'build-x86-64-paging-runtime-phase2a.sh'
        ),
      ],
      {
        cwd: root,
        encoding: 'utf8',
      }
    );

    expect(output).toContain(
      'SHEIKHA_V2_X86_64_PAGING_RUNTIME_PHASE2A_BUILD_OK'
    );

    expect(output).toContain(
      'FOUR_LEVEL_PAGE_TABLE_BUILDER_VERIFIED=true'
    );

    expect(output).toContain(
      'CR3_INTERFACE_COMPILED=true'
    );

    expect(output).toContain(
      'INVLPG_INTERFACE_COMPILED=true'
    );

    expect(output).toContain(
      'PRIVILEGED_INSTRUCTIONS_EXECUTED_IN_HOST_TESTS=false'
    );
  });

  test('records Phase 2A without privileged false claims', () => {
    const evidence = readJson(
      'runtime/bare-metal/v2/evidence/' +
        'sheikha-v2-x86-64-paging-runtime-phase2a.json'
    );

    expect(evidence.status).toBe(
      'PHASE2A_VERIFIED'
    );

    expect(evidence.verified).toBe(true);

    expect(
      evidence.truthBoundary.cr3LoadedAtRuntime
    ).toBe(false);

    expect(
      evidence.truthBoundary.invlpgExecutedAtRuntime
    ).toBe(false);

    expect(
      evidence.truthBoundary.uefiBootPathWired
    ).toBe(false);

    expect(
      evidence.truthBoundary
        .generalPurposeOperatingSystemComplete
    ).toBe(false);
  });

  test('preserves all completion gates', () => {
    const program = readJson(
      'runtime/bare-metal/v2/' +
        'sheikha-sovereign-bare-metal-os-v2-program.json'
    );

    expect(
      program.verifiedPhases
        .X86_64_PAGING_RUNTIME_PHASE2A
    ).toBe(true);

    expect(program.claimComplete).toBe(false);

    expect(
      Object.values(program.completionGate)
        .every((value) => value === false)
    ).toBe(true);

    expect(
      Object.values(program.completionFlags)
        .every((value) => value === false)
    ).toBe(true);
  });
});
