'use strict';

function enforce(decision, action) {
  if (!decision || decision.decision !== 'ALLOW') {
    return { enforced: true, executed: false, reason: decision?.reason || 'DENIED' };
  }
  if (typeof action !== 'function') return { enforced: true, executed: false, reason: 'NO_ACTION' };
  return { enforced: true, executed: true, result: action() };
}

module.exports = { enforce };
