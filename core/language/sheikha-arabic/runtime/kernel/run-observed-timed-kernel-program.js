'use strict';

const {
  runTimedScheduledArabicKernelProgram
} = require('./run-timed-scheduled-kernel-program');

const {
  createArabicEventBus,
  emitArabicRuntimeEvent
} = require('../events/arabic-runtime-event-bus');

const {
  createArabicRuntimeObserver,
  observeArabicRuntime
} = require('../observer/arabic-runtime-observer');

function runObservedTimedArabicKernelProgram(input) {
  let events = createArabicEventBus();
  let observer = createArabicRuntimeObserver();

  const result = runTimedScheduledArabicKernelProgram(input);

  events = emitArabicRuntimeEvent(events, {
    type: 'TIMED_KERNEL_EXECUTED',
    payload: {
      status: result.status,
      duration: result.duration
    }
  });

  observer = observeArabicRuntime({
    observer,
    kernel: result.result?.execution?.kernel,
    scheduler: result.result?.scheduler,
    events
  });

  return {
    runtime: 'SHEIKHA_OBSERVED_TIMED_ARABIC_KERNEL_RUNTIME',
    status: result.status,
    events,
    observer,
    result
  };
}

module.exports = { runObservedTimedArabicKernelProgram };
