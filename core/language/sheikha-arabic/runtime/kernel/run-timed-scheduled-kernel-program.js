'use strict';

const {
  createArabicRuntimeClock,
  tickArabicRuntimeClock,
  measureArabicDuration
} = require('../clock/arabic-runtime-clock');

const {
  runScheduledArabicKernelProgram
} = require('./run-scheduled-kernel-program');

function runTimedScheduledArabicKernelProgram(input) {
  let clock = createArabicRuntimeClock();
  const start = Date.now();

  clock = tickArabicRuntimeClock(clock, 'scheduled_kernel_start');

  const result = runScheduledArabicKernelProgram(input);

  clock = tickArabicRuntimeClock(clock, 'scheduled_kernel_end');

  const end = Date.now();

  return {
    runtime: 'SHEIKHA_TIMED_SCHEDULED_ARABIC_KERNEL_RUNTIME',
    status: result.status,
    clock,
    duration: measureArabicDuration(start, end),
    result
  };
}

module.exports = { runTimedScheduledArabicKernelProgram };
