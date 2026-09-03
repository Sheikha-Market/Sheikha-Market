'use strict';

function authorize({ action, objectId, scope = [], singleUse = false, expiresAt = null, approvedBy = null } = {}) {
  if (!action || !objectId || !approvedBy) throw new Error('AUTHORIZATION_FIELDS_REQUIRED');
  return Object.freeze({
    action,
    objectId,
    scope: Object.freeze([...scope]),
    singleUse: Boolean(singleUse),
    expiresAt,
    approvedBy,
    issuedAt: new Date().toISOString(),
    consumed: false,
  });
}

function canUse(auth, now = Date.now()) {
  if (!auth || auth.consumed) return false;
  if (auth.expiresAt && now >= Date.parse(auth.expiresAt)) return false;
  return true;
}

module.exports = { authorize, canUse };
