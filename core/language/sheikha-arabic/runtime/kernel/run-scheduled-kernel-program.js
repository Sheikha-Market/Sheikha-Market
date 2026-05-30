'use strict';

const {
  createArabicScheduler,
  enqueueArabicTask,
  executeNextArabicTask
} = require('../scheduler/arabic-deterministic-scheduler');

const {
  runArabicKernelProgram
} = require('./run-kernel-program');

function runScheduledArabicKernelProgram(input) {
  let scheduler = createArabicScheduler();

  scheduler = enqueueArabicTask(
    scheduler,
    {
      id: 'arabic_kernel_program',
      priority: 100,
      input
    }
  );

  scheduler = executeNextArabicTask(scheduler);

  const execution =
    scheduler.active
      ? runArabicKernelProgram(scheduler.active.input)
      : null;

  return {
    runtime: 'SHEIKHA_SCHEDULED_ARABIC_KERNEL_RUNTIME',
    status: execution?.status || 'NO_SCHEDULED_EXECUTION',
    scheduler,
    execution
  };
}

module.exports = { runScheduledArabicKernelProgram };
