'use strict';

function createArabicScheduler() {

  return {
    queue: [],
    active: null,
    completed: [],
    deterministic: true
  };
}

function enqueueArabicTask(
  scheduler,
  task
) {

  return {
    ...scheduler,
    queue: [
      ...scheduler.queue,
      {
        priority: task.priority || 0,
        ...task
      }
    ].sort(
      (a, b) =>
        b.priority - a.priority
    )
  };
}

function executeNextArabicTask(
  scheduler
) {

  if (
    scheduler.queue.length === 0
  ) {
    return {
      ...scheduler,
      active: null
    };
  }

  const [next, ...rest] =
    scheduler.queue;

  return {
    ...scheduler,
    active: next,
    queue: rest,
    completed: [
      ...scheduler.completed,
      {
        ...next,
        executed: true
      }
    ]
  };
}

module.exports = {
  createArabicScheduler,
  enqueueArabicTask,
  executeNextArabicTask
};
