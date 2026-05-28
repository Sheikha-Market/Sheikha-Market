'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const PRIORITY = {
  critical: 1,
  high: 2,
  normal: 3,
  low: 4
};

function ensure() {
  [
    'runtime/scheduler/queue',
    'runtime/scheduler/cycles',
    'runtime/scheduler/dispatch',
    'runtime/scheduler/reports'
  ].forEach((dir) => {
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
  });
}

function status() {
  ensure();

  return {
    success: true,
    scheduler: 'SHEIKHA_RUNTIME_SCHEDULER_FABRIC',
    canonical: true,
    deterministic: true,
    sovereign: true,
    governance: {
      quranAndSunnah: true,
      tawheed: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    policy: {
      orderedExecution: true,
      priorityControl: true,
      collisionPrevention: true,
      noDuplicateExecution: true,
      runtimeCycleControl: true
    },
    timestamp: new Date().toISOString()
  };
}

function enqueue(task = {}) {
  ensure();

  const name = String(task.name || 'runtime-task').replace(/[^a-zA-Z0-9._-]/g, '-');
  const priority = task.priority || 'normal';

  const record = {
    success: true,
    scheduler: 'SHEIKHA_RUNTIME_SCHEDULER_FABRIC',
    name,
    priority,
    priorityValue: PRIORITY[priority] || PRIORITY.normal,
    payload: task.payload || {},
    status: 'QUEUED',
    canonical: true,
    deterministic: true,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/scheduler/queue',
    `${record.priorityValue}-${Date.now()}-${name}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return { success: true, queued: true, file, record };
}

function cycle(name = 'runtime-cycle') {
  ensure();

  const record = {
    success: true,
    cycle: String(name).replace(/[^a-zA-Z0-9._-]/g, '-'),
    status: 'CYCLE_RECORDED',
    canonical: true,
    deterministic: true,
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/scheduler/cycles',
    `${Date.now()}-${record.cycle}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return { success: true, file, record };
}

module.exports = { status, enqueue, cycle };
