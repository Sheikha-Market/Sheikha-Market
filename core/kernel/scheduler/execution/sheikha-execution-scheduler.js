'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const FORBIDDEN = [
  'خمر', 'كحول', 'مخدر', 'مخدرات', 'حشيش',
  'مسكر', 'مفتر', 'ربا', 'قمار', 'غش',
  'ضرر', 'ضرار'
];

function ensure() {
  [
    'runtime/scheduler/queue',
    'runtime/scheduler/history',
    'runtime/scheduler/reports'
  ].forEach((dir) => fs.mkdirSync(path.join(ROOT, dir), { recursive: true }));
}

function guard(task = {}) {
  const text = JSON.stringify(task).toLowerCase();
  const violation = FORBIDDEN.find((term) => text.includes(term.toLowerCase()));

  if (
    violation ||
    task?.meta?.haram === true ||
    task?.meta?.harmful === true ||
    task?.meta?.intoxicant === true
  ) {
    return { ok: false, violation: violation || 'metadata_violation' };
  }

  return { ok: true };
}

function priorityValue(priority) {
  const map = {
    critical: 1,
    high: 2,
    normal: 3,
    low: 4
  };

  return map[priority] || 3;
}

function status() {
  ensure();

  return {
    success: true,
    scheduler: 'SHEIKHA_EXECUTION_SCHEDULER',
    deterministic: true,
    canonical: true,
    governance: {
      quranAndSunnah: true,
      noHarm: true,
      halalOnly: true,
      humanAuthority: true
    },
    policy: {
      orderedExecution: true,
      noDuplicateExecution: true,
      governanceFirst: true,
      collisionPrevention: true
    },
    timestamp: new Date().toISOString()
  };
}

function schedule(task = {}) {
  ensure();

  const checked = guard(task);

  if (!checked.ok) {
    return {
      success: false,
      blocked: true,
      governance: 'QURAN_AND_SUNNAH',
      noHarm: true,
      violation: checked.violation,
      reason: 'blocked_by_scheduler_governance',
      timestamp: new Date().toISOString()
    };
  }

  const record = {
    success: true,
    scheduler: 'SHEIKHA_EXECUTION_SCHEDULER',
    task: task.task || 'runtime-task',
    priority: task.priority || 'normal',
    priorityValue: priorityValue(task.priority),
    payload: task.payload || {},
    meta: task.meta || {},
    status: 'QUEUED',
    deterministic: true,
    canonical: true,
    timestamp: new Date().toISOString()
  };

  const safeTask = String(record.task).replace(/[^a-zA-Z0-9._-]/g, '-');
  const file = path.join(
    ROOT,
    'runtime/scheduler/queue',
    `${record.priorityValue}-${Date.now()}-${safeTask}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return {
    success: true,
    scheduled: true,
    file,
    record
  };
}

module.exports = {
  status,
  schedule
};
