'use strict';

const lifecycleStates = Object.freeze([
  'DRAFT',
  'PENDING_REVIEW',
  'VALIDATED',
  'APPROVED',
  'PUBLISHED',
  'DEPRECATED',
  'ARCHIVED'
]);

const allowedTransitions = Object.freeze({
  DRAFT: ['PENDING_REVIEW', 'ARCHIVED'],
  PENDING_REVIEW: ['VALIDATED', 'DRAFT', 'ARCHIVED'],
  VALIDATED: ['APPROVED', 'PENDING_REVIEW', 'ARCHIVED'],
  APPROVED: ['PUBLISHED', 'DEPRECATED', 'ARCHIVED'],
  PUBLISHED: ['DEPRECATED', 'ARCHIVED'],
  DEPRECATED: ['ARCHIVED'],
  ARCHIVED: []
});

function evaluateLifecycleTransition(currentState = 'DRAFT', nextState = 'PENDING_REVIEW') {
  const current = lifecycleStates.includes(currentState) ? currentState : 'DRAFT';
  const next = lifecycleStates.includes(nextState) ? nextState : 'DRAFT';
  const allowed = allowedTransitions[current] || [];

  return {
    system: 'SHEIKHA_PRODUCT_LIFECYCLE_ENGINE_V1',
    status: allowed.includes(next) ? 'ALLOWED' : 'BLOCKED',
    allowed: allowed.includes(next),
    currentState: current,
    nextState: next,
    allowedTransitions: allowed
  };
}

function applyLifecycleTransition(record = {}, nextState = 'PENDING_REVIEW') {
  const currentState = record.status || record.lifecycle?.status || 'DRAFT';
  const evaluation = evaluateLifecycleTransition(currentState, nextState);

  return {
    evaluation,
    record: evaluation.allowed
      ? {
          ...record,
          status: nextState,
          updatedAt: new Date().toISOString(),
          lifecycle: {
            ...(record.lifecycle || {}),
            status: nextState,
            transitionedAt: new Date().toISOString()
          }
        }
      : record
  };
}

module.exports = {
  lifecycleStates,
  allowedTransitions,
  evaluateLifecycleTransition,
  applyLifecycleTransition
};
