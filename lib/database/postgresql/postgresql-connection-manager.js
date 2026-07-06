const { Pool } = require('pg');

let pool;

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function isEnabled() {
  return bool(process.env.POSTGRES_ENABLED, false);
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || process.env.PGHOST || '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT || process.env.PGPORT || 5432),
      database:
        process.env.POSTGRES_DATABASE ||
        process.env.PGDATABASE ||
        process.env.POSTGRES_DB ||
        'sheikha_runtime',
      user: process.env.POSTGRES_USER || process.env.PGUSER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || '',
      ssl: bool(process.env.POSTGRES_SSL, false)
    });
  }
  return pool;
}

async function health() {
  const startedAt = Date.now();

  if (!isEnabled()) {
    return {
      success: false,
      status: 'disabled',
      error: 'POSTGRES_DISABLED',
      latencyMs: Date.now() - startedAt
    };
  }

  try {
    const result = await getPool().query('SELECT 1 AS ok');
    return {
      success: true,
      status: 'connected',
      latencyMs: Date.now() - startedAt,
      result: result.rows[0]
    };
  } catch (error) {
    return {
      success: false,
      status: 'unavailable',
      error: error.message,
      latencyMs: Date.now() - startedAt
    };
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, health, isEnabled, closePool };
