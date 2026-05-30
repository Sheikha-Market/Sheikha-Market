'use strict';

function createArabicRuntimeObserver() {

  return {
    snapshots: [],
    deterministic: true
  };
}

function observeArabicRuntime({
  observer,
  kernel,
  scheduler,
  events
} = {}) {

  const snapshot = {
    timestamp: Date.now(),

    kernelCycle:
      kernel?.cycle || 0,

    schedulerQueue:
      scheduler?.queue?.length || 0,

    schedulerCompleted:
      scheduler?.completed?.length || 0,

    totalEvents:
      events?.events?.length || 0,

    deterministic: true
  };

  return {
    ...observer,
    snapshots: [
      ...observer.snapshots,
      snapshot
    ]
  };
}

module.exports = {
  createArabicRuntimeObserver,
  observeArabicRuntime
};
