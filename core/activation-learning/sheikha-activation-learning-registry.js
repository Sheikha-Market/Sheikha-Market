'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const storePath = path.join(process.cwd(), 'data', 'activation-learning', 'activation-learning-registry.json');

function ensureStore() {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ records: [], lessons: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  return store;
}

function hashPayload(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function registerActivationRecord(input = {}) {
  const store = readStore();

  const record = {
    id: `activation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    system: 'SHEIKHA_ACTIVATION_LEARNING_REGISTRY_V1',
    script: input.script || 'unknown',
    stage: input.stage || 'UNCLASSIFIED',
    status: input.status || 'UNKNOWN',
    command: input.command || null,
    logic: input.logic || [],
    result: input.result || {},
    errors: input.errors || [],
    improvements: input.improvements || [],
    governance: {
      noHarm: true,
      noSecretsStored: true,
      humanReviewRequired: input.humanReviewRequired !== false
    },
    hash: hashPayload(input),
    createdAt: new Date().toISOString()
  };

  store.records.push(record);

  if (record.status !== 'PASSED') {
    store.lessons.push({
      id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sourceRecordId: record.id,
      lessonType: 'FAILURE_PATTERN',
      recommendation: 'Review failing stage, isolate root cause, add a guard before production.',
      createdAt: new Date().toISOString()
    });
  }

  return writeStore(store), record;
}

function evaluateActivationLearning() {
  const store = readStore();
  const passed = store.records.filter((r) => r.status === 'PASSED').length;
  const failed = store.records.filter((r) => r.status !== 'PASSED').length;

  return {
    system: 'SHEIKHA_ACTIVATION_LEARNING_EVALUATOR_V1',
    status: failed === 0 ? 'EXCELLENT' : 'REVIEW_REQUIRED',
    records: store.records.length,
    passed,
    failed,
    lessons: store.lessons.length,
    learningMode: 'AUDIT_BASED_MACHINE_IMPROVEMENT',
    note: 'Operational improvement only; no human-like consciousness or unseen future prediction.'
  };
}

module.exports = {
  registerActivationRecord,
  evaluateActivationLearning
};
