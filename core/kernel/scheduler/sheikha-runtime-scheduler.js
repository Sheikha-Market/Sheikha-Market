'use strict';

const TASKS = [];

function register(task) {
  TASKS.push({
    ...task,
    registeredAt: new Date().toISOString()
  });

  return {
    success: true,
    tasks: TASKS.length
  };
}

function status() {
  return {
    success: true,
    scheduler: 'SHEIKHA_RUNTIME_SCHEDULER',
    deterministic: true,
    tasks: TASKS
  };
}

module.exports = {
  register,
  status
};
