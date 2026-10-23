'use strict';

function parsePropertyValue(text, property) {
  const pattern = new RegExp(
    `^\\s*${property}\\s*:\\s*(?:(0x[0-9a-f]+|[0-9]+)\\s*$|(?:\\r?\\n)\\s*raw\\s*:\\s*(0x[0-9a-f]+|[0-9]+))`,
    'im',
  );
  const match = String(text || '').match(pattern);
  if (!match) return null;
  const value = match[1] || match[2];
  return Number.parseInt(value, value.toLowerCase().startsWith('0x') ? 16 : 10);
}

function parseHandles(text) {
  const values = String(text || '').match(/0x[0-9a-f]{8}/gi) || [];
  return [...new Set(values.map((value) => value.toLowerCase()))].sort();
}

function parseClockInfo(text) {
  const value = (name) => {
    const match = String(text || '').match(new RegExp(`^\\s*${name}:\\s*([0-9]+)\\s*$`, 'im'));
    return match ? Number.parseInt(match[1], 10) : null;
  };
  return {
    clock: value('clock'),
    resetCount: value('reset_count'),
    restartCount: value('restart_count'),
    safe: /^\s*safe:\s*yes\s*$/im.test(String(text || '')),
  };
}

function analyzeTpmInventory({ clockInfo, persistent, transient, loadedSessions, savedSessions }) {
  const clock = parseClockInfo(clockInfo);
  const inventory = {
    clock: clock.clock,
    resetCount: clock.resetCount,
    restartCount: clock.restartCount,
    clockSafe: clock.safe,
    persistentHandles: parseHandles(persistent),
    transientHandles: parseHandles(transient),
    loadedSessionHandles: parseHandles(loadedSessions),
    savedSessionHandles: parseHandles(savedSessions),
  };
  const countersObserved = inventory.resetCount !== null && inventory.restartCount !== null;
  return {
    inventory,
    countersObserved,
    originalSavedContextsCanBeRecoveredFromInventory: false,
    transientObjectsCurrentlyPresent: inventory.transientHandles.length > 0,
    nextStage: inventory.persistentHandles.length > 0
      ? 'READ_ONLY_MATCH_PERSISTENT_HANDLES_TO_BOUND_AK_EK_IDENTITIES'
      : 'DEVICE_BOUND_EK_AK_RECREATION_REQUIRES_NEW_MUTATION_AUTHORIZATION',
  };
}

module.exports = { parsePropertyValue, parseHandles, parseClockInfo, analyzeTpmInventory };
