'use strict';

const fs = require('node:fs');
const {evaluate, generate, BOARD, RECOVERY, OUTPUT} = require('../bare-metal/build/sheikha-named-board-package-v1');

describe('Sheikha named-board package V1', () => {
  test('binds the seed only to the exact MSI platform', () => {
    const board = JSON.parse(fs.readFileSync(BOARD, 'utf8'));
    expect(board.binding.model).toBe('Pulse 16 AI C1VFKG');
    expect(board.binding.biosVersion).toBe('E15P3IMS.10D');
    expect(board.claimBoundary.appliesToOtherMsiModels).toBe(false);
  });

  test('revalidates all physical evidence records and the platform binding', () => {
    const report = evaluate();
    expect(report.bindingMatches).toBe(true);
    expect(report.evidenceRecordsValid).toBe(true);
    expect(report.seedVerified).toBe(true);
  });

  test('keeps firmware writes and production release denied', () => {
    const board = JSON.parse(fs.readFileSync(BOARD, 'utf8'));
    const recovery = JSON.parse(fs.readFileSync(RECOVERY, 'utf8'));
    const report = evaluate();
    expect(board.writePolicy.physicalFirmwareWriteAuthorized).toBe(false);
    expect(recovery.defaultAuthorization).toBe('DENY');
    expect(report.implementation.completedBsp).toBe(false);
    expect(report.recovery.physicalDrillCompleted).toBe(false);
    expect(report.recovery.productionReleasePermitted).toBe(false);
  });

  test('writes a content-addressed board qualification report', () => {
    const report = generate();
    expect(fs.existsSync(OUTPUT)).toBe(true);
    expect(report.reportSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
