-- SHEIKHA_FOUNDATION_AUTHORIZATION_CLAIMS_V1
-- Depends on 000_sheikha_schema_migrations_v1.sql.

CREATE TABLE IF NOT EXISTS sheikha_foundation.authorization_claims (
  authorization_id text PRIMARY KEY,
  object_id text NOT NULL,
  action text NOT NULL,
  scope_canonical jsonb NOT NULL,
  single_use boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  approved_by text NOT NULL,
  issued_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumer_evidence_ref text,
  CHECK (length(btrim(authorization_id)) > 0),
  CHECK (length(btrim(object_id)) > 0),
  CHECK (length(btrim(action)) > 0),
  CHECK (length(btrim(approved_by)) > 0),
  CHECK (jsonb_typeof(scope_canonical) = 'array')
);

CREATE INDEX IF NOT EXISTS authorization_claims_unconsumed_idx
  ON sheikha_foundation.authorization_claims (authorization_id)
  WHERE consumed_at IS NULL;

COMMENT ON TABLE sheikha_foundation.authorization_claims IS
  'Persistent authorization claims; single-use consumption must be atomic and replay-safe.';
