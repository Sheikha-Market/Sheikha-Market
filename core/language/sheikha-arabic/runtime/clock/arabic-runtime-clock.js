'use strict';

function createArabicRuntimeClock() {

  return {
    startedAt: Date.now(),
    cycles: 0,
    ticks: [],
    deterministic: true
  };
}

function tickArabicRuntimeClock(
  clock,
  label = 'runtime_cycle'
) {

  const tick = {
    cycle: clock.cycles + 1,
    label,
    timestamp: Date.now()
  };

  return {
    ...clock,
    cycles: clock.cycles + 1,
    ticks: [
      ...clock.ticks,
      tick
    ]
  };
}

function measureArabicDuration(
  start,
  end
) {

  return {
    durationMs:
      Math.max(0, end - start),
    deterministic: true
  };
}

module.exports = {
  createArabicRuntimeClock,
  tickArabicRuntimeClock,
  measureArabicDuration
};
