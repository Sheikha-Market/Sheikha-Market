'use strict';

const {
  parsePropertyValue,
  parseHandles,
  parseClockInfo,
  analyzeTpmInventory,
} = require('../core/governance/sheikha-tpm-read-only-inventory-v2');

describe('Sheikha TPM read-only inventory V2', () => {
  test('parses counters and deduplicates handles', () => {
    const properties = 'TPM2_PT_RESET_COUNT:\n  raw: 0x12\nTPM2_PT_RESTART_COUNT:\n  raw: 7\n';
    expect(parsePropertyValue(properties, 'TPM2_PT_RESET_COUNT')).toBe(18);
    expect(parsePropertyValue(properties, 'TPM2_PT_RESTART_COUNT')).toBe(7);
    expect(parseHandles('- 0x81000001\n- 0x81000001\n- 0x81000002')).toEqual(['0x81000001', '0x81000002']);
  });

  test('selects recreation when no persistent identities remain', () => {
    const result = analyzeTpmInventory({
      clockInfo: 'clock_info:\n  clock: 20\n  reset_count: 18\n  restart_count: 7\n  safe: yes',
      persistent: '',
      transient: '- 0x80000000',
      loadedSessions: '',
      savedSessions: '',
    });
    expect(result.inventory).toMatchObject({ resetCount: 18, restartCount: 7 });
    expect(result.transientObjectsCurrentlyPresent).toBe(true);
    expect(result.nextStage).toBe('DEVICE_BOUND_EK_AK_RECREATION_REQUIRES_NEW_MUTATION_AUTHORIZATION');
  });

  test('parses TPMS_CLOCK_INFO output', () => {
    expect(parseClockInfo('clock_info:\n  clock: 17199887529\n  reset_count: 1155440497\n  restart_count: 0\n  safe: yes')).toEqual({
      clock: 17199887529,
      resetCount: 1155440497,
      restartCount: 0,
      safe: true,
    });
  });
});
