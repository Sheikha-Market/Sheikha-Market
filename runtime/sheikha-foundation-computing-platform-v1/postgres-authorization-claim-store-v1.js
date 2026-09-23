'use strict';

const SYSTEM = 'SHEIKHA_POSTGRES_AUTHORIZATION_CLAIM_STORE_V1';

const CONSUME_SINGLE_USE_SQL = [
  'UPDATE sheikha_foundation.authorization_claims',
  'SET consumed_at = $5::timestamptz, consumer_evidence_ref = $6',
  'WHERE authorization_id = $1',
  '  AND object_id = $2',
  '  AND action = $3',
  '  AND scope_canonical = $4::jsonb',
  '  AND single_use = TRUE',
  '  AND consumed_at IS NULL',
  '  AND (expires_at IS NULL OR expires_at > $5::timestamptz)',
  'RETURNING authorization_id, object_id, action, scope_canonical, consumed_at'
].join('\n');

function isoNow(now) {
  const date = new Date(now);
  if (!Number.isFinite(date.getTime())) {
    throw new TypeError('INVALID_CLAIM_CONSUMPTION_TIME');
  }
  return date.toISOString();
}

function buildPostgresAuthorizationClaimStore(client) {
  if (!client || typeof client.query !== 'function') {
    throw new TypeError('POSTGRES_QUERY_CLIENT_REQUIRED');
  }

  return Object.freeze({
    async verifyAndConsume({
      authorizationId,
      expectedObjectId,
      expectedAction,
      expectedScope = [],
      evidenceRef = null,
      now = Date.now(),
    } = {}) {
      const consumedAt = isoNow(now);
      try {
        const result = await client.query(CONSUME_SINGLE_USE_SQL, [
          authorizationId,
          expectedObjectId,
          expectedAction,
          JSON.stringify(expectedScope),
          consumedAt,
          evidenceRef,
        ]);

        const rows = Array.isArray(result && result.rows) ? result.rows : [];
        if (rows.length !== 1) {
          return Object.freeze({
            ok: false,
            consumed: false,
            reason: 'CLAIM_NOT_CONSUMED_OR_ALREADY_USED',
          });
        }

        return Object.freeze({
          ok: true,
          consumed: true,
          reason: 'ATOMIC_CLAIM_CONSUMED',
          authorizationId: rows[0].authorization_id,
        });
      } catch {
        return Object.freeze({
          ok: false,
          consumed: false,
          reason: 'CLAIM_STORE_UNAVAILABLE_OR_REJECTED',
        });
      }
    },
  });
}

module.exports = {
  SYSTEM,
  CONSUME_SINGLE_USE_SQL,
  buildPostgresAuthorizationClaimStore,
};
