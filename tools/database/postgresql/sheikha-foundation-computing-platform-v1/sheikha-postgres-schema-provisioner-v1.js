'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');

const SYSTEM = 'SHEIKHA_POSTGRES_SCHEMA_PROVISIONER_V1';
const LOCK_KEY = 'SHEIKHA_FOUNDATION_SCHEMA_V1';
const BOOTSTRAP_MIGRATION_ID = '000_sheikha_schema_migrations_v1';

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadMigration({ id, path, appliedBy, evidenceRef }) {
  if (!id || !path || !appliedBy || !evidenceRef) {
    throw new Error('MIGRATION_DESCRIPTOR_FIELDS_REQUIRED');
  }
  const sql = fs.readFileSync(path, 'utf8');
  return Object.freeze({
    id,
    path,
    sql,
    checksum: sha256(sql),
    appliedBy,
    evidenceRef,
  });
}

function validateMigrationPlan(migrations) {
  if (!Array.isArray(migrations) || migrations.length === 0) {
    throw new Error('MIGRATION_PLAN_REQUIRED');
  }

  const ids = new Set();
  for (const migration of migrations) {
    if (!migration || !migration.id || !migration.checksum || !migration.sql) {
      throw new Error('INVALID_MIGRATION_DESCRIPTOR');
    }
    if (ids.has(migration.id)) throw new Error('DUPLICATE_MIGRATION_ID');
    ids.add(migration.id);
  }

  if (migrations[0].id !== BOOTSTRAP_MIGRATION_ID) {
    throw new Error('BOOTSTRAP_MIGRATION_MUST_BE_FIRST');
  }

  return Object.freeze([...migrations]);
}

async function provisionSchema({
  client,
  operatorAuthorized,
  migrations = [],
} = {}) {
  if (operatorAuthorized !== true) {
    return Object.freeze({ ok: false, applied: false, reason: 'OPERATOR_AUTHORIZATION_REQUIRED' });
  }
  if (!client || typeof client.query !== 'function') {
    return Object.freeze({ ok: false, applied: false, reason: 'POSTGRES_CLIENT_REQUIRED' });
  }

  let migrationPlan;
  try {
    migrationPlan = validateMigrationPlan(migrations);
  } catch (error) {
    return Object.freeze({
      ok: false,
      applied: false,
      reason: error && error.message ? error.message : 'INVALID_MIGRATION_PLAN',
    });
  }

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [LOCK_KEY]);

    // Probe the PostgreSQL catalog before querying the ledger itself. On a
    // pristine database the idempotent bootstrap creates it under the same
    // transaction and advisory lock. On later runs the stored checksum is
    // checked before any migration SQL is executed.
    const ledgerProbe = await client.query(
      'SELECT to_regclass($1) AS ledger',
      ['sheikha_foundation.schema_migrations'],
    );
    const ledgerProbeRows = Array.isArray(ledgerProbe && ledgerProbe.rows)
      ? ledgerProbe.rows
      : [];
    const ledgerExists = ledgerProbeRows.length === 1 && Boolean(ledgerProbeRows[0].ledger);
    const bootstrappedNow = !ledgerExists;
    if (bootstrappedNow) await client.query(migrationPlan[0].sql);

    for (const migration of migrationPlan) {
      const existing = await client.query(
        'SELECT checksum_sha256 FROM sheikha_foundation.schema_migrations WHERE migration_id = $1',
        [migration.id],
      );
      const rows = Array.isArray(existing && existing.rows) ? existing.rows : [];

      if (rows.length > 1) {
        throw new Error('MIGRATION_LEDGER_CONFLICT');
      }
      if (rows.length === 1) {
        if (rows[0].checksum_sha256 !== migration.checksum) {
          throw new Error('MIGRATION_CHECKSUM_CONFLICT');
        }
        continue;
      }

      if (!(bootstrappedNow && migration.id === BOOTSTRAP_MIGRATION_ID)) {
        await client.query(migration.sql);
      }
      await client.query(
        [
          'INSERT INTO sheikha_foundation.schema_migrations',
          '(migration_id, checksum_sha256, applied_by, evidence_ref)',
          'VALUES ($1, $2, $3, $4)',
        ].join(' '),
        [migration.id, migration.checksum, migration.appliedBy, migration.evidenceRef],
      );
    }

    await client.query('COMMIT');
    return Object.freeze({
      ok: true,
      applied: true,
      runtimeDdl: false,
      startupMigration: false,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    return Object.freeze({
      ok: false,
      applied: false,
      reason: error && error.message ? error.message : 'PROVISIONING_FAILED',
    });
  }
}

module.exports = {
  SYSTEM,
  LOCK_KEY,
  BOOTSTRAP_MIGRATION_ID,
  sha256,
  loadMigration,
  validateMigrationPlan,
  provisionSchema,
};
