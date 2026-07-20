'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

describe('Sheikha V2 Memory and Paging Phase 1', () => {
  test('ships and builds the native phase', () => {
    for (const relativePath of [
      'bare-metal/kernel/v2/include/sheikha_v2_memory.h',
      'bare-metal/kernel/v2/memory/sheikha_frame_allocator.c',
      'bare-metal/kernel/v2/memory/sheikha_page_table_model.c',
      'bare-metal/kernel/v2/memory/sheikha_memory_phase1_test.c',
      'scripts/bare-metal/v2/build-memory-paging-phase1.sh',
    ]) {
      expect(fs.statSync(path.join(root, relativePath)).size).toBeGreaterThan(0);
    }
    const output = execFileSync('bash', [path.join(root, 'scripts/bare-metal/v2/build-memory-paging-phase1.sh')], { cwd: root, encoding: 'utf8' });
    expect(output).toContain('SHEIKHA_V2_MEMORY_PAGING_PHASE1_BUILD_OK');
    expect(output).toContain('FRAME_ALLOCATOR_VERIFIED=true');
    expect(output).toContain('PAGE_TABLE_MODEL_VERIFIED=true');
  });

  test('records Phase 1 and preserves truth boundaries', () => {
    const evidence = readJson('runtime/bare-metal/v2/evidence/sheikha-v2-memory-paging-phase1.json');
    const program = readJson('runtime/bare-metal/v2/sheikha-sovereign-bare-metal-os-v2-program.json');
    expect(evidence.status).toBe('PHASE1_VERIFIED');
    expect(evidence.verified).toBe(true);
    expect(evidence.truthBoundary.realX8664PageTablesInstalled).toBe(false);
    expect(program.verifiedPhases.MEMORY_AND_PAGING_PHASE1).toBe(true);
    expect(program.claimComplete).toBe(false);
    expect(Object.values(program.completionGate).every((value) => value === false)).toBe(true);
    expect(Object.values(program.completionFlags).every((value) => value === false)).toBe(true);
  });

  test('provides persistent project-state recorder', () => {
    expect(fs.statSync(path.join(root, 'tools/project-state/record-sheikha-project-state.py')).size).toBeGreaterThan(0);
    expect(fs.statSync(path.join(root, 'scripts/project-state/record-sheikha-project-state.sh')).size).toBeGreaterThan(0);
  });
});
