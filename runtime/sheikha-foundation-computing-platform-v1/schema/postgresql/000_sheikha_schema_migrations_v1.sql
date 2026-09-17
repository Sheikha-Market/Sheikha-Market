-- SHEIKHA_FOUNDATION_SCHEMA_MIGRATIONS_V1
-- Operator-applied only. Runtime/startup DDL is forbidden.

CREATE SCHEMA IF NOT EXISTS sheikha_foundation;

CREATE TABLE IF NOT EXISTS sheikha_foundation.schema_migrations (
  migration_id text PRIMARY KEY,
  checksum_sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by text NOT NULL,
  evidence_ref text NOT NULL,
  CHECK (length(btrim(migration_id)) > 0),
  CHECK (length(btrim(checksum_sha256)) > 0),
  CHECK (length(btrim(applied_by)) > 0),
  CHECK (length(btrim(evidence_ref)) > 0)
);

COMMENT ON TABLE sheikha_foundation.schema_migrations IS
  'Immutable operator-applied migration ledger for Sheikha Foundation V1.';
